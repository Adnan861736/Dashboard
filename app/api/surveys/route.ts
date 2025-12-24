import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/surveys - Get all surveys
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_BASE_URL}/api/surveys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Surveys API Error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الاستبيانات' },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Create new survey
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Surveys API Error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الاستبيان' },
      { status: 500 }
    );
  }
}
