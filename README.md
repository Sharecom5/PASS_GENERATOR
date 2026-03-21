# 🎟️ Event Pass System — Free Stack

A complete event entry management system built with 100% free tools.

---

## ✅ What's Included

| Module | Route | Description |
|--------|-------|-------------|
| Landing Page | `/` | Home with links to all modules |
| Registration | `/register` | Visitor registers, gets pass by email |
| Pass Recovery | `/getpass` | Forgot pass? Recover via OTP |
| Staff Scanner | `/scan` | Camera QR scanner for entry gate |
| Admin Dashboard | `/admin` | Manage all visitors and passes |

---

## 🛠️ Free Services You Need (No Credit Card)

| Service | Purpose | Sign Up |
|---------|---------|---------|
| MongoDB Atlas | Database | mongodb.com/atlas |
| Resend | Email delivery | resend.com |
| Cloudinary | QR/pass image storage | cloudinary.com |
| Vercel | Hosting | vercel.com |

---

## 🚀 Setup in 15 Minutes

### Step 1 — Clone & Install

```bash
git clone <your-repo>
cd event-pass-system
npm install
```

### Step 2 — Create .env.local

```bash
cp .env.local.example .env.local
```

Fill in each value from the services below.

### Step 3 — MongoDB Atlas (Free)

1. Go to **mongodb.com/atlas** → Create free account
2. Create a **FREE** cluster (M0 Sandbox)
3. Add a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all) for development
5. Click **Connect** → **Drivers** → copy the connection string
6. Paste into `MONGODB_URI` in `.env.local`

### Step 4 — Resend Email (Free)

1. Go to **resend.com** → Create free account
2. Add and verify your domain (or use the test domain)
3. Create an **API Key**
4. Paste into `RESEND_API_KEY`
5. Set `RESEND_FROM_EMAIL` to a verified email/domain

### Step 5 — Cloudinary (Free)

1. Go to **cloudinary.com** → Create free account
2. Go to Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Paste all three into `.env.local`

### Step 6 — Run Locally

```bash
npm run dev
```

Open: http://localhost:3000

### Step 7 — Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
```

When prompted, add all your environment variables.
Or go to **vercel.com** → Import Project → Add env vars in Settings.

---

## 📁 Project Structure

```
event-pass-system/
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── register/page.tsx         ← Registration form
│   ├── getpass/page.tsx          ← Pass recovery (OTP)
│   ├── scan/page.tsx             ← Staff scanner
│   ├── admin/page.tsx            ← Admin dashboard
│   └── api/
│       ├── register/route.ts     ← POST: register visitor
│       ├── recover/route.ts      ← POST: send OTP
│       ├── recover/verify/route.ts ← POST: verify OTP
│       ├── scan/route.ts         ← POST: verify entry
│       ├── admin/route.ts        ← POST: login | GET: stats
│       └── admin/visitors/route.ts ← CRUD visitors
├── components/
│   ├── PassCard.tsx              ← Visual pass card + download
│   └── QRScanner.tsx             ← Camera scanner component
├── lib/
│   ├── mongodb.ts                ← DB connection
│   ├── resend.ts                 ← Email templates
│   ├── qrcode.ts                 ← QR generation
│   ├── cloudinary.ts             ← Image upload
│   ├── jwt.ts                    ← Auth helpers
│   └── utils.ts                  ← Pass ID, OTP generators
├── models/
│   ├── Visitor.ts                ← Visitor schema
│   ├── OTP.ts                    ← OTP with TTL auto-expiry
│   └── ScanLog.ts                ← Scan history
├── .env.local.example
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

```env
MONGODB_URI=                      # From MongoDB Atlas
RESEND_API_KEY=                   # From resend.com
RESEND_FROM_EMAIL=                # Verified sender email
RESEND_FROM_NAME=Event Pass System
CLOUDINARY_CLOUD_NAME=            # From cloudinary.com
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
JWT_SECRET=                       # Any random 32+ char string
STAFF_PIN=1234                    # PIN for scanner access
ADMIN_EMAIL=                      # Your admin login email
ADMIN_PASSWORD=                   # Your admin login password
NEXT_PUBLIC_APP_URL=              # Your deployed URL
NEXT_PUBLIC_EVENT_NAME=           # e.g. TechSummit 2025
NEXT_PUBLIC_EVENT_DATE=           # e.g. 15 December 2025
NEXT_PUBLIC_EVENT_VENUE=          # e.g. Hall A, New Delhi
```

---

## 🔒 Security Notes

- OTPs auto-expire in 10 minutes (MongoDB TTL index)
- Rate limiting: 5 registrations/IP/hour, 3 OTPs/email/hour
- Staff PIN is verified server-side on every scan
- JWT tokens expire in 8 hours
- Pass IDs are cryptographically random (non-guessable)

---

## 📊 Free Tier Limits

| Service | Free Limit | Good For |
|---------|-----------|---------|
| MongoDB Atlas | 512 MB | ~50,000 visitors |
| Resend | 3,000 emails/month | ~100/day |
| Cloudinary | 25 GB storage | Thousands of QR images |
| Vercel | Unlimited deployments | Production ready |

---

## 💡 Pro Tips

1. **Test locally first** — run `npm run dev` and test all 5 pages
2. **Scanner works on mobile** — open `/scan` on your phone
3. **Print QR codes** — generate a QR pointing to `/getpass` for venue displays
4. **Bulk import** — use the Admin → Import CSV feature for pre-registered visitors
5. **WhatsApp** — Integrate Twilio (free trial) later for WhatsApp pass delivery
