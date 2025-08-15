// src/components/ui/TermsOfServiceContent.tsx
import React from "react";

const TermsOfServiceContent: React.FC = () => {
  return (
    <div className="text-left text-sm text-gray-700 leading-relaxed">
      <h3 className="font-bold text-lg mb-4">Terms of Service</h3>
      
      <h4 className="font-semibold mb-2">1. Acceptance of Terms</h4>
      <p className="mb-4">
        By accessing and using Shelivery, you accept and agree to be bound by the terms and provision of this agreement.
      </p>

      <h4 className="font-semibold mb-2">2. Service Description</h4>
      <p className="mb-4">
        Shelivery is a platform that connects users for shared delivery services. We facilitate coordination between users but are not responsible for the actual delivery or fulfillment of orders.
      </p>

      <h4 className="font-semibold mb-2">3. User Responsibilities</h4>
      <p className="mb-4">
        Users are responsible for:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Providing accurate information</li>
        <li>Respecting other users and community guidelines</li>
        <li>Ensuring timely participation in shared orders</li>
        <li>Handling payments and deliveries responsibly</li>
      </ul>

      <h4 className="font-semibold mb-2">4. Prohibited Activities</h4>
      <p className="mb-4">
        Users may not:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Use the service for illegal activities</li>
        <li>Harass or abuse other users</li>
        <li>Share false or misleading information</li>
        <li>Attempt to circumvent security measures</li>
      </ul>

      <h4 className="font-semibold mb-2">5. Limitation of Liability</h4>
      <p className="mb-4">
        Shelivery is not liable for any damages arising from the use of our service, including but not limited to delivery issues, payment disputes, or user interactions.
      </p>

      <h4 className="font-semibold mb-2">6. Termination</h4>
      <p className="mb-4">
        We reserve the right to terminate or suspend accounts that violate these terms or engage in harmful behavior.
      </p>

      <h4 className="font-semibold mb-2">7. Changes to Terms</h4>
      <p className="mb-4">
        We may update these terms from time to time. Continued use of the service constitutes acceptance of updated terms.
      </p>

      <h4 className="font-semibold mb-2">8. Contact Information</h4>
      <p className="mb-4">
        For questions about these terms, please contact us through the app or at our support channels.
      </p>
    </div>
  );
};

export default TermsOfServiceContent;
