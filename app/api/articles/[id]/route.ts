import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/articles/[id] - Get article by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Article API Error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المقال' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Article API Error:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث المقال' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization');
    const { id } = await params;

    const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    // Check if response has content
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If no JSON response, create a success message
      data = { message: 'تم حذف المقال بنجاح' };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Article API Error:', error);
    return NextResponse.json(
      { error: 'فشل في حذف المقال' },
      { status: 500 }
    );
  }
}
