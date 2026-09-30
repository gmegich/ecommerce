/**
 * Generate a unique-looking order number, e.g. NL-20260930-A3F9C2
 */
const generateOrderNumber = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NL-${y}${m}${d}-${random}`;
};

module.exports = generateOrderNumber;
