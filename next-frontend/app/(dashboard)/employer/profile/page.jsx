'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>;
const IconSave = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;
const IconGlobe = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.6 9h16.8M3.6 15h16.8"/></svg>;

export default function EmployerProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [profile, setProfile] = useState({
        company_name: '',
        industry: '',
        company_size: '51-200',
        website: '',
        description: '',
        location: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('auth/user/');
                setUser(res.data);
                if (res.data.employer_profile) {
                    setProfile(res.data.employer_profile);
                    if (res.data.employer_profile.profile_picture_url) {
                        setProfilePicture(res.data.employer_profile.profile_picture_url);
                    }
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('profile/', { employer_profile: profile });
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (err) { alert('Failed to update profile.'); }
    };

    const handleProfilePictureUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Only image files are allowed');
            return;
        }

        setUploadingPicture(true);
        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const res = await api.put('profile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfilePicture(res.data.employer_profile?.profile_picture_url);
            alert('Profile picture updated successfully');
        } catch (err) {
            console.error('Profile picture upload error:', err);
            alert('Failed to upload profile picture');
        } finally {
            setUploadingPicture(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 flex items-center gap-8">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/20 ring-4 ring-white dark:ring-gray-900 overflow-hidden">
                         {profilePicture ? (
                            <img src={profilePicture} className="w-full h-full object-cover" alt="Profile" />
                         ) : (
                            (profile.company_name || user.email).slice(0,1).toUpperCase()
                         )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-[2.5rem]">
                         <input
                           type="file"
                           accept="image/*"
                           onChange={handleProfilePictureUpload}
                           className="hidden"
                           disabled={uploadingPicture}
                         />
                         <span className="text-white text-[10px] font-black">{uploadingPicture ? 'UPLOADING...' : 'CHANGE'}</span>
                      </label>
                   </div>
                   <div>
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{profile.company_name || 'Organization Name'}</h1>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span>{profile.industry || 'Technology'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><IconGlobe /> {profile.location || 'Global'}</span>
                        </div>
                   </div>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IconEdit /> Modify Profile
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Company narrative</h2>
                        </div>
                        
                        {isEditing ? (
                            <textarea 
                                value={profile.description}
                                onChange={(e) => setProfile({...profile, description: e.target.value})}
                                rows={6}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-6 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="Describe your company mission and culture..."
                            />
                        ) : (
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                                {profile.description || "Share your company's story to attract top-tier talent. Describe your vision, impact, and why innovative minds should join your ranks."}
                            </p>
                        )}
                    </section>

                    {isEditing && (
                        <div className="flex gap-4">
                            <button onClick={handleSave} className="bg-blue-600 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                                <IconSave /> Commit Changes
                            </button>
                            <button onClick={() => setIsEditing(false)} className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
                                Discard
                            </button>
                        </div>
                    )}
                </div>

                <div className="space-y-10">
                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Firmographics</h2>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Official Name', key: 'company_name', placeholder: 'TechCorp Ltd' },
                                { label: 'Industry Sector', key: 'industry', placeholder: 'Software Engineering' },
                                { label: 'Headquarters', key: 'location', placeholder: 'San Francisco, CA' },
                                { label: 'Digital Portal', key: 'website', placeholder: 'https://company.com' },
                            ].map(field => (
                                <div key={field.key} className="space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{field.label}</p>
                                    {isEditing ? (
                                        <input 
                                            type="text"
                                            value={profile[field.key]}
                                            onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-blue-500/10"
                                            placeholder={field.placeholder}
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                            {field.key === 'website' ? (
                                                <a href={profile[field.key]} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{profile[field.key] || 'Not provided'}</a>
                                            ) : (
                                                profile[field.key] || 'Unspecified'
                                            )}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
