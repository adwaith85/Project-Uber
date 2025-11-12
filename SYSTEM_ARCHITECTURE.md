# 📊 System Architecture & Data Flow

## Real-Time Location Tracking System

```
┌─────────────────────────────────────────────────────────────────┐
│                     RIDE ACCEPTANCE FLOW                        │
└─────────────────────────────────────────────────────────────────┘

[RIDER HOME]                              [DRIVER HOME]
     │                                          │
     ├─ Book Ride                               │
     │                                          │
     └──────────────────────────┬───────────────┘
                                │
                         [Backend receives]
                         [Notification sent]
                                │
                    ┌───────────┴───────────┐
                    │                       │
              [Driver sees             [Rider waits]
               notification]                │
                    │                       │
                    ├─ Accept ──────────────┤
                    │                       │
                    ↓                       ↓
            [RidingLocation]        [RidingLocation]
             (DRIVER)                (RIDER)


┌─────────────────────────────────────────────────────────────────┐
│              LOCATION TRACKING ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────┘

DRIVER FRONTEND                  BACKEND                  RIDER FRONTEND
(port 5173)                      (port 8080)              (port 5174)
     │                               │                          │
     ├─ Persistent Socket ──────────┤                          │
     │  (SocketContext)              ├─ Socket.IO Server       │
     │                               │                    ┌─────┘
     │                               │                    │
     │  1. Join room:           2. Room join            │
     │     ride:join            acknowledgment          │
     ├──────────────────────────>                        │
     │                               ├─ Add to room      │
     │                               │                    │
     │                          3. Emit join            │
     │                          to all in room          │
     │<──────────────────────────────────────────────────┤
     │                                                    │
     │  4a. Geolocation watch                            │
     │  every 1-2 seconds                         5. Geolocation watch
     │       │                                    every 1-2 seconds
     │       └─ driver:location                        │
     │         update:onride                           │
     ├──────────────────────────>                        │
     │                          6. Update DB             │
     │                          7. Broadcast to room     │
     │                               user:location ◄────┤
     │<──────────────────────────────                    │
     │  8. Receive &                                     │
     │  Set userLocation state                   9. user:location
     │       │                                   update:onride
     │       └─ Update map marker                        │
     │          Re-calculate route               ├──────────────────>
     │                          10. Update DB
     │                          11. Broadcast to room
     │  driver:location ◄───────
     │  12. Receive &
     │  Set driverLocation state
     │       │
     │       └─ Update map marker
     │          Re-calculate route


┌─────────────────────────────────────────────────────────────────┐
│                    ROOM-BASED MESSAGING                          │
└─────────────────────────────────────────────────────────────────┘

Room Name: ride_<rideId>

Events in Room:
├─ ride:join
│  Purpose: Register socket in room
│  From: Driver, Rider
│  To: Room members
│
├─ driver:location
│  Purpose: Broadcast driver position
│  From: Backend (after receiving driver:location:update:onride)
│  To: Room members
│  Frequency: Every 1-2 seconds
│
├─ user:location
│  Purpose: Broadcast rider position
│  From: Backend (after receiving user:location:update:onride)
│  To: Room members
│  Frequency: Every 1-2 seconds
│
├─ driver:arrived
│  Purpose: Signal driver at pickup location
│  From: Driver (when distance < 50m)
│  Payload: { rideId, email }
│
├─ driver:arrived (response)
│  Purpose: Send OTP to room
│  From: Backend
│  Payload: { rideId, otp: "1234" }
│
├─ otp:confirm
│  Purpose: Rider confirms OTP
│  From: Rider
│  Payload: { rideId, otp: "1234" }
│
└─ otp:confirmed
   Purpose: Confirm OTP was correct
   From: Backend
   Payload: { rideId, success: true }


┌─────────────────────────────────────────────────────────────────┐
│              SOCKET CONNECTION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────────┘

DRIVER FRONTEND:
┌─────────────────────────────┐
│  App Startup (main.jsx)     │
│  ↓                          │
│ <SocketProvider>            │  ← Creates persistent socket once
│  ├─ Creates socket          │    at app startup
│  ├─ Stores in Context       │
│  └─ Auto-reconnect enabled  │
│      ↓                      │
│  Socket persists across     │
│  route navigation           │
│      ↓                      │
│  RidingLocation component   │
│  uses useSocket() hook      │
│  to get same socket         │
└─────────────────────────────┘

RIDER FRONTEND:
┌─────────────────────────────┐
│  RidingLocation component   │
│      ↓                      │
│  Creates new socket in      │  ← Fresh socket per component
│  useEffect                  │
│  ↓                          │
│  Auto-reconnect enabled     │
│  ↓                          │
│  Component unmounts         │
│  → Socket disconnects       │
└─────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    MAP RENDERING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

State Updates:
  ├─ driverLocation = {lat, lng}
  │  ├─ Render: Marker (blue car icon)
  │  └─ Render: CircleMarker (blue circle, radius=5)
  │
  ├─ userLocation = {lat, lng}
  │  ├─ Render: Marker (red person icon)
  │  └─ Render: CircleMarker (red circle, radius=6)
  │
  └─ routeCoords = [[lat,lng], [lat,lng], ...]
     ├─ Trigger: When both driverLocation && userLocation exist
     ├─ Source: OSRM API call
     ├─ Format: Array of [lat, lng] coordinates
     └─ Render: Polyline (blue line, weight=4)


┌─────────────────────────────────────────────────────────────────┐
│                  DISTANCE & ETA CALCULATION                      │
└─────────────────────────────────────────────────────────────────┘

OSRM Route API:
  Input: driver location → user location
  URL: https://router.project-osrm.org/route/v1/driving/
       {start.lng},{start.lat};{end.lng},{end.lat}?geometries=geojson

  Output:
  ├─ route.distance (meters)
  │  └─ Convert to km: distance / 1000
  │  └─ Display: "2.34 km"
  │
  ├─ route.duration (seconds)
  │  └─ Convert to minutes: ceil(duration / 60)
  │  └─ Display: "12 min"
  │
  └─ route.geometry.coordinates
     └─ Reformat to [lat,lng] for Leaflet
     └─ Display: Blue polyline

Trigger Points:
  ├─ Initial: When both locations first available
  ├─ Recurring: After each location update
  ├─ Throttle: Automatic (only recalc when locations change)
  └─ Display: Badge & map overlay


┌─────────────────────────────────────────────────────────────────┐
│                   ARRIVAL DETECTION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

Driver Component:
  ├─ Calculate haversine distance between driver & user
  ├─ Check: distance < 0.05 km (50 meters)?
  │  ├─ YES:
  │  │  └─ Emit: driver:arrived { rideId, email }
  │  │  └─ Set arrivedSent = true (prevent duplicate)
  │  │
  │  └─ NO: Continue monitoring
  │
  └─ Check frequency: Every location update (1-2 seconds)

Backend:
  ├─ Receive: driver:arrived event
  ├─ Generate: Random 4-digit OTP
  ├─ Store: In-memory Map { rideId → "1234" }
  └─ Broadcast: driver:arrived { rideId, otp } to room

Rider Side:
  ├─ Receive: driver:arrived event with OTP
  ├─ Display: OTP confirmation modal
  └─ Wait: For rider input

Rider Input:
  ├─ Enter: OTP "1234"
  ├─ Emit: otp:confirm { rideId, otp }
  │
  Backend:
  ├─ Validate: otpInput === storedOTP
  ├─ Broadcast: otp:confirmed { rideId, success: true }
  │
  Both Sides:
  ├─ Set: journeyStarted = true
  ├─ Update: Badge color (blue)
  └─ Continue: Route tracking to destination


┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

Driver Component State:
  ├─ driverLocation: {lat, lng}
  ├─ userLocation: {lat, lng}
  ├─ routeCoords: [[lat,lng], ...]
  ├─ distance: "2.34"
  ├─ eta: 12
  ├─ rideId: "123456"
  ├─ driverEmail: "driver@example.com"
  ├─ arrivedSent: boolean
  ├─ journeyStarted: boolean
  └─ error: string

Rider Component State:
  ├─ driverLocation: {lat, lng}
  ├─ userLocation: {lat, lng}
  ├─ routeCoords: [[lat,lng], ...]
  ├─ distance: "2.34"
  ├─ eta: 12
  ├─ rideId: "123456"
  ├─ userEmail: "user@example.com"
  ├─ otpReceived: "1234"
  ├─ otpStatus: "pending" | "confirmed" | "failed"
  ├─ otpInput: "1234"
  ├─ journeyStarted: boolean
  └─ userLocation: {lat, lng}


┌─────────────────────────────────────────────────────────────────┐
│              CONSOLE LOGGING HIERARCHY                           │
└─────────────────────────────────────────────────────────────────┘

Emojis Used for Tracing:
  ├─ ✅ Success/Confirmation
  ├─ ❌ Error/Failure
  ├─ 📍 Location data
  ├─ 🚗 Driver/Vehicle
  ├─ 👤 User/Person
  ├─ 🗺️ Route/Map
  ├─ 📢 Broadcasting
  ├─ ⏳ Waiting/Loading
  ├─ 🔗 Connection/Room
  ├─ 🛑 Stopping/Cleanup
  ├─ ⚠️ Warning/Issue
  └─ 📌 State update

Example Log Trace:
  1. ✅ Socket connected
  2. ✅ Emitted ride:join for room: ride_123
  3. 📍 Driver location emitted to server #1
  4. 🗺️ Both locations available, fetching route...
  5. 🌐 Fetching route from OSRM...
  6. ✅ Route fetched successfully
  7. 📌 State updated with route coords
