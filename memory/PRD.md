# RK POOJA — Product Requirements & State

**Tagline:** ONE APP. ALL RIDES.
**Vision:** Uber + Ola + Rapido + Porter + InDrive — unified mobility super app for India.

## Original problem statement
Build a complete production-grade Mobility, Travel, Logistics and Transportation Super App: customer + driver + admin + fleet apps, real-time booking, dispatch, payments, AI assistant, multilingual support, KYC. Brand RK POOJA. Premium "Apple-level" design. React + FastAPI + MongoDB. AI via Emergent Universal LLM Key. Maps via canvas (no Google key in MVP). Payments and OTP delivery mocked for MVP.

## Architecture
- **Backend** — `/app/backend/server.py` · FastAPI + Motor (MongoDB) · JWT auth · all routes under `/api`
- **Frontend** — React 19 + react-router-dom v7 + Tailwind + shadcn/ui · path alias `@/...` · fonts: Cabinet Grotesk + Satoshi via Fontshare
- **AI** — `emergentintegrations` with `gpt-5.4` (chat + voice booking parser)
- **Map** — stylised `<canvas>` (`MapCanvas.jsx`) — pins, route, driver marker, light/dark aware

## What's been implemented (Feb 2026)
**Backend (25/25 tests passing)**
- Auth: email OTP request/verify, JWT, /auth/me, profile update
- Roles & RBAC (customer / driver / admin / fleet)
- Services catalog (9 services, multiple categories), fare estimator with surge
- Bookings: create, list, status flow (requested → accepted → arrived → started → completed/cancelled), live location update, rate, SOS
- Driver: online/offline, nearby requests, earnings, KYC submit
- Wallet: balance, transactions, topup
- AI: chat (`/ai/chat` with session persistence), voice-booking parser (`/ai/parse-booking`)
- Admin: stats, users, bookings, promos, KYC verify
- Fleet: vehicles CRUD, stats
- Idempotent demo seed `/seed/demo`

**Frontend**
- Landing page with hero, services strip, features, CTA panel
- Login page with role tabs + OTP flow + 4 quick-demo tiles
- Customer portal (`/app/*`) — Home with 9 service tiles + AI voice input, BookRide (location → vehicle → confirm), TrackBooking with live driver card + PIN + SOS + rate, Trips history, Wallet topup, AI chat, Profile w/ 12 languages
- Driver portal (`/driver/*`) — Online toggle, dashboard with stats + active trip card + nearby requests, Earnings with 7-day chart, KYC form, Trips table
- Admin portal (`/admin/*`) — Mission Control stats + 7-day chart, Users (tabs by role + KYC verify), Bookings (status filter), Promo create + list
- Fleet portal (`/fleet/*`) — Stats + add vehicle + vehicle list

## Personas
- **Customer (Aarav)** — books rides/parcels, manages wallet, chats with AI
- **Driver (Rajesh)** — toggles online, accepts trips, KYC, earnings
- **Admin** — monitors GMV, drivers, bookings, promos
- **Fleet owner** — onboards vehicles + assigns drivers + tracks earnings

## P0 backlog (next)
- Google/OSM real map integration with live geolocation
- Real OTP delivery (Twilio/SendGrid) + Google sign-in
- Real payments (Razorpay / Stripe) for wallet top-up and trip payment
- WebSocket-based live tracking (currently 4s polling)

## P1 backlog
- Bus seat-selection UI + digital QR ticket
- Driver vehicle/RC document upload (object storage)
- Multi-language UI strings via i18n (currently labels only)
- Push notifications (FCM) + WhatsApp transactional
- Referral program rewards distribution

## P2 backlog
- Surge heatmap on admin map
- Driver background check workflow
- Corporate billing portal
- AI surge-pricing model from historical data

## Demo credentials
See `/app/memory/test_credentials.md`. All accounts use OTP `123456`.
