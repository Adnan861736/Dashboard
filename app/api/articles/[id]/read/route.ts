import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// POST /api/articles/[id]/read - Mark article as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}/api/articles/${id}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Article Read API Error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث حالة القراءة' },
      { status: 500 }
    );
  }
}
