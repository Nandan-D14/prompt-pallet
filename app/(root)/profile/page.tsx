'use client';
import { setDoc, doc } from 'firebase/firestore';
import React, { useState, useRef } from 'react';

// ...existing code...

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', about: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Fetch user details from server
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          // Add saved photos count from localStorage
          let saved = [];
          try {
            saved = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
          } catch (parseError) {
            console.error("Error parsing saved photos:", parseError);
            // Reset saved photos if corrupted
            localStorage.setItem("savedPhotos", "[]");
          }
          const userData = { ...data, savedPhotos: saved.length, savedPhotosList: saved };
          setUser(userData);
          setForm({ name: data.name || '', about: data.about || '' });
          
          // Dispatch event to update other components
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: userData }));
        } else {
          const errorData = await res.json().catch(() => ({ message: 'Failed to fetch user data' }));
          console.error('User fetch error:', errorData);
          setUser(null);
        }
      } catch (e) {
        console.error('Profile data fetch error:', e);
        setUser(null);
      }
    };
    fetchUser();
    
    // Listen for auth changes and localStorage changes
    const { auth } = require("@/firebase/client");
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchUser();
    });
    
    const onStorage = () => fetchUser();
    window.addEventListener("storage", onStorage);
    
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleSave = async () => {
    const updatedUser = { ...user, ...form };
    setUser(updatedUser);
    setEditing(false);
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));
    
    // Save name, about, and savedPhotos to Firestore
    try {
      const { getAuth } = await import("firebase/auth");
      const { db } = await import("@/firebase/client");
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const saved = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
        await setDoc(doc(db, "users", currentUser.uid), {
          name: form.name,
          about: form.about,
          email: currentUser.email,
          savedPhotos: saved.length,
          savedPhotosList: saved,
          updatedAt: new Date(),
        }, { merge: true });
        
        // Also update server-side data
        await fetch('/api/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            about: form.about,
          }),
        });
      }
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Failed to save profile changes. Please try again.");
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', about: user?.about || '' });
    setEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUser((prev: any) => ({ ...prev, avatarUrl: url }));
    }
  };

  const handleLogout = async () => {
    try {
      // Call the signOut server action
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Logout error:', errorData);
        // Still redirect to sign-in page even if there's an error
      }
      
      // Redirect to sign-in page
      window.location.href = '/sign-in';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to sign-in page even if there's an error
      window.location.href = '/sign-in';
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      alert('Account deleted (simulate)');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="bg-black/80 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">You must be signed in to view your profile.</h2>
          <a href="/sign-in" className="text-blue-400 underline">Go to Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className=" overflow-hidden bg-black/90 text-white py-12 px-4 relative">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-96 h-96 bg-purple-500 opacity-10 blur-3xl top-[-80px] left-[-100px]" />
        <div className="absolute w-72 h-72 bg-pink-500 opacity-10 blur-2xl bottom-[-60px] right-[-80px]" />
      </div>

      {/* Header Buttons */}
      <div className="flex justify-between max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 text-transparent bg-clip-text drop-shadow">
          Your Profile
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 px-4 py-2 rounded-lg text-white transition"
        >
          Log Out
        </button>
      </div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={user.avatarUrl || '/profile-avatar.png'}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-gray-600 object-cover"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-indigo-600 px-2 py-1 text-xs rounded group-hover:opacity-100 opacity-0 transition"
            >
              Change
            </button>
          </div>

          <div className="flex-1">
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded w-full"
              />
            ) : (
              <h2 className="text-2xl font-semibold">{user.name}</h2>
            )}
            <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            <p className="text-indigo-400 text-xs mt-1">
              {user.savedPhotos} Saved Photos
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">About</h3>
          {editing ? (
            <textarea
              rows={4}
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-white p-3 rounded resize-none"
            />
          ) : (
            <p className="text-gray-300">{user.about}</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="flex gap-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded text-white text-sm font-semibold"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white text-sm"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 text-sm hover:underline"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
