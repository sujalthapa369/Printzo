# 🖨️ Printzo — Privacy-Focused Smart Printing Platform

A full-stack web application built with **React + Vite**, **Firebase**, and **Google Gemini AI**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | Firebase Authentication (Email + Google OAuth) |
| Database | Firestore (real-time) |
| File Storage | Firebase Storage |
| AI | Google Gemini 1.5 Flash |
| QR Codes | api.qrserver.com (free, no key needed) |

---

## 📁 Project Structure

```
printzo/
├── src/
│   ├── firebase/
│   │   ├── config.js          # Firebase initialization
│   │   ├── auth.js            # Auth functions
│   │   ├── db.js              # All Firestore operations
│   │   └── storage.js         # File upload/delete
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── FileUpload.jsx     # Drag & drop upload
│   │   ├── PaymentModal.jsx   # UPI/Cash/Wallet payment
│   │   ├── TokenCard.jsx      # Live token tracking
│   │   ├── QRCodeDisplay.jsx  # Shop QR generator
│   │   ├── JobCard.jsx        # Retailer job management
│   │   ├── AIDocGenerator.jsx # Gemini AI document generator
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Landing.jsx        # Marketing homepage
│   │   ├── Auth.jsx           # Login / Signup
│   │   ├── ShopPage.jsx       # QR scan destination
│   │   ├── CustomerPortal.jsx # Customer dashboard
│   │   ├── RetailerDashboard.jsx # Retailer dashboard
│   │   └── ShopsPage.jsx      # Shop discovery
│   └── utils/
│       ├── gemini.js          # Gemini AI integration
│       └── helpers.js         # Utilities
├── firestore.rules            # Security rules
├── storage.rules              # Storage security
├── firebase.json              # Firebase config
└── firestore.indexes.json     # Required DB indexes
```

---

## ⚙️ Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo>
cd printzo
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (e.g. "printzo")
3. Enable the following services:
   - **Authentication** → Sign-in methods → Enable **Email/Password** and **Google**
   - **Firestore Database** → Create in production mode
   - **Storage** → Create bucket
4. Go to **Project Settings → Your Apps → Add Web App**
5. Copy your Firebase config

### 3. Create `.env` File

```bash
cp .env.example .env
```

Fill in your values:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_GEMINI_API_KEY=AIza...
```

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to `.env` as `VITE_GEMINI_API_KEY`

### 5. Deploy Firebase Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 6. Run Development Server

```bash
npm run dev
```

---

## 🏗️ Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## 📊 Firestore Data Model

```
users/{uid}
  name, email, role (customer|retailer), wallet, shopId, subscription, createdAt

shops/{shopId}
  ownerId, name, address, city, upiId, phone, status, rating, totalJobs, tokenCounter

printers/{printerId}
  shopId, name, connectionType (usb|wifi|bluetooth), supportsColor
  priceBW, priceColor, instantMultiplier, status (online|offline)

printJobs/{jobId}
  shopId, shopName, customerId, customerName
  fileName, fileUrl, filePath, pages
  mode (bw|color), isInstant, amount, paymentMethod (upi|cash|wallet)
  status (pending|printing|completed|cancelled)
  tokenNumber, printerId, printerName, createdAt

walletTransactions/{txId}
  userId, type (topup|debit), amount, createdAt
```

---

## 🔐 Security Features

- **Files auto-deleted** after printing is confirmed
- **No phone number exchange** between customer and retailer
- **Firestore rules** ensure users only access their own data
- **Storage rules** limit file access to the owner
- **Transactions** used for atomic wallet operations and token counter

---

## 🗺️ User Flows

### Customer Flow
1. Scan QR at shop → `/shop/:shopId`
2. Upload document (PDF/JPG/PNG/DOC/XLSX)
3. Configure pages, B&W/Color, instant toggle
4. See auto-calculated cost
5. Choose payment: UPI / Cash / Wallet
6. Get token number → track real-time status

### Retailer Flow
1. Sign up as retailer → `/retailer`
2. Create shop profile (name, address, UPI ID)
3. Add printers with pricing
4. Download/display QR code at counter
5. See live job queue → start printing → mark complete
6. File auto-deleted on completion

---

## 💡 Notes

- **UPI payment** in demo mode is manual confirmation. Integrate [Razorpay](https://razorpay.com) or [Cashfree](https://cashfree.com) for production.
- **Page count** is estimated client-side. For precise PDF page count, use PDF.js: `npm install pdfjs-dist`
- **Wallet top-up** is simulated. Connect a payment gateway for real money.
- The **AI Document Generator** requires an active ₹39 subscription deducted from wallet.

---

## 🛠️ Suggested Next Steps

- [ ] Integrate Razorpay for real UPI payments
- [ ] Add PDF.js for accurate page counting + preview
- [ ] Implement push notifications (FCM) for job status updates
- [ ] Add Google Maps integration for shop discovery
- [ ] Build mobile app with React Native + Expo
- [ ] Add ESP32 QR display firmware

---

Built with ❤️ for the Printzo project.
