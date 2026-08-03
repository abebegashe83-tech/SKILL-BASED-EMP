import React from 'react';
import Header from '../../components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last updated: April 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using SkillMatch, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Account Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Complying with these terms at all times</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Use the platform for any illegal or unauthorized purpose</li>
              <li>Submit false, misleading, or inaccurate information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the platform's operation</li>
              <li>Attempt to gain unauthorized access to the platform</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Job Applications</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When applying for jobs through SkillMatch:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>You must provide accurate and truthful information</li>
              <li>You represent that you have the skills and qualifications you claim</li>
              <li>You agree that employers may contact you regarding your application</li>
              <li>You acknowledge that SkillMatch is not responsible for hiring decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Employer Responsibilities</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Employers using SkillMatch must:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Post accurate and complete job descriptions</li>
              <li>Respond to applicants in a timely manner</li>
              <li>Comply with all applicable employment laws</li>
              <li>Not discriminate on the basis of race, gender, age, religion, disability, or other protected characteristics</li>
              <li>Maintain the confidentiality of applicant information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content on SkillMatch, including text, graphics, logos, and software, is owned by SkillMatch or its licensors and is protected by intellectual property laws. You may not use, reproduce, or distribute any content without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              SkillMatch is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the operation or availability of the platform. We do not guarantee that the platform will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, SkillMatch shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time, with or without cause, with or without notice. Upon termination, your right to use the platform will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SkillMatch is headquartered, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these terms at any time. Your continued use of the platform after such modifications constitutes your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our contact page or at legal@skillmatch.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
