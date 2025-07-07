import { NextRequest, NextResponse } from 'next/server';
import { checkAndMigrateData } from '@/lib/migrate-data';

export async function POST(request: NextRequest) {
  try {
    const result = await checkAndMigrateData();
    
    return NextResponse.json({
      success: result.success,
      message: result.message || result.error,
      data: result
    });
  } catch (error) {
    console.error('Migration API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to migrate data',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Data migration endpoint. Use POST to trigger migration.',
    endpoint: '/api/migrate-data'
  });
}
