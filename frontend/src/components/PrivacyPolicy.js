import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-12">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-10 transition-colors"
        >
          <ArrowLeft size={16} /> Back to home
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield size={18} className="text-slate-700 dark:text-slate-300" />
          </div>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Legal</p>
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold mb-2">Privacy Policy</h1>

        <div className="space-y-10 text-slate-600 dark:text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">1. Introduction</h2>
            <p>
              Welcome to NoCap AI ("we", "our", or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your
              information when you use our fake news detection service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-medium text-slate-800 dark:text-slate-200">Account information</span> — name and email address when you sign up via Google or email.</li>
              <li><span className="font-medium text-slate-800 dark:text-slate-200">Content you submit</span> — articles, headlines, or URLs you submit for analysis.</li>
              <li><span className="font-medium text-slate-800 dark:text-slate-200">Usage data</span> — analysis history, credibility scores, and verdicts associated with your account.</li>
              <li><span className="font-medium text-slate-800 dark:text-slate-200">Anonymous usage</span> — if you use the tool without signing in, no personal data is stored.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve the NoCap AI analysis service.</li>
              <li>To save your analysis history so you can review it later.</li>
              <li>To identify your account role (user or admin).</li>
              <li>We do <span className="font-medium text-slate-800 dark:text-slate-200">not</span> sell your data to third parties.</li>
              <li>We do <span className="font-medium text-slate-800 dark:text-slate-200">not</span> use your submitted content for advertising.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">4. Third-Party Services</h2>
            <p className="mb-3">We use the following third-party services to operate NoCap AI:</p>
            <div className="space-y-3">
              {[
                { name: 'Clerk', desc: 'Handles authentication (sign in / sign up). Subject to Clerk\'s Privacy Policy.', url: 'https://clerk.com/privacy' },
                { name: 'Supabase', desc: 'Stores user accounts and analysis history. Subject to Supabase\'s Privacy Policy.', url: 'https://supabase.com/privacy' },
                { name: 'Google Gemini AI', desc: 'Processes submitted content for credibility analysis. Subject to Google\'s Privacy Policy.', url: 'https://policies.google.com/privacy' },
              ].map(({ name, desc, url }) => (
                <div key={name} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">{name}</p>
                  <p className="text-sm">{desc} <a href={url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-900 dark:hover:text-slate-100">Learn more</a></p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">5. Data Retention</h2>
            <p>
              Your analysis history is stored as long as your account is active. You can delete individual analyses
              from your dashboard at any time. If you delete your account, all associated data is permanently removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Access the data we hold about you.</li>
              <li>Delete your account and all associated data.</li>
              <li>Use the tool anonymously without creating an account.</li>
              <li>Request a copy of your data at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">7. Security</h2>
            <p>
              We take reasonable measures to protect your data. Authentication is handled by Clerk with
              industry-standard security. Data is stored in Supabase with access controls. However, no
              system is 100% secure and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">8. Children's Privacy</h2>
            <p>
              NoCap AI is not directed at children under 13. We do not knowingly collect personal information
              from children under 13. If you believe a child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of significant changes
              by updating the date at the top of this page. Continued use of NoCap AI after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">10. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please reach out via the NoCap AI platform.
            </p>
          </section>
        </div>

        {/* Agreement banner */}
        <div className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-neutral-950/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">Do you agree to this Privacy Policy?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">By using NoCap AI you agree to the terms above.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
            >
              I Agree
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
