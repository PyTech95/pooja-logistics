# RK POOJA — Product Requirements & State

**Tagline:** ONE APP. ALL RIDES.
**Vision:** Uber + Ola + Rapido + Porter + InDrive — unified mobility super app for India.

## Original problem statement
Build a complete production-grade Mobility, Travel, Logistics and Transportation Super App: customer + driver + admin + fleet apps, real-time booking, dispatch, payments, AI assistant, multilingual support, KYC. Brand RK POOJA. Premium "Apple-level" design. React + FastAPI + MongoDB. AI via Emergent Universal LLM Key. Maps via canvas (no Google key in MVP). Payments and OTP delivery mocked for MVP.

## Architecture
- **Backend** — `/app/backend/server.py` · FastAPI + Motor (MongoDB) · JWT auth · all routes under `/api`
- **Frontend** — React 19 + react-router-dom v7 + Tailwind + shadcn/ui · path alias `@/...` · fonts: Cabinet Grotesk + Satoshi via Fontshare
- **AI** — `emergentintegrations` with `gpt-5` (chat + voice booking parser)
- **Map** — stylised `<canvas>` (`MapCanvas.jsx`) — pins, route, driver marker, light/dark aware

## What's been implemented (Feb 2026)

### Iteration 1 (foundation)
- Auth: OTP request/verify, JWT, /auth/me, profile update — 4 roles (customer/driver/admin/fleet)
- Services catalog (9), fare estimator with surge pricing
- Bookings full lifecycle (requested → completed) + live tracking + rating + SOS
- Driver online/offline, requests, earnings, KYC, vehicle assignment
- Wallet + topup + transactions
- AI chat + voice-booking parser
- Admin stats + users + bookings + promos + KYC verify
- Fleet vehicles + stats
- All 4 portal UIs

### Iteration 2 (Feb 2026)
- **Landing page redesigned** — sticky header w/ section nav, phone mockup hero with floating chips, stats strip, services grid, how-it-works (3 steps), why-section + sign-up bonus card, testimonials, driver-partner showcase, demo CTA, full footer
- **Login redesigned** — splash with tilted logo card + animated floating service icons + 3-stat grid; OTP step uses 6-slot InputOTP with auto-verify
- **Bus seat-selection + QR e-ticket** — 5 routes, A-D seat layout with booked/selected states, passenger details, e-ticket with QR scan code
- **Referral program** — code, copy/WhatsApp/share, redeem to credit ₹100 to both invitee & referrer, history
- **Notifications inbox** — auto-pushed on booking lifecycle + referral, unread badge in header, mark-all-read
- **Share-trip link** — share button on TrackBooking; public-safe `/api/share/booking/:id`
- **PWA manifest** + theme-color + favicon from official logo
- **Brand mark** in headers (CSS) + full uploaded logo on hero/splash
- **AI model fixed** to `gpt-5` (was invalid `gpt-5.4`)
- **41/42 backend tests passing**

## Personas
- **Customer (Aarav)** — books rides/parcels/buses, manages wallet, refers friends, chats AI
- **Driver (Rajesh)** — toggles online, accepts trips, KYC, earnings dashboard
- **Admin** — monitors GMV, drivers, bookings, promos, verifies KYC
- **Fleet owner** — onboards vehicles + drivers + tracks earnings

## P0 backlog (next)
- Google/OSM real map integration with live geolocation
- Real OTP delivery (Twilio/SendGrid) + Google sign-in
- Real payments (Razorpay / Stripe) for wallet top-up and trip payment
- WebSocket-based live tracking (currently 4s polling)

## P1 backlog
- Driver vehicle/RC document upload (object storage)
- Multi-language UI strings via i18n (labels in place)
- Push notifications (FCM) + WhatsApp transactional
- Driver background check workflow

## P2 backlog
- Surge heatmap on admin live map
- Corporate billing portal
- AI surge-pricing model from historical data
- Loyalty tiers (silver/gold/platinum) tied to trip count

## Demo credentials
See `/app/memory/test_credentials.md`. All accounts use OTP `123456`.
