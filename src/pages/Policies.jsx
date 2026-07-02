import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { BRAND, WHATSAPP } from '../config/constants';

const policyContent = {
  'privacy-policy': {
    title: 'Privacy Policy',
    lastUpdated: '15 May, 2026',
    sections: [
      {
        heading: 'Information We Collect',
        content: `When you visit our website or make a purchase, we collect certain information including your name, email address, phone number, shipping address, and payment details. We also collect browsing data such as pages visited, products viewed, and device information to improve your shopping experience.`
      },
      {
        heading: 'How We Use Your Information',
        content: `Your information is used to process orders, communicate order updates via email and WhatsApp, improve our website experience, send promotional offers (with your consent), and provide customer support. We do not sell or rent your personal data to third parties.`
      },
      {
        heading: 'Data Security',
        content: `We implement industry-standard security measures including SSL encryption, Firebase Authentication, and secure cloud storage to protect your personal information. Payment processing is handled through secure third-party providers.`
      },
      {
        heading: 'Cookies',
        content: `Our website uses cookies and local storage to remember your preferences, shopping cart, and login sessions. You can disable cookies in your browser settings, though this may affect some functionality.`
      },
      {
        heading: 'Your Rights',
        content: `You have the right to access, update, or delete your personal data at any time. You can manage your profile information through your account settings or contact us directly for data-related requests.`
      },
      {
        heading: 'Contact Us',
        content: `For any privacy-related queries, please reach out to us at ${BRAND.salesEmail} or call ${BRAND.phone}.`
      }
    ]
  },
  'terms': {
    title: 'Terms & Conditions',
    lastUpdated: '15 May, 2026',
    sections: [
      {
        heading: 'Acceptance of Terms',
        content: `By accessing and using the PrathamKarigiri website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website.`
      },
      {
        heading: 'Products & Pricing',
        content: `All products listed on PrathamKarigiri are handcrafted artisanal items. Prices are listed in Indian Rupees (₹) and are inclusive of all applicable taxes. Due to the handmade nature of our products, slight variations in color, texture, and dimensions are natural and expected.`
      },
      {
        heading: 'Orders & Payment',
        content: `By placing an order, you confirm that all details provided are accurate. Orders are processed upon confirmation via WhatsApp and payment verification. We reserve the right to cancel orders that appear fraudulent or suspicious.`
      },
      {
        heading: 'Intellectual Property',
        content: `All content on this website — including product images, descriptions, logos, and designs — is the intellectual property of ${BRAND.fullName} and may not be reproduced without written permission.`
      },
      {
        heading: 'Limitation of Liability',
        content: `PrathamKarigiri shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our maximum liability is limited to the purchase price of the product in question.`
      },
      {
        heading: 'Governing Law',
        content: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Sonipat, Haryana.`
      }
    ]
  },
  'returns': {
    title: 'Returns & Exchange Policy',
    lastUpdated: '15 May, 2026',
    sections: [
      {
        heading: 'Return Window',
        content: `We offer a hassle-free 7-day return and exchange policy from the date of delivery. Products must be unused, unwashed, and in their original packaging with all tags intact.`
      },
      {
        heading: 'How to Initiate a Return',
        content: `To initiate a return or exchange, contact us via WhatsApp at ${WHATSAPP.displayNumber} or email ${BRAND.salesEmail} with your order ID and reason for return. Our team will guide you through the process within 24 hours.`
      },
      {
        heading: 'Non-Returnable Items',
        content: `Customized or made-to-order products, yarn/raw materials once opened, and products marked as "Final Sale" are not eligible for returns. Items with signs of use, washing, or damage by the customer cannot be returned.`
      },
      {
        heading: 'Refund Process',
        content: `Once we receive and inspect the returned product, refunds are processed within 5-7 business days to the original payment method. Shipping charges for returns are borne by the customer unless the product was defective or incorrect.`
      },
      {
        heading: 'Exchanges',
        content: `We offer free exchanges for size-related issues on standard products. Exchanges are subject to product availability. If the desired item is unavailable, a full refund will be issued.`
      }
    ]
  },
  'shipping': {
    title: 'Shipping Policy',
    lastUpdated: '15 May, 2026',
    sections: [
      {
        heading: 'Delivery Coverage',
        content: `We deliver across India (Pan-India delivery). International shipping is currently not available but is planned for the future.`
      },
      {
        heading: 'Processing Time',
        content: `Orders are processed within 1-2 business days. Custom or made-to-order products may take 3-7 business days for preparation before shipping.`
      },
      {
        heading: 'Delivery Time',
        content: `Standard delivery takes 5-7 business days from the date of dispatch. Metro cities typically receive orders within 3-5 days. Remote areas may take up to 10 business days.`
      },
      {
        heading: 'Shipping Charges',
        content: `Free delivery on all prepaid orders above ₹1,000. First-time customers enjoy free delivery on their first order regardless of order value. Individual delivery charges may apply for certain handcrafted products as noted on the product page.`
      },
      {
        heading: 'Order Tracking',
        content: `Once your order is dispatched, you will receive a tracking number via WhatsApp and email. You can also check your order status from your profile dashboard.`
      }
    ]
  },
  'contact': {
    title: 'Contact Us',
    lastUpdated: '15 May, 2026',
    sections: [
      {
        heading: 'Get In Touch',
        content: `We'd love to hear from you! Whether you have questions about our products, need help with an order, or want to discuss a custom creation, our team is here to help.`
      },
      {
        heading: 'WhatsApp (Fastest)',
        content: `Reach us instantly on WhatsApp at ${WHATSAPP.displayNumber}. Our team typically responds within 30 minutes during business hours (10 AM - 7 PM IST).`
      },
      {
        heading: 'Email',
        content: `For detailed inquiries, orders, or business proposals, email us at ${BRAND.salesEmail}. We respond to all emails within 24 hours.`
      },
      {
        heading: 'Phone',
        content: `Call us at ${BRAND.phone} during business hours (Monday to Saturday, 10 AM - 7 PM IST).`
      },
      {
        heading: 'Visit Our Studio',
        content: `${BRAND.address.line1}, ${BRAND.address.line2}, ${BRAND.address.city}, ${BRAND.address.state} - ${BRAND.address.pincode}, ${BRAND.address.country}. Studio visits are by appointment only — please WhatsApp us to schedule.`
      }
    ]
  }
};

const Policies = () => {
  const { type } = useParams();
  const data = policyContent[type];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [type]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="pt-32 pb-24 text-center px-4">
          <h1 className="text-3xl font-serif font-bold text-[var(--primary)] mb-4">Page Not Found</h1>
          <Link to="/" className="text-[var(--primary)] font-bold hover:underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <SEO 
        title={`${policyData.title} | PrathamKarigiri`}
        description={`Read the ${policyData.title} for PrathamKarigiri.`}
      />
      <Navbar />
      <div className="pt-28 md:pt-36 pb-24 max-w-3xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Breadcrumb */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{data.title}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--primary)] mb-10">
            {data.title}
          </h1>

          <div className="space-y-8">
            {data.sections.map((section, idx) => (
              <motion.section
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm"
              >
                <h2 className="text-lg font-bold text-[var(--text-main)] mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mr-3 flex-shrink-0"></span>
                  {section.heading}
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed pl-5">
                  {section.content}
                </p>
              </motion.section>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-[var(--text-muted)] mb-4">Have questions about our policies?</p>
            <a
              href={`${WHATSAPP.chatUrl}?text=Hi, I have a question about your ${data.title}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 bg-[#25D366] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#128C7E] transition-all shadow-lg"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Policies;
