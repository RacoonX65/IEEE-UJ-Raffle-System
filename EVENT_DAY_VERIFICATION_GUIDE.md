# 🎯 IEEE UJ Raffle - Event Day Verification Guide

## 🚀 **Quick Start for Event Day**

### **Before the Event (Setup)**
1. **Download Offline Data** - Visit `/event-verification` and click "Download Data"
2. **Test QR Scanner** - Ensure camera permissions are granted
3. **Print Backup List** - Export CSV of all tickets as backup
4. **Add Verification Columns** to Google Sheet:
   - Column J: `Verified` (TRUE/FALSE)
   - Column K: `VerifiedAt` (timestamp)
   - Column L: `VerifiedBy` (staff email)

### **During the Event (Verification)**

#### **🔍 Multiple Verification Methods:**

1. **📱 QR Code Scanner** (Primary)
   - Fast and secure
   - Works with phone cameras
   - Instant verification

2. **🔍 Manual Search** (Backup)
   - Search by ticket number, name, or email
   - Good for damaged QR codes
   - Manual verification button

3. **💾 Offline Mode** (Emergency)
   - Works without internet
   - Syncs when connection returns
   - Export logs for backup

## 🛡️ **Security Features**

### **Anti-Fraud Protection:**
- ✅ **Cryptographic QR Codes** - HMAC-SHA256 signatures
- ✅ **Payment Verification** - Only verified payments allowed entry
- ✅ **Duplicate Prevention** - Cannot verify same ticket twice
- ✅ **Real-time Tracking** - Live verification statistics
- ✅ **Audit Trail** - Who verified what and when

### **Verification Checks:**
1. **Ticket Exists** - Valid ticket number in database
2. **Payment Verified** - Payment status = "VERIFIED"
3. **Not Already Used** - Ticket not previously verified
4. **Valid Signature** - QR code cryptographically valid

## 📊 **Live Dashboard Features**

### **Real-time Statistics:**
- Total tickets sold
- Tickets verified (with percentage)
- Pending verifications
- Live progress tracking

### **Staff Management:**
- Multiple staff can verify simultaneously
- Each verification logged with staff email
- Last verification display for confirmation

## 🔧 **Troubleshooting**

### **Common Issues & Solutions:**

| Issue | Solution |
|-------|----------|
| QR won't scan | Use manual verification |
| Internet down | Switch to offline mode |
| Payment not verified | Check with finance team |
| Duplicate ticket | Check verification log |
| Camera not working | Use manual search |

### **Emergency Procedures:**

1. **Internet Failure:**
   - Switch to offline mode
   - Continue verifying normally
   - Sync when connection returns

2. **QR Code Issues:**
   - Use manual verification
   - Cross-reference with printed list
   - Contact admin for confirmation

3. **Disputed Tickets:**
   - Check payment status in dashboard
   - Verify with seller contact info
   - Escalate to event coordinator

## 📱 **Mobile Optimization**

- **Responsive Design** - Works on phones/tablets
- **Touch-Friendly** - Large buttons for easy tapping
- **Fast Loading** - Optimized for mobile networks
- **Offline Support** - Works without internet

## 🎯 **Best Practices**

### **For Event Staff:**
1. **Pre-download** offline data before event starts
2. **Test camera** permissions on your device
3. **Keep backup** printed ticket list handy
4. **Verify payment status** before admitting entry
5. **Log any issues** for post-event review

### **For Event Coordinators:**
1. **Monitor dashboard** for real-time statistics
2. **Check sync status** if using offline mode
3. **Export verification logs** after event
4. **Review any disputed entries**
5. **Backup all data** post-event

## 🔗 **Quick Access URLs**

- **Event Verification Dashboard:** `/event-verification`
- **Main Admin Dashboard:** `/dashboard`
- **QR Verification:** `/verify/[token]`

## 📞 **Emergency Contacts**

- **Technical Support:** [Your contact info]
- **Event Coordinator:** [Coordinator contact]
- **Finance Team:** [Finance contact for payment disputes]

---

## ✅ **Pre-Event Checklist**

- [ ] Google Sheet has verification columns (J, K, L)
- [ ] Offline data downloaded to all devices
- [ ] QR scanner tested on all devices
- [ ] Backup ticket list printed
- [ ] Staff trained on verification process
- [ ] Emergency procedures reviewed
- [ ] Contact information distributed

---

**🎉 Your IEEE UJ Raffle verification system is now bulletproof and ready for event day!**
