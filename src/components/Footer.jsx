import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

    const NEW_YANKIT_LOGO_URL = "/logo.webp"; 

    const Footer = () => {
      const currentYear = new Date().getFullYear();
      const navigate = useNavigate();

      const handleNavigation = (path) => {
        if (path.startsWith('http://') || path.startsWith('https://')) {
          window.open(path, '_blank', 'noopener noreferrer');
        } else {
          const [pathname, hash] = path.split('#');
          navigate(pathname);
          if (hash) {
            setTimeout(() => {
              const element = document.getElementById(hash);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100); 
          }
        }
      };

      const footerSections = [
        {
          title: "Company",
          links: [
            { name: "About Us", path: "/about" },
            { name: "How <span class='font-vernaccia-bold'>Yankit</span> Works", path: "/how-it-works" },
            { name: "Careers", path: "/careers" },
            { name: "Press", path: "/press" },
          ],
        },
        {
          title: "Support",
          links: [
            { name: "Help Center", path: "/support" },
            { name: "Contact Us", path: "/support#contact" },
            { name: "FAQs", path: "/support#faq" },
            { name: "Trust & Safety", path: "/trust-safety" },
          ],
        },
        {
          title: "Legal",
          links: [
            { name: "Terms of Service", path: "/terms" },
            { name: "Privacy Policy", path: "/privacy" },
            { name: "Cookie Policy", path: "/cookies" },
          ],
        },
        {
          title: "Services",
          links: [
            { name: "Yank a Bag Now", path: "/yank-a-bag-now" },
            { name: "Send a Bag", path: "/send-a-bag" },
            { name: "Flights", path: "/flights" },
          ],
        },
      ];

      const socialLinks = [
        { name: "Facebook", icon: Facebook, path: "https://facebook.com/yankit" },
        { name: "Twitter", icon: Twitter, path: "https://twitter.com/yankit" },
        { name: "Instagram", icon: Instagram, path: "https://instagram.com/yankit" },
        { name: "LinkedIn", icon: Linkedin, path: "https://linkedin.com/company/yankit" },
      ];

      return (
        <footer className="bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-700 dark:from-purple-800 dark:via-indigo-900 dark:to-blue-900 text-purple-100 dark:text-indigo-100">
          <div className="container mx-auto px-4 py-6 md:py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-6 md:mb-10">
              <div className="col-span-2 lg:col-span-1 mb-6 md:mb-0">
                <Link to="/" className="inline-block mb-4">
                  <img src={NEW_YANKIT_LOGO_URL} alt="Yankit Logo" className="h-[74px] w-auto" />
                </Link>
              </div>

              {footerSections.map((section) => (
                <div key={section.title}>
                  <p className="font-semibold text-white dark:text-white mb-3 md:mb-4 text-base md:text-lg">{section.title}</p>
                  <ul className="space-y-1.5 md:space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <button
                          onClick={() => handleNavigation(link.path)}
                          className="text-left text-xs md:text-sm text-purple-200 hover:text-white dark:text-indigo-200 dark:hover:text-white transition-colors duration-200 w-full"
                          dangerouslySetInnerHTML={{ __html: link.name }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-purple-500/50 dark:border-indigo-700/50 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-xs md:text-sm mb-4 md:mb-0 text-purple-200 dark:text-indigo-200">
                &copy; {currentYear} <span className="font-vernaccia-bold">Yankit</span> Proprietary Ltd. All rights reserved.
              </p>
              <div className="flex space-x-3 md:space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="text-purple-300 hover:text-white dark:text-indigo-300 dark:hover:text-white transition-colors duration-200"
                  >
                    <social.icon size={18} className="md:h-5 md:w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      );
    };

    export default Footer;