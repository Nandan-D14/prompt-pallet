"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GalleryItem } from "@/lib/db/gallery.repository";
import { logError } from "@/lib/utils/error-handler";
import { firebaseToast } from "@/lib/utils/toast";
import { sendNewPhotoNotification } from "@/lib/email";
import { FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter, FiImage } from "react-icons/fi";

const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@example.com"];

type Mode = 'view' | 'add' | 'edit';

interface FormData {
  id?: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  tags: string;
  height: number;
  likes: number;
  prompt: string;
  orientation: "horizontal" | "vertical" | "square";
  color: "blue" | "green" | "red" | "yellow" | "orange" | "purple" | "brown" | "gray" | "white" | "black" | "dark";
  gridSize: "normal" | "wide" | "large" | "small" | "square";
}

export default function AdminGalleryUpload() {
  const [mode, setMode] = useState<Mode>('view');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<FormData>({
    src: "",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifySubscribers, setNotifySubscribers] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
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

  // Fetch gallery items when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchGalleryItems();
    }
  }, [isAdmin]);

  // Filter items when search or filter changes
  useEffect(() => {
    const filtered = galleryItems.filter(item => {
      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTag = filterTag === "all" || item.tags.includes(filterTag);
      
      return matchesSearch && matchesTag;
    });
    setFilteredItems(filtered);
  }, [searchQuery, filterTag, galleryItems]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to fetch gallery items');
      const data = await response.json();
      setGalleryItems(data);
      setFilteredItems(data);
    } catch (err: any) {
      setError(`Error fetching gallery items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      src: "",
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
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'height' || name === 'likes') {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setForm({
      id: item.id,
      src: item.src,
      alt: item.alt,
      title: item.title,
      description: item.description,
      tags: item.tags.join(', '),
      height: item.height,
      likes: item.likes || 0,
      prompt: item.prompt || '',
      orientation: item.orientation,
      color: item.color,
      gridSize: item.gridSize,
    });
    setMode('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete item');
      
      setSuccess('Item deleted successfully!');
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(`Delete failed: ${err.message}`);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Removed file change handler since we're using URL input

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    if (!form.src || !form.title || !form.description) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }
    
    try {
      // Use the provided image URL directly
      const imageUrl = form.src;
      
      // Save metadata to Firestore using server action
      try {
        const tagsArr = form.tags.split(",").map((t) => t.trim()).filter(t => t !== "");
        
        // Create gallery item object
        const galleryItem = {
          src: imageUrl,
          alt: form.alt,
          title: form.title,
          description: form.description,
          tags: tagsArr,
          height: Number(form.height),
          likes: Number(form.likes),
          prompt: form.prompt,
          orientation: form.orientation,
          color: form.color,
          gridSize: form.gridSize,
          notifySubscribers: notifySubscribers,
        };
        
        const isEdit = mode === 'edit' && form.id;
        const url = isEdit ? `/api/gallery/${form.id}` : '/api/gallery';
        const method = isEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(galleryItem),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} gallery item`);
        }
        
        const result = await response.json();
        setSuccess(`Photo ${isEdit ? 'updated' : 'added'} successfully!`);
        
        // Update local state
        if (isEdit) {
          setGalleryItems(prev => prev.map(item => item.id === form.id ? result : item));
        } else {
          setGalleryItems(prev => [result, ...prev]);
        }
        
        resetForm();
        setMode('view');
        setTimeout(() => setSuccess(''), 3000);
      } catch (dbError: any) {
        logError(dbError, "Database operation");
        const errorMsg = `Database error: ${dbError.message || "Failed to save photo data"}`;
        setError(errorMsg);
        firebaseToast.saveError(dbError);
      }
    } catch (err: any) {
      logError(err, "Upload process");
      const errorMsg = `Upload failed: ${err.message || "Unknown error occurred"}`;
      setError(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Get unique tags for filter
  const allTags = Array.from(new Set(galleryItems.flatMap(item => item.tags)));

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
                Gallery Management
              </h1>
              <p className="text-gray-300 mt-2">Add, edit, and manage your gallery images</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setMode('view'); resetForm(); }}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${mode === 'view' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                <FiImage className="inline mr-2" />View All
              </button>
              <button
                onClick={() => { setMode('add'); resetForm(); }}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${mode === 'add' ? 'bg-green-500/30 text-green-300 border border-green-500/50' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
              >
                <FiPlus className="inline mr-2" />Add New
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 backdrop-blur-xl">
            <p className="text-green-400">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 backdrop-blur-xl">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {(mode === 'add' || mode === 'edit') && (
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-white">
              {mode === 'edit' ? 'Edit Photo' : 'Add New Photo'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image URL *</label>
                  <input 
                    name="src"
                    value={form.src}
                    onChange={handleChange}
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    required 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                    placeholder="Enter image title" 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alt Text *</label>
                  <input 
                    name="alt" 
                    value={form.alt} 
                    onChange={handleChange} 
                    placeholder="Alternative text for accessibility" 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Enter detailed description of the image" 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none" 
                    required 
                    rows={4}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags *</label>
                  <input 
                    name="tags" 
                    value={form.tags} 
                    onChange={handleChange} 
                    placeholder="Nature, Trending, Abstract (comma separated)" 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                  <p className="text-xs text-gray-400 mt-1">Separate tags with commas. Use "Trending" for featured images.</p>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">AI Prompt</label>
                  <input 
                    name="prompt" 
                    value={form.prompt} 
                    onChange={handleChange} 
                    placeholder="AI generation prompt (optional)" 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Height (px) *</label>
                  <input 
                    name="height" 
                    value={form.height} 
                    onChange={handleChange} 
                    placeholder="750" 
                    type="number" 
                    min="100"
                    max="2000"
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    required 
                  />
                </div>

                {/* Likes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Initial Likes</label>
                  <input 
                    name="likes" 
                    value={form.likes} 
                    onChange={handleChange} 
                    placeholder="0" 
                    type="number" 
                    min="0"
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>

                {/* Orientation */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Orientation *</label>
                  <select 
                    name="orientation" 
                    value={form.orientation} 
                    onChange={handleChange} 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="horizontal" className="bg-gray-900">Horizontal</option>
                    <option value="vertical" className="bg-gray-900">Vertical</option>
                    <option value="square" className="bg-gray-900">Square</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color *</label>
                  <select 
                    name="color" 
                    value={form.color} 
                    onChange={handleChange} 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="blue" className="bg-gray-900">Blue</option>
                    <option value="green" className="bg-gray-900">Green</option>
                    <option value="red" className="bg-gray-900">Red</option>
                    <option value="yellow" className="bg-gray-900">Yellow</option>
                    <option value="orange" className="bg-gray-900">Orange</option>
                    <option value="purple" className="bg-gray-900">Purple</option>
                    <option value="brown" className="bg-gray-900">Brown</option>
                    <option value="gray" className="bg-gray-900">Gray</option>
                    <option value="white" className="bg-gray-900">White</option>
                    <option value="black" className="bg-gray-900">Black</option>
                    <option value="dark" className="bg-gray-900">Dark</option>
                  </select>
                </div>

                {/* Grid Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Grid Size *</label>
                  <select 
                    name="gridSize" 
                    value={form.gridSize} 
                    onChange={handleChange} 
                    className="w-full bg-black/20 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="normal" className="bg-gray-900">Normal</option>
                    <option value="wide" className="bg-gray-900">Wide</option>
                    <option value="large" className="bg-gray-900">Large</option>
                    <option value="small" className="bg-gray-900">Small</option>
                    <option value="square" className="bg-gray-900">Square</option>
                  </select>
                </div>
              </div>

              {/* Email Notification */}
              <div className="pt-4 border-t border-white/10">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={notifySubscribers}
                    onChange={(e) => setNotifySubscribers(e.target.checked)}
                    className="w-5 h-5 text-blue-500 bg-black/20 backdrop-blur-xl border border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                    Notify subscribers via email about this new photo
                  </span>
                  {notificationLoading && (
                    <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  )}
                </label>
                <p className="text-xs text-gray-400 mt-2 ml-8">
                  Subscribers will receive an email notification about this new gallery addition
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                             text-white font-semibold py-3 px-6 rounded-xl shadow-2xl transition-all duration-300 
                             backdrop-blur-xl border border-white/10 hover:scale-105 
                             ${loading ? "opacity-60 cursor-not-allowed scale-100" : ""}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {mode === 'edit' ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    mode === 'edit' ? 'Update Photo' : 'Add Photo to Gallery'
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => { setMode('view'); resetForm(); }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl transition-all duration-300 backdrop-blur-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Items View */}
        {mode === 'view' && (
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-8">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/20 backdrop-blur-xl border border-white/20 text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-black/20 backdrop-blur-xl border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                >
                  <option value="all" className="bg-gray-900">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag} className="bg-gray-900">{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-300">Loading gallery items...</p>
              </div>
            )}

            {/* Gallery Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">No gallery items found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchQuery || filterTag !== 'all' ? 'Try adjusting your search or filter' : 'Add some images to get started'}
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:scale-105 transition-all duration-300 group">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                            title="Edit"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => item.id && handleDelete(item.id)}
                            className="p-2 bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">{item.title}</h3>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-white/10 text-white text-xs rounded-full border border-white/20">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{item.orientation} • {item.color}</span>
                          <span>{item.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 