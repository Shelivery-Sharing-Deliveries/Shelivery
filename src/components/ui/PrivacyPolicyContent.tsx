// src/components/ui/PrivacyPolicyContent.tsx
import React from "react";

const PrivacyPolicyContent: React.FC = () => {
  return (
    <div className="text-left text-sm text-gray-700 leading-relaxed">
      <h3 className="font-bold text-lg mb-4">Privacy Policy</h3>
      <p className="mb-4"><strong>Effective Date:</strong> 6 August 2025</p>

      <h4 className="font-semibold mb-2">Quick Summary</h4>
      <ul className="list-disc pl-6 mb-4">
        <li>We connect people who want to share delivery costs</li>
        <li>We collect information you provide and usage data</li>
        <li>We store messages to operate the service and ensure safety</li>
        <li>We do not process payments yet — arranged directly between users</li>
        <li>We use analytics to improve Shelivery and fix bugs</li>
        <li>You can delete your data by closing your account</li>
        <li>Your data is protected under GDPR-approved safeguards</li>
      </ul>

      <h4 className="font-semibold mb-2">1. Introduction</h4>
      <p className="mb-4">
        Shelivery values your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal data when you use our services.
      </p>
      <p className="mb-4">
        We connect users who want to share delivery costs. We are not a courier, sender, or receiver. By using Shelivery, you agree to this Privacy Policy.
      </p>

      <h4 className="font-semibold mb-2">2. Information We Collect</h4>
      <p className="mb-4">We collect information you provide:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Account details (name, email, password, profile photo)</li>
        <li>Delivery details (addresses, preferences, package descriptions)</li>
        <li>In-app messages for communication and safety</li>
        <li>Support requests and feedback</li>
      </ul>

      <p className="mb-4">We automatically collect:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Device information (IP address, browser type, operating system)</li>
        <li>Usage data (pages visited, time spent in app)</li>
        <li>Location data (if enabled) for delivery coordination</li>
      </ul>

      <h4 className="font-semibold mb-2">3. How We Use Your Information</h4>
      <p className="mb-4">We use your data to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Create and manage your account</li>
        <li>Match and coordinate deliveries</li>
        <li>Monitor messages for safety and dispute resolution</li>
        <li>Provide customer support</li>
        <li>Improve and develop our services</li>
        <li>Prevent fraud and ensure security</li>
        <li>Send service updates and notifications</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h4 className="font-semibold mb-2">4. Payments</h4>
      <p className="mb-4">
        We do not currently process payments. Any payment between users is arranged privately. In the future, we may introduce integrated payment services with updated privacy terms.
      </p>

      <h4 className="font-semibold mb-2">5. Analytics & Tracking</h4>
      <p className="mb-4">
        We use PostHog to measure performance, debug issues, and improve Shelivery. We also use cookies to keep you logged in, measure performance, and improve features.
      </p>

      <h4 className="font-semibold mb-2">6. Sharing Your Data</h4>
      <p className="mb-4">We may share your data with:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Other Shelivery users (to coordinate deliveries)</li>
        <li>Service providers (under confidentiality agreements)</li>
        <li>Legal authorities when required by law</li>
        <li>Future payment processors (if introduced)</li>
        <li>New owners, if Shelivery is sold or merged</li>
      </ul>

      <h4 className="font-semibold mb-2">7. Data Retention</h4>
      <p className="mb-4">
        Your account and delivery history remain until you delete your account. You can delete your account anytime, and non-essential data will be erased within 30 days.
      </p>

      <h4 className="font-semibold mb-2">8. Your Rights</h4>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Access your data</li>
        <li>Correct inaccuracies</li>
        <li>Request deletion</li>
        <li>Restrict or object to processing</li>
        <li>Withdraw consent for marketing</li>
        <li>Receive your data in a portable format</li>
        <li>File a complaint with authorities</li>
      </ul>

      <h4 className="font-semibold mb-2">9. Data Security</h4>
      <p className="mb-4">
        We use encryption, secure servers, firewalls, and access controls to protect your data. While no method is 100% secure, we take reasonable measures to safeguard your information.
      </p>

      <h4 className="font-semibold mb-2">10. International Data Transfers</h4>
      <p className="mb-4">
        Your data may be processed outside Switzerland/EEA using GDPR-approved safeguards and Standard Contractual Clauses.
      </p>

      <h4 className="font-semibold mb-2">11. Children's Privacy</h4>
      <p className="mb-4">
        Our services are not for individuals under 16. If we discover we have collected such data, we will delete it immediately.
      </p>

      <h4 className="font-semibold mb-2">12. Changes to This Policy</h4>
      <p className="mb-4">
        We may update this Privacy Policy. Significant changes will be notified via email or in-app alerts. The "Effective Date" reflects the latest version.
      </p>

      <h4 className="font-semibold mb-2">13. Contact Information</h4>
      <p className="mb-4">
        For questions about this Privacy Policy, please contact us:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Data Controller: Shelivery</li>
        <li>Address: Lausanne, Switzerland</li>
        <li>Email: admin@shelivery.com</li>
      </ul>
    </div>
  );
};

export default PrivacyPolicyContent;
