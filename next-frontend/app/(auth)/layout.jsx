'use client';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-blue-700 font-extrabold text-2xl">
            💼 SkillMatch
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
