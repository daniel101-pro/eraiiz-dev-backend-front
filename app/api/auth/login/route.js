import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Dummy logic — replace with real DB auth
    if (email === 'admin@eraiz.com' && password === 'admin123') {
      return NextResponse.json({ token: 'your-mock-jwt-token' });
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
