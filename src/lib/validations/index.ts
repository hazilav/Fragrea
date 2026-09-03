export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  data?: T;
}

export function validateProduct(data: any): ValidationResult<any> {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    errors.name = 'Product name is required';
  }

  if (!data.sku || typeof data.sku !== 'string' || !data.sku.trim()) {
    errors.sku = 'SKU is required';
  }

  if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) {
    errors.price = 'Valid positive price is required';
  }

  if (data.salePrice !== undefined && data.salePrice !== null && data.salePrice !== '') {
    if (isNaN(Number(data.salePrice)) || Number(data.salePrice) < 0) {
      errors.salePrice = 'Sale price must be a valid positive number';
    } else if (Number(data.salePrice) >= Number(data.price)) {
      errors.salePrice = 'Sale price must be lower than original price';
    }
  }

  if (data.stockQuantity !== undefined && (isNaN(Number(data.stockQuantity)) || Number(data.stockQuantity) < 0)) {
    errors.stockQuantity = 'Stock quantity must be non-negative integer';
  }

  const validStatuses = ['ACTIVE', 'DRAFT', 'ARCHIVED'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

export function validateOrder(data: any): ValidationResult<any> {
  const errors: Record<string, string> = {};

  if (!data.customerName || !data.customerName.trim()) {
    errors.customerName = 'Customer name is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.customerEmail || !emailRegex.test(data.customerEmail)) {
    errors.customerEmail = 'A valid email address is required';
  }

  if (!data.customerPhone || !data.customerPhone.trim()) {
    errors.customerPhone = 'Contact phone number is required';
  }

  if (!data.country || !data.country.trim()) {
    errors.country = 'Destination country is required';
  }

  if (!data.state || !data.state.trim()) {
    errors.state = 'State / Region is required';
  }

  if (!data.city || !data.city.trim()) {
    errors.city = 'City is required';
  }

  if (!data.shippingAddress && !data.shippingAddressLine1) {
    errors.shippingAddress = 'Shipping address is required';
  }

  if (!data.postalCode || !data.postalCode.trim()) {
    errors.postalCode = 'Postal / ZIP code is required';
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.items = 'Order must contain at least one fragrance item';
  } else {
    data.items.forEach((item: any, idx: number) => {
      if (!item.productId) {
        errors[`items[${idx}].productId`] = 'Product ID is required';
      }
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty < 1 || !Number.isInteger(qty)) {
        errors[`items[${idx}].quantity`] = 'Quantity must be a positive whole integer';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

export function validateCoupon(data: any): ValidationResult<any> {
  const errors: Record<string, string> = {};

  if (!data.code || !data.code.trim()) {
    errors.code = 'Coupon code is required';
  }

  if (!data.discountValue || isNaN(Number(data.discountValue)) || Number(data.discountValue) <= 0) {
    errors.discountValue = 'Valid positive discount value required';
  }

  if (data.discountType && !['PERCENTAGE', 'FIXED_AMOUNT'].includes(data.discountType)) {
    errors.discountType = 'Discount type must be PERCENTAGE or FIXED_AMOUNT';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

export function validateAddress(data: any): ValidationResult<any> {
  const errors: Record<string, string> = {};

  if (!data.firstName || !data.firstName.trim()) errors.firstName = 'First name is required';
  if (!data.lastName || !data.lastName.trim()) errors.lastName = 'Last name is required';
  if (!data.addressLine1 || !data.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required';
  if (!data.city || !data.city.trim()) errors.city = 'City is required';
  if (!data.postalCode || !data.postalCode.trim()) errors.postalCode = 'Postal code is required';
  if (!data.country || !data.country.trim()) errors.country = 'Country is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  };
}

/**
 * Sanitizes untrusted user strings to protect against XSS and script injection.
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== 'string') return '';
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

