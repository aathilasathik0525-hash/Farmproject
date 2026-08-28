# 🌱 FarmDirect — Direct Farmer-to-Buyer Marketplace & Supply-Chain Coordination Platform

> **Smart India Hackathon Problem Statement SIH26033**  
> *"Multiple intermediaries reduce farmers' earnings and increase consumer prices."*

FarmDirect is a production-oriented, full-stack agricultural marketplace and supply-chain platform designed to eliminate unnecessary intermediary cuts, grant farmers 100% direct price control, offer buyers transparent pricing breakdowns, and coordinate village FPOs, collection centers, and farm-to-gate logistics.

---

## 🚀 Key Features

1. **👨‍🌾 Farmer Direct Pricing (Zero Hidden Deductions)**: Farmers set their own base selling price (e.g. ₹25/kg for tomatoes) which is never compromised by the platform.
2. **🔍 100% Transparent Price Journey**:
   $$\text{Farmer Price (₹25)} + \text{Collection (₹1)} + \text{Packaging (₹2)} + \text{Transport (₹5)} + \text{Platform (₹1)} = \text{Buyer Price (₹34/kg)}$$
3. **📱 Non-Smartphone Dispatch Center**: Automated Voice IVR and SMS notifications in local languages (**தமிழ் / Tamil** and **English**) enabling farmers to confirm harvests with a simple "Press 1".
4. **🏢 Multi-Farmer Collective Aggregation**: Enables village FPOs to aggregate smallholder volumes ($300\text{ kg} + 250\text{ kg} + 200\text{ kg} + 250\text{ kg} = 1000\text{ kg}$) to fulfill commercial bulk orders.
5. **🚚 Live 10-Step Farm-to-Gate Tracking**: Real-time order state machine (`PENDING_FARMER_CONFIRMATION` $\rightarrow$ `FARMER_CONFIRMED` $\rightarrow$ `FPO_ASSIGNED` $\rightarrow$ `COLLECTED` $\rightarrow$ `PACKED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`).
6. **📊 Platform Analytics & Impact Metrics**: Recharts visualizations for farmer payouts vs. buyer spending, regional crop distributions, and 27.5% intermediary cost reductions.
7. **🌍 Large & Export Orders**: Institutional corridor workflow connecting FPOs with phytosanitary documentation (APEDA) and cold-chain port transit.

---

## 🛠️ Architecture & Tech Stack

```
farmdirect/
├── backend/                  # Node.js + Express + Prisma ORM
│   ├── prisma/
│   │   ├── schema.prisma     # Relational Database Schema (SQLite dev / PostgreSQL prod)
│   │   └── seed.js           # Authentic Tamil Nadu Agricultural Seed Data
│   ├── src/
│   │   ├── config/           # Database & JWT configs
│   │   ├── controllers/      # Auth, Product, Order, FPO, Logistics, Farmer, Admin
│   │   ├── middleware/       # JWT Auth, Role-Based Access Control (RBAC), Error Handler
│   │   ├── routes/           # RESTful API Endpoints
│   │   ├── services/
│   │   │   ├── notification/ # SMS & Voice IVR abstraction (Mock / MSG91 / Exotel / Twilio)
│   │   │   ├── payment/      # Payment Gateway abstraction (Mock / Razorpay)
│   │   │   └── storage/      # Image Storage abstraction (Local / Cloudinary / S3)
│   │   └── server.js         # Main Express Server
│   ├── .env
│   ├── .env.example
│   └── package.json
└── frontend/                 # React 18 + Vite
    ├── src/
    │   ├── api/              # Axios Client & Endpoint services
    │   ├── context/          # AuthContext (with 1-Click Role Switcher) & CartContext
    │   ├── components/       # Reusable UI (PriceBreakdownModal, OrderTimeline, NotificationSimulator)
    │   ├── pages/            # Marketplace, Farmer, FPO, Logistics, Admin dashboards
    │   ├── index.css         # Agriculture Design System & Glassmorphism Styles
    │   ├── App.jsx           # Client Router
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🏁 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **npm**: v9+

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
node prisma/seed.js
npm start
```
*Backend runs on `http://localhost:5000`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **👨‍🌾 Farmer** | `farmer@farmdirect.in` | `password123` | Ravi Kumar (Lalgudi, Trichy) |
| **🛒 Buyer** | `buyer@farmdirect.in` | `password123` | Priya Sundaram (Sundaram Organics, Chennai) |
| **🏢 FPO Officer** | `fpo@farmdirect.in` | `password123` | K. Balasubramanian (Trichy FPO) |
| **🚚 Logistics** | `logistics@farmdirect.in` | `password123` | Murugan Transport Logistics (TN-45-AZ-2345) |
| **👑 Admin** | `admin@farmdirect.in` | `password123` | Dr. S. Ramanathan (Platform Admin) |

> **Tip:** You can also use the persistent **Top Demo Banner** to switch between any role in 1 click!

---

## 🎯 3-5 Minute SIH Presentation Flow

1. **Landing Page (`/`)**: Show the problem statement (multiple middlemen eating 69% of value) and the side-by-side **Traditional vs FarmDirect** comparison.
2. **Direct Marketplace (`/marketplace`)**: Search for *Country Tomatoes*. Click **"View Transparent Breakdown"** to show how the ₹34/kg price is computed (₹25 direct to farmer + ₹9 transparent services).
3. **Buyer Order (`/checkout`)**: Add 100 kg to cart, enter Chennai delivery address, and click **Place Order**.
4. **Order Timeline (`/customer/orders/:id`)**: View the live 10-step progress timeline from *Order Placed* to *Delivered*.
5. **Farmer Notification (`/farmer`)**: Switch to **Farmer Demo**. Show the **Non-Smartphone Dispatch Center** with simulated SMS & Voice IVR in **Tamil** and **English**, and confirm harvest availability.
6. **FPO Produce Aggregation (`/fpo/aggregation`)**: Switch to **FPO Demo** to show how a 1,000 kg order is collectively fulfilled across 4 smallholder farmers ($300\text{kg} + 250\text{kg} + 200\text{kg} + 250\text{kg}$).
7. **Logistics & Shipments (`/admin/shipments`)**: Advance shipment status (*At Collection Center* $\rightarrow$ *In Transit* $\rightarrow$ *Delivered*).
8. **Farmer Earnings (`/farmer/earnings`)**: Show itemized math breakdown ($100\text{ kg} \times ₹25 = ₹2,500$) and monthly revenue growth.
9. **Impact Dashboard (`/impact`)**: Present the aggregated impact: 1,250+ Farmers, ₹18.4 Lakh payouts, and 27.5% intermediary savings.

---

## 🌐 Production Deployment Guide

### PostgreSQL Configuration
In `backend/.env`, set:
```env
DATABASE_URL="postgresql://user:password@host:5432/farmdirect?schema=public"
```
Run `npx prisma migrate deploy` followed by `node prisma/seed.js`.

### Service Provider Integrations
- **Payments**: Set `PAYMENT_PROVIDER=razorpay` with `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- **SMS Notifications**: Set `SMS_PROVIDER=msg91` with `MSG91_AUTH_KEY`.
- **Voice/IVR**: Set `VOICE_PROVIDER=exotel` with `EXOTEL_SID` and `EXOTEL_TOKEN`.
- **Image Storage**: Set `STORAGE_PROVIDER=cloudinary` with Cloudinary credentials.
