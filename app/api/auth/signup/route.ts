import { NextRequest, NextResponse } from "next/server";
import { signUp, signIn } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    const { uid, email, name, idToken } = await request.json();

    if (!uid || !email || !name || !idToken) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // First create the user account
    const signUpResult = await signUp({ uid, email, name });

    if (!signUpResult.success) {
      return NextResponse.json(
        { error: signUpResult.message },
        { status: 400 }
      );
    }

    // Then sign them in to set the session cookie
    const signInResult = await signIn({ email, idToken });

    if (signInResult.success) {
      return NextResponse.json({
        success: true,
        message: "Account created and signed in successfully"
      });
    } else {
      return NextResponse.json(
        { error: signInResult.message },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
