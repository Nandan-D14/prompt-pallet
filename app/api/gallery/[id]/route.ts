import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getGalleryItemById, updateGalleryItem, deleteGalleryItem } from "@/lib/db/gallery.repository";
import { handleApiError, ErrorType } from "@/lib/utils/error-handler";

// Admin emails for authorization
const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

// Helper function to check if user is admin
async function isAdmin() {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // First check if user has isAdmin flag set
  if (user.isAdmin === true) {
    return true;
  }
  
  // Fallback to email check
  return ADMIN_EMAILS.includes(user.email);
}

// GET /api/gallery/:id - Get a specific gallery item
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get gallery item
    const item = await getGalleryItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { type: ErrorType.NOT_FOUND, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// PUT /api/gallery/:id - Update a gallery item (admin only)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const data = await request.json();
    
    // Check if item exists
    const existingItem = await getGalleryItemById(id);
    if (!existingItem) {
      return NextResponse.json(
        { type: ErrorType.NOT_FOUND, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    // Update gallery item
    const item = await updateGalleryItem(id, data);
    
    return NextResponse.json(item);
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}

// DELETE /api/gallery/:id - Delete a gallery item (admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json(
        { type: ErrorType.AUTHORIZATION, message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    // Check if item exists
    const existingItem = await getGalleryItemById(id);
    if (!existingItem) {
      return NextResponse.json(
        { type: ErrorType.NOT_FOUND, message: "Gallery item not found" },
        { status: 404 }
      );
    }
    
    // Delete gallery item
    await deleteGalleryItem(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    const { status, body } = handleApiError(error);
    return NextResponse.json(body, { status });
  }
}