# FarmSight Quick Setup Guide

This guide will help you set up FarmSight on your local machine in under 10 minutes.

---

## Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** installed ([Download](https://git-scm.com/))
- ✅ **Firebase account** ([Sign up free](https://firebase.google.com/))
- ✅ Code editor (VS Code recommended)

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to the project directory
cd Inventory

# Install dependencies (this may take a few minutes)
npm install
```

---

## Step 2: Set Up Firebase

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name (e.g., "FarmSight")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Save changes

### Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode** (we have security rules)
3. Select your location
4. Click **Enable**

### Enable Storage

1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Click **Done**

### Get Firebase Credentials

1. Click the **gear icon** → **Project settings**
2. Scroll to "Your apps" section
3. Click the **</>** (web) icon to add a web app
4. Register app name: "FarmSight Web"
5. **Copy the configuration object** - you'll need these values

---

## Step 3: Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Open `.env.local` in your editor**

3. **Fill in your Firebase credentials** from Step 2:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
   NEXT_PUBLIC_APP_NAME=FarmSight
   NEXT_PUBLIC_APP_URL=http://localhost:8003
   ```

4. **Save the file**

---

## Step 4: Deploy Security Rules

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login to Firebase

```bash
firebase login
```

### Initialize Firebase (if not already done)

```bash
firebase init
```

Select:
- ✅ Firestore
- ✅ Storage
- Choose your Firebase project
- Use existing `firestore.rules` and `storage.rules` files

### Deploy Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

---

## Step 5: Start the Development Server

```bash
npm run dev
```

The app will start at: **http://localhost:8003**

---

## Step 6: Create Your First User

1. **Open your browser** to http://localhost:8003
2. **Click "Create account"** (or navigate to `/register`)
3. **Fill in the registration form**:
   - Full Name: Your name
   - Email: your@email.com
   - Role: Select "Admin"
   - Password: Create a secure password
   - Confirm Password: Same password
4. **Click "Create Account"**
5. **Check your email** for verification link
6. **Click the verification link**
7. **Return to login** page and sign in

---

## Step 7: Explore the System

Once logged in, you can:

- ✅ View the **Dashboard** with analytics
- ✅ Manage **Inventory** items
- ✅ Create **Categories**
- ✅ Track **Sales**
- ✅ Manage **Suppliers**
- ✅ Add **Users** (if Admin/Manager)
- ✅ View **Reports**
- ✅ Customize **Settings**

---

## Troubleshooting

### "Firebase App not initialized"
**Solution**: Check that all environment variables in `.env.local` are correct

### "Permission denied" when accessing Firestore
**Solution**: Make sure you deployed the Firestore security rules:
```bash
firebase deploy --only firestore:rules
```

### Port 8003 already in use
**Solution**: Change the port in `package.json`:
```json
"dev": "next dev --turbopack -p 8004"
```

### Email verification not working
**Solution**:
1. Check Firebase Console → Authentication → Templates
2. Make sure your domain is in the authorized domains list
3. Check spam folder for verification email

### "Module not found" errors
**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules
npm install
```

### Build errors
**Solution**: Run type check to find issues:
```bash
npm run typecheck
```

---

## Development Tips

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **ESLint**
- **Prettier - Code formatter**
- **Firebase Explorer**

### Useful Commands
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

### Firebase Emulator (Optional)
For local development without using live Firebase:

```bash
# Install emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

Then update your Firebase config to use emulators in development.

---

## Sample Data

The system will automatically seed sample data on first load:
- 20+ inventory items
- Multiple categories
- Sample suppliers
- Demo sales records

You can customize the seed data in `src/firebase/seeder.ts`

---

## User Roles for Testing

Create multiple users with different roles to test permissions:

1. **Admin**: Full access
   - Email: admin@test.com
   - Password: (your choice)

2. **Manager**: Manage inventory & users
   - Email: manager@test.com
   - Password: (your choice)

3. **Storekeeper**: Manage inventory
   - Email: storekeeper@test.com
   - Password: (your choice)

4. **Staff**: View-only access
   - Email: staff@test.com
   - Password: (your choice)

---

## Firebase Console Quick Links

Bookmark these for easy access:

- **Overview**: `https://console.firebase.google.com/project/YOUR_PROJECT/overview`
- **Authentication**: `https://console.firebase.google.com/project/YOUR_PROJECT/authentication`
- **Firestore**: `https://console.firebase.google.com/project/YOUR_PROJECT/firestore`
- **Storage**: `https://console.firebase.google.com/project/YOUR_PROJECT/storage`
- **Usage & Billing**: `https://console.firebase.google.com/project/YOUR_PROJECT/usage`

Replace `YOUR_PROJECT` with your Firebase project ID.

---

## Next Steps

Now that you have FarmSight running:

1. ✅ Explore all features
2. ✅ Customize branding (colors, logo, name)
3. ✅ Add your inventory data
4. ✅ Invite team members
5. ✅ Deploy to production (see README.md)

---

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 📝 Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- 🐛 Report issues on GitHub
- 💬 Join the community Discord

---

## Success! 🎉

You now have a **world-class inventory management system** running locally!

**What's been set up:**
- ✅ Full authentication system
- ✅ Role-based access control
- ✅ Secure Firebase backend
- ✅ Beautiful, responsive UI
- ✅ Real-time database updates
- ✅ Activity logging
- ✅ Error handling

**Happy farming! 🚜**

---

*Setup Time: ~10 minutes*
*Last Updated: January 2025*
