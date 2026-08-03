'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import CVUpload from '@/components/CVUpload';

const IconEdit = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>;
const IconSave = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;
const IconLocation = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>;

export default function JobseekerProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [profile, setProfile] = useState({
        full_name: '',
        location: '',
        bio: '',
        education: '',
        experience: '',
        skills: [],
        phone: '',
        linkedin: '',
        github: '',
        resume: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('auth/user/');
                setUser(res.data);
                const p = res.data.profile || {};
                const jp = res.data.jobseeker_profile || {};
                setProfile({
                    full_name: p.full_name || '',
                    location: p.location || '',
                    bio: p.bio || '',
                    education: p.education || '',
                    experience: p.experience || '',
                    skills: p.skills || [],
                    phone: p.phone || '',
                    linkedin: p.linkedin || '',
                    github: p.github || '',
                    resume: p.resume || null
                });
                if (jp.profile_picture_url) {
                    setProfilePicture(jp.profile_picture_url);
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('profile/', { 
                full_name: profile.full_name,
                location: profile.location,
                bio: profile.bio,
                education: profile.education,
                experience: profile.experience,
                skills: profile.skills,
                phone: profile.phone,
                linkedin: profile.linkedin,
                github: profile.github
            });
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
            setProfilePicture(res.data.jobseeker_profile?.profile_picture_url);
            alert('Profile picture updated successfully');
        } catch (err) {
            console.error('Profile picture upload error:', err);
            alert('Failed to upload profile picture');
        } finally {
            setUploadingPicture(false);
        }
    };

    if (!user) return null;

    const initials = (profile.full_name || user.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 flex items-center gap-8 text-left">
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/20 ring-4 ring-white dark:ring-gray-900 overflow-hidden">
                         {profilePicture ? (
                            <img src={profilePicture} className="w-full h-full object-cover" alt="Profile" />
                         ) : (
                            initials
                         )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
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
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-2">{profile.full_name || 'Anonymous User'}</h1>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><IconLocation /> {profile.location || 'Not specified'}</span>
                        </div>
                   </div>
                </div>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                        <IconEdit /> Modify Profile
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-left">
                <div className="lg:col-span-2 space-y-10">
                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Professional Summary</h2>
                        {isEditing ? (
                            <textarea 
                                value={profile.bio}
                                onChange={(e) => setProfile({...profile, bio: e.target.value})}
                                rows={4}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-6 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="Tell your story..."
                            />
                        ) : (
                            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic">
                                {profile.bio || "Describe your professional journey and what drives you."}
                            </p>
                        )}
                    </section>

                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Experience History</h2>
                        {isEditing ? (
                            <textarea 
                                value={profile.experience}
                                onChange={(e) => setProfile({...profile, experience: e.target.value})}
                                rows={6}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-6 text-gray-900 dark:text-white font-medium focus:ring-4 focus:ring-blue-500/10 transition-all"
                                placeholder="List your key roles and achievements..."
                            />
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400 font-medium whitespace-pre-line leading-relaxed">
                                {profile.experience || "No experience history added yet."}
                            </p>
                        )}
                    </section>
                </div>

                <div className="space-y-10">
                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Personal Details</h2>
                        <div className="space-y-6">
                            {[
                                { label: 'Full Name', key: 'full_name', placeholder: 'John Doe' },
                                { label: 'Location', key: 'location', placeholder: 'Berlin, DE' },
                                { label: 'Phone', key: 'phone', placeholder: '+1 234 567 890' },
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
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{profile[field.key] || 'Unspecified'}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Social Links</h2>
                        <div className="space-y-6">
                            {[
                                { label: 'LinkedIn', key: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
                                { label: 'GitHub', key: 'github', placeholder: 'https://github.com/username' },
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
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{profile[field.key] || 'Unspecified'}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Academics</h2>
                        <div className="space-y-2">
                            {isEditing ? (
                                <textarea 
                                    value={profile.education}
                                    onChange={(e) => setProfile({...profile, education: e.target.value})}
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl p-4 text-sm font-bold text-gray-900 dark:text-white transition-all focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Degree, University, Awards..."
                                />
                            ) : (
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{profile.education || 'No academic data.'}</p>
                            )}
                        </div>
                    </section>

                    {isEditing && (
                        <button onClick={handleSave} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            <IconSave /> Sync Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
