import React from 'react';
    import StaticPageLayout from '@/components/layouts/StaticPageLayout';
    import { ShieldCheck } from 'lucide-react';

    const TrustSafetyPage = () => {
      return (
        <StaticPageLayout title="Trust & Safety at Yankit" icon={ShieldCheck}>
          <p>
            At <span className="font-vernaccia-bold">Yankit</span>, creating a trustworthy and secure environment for our community is our top priority. We understand that you're entrusting us and other users with your items and travel plans, and we take that responsibility seriously. Here’s how we work to keep <span className="font-vernaccia-bold">Yankit</span> safe for everyone.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">Our Commitment to Safety</h2>
          <ul className="list-disc list-inside ml-4 space-y-3">
            <li>
              <strong>User Verification:</strong> We encourage all users to complete their profiles and may implement verification processes to enhance accountability within our community.
            </li>
            <li>
              <strong>Secure In-App Communication:</strong> All communication between Senders and Yankers (Travellers) should take place through our secure in-app messaging system. This creates a record of your conversations and agreements, which can be helpful if issues arise.
            </li>
            <li>
              <strong>Secure Payments:</strong> Our platform integrates with trusted payment gateways (like Stripe) to handle transactions securely. Funds are held by <span className="font-vernaccia-bold">Yankit</span> and released to the Yanker only after the Sender confirms successful receipt of the item(s).
            </li>
            <li>
              <strong>Community Guidelines:</strong> We have clear Community Guidelines that all users must adhere to. These guidelines promote respectful interactions and responsible use of the platform. Violations can lead to account suspension or termination.
            </li>
            <li>
              <strong>Reviews and Ratings:</strong> After a transaction is completed, both Senders and Yankers can rate and review each other. This system helps build trust and allows users to make informed decisions.
            </li>
            <li>
              <strong>Dispute Resolution:</strong> In the unfortunate event of a disagreement or issue, <span className="font-vernaccia-bold">Yankit</span> offers a dispute resolution process. Our support team will review the case based on the information provided, including in-app communication logs.
            </li>
            <li>
              <strong>Prohibited Items & Activities:</strong> <span className="font-vernaccia-bold">Yankit</span> strictly prohibits the sending or carrying of illegal goods, hazardous materials, weapons, counterfeit items, and any other items restricted by airline regulations or customs laws of the origin and destination countries. Users are solely responsible for ensuring their items comply with all applicable laws.
            </li>
            <li>
              <strong>Data Privacy:</strong> We are committed to protecting your personal information. Please review our <a href="/privacy" className="text-primary hover:underline dark:text-secondary">Privacy Policy</a> for details on how we collect, use, and protect your data.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">Your Role in Staying Safe</h2>
          <p>
            Safety is a shared responsibility. Here are some tips for Senders and Yankers:
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-800 dark:text-slate-100">For Senders:</h3>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Be Clear and Honest:</strong> Accurately describe the items you want to send. Do not attempt to send prohibited items.</li>
            <li><strong>Communicate Thoroughly:</strong> Discuss all details with the Yanker via in-app chat, including item specifics, packaging, and pickup/drop-off arrangements.</li>
            <li><strong>Check Reviews:</strong> Look at the Yanker's profile, ratings, and reviews before finalizing an agreement.</li>
            <li><strong>Use Secure Payment:</strong> Always make payments through the <span className="font-vernaccia-bold">Yankit</span> platform. Do not engage in off-platform payments.</li>
            <li><strong>Confirm Receipt Promptly:</strong> Once you receive your items as agreed, confirm delivery on the platform so the Yanker can be paid.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-800 dark:text-slate-100">For Yankers (Travellers):</h3>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Know What You're Carrying:</strong> Communicate clearly with the Sender about the items. If you are uncomfortable with an item, do not agree to carry it. You have the right to inspect items (with the Sender's permission and presence if possible) to ensure they match the description and are not prohibited.</li>
            <li><strong>Understand Regulations:</strong> Be aware of customs and airline regulations for both your origin and destination countries regarding the items you agree to carry. You are responsible for complying with these laws.</li>
            <li><strong>Communicate Your Availability:</strong> Clearly state your travel dates and baggage capacity.</li>
            <li><strong>Check Reviews:</strong> Look at the Sender's profile, ratings, and reviews.</li>
            <li><strong>Report Suspicious Activity:</strong> If you encounter any suspicious requests or behaviour, report it to <span className="font-vernaccia-bold">Yankit</span> support immediately.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">Reporting Issues</h2>
          <p>
            If you encounter any safety concerns, violations of our Community Guidelines, or suspicious activity, please contact our support team immediately through the <a href="/support" className="text-primary hover:underline dark:text-secondary">Help Center</a> or by emailing <a href="mailto:safety@yankit.com.au" className="text-primary hover:underline dark:text-secondary">safety@yankit.com.au</a>.
          </p>
          <p>
            Your vigilance helps us maintain a safe and trusted platform for everyone.
          </p>
        </StaticPageLayout>
      );
    };

    export default TrustSafetyPage;