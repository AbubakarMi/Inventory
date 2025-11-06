import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, seedAdminUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Initializing database...');

    await initializeDatabase();
    await seedAdminUser();

    return NextResponse.json({
      message: 'Database initialized successfully',
      adminCredentials: {
        email: 'admin@farmsight.com',
        password: 'admin123',
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to initialize database',
  }, { status: 405 });
}
