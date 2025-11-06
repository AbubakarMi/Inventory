# Remaining Migration Work

## What's Been Completed ✅

1. **Database Setup**
   - ✅ PostgreSQL connection pool
   - ✅ Database schema (6 tables with relationships)
   - ✅ Indexes for performance
   - ✅ Automatic timestamp triggers
   - ✅ Database initialization script

2. **Authentication System**
   - ✅ JWT token generation/verification
   - ✅ Password hashing with bcrypt
   - ✅ Login endpoint (`/api/auth/login`)
   - ✅ Register endpoint (`/api/auth/register`)
   - ✅ Logout endpoint (`/api/auth/logout`)
   - ✅ Get current user endpoint (`/api/auth/me`)
   - ✅ Auth middleware for route protection
   - ✅ Role-based access control utilities

3. **Security**
   - ✅ JWT-based authentication
   - ✅ HTTP-only cookies
   - ✅ Password hashing
   - ✅ Role-based authorization

## What Still Needs to Be Done 📝

### 1. Complete API Endpoints

#### A. Inventory API (`/api/inventory/route.ts`)
Create CRUD operations:
- `GET /api/inventory` - List all inventory items
- `POST /api/inventory` - Create new item (Admin/Manager/Storekeeper)
- `PUT /api/inventory` - Update item (Admin/Manager/Storekeeper)
- `DELETE /api/inventory` - Delete item (Admin only)
- `GET /api/inventory/[id]` - Get single item

#### B. Categories API (`/api/categories/route.ts`)
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (Admin/Manager)
- `PUT /api/categories` - Update category (Admin/Manager)
- `DELETE /api/categories` - Delete category (Admin)

#### C. Sales API (`/api/sales/route.ts`)
- `GET /api/sales` - List sales with filters
- `POST /api/sales` - Create sale (Admin/Manager/Storekeeper)
- `PUT /api/sales` - Update sale (Admin/Manager)
- `DELETE /api/sales` - Delete sale (Admin)

#### D. Suppliers API (`/api/suppliers/route.ts`)
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier (Admin/Manager)
- `PUT /api/suppliers` - Update supplier (Admin/Manager)
- `DELETE /api/suppliers` - Delete supplier (Admin)

#### E. Users API (`/api/users/route.ts`)
- `GET /api/users` - List users (Admin/Manager)
- `POST /api/users` - Create user (Admin)
- `PUT /api/users` - Update user (Admin/Manager)
- `DELETE /api/users` - Delete user (Admin)

#### F. Activity Logs API (`/api/activity-logs/route.ts`)
- `GET /api/activity-logs` - View logs (Admin/Manager)

### 2. Update AuthContext

**File**: `src/contexts/AuthContext.tsx`

Replace Firebase authentication with API calls:

```typescript
// Current: Uses Firebase Auth
// New: Use fetch to API endpoints

const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error);
  }

  // Store token in localStorage or state
  localStorage.setItem('token', data.token);
  setCurrentUser(data.user);
  setUserData(data.user);
};
```

### 3. Update Data Fetching Hooks

Replace Firebase hooks with API fetch hooks:

**Old**: `useCollection`, `useDoc` from Firebase
**New**: Custom hooks using `fetch` or `SWR`

Example:
```typescript
// src/hooks/use-inventory.ts
export function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setItems(data.items);
      setLoading(false);
    };

    fetchInventory();
  }, []);

  return { items, loading };
}
```

### 4. Remove Firebase Dependencies

**Files to Delete or Update**:
```
src/firebase/
├── index.ts - DELETE
├── firestore/
│   ├── use-collection.tsx - DELETE
│   └── use-doc.tsx - DELETE
├── seeder.ts - DELETE or adapt for PostgreSQL
└── services/ - DELETE all Firebase service files
```

**Update `package.json`**:
```bash
npm uninstall firebase firebase-admin
```

**Delete Firebase config files**:
- `firestore.rules`
- `storage.rules`

### 5. Update Components

#### Login Page (`src/app/(auth)/login/page.tsx`)
- Already using AuthContext - should work after AuthContext update
- Remove Firebase imports

#### Register Page (`src/app/(auth)/register/page.tsx`)
- Update to use new AuthContext
- Remove email verification UI (or implement email service)

#### Protected Pages
- Update to use new AuthContext
- Replace Firebase data hooks with new API hooks

### 6. Create API Client Utility

**File**: `src/lib/api-client.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Helper methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) =>
    apiRequest(endpoint, { method: 'DELETE' }),
};
```

### 7. Update Activity Logger

**File**: `src/lib/activity-logger.ts`

Update to use PostgreSQL API instead of Firebase:

```typescript
export async function logActivity(
  action: string,
  collection: string,
  details: string,
  documentId?: string
) {
  try {
    const token = localStorage.getItem('token');
    await fetch('/api/activity-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        action,
        collection,
        document_id: documentId,
        details,
      }),
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}
```

## Implementation Priority

### Phase 1: Critical (Do First)
1. ✅ Database setup
2. ✅ Authentication API
3. 📝 Update AuthContext
4. 📝 Test login/register flow

### Phase 2: Core Features
1. 📝 Inventory API
2. 📝 Categories API
3. 📝 Update inventory components
4. 📝 Test CRUD operations

### Phase 3: Additional Features
1. 📝 Sales API
2. 📝 Suppliers API
3. 📝 Users API
4. 📝 Activity Logs API

### Phase 4: Cleanup
1. 📝 Remove Firebase files
2. 📝 Update documentation
3. 📝 Final testing

## Testing Checklist

After completing each phase:

### Authentication
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token is stored correctly
- [ ] Protected routes redirect when not logged in
- [ ] Can logout successfully

### Inventory Management
- [ ] Can view all inventory items
- [ ] Can create new item
- [ ] Can update existing item
- [ ] Can delete item (Admin only)
- [ ] Permissions work correctly

### Full System
- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] CRUD operations work
- [ ] Role-based access enforced
- [ ] Activity logging works
- [ ] No Firebase errors in console

## Quick Start Commands

```bash
# 1. Initialize database
curl -X POST http://localhost:8003/api/init-db

# 2. Login as admin
curl -X POST http://localhost:8003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farmsight.com","password":"admin123"}'

# 3. Test authenticated endpoint
curl http://localhost:8003/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Estimated Time

- Phase 1 (Auth Update): 2-3 hours
- Phase 2 (Core APIs): 4-5 hours
- Phase 3 (Additional APIs): 3-4 hours
- Phase 4 (Cleanup & Testing): 2-3 hours

**Total**: 11-15 hours of development work

## Need Help?

1. **Database Issues**: See POSTGRESQL_MIGRATION_GUIDE.md
2. **API Testing**: Use Postman or curl commands above
3. **Frontend Integration**: Check AuthContext examples
4. **Debugging**: Enable detailed logging in API routes

---

**Current Status**: ⚡ Authentication System Complete
**Next Task**: Update AuthContext to use new API
