// ===================================================================
// Centralized Configuration — Single source of truth
// Update these values once and they propagate everywhere.
// ===================================================================

// Admin emails authorized for admin panel access
export const ADMIN_EMAILS = [
  'himanshu0481@gmail.com',
  'admin@karigiri.com'
];

// Check if a given email is an admin
export const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

// WhatsApp contact configuration
export const WHATSAPP = {
  number: '917027311213',         // International format without +
  displayNumber: '+91 70273 11213',
  chatUrl: 'https://wa.me/917027311213',
};

// Brand information
export const BRAND = {
  name: 'KARIGIRI',
  tagline: 'Artisanal Woolens & Yarn',
  fullName: 'Karigiri Handcrafted Pvt Ltd',
  email: 'karigiri@gmail.com',
  salesEmail: 'sales@karigiri.com',
  phone: '+91 70273 11213',
  address: {
    line1: '573, behind Holy Child School',
    line2: 'Rajiv Nagar, Sector 1A',
    city: 'Sonipat',
    state: 'Haryana',
    pincode: '131001',
    country: 'India',
  },
  social: {
    instagram: 'https://www.instagram.com/karigiri_official',
    facebook: 'https://www.facebook.com/karigiri',
    twitter: 'https://twitter.com/karigiri',
    youtube: 'https://www.youtube.com/@karigiri',
  },
};
