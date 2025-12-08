// Base types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string | null;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  description: string | null;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  products_count?: number;
  subcategories?: Category[];
  parent?: Category;
}

// Supplier types
export interface Supplier extends BaseEntity {
  company_name: string;
  legal_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  fiscal_id: string | null;
  business_registration: string | null;
  vat_number: string | null;
  payment_terms: string | null;
  preferred_payment_method: string | null;
  shipping_terms: string | null;
  lead_time_days: number;
  reliability_rating: number;
  quality_rating: number;
  communication_rating: number;
  is_active: boolean;
  is_preferred: boolean;
  notes: string | null;
  tags: string[] | null;
  full_address?: string;
  products_count?: number;
}

// Product types
export interface Product extends BaseEntity {
  name: string;
  description: string | null;
  short_description: string | null;
  sku: string;
  barcode: string | null;
  category_id: string;
  hair_type: string | null;
  hair_texture: string | null;
  hair_length: string | null;
  hair_color: string | null;
  hair_origin: string | null;
  hair_quality: string | null;
  weight_grams: number | null;
  bundle_pieces: number;
  package_dimensions: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  cost_price: number | null;
  wholesale_price: number | null;
  retail_price: number | null;
  supplier_id: string;
  supplier_sku: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  main_image: string | null;
  additional_images: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  search_keywords: string | null;
  
  // Relationships
  category?: Category;
  supplier?: Supplier;
  
  // Computed properties
  available_quantity: number;
  needs_restock: boolean;
}

// Inventory types
export interface InventoryMovement extends BaseEntity {
  product_id: string;
  movement_type: 'stock_in' | 'stock_out' | 'reserved' | 'released';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type: string | null;
  reference_id: string | null;
  reason: string;
  notes: string | null;
  performed_by: string | null;
  
  // Relationships
  product?: Product;
}

// Form types
export interface ProductFormData {
  name: string;
  description: string;
  short_description: string;
  sku: string;
  barcode: string;
  category_id: string;
  hair_type: string;
  hair_texture: string;
  hair_length: string;
  hair_color: string;
  hair_origin: string;
  hair_quality: string;
  weight_grams: number | null;
  bundle_pieces: number;
  package_dimensions: string;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number | null;
  cost_price: number | null;
  wholesale_price: number | null;
  retail_price: number | null;
  supplier_id: string;
  supplier_sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  main_image: string;
  meta_title: string;
  meta_description: string;
  search_keywords: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  parent_id: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface SupplierFormData {
  company_name: string;
  legal_name: string;
  contact_person: string;
  email: string;
  phone: string;
  whatsapp: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  fiscal_id: string;
  business_registration: string;
  vat_number: string;
  payment_terms: string;
  preferred_payment_method: string;
  shipping_terms: string;
  lead_time_days: number;
  reliability_rating: number;
  quality_rating: number;
  communication_rating: number;
  is_active: boolean;
  is_preferred: boolean;
  notes: string;
  tags: string[];
}

// API Response types - Updated to match actual backend responses

// Products list response (from /products endpoint)
export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

// Admin products list response (from /products/admin endpoint)
export interface ProductAdminListResponse {
  products: Product[];
  total: number;
  page: number;
  page_size: number;
}

// Categories list response (array directly)
export type CategoryListResponse = Category[];

// Suppliers response with stats
export interface SupplierWithStats extends Supplier {
  products_count: number;
  total_stock_value?: number;
  active_products_count?: number;
}

export interface SuppliersWithStatsResponse {
  suppliers: SupplierWithStats[];
  total: number;
}

// Inventory responses
export interface InventoryMovementListResponse {
  movements: InventoryMovement[];
  total: number;
  page: number;
  page_size: number;
}

export interface StockLevelReport {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  min_stock_level: number;
  needs_restock: boolean;
  category_name: string;
}

export interface LowStockAlert {
  product_id: string;
  product_name: string;
  sku: string;
  current_stock: number;
  min_stock_level: number;
  category_name: string;
  supplier_name: string;
}

export interface LowStockAlertsResponse {
  low_stock_products: LowStockAlert[];
  total: number;
}

// Generic paginated response for compatibility
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Stock update request
export interface StockUpdateRequest {
  quantity: number;
  reason: string;
  notes?: string;
}