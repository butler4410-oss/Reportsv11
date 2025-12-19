/**
 * Formats a date string (YYYY-MM-DD) to MM-DD-YYYY format
 */
export const formatDate = (dateStr: string): string => {
  // Handle already formatted dates (MM/DD/YYYY or MM-DD-YYYY)
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateStr)) {
    return dateStr.replace(/\//g, '-');
  }
  
  // Handle ISO format (YYYY-MM-DD)
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    return `${month}-${day}-${year}`;
  }
  
  return dateStr;
};

/**
 * Formats an invoice number to 6-digit numeric format
 * E.g., "INV-732145" -> "732145", "A178-12001" -> "121001"
 */
export const formatInvoiceNumber = (invoiceNum: string): string => {
  // Extract digits only
  const digits = invoiceNum.replace(/\D/g, '');
  
  // Take last 6 digits, or pad with zeros if less
  if (digits.length >= 6) {
    return digits.slice(-6);
  }
  return digits.padStart(6, '0');
};
