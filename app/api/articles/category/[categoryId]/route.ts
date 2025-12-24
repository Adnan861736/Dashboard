import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/articles/category/[categoryId] - Get articles by category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { categoryId } = await params;

    const response = await fetch(`${API_BASE_URL}/api/articles/category/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Articles by Category API Error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المقالات' },
      { status: 500 }
    );
  }
}
