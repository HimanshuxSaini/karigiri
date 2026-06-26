// ===================================================================
// Server-side Centralized Configuration
// Keep in sync with frontend src/config/constants.js
// ===================================================================

const ADMIN_EMAILS = [
  'himanshu0481@gmail.com',
  'admin@prathamkarigiri.in'
];

const isAdminEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const BRAND = {
  name: 'PrathamKarigiri',
  email: 'prathamkarigiri@gmail.com',
  phone: '+91 70273 11213',
  address: 'Sonipat, Haryana, India',
};

module.exports = { ADMIN_EMAILS, isAdminEmail, BRAND };
