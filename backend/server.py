from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import math
import jwt
import uuid
import requests
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Any, Set
from datetime import datetime, timezone, timedelta

# Load env
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'rk-pooja-dev-secret')
JWT_ALGO = 'HS256'
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

# Object storage
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "rkpooja"
_storage_key: Optional[str] = None

def init_storage():
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_LLM_KEY:
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        logging.info("Object storage initialized")
        return _storage_key
    except Exception as e:
        logging.exception("Storage init failed: %s", e)
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage unavailable")
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    r.raise_for_status()
    return r.json()

def get_object(path: str):
    key = init_storage()
    if not key:
        raise HTTPException(500, "Storage unavailable")
    r = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

app = FastAPI(title="RK POOJA Super App API")
api = APIRouter(prefix="/api")

# ============================================================
# UTILITIES
# ============================================================
def now_iso():
    return datetime.now(timezone.utc).isoformat()

def new_id():
    return str(uuid.uuid4())

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    return 2 * R * math.asin(math.sqrt(a))

def create_token(payload: dict) -> str:
    payload = {**payload, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.replace("Bearer ", "").strip()
    data = decode_token(token)
    user = await db.users.find_one({"id": data.get("user_id")}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(roles: list):
    async def _check(user=Depends(get_current_user)):
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return _check

# ============================================================
# MODELS
# ============================================================
class RequestOTP(BaseModel):
    email: str
    role: Literal["customer", "driver", "admin", "fleet"] = "customer"
    name: Optional[str] = None

class VerifyOTP(BaseModel):
    email: str
    otp: str

class FareEstimateReq(BaseModel):
    service_type: str
    vehicle_category: Optional[str] = None
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float

class Location(BaseModel):
    lat: float
    lng: float
    address: Optional[str] = ""

class BookingCreate(BaseModel):
    service_type: str  # car, auto, bike, tempo, bus, porter, goods, airport, outstation
    vehicle_category: Optional[str] = None  # mini/sedan/suv/etc
    pickup: Location
    drop: Location
    scheduled_at: Optional[str] = None
    notes: Optional[str] = None
    payment_method: str = "wallet"  # wallet, cash, upi, card
    passenger_count: Optional[int] = 1
    package_details: Optional[Dict[str, Any]] = None

class BookingStatusUpdate(BaseModel):
    status: str  # accepted, arrived, started, completed, cancelled

class LocationUpdate(BaseModel):
    lat: float
    lng: float

class WalletTopup(BaseModel):
    amount: float

class ChatMessageReq(BaseModel):
    session_id: Optional[str] = None
    message: str

class VoiceBookingParse(BaseModel):
    transcript: str

class KYCUpdate(BaseModel):
    aadhaar: Optional[str] = None
    pan: Optional[str] = None
    driving_license: Optional[str] = None
    vehicle_rc: Optional[str] = None
    insurance: Optional[str] = None
    selfie_url: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None  # car, auto, bike, truck

class OnlineToggle(BaseModel):
    online: bool
    lat: Optional[float] = None
    lng: Optional[float] = None

class VehicleCreate(BaseModel):
    make: str
    model: str
    number: str
    type: str
    capacity: Optional[int] = None
    driver_email: Optional[str] = None

class PromoCreate(BaseModel):
    code: str
    discount_percent: float
    max_discount: float = 100.0
    active: bool = True

class RatingReq(BaseModel):
    rating: int
    review: Optional[str] = ""

class NotifyMark(BaseModel):
    id: str

class ReferralRedeem(BaseModel):
    code: str

# ============================================================
# SERVICE CATALOG & PRICING
# ============================================================
SERVICES = {
    "car": {
        "name": "Car Ride",
        "categories": {
            "mini":    {"name": "Mini",    "base": 50,  "per_km": 12, "per_min": 1.5, "capacity": 4},
            "sedan":   {"name": "Sedan",   "base": 70,  "per_km": 14, "per_min": 1.8, "capacity": 4},
            "suv":     {"name": "SUV",     "base": 100, "per_km": 18, "per_min": 2.0, "capacity": 6},
            "premium": {"name": "Premium", "base": 150, "per_km": 22, "per_min": 2.5, "capacity": 4},
            "luxury":  {"name": "Luxury",  "base": 250, "per_km": 30, "per_min": 3.0, "capacity": 4},
            "ev":      {"name": "Electric","base": 60,  "per_km": 13, "per_min": 1.5, "capacity": 4},
        },
    },
    "auto":   {"name": "Auto Rickshaw","categories": {"auto": {"name": "Auto", "base": 30, "per_km": 10, "per_min": 1.0, "capacity": 3}}},
    "bike":   {"name": "Bike",         "categories": {"bike": {"name": "Bike", "base": 20, "per_km": 6,  "per_min": 0.8, "capacity": 1}}},
    "tempo":  {"name": "Tempo Traveller","categories": {
        "9s":  {"name": "9 Seater",  "base": 800,  "per_km": 18, "per_min": 0, "capacity": 9},
        "12s": {"name": "12 Seater", "base": 1100, "per_km": 22, "per_min": 0, "capacity": 12},
        "17s": {"name": "17 Seater", "base": 1500, "per_km": 26, "per_min": 0, "capacity": 17},
        "20s": {"name": "20 Seater", "base": 1800, "per_km": 30, "per_min": 0, "capacity": 20},
        "26s": {"name": "26 Seater", "base": 2200, "per_km": 35, "per_min": 0, "capacity": 26},
    }},
    "bus": {"name": "Bus Booking", "categories": {
        "mini":     {"name": "Mini Bus",    "base": 2500, "per_km": 35, "per_min": 0, "capacity": 22},
        "ac":       {"name": "AC Bus",      "base": 3500, "per_km": 45, "per_min": 0, "capacity": 35},
        "sleeper":  {"name": "Sleeper Bus", "base": 4500, "per_km": 55, "per_min": 0, "capacity": 30},
        "volvo":    {"name": "Volvo",       "base": 5500, "per_km": 65, "per_min": 0, "capacity": 40},
        "luxury":   {"name": "Luxury Bus",  "base": 6500, "per_km": 75, "per_min": 0, "capacity": 30},
    }},
    "porter": {"name": "Porter / Delivery", "categories": {
        "bike":     {"name": "Bike Delivery", "base": 40,  "per_km": 8,  "per_min": 0, "capacity": 1},
        "tata_ace": {"name": "Tata Ace",      "base": 250, "per_km": 18, "per_min": 0, "capacity": 1},
        "mini_truck":{"name":"Mini Truck",    "base": 400, "per_km": 25, "per_min": 0, "capacity": 1},
    }},
    "goods": {"name": "Goods Transport", "categories": {
        "pickup":   {"name": "Pickup Truck", "base": 500,  "per_km": 28, "per_min": 0, "capacity": 1},
        "truck":    {"name": "Truck",        "base": 1200, "per_km": 45, "per_min": 0, "capacity": 1},
        "container":{"name": "Container",    "base": 2500, "per_km": 75, "per_min": 0, "capacity": 1},
        "heavy":    {"name": "Heavy Vehicle","base": 4000, "per_km": 95, "per_min": 0, "capacity": 1},
    }},
    "airport": {"name": "Airport Transfer", "categories": {
        "sedan":  {"name": "Sedan",  "base": 250, "per_km": 16, "per_min": 1.5, "capacity": 4},
        "suv":    {"name": "SUV",    "base": 400, "per_km": 22, "per_min": 2.0, "capacity": 6},
        "luxury": {"name": "Luxury", "base": 700, "per_km": 32, "per_min": 3.0, "capacity": 4},
    }},
    "outstation": {"name": "Outstation", "categories": {
        "sedan_oneway":  {"name": "Sedan One Way",  "base": 0, "per_km": 13, "per_min": 0, "capacity": 4},
        "sedan_round":   {"name": "Sedan Round",    "base": 300, "per_km": 11, "per_min": 0, "capacity": 4},
        "suv_oneway":    {"name": "SUV One Way",    "base": 0, "per_km": 18, "per_min": 0, "capacity": 6},
        "suv_round":     {"name": "SUV Round",      "base": 500, "per_km": 16, "per_min": 0, "capacity": 6},
    }},
}

def compute_fare(service_type: str, category: str, distance_km: float, eta_min: float = 0) -> Dict[str, Any]:
    svc = SERVICES.get(service_type)
    if not svc:
        raise HTTPException(400, f"Unknown service: {service_type}")
    cat_key = category or list(svc["categories"].keys())[0]
    cat = svc["categories"].get(cat_key)
    if not cat:
        raise HTTPException(400, f"Unknown category: {category}")
    base = cat["base"]
    dist_cost = distance_km * cat["per_km"]
    time_cost = eta_min * cat["per_min"]
    # surge: simple time-based
    hr = datetime.now(timezone.utc).hour
    surge = 1.0
    if hr in (8, 9, 18, 19, 20):
        surge = 1.3
    subtotal = (base + dist_cost + time_cost) * surge
    gst = subtotal * 0.05
    total = round(subtotal + gst, 2)
    return {
        "service_type": service_type,
        "category": cat_key,
        "category_name": cat["name"],
        "distance_km": round(distance_km, 2),
        "eta_min": round(eta_min, 1),
        "base": base,
        "distance_cost": round(dist_cost, 2),
        "time_cost": round(time_cost, 2),
        "surge": surge,
        "gst": round(gst, 2),
        "total": total,
        "currency": "INR",
    }

# ============================================================
# AUTH
# ============================================================
@api.post("/auth/request-otp")
async def request_otp(data: RequestOTP):
    otp = "{:06d}".format(random.randint(0, 999999))
    # Demo: deterministic OTP for known test accounts
    if data.email.endswith("@rkpooja.test"):
        otp = "123456"
    await db.otps.update_one(
        {"email": data.email},
        {"$set": {"otp": otp, "role": data.role, "name": data.name or "", "created_at": now_iso()}},
        upsert=True,
    )
    # For dev we return OTP (also so customer can see and verify); production: send via email/sms
    return {"sent": True, "otp": otp, "note": "Demo mode: OTP returned in response"}

@api.post("/auth/verify-otp")
async def verify_otp(data: VerifyOTP):
    rec = await db.otps.find_one({"email": data.email}, {"_id": 0})
    if not rec or rec.get("otp") != data.otp:
        raise HTTPException(401, "Invalid OTP")
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user:
        user = {
            "id": new_id(),
            "email": data.email,
            "name": rec.get("name") or data.email.split("@")[0].title(),
            "role": rec.get("role") or "customer",
            "phone": "",
            "wallet_balance": 500.0,  # signup bonus
            "rating": 5.0,
            "trips": 0,
            "online": False,
            "current_lat": None,
            "current_lng": None,
            "kyc_status": "pending",
            "kyc": {},
            "vehicle": {},
            "preferred_language": "en",
            "created_at": now_iso(),
        }
        await db.users.insert_one({**user})
    await db.otps.delete_one({"email": data.email})
    token = create_token({"user_id": user["id"], "role": user["role"]})
    user.pop("_id", None)
    return {"token": token, "user": user}

@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    user.pop("_id", None)
    return user

@api.patch("/auth/profile")
async def update_profile(data: Dict[str, Any], user=Depends(get_current_user)):
    allowed = {"name", "phone", "preferred_language"}
    update = {k: v for k, v in data.items() if k in allowed}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return u

# ============================================================
# SERVICES & PRICING
# ============================================================
@api.get("/services")
async def list_services():
    return {"services": SERVICES}

@api.post("/fare/estimate")
async def fare_estimate(req: FareEstimateReq):
    dist = haversine(req.pickup_lat, req.pickup_lng, req.drop_lat, req.drop_lng)
    eta = dist * 2.5  # ~2.5 min per km in city
    if req.vehicle_category:
        return compute_fare(req.service_type, req.vehicle_category, dist, eta)
    # return all categories
    svc = SERVICES.get(req.service_type)
    if not svc:
        raise HTTPException(400, "Unknown service")
    estimates = []
    for cat_key in svc["categories"].keys():
        estimates.append(compute_fare(req.service_type, cat_key, dist, eta))
    return {"distance_km": round(dist, 2), "eta_min": round(eta, 1), "estimates": estimates}

# ============================================================
# BOOKINGS
# ============================================================
@api.post("/bookings")
async def create_booking(req: BookingCreate, user=Depends(get_current_user)):
    dist = haversine(req.pickup.lat, req.pickup.lng, req.drop.lat, req.drop.lng)
    eta = dist * 2.5
    fare = compute_fare(req.service_type, req.vehicle_category, dist, eta)
    booking = {
        "id": new_id(),
        "code": "RK" + "".join(random.choices("0123456789", k=6)),
        "customer_id": user["id"],
        "customer_name": user["name"],
        "customer_phone": user.get("phone", ""),
        "driver_id": None,
        "driver_name": None,
        "driver_phone": None,
        "vehicle": None,
        "service_type": req.service_type,
        "vehicle_category": fare["category"],
        "pickup": req.pickup.dict(),
        "drop": req.drop.dict(),
        "scheduled_at": req.scheduled_at,
        "notes": req.notes or "",
        "passenger_count": req.passenger_count,
        "package_details": req.package_details,
        "payment_method": req.payment_method,
        "fare": fare,
        "status": "requested",  # requested -> accepted -> arrived -> started -> completed | cancelled
        "live_lat": None,
        "live_lng": None,
        "otp": "{:04d}".format(random.randint(0, 9999)),
        "rating": None,
        "review": None,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.bookings.insert_one({**booking})
    await push_notification(user["id"], "Searching driver…", f"Booking {booking['code']} created · we're matching the best driver.", "booking")
    booking.pop("_id", None)
    return booking

@api.get("/bookings")
async def list_my_bookings(user=Depends(get_current_user)):
    q = {"customer_id": user["id"]} if user["role"] == "customer" else {"driver_id": user["id"]}
    docs = await db.bookings.find(q, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs

@api.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user=Depends(get_current_user)):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not b:
        raise HTTPException(404, "Not found")
    return b

@api.patch("/bookings/{booking_id}/status")
async def update_booking_status(booking_id: str, req: BookingStatusUpdate, user=Depends(get_current_user)):
    b = await db.bookings.find_one({"id": booking_id})
    if not b:
        raise HTTPException(404, "Not found")
    update = {"status": req.status, "updated_at": now_iso()}
    # Driver acceptance
    if req.status == "accepted" and user["role"] == "driver":
        update.update({
            "driver_id": user["id"],
            "driver_name": user["name"],
            "driver_phone": user.get("phone", ""),
            "vehicle": user.get("vehicle") or {},
            "live_lat": user.get("current_lat"),
            "live_lng": user.get("current_lng"),
        })
    if req.status == "completed":
        # Deduct from customer wallet, credit driver
        fare_total = b["fare"]["total"]
        commission = round(fare_total * 0.20, 2)
        driver_earning = round(fare_total - commission, 2)
        if b.get("payment_method") == "wallet":
            await db.users.update_one({"id": b["customer_id"]}, {"$inc": {"wallet_balance": -fare_total, "trips": 1}})
        else:
            await db.users.update_one({"id": b["customer_id"]}, {"$inc": {"trips": 1}})
        if b.get("driver_id"):
            await db.users.update_one({"id": b["driver_id"]}, {"$inc": {"wallet_balance": driver_earning, "trips": 1}})
        await db.transactions.insert_one({
            "id": new_id(), "booking_id": booking_id, "amount": fare_total,
            "commission": commission, "driver_earning": driver_earning,
            "type": "trip", "created_at": now_iso(),
        })
    await db.bookings.update_one({"id": booking_id}, {"$set": update})
    # Broadcast to WebSocket subscribers
    asyncio.create_task(_broadcast_booking(booking_id))
    # Notify customer on state changes
    if req.status in ("accepted", "arrived", "started", "completed", "cancelled"):
        msg = {
            "accepted":  f"Driver {update.get('driver_name','')} accepted your trip · PIN {b.get('otp','')}",
            "arrived":   "Your driver has arrived 🚖",
            "started":   "Trip started · enjoy the ride!",
            "completed": "Trip completed · rate your driver to help others.",
            "cancelled": "Booking cancelled",
        }[req.status]
        await push_notification(b["customer_id"], "Booking update", msg, "booking")
    b2 = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    return b2

@api.post("/bookings/{booking_id}/location")
async def update_booking_location(booking_id: str, req: LocationUpdate, user=Depends(get_current_user)):
    await db.bookings.update_one(
        {"id": booking_id, "driver_id": user["id"]},
        {"$set": {"live_lat": req.lat, "live_lng": req.lng, "updated_at": now_iso()}},
    )
    return {"ok": True}

@api.post("/bookings/{booking_id}/rate")
async def rate_booking(booking_id: str, req: RatingReq, user=Depends(get_current_user)):
    await db.bookings.update_one(
        {"id": booking_id, "customer_id": user["id"]},
        {"$set": {"rating": req.rating, "review": req.review or ""}},
    )
    b = await db.bookings.find_one({"id": booking_id})
    if b and b.get("driver_id"):
        drv = await db.users.find_one({"id": b["driver_id"]})
        if drv:
            cur = drv.get("rating", 5.0) or 5.0
            new_r = round((cur * 0.85 + req.rating * 0.15), 2)
            await db.users.update_one({"id": b["driver_id"]}, {"$set": {"rating": new_r}})
    return {"ok": True}

@api.post("/bookings/{booking_id}/sos")
async def sos(booking_id: str, user=Depends(get_current_user)):
    rec = {"id": new_id(), "booking_id": booking_id, "user_id": user["id"], "created_at": now_iso(), "resolved": False}
    await db.sos_alerts.insert_one(rec)
    return {"ok": True, "message": "Emergency services notified"}

# ============================================================
# DRIVER
# ============================================================
@api.post("/driver/online")
async def driver_online(req: OnlineToggle, user=Depends(require_role(["driver"]))):
    update = {"online": req.online}
    if req.lat is not None and req.lng is not None:
        update["current_lat"] = req.lat
        update["current_lng"] = req.lng
    await db.users.update_one({"id": user["id"]}, {"$set": update})
    return {"online": req.online}

@api.get("/driver/requests")
async def driver_requests(user=Depends(require_role(["driver"]))):
    # Return open booking requests matching driver vehicle type
    veh_type = (user.get("vehicle") or {}).get("type")
    q = {"status": "requested", "driver_id": None}
    if veh_type:
        q["service_type"] = {"$in": [veh_type, "car"] if veh_type == "car" else [veh_type]}
    docs = await db.bookings.find(q, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return docs

@api.get("/driver/earnings")
async def driver_earnings(user=Depends(require_role(["driver"]))):
    completed = await db.bookings.find({"driver_id": user["id"], "status": "completed"}, {"_id": 0}).to_list(1000)
    today = datetime.now(timezone.utc).date().isoformat()
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    today_total = sum(b["fare"]["total"] * 0.8 for b in completed if b.get("updated_at", "").startswith(today))
    week_total = sum(b["fare"]["total"] * 0.8 for b in completed if b.get("updated_at", "") >= week_ago)
    return {
        "today": round(today_total, 2),
        "week": round(week_total, 2),
        "total": round(sum(b["fare"]["total"] * 0.8 for b in completed), 2),
        "trips_today": sum(1 for b in completed if b.get("updated_at", "").startswith(today)),
        "trips_week": sum(1 for b in completed if b.get("updated_at", "") >= week_ago),
        "trips_total": len(completed),
        "wallet": user.get("wallet_balance", 0),
    }

@api.post("/driver/kyc")
async def driver_kyc(req: KYCUpdate, user=Depends(require_role(["driver"]))):
    kyc = {k: v for k, v in req.dict().items() if v is not None}
    vehicle = {}
    for k in ("vehicle_make", "vehicle_model", "vehicle_number", "vehicle_type"):
        if kyc.get(k):
            vehicle[k.replace("vehicle_", "")] = kyc.pop(k)
    update = {"kyc": kyc, "kyc_status": "submitted"}
    if vehicle:
        update["vehicle"] = vehicle
    await db.users.update_one({"id": user["id"]}, {"$set": update})
    return {"ok": True, "kyc_status": "submitted"}

# ============================================================
# WALLET
# ============================================================
@api.get("/wallet")
async def get_wallet(user=Depends(get_current_user)):
    txns = await db.transactions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return {"balance": user.get("wallet_balance", 0), "transactions": txns}

@api.post("/wallet/topup")
async def wallet_topup(req: WalletTopup, user=Depends(get_current_user)):
    if req.amount <= 0:
        raise HTTPException(400, "Invalid amount")
    await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": req.amount}})
    await db.transactions.insert_one({
        "id": new_id(), "user_id": user["id"], "amount": req.amount,
        "type": "topup", "status": "success", "created_at": now_iso(),
    })
    u = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return {"balance": u.get("wallet_balance", 0)}

# ============================================================
# AI
# ============================================================
@api.post("/ai/chat")
async def ai_chat(req: ChatMessageReq, user=Depends(get_current_user)):
    session_id = req.session_id or new_id()
    if not EMERGENT_LLM_KEY:
        return {"session_id": session_id, "reply": "AI is currently unavailable. Please configure EMERGENT_LLM_KEY."}
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        system_msg = (
            "You are RK POOJA AI Assistant — a polite, concise mobility & travel assistant for an Indian ride-hailing super app. "
            "Help users with: booking rides (car, auto, bike, tempo, bus), parcel delivery (porter, goods), "
            "fare estimates, trip planning, language translation (Hindi/Marathi/Tamil/Telugu/etc), and support. "
            "Always reply in 2-4 short sentences. If user asks to book, suggest the right service category."
        )
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=session_id, system_message=system_msg).with_model("openai", "gpt-5")
        # Persist message context (last 6)
        prior = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)
        prior.reverse()
        context = "\n".join(f"{m['role']}: {m['content']}" for m in prior)
        prompt = f"Previous conversation:\n{context}\n\nUser now: {req.message}" if prior else req.message
        reply = await chat.send_message(UserMessage(text=prompt))
        # Persist
        await db.chat_messages.insert_many([
            {"id": new_id(), "session_id": session_id, "user_id": user["id"], "role": "user", "content": req.message, "created_at": now_iso()},
            {"id": new_id(), "session_id": session_id, "user_id": user["id"], "role": "assistant", "content": reply, "created_at": now_iso()},
        ])
        return {"session_id": session_id, "reply": reply}
    except Exception as e:
        logging.exception("AI chat failed")
        return {"session_id": session_id, "reply": f"Sorry, I had trouble responding. Try again.", "error": str(e)}

@api.post("/ai/parse-booking")
async def ai_parse_booking(req: VoiceBookingParse, user=Depends(get_current_user)):
    """Parse a natural-language booking request into structured form fields."""
    if not EMERGENT_LLM_KEY:
        return {"service_type": "car", "vehicle_category": "sedan", "notes": req.transcript}
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        system_msg = (
            "Extract booking intent from user's natural-language request. "
            "Reply ONLY with a single JSON object with keys: "
            "service_type (one of car|auto|bike|tempo|bus|porter|goods|airport|outstation), "
            "vehicle_category (mini|sedan|suv|premium|luxury|ev|auto|bike|9s|12s|17s|20s|26s|mini|ac|sleeper|volvo|tata_ace|mini_truck|pickup|truck|container|heavy), "
            "pickup_text (string), drop_text (string), passengers (integer), notes (string). "
            "If unclear, use sensible defaults. No prose, no markdown."
        )
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=new_id(), system_message=system_msg).with_model("openai", "gpt-5")
        reply = await chat.send_message(UserMessage(text=req.transcript))
        import json, re
        m = re.search(r'\{.*\}', reply, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        return {"service_type": "car", "vehicle_category": "sedan", "notes": req.transcript}
    except Exception as e:
        logging.exception("AI parse failed")
        return {"service_type": "car", "vehicle_category": "sedan", "notes": req.transcript, "error": str(e)}

# ============================================================
# ADMIN
# ============================================================
@api.get("/admin/stats")
async def admin_stats(user=Depends(require_role(["admin"]))):
    total_users = await db.users.count_documents({"role": "customer"})
    total_drivers = await db.users.count_documents({"role": "driver"})
    online_drivers = await db.users.count_documents({"role": "driver", "online": True})
    total_bookings = await db.bookings.count_documents({})
    active = await db.bookings.count_documents({"status": {"$in": ["requested", "accepted", "arrived", "started"]}})
    completed = await db.bookings.count_documents({"status": "completed"})
    # Revenue
    txns = await db.transactions.find({"type": "trip"}, {"_id": 0}).to_list(10000)
    revenue = sum(t.get("commission", 0) for t in txns)
    gross = sum(t.get("amount", 0) for t in txns)
    # last 7 day buckets
    buckets = {}
    for t in txns:
        d = (t.get("created_at") or "")[:10]
        buckets[d] = buckets.get(d, 0) + t.get("amount", 0)
    series = [{"date": k, "gross": round(v, 2)} for k, v in sorted(buckets.items())[-7:]]
    return {
        "total_users": total_users,
        "total_drivers": total_drivers,
        "online_drivers": online_drivers,
        "total_bookings": total_bookings,
        "active_bookings": active,
        "completed_bookings": completed,
        "gross_revenue": round(gross, 2),
        "platform_revenue": round(revenue, 2),
        "series": series,
    }

@api.get("/admin/users")
async def admin_users(role: Optional[str] = None, user=Depends(require_role(["admin"]))):
    q = {}
    if role:
        q["role"] = role
    docs = await db.users.find(q, {"_id": 0}).sort("created_at", -1).limit(500).to_list(500)
    return docs

@api.get("/admin/bookings")
async def admin_bookings(status: Optional[str] = None, user=Depends(require_role(["admin"]))):
    q = {}
    if status:
        q["status"] = status
    docs = await db.bookings.find(q, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    return docs

@api.post("/admin/promo")
async def admin_create_promo(req: PromoCreate, user=Depends(require_role(["admin"]))):
    rec = {"id": new_id(), **req.dict(), "created_at": now_iso()}
    await db.promos.insert_one({**rec})
    rec.pop("_id", None)
    return rec

@api.get("/admin/promos")
async def admin_list_promos(user=Depends(require_role(["admin"]))):
    return await db.promos.find({}, {"_id": 0}).to_list(200)

@api.patch("/admin/users/{user_id}/verify")
async def admin_verify(user_id: str, body: Dict[str, Any], user=Depends(require_role(["admin"]))):
    status = body.get("status", "verified")
    await db.users.update_one({"id": user_id}, {"$set": {"kyc_status": status}})
    return {"ok": True}

# ============================================================
# FLEET OWNER
# ============================================================
@api.get("/fleet/stats")
async def fleet_stats(user=Depends(require_role(["fleet"]))):
    vehicles = await db.vehicles.find({"fleet_id": user["id"]}, {"_id": 0}).to_list(200)
    driver_ids = [v.get("driver_id") for v in vehicles if v.get("driver_id")]
    bookings = await db.bookings.find({"driver_id": {"$in": driver_ids}, "status": "completed"}, {"_id": 0}).to_list(1000)
    revenue = sum(b["fare"]["total"] * 0.8 for b in bookings)
    return {
        "vehicles": len(vehicles),
        "drivers": len(set(driver_ids)),
        "trips": len(bookings),
        "revenue": round(revenue, 2),
        "vehicles_list": vehicles,
    }

@api.post("/fleet/vehicles")
async def fleet_add_vehicle(req: VehicleCreate, user=Depends(require_role(["fleet"]))):
    driver_id = None
    if req.driver_email:
        drv = await db.users.find_one({"email": req.driver_email, "role": "driver"})
        if drv:
            driver_id = drv["id"]
    veh = {
        "id": new_id(),
        "fleet_id": user["id"],
        "make": req.make, "model": req.model, "number": req.number,
        "type": req.type, "capacity": req.capacity,
        "driver_id": driver_id, "driver_email": req.driver_email,
        "created_at": now_iso(),
    }
    await db.vehicles.insert_one({**veh})
    veh.pop("_id", None)
    return veh

@api.get("/fleet/vehicles")
async def fleet_vehicles(user=Depends(require_role(["fleet"]))):
    return await db.vehicles.find({"fleet_id": user["id"]}, {"_id": 0}).to_list(200)

# ============================================================
# DEMO SEED
# ============================================================
@api.post("/seed/demo")
async def seed_demo():
    """Idempotently create demo users for quick testing."""
    demos = [
        {"email": "customer@rkpooja.test", "role": "customer", "name": "Aarav Sharma", "phone": "+919999911111"},
        {"email": "driver@rkpooja.test",   "role": "driver",   "name": "Rajesh Kumar", "phone": "+919999922222",
         "online": True, "current_lat": 25.6093, "current_lng": 85.1235, "rating": 4.8,
         "vehicle": {"make": "Maruti", "model": "Swift Dzire", "number": "BR01AB1234", "type": "car"},
         "kyc_status": "verified"},
        {"email": "admin@rkpooja.test",    "role": "admin",    "name": "Admin User", "phone": "+919999933333"},
        {"email": "fleet@rkpooja.test",    "role": "fleet",    "name": "Pooja Fleet", "phone": "+919999944444"},
    ]
    created = []
    for d in demos:
        existing = await db.users.find_one({"email": d["email"]})
        if existing:
            continue
        user = {
            "id": new_id(),
            "email": d["email"], "name": d["name"], "phone": d["phone"], "role": d["role"],
            "wallet_balance": 1000.0, "rating": d.get("rating", 5.0), "trips": 0,
            "online": d.get("online", False),
            "current_lat": d.get("current_lat"), "current_lng": d.get("current_lng"),
            "kyc_status": d.get("kyc_status", "pending"), "kyc": {},
            "vehicle": d.get("vehicle", {}), "preferred_language": "en",
            "created_at": now_iso(),
        }
        await db.users.insert_one({**user})
        created.append(d["email"])
    return {"created": created, "demo_otp": "123456", "demo_emails": [d["email"] for d in demos]}

@api.get("/health")
async def health():
    return {"status": "ok", "time": now_iso(), "stripe": bool(STRIPE_API_KEY), "storage": bool(EMERGENT_LLM_KEY)}

# ============================================================
# STRIPE PAYMENTS (wallet topup)
# ============================================================
WALLET_PACKAGES = {
    "p100":  {"label": "₹100",  "amount": 100.0},
    "p200":  {"label": "₹200",  "amount": 200.0},
    "p500":  {"label": "₹500",  "amount": 500.0},
    "p1000": {"label": "₹1,000","amount": 1000.0},
    "p2000": {"label": "₹2,000","amount": 2000.0},
    "p5000": {"label": "₹5,000","amount": 5000.0},
}

class CheckoutCreate(BaseModel):
    package_id: str
    origin_url: str

@api.get("/payments/packages")
async def list_packages():
    return [{"id": k, **v} for k, v in WALLET_PACKAGES.items()]

@api.post("/payments/checkout")
async def create_checkout(req: CheckoutCreate, http_request: Request, user=Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(503, "Stripe not configured")
    if req.package_id not in WALLET_PACKAGES:
        raise HTTPException(400, "Invalid package")
    pkg = WALLET_PACKAGES[req.package_id]
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    except ImportError:
        raise HTTPException(500, "Payment lib not installed")

    host = str(http_request.base_url).rstrip("/")
    webhook_url = f"{host}/api/webhook/stripe"
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    origin = req.origin_url.rstrip("/")
    success_url = f"{origin}/app/wallet?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin}/app/wallet?cancelled=1"
    metadata = {"user_id": user["id"], "package_id": req.package_id, "purpose": "wallet_topup"}
    creq = CheckoutSessionRequest(amount=pkg["amount"], currency="inr",
                                  success_url=success_url, cancel_url=cancel_url, metadata=metadata)
    session = await stripe.create_checkout_session(creq)
    await db.payment_transactions.insert_one({
        "id": new_id(),
        "session_id": session.session_id,
        "user_id": user["id"], "user_email": user["email"],
        "amount": pkg["amount"], "currency": "INR",
        "package_id": req.package_id, "metadata": metadata,
        "payment_status": "initiated", "status": "open",
        "created_at": now_iso(),
    })
    return {"url": session.url, "session_id": session.session_id}

@api.get("/payments/status/{session_id}")
async def payment_status(session_id: str, http_request: Request, user=Depends(get_current_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(503, "Stripe not configured")
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
    except ImportError:
        raise HTTPException(500, "Payment lib not installed")
    host = str(http_request.base_url).rstrip("/")
    stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host}/api/webhook/stripe")
    status = await stripe.get_checkout_status(session_id)
    txn = await db.payment_transactions.find_one({"session_id": session_id})
    if txn and txn.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your transaction")
    # Idempotent credit
    if txn and status.payment_status == "paid" and txn.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id, "payment_status": {"$ne": "paid"}},
            {"$set": {"payment_status": "paid", "status": status.status, "updated_at": now_iso()}}
        )
        # Only credit if the update actually happened (race-safe)
        re_check = await db.payment_transactions.find_one({"session_id": session_id})
        if re_check and re_check.get("credited") != True:
            await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": float(status.amount_total) / 100.0}})
            await db.transactions.insert_one({
                "id": new_id(), "user_id": user["id"], "amount": float(status.amount_total) / 100.0,
                "type": "topup", "status": "success", "session_id": session_id, "created_at": now_iso(),
            })
            await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"credited": True}})
            await push_notification(user["id"], "Wallet topped up 💳", f"₹{float(status.amount_total)/100:.0f} added via Stripe", "reward")
    elif txn:
        await db.payment_transactions.update_one({"session_id": session_id},
            {"$set": {"payment_status": status.payment_status, "status": status.status, "updated_at": now_iso()}})
    return {
        "session_id": session_id,
        "payment_status": status.payment_status,
        "status": status.status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        return {"received": False}
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        host = str(request.base_url).rstrip("/")
        stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host}/api/webhook/stripe")
        body = await request.body()
        sig = request.headers.get("Stripe-Signature", "")
        evt = await stripe.handle_webhook(body, sig)
        if evt.event_type == "checkout.session.completed" and evt.payment_status == "paid":
            txn = await db.payment_transactions.find_one({"session_id": evt.session_id})
            if txn and txn.get("credited") != True:
                meta = evt.metadata or {}
                uid = meta.get("user_id") or txn.get("user_id")
                if uid:
                    await db.users.update_one({"id": uid}, {"$inc": {"wallet_balance": txn.get("amount", 0)}})
                    await db.payment_transactions.update_one({"session_id": evt.session_id},
                        {"$set": {"payment_status": "paid", "credited": True, "updated_at": now_iso()}})
                    await push_notification(uid, "Wallet topped up 💳", f"₹{txn.get('amount',0):.0f} via Stripe (webhook)", "reward")
        return {"received": True}
    except Exception as e:
        logging.exception("stripe webhook failed: %s", e)
        return {"received": False, "error": str(e)}

# ============================================================
# OBJECT STORAGE — Driver KYC document uploads
# ============================================================
ALLOWED_MIME = {"image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"}
MAX_BYTES = 8 * 1024 * 1024  # 8 MB

@api.post("/uploads/kyc")
async def upload_kyc(file: UploadFile = File(...), kind: str = "doc", user=Depends(get_current_user)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(400, f"Unsupported file type {file.content_type}")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 8MB)")
    ext = (file.filename.rsplit(".", 1)[-1] or "bin").lower()
    file_uuid = new_id()
    path = f"{APP_NAME}/uploads/{user['id']}/{file_uuid}.{ext}"
    try:
        result = put_object(path, data, file.content_type)
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("upload failed: %s", e)
        raise HTTPException(500, "Upload failed")
    rec = {
        "id": file_uuid, "user_id": user["id"], "kind": kind,
        "storage_path": result["path"], "original_filename": file.filename,
        "content_type": file.content_type, "size": result.get("size", len(data)),
        "is_deleted": False, "created_at": now_iso(),
    }
    await db.files.insert_one({**rec})
    rec.pop("_id", None)
    rec["url"] = f"/api/uploads/file/{file_uuid}"
    return rec

from fastapi.responses import Response

@api.get("/uploads/file/{file_id}")
async def fetch_file(file_id: str, authorization: Optional[str] = Header(None), auth: Optional[str] = None):
    # Support img-tag auth via query param
    if not authorization and auth:
        authorization = f"Bearer {auth}"
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")
    try:
        decode_token(authorization.replace("Bearer ", ""))
    except HTTPException:
        raise
    rec = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    data, ctype = get_object(rec["storage_path"])
    return Response(content=data, media_type=rec.get("content_type", ctype))

@api.get("/uploads/my")
async def my_uploads(user=Depends(get_current_user)):
    docs = await db.files.find({"user_id": user["id"], "is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for d in docs:
        d["url"] = f"/api/uploads/file/{d['id']}"
    return docs

@api.delete("/uploads/{file_id}")
async def delete_upload(file_id: str, user=Depends(get_current_user)):
    res = await db.files.update_one({"id": file_id, "user_id": user["id"]}, {"$set": {"is_deleted": True, "deleted_at": now_iso()}})
    if res.matched_count == 0:
        raise HTTPException(404, "Not found")
    return {"ok": True}

# ============================================================
# WEBSOCKET — Live tracking
# ============================================================
class TrackHub:
    def __init__(self):
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, booking_id: str, ws: WebSocket):
        await ws.accept()
        self.connections.setdefault(booking_id, set()).add(ws)

    def disconnect(self, booking_id: str, ws: WebSocket):
        if booking_id in self.connections:
            self.connections[booking_id].discard(ws)
            if not self.connections[booking_id]:
                del self.connections[booking_id]

    async def broadcast(self, booking_id: str, payload: dict):
        if booking_id not in self.connections:
            return
        dead = []
        for ws in list(self.connections[booking_id]):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(booking_id, ws)

track_hub = TrackHub()

@app.websocket("/api/ws/track/{booking_id}")
async def ws_track(ws: WebSocket, booking_id: str):
    await track_hub.connect(booking_id, ws)
    # Send initial snapshot
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if b:
        await ws.send_json({"type": "snapshot", "booking": b})
    try:
        while True:
            msg = await ws.receive_json()
            # Driver can push location: {type:"location", lat, lng, token}
            if msg.get("type") == "location":
                token = msg.get("token", "")
                try:
                    data = decode_token(token)
                except HTTPException:
                    continue
                driver_user = await db.users.find_one({"id": data.get("user_id")}, {"_id": 0})
                if not driver_user or driver_user.get("role") != "driver":
                    continue
                lat, lng = msg.get("lat"), msg.get("lng")
                await db.bookings.update_one(
                    {"id": booking_id, "driver_id": driver_user["id"]},
                    {"$set": {"live_lat": lat, "live_lng": lng, "updated_at": now_iso()}}
                )
                await track_hub.broadcast(booking_id, {"type": "location", "lat": lat, "lng": lng, "at": now_iso()})
    except WebSocketDisconnect:
        track_hub.disconnect(booking_id, ws)
    except Exception:
        track_hub.disconnect(booking_id, ws)

# Hook booking status updates into the hub
async def _broadcast_booking(booking_id: str):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if b:
        await track_hub.broadcast(booking_id, {"type": "status", "booking": b})

# ============================================================
# NOTIFICATIONS, REFERRALS, BUS SEATS, TRIP SHARE
# ============================================================
async def push_notification(user_id: str, title: str, body: str, kind: str = "info"):
    await db.notifications.insert_one({
        "id": new_id(), "user_id": user_id, "title": title, "body": body,
        "kind": kind, "read": False, "created_at": now_iso(),
    })

@api.get("/notifications")
async def list_notifications(user=Depends(get_current_user)):
    docs = await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return docs

@api.post("/notifications/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"ok": True}

@api.get("/referral")
async def my_referral(user=Depends(get_current_user)):
    code = "RK" + user["id"][:6].upper()
    used = await db.referrals.find({"referrer_id": user["id"]}, {"_id": 0}).to_list(100)
    return {
        "code": code,
        "share_url": f"https://rkpooja.app/r/{code}",
        "share_text": f"Get ₹100 free on RK POOJA — India's One App for ALL Rides. Use my code {code} 🚗",
        "earned": sum(r.get("bonus", 0) for r in used),
        "successful_invites": len(used),
        "history": used,
    }

@api.post("/referral/redeem")
async def redeem_referral(req: ReferralRedeem, user=Depends(get_current_user)):
    code = req.code.strip().upper()
    if not code.startswith("RK") or len(code) < 4:
        raise HTTPException(400, "Invalid code")
    # Check if user already redeemed any referral
    existing = await db.referrals.find_one({"invitee_id": user["id"]})
    if existing:
        raise HTTPException(400, "Referral already redeemed")
    referrer_uid = code[2:].lower()
    referrer = await db.users.find_one({"id": {"$regex": f"^{referrer_uid}", "$options": "i"}})
    if not referrer or referrer["id"] == user["id"]:
        raise HTTPException(404, "Referrer not found")
    bonus = 100.0
    await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": bonus}})
    await db.users.update_one({"id": referrer["id"]}, {"$inc": {"wallet_balance": bonus}})
    await db.referrals.insert_one({
        "id": new_id(), "code": code, "referrer_id": referrer["id"],
        "invitee_id": user["id"], "invitee_name": user["name"], "bonus": bonus,
        "created_at": now_iso(),
    })
    await push_notification(referrer["id"], "Referral reward 🎉", f"{user['name']} joined using your code — ₹{bonus} credited!", "reward")
    await push_notification(user["id"], "Welcome bonus 🎉", f"₹{bonus} added to your wallet via referral", "reward")
    return {"ok": True, "bonus": bonus}

@api.get("/bus/routes")
async def bus_routes():
    """Static bus inventory for demo."""
    routes = [
        {"id": "PA-DL-01", "from": "Patna", "to": "Delhi", "departure": "21:30", "arrival": "10:15", "duration": "12h 45m",
         "operator": "Pooja Travels", "type": "ac", "price": 1450, "seats_total": 36, "seats_booked": 12},
        {"id": "PA-MU-02", "from": "Patna", "to": "Mumbai", "departure": "19:00", "arrival": "08:30",  "duration": "13h 30m",
         "operator": "RK Express", "type": "sleeper", "price": 1750, "seats_total": 30, "seats_booked": 9},
        {"id": "PA-KO-03", "from": "Patna", "to": "Kolkata", "departure": "22:00", "arrival": "07:00", "duration": "9h 00m",
         "operator": "Bharat Volvo", "type": "volvo", "price": 1850, "seats_total": 40, "seats_booked": 19},
        {"id": "PA-RA-04", "from": "Patna", "to": "Ranchi", "departure": "23:15", "arrival": "06:45", "duration": "7h 30m",
         "operator": "Pooja Travels", "type": "mini", "price": 700, "seats_total": 22, "seats_booked": 5},
        {"id": "PA-VA-05", "from": "Patna", "to": "Varanasi", "departure": "06:00", "arrival": "11:30", "duration": "5h 30m",
         "operator": "RK Express", "type": "luxury", "price": 950, "seats_total": 30, "seats_booked": 14},
    ]
    return {"routes": routes}

class BusBookingCreate(BaseModel):
    route_id: str
    seats: List[str]   # ["A1","A2"]
    passenger_name: str
    passenger_phone: str
    payment_method: str = "wallet"

@api.post("/bus/book")
async def bus_book(req: BusBookingCreate, user=Depends(get_current_user)):
    # Use the same routes
    routes_resp = await bus_routes()
    route = next((r for r in routes_resp["routes"] if r["id"] == req.route_id), None)
    if not route:
        raise HTTPException(404, "Route not found")
    # Block already booked seats (per route, ephemeral collection)
    held = await db.bus_seats.find({"route_id": req.route_id, "seat": {"$in": req.seats}}, {"_id": 0}).to_list(100)
    if held:
        raise HTTPException(409, f"Seat(s) already booked: {[h['seat'] for h in held]}")
    fare_total = route["price"] * len(req.seats)
    if req.payment_method == "wallet" and (user.get("wallet_balance", 0) or 0) < fare_total:
        raise HTTPException(402, "Insufficient wallet balance")
    if req.payment_method == "wallet":
        await db.users.update_one({"id": user["id"]}, {"$inc": {"wallet_balance": -fare_total}})
    booking_id = new_id()
    code = "BUS" + "".join(random.choices("0123456789", k=6))
    for s in req.seats:
        await db.bus_seats.insert_one({"id": new_id(), "route_id": req.route_id, "seat": s,
                                       "booking_id": booking_id, "user_id": user["id"]})
    booking = {
        "id": booking_id, "code": code, "user_id": user["id"],
        "route_id": req.route_id, "route": route, "seats": req.seats,
        "passenger_name": req.passenger_name, "passenger_phone": req.passenger_phone,
        "fare_total": fare_total, "payment_method": req.payment_method,
        "qr": f"RKPOOJA|{code}|{req.route_id}|{','.join(req.seats)}",
        "status": "confirmed", "created_at": now_iso(),
    }
    await db.bus_bookings.insert_one({**booking})
    await push_notification(user["id"], "Bus ticket booked 🎫", f"{route['from']} → {route['to']} · Seats {', '.join(req.seats)} · {code}", "ticket")
    booking.pop("_id", None)
    return booking

@api.get("/bus/bookings")
async def my_bus_bookings(user=Depends(get_current_user)):
    return await db.bus_bookings.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)

@api.get("/bus/route/{route_id}/seats")
async def bus_route_seats(route_id: str):
    booked = await db.bus_seats.find({"route_id": route_id}, {"_id": 0}).to_list(200)
    return {"booked": [b["seat"] for b in booked]}

@api.get("/share/booking/{booking_id}")
async def share_booking(booking_id: str):
    b = await db.bookings.find_one({"id": booking_id}, {"_id": 0, "customer_phone": 0})
    if not b:
        raise HTTPException(404, "Not found")
    return {
        "code": b.get("code"), "status": b.get("status"),
        "pickup": b.get("pickup", {}).get("address"),
        "drop": b.get("drop", {}).get("address"),
        "driver_name": b.get("driver_name"),
        "vehicle": b.get("vehicle"),
        "fare": b.get("fare", {}).get("total"),
        "live_lat": b.get("live_lat"),
        "live_lng": b.get("live_lng"),
    }

# Register
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

@app.on_event("startup")
async def on_startup():
    init_storage()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
