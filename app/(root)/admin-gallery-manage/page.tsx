"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { logError } from "@/lib/utils/error-handler";
import { GalleryItem } from "@/lib/db/gallery.repository";

const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

export default function AdminGalleryManage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [filterColor, setFilterColor] = useState("all");
  const [filterOrientation, setFilterOrientation] = useState("all");
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
      
      // Check for edit query parameter
      const params = new URLSearchParams(window.location.search);
      const editId = params.get('edit');
      
      if (editId) {
        fetchItemForEdit(editId);
      }
    }
  }, [isAdmin]);
  
  // Fetch a specific item for editing
  const fetchItemForEdit = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery item');
      }
      
      const item = await response.json();
      setEditItem(item);
    } catch (err: any) {
      logError(err, "Fetching gallery item for edit");
      setError(`Error fetching item: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      setGalleryItems(data);
      setFilteredItems(data);
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
      const updatedItems = galleryItems.filter(item => item.id !== id);
      setGalleryItems(updatedItems);
      setFilteredItems(updatedItems.filter(applyFilters));
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
      const updatedItems = galleryItems.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      );
      setGalleryItems(updatedItems);
      setFilteredItems(updatedItems.filter(applyFilters));
      
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

  // Filter logic
  const applyFilters = (item: GalleryItem) => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = filterTag === "all" || item.tags.includes(filterTag);
    const matchesColor = filterColor === "all" || item.color === filterColor;
    const matchesOrientation = filterOrientation === "all" || item.orientation === filterOrientation;
    
    return matchesSearch && matchesTag && matchesColor && matchesOrientation;
  };

  // Apply filters whenever search or filter values change
  useEffect(() => {
    const filtered = galleryItems.filter(applyFilters);
    setFilteredItems(filtered);
  }, [searchQuery, filterTag, filterColor, filterOrientation, galleryItems]);

  // Get unique values for filter options
  const allTags = Array.from(new Set(galleryItems.flatMap(item => item.tags)));
  const allColors = Array.from(new Set(galleryItems.map(item => item.color)));

  if (checkingAuth) {
    return <div className="text-center text-white mt-10">Checking admin access...</div>;
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black/20 backdrop-blur-3xl text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
                Admin: Gallery Management
              </h1>
              <p className="text-gray-300 mt-2">Manage your gallery images with search, filter, and edit capabilities</p>
            </div>
            <button 
              onClick={() => router.push('/admin-gallery-upload')} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Search & Filter</h2>
          
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Tag</label>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-900">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag} className="bg-gray-900">{tag}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Color</label>
              <select
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-900">All Colors</option>
                {allColors.map(color => (
                  <option key={color} value={color} className="bg-gray-900">{color}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Orientation</label>
              <select
                value={filterOrientation}
                onChange={(e) => setFilterOrientation(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-gray-900">All Orientations</option>
                <option value="horizontal" className="bg-gray-900">Horizontal</option>
                <option value="vertical" className="bg-gray-900">Vertical</option>
                <option value="square" className="bg-gray-900">Square</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-300">
            Showing {filteredItems.length} of {galleryItems.length} items
          </div>
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
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {loading && <div className="text-center text-gray-300 py-8">Loading gallery items...</div>}
          
          {filteredItems.length === 0 && !loading ? (
            <div className="text-center text-gray-300 py-12">
              {galleryItems.length === 0 ? "No gallery items found." : "No items match your search criteria."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-white">
                <thead className="bg-black/20 backdrop-blur-xl">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition-all duration-300">
                      <td className="px-6 py-4">
                        <img 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-20 h-20 object-cover rounded-xl shadow-lg" 
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{item.title}</td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="truncate text-gray-300">{item.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(item)} 
                            className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl border border-blue-500/30 text-sm font-medium transition-all duration-300 hover:scale-105"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id!)} 
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 text-sm font-medium transition-all duration-300 hover:scale-105"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
