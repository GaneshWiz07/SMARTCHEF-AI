/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Calculate days until expiry
 */
export const daysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null;
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return days;
};

/**
 * Check if item is expiring soon (within 3 days)
 */
export const isExpiringSoon = (expiryDate) => {
  const days = daysUntilExpiry(expiryDate);
  return days !== null && days <= 3 && days >= 0;
};

/**
 * Check if item is expired
 */
export const isExpired = (expiryDate) => {
  const days = daysUntilExpiry(expiryDate);
  return days !== null && days < 0;
};

/**
 * Calculate health score based on nutrition
 */
export const calculateHealthScore = (nutrition) => {
  let score = 50; // Base score

  if (!nutrition) return score;

  const { macros, vitamins } = nutrition;

  // Bonus for good nutrients
  if (macros?.fiber?.amount > 10) score += 10;
  if (macros?.protein?.amount > 20) score += 10;
  if (vitamins?.vitaminA > 40) score += 5;
  if (vitamins?.vitaminC > 40) score += 5;

  // Penalty for excessive nutrients
  if (macros?.fat?.amount > 50) score -= 10;
  if (macros?.carbs?.amount > 80) score -= 5;

  return Math.max(0, Math.min(100, score));
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Get dietary icon
 */
export const getDietaryIcon = (dietary) => {
  const icons = {
    vegetarian: '🥗',
    vegan: '🌱',
    keto: '🥑',
    paleo: '🍖',
    'low-carb': '🥩',
    seafood: '🐟',
    none: '🍽️',
  };
  return icons[dietary] || '🍽️';
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};


