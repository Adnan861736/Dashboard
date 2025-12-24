import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/users/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const response = await fetch(`${API_BASE_URL}/api/users/leaderboard?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب قائمة المتصدرين' },
      { status: 500 }
    );
  }
}
