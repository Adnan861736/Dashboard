import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

// POST /api/games - Create a new game
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let body;
    let headers: HeadersInit = {
      'Accept': 'application/json',
    };

    // Forward authorization header if exists
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Handle multipart/form-data (for image upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Forward the FormData to backend
      headers = {
        'Accept': 'application/json',
      };

      if (authHeader) {
        headers['Authorization'] = authHeader;
      }

      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
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
      body = await request.json();
      headers['Content-Type'] = 'application/json; charset=utf-8';

      const response = await fetch(`${API_BASE_URL}/api/games`, {
        method: 'POST',
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
    console.error('Create game error:', error);
    return NextResponse.json(
      { message: 'فشل في إنشاء اللعبة', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}

// GET /api/games - Get all games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/games${queryString ? `?${queryString}` : ''}`;

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
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
    console.error('Get games error:', error);
    return NextResponse.json(
      { message: 'فشل في جلب الألعاب', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}
