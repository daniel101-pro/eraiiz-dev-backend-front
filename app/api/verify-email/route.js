// app/api/verify-email/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, otp } = await req.json(); // Parse request body

    // Simulate User model (replace with your actual Mongoose model or database logic)
    // Assuming User is a Mongoose model, ensure it's imported or mocked
    const User = require('mongoose').model('User'); // Adjust import based on your setup

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.verificationToken !== otp || Date.now() > user.tokenExpiry) {
      return NextResponse.json({ message: 'Invalid or expired code' }, { status: 400 });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}