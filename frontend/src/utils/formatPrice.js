/**
 * Formats a number as a price with dollar sign and two decimal places
 * @param {number} price - The price value to format
 * @returns {string} - The formatted price string
 */
export const formatPrice = (price) => {
  return `$${Number(price).toFixed(2)}`;
}; 