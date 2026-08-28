# FarmDirect System Architecture & Technical Design

FarmDirect is an end-to-end direct farmer-to-buyer agricultural marketplace and physical supply-chain coordination platform addressing Smart India Hackathon problem statement **SIH26033**.

## 1. High-Level System Architecture

`
                               ┌─────────────────────────────┐
                               │       Client Layer          │
                               │  (React 18 + Vite + CSS)    │
                               └──────────────┬──────────────┘
                                              │ HTTP / JSON
                                              ▼
                               ┌─────────────────────────────┐
                               │     Express API Gateway     │
                               │    (JWT Auth + RBAC + Cwd)  │
                               └──────────────┬──────────────┘
                                              │
             ┌────────────────┬───────────────┼───────────────┬────────────────┐
             ▼                ▼               ▼               ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │  Auth Mod    │ │ Product Mod  │ │  Order Mod   │ │   FPO Mod    │ │Logistics Mod │
     └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
            │                │                │                │                │
            └────────────────┼────────────────┼────────────────┼────────────────┘
                             │                │
                             ▼                ▼
             ┌────────────────────────┐  ┌─────────────────────────────────┐
             │       Prisma ORM       │  │       Notification Service      │
             │   (Data Abstraction)   │  │ (SMS / IVR Tamil & English Log) │
             └──────────────┬─────────┘  └─────────────────────────────────┘
                            │
                            ▼
             ┌────────────────────────┐
             │  PostgreSQL / SQLite   │
             │   (Relational DB)      │
             └────────────────────────┘
`

## 2. Supply-Chain & Cost Breakdown Model

Traditional Multi-tier Intermediary Model:
\text{Farmer (₹10)} \rightarrow \text{Village Agent (₹14)} \rightarrow \text{Mandi APMC Broker (₹20)} \rightarrow \text{Wholesaler (₹26)} \rightarrow \text{Distributor (₹33)} \rightarrow \text{Retailer (₹45)}

FarmDirect 100% Transparent Price Journey:
\text{Farmer (₹25)} + \text{Village Collection (₹1)} + \text{Packaging (₹2)} + \text{Transport (₹5)} + \text{Platform Fee (₹1)} = \text{Buyer (₹34/kg)}

Outcome:
- Farmer earnings increase from ₹10 to ₹25 (+150%).
- Buyer price decreases from ₹45 to ₹34 (-24.4%).

## 3. Non-Smartphone Farmer Dispatch Flow (SMS & Voice IVR)
1. Buyer places order for 100kg Country Tomatoes.
2. System triggers SMS dispatch in Tamil & English:
   - *SMS:* "புதிய ஆர்டர்: 100 கிலோ தக்காளி. விலை கிலோ ₹25. மொத்த வருமானம் ₹2,500. உறுதிப்படுத்த 1 அழுத்தவும்."
   - *IVR Voice Call:* Plays bilingual audio alert with keypad DTMF confirmation ("Press 1 to confirm availability").
3. Farmer confirmation triggers FPO cluster batching.
