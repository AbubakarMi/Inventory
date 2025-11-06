# FarmSight - Agricultural Inventory Management System

A world-class, enterprise-grade inventory management system designed specifically for agricultural businesses. Built with modern technologies and best practices, FarmSight offers real-time tracking, intelligent analytics, and seamless team collaboration.

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-11.9-orange?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## Features

### Core Functionality
- **Inventory Management**: Track products, categories, stock levels, and pricing in real-time
- **Sales & Usage Tracking**: Record transactions and monitor product movements
- **Supplier Management**: Manage supplier relationships and product sourcing
- **Multi-user System**: Role-based access control for Admin, Manager, Storekeeper, and Staff
- **Dashboard Analytics**: Visual insights with charts and reports
- **Low Stock Alerts**: Automated notifications for inventory thresholds
- **Activity Logging**: Comprehensive audit trail of all system activities

### Security Features
- **Firebase Authentication**: Secure email/password authentication with email verification
- **Password Reset**: Secure password recovery flow
- **Role-Based Access Control (RBAC)**: Granular permissions based on user roles
- **Protected Routes**: Automatic authentication checks on protected pages
- **Firestore Security Rules**: Database-level security enforcement
- **Activity Audit Trails**: Track all user actions for compliance

### User Experience
- **Modern UI**: Clean, professional interface with shadcn/ui components
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes
- **Loading States**: Skeleton screens for improved perceived performance
- **Error Boundaries**: Graceful error handling and recovery
- **Smooth Animations**: Framer Motion for delightful interactions
- **Form Validation**: Comprehensive validation with Zod schemas

## Tech Stack

- **Frontend**: Next.js 15.3.3, React 18, TypeScript 5
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form with Zod validation
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inventory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:8003](http://localhost:8003) in your browser.

## User Roles & Permissions

### Admin
- Full system access
- Manage all users, inventory, categories, suppliers
- Delete any records
- View activity logs and analytics

### Manager
- Manage inventory, categories, and suppliers
- Create and update sales records
- View reports and analytics
- Manage staff users

### Storekeeper
- Manage inventory items
- Record sales and usage
- View inventory reports

### Staff
- View inventory and categories
- Record sales
- View basic reports

## Color Scheme

FarmSight uses a professional green-blue color palette:

- **Primary (Green)**: `hsl(122, 47%, 34%)` - Main actions, headers
- **Secondary (Blue)**: `hsl(207, 82%, 52%)` - Secondary actions, accents
- **Accent (Teal)**: `hsl(172, 100%, 37%)` - Highlights, success states
- **Destructive (Red)**: For warnings and error states
- **Warning (Amber)**: For alerts and warnings

All colors support both light and dark modes.

## Available Scripts

```bash
npm run dev              # Start development server (port 8003)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/             # Protected app routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── inventory/     # Inventory management
│   │   ├── categories/    # Category management
│   │   ├── sales/         # Sales tracking
│   │   ├── suppliers/     # Supplier management
│   │   ├── users/         # User management
│   │   ├── reports/       # Reports & analytics
│   │   └── settings/      # App settings
│   ├── (auth)/            # Authentication routes
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── forgot-password/ # Password reset
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── contexts/             # React contexts
├── firebase/             # Firebase configuration
├── hooks/                # Custom React hooks
└── lib/                  # Utilities and helpers
```

## Firebase Security

The system includes comprehensive Firebase security rules for both Firestore and Storage:

- **Firestore Rules**: Role-based access control at the database level
- **Storage Rules**: Secure file upload with size and type restrictions
- **Activity Logs**: Immutable audit trail for compliance

Deploy security rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, create an issue in the GitHub repository.

---

Made with ❤️ for the agricultural community