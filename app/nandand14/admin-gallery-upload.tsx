"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { storage } from "@/firebase/client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { GalleryItem } from "@/lib/db/gallery.repository";
import { logError } from "@/lib/utils/error-handler";

const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

export default function AdminGalleryUpload() {
  const [image, setImage] = useState<File | null>(null);
  const [form, setForm] = useState({
    alt: "",
    title: "",
    description: "",
    tags: "",
    height: 750,
    likes: 0,
    prompt: "",
    orientation: "horizontal",
    color: "blue",
    gridSize: "normal",
  });
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // First check server-side admin status
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const userData = await res.json();
          if (userData?.isAdmin) {
            setIsAdmin(true);
            setCheckingAuth(false);
            return;
          }
        }
        
        // Fallback to client-side check
        const auth = getAuth();
        const unsub = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            router.replace("/sign-in");
            return;
          }
          
          // Check admin by email (or use custom claims if set up)
          if (ADMIN_EMAILS.includes(user.email || "")) {
            setIsAdmin(true);
            // Fix: If on correct route, do nothing. If not, redirect to /admin-gallery-upload
            if (window.location.pathname !== "/admin-gallery-upload") {
              router.replace("/admin-gallery-upload");
            }
          } else {
            setIsAdmin(false);
            router.replace("/");
          }
          setCheckingAuth(false);
        });
        return () => unsub();
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        setCheckingAuth(false);
        router.replace("/");
      }
    };
    
    checkAdminStatus();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    setSuccess("");
    
    if (!image) {
      setError("Please select an image to upload");
      setUploading(false);
      return;
    }
    
    try {
      // Step 1: Upload image to storage
      let imageUrl = "";
      try {
        const storageRef = ref(storage, `gallery/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      } catch (uploadError: any) {
        logError(uploadError, "Image upload");
        setError(`Image upload failed: ${uploadError.message || "Unknown error"}`);
        setUploading(false);
        return;
      }
      
      // Step 2: Save metadata to Firestore using server action
      try {
        const tagsArr = form.tags.split(",").map((t) => t.trim()).filter(t => t !== "");
        
        // Create gallery item object
        const galleryItem: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'> = {
          src: imageUrl,
          alt: form.alt,
          title: form.title,
          description: form.description,
          tags: tagsArr,
          height: Number(form.height),
          likes: Number(form.likes),
          prompt: form.prompt,
          orientation: form.orientation as 'horizontal' | 'vertical' | 'square',
          color: form.color,
          gridSize: form.gridSize as 'normal' | 'large' | 'wide',
        };
        
        // Use fetch to call our API endpoint (we'll create this next)
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(galleryItem),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save gallery item');
        }
        
        setSuccess("Photo uploaded successfully!");
        setImage(null);
        setForm({
          alt: "",
          title: "",
          description: "",
          tags: "",
          height: 750,
          likes: 0,
          prompt: "",
          orientation: "horizontal",
          color: "blue",
          gridSize: "normal",
        });
      } catch (dbError: any) {
        logError(dbError, "Database operation");
        setError(`Database error: ${dbError.message || "Failed to save photo data"}`);
      }
    } catch (err: any) {
      logError(err, "Upload process");
      setError(`Upload failed: ${err.message || "Unknown error occurred"}`);
    } finally {
      setUploading(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center text-white mt-10">Checking admin access...</div>;
  }
  if (!isAdmin) {
    return null;
  }
  return (
    <div className="max-w-xl mx-auto p-8 bg-black/80 rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4 text-white">Admin: Upload Photo</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleFileChange} required className="bg-gray-900 text-white p-2 rounded" />
        <input name="alt" value={form.alt} onChange={handleChange} placeholder="Alt text" className="bg-gray-900 text-white p-2 rounded" required />
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="bg-gray-900 text-white p-2 rounded" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="bg-gray-900 text-white p-2 rounded" required />
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="Tags (comma separated, e.g. Nature,Trending)" className="bg-gray-900 text-white p-2 rounded" required />
        <input name="height" value={form.height} onChange={handleChange} placeholder="Height" type="number" className="bg-gray-900 text-white p-2 rounded" required />
        <input name="likes" value={form.likes} onChange={handleChange} placeholder="Likes" type="number" className="bg-gray-900 text-white p-2 rounded" required />
        <input name="prompt" value={form.prompt} onChange={handleChange} placeholder="Prompt" className="bg-gray-900 text-white p-2 rounded" required />
        <select name="orientation" value={form.orientation} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, orientation: e.target.value })} className="bg-gray-900 text-white p-2 rounded">
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="square">Square</option>
        </select>
        <select name="color" value={form.color} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, color: e.target.value })} className="bg-gray-900 text-white p-2 rounded">
          <option value="blue">Blue</option>
          <option value="dark">Dark</option>
          <option value="green">Green</option>
          <option value="white">White</option>
          <option value="orange">Orange</option>
          <option value="brown">Brown</option>
          <option value="gray">Gray</option>
          <option value="yellow">Yellow</option>
          <option value="purple">Purple</option>
          <option value="red">Red</option>
        </select>
        <select name="gridSize" value={form.gridSize} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, gridSize: e.target.value })} className="bg-gray-900 text-white p-2 rounded">
          <option value="normal">Normal</option>
          <option value="large">Large</option>
          <option value="wide">Wide</option>
        </select>
        <button type="submit" disabled={uploading} className="bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        {success && <div className="text-green-400">{success}</div>}
        {error && <div className="text-red-400">{error}</div>}
      </form>
    </div>
  );
}
