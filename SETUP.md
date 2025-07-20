# IEEE UJ Raffle System Setup Guide

## Overview
This guide will help you set up the complete IEEE UJ Raffle Ticketing System with Google integration.

## Prerequisites
- Google account with access to Google Forms, Sheets, Docs, and Gmail
- Vercel account for deployment (optional)
- Basic understanding of Google Workspace tools

## Step 1: Create Google Form for Ticket Sales

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form titled "IEEE UJ Raffle Ticket Sales"
3. Add the following fields:

### Form Fields:
- **Full Name** (Short answer, Required)
- **Email Address** (Short answer, Required, Email validation)
- **WhatsApp Number** (Short answer, Required)
- **Payment Method** (Multiple choice, Required)
  - Options: Cash, Yoco
- **Seller Name** (Dropdown, Required)
  - Options: Judas, Adore, Sino, Andani, [Add other team members]
- **Consent to receive email** (Multiple choice, Required)
  - Options: Yes, No

### Form Settings:
- Enable "Collect email addresses"
- Enable "Response receipts" if desired
- Set up response destination to Google Sheets

## Step 2: Set Up Google Sheet

1. When creating the form, choose "Create a new spreadsheet" for responses
2. Name the spreadsheet "IEEE UJ Raffle Tickets"
3. The sheet will automatically populate with columns matching your form fields
4. Note down the Spreadsheet ID from the URL (the long string between `/d/` and `/edit`)

### Expected Sheet Structure:
| Timestamp | Email Address | Full Name | Email Address | WhatsApp Number | Payment Method | Seller Name | Consent to receive email |

## Step 3: Create Google Docs Ticket Template

1. Go to [Google Docs](https://docs.google.com)
2. Create a new document titled "IEEE UJ Raffle Ticket Template"
3. Design your ticket template with the following merge fields:

```
🎟️ IEEE UJ RAFFLE TICKET

Ticket #: <<Ticket Number>>
Event: IEEE UJ Raffle Draw
Date: [Event Date]

BUYER INFORMATION:
Name: <<Full Name>>
Email: <<Email Address>>
WhatsApp: <<WhatsApp Number>>

PURCHASE DETAILS:
Payment Method: <<Payment Method>>
Sold by: <<Seller Name>>
Purchase Date: <<Timestamp>>

Terms & Conditions:
- This ticket is non-refundable
- Must be present at draw to win
- Valid ID required for prize collection

IEEE University of Johannesburg
Contact: [Your contact information]
```

## Step 4: Install and Configure Autocrat

1. In your Google Sheet, go to Extensions → Add-ons → Get add-ons
2. Search for "Autocrat" and install it
3. Configure Autocrat:
   - Choose your Google Docs template
   - Map the merge fields to sheet columns
   - Set up email delivery to the "Email Address" column
   - Enable automatic trigger on form submission

### Autocrat Configuration:
- **Template**: Select your ticket template document
- **Sheet**: Select the responses sheet
- **Merge Fields**: Map each <<field>> to the corresponding column
- **Email Settings**: 
  - To: Email Address column
  - Subject: "Your IEEE UJ Raffle Ticket - Ticket #<<Ticket Number>>"
  - Attachment: PDF of the merged document

## Step 5: Set Up Google Cloud Project & Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create new service account
   - Download the JSON key file
5. Share your Google Sheet with the service account email (Editor access)

## Step 6: Configure Environment Variables

Update your `.env.local` file with the following:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-in-production

# Google OAuth Configuration (for admin dashboard)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id-from-step-2
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY="your-private-key-from-json-file"

# Admin Email Addresses (comma-separated)
ADMIN_EMAILS=judas@example.com,adore@example.com,sino@example.com,andani@example.com
```

### Getting Google OAuth Credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

## Step 7: Test the System

1. **Test Form Submission**:
   - Fill out your Google Form
   - Verify data appears in Google Sheet
   - Check if Autocrat generates and emails the ticket

2. **Test Admin Dashboard**:
   - Run `npm run dev`
   - Navigate to `http://localhost:3000`
   - Sign in with authorized Google account
   - Verify dashboard displays ticket data

## Step 8: Deploy to Production

### Deploy to Vercel:
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Update `NEXTAUTH_URL` to your production domain
5. Update Google OAuth redirect URI to production domain

## Usage Instructions

### For Team Members (Ticket Sellers):
1. Access the Google Form on mobile/tablet
2. Fill out buyer information for each ticket sale
3. Submit form - ticket will be automatically generated and emailed

### For Administrators:
1. Access admin dashboard at your domain
2. Monitor real-time sales statistics
3. Track individual seller performance
4. Export data as CSV for record keeping

## Troubleshooting

### Common Issues:
1. **Autocrat not triggering**: Check trigger settings and permissions
2. **Dashboard not loading data**: Verify service account permissions and spreadsheet ID
3. **Authentication errors**: Check OAuth credentials and authorized domains
4. **Email delivery issues**: Verify Gmail API permissions and sender settings

### Support:
- Check Google Workspace status page for service issues
- Verify all API quotas and limits
- Review Google Cloud Console logs for errors

## Security Notes

- Keep service account JSON file secure
- Regularly rotate OAuth secrets
- Monitor admin access logs
- Use HTTPS in production
- Restrict admin email list to authorized personnel only

## Future Enhancements

- WhatsApp integration for ticket delivery
- QR code generation for ticket verification
- Advanced analytics and reporting
- Mobile app for ticket sellers
- Integration with payment processors
