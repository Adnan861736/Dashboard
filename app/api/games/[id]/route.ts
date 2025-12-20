import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// GET /api/games/[id] - Get a specific game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/api/games/${id}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });
  } catch (error: any) {
    console.error('Get game error:', error);
    return NextResponse.json(
      { message: 'فشل في جلب اللعبة', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}

// PUT /api/games/[id] - Update a game
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentType = request.headers.get('content-type') || '';

    let headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Handle multipart/form-data (for image upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const response = await fetch(`${API_BASE_URL}/api/games/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const data = await response.json();

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      });
    }
    // Handle application/json
    else {
      const body = await request.json();
      headers['Content-Type'] = 'application/json; charset=utf-8';

      const response = await fetch(`${API_BASE_URL}/api/games/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      });
    }
  } catch (error: any) {
    console.error('Update game error:', error);
    return NextResponse.json(
      { message: 'فشل في تحديث اللعبة', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}

// DELETE /api/games/[id] - Delete a game
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${API_BASE_URL}/api/games/${id}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });
  } catch (error: any) {
    console.error('Delete game error:', error);
    return NextResponse.json(
      { message: 'فشل في حذف اللعبة', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}
