# FarmDirect Installation & Setup Guide

## 1. Prerequisites
- **Node.js**: v18 or higher (tested on Node v24)
- **npm**: v9 or higher
- **PostgreSQL** (Optional for production; SQLite included for immediate local execution)

## 2. Quick One-Click Windows Startup
Simply double-click:
`at
C:\Users\vighashini\Desktop\FARMDirect\start-dev.bat
`
This automatically launches both backend and frontend in separate command windows.

## 3. Manual Terminal Startup

### Backend Setup:
`ash
cd C:\Users\vighashini\Desktop\FARMDirect\backend
npm install
npx prisma db push
node prisma/seed.js
npm run dev
`
Backend API will be live at http://localhost:5000/api.

### Frontend Setup:
`ash
cd C:\Users\vighashini\Desktop\FARMDirect\frontend
npm install
npm run dev
`
Frontend web app will be live at http://localhost:5173.

## 4. Production PostgreSQL Migration
To use PostgreSQL:
1. Update DATABASE_URL in ackend/.env with your PostgreSQL connection string:
   `nv
   DATABASE_URL="postgresql://username:password@localhost:5432/farmdirect?schema=public"
   `
2. Run database migration and seed:
   `ash
   cd backend
   npx prisma db push
   node prisma/seed.js
   `
