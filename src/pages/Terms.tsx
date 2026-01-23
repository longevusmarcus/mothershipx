import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/AppLayout";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <AppLayout>
      <SEO
        title="Terms of Service"
        description="Terms of Service for MothershipX - Read our terms and conditions for using the platform."
      />

      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: January 23, 2026</p>

          <p>
            Please read these Terms of Service ("Terms") carefully before using MothershipX ("we", "our", or "us"). By
            accessing or using our website, applications, and services (collectively, the "Services"), you agree to be
            bound by these Terms. If you do not agree, please do not use our Services.
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using any part of the Services, you acknowledge that you have read, understood,
              and agree to be bound by these Terms and our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . We may modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Services</h2>
            <p>
              MothershipX is a market intelligence platform that helps indie builders discover verified market demand
              and participate in competitive market auditions ("Arena"). Our Services include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Market problem discovery and analysis tools</li>
              <li>Competitive challenges and leaderboards</li>
              <li>Solution submission and validation systems</li>
              <li>Community features and collaboration tools</li>
              <li>Premium subscription features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Eligibility</h2>
            <p>
              You must be at least 13 years old to use our Services. If you are under 18, you represent that you have
              your parent's or legal guardian's permission to use the Services. By using the Services, you represent and
              warrant that you meet these eligibility requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Account Registration</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must notify us immediately of any unauthorized access to your account</li>
              <li>You may not share your account with others or allow others to access your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Services for any unlawful purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to any part of the Services or systems</li>
              <li>Interfere with or disrupt the Services, servers, or networks</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Harass, abuse, threaten, or harm other users</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Scrape, data mine, or extract data from the Services without permission</li>
              <li>Use automated systems or bots to access the Services</li>
              <li>Circumvent any security measures or rate limits</li>
              <li>Engage in any activity that could damage our reputation or goodwill</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. User Content</h2>
            <p>
              <strong>Ownership:</strong> You retain ownership of content you submit to the Services ("User Content").
              By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, display,
              reproduce, and distribute your User Content in connection with the Services.
            </p>
            <p className="mt-2">
              <strong>Responsibility:</strong> You are solely responsible for your User Content and the consequences of
              posting it. You represent that you have all necessary rights to submit your User Content.
            </p>
            <p className="mt-2">
              <strong>Moderation:</strong> We reserve the right to remove or modify User Content that violates these
              Terms or is otherwise objectionable, at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Arena Challenges and Prizes</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Challenge rules, entry fees, and prize structures are specified for each challenge</li>
              <li>Entry fees are non-refundable once a challenge has begun</li>
              <li>Prize distribution is subject to validation of submissions</li>
              <li>We reserve the right to disqualify submissions that violate rules or appear fraudulent</li>
              <li>Prize winners are responsible for any applicable taxes on winnings</li>
              <li>We reserve the right to modify or cancel challenges with appropriate notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Subscriptions and Payments</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Premium features require a paid subscription</li>
              <li>Subscription fees are billed in advance on a recurring basis</li>
              <li>You authorize us to charge your payment method for all fees</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
              <li>Refunds are provided at our discretion in accordance with our refund policy</li>
              <li>We may change subscription pricing with 30 days' notice</li>
            </ul>
            <p className="mt-2">
              Payment processing is handled securely by Stripe. By making a payment, you also agree to Stripe's terms of
              service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Intellectual Property</h2>
            <p>
              <strong>Our Content:</strong> The Services and their original content (excluding User Content), features,
              and functionality are owned by MothershipX and are protected by copyright, trademark, and other
              intellectual property laws.
            </p>
            <p className="mt-2">
              <strong>Trademarks:</strong> "MothershipX" and our logo are trademarks. You may not use our trademarks
              without prior written consent.
            </p>
            <p className="mt-2">
              <strong>Feedback:</strong> Any feedback, suggestions, or ideas you provide about the Services may be used
              by us without obligation or compensation to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Third-Party Services</h2>
            <p>
              The Services may contain links to third-party websites or integrate with third-party services. We are not
              responsible for the content, privacy practices, or terms of third-party services. Your use of third-party
              services is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Disclaimer of Warranties</h2>
            <p>
              THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
              WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
              FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MOTHERSHIPX SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR
              GOODWILL, ARISING FROM YOUR USE OF THE SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID
              US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless MothershipX and its officers, directors, employees, and
              agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the
              Services, your User Content, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">14. Termination</h2>
            <p>
              We may suspend or terminate your access to the Services at any time, with or without cause, with or
              without notice. Upon termination, your right to use the Services ceases immediately. Provisions that by
              their nature should survive termination will survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">15. Dispute Resolution</h2>
            <p>
              Any disputes arising from these Terms or the Services shall be resolved through binding arbitration in
              accordance with the rules of the American Arbitration Association. You waive any right to participate in
              class action lawsuits or class-wide arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">16. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware,
              United States, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">17. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in
              full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">18. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and MothershipX
              regarding the Services and supersede any prior agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">19. Contact Us</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2">
              <strong>Email:</strong> support@mothership.io
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
