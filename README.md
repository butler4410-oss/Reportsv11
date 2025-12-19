# Pro Reports and Analytics

A comprehensive React reporting application with 21 report pages and full component library for business intelligence dashboards.

## Tech Stack

- **React 18** + **TypeScript 5.8**
- **Vite** - Build tool
- **shadcn/ui** (Radix UI) - UI components
- **Tailwind CSS 3.4** - Styling
- **React Router 6** - Routing
- **Recharts** - Charts
- **React Hook Form + Zod** - Forms
- **TanStack React Query** - Data fetching
- **Lucide React** - Icons

## Quick Start

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components (50+ components)
│   ├── layout/          # Report layout & page structure components
│   ├── reports/         # Domain-specific report components
│   └── common/          # Shared/reusable components
├── pages/               # Report pages (21 total)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities & formatters
├── data/                # Mock data & fact tables
├── styles/              # Shared styling/constants
├── App.tsx              # Main router & app setup
└── main.tsx             # Entry point
```

## Reports Included

### Marketing & Campaigns
- Customer Journey
- One-Off Campaign Tracker
- Suggested Services
- ROAS (Return on Ad Spend)
- Billing Campaign Tracking

### Sales & Inventory
- Oil Type Sales
- Product Sales
- Coupon Discount Analysis

### Customer Data & Quality
- Customer Data
- Valid Address Metrics
- Email Capture
- Data Capture LTV

### Operational
- Service Intervals
- POS Data Lapse
- Callback Reports
- Customer Journey Touchpoint Detail

### Location & Account
- Active Locations
- Comprehensive Account Audit
- Cost Projections

## Key Features

- **KPI Customization** - Users can select which KPIs to display (localStorage persisted)
- **Report Sharing** - Email reports with optional PDF and shareable links
- **Customer Drill-down** - Modal-based customer detail views
- **Channel Attribution** - Marketing channel tracking (postcard, email, text)
- **AI Insights Panel** - Right-rail AI insights on each report
- **Responsive Design** - Mobile-first layouts

## Path Aliases

Configured in `tsconfig.json`:
- `@/*` → `./src/*`

## Importing into Another Project

To pull these reports into another project:

1. Copy the `src/` directory
2. Merge `package.json` dependencies
3. Copy `tailwind.config.ts` and merge with existing config
4. Copy `components.json` for shadcn/ui configuration
5. Update routing in your app to include report routes
