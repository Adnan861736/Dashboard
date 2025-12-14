import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.100:4005';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  try {
    const url = `${API_BASE_URL}/${path.join('/')}`;

    // Get request body if exists
    let body = null;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch (e) {
        // No body or invalid JSON
      }
    }

    // Get headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    };

    // Forward authorization header if exists
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Make request to backend
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Get response data
    const data = await response.json();

    // Return response with same status code and UTF-8 header
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      }
    });
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { message: 'فشل الاتصال بالخادم', error: error.message },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      }
    );
  }
}
