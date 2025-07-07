"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalGalleryItems: 0,
    totalUsers: 0,
    recentGallery: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Check server-side admin status
    const checkAdminStatus = async () => {
      try {
        setCheckingAuth(true);
        const res = await fetch("/api/me");
        if (res.ok) {
          const userData = await res.json();
          if (userData?.isAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            router.replace("/");
          }
        } else {
          // Not authenticated
          router.replace("/sign-in");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        router.replace("/");
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAdminStatus();
  }, [router]);

  // Fetch stats when component mounts
  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch admin stats from our new API endpoint
      const statsResponse = await fetch('/api/admin/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch admin statistics');
      }
      const statsData = await statsResponse.json();
      
      setStats({
        totalGalleryItems: statsData.totalGalleryItems || 0,
        totalUsers: statsData.totalUsers || 0,
        recentGallery: statsData.recentGallery || [],
      });
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      setError(`Error fetching stats: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                        border border-white/20 dark:border-white/10 shadow-2xl p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white font-medium">Checking admin access...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="bg-white/10 dark:bg-black/10 backdrop-blur-2xl rounded-3xl 
                      border border-white/20 dark:border-white/10
                      shadow-2xl shadow-black/10 dark:shadow-black/20
                      p-8 relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-500/5 to-pink-500/5"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            Admin Dashboard
          </h2>
      
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl p-4 mb-6">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          )}
      
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-xl 
                          border border-blue-500/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">Gallery Items</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  stats.totalGalleryItems
                )}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl 
                          border border-purple-500/20 rounded-2xl p-6 shadow-xl hover:scale-105 transition-all duration-300">
              <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2">Users</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  stats.totalUsers
                )}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                (Feature coming soon)
              </p>
            </div>
          </div>
      
          {/* Quick Actions */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Link href="/admin-gallery-upload" className="block group">
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 
                            hover:bg-white/20 dark:hover:bg-black/20 p-6 rounded-2xl shadow-xl 
                            transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <h4 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2 group-hover:text-blue-500">Upload New Photo</h4>
                <p className="text-gray-700 dark:text-gray-300">Add new images to the gallery</p>
              </div>
            </Link>
            
            <Link href="/admin-gallery-manage" className="block group">
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 
                            hover:bg-white/20 dark:hover:bg-black/20 p-6 rounded-2xl shadow-xl 
                            transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <h4 className="text-xl font-semibold text-purple-600 dark:text-purple-400 mb-2 group-hover:text-purple-500">Manage Gallery</h4>
                <p className="text-gray-700 dark:text-gray-300">Edit or delete existing photos</p>
              </div>
            </Link>
            
            <Link href="/admin-users" className="block group">
              <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 
                            hover:bg-white/20 dark:hover:bg-black/20 p-6 rounded-2xl shadow-xl 
                            transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <h4 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-2 group-hover:text-pink-500">User Management</h4>
                <p className="text-gray-700 dark:text-gray-300">Manage user accounts</p>
              </div>
            </Link>
          </div>
      
          {/* Recent Gallery Uploads */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Recent Gallery Uploads</h3>
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 
                        p-6 rounded-2xl shadow-xl">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading recent uploads...</p>
              </div>
        ) : stats.recentGallery && stats.recentGallery.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-neutral-200">
              <thead className="text-xs uppercase bg-neutral-800 text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Upload Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentGallery.map((item: any) => (
                  <tr key={item.id} className="border-b border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/70 transition">
                    <td className="px-4 py-3">
                      <img 
                        src={item.src} 
                        alt={item.alt} 
                        className="w-16 h-16 object-cover rounded" 
                      />
                    </td>
                    <td className="px-4 py-3">{item.title}</td>
                    <td className="px-4 py-3">
                      {item.createdAt ? new Date(item.createdAt._seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin-gallery-manage?edit=${item.id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition mr-2">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No recent uploads found
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}