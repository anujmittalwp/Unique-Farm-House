import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, Database, Mail } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <Eye className="w-6 h-6 text-luxury-gold" />,
      title: "1. Information We Collect",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>When you book a stay or interact with Unique Farm House, we collect information to ensure a seamless farmstay experience. This includes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Personal Information:</strong> Name, email address, phone number, and government-issued ID (required for check-in as per local regulations).</li>
            <li><strong>Booking Details:</strong> Dates of your farmstay, number of guests, special dietary requirements, event details, and payment information.</li>
            <li><strong>Communication:</strong> Records of your inquiries, booking confirmations, and any special requests made prior to or during your stay.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <FileText className="w-6 h-6 text-luxury-gold" />,
      title: "2. How We Use Your Information",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>We use the information collected to provide you with a premium and personalized farmstay experience:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process your reservations, manage your stay, and handle billing.</li>
            <li>To accommodate special requests such as event planning, catering, or specific room arrangements.</li>
            <li>To communicate important updates regarding your booking, check-in instructions, and property rules.</li>
            <li>To improve our property amenities, services, and website functionality based on guest feedback.</li>
            <li>To comply with local hospitality laws and regulations regarding guest registration.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Database className="w-6 h-6 text-luxury-gold" />,
      title: "3. Information Sharing and Disclosure",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>Your privacy is paramount. We do not sell or rent your personal information. We may share your data only under these circumstances:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Service Providers:</strong> With trusted partners who assist in processing payments, managing our booking system, or providing specialized services during your stay (e.g., third-party caterers or event decorators, only with your consent).</li>
            <li><strong>Legal Compliance:</strong> When required by local authorities, law enforcement, or government bodies for security and compliance purposes (e.g., mandatory guest registers).</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Lock className="w-6 h-6 text-luxury-gold" />,
      title: "4. Data Security & Property Privacy",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>We take both your digital data and physical privacy seriously:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Digital Security:</strong> Your booking and payment information is encrypted and stored securely. Access to guest data is restricted to authorized staff only.</li>
            <li><strong>Physical Privacy:</strong> Unique Farm House is a gated, private property. We ensure that your stay, events, and gatherings remain completely private and undisturbed by external parties.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Shield className="w-6 h-6 text-luxury-gold" />,
      title: "5. Your Rights and Choices",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>As our guest, you have rights regarding your personal information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Access and Correction:</strong> You may request to view or update the personal information we hold about you.</li>
            <li><strong>Marketing Communications:</strong> You can opt out of any promotional emails or newsletters at any time.</li>
            <li><strong>Data Deletion:</strong> You may request the deletion of your data, subject to our legal obligations to retain certain booking and financial records.</li>
          </ul>
        </div>
      )
    },
    {
      icon: <Mail className="w-6 h-6 text-luxury-gold" />,
      title: "6. Contact Us",
      content: (
        <div className="space-y-4 text-white/70 leading-relaxed">
          <p>If you have any questions about this Privacy Policy or how we handle your data at Unique Farm House, please reach out to us:</p>
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 mt-4">
            <p className="text-white font-medium">Unique Farm House</p>
            <p className="mt-2">Email: uniquefarms.in@gmail.com</p>
            <p>Phone: +91 7503001001</p>
            <p className="mt-2 text-sm text-white/50">Please note: For immediate assistance during your stay, please contact the property manager directly.</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-luxury-dark text-white pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-playfair mb-6">Privacy Policy</h1>
          <p className="text-luxury-gold uppercase tracking-[0.2em] text-sm">Last Updated: April 2026</p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mt-8 opacity-50"></div>
        </motion.div>

        <div className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-invert max-w-none"
          >
            <p className="text-xl text-white/80 leading-relaxed text-center mb-12">
              Welcome to Unique Farm House. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you book a farmstay, host an event, or use our services.
            </p>
          </motion.div>

          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center border border-luxury-gold/20">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-playfair text-white">{section.title}</h2>
              </div>
              {section.content}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
