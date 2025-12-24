import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// POST /api/surveys/[id]/submit - Submit survey answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}/submit`, {
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
    console.error('Survey Submit API Error:', error);
    return NextResponse.json(
      { error: 'فشل في إرسال إجابات الاستبيان' },
      { status: 500 }
    );
  }
}
