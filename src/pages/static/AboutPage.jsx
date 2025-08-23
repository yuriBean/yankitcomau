import React from 'react';
    import StaticPageLayout from '@/components/layouts/StaticPageLayout';
    import { Users } from 'lucide-react';

    const AboutPage = () => {
      return (
        <StaticPageLayout title="About Yankit" icon={Users}>
          <p>
            Welcome to <span className="font-vernaccia-bold">Yankit</span>! We are an innovative Australian-based company passionate about connecting people and making global item sharing simpler, more affordable, and community-driven. Our platform was born from the idea that the empty space in travellers' luggage could be a valuable resource for others.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">Our Mission</h2>
          <p>
            Our mission is to revolutionize the way people send and receive items across distances. We aim to empower individuals by providing a secure, reliable, and user-friendly platform that leverages the collective power of the travelling community. We believe in creating a more connected world where sharing resources benefits everyone.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">What We Do</h2>
          <p>
            <span className="font-vernaccia-bold">Yankit</span> facilitates connections between:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Senders:</strong> Individuals or businesses looking for a cost-effective and potentially faster way to send items to various destinations.</li>
            <li><strong>Yankers (Travellers):</strong> Individuals who are already travelling and have spare baggage allowance they are willing to offer to carry items for Senders, earning some money in the process.</li>
          </ul>
          <p>
            Our platform provides tools for searching, communication, secure payments, and building trust within the community.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">Our Values</h2>
          <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Trust & Safety:</strong> We are committed to building a secure environment through user verification, transparent communication, and robust support systems.</li>
            <li><strong>Community:</strong> We believe in the power of community and strive to foster a respectful and collaborative network of users.</li>
            <li><strong>Innovation:</strong> We continuously seek to improve our platform and services to meet the evolving needs of our users.</li>
            <li><strong>Affordability & Accessibility:</strong> We aim to make item sharing more accessible and budget-friendly for everyone.</li>
            <li><strong>Sustainability:</strong> By utilizing existing travel and unused luggage space, we contribute to a more efficient use of resources.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4 text-primary dark:text-secondary">The <span className="font-vernaccia-bold">Yankit</span> Team</h2>
          <p>
            Based in Brisbane, Australia, our dedicated team is comprised of tech enthusiasts, travel lovers, and customer service professionals committed to making <span className="font-vernaccia-bold">Yankit</span> the leading platform for peer-to-peer item sharing.
          </p>
          <p>
            Thank you for being part of the <span className="font-vernaccia-bold">Yankit</span> community!
          </p>
        </StaticPageLayout>
      );
    };

    export default AboutPage;