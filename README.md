# 🎟️ IEEE UJ Raffle Ticketing System

A comprehensive digital ticketing system for in-person raffle sales, built with Next.js and integrated with Google Workspace tools.

## 🚀 Features

### 📱 Digital Ticket Sales (In-Person)
- **Google Forms Integration**: Team members use a shared form to capture buyer information
- **Real-time Data Collection**: Automatic storage in Google Sheets
- **Payment Tracking**: Support for Cash and Yoco payments
- **Seller Attribution**: Track which team member sold each ticket

### 🎫 Automatic Ticket Generation
- **PDF Tickets**: Auto-generated from Google Docs template
- **Email Delivery**: Instant ticket delivery via Gmail
- **Unique Ticket Numbers**: Sequential numbering system
- **Professional Branding**: Customizable ticket design

### 🔐 Secure Admin Dashboard
- **Google OAuth**: Restricted access to authorized emails only
- **Real-time Statistics**: Live ticket sales data
- **Seller Performance**: Individual seller tracking
- **Data Export**: CSV export functionality
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Google Sheets API
- **Deployment**: Vercel (recommended)
- **Email**: Gmail API via Autocrat

## 📋 Prerequisites

- Node.js 18+ and npm
- Google account with Workspace access
- Google Cloud Project with APIs enabled
- Vercel account (for deployment)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ieee-uj-raffle-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (for admin dashboard)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Sheets Integration
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="REMOVED-PRIVATE-KEY-SECTION\n...\nREMOVED-PRIVATE-KEY-SECTION\n"

# Admin Access Control
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Google Services Setup

See [SETUP.md](./SETUP.md) for detailed instructions on:
- Creating Google Forms
- Setting up Google Sheets
- Configuring Autocrat for ticket generation
- Google Cloud Project setup
- Service Account creation

## 📊 Dashboard Features

### Statistics Overview
- **Total Tickets Sold**: Real-time count
- **Revenue Tracking**: Total amount collected
- **Active Sellers**: Number of team members selling

### Seller Performance
- Individual ticket counts per seller
- Visual performance bars
- Leaderboard ranking

### Recent Activity
- Latest ticket sales
- Buyer information
- Payment method tracking

### Data Management
- Complete ticket entries table
- Search and filter capabilities
- CSV export for external analysis

## 🔒 Security Features

- **Email-based Access Control**: Only pre-approved emails can access admin dashboard
- **Google OAuth Integration**: Secure authentication flow
- **Environment Variable Protection**: Sensitive data stored securely
- **API Route Protection**: Server-side authentication checks

## 📱 Usage

### For Team Members (Sellers)
1. Access the shared Google Form
2. Fill out buyer information during sales
3. Submit form - ticket automatically generated and emailed

### For Administrators
1. Visit the admin dashboard
2. Sign in with authorized Google account
3. Monitor real-time sales data
4. Export data for reporting

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import project from GitHub
   - Configure environment variables
   - Deploy

3. **Update OAuth Settings**
   - Add production domain to Google OAuth settings
   - Update `NEXTAUTH_URL` environment variable

## 🔧 Development

### Project Structure
```
src/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Admin dashboard
│   └── page.tsx       # Landing page
├── components/        # Reusable components
└── lib/              # Utility functions
    ├── auth.ts       # NextAuth configuration
    └── sheets.ts     # Google Sheets integration
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For setup help and troubleshooting:

1. Check [SETUP.md](./SETUP.md) for detailed configuration instructions
2. Review environment variable configuration
3. Verify Google API permissions and quotas
4. Check Google Cloud Console logs for errors

## 🔮 Future Enhancements

- [ ] WhatsApp integration for ticket delivery
- [ ] QR code generation for ticket verification
- [ ] Advanced analytics and reporting
- [ ] Mobile app for ticket sellers
- [ ] Payment processor integration
- [ ] Ticket status management (pending/approved)
- [ ] Bulk operations for ticket management

---

**Built with ❤️ for IEEE University of Johannesburg**
