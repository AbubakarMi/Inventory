# PostgreSQL Migration Guide

This guide will help you migrate from Firebase to PostgreSQL.

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - Install PostgreSQL 14 or higher
   - Remember your postgres password (should be "root" as per requirements)

2. **Create Database**
   ```sql
   -- Open pgAdmin or psql and run:
   CREATE DATABASE "Inventory_Db";
   ```

## Step 1: Initialize Database

The database schema will be created automatically. Start your Next.js server:

```bash
npm run dev
```

Then call the initialization endpoint:

```bash
curl -X POST http://localhost:8003/api/init-db
```

Or visit: `http://localhost:8003/api/init-db` in your browser and click POST.

This will:
- Create all tables (users, inventory, categories, sales, suppliers, activity_logs)
- Create indexes for performance
- Create triggers for automatic timestamp updates
- Seed an admin user (admin@farmsight.com / admin123)

## Step 2: Test Authentication

### Login
```bash
curl -X POST http://localhost:8003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@farmsight.com",
    "password": "admin123"
  }'
```

### Register New User
```bash
curl -X POST http://localhost:8003/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "Manager"
  }'
```

### Get Current User
```bash
curl http://localhost:8003/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Step 3: What's Been Implemented

### ✅ Completed
- PostgreSQL database connection
- Database schema with all tables
- JWT authentication system
- Auth API endpoints (login, register, logout, me)
- Activity logging
- Password hashing with bcrypt
- Role-based access control utilities

### 📝 Still To Do
1. **Create remaining API endpoints** (inventory, categories, sales, suppliers, users)
2. **Update AuthContext** to use new API
3. **Remove Firebase** dependencies and files
4. **Update components** to use new API structure

## API Endpoints Reference

### Authentication Endpoints

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": {
    "id": 1,
    "name": "User Name",
    "email": "user@example.com",
    "role": "Admin",
    "status": "Active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

#### POST /api/auth/register
```json
Request:
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "Staff"
}

Response:
{
  "user": {...},
  "token": "...",
  "message": "Registration successful"
}
```

#### POST /api/auth/logout
```
Requires: Authorization header
Response: { "message": "Logout successful" }
```

#### GET /api/auth/me
```
Requires: Authorization header
Response: { "user": {...} }
```

## Database Schema

### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (VARCHAR, hashed)
- role (Admin|Manager|Storekeeper|Staff)
- status (Active|Inactive|Suspended)
- email_verified (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Inventory Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- category_id (INTEGER FK)
- quantity (INTEGER)
- unit (VARCHAR)
- status (In Stock|Low Stock|Out of Stock)
- cost, price (DECIMAL)
- expiry (DATE)
- supplier_id (INTEGER FK)
- threshold (INTEGER)
- created_by, updated_by (INTEGER FK)
- created_at, updated_at (TIMESTAMP)
```

### Categories Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- parent_id (INTEGER FK, nullable)
- created_at, updated_at (TIMESTAMP)
```

### Sales Table
```sql
- id (SERIAL PRIMARY KEY)
- item_id (INTEGER FK)
- item_name (VARCHAR)
- quantity (INTEGER)
- type (Sale|Usage)
- total (DECIMAL)
- date (DATE)
- created_by (INTEGER FK)
- created_at (TIMESTAMP)
```

### Suppliers Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- contact (VARCHAR)
- products (TEXT[])
- rating (DECIMAL 0-5)
- created_at, updated_at (TIMESTAMP)
```

### Activity Logs Table
```sql
- id (SERIAL PRIMARY KEY)
- action (VARCHAR)
- collection (VARCHAR)
- document_id (INTEGER)
- user_id (INTEGER FK)
- user_name (VARCHAR)
- user_role (VARCHAR)
- details (TEXT)
- metadata (JSONB)
- timestamp (TIMESTAMP)
```

## Troubleshooting

### Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running:
- Windows: Check Services for "postgresql-x64-14"
- Mac: `brew services start postgresql`
- Linux: `sudo systemctl start postgresql`

### Authentication Failed for User "postgres"
**Solution**: Reset postgres password:
```sql
ALTER USER postgres WITH PASSWORD 'root';
```

### Database "Inventory_Db" does not exist
**Solution**: Create the database first:
```sql
CREATE DATABASE "Inventory_Db";
```

### Permission Denied
**Solution**: Make sure your PostgreSQL user has proper permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE "Inventory_Db" TO postgres;
```

## Next Steps

1. **Initialize the database** using `/api/init-db`
2. **Test authentication** with the admin credentials
3. **Continue with remaining API endpoints** (see REMAINING_WORK.md)
4. **Update frontend components** to use new API
5. **Remove Firebase** dependencies

## Environment Variables

Make sure your `.env.local` has:

```env
DATABASE_URL=postgresql://postgres:root@localhost:5432/Inventory_Db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Inventory_Db
DB_USER=postgres
DB_PASSWORD=root
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

## Need Help?

- Check PostgreSQL logs: `C:\Program Files\PostgreSQL\14\data\log\`
- Test connection: `psql -U postgres -d Inventory_Db`
- View tables: `\dt` in psql
- Check data: `SELECT * FROM users;`

---

**Status**: Authentication Complete ✅
**Next**: Complete remaining API endpoints and update frontend
