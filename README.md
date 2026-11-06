# Stock Track PRO

A comprehensive asset, equipment, and fleet management solution that helps businesses track and manage their valuable resources efficiently.

<!-- Deployment trigger -->

Visit our website: [www.stocktrackpro.co.uk](https://www.stocktrackpro.co.uk)

## Core Capabilities

### Asset & Equipment Management
- QR Code Scanning - Instant check-in/out of assets and equipment
- Real-Time Tracking - See availability status of all assets
- User Accountability - Track who has each item
- Condition Monitoring - Flag items for quarantine or removal
- Location Management - Organise assets across multiple sites
- Detailed History - Complete audit trail of usage and condition

### Fleet Management System
- Vehicle Inspections - 6-photo comprehensive vehicle checks
- Defect Reporting - Report issues with severity levels and descriptions
- Fleet Dashboard - Monitor vehicle status and maintenance needs
- Manager Notifications - Instant alerts for reported defects
- Vehicle Assignment - Track team member assignments
- Inspection History - Complete records with photos and details

### User Management
- Role-Based Access - Different permission levels (Manager, User)
- Team Management - Add team members with access codes and remove with user management dashboard

## Features

- Real-time asset and vehicle tracking with QR codes
- Asset and vehicle condition monitoring
- Location tracking across multiple sites
- Vehicle inspections with photo documentation
- Defect reporting and management notifications
- Mobile app for iOS and Android
- Complete audit trail and history tracking
- Role-based access controls and team management
- Enterprise-grade security with Firebase authentication

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/chadg90/stocktrackpro.git
```

2. Install dependencies:
```bash
cd stocktrackpro
npm install
```

3. Create a `.env.local` file with the following variables:
```
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=your_from_email
CONTACT_EMAIL=your_contact_email
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Analytics (GA4)

Marketing pages load Google Analytics 4 (`NEXT_PUBLIC_GA_ID`, currently `G-JBYSKP5L0B`) with Consent Mode v2. Events only send when the visitor has granted analytics consent.

Conversion helpers live in `src/lib/analytics.ts` (`track()`). Key client events:

| Event | When |
| --- | --- |
| `begin_signup` | Onboarding account step shown |
| `sign_up` | Company created (once per browser session) |
| `generate_lead` | Contact form success response |
| `click_whatsapp` | Click on a `wa.me` marketing link |
| `click_app_store` | Click on an App Store badge/link |

**GA4 Admin (manual):** mark `sign_up` and `generate_lead` as key events in GA4 Admin → Events. This cannot be done in code.

Do not send names, emails, phone numbers, company names, user IDs, referral codes, or free text. Dashboard routes do not load gtag or fire these events.

## Deployment

This project is deployed using Firebase App Hosting (see `apphosting.yaml`). Legacy notes below may still mention Vercel.

To deploy your own instance:

1. Fork this repository
2. Sign up for a [Vercel account](https://vercel.com)
3. Import your forked repository
4. Configure your environment variables in Vercel
5. Deploy!

## Contact

For inquiries and demos, please contact:
- Email: support@stocktrackpro.co.uk
- Sales: sales@stocktrackpro.co.uk

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
