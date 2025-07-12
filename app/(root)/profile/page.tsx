'use client';
import { setDoc, doc } from 'firebase/firestore';
import React, { useState, useRef } from 'react';
import { firebaseToast } from '@/lib/utils/toast';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', about: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          let saved = [];
          try {
            saved = JSON.parse(localStorage.getItem("savedPhotos") || "[]");
          } catch {
            localStorage.setItem("savedPhotos", "[]");
          }
          
          // Get current Firebase user for additional profile data
          const { auth } = await import("@/firebase/client");
          const currentUser = auth.currentUser;
          
          const userData = { 
            ...data, 
            savedPhotos: saved.length, 
            savedPhotosList: saved,
            // Use Google profile photo if available and no custom avatar is set
            avatarUrl: data.avatarUrl || (currentUser?.photoURL && !data.avatarUrl ? currentUser.photoURL : data.avatarUrl) || ''
          };
          
          setUser(userData);
          setForm({ 
            name: data.name || currentUser?.displayName || '', 
            about: data.about || '' 
          });
          window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: userData }));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };
    
    fetchUser();

    const setupAuthListener = async () => {
      const { auth } = await import("@/firebase/client");
      const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
        if (firebaseUser) {
          fetchUser();
        } else {
          setUser(null);
        }
      });
      return unsubscribe;
    };
    
    let unsubscribe: (() => void) | null = null;
    setupAuthListener().then(unsub => {
      unsubscribe = unsub;
    });
    
    window.addEventListener("storage", fetchUser);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("storage", fetchUser);
    };
  }, []);

  const handleSave = async () => {
    const updatedUser = { ...user, ...form };
    setUser(updatedUser);
    setEditing(false);
    window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));

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
          avatarUrl: updatedUser.avatarUrl || '',
          savedPhotos: saved.length,
          savedPhotosList: saved,
          updatedAt: new Date(),
        }, { merge: true });

        await fetch('/api/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            name: form.name, 
            about: form.about,
            avatarUrl: updatedUser.avatarUrl
          }),
        });

        firebaseToast.saveSuccess();
      }
    } catch (e) {
      firebaseToast.saveError(e);
    }
  };

  const handleCancel = () => {
    setForm({ name: user?.name || '', about: user?.about || '' });
    setEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a temporary URL for immediate display
      const tempUrl = URL.createObjectURL(file);
      
      // Update UI immediately
      const updatedUser = { ...user, avatarUrl: tempUrl };
      setUser(updatedUser);
      
      // Dispatch event to update sidebar
      window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));
      
      // In a real app, you would upload the file to storage and get the permanent URL
      // For now, we'll just use the temporary URL
      try {
        // TODO: Implement actual file upload to Firebase Storage
        // const permanentUrl = await uploadImageToStorage(file);
        // setUser(prev => ({ ...prev, avatarUrl: permanentUrl }));
        console.log('Avatar updated locally. Implement storage upload for persistence.');
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    } catch {}
    window.location.href = '/sign-in';
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete your account?')) {
      firebaseToast.info("Account deletion feature coming soon!");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="bg-neutral-950/[0.2] p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">You must be signed in to view your profile.</h2>
          <a href="/sign-in" className="text-blue-400 underline">Go to Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden py-12 px-4 bg-black text-white relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-96 h-96 bg-purple-500 opacity-10 blur-3xl top-[-80px] left-[-100px]" />
        <div className="absolute w-72 h-72 bg-pink-500 opacity-10 blur-2xl bottom-[-60px] right-[-80px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-red-500 text-transparent bg-clip-text">
            Your Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-2xl transition"
          >
            Log Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-black/10 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <img
                src={user.avatarUrl || '/profile-avatar.png'}
                alt="Avatar"
                className="w-24 h-24 rounded-full border border-white/20 object-cover"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 text-xs px-2 py-1 rounded-2xl bg-gradient-to-r from-blue-500 to-red-500  group-hover:opacity-100 opacity-0 transition"
              >
                Change
              </button>
            </div>

            <div className="flex-1">
              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 text-white px-4 py-2 rounded"
                />
              ) : (
                <h2 className="text-4xl font-semibold mt-4">{user.name}</h2>
              )}
              <p className="text-xl text-gray-400">{user.email}</p>
              <p className="text-xl text-green-400 mt-6">{user.savedPhotos} Saved Photos</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            {editing ? (
              <textarea
                rows={4}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="w-full bg-white/5 border border-white/20 text-white p-3 rounded resize-none"
              />
            ) : (
              <p className="text-gray-300">{user.about}</p>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-white/10 pt-4">
            <div className="flex gap-3">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 px-4 py-2 rounded-2xl text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-2xl text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-2xl text-sm"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleDelete}
              className="text-red-500 text-sm hover:underline cursor-pointer" 
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
