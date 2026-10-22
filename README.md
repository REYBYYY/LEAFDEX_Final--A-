# 🍃 LeafDex - Plant Disease Detection & Authentication System

A secure full-stack authentication and role-based access management portal built with React, Vite, Tailwind CSS, and Express.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (version 18 or higher) installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
- **`RESEND_API_KEY`**: (Optional) Add your API key from [Resend](https://resend.com) to send real email verification OTPs. If omitted, OTPs will be simulated in the console.

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Demo & Test Accounts

| Role | Email | Password | Passcode (if required) |
|---|---|---|---|
| **Super Admin** | `superadmin@leafdex.com` | `Admin123!` | `24681012141620` |
| **Admin** | `admin@leafdex.com` | `Admin123!` | `1234567890` |
| **User** | `user@leafdex.com` | `User123!` | N/A |

---

## ✨ Features
- **Authentication & Roles**: Super Admin, Admin, and Standard User access levels.
- **Security & Bot Defense**: Math verification challenges, brute-force lockout protection, and auto-logout timer on inactivity.
- **Remember Me**: Option to remember login credentials.
- **OTP Verification**: Email verification codes for registration.
- **Custom Birthday Picker**: Intuitive Year ➔ Month ➔ Day selection flow.
- **Report Stamp**: Every diagnosis is stamped with the plant's category (Healthy, Pest Activity, Diseased, Stressed) and the exact date and time it was scanned.
- **Recent Scans**: The last 8 identifications are logged per account (name, category, timestamp, thumbnail). Click any entry to reopen its full report. History can be cleared from the panel.

