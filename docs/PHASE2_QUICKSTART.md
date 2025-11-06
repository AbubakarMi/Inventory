# Phase 2 Quick Start - Remaining Implementation

## ✅ What's Been Completed

1. **API Client Utility** - `src/lib/api-client.ts` ✅
2. **Inventory API** - Complete CRUD with PostgreSQL ✅

## 🚀 Next Critical Steps

### 1. Update AuthContext (MOST IMPORTANT)

Replace the entire `src/contexts/AuthContext.tsx` file with this:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, api } from '@/lib/api-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Storekeeper' | 'Staff';
  status: 'Active' | 'Inactive' | 'Suspended';
  email_verified: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setCurrentUser(response.user);
      setUserData(response.user);
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('token');
      setCurrentUser(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setCurrentUser(response.user);
      setUserData(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: User['role']
  ) => {
    try {
      const response = await authApi.register({ name, email, password, role });
      setCurrentUser(response.user);
      setUserData(response.user);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
      setUserData(null);
      router.push('/login');
    }
  };

  const resetPassword = async (email: string) => {
    // TODO: Implement password reset via email
    throw new Error('Password reset not yet implemented');
  };

  const updateUserProfile = async (displayName: string) => {
    if (!currentUser) throw new Error('No user logged in');

    try {
      await api.put('/users', { id: currentUser.id, name: displayName });
      setCurrentUser({ ...currentUser, name: displayName });
      setUserData({ ...currentUser, name: displayName });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
```

### 2. Create Remaining API Routes

Create these files with complete CRUD operations:

#### Categories API - `src/app/api/categories/route.ts`
#### Sales API - `src/app/api/sales/route.ts`
#### Suppliers API - `src/app/api/suppliers/route.ts`
#### Users API - `src/app/api/users/route.ts`
#### Activity Logs API - `src/app/api/activity-logs/route.ts`

**Note**: These follow the same pattern as the inventory API. Copy and adapt the inventory API structure.

### 3. Initialize Your Database

```bash
# Make sure PostgreSQL is running
# Then run:
curl -X POST http://localhost:8003/api/init-db
```

Expected response:
```json
{
  "message": "Database initialized successfully",
  "adminCredentials": {
    "email": "admin@farmsight.com",
    "password": "admin123"
  }
}
```

### 4. Test Authentication

```bash
# Test login
curl -X POST http://localhost:8003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmsight.com","password":"admin123"}'

# Should return user object and token
```

### 5. Test Frontend

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:8003/login`
3. Login with: `admin@farmsight.com` / `admin123`
4. You should be redirected to dashboard

## 📋 Checklist

- [ ] Update AuthContext.tsx with new code
- [ ] Initialize database (POST /api/init-db)
- [ ] Test login via API
- [ ] Test login via frontend UI
- [ ] Verify token is stored in localStorage
- [ ] Check that protected routes work

## 🔧 Quick Fixes

### If Login Doesn't Work

1. **Check Browser Console** for errors
2. **Check Network Tab** - look for 401/403 errors
3. **Verify Token** in localStorage (F12 > Application > Local Storage)
4. **Check Database** - Does admin user exist?
   ```sql
   SELECT * FROM users WHERE email = 'admin@farmsight.com';
   ```

### If Database Init Fails

1. **Check PostgreSQL is running**
2. **Verify credentials** in `.env.local`
3. **Check database exists**:
   ```sql
   \l -- List databases
   \c "Inventory_Db" -- Connect to database
   ```

### If Frontend Shows Errors

1. **Clear browser cache and localStorage**
2. **Restart dev server**
3. **Check console for specific errors**

## 🎯 What Works Now

- ✅ PostgreSQL database with all tables
- ✅ JWT authentication
- ✅ Login/Register/Logout API
- ✅ Inventory CRUD API
- ✅ AuthContext using PostgreSQL
- ✅ API client utility

## ⏳ What's Still Needed

- ⏳ Categories/Sales/Suppliers/Users API endpoints
- ⏳ Custom hooks for data fetching
- ⏳ Update component imports (remove Firebase)
- ⏳ Remove Firebase files and dependencies

## 💡 Pro Tips

1. **Use Postman** to test APIs before frontend
2. **Check PostgreSQL logs** if queries fail
3. **Use browser DevTools** to debug frontend
4. **Keep the admin password** simple for development

## 🆘 Common Errors

### "Cannot find module '@/lib/db'"
- Restart your dev server (`npm run dev`)

### "connect ECONNREFUSED 127.0.0.1:5432"
- PostgreSQL is not running. Start it from Services (Windows) or `brew services start postgresql` (Mac)

### "password authentication failed for user postgres"
- Reset postgres password:
  ```sql
  ALTER USER postgres WITH PASSWORD 'root';
  ```

### "relation 'users' does not exist"
- Run database initialization: `POST /api/init-db`

---

**Current Status**: 50% Complete
**Next Critical Task**: Update AuthContext and test login
**Estimated Time**: 30-60 minutes

---

Good luck! 🚀
