// ===================================================================
// Centralized Configuration — Single source of truth
// Update these values once and they propagate everywhere.
// ===================================================================

// Admin emails authorized for admin panel access
export const ADMIN_EMAILS = [
  'himanshu0481@gmail.com',
  'artech2k10@gmail.com'
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
  name: 'PrathamKarigiri',
  tagline: 'Artisanal Woolens & Yarn',
  fullName: 'pratham ai gurukul (Pratham Guru Education and Welfare Society)',
  email: 'prathamkarigiri@gmail.com',
  salesEmail: 'sales@prathamkarigiri.in',
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
    instagram: 'https://www.instagram.com/prathamkarigiri.in',
    facebook: 'https://www.facebook.com/prathamkarigiri',
    twitter: 'https://twitter.com/prathamkarigiri',
    youtube: 'https://www.youtube.com/@prathamkarigiri',
  },
};
