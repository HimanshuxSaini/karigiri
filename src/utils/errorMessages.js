/**
 * User-friendly error message mappings to replace technical or coding-style errors.
 */

const ERROR_MESSAGES = {
  // Firebase Auth Errors
  'auth/invalid-email': 'That email doesn\'t seem quite right. Could you double-check the stitching?',
  'auth/user-disabled': 'This account has been gently retired. Please reach out to our artisans for help.',
  'auth/user-not-found': 'We couldn\'t find a Karigiri account with this email. Why not create a new one?',
  'auth/wrong-password': 'The password doesn\'t match our records. Please try again or reset it.',
  'auth/email-already-in-use': 'This email is already part of our family. Try signing in instead!',
  'auth/operation-not-allowed': 'Our workshop isn\'t accepting this sign-in method right now.',
  'auth/weak-password': 'Let\'s make that password a bit stronger—at least 6 characters, like a sturdy weave.',
  'auth/network-request-failed': 'A loose thread in the connection! Please check your internet and try again.',
  'auth/too-many-requests': 'We\'re a bit overwhelmed! Please give our artisans a moment and try again.',
  'auth/popup-closed-by-user': 'The sign-in window was tucked away before we could finish.',
  
  // Custom API / Logic Errors
  'ACCOUNT NOT FOUND': 'We couldn\'t find your Karigiri account. Join our artisanal community today!',
  'FAILED TO SEND OTP': 'The code got lost in the mail. Please double-check your email address.',
  'INVALID CODE': 'That code doesn\'t quite fit. Please check and try one more time.',
  'SERVER UNREACHABLE': 'Our digital workshop is currently being polished. We\'ll be back to our crafts soon.',
  'FAILED TO CONNECT TO FIRESTORE': 'Our artisanal records are momentarily out of reach. We\'re on it!',
  
  // File Uploads
  'UPLOAD TIMED OUT': 'This image is a bit too heavy for our loom. Try a smaller file!',
  'FAILED TO UPLOAD IMAGE': 'We couldn\'t save your image. Please try another one.',
  
  // Orders/Products
  'FAILED TO PLACE ORDER': 'A small stitch went wrong while placing your order. Please try again.',
  'FAILED TO SAVE PRODUCT': 'We couldn\'t save these artisanal details. Please review the form.',
  'FAILED TO DELETE PRODUCT': 'We were unable to remove this item from our collection.',
  'FAILED TO UPDATE ORDER STATUS': 'We couldn\'t update the order status just yet.',
  
  // Default
  'DEFAULT': 'Something went slightly astray. Our artisans are already looking into it!'
};

/**
 * Returns a user-friendly error message based on a code or technical message.
 * @param {string} error - The error code or technical message.
 * @returns {string} - A friendly, branded message.
 */
export const getFriendlyErrorMessage = (error) => {
  if (!error) return ERROR_MESSAGES.DEFAULT;
  
  const errorCode = typeof error === 'string' ? error : (error.code || error.message || '');
  const cleanCode = errorCode.replace('Firebase: ', '').split(' (')[0];
  
  // Check exact mapping
  if (ERROR_MESSAGES[cleanCode]) return ERROR_MESSAGES[cleanCode];
  
  // Check case-insensitive mapping for technical strings
  const upperCode = cleanCode.toUpperCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (key.toUpperCase() === upperCode || upperCode.includes(key.toUpperCase())) {
      return value;
    }
  }
  
  // Fallback to a formatted version of the code if no mapping found
  return cleanCode.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + '.';
};
