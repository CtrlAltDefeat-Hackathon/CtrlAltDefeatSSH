import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  status: 'success' | 'error';
  role: 'Student' | 'Teacher' | null;
  message: string;
}

// Hardcoded credentials - stored securely in a real app
const VALID_CREDENTIALS = {
  student123: { password: 'studypass', role: 'Student' as const },
  teacher123: { password: 'teachpass', role: 'Teacher' as const },
};

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    // Parse request body
    let body: LoginRequest;
    
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          status: 'error',
          role: null,
          message: 'Please try again',
        },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.username || !body.password) {
      return NextResponse.json(
        {
          status: 'error',
          role: null,
          message: 'Please try again',
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.username !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json(
        {
          status: 'error',
          role: null,
          message: 'Please try again',
        },
        { status: 400 }
      );
    }

    // Check credentials
    const user = VALID_CREDENTIALS[body.username as keyof typeof VALID_CREDENTIALS];
    
    if (user && user.password === body.password) {
      // Successful login
      const response = NextResponse.json(
        {
          status: 'success',
          role: user.role,
          message: 'Login successful',
        },
        { status: 200 }
      );

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

      return response;
    } else {
      // Invalid credentials
      const response = NextResponse.json(
        {
          status: 'error',
          role: null,
          message: 'Please try again',
        },
        { status: 401 }
      );

      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

      return response;
    }
  } catch (error) {
    // Handle unexpected errors
    const response = NextResponse.json(
      {
        status: 'error',
        role: null,
        message: 'Please try again',
      },
      { status: 500 }
    );

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}