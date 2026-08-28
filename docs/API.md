# FarmDirect REST API Specification

Base URL: http://localhost:5000/api

## 1. Authentication Endpoints
- POST /api/auth/register — Register User with Role (FARMER, BUYER, FPO, LOGISTICS, ADMIN)
- POST /api/auth/login — Authenticate and receive JWT Bearer token
- GET /api/auth/me — Get authenticated user details and active profile

## 2. Product Catalog Endpoints
- GET /api/products — List all products with category, location and price breakdown
- GET /api/products/:id — Product detail with dynamic transparent cost build-up
- POST /api/products — [FARMER] Create new product listing with custom farmer price
- PUT /api/products/:id — [FARMER] Update produce details and available inventory
- DELETE /api/products/:id — [FARMER] Remove/deactivate product listing

## 3. Order Management Endpoints
- POST /api/orders — [BUYER] Create order with atomic inventory reservation and address
- GET /api/orders — List orders scoped to authenticated role
- GET /api/orders/:id — Complete order timeline with history and shipment details
- PATCH /api/orders/:id/status — State machine transition (e.g. FARMER_CONFIRMED, IN_TRANSIT, DELIVERED)

## 4. FPO & Aggregation Endpoints
- GET /api/fpos — List all active FPO cooperatives and clusters
- GET /api/fpos/:id/farmers — List affiliated farmers and verification statuses
- PATCH /api/fpos/farmers/:id/verify — Toggle farmer verification status badge
- POST /api/fpos/aggregations — Multi-farmer batch allocation for bulk customer orders

## 5. Logistics & Fleet Endpoints
- GET /api/logistics/shipments — View live farm-to-gate shipments
- PATCH /api/logistics/shipments/:id/status — Update transit status (PICKED_UP, IN_TRANSIT, DELIVERED)
- GET /api/logistics/collection-centers — View weighing, sorting and crate packing hubs

## 6. Farmer & Admin Analytics Endpoints
- GET /api/farmers/dashboard — Farmer KPIs, listed crops, and pending harvest confirmations
- GET /api/farmers/earnings — Direct payout log, itemized math, and monthly revenue trends
- GET /api/notifications — SMS and Voice dispatch audit logs
- GET /api/admin/analytics — Platform metrics, intermediary savings, and crop distribution
