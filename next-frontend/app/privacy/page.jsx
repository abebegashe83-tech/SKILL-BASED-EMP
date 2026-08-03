import React from 'react';
import Header from '../../components/Header';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600">Last updated: April 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect information you provide directly to us, including when you create an account, apply for jobs, or contact us. This may include your name, email address, resume, skills, work experience, and other professional information.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We also collect information automatically as you use our platform, including your IP address, browser type, device information, and usage patterns.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Match you with relevant job opportunities</li>
              <li>Communicate with you about your account and applications</li>
              <li>Process job applications and facilitate communication with employers</li>
              <li>Analyze usage patterns to improve our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Employers:</strong> When you apply for a job, we share your profile and application with the relevant employer.</li>
              <li><strong>Service Providers:</strong> We work with third-party service providers to help us operate our platform.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not sell your personal information to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of certain communications</li>
              <li>Request information about how we use your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use cookies and similar technologies to improve your experience, analyze usage, and assist in our marketing efforts. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this privacy policy, please contact us through our contact page or at privacy@skillmatch.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
