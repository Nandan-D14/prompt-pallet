"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { logError } from "@/lib/utils/error-handler";
import { GalleryItem } from "@/lib/db/gallery.repository";

const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

export default function AdminGalleryManage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
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

  // Fetch gallery items when component mounts
  useEffect(() => {
    if (isAdmin) {
      fetchGalleryItems();
    }
  }, [isAdmin]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      setGalleryItems(data);
    } catch (err: any) {
      logError(err, "Fetching gallery items");
      setError(`Error fetching gallery items: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete gallery item');
      }
      
      setSuccess("Item deleted successfully!");
      // Remove the deleted item from the state
      setGalleryItems(galleryItems.filter(item => item.id !== id));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      logError(err, "Deleting gallery item");
      setError(`Delete failed: ${err.message || "Unknown error"}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditItem({...item});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editItem) return;
    
    if (e.target.name === 'tags') {
      setEditItem({
        ...editItem,
        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      });
    } else if (e.target.name === 'height' || e.target.name === 'likes') {
      setEditItem({
        ...editItem,
        [e.target.name]: Number(e.target.value)
      });
    } else {
      setEditItem({
        ...editItem,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editItem),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update gallery item');
      }
      
      const updatedItem = await response.json();
      
      // Update the item in the state
      setGalleryItems(galleryItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      ));
      
      setSuccess("Item updated successfully!");
      setEditItem(null);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      logError(err, "Updating gallery item");
      setError(`Update failed: ${err.message || "Unknown error"}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center text-white mt-10">Checking admin access...</div>;
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-black/80 rounded-xl mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Admin: Manage Gallery</h2>
        <button 
          onClick={() => router.push('/admin-gallery-upload')} 
          className="bg-blue-600 text-white py-2 px-4 rounded font-bold hover:bg-blue-700 transition"
        >
          Upload New Photo
        </button>
      </div>
      
      {success && <div className="bg-green-600/80 text-white p-4 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-600/80 text-white p-4 rounded mb-4">{error}</div>}
      
      {editItem ? (
        <div className="bg-neutral-900/80 p-6 rounded-lg mb-6 border border-neutral-700">
          <h3 className="text-xl font-bold text-white mb-4">Edit Gallery Item</h3>
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                <input 
                  name="title" 
                  value={editItem.title} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Alt Text</label>
                <input 
                  name="alt" 
                  value={editItem.alt} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded" 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
              <textarea 
                name="description" 
                value={editItem.description} 
                onChange={handleChange} 
                className="w-full bg-neutral-800 text-white p-2 rounded" 
                rows={3} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Tags (comma separated)</label>
              <input 
                name="tags" 
                value={editItem.tags.join(', ')} 
                onChange={handleChange} 
                className="w-full bg-neutral-800 text-white p-2 rounded" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Height</label>
                <input 
                  name="height" 
                  type="number" 
                  value={editItem.height} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Likes</label>
                <input 
                  name="likes" 
                  type="number" 
                  value={editItem.likes || 0} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Orientation</label>
                <select 
                  name="orientation" 
                  value={editItem.orientation} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded"
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                  <option value="square">Square</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Color</label>
                <select 
                  name="color" 
                  value={editItem.color} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded"
                >
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
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Grid Size</label>
                <select 
                  name="gridSize" 
                  value={editItem.gridSize} 
                  onChange={handleChange} 
                  className="w-full bg-neutral-800 text-white p-2 rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="wide">Wide</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Prompt</label>
              <textarea 
                name="prompt" 
                value={editItem.prompt || ''} 
                onChange={handleChange} 
                className="w-full bg-neutral-800 text-white p-2 rounded" 
                rows={3} 
              />
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="bg-blue-600 text-white py-2 px-6 rounded font-bold hover:bg-blue-700 transition"
              >
                {loading ? "Updating..." : "Update Item"}
              </button>
              <button 
                type="button" 
                onClick={() => setEditItem(null)} 
                className="bg-neutral-700 text-white py-2 px-6 rounded font-bold hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {loading && <div className="text-center text-neutral-300 my-4">Loading gallery items...</div>}
          
          {galleryItems.length === 0 && !loading ? (
            <div className="text-center text-neutral-300 my-8">No gallery items found.</div>
          ) : (
            <table className="w-full text-left text-neutral-200">
              <thead className="text-xs uppercase bg-neutral-800 text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {galleryItems.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/70 transition">
                    <td className="px-4 py-3">
                      <img 
                        src={item.src} 
                        alt={item.alt} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                    </td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{item.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-neutral-800 rounded-full">{tag}</span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-neutral-800 rounded-full">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(item)} 
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id!)} 
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}