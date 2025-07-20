# 🚀 Vercel Deployment Guide - IEEE UJ Raffle System

## 📋 **Required Environment Variables for Vercel**

When deploying to Vercel, you need to add these environment variables in your Vercel dashboard:

### **🔐 NextAuth Configuration**
```
NEXTAUTH_URL=https://your-vercel-app-name.vercel.app
NEXTAUTH_SECRET=[Generate a secure random string]
```

### **🔑 Google OAuth (Admin Login)**
```
GOOGLE_CLIENT_ID=[Your OAuth Client ID from Google Cloud Console]
GOOGLE_CLIENT_SECRET=[Your OAuth Client Secret from Google Cloud Console]
```

### **📊 Google Sheets Integration**
```
GOOGLE_SHEETS_SPREADSHEET_ID=[Your Google Sheets ID]
GOOGLE_SERVICE_ACCOUNT_EMAIL=[Your service account email]
```

> **⚠️ IMPORTANT:** For the `GOOGLE_PRIVATE_KEY`, add it in Vercel without any formatting changes. Do not remove newlines or quotes. Vercel handles this correctly.

### **👥 Admin Access Control**
```
ADMIN_EMAILS=[comma,separated,admin,emails]
```

### **🔒 QR Code Security**
```
QR_CODE_BASE_URL=https://your-vercel-app-name.vercel.app/verify
TICKET_VERIFICATION_SECRET=[Generate a secure random string]
```

### **📧 Email Notifications (Brevo/Sendinblue)**
```
BREVO_API_KEY=[Your Brevo API Key]
EMAIL_FROM_NAME=IEEE UJ Raffle System
EMAIL_FROM_ADDRESS=noreply@ieee-uj.org
```

## 🚀 **Step-by-Step Vercel Deployment**

### **1. Connect GitHub Repository**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Import `RacoonX65/IEEE-UJ-Raffle-System`

### **2. Configure Project Settings**
- **Framework Preset:** Next.js
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)

### **3. Add Environment Variables**
1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Add each variable:
   - **Key:** Variable name (e.g., `NEXTAUTH_URL`)
   - **Value:** Your corresponding value
   - **Environment:** Production, Preview, Development (select all)

### **4. Notes for Environment Variables**

#### **NEXTAUTH_URL**
- **Local:** `http://localhost:3000`
- **Vercel:** `https://your-vercel-app-name.vercel.app`
- ⚠️ Must match your actual Vercel deployment URL.

#### **GOOGLE_PRIVATE_KEY**
- **SECURITY WARNING:** Never paste your private key directly into documentation, GitHub issues, or chat platforms
- Enter it directly in Vercel's environment variables section
- Vercel automatically handles the formatting

#### **QR_CODE_BASE_URL**
- Local: `http://localhost:3000/verify`
- Vercel: `https://your-vercel-app-name.vercel.app/verify`

### **5. Google OAuth Settings**
After deployment, update Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth client
4. Add redirect URI: `https://your-vercel-app-name.vercel.app/api/auth/callback/google`

## ✅ **Deployment Checklist**
- [ ] All env variables added to Vercel
- [ ] `NEXTAUTH_URL` matches your Vercel URL
- [ ] QR code URL configured correctly
- [ ] Google Sheet shared with service account
- [ ] Google OAuth redirect URI updated
- [ ] Admin emails added
- [ ] Tested deployment + email
- [ ] Ticket creation and verification functional

## 🔧 **Troubleshooting**

### **Invalid Redirect URI**
- ✅ Fix: Make sure it's correctly added to Google Cloud Console.

### **Google Sheets: Permission Denied**
- ✅ Fix: Share the Sheet with the service account email.

### **Missing Environment Variables**
- ✅ Fix: Double-check Vercel → Settings → Environment Variables.

### **QR Code Invalid**
- ✅ Fix: Check that `QR_CODE_BASE_URL` matches deployed URL.

## 🎉 **After Deployment**
1. Test login, ticket creation, and QR code scanning.
2. Share the app link for feedback.
3. Monitor usage or errors in Vercel dashboard.

> Final URL: `https://your-vercel-app-name.vercel.app`
