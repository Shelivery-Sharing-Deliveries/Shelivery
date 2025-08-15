// src/components/ui/PrivacyPolicyContent.tsx
import React, { useRef, useEffect, useState } from 'react';

const PrivacyPolicyContent: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 20) { // Add a small buffer
          setScrolledToBottom(true);
        }
      }
    };

    const contentDiv = contentRef.current;
    if (contentDiv) {
      contentDiv.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (contentDiv) {
        contentDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div ref={contentRef} className="privacy-policy-text space-y-4 text-left">
      <h1 className="font-bold ">Shelivery Privacy Policy</h1>
      <p><strong>Effective Date:</strong> 6 August 2025</p>

      <h2 className="font-bold">Quick Summary</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>We connect people who want to share delivery costs. We are not the sender, courier, or receiver.</li>
        <li>We collect the information you give us, data about your device, location (if enabled), and in-app activity.</li>
        <li>We store in-app messages to operate the service, improve safety, and help resolve disputes.</li>
        <li>We do not process payments yet — any payment is arranged directly between users.</li>
        <li>We use analytics (PostHog) to improve Shelivery and fix bugs.</li>
        <li>You can delete your data at any time by closing your account.</li>
        <li>Your data may be transferred outside Europe but is always protected under GDPR-approved safeguards.</li>
      </ul>

      <h2 className="font-bold">1. Introduction</h2>
      <p>
        Shelivery (“we,” “our,” or “us”) values your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our website, mobile application, and services (collectively, the “Services”).
      </p>
      <p>
        Shelivery connects users who want to share delivery costs. We are not a courier, sender, or receiver. We are not responsible for the quality, legality, or safety of goods delivered, nor for the truth or accuracy of listings.
      </p>
      <p>
        By using Shelivery, you agree to this Privacy Policy. If you do not agree, please do not use our Services.
      </p>

      <h2 className="font-bold">2. Information We Collect</h2>
      <h3 className="font-bold">2.1 Information you provide</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Account details — name, email, password, profile photo.</li>
        <li>Delivery details — pickup/drop-off addresses, preferences, package descriptions, shared delivery arrangements.</li>
        <li>In-app messages — stored to enable communication, ensure safety, and help resolve disputes.</li>
        <li>Support requests — any messages you send to our support team.</li>
      </ul>

      <h3 className="font-bold">2.2 Information we collect automatically</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Device details — IP address, browser type, operating system, device identifiers, app version.</li>
        <li>Usage details — pages/screens visited, search queries, time spent in the app.</li>
        <li>Location data — if enabled, GPS/location data to coordinate deliveries.</li>
      </ul>

      <h3 className="font-bold">2.3 Information from third parties</h3>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Future logins — if you choose to log in via Google, Apple, or similar services.</li>
        <li>Delivery partners or other users — information they provide about your participation in shared deliveries.</li>
      </ul>

      <h2 className="font-bold">3. How We Use Your Information</h2>
      <p>We use your personal data for the following purposes (and legal bases under GDPR & Swiss FADP):</p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-4 border border-gray-300 text-left font-bold">Purpose</th>
            <th className="p-4 border border-gray-300 text-left font-bold">Legal Basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-4 border border-gray-300">Create & manage your account</td>
            <td className="p-4 border border-gray-300">Contract</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Match and coordinate deliveries</td>
            <td className="p-4 border border-gray-300">Contract</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Store & monitor in-app messages for safety & dispute resolution</td>
            <td className="p-4 border border-gray-300">Legitimate interest</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Provide customer support</td>
            <td className="p-4 border border-gray-300">Contract</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Improve and develop our Services</td>
            <td className="p-4 border border-gray-300">Legitimate interest</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Prevent fraud & ensure security</td>
            <td className="p-4 border border-gray-300">Legitimate interest</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Send service updates</td>
            <td className="p-4 border border-gray-300">Contract / Legitimate interest</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Send marketing/promotions (if opted-in)</td>
            <td className="p-4 border border-gray-300">Consent</td>
          </tr>
          <tr>
            <td className="p-4 border border-gray-300">Comply with legal obligations</td>
            <td className="p-4 border border-gray-300">Legal obligation</td>
          </tr>
        </tbody>
      </table>

      <h2 className="font-bold">4. Payments</h2>
      <p>
        We do not currently process payments. Any payment between users is arranged privately and outside our platform.
        In the future, we may introduce integrated payment services, in which case this Privacy Policy will be updated to explain how your payment data is handled.
      </p>

      <h2 className="font-bold">5. Analytics & Tracking</h2>
      <p>
        We use PostHog to measure KPIs, debug technical issues, and improve Shelivery.
        PostHog may collect anonymised or aggregated information about your usage. We do not use analytics for targeted advertising without your consent.
      </p>
      <p>We also use cookies and similar technologies to:</p>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Keep you logged in</li>
        <li>Measure performance</li>
        <li>Improve features</li>
        <li>Show promotions (with consent)</li>
      </ul>

      <h2 className="font-bold">6. Sharing Your Data</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Other Shelivery users (to coordinate deliveries)</li>
        <li>IT, analytics, and customer support providers (under confidentiality agreements)</li>
        <li>Legal authorities when required by law</li>
        <li>Future payment processors (if introduced)</li>
        <li>New owners, if Shelivery is sold or merged</li>
      </ul>

      <h2 className="font-bold">7. Data Retention</h2>
      <p>
        Your account and delivery history remain until you delete your account.
        You can delete your account anytime, and non-essential data will be erased within 30 days.
        We may retain limited information where required by law (e.g., legal disputes).
      </p>

      <h2 className="font-bold">8. Your Rights</h2>
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Access your data</li>
        <li>Correct inaccuracies</li>
        <li>Request deletion</li>
        <li>Restrict or object to processing</li>
        <li>Withdraw consent (for marketing or optional features)</li>
        <li>Receive your data in a portable format</li>
        <li>File a complaint with your local authority (in Switzerland: FDPIC)</li>
      </ul>

      <h2 className="font-bold">9. Data Security</h2>
      <p>
        We use encryption, secure servers, firewalls, and access controls. No method is 100% secure, but we take reasonable measures to protect your data.
      </p>

      <h2 className="font-bold">10. International Data Transfers</h2>
      <p>
        Your data may be processed outside Switzerland/EEA. We use GDPR-approved Standard Contractual Clauses or equivalent safeguards.
      </p>

      <h2 className="font-bold">11. Children’s Privacy</h2>
      <p>
        Our Services are not for individuals under 16. If we find we have collected such data, we will delete it.
      </p>

      <h2 className="font-bold">12. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy. Significant changes will be notified via email or in-app alerts. The “Effective Date” will always reflect the latest version.
      </p>

      <h2 className="font-bold">13. Contact Us</h2>
      <ul>
        <li>Data Controller: Shelivery</li>
        <li>Address: Lausanne, Switzerland</li> 
        <li>Email: admin@shelivery.com</li>   
        
        
      </ul>
    </div>
   
  );
};

export default PrivacyPolicyContent;

