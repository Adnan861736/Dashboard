import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    const response = await fetch(`${API_BASE_URL}/api/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Articles API Error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المقالات' },
      { status: 500 }
    );
  }
}

// POST /api/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/articles`, {
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
    console.error('Articles API Error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء المقال' },
      { status: 500 }
    );
  }
}
