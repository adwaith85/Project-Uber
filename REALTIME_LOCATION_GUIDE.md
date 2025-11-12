# Real-Time Location & Navigation Route Setup Guide

## Overview
The system now fully supports real-time location tracking between driver and rider with automatic route calculation and ETA display when a ride is accepted.

## Architecture

### Backend (`backend/index.js`)
- **Socket.IO Server** runs on `http://localhost:8080`
- **Room-based messaging**: Each ride gets its own room `ride_<rideId>`
- **Location broadcasting**:
  - Driver emits: `driver:location:update:onride` (driver location)
  - Rider emits: `user:location:update:onride` (rider location)
  - Backend broadcasts to room as: `driver:location` and `user:location`
- **OTP Flow**:
  - Driver arrives (< 50m from rider): `driver:arrived` event generates 4-digit OTP
  - Rider confirms OTP: `otp:confirm` event
  - Backend validates: `otp:confirmed` event

### Driver Frontend (`driver-frontend`)
- **Persistent Socket Context** (`context/SocketContext.jsx`): Single socket instance persists across entire app
- **RidingLocation Component** (`Components/RidingLocation.jsx`):
  - Receives real-time rider location via `user:location` socket event
  - Emits own location via geolocation watch
  - Fetches route from OSRM every time both locations update
  - Displays: driver marker, rider marker, blue polyline route, distance (km), ETA (minutes)

### Rider Frontend (`frontend`)
- **RidingLocation Component** (`Components/RidingLocation.jsx`):
  - Emits real-time location via `user:location:update:onride`
  - Listens for driver location (`driver:location`)
  - Shows OTP confirmation modal when driver arrives
  - Displays route and ETA (same as driver)

---

## Setup Instructions

### 1. Backend Setup
```bash
cd c:/adwaithproject/project-uber/backend
npm install
npm run dev
```
Backend runs on port 8080. Check `.env` for `MONGO_URL` and `JWT_SECRET`.

### 2. Driver Frontend Setup
```bash
cd c:/adwaithproject/project-uber/driver-frontend
npm install
npm run dev
```
- Runs on port `5173` (or next available)
- Uses `SocketProvider` (React Context) for persistent socket
- Routes: `/`, `/home`, `/ridinglocation`

### 3. Rider Frontend Setup
```bash
cd c:/adwaithproject/project-uber/frontend
npm install
npm run dev
```
- Runs on port `5174` (or next available)
- Each component creates its own socket connection
- Routes: `/`, `/userhome`, `/ridinglocation`

---

## End-to-End Flow

### Step 1: Driver Home Page
1. Driver logs in → navigates to `/home`
2. Driver sees available rides (if available)
3. Driver receives incoming `ride:alert` notification (via socket from backend)
4. Notification card shows: Pickup, Dropoff, Date, Time, Ride ID
5. Driver clicks **Accept** button

### Step 2: Ride Accepted - Room Join
1. Backend emits `ride:accepted` to ride room `ride_<rideId>`
2. Driver app receives `ride:accepted` → navigates to `/ridinglocation` with rideId in state
3. Driver RidingLocation component:
   - Receives persistent socket from `SocketContext`
   - Extracts `rideId` from navigation state or query params
   - Emits `ride:join` → backend adds driver socket to the room
   - Starts emitting geolocation (driver location) every ~1-2 seconds
4. Rider app (Timer waiting for acceptance):
   - Timer polls backend via `checkOrderStatus` API (existing behavior)
   - Also listens for `ride:accepted` socket event (from ride room)
   - Navigates to `/ridinglocation?rideId=<rideId>` when accepted
   - Rider RidingLocation component emits `ride:join` → added to ride room
   - Starts emitting geolocation (rider location)

### Step 3: Real-Time Location Exchange
**Backend** broadcasts locations to the ride room:
- Driver sends `driver:location:update:onride` → backend broadcasts as `driver:location` to room
- Rider sends `user:location:update:onride` → backend broadcasts as `user:location` to room

**Driver sees**:
- Rider marker updates in real-time every 1-2 seconds (from `user:location` events)
- OSRM route recalculates every time locations update (new polyline)
- Distance (km) and ETA (minutes) displayed in top-left

**Rider sees** (same):
- Driver marker updates in real-time
- Route polyline and ETA

### Step 4: Driver Arrives (Within 50m)
1. Driver component calculates haversine distance between driver & rider
2. When distance < 50 meters → emits `driver:arrived` event (once)
3. Backend generates random 4-digit OTP, stores in memory, broadcasts to room
4. Driver sees alert: "OTP sent to rider: 1234"
5. Rider sees modal with OTP input field

### Step 5: Rider Confirms OTP
1. Rider enters OTP in the modal
2. Rider clicks Confirm → emits `otp:confirm` with OTP value
3. Backend validates OTP against stored value:
   - ✅ Match: emits `otp:confirmed` with `success: true`, clears OTP
   - ❌ Mismatch: emits `otp:confirmed` with `success: false`
4. Both sides receive confirmation → journey can begin

---

## Console Debugging

### Driver Console Logs
Look for these emoji logs to trace the flow:

**Socket Connection:**
```
🔗 Socket connected globally: socket-id
```

**Room Join:**
```
⏳ Waiting for socket ready and rideId...
✅ Socket connected. Joining ride room: 507f1f77bcf86cd799439011
📍 Emitted ride:join for room: 507f1f77bcf86cd799439011
```

**Location Events:**
```
✅ driver received user:location { lat: 11.234, lng: 75.456 }
route fetched { distance: 2345, duration: 180 }
```

**OTP Flow:**
```
✅ driver:arrived event { rideId: "507f...", otp: "1234" }
✅ otp:confirmed event { rideId: "507f...", success: true }
```

### Backend Console Logs
```
🚗 Client connected: socket-id
🔹 driver (driver@email.com) joined room: ride_507f1f77bcf86cd799439011
🔹 user (user@email.com) joined room: ride_507f1f77bcf86cd799439011
📍 Driver (driver@email.com) in ride 507f1f77bcf86cd799439011: { lat: 11.234, lng: 75.456 }
👤 User (user@email.com) in ride 507f1f77bcf86cd799439011: { lat: 11.235, lng: 75.457 }
🔔 Driver arrived for ride 507f1f77bcf86cd799439011 — OTP sent to room ride_507f1f77bcf86cd799439011
✅ OTP confirmed for ride 507f1f77bcf86cd799439011
```

---

## Troubleshooting

### 1. Driver doesn't see rider location/route
**Check:**
- Backend console: Do you see `👤 User ... in ride ...` logs?
- Driver console: Do you see `✅ driver received user:location` logs?
- Are both driver and rider in the same room? (check room names)
- Is the rider's device sending geolocation? (browser must allow location access)

**Fix:**
- Ensure rider app is on the same ride (rideId matches)
- Verify rider browser permissions allow geolocation
- Check CORS in backend (`origin: "http://localhost:5173"`)
- Add more rider frontend ports to CORS if needed

### 2. Socket not connected
**Check:**
- Browser console: Is `🔗 Socket connected globally:` logged?
- Backend running on 8080?
- Network tab: Is WebSocket connection established?

**Fix:**
- Restart both backend and driver frontend
- Check firewall/network settings
- Verify backend `.env` has correct MONGO_URL

### 3. Route not showing
**Check:**
- Console: Do you see `route fetched { distance: X }` logs?
- Are both locations present? (both markers should show)
- OSRM service online? Try `https://router.project-osrm.org/route/v1/driving/...` in browser

**Fix:**
- Ensure both `driverLocation` and `userLocation` are not null
- Check OSRM response in Network tab
- Verify coordinate format (lat/lng order in OSRM call)

### 4. OTP not working
**Check:**
- Backend console: Do you see `🔔 Driver arrived` and OTP logs?
- Driver console: `✅ driver:arrived event` logged with OTP?
- Rider: OTP modal appears?

**Fix:**
- Ensure distance threshold (50m) is reached
- Check OTP value matches between driver alert and rider input
- Restart app if OTP state is stuck

---

## Key Files Summary

| File | Purpose |
|------|---------|
| `backend/index.js` | Socket.IO server, room management, location broadcasts |
| `driver-frontend/src/context/SocketContext.jsx` | Persistent socket provider (global socket instance) |
| `driver-frontend/src/main.jsx` | Wraps app with SocketProvider |
| `driver-frontend/src/Components/RidingLocation.jsx` | Driver map, location listeners, OSRM routing, OTP display |
| `frontend/src/Components/RidingLocation.jsx` | Rider map, location sender, OTP input modal |
| `frontend/src/Components/Timer.jsx` | Waiting for acceptance, joins room, listens for `ride:accepted` |

---

## Performance Notes

- **Location updates**: Every 1-2 seconds (from geolocation watch)
- **Route calculation**: Every time both locations update (throttle if needed for performance)
- **OTP timeout**: Currently no expiration (implement if desired)
- **Memory**: OTPs stored in-memory; restart server clears all OTPs (use DB for persistence)

---

## Next Steps (Optional Improvements)

1. **Persist OTPs to Database** with TTL (time-to-live)
2. **Update Ride Status** to `in_progress` after OTP confirmation
3. **Implement Completion Flow** (rider confirms drop-off, ride marked `completed`)
4. **Toast Notifications** instead of browser alerts for better UX
5. **Ride History** showing completed rides with distance, fare, duration
6. **Rating/Feedback** after ride completion

---

## Contact
For questions or issues, check the console logs first (use emoji filters) and trace the socket events step-by-step.
