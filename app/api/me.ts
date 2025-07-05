import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    
    // Only allow updating specific fields
    const allowedFields = ['name', 'about', 'avatarUrl'];
    const updateData: Record<string, any> = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    // Update user in Firestore
    await db.collection("users").doc(user.id).update(updateData);
    
    // Return updated user
    const updatedUser = await db.collection("users").doc(user.id).get();
    
    return NextResponse.json({
      ...updatedUser.data(),
      id: updatedUser.id,
      isAdmin: user.isAdmin, // Preserve admin status
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
