export interface ProductImageData {
  id?: string;
  productId?: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface FragranceNoteData {
  id: string;
  name: string;
  category?: string | null;
  origin?: string | null;
  description?: string | null;
}

export interface ProductNoteData {
  id?: string;
  productId?: string;
  fragranceNoteId: string;
  fragranceNote?: FragranceNoteData;
  noteType: 'TOP' | 'HEART' | 'BASE' | string;
  displayOrder: number;
}

export interface InventoryData {
  id?: string;
  productId?: string;
  quantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  batchNumber?: string | null;
  restockDate?: string | Date | null;
}

export interface CollectionData {
  id: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  heroImage?: string | null;
  featured: boolean;
  status: string;
  products?: ProductData[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  size: string;
  stockQuantity: number;
  status: string;
  featured: boolean;
  newArrival: boolean;
  collectionId?: string | null;
  collection?: CollectionData | null;
  topNotes?: string[] | null;
  heartNotes?: string[] | null;
  baseNotes?: string[] | null;
  baseDescription?: string | null;
  subtitle?: string | null;
  stock: number;
  volume?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  isSale?: boolean;
  olfactoryFamily?: string;
  rating?: number;
  longevity?: string;
  sillage?: string;
  concentration?: string;
  gender?: string;
  images?: string[];
  productNotes?: ProductNoteData[];
  inventory?: InventoryData | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserData {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  createdAt: string | Date;
}

export interface AdminData {
  id: string;
  userId: string;
  role: string;
  permissions?: string | null;
  lastLoginAt?: string | Date | null;
}

export interface CustomerData {
  id: string;
  userId?: string | null;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  city?: string | null;
  country?: string | null;
  totalOrders: number;
  totalSpent: number;
  addresses?: AddressData[];
  createdAt: string | Date;
}

export interface AddressData {
  id: string;
  userId?: string | null;
  customerId?: string | null;
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
}

export interface CartItemData {
  id?: string;
  cartId?: string;
  productId: string;
  product?: ProductData;
  size: string;
  quantity: number;
  unitPrice: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  volume: string;
  slug: string;
  quantity: number;
}

export interface CartData {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  status: string;
  giftWrap: boolean;
  sampleChoices?: string | null;
  couponId?: string | null;
  items: CartItemData[];
}

export interface CouponData {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
}

export interface OrderItemData {
  id?: string;
  orderId?: string;
  productId?: string | null;
  product?: ProductData | null;
  productName: string;
  productSku: string;
  productImage?: string | null;
  size: string;
  volume?: string;
  unitPrice: number;
  price?: number;
  quantity: number;
  totalPrice: number;
  total?: number;
}

export interface PaymentData {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  transactionId?: string | null;
}

export interface ShippingData {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED';
  estimatedDelivery?: string | Date | null;
  dispatchedAt?: string | Date | null;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerId?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string | null;
  shippingAddressId?: string | null;
  shippingAddress?: AddressData | null;
  billingAddressId?: string | null;
  billingAddress?: AddressData | null;
  apartment?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | string;
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
  couponId?: string | null;
  giftWrap: boolean;
  sampleChoices?: string | null;
  samples?: string | null;
  specialInstructions?: string | null;
  notes?: string | null;
  items: OrderItemData[];
  payments?: PaymentData[];
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  shipment?: ShippingData | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  recentOrders: OrderData[];
}
