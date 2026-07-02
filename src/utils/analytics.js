/**
 * Google Analytics 4 (GA4) Ecommerce Tracking Utility
 * Official Spec: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

const safeGtag = (...args) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  } else {
    console.warn('GA4 not loaded. Event skipped:', args);
  }
};

/**
 * Format a product for GA4 Ecommerce tracking.
 */
export const formatProduct = (product, quantity = 1) => {
  if (!product) return null;
  return {
    item_id: product._id || product.id || 'unknown',
    item_name: product.name || 'Unknown Product',
    item_category: product.category || 'Uncategorized',
    price: Number(product.price) || 0,
    quantity: Number(quantity) || 1
  };
};

/**
 * General page view tracking.
 */
export const trackPageView = (pageName) => {
  safeGtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

export const trackViewItemList = ({ item_list_id, item_list_name, items }) => {
  safeGtag('event', 'view_item_list', {
    item_list_id: item_list_id || 'default_list',
    item_list_name: item_list_name || 'Default List',
    items: items.map(p => formatProduct(p)).filter(Boolean)
  });
};

export const trackSelectItem = ({ item_list_id, item_list_name, product }) => {
  safeGtag('event', 'select_item', {
    item_list_id: item_list_id || 'default_list',
    item_list_name: item_list_name || 'Default List',
    items: [formatProduct(product)].filter(Boolean)
  });
};

export const trackViewItem = ({ currency = 'INR', value, product }) => {
  safeGtag('event', 'view_item', {
    currency,
    value: Number(value || product?.price || 0),
    items: [formatProduct(product)].filter(Boolean)
  });
};

export const trackAddToCart = ({ currency = 'INR', value, product, quantity = 1 }) => {
  safeGtag('event', 'add_to_cart', {
    currency,
    value: Number(value || (product?.price * quantity) || 0),
    items: [formatProduct(product, quantity)].filter(Boolean)
  });
};

export const trackRemoveFromCart = ({ currency = 'INR', value, product, quantity = 1 }) => {
  safeGtag('event', 'remove_from_cart', {
    currency,
    value: Number(value || (product?.price * quantity) || 0),
    items: [formatProduct(product, quantity)].filter(Boolean)
  });
};

export const trackViewCart = ({ currency = 'INR', value, cartItems }) => {
  safeGtag('event', 'view_cart', {
    currency,
    value: Number(value || 0),
    items: cartItems.map(item => formatProduct(item, item.quantity)).filter(Boolean)
  });
};

export const trackBeginCheckout = ({ currency = 'INR', value, cartItems }) => {
  safeGtag('event', 'begin_checkout', {
    currency,
    value: Number(value || 0),
    items: cartItems.map(item => formatProduct(item, item.quantity)).filter(Boolean)
  });
};

export const trackAddShippingInfo = ({ currency = 'INR', value, cartItems, shipping_tier = 'Standard' }) => {
  safeGtag('event', 'add_shipping_info', {
    currency,
    value: Number(value || 0),
    shipping_tier,
    items: cartItems.map(item => formatProduct(item, item.quantity)).filter(Boolean)
  });
};

export const trackAddPaymentInfo = ({ currency = 'INR', value, cartItems, payment_type = 'Razorpay' }) => {
  safeGtag('event', 'add_payment_info', {
    currency,
    value: Number(value || 0),
    payment_type,
    items: cartItems.map(item => formatProduct(item, item.quantity)).filter(Boolean)
  });
};

export const trackPurchase = ({ transaction_id, currency = 'INR', value, shipping = 0, tax = 0, coupon = '', cartItems }) => {
  safeGtag('event', 'purchase', {
    transaction_id,
    currency,
    value: Number(value || 0),
    shipping: Number(shipping || 0),
    tax: Number(tax || 0),
    coupon,
    items: cartItems.map(item => formatProduct(item, item.quantity)).filter(Boolean)
  });
};

export const trackAddToWishlist = ({ currency = 'INR', value, product }) => {
  safeGtag('event', 'add_to_wishlist', {
    currency,
    value: Number(value || product?.price || 0),
    items: [formatProduct(product)].filter(Boolean)
  });
};

export const trackSearch = ({ search_term }) => {
  safeGtag('event', 'search', {
    search_term
  });
};

export const trackLogin = (method = 'Firebase') => {
  safeGtag('event', 'login', {
    method
  });
};

export const trackSignup = (method = 'Firebase') => {
  safeGtag('event', 'sign_up', {
    method
  });
};
