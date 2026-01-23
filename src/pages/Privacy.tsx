import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/AppLayout";

export default function Privacy() {
  return (
    <AppLayout>
      <SEO title="Privacy Policy" description="Privacy Policy for MothershipX - Learn how we collect, use, and protect your personal information." />

      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: January 23, 2026
          </p>

          <p>
            This Privacy Policy describes how MothershipX ("we", "our", or "us") collects, uses, and shares
            information about you when you use our website, applications, and services (collectively, the "Services").
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Information You Provide</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
              <li><strong>Profile Information:</strong> Bio, location, website, and social media links you choose to add</li>
              <li><strong>User Content:</strong> Solutions, submissions, comments, and other content you create</li>
              <li><strong>Payment Information:</strong> Billing details and transaction history (processed securely by Stripe)</li>
              <li><strong>Communications:</strong> Messages and feedback you send to us</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Information Collected Automatically</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
              <li><strong>Log Data:</strong> IP address, access times, and referring URLs</li>
              <li><strong>Cookies:</strong> Session cookies and persistent cookies for authentication and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Third-Party Authentication</h2>
            <p>
              When you sign in using Google OAuth, we receive your name, email address, and profile picture
              from Google. We use this information solely to create and manage your account. We do not
              access your Google contacts, calendar, or other Google services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve our Services</li>
              <li>Create and manage your account</li>
              <li>Process transactions and send related notifications</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent or unauthorized activities</li>
              <li>Personalize and improve your experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
            <p>
              <strong>We do not sell your personal information.</strong> We may share your information in these circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Service Providers:</strong> With vendors who assist in operations (hosting, analytics, payment processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law, subpoena, or legal process</li>
              <li><strong>Protection:</strong> To protect our rights, privacy, safety, or property</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="mt-4">
              <strong>Public Information:</strong> Your username, profile picture, public profile information, and
              submitted solutions may be visible to other users according to your privacy settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              services. You can request deletion of your account and associated data at any time through your
              profile settings or by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information,
              including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Encryption of data in transit (TLS/SSL) and at rest</li>
              <li>Secure authentication mechanisms</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls limiting employee access to personal data</li>
              <li>Row-Level Security (RLS) policies on database tables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights and Choices</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, visit your profile settings or contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session, remember preferences, and
              analyze usage. You can control cookies through your browser settings, though disabling cookies
              may limit functionality.
            </p>
            <p className="mt-2">Types of cookies we use:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Essential:</strong> Required for authentication and core functionality</li>
              <li><strong>Functional:</strong> Remember your preferences (e.g., theme settings)</li>
              <li><strong>Analytics:</strong> Help us understand usage patterns to improve the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              Our Services are not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If we become aware that we have collected such
              information, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure
              appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by
              posting the new policy on this page and updating the "Last updated" date. Your continued use of
              the Services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> support@mothership.io
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
