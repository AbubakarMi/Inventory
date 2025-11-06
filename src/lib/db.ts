import { Pool, PoolClient } from 'pg';

// Create a singleton pool instance
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'Inventory_Db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'root',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

// Initialize database tables
export async function initializeDatabase() {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Storekeeper', 'Staff')),
        status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Suppliers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255),
        products TEXT[],
        rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('In Stock', 'Low Stock', 'Out of Stock')),
        cost DECIMAL(10,2) NOT NULL DEFAULT 0,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        expiry DATE,
        supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
        threshold INTEGER NOT NULL DEFAULT 10,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Sales table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('Sale', 'Usage')),
        total DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Activity logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        collection VARCHAR(100) NOT NULL,
        document_id INTEGER,
        user_id INTEGER REFERENCES users(id),
        user_name VARCHAR(255),
        user_role VARCHAR(50),
        details TEXT,
        metadata JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON inventory(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_sales_item ON sales(item_id);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create updated_at trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply triggers to tables
    const tables = ['users', 'categories', 'suppliers', 'inventory'];
    for (const table of tables) {
      await client.query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
          BEFORE UPDATE ON ${table}
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Seed initial users if no users exist
export async function seedAdminUser() {
  try {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create multiple users for different roles
    const users = [
      { name: 'Admin User', email: 'admin@farmsight.com', role: 'Admin' },
      { name: 'Manager User', email: 'manager@farmsight.com', role: 'Manager' },
      { name: 'Storekeeper User', email: 'storekeeper@farmsight.com', role: 'Storekeeper' },
      { name: 'Staff User', email: 'staff@farmsight.com', role: 'Staff' },
    ];

    for (const user of users) {
      // Check if user exists
      const existing = await query('SELECT id FROM users WHERE email = $1', [user.email]);

      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO users (name, email, password, role, status, email_verified)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.name, user.email, hashedPassword, user.role, 'Active', true]
        );
        console.log(`User created: ${user.email} / admin123 (Role: ${user.role})`);
      } else {
        // Update password for existing user to ensure consistency
        await query(
          `UPDATE users SET password = $1 WHERE email = $2`,
          [hashedPassword, user.email]
        );
        console.log(`User password updated: ${user.email} / admin123 (Role: ${user.role})`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}
