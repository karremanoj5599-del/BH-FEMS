// Common formatting utilities

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '-';
  return `₹${parseFloat(amount).toFixed(2)}`;
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};
