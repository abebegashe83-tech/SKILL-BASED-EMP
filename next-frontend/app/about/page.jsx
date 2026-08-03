import React from 'react';
import Header from '../../components/Header';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">About SkillMatch</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Revolutionizing hiring by focusing on skills, not degrees.
          </p>
        </div>

        <div className="space-y-12">
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              At SkillMatch, we believe that talent is about what you can do, not where you went to school. Our mission is to create a world where job seekers are evaluated based on their actual skills and abilities, giving everyone a fair chance to succeed. We use AI-powered matching to connect the right people with the right opportunities, regardless of their educational background.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
            <ul className="space-y-4 text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Meritocracy:</strong> We believe in evaluating people based on their skills and achievements, not their credentials.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Innovation:</strong> We leverage cutting-edge AI technology to create smarter, more efficient hiring processes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Inclusivity:</strong> We're committed to creating opportunities for everyone, regardless of their educational or socioeconomic background.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Transparency:</strong> We believe in clear communication and honest feedback throughout the hiring process.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-8 transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Team</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              SkillMatch was founded by a team of passionate individuals who have experienced the frustrations of traditional hiring firsthand. Our diverse team includes engineers, data scientists, HR professionals, and industry experts who are all united by a common goal: to make hiring fairer, faster, and more effective for everyone.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We're backed by leading investors and advisors who share our vision for the future of work. Together, we're building a platform that transforms how companies discover talent and how job seekers find their dream roles.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
