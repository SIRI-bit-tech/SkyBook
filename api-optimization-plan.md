📋 REST API Optimization Checklist for SkyBook
🎯 Phase 1: Query Parameter Controls (High Impact, Easy)
1.1 Add include Parameter for Selective Population
Files to modify:

app/api/bookings/[id]/route.ts
app/api/flights/[id]/route.ts
app/api/bookings/user/route.ts
What to do:

Parse ?include=flight,airline,passengers query parameter
Conditionally populate based on requested includes
Support nested includes: ?include=flight.airline,flight.airports
Example:

GET /api/bookings/123?include=flight,passengers
GET /api/bookings/123?include=flight.airline
GET /api/bookings/123 (no population, just IDs)
1.2 Add fields Parameter for Field Selection
Files to modify:

All GET endpoints in app/api/*
What to do:

Parse ?fields=bookingReference,status,totalPrice query parameter
Use Mongoose .select() to return only requested fields
Reduce payload size significantly
Example:

GET /api/flights?fields=flightNumber,departure,arrival,price
GET /api/bookings?fields=bookingReference,status
1.3 Add expand Parameter for Embedded Data
Files to modify:

app/api/bookings/[id]/route.ts
app/api/flights/[id]/route.ts
What to do:

Similar to include but returns full embedded objects
Useful for mobile apps that need everything in one call
Example:

GET /api/bookings/123?expand=true (returns everything)
GET /api/bookings/123?expand=false (minimal data)
🚀 Phase 2: Composite/Aggregation Endpoints (Medium Impact, Medium Effort)
2.1 Create Booking Confirmation Endpoint
New file: app/api/booking-confirmation/[id]/route.ts

What to include:

Full booking details
Complete flight information
Airline data
All passengers
Payment status
QR code
Everything needed for confirmation page in ONE request
Benefits:

Confirmation page loads with 1 request instead of 3-4
Optimized database query
Faster page load
2.2 Create User Dashboard Endpoint
New file: app/api/dashboard/user/route.ts

What to include:

User profile
All upcoming bookings (with flight summaries)
Past bookings count
Saved passengers
Payment methods
Everything for dashboard in ONE request
Benefits:

Dashboard loads instantly
Single optimized query
Better UX
2.3 Create Flight Details Endpoint
New file: app/api/flight-details/[id]/route.ts

What to include:

Flight information
Full airline details (logo, name, rating)
Departure airport (name, city, timezone)
Arrival airport (name, city, timezone)
Available seats
Price breakdown
Everything for flight details page
Benefits:

Flight details page loads with 1 request
No waterfall requests
Faster rendering
2.4 Create Search Results Endpoint (Enhanced)
Modify: app/api/flights/search/route.ts

What to add:

Include airline logos and names by default
Include airport names and cities
Pre-calculate duration in readable format
Add price comparison data
Return fully hydrated results
Benefits:

Search results render immediately
No additional requests for airline/airport data
Better performance
⚡ Phase 3: Performance Optimizations (High Impact, Medium Effort)
3.1 Implement Server-Side Caching
New file: lib/cache.ts

What to cache:

Airlines data (rarely changes) - Cache for 24 hours
Airports data (static) - Cache for 7 days
Flight search results - Cache for 5 minutes
User bookings - Cache for 1 minute
Technology options:

Redis (recommended for production)
Node-cache (simple, in-memory)
Next.js unstable_cache
Files to modify:

app/api/airlines/route.ts
app/api/airports/search/route.ts
app/api/flights/search/route.ts
3.2 Add Database Indexing
File to modify: models/*.ts (all models)

Indexes to add:

Booking: bookingReference, user, status
Flight: flightNumber, departure.time, arrival.time
User: email
Airline: code, isActive
Benefits:

Faster database queries
Better search performance
Reduced query time from 500ms to 50ms
3.3 Implement Pagination
Files to modify:

app/api/bookings/user/route.ts
app/api/flights/search/route.ts
What to add:

?page=1&limit=20 query parameters
Return total count
Return pagination metadata
Example response:

{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
3.4 Add Response Compression
File to modify: next.config.mjs

What to do:

Enable gzip/brotli compression
Reduce response size by 70-80%
Faster data transfer
🔍 Phase 4: Advanced Features (Low Priority, High Effort)
4.1 Implement Batch Endpoint
New file: app/api/batch/route.ts

What it does:

Accept multiple API requests in one HTTP call
Execute them in parallel
Return all results together
Example:

POST /api/batch
{
  "requests": [
    { "url": "/flights/123" },
    { "url": "/airlines/AA" },
    { "url": "/bookings/456" }
  ]
}
4.2 Add Real-Time Updates (WebSockets)
New file: app/api/ws/route.ts

What to implement:

WebSocket connection for live updates
Real-time flight status changes
Live seat availability
Booking status updates
Use cases:

Flight tracking page
Seat selection (show when others book)
Price changes during search
4.3 Implement GraphQL Layer (Optional)
New files:

app/api/graphql/route.ts
lib/graphql/schema.ts
lib/graphql/resolvers.ts
What to do:

Add GraphQL as an ALTERNATIVE to REST (not replacement)
Keep REST endpoints for external integrations
Use GraphQL for complex client queries
Best of both worlds
📊 Phase 5: Monitoring & Analytics (Important)
5.1 Add API Response Time Logging
New file: lib/middleware/logger.ts

What to track:

Response times for each endpoint
Slow queries (>500ms)
Error rates
Most called endpoints
5.2 Implement Rate Limiting
New file: lib/middleware/rate-limit.ts

What to do:

Limit requests per IP/user
Prevent abuse
Protect Amadeus API quota
Limits:

Anonymous: 100 requests/hour
Authenticated: 1000 requests/hour
Admin: Unlimited
5.3 Add Error Tracking
Integration: Sentry or similar

What to track:

API errors
Database errors
External API failures (Amadeus, Stripe)
Performance issues
🎯 Implementation Priority Order
Do First (Quick Wins):
✅ Add include parameter (Phase 1.1)
✅ Add fields parameter (Phase 1.2)
✅ Create booking confirmation endpoint (Phase 2.1)
✅ Implement basic caching for airlines/airports (Phase 3.1)
Do Second (High Impact):
✅ Create user dashboard endpoint (Phase 2.2)
✅ Add database indexes (Phase 3.2)
✅ Implement pagination (Phase 3.3)
✅ Create flight details endpoint (Phase 2.3)
Do Third (Nice to Have):
✅ Add response compression (Phase 3.4)
✅ Implement rate limiting (Phase 5.2)
✅ Add API logging (Phase 5.1)
Do Later (Advanced):
⏳ Batch endpoint (Phase 4.1)
⏳ WebSocket real-time updates (Phase 4.2)
⏳ Error tracking integration (Phase 5.3)
⏳ GraphQL layer (Phase 4.3) - Only if really needed
📈 Expected Performance Improvements
Before Optimization:

Booking confirmation page: 3-4 requests, 1.5s load time
Dashboard: 5-6 requests, 2s load time
Flight search: 1 request, 800ms response time
After Phase 1 & 2:

Booking confirmation page: 1 request, 400ms load time ⚡
Dashboard: 1 request, 500ms load time ⚡
Flight search: 1 request, 300ms response time ⚡
After Phase 3 (with caching):

Booking confirmation page: 1 request, 200ms load time 🚀
Dashboard: 1 request, 150ms load time 🚀
Flight search: 1 request, 100ms response time 🚀
💾 Save This Checklist
You can copy this entire document and save it as:

docs/api-optimization-plan.md
Or keep it in your notes
Or create GitHub issues for each phase
When you're ready to implement, just work through the phases in order! Each optimization is independent, so you can do them one at a time without breaking existing functionality.