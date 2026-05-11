export type VariantType = 'sealed' | 'opened' | 'decant';

export interface Variant {
  id: string;
  type: VariantType;
  size_ml: number;
  price: number;
  stock: number;
  fill_pct?: number;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  line?: string;
  images: string[];
  notes?: string;
  description_gr?: string;
  variants: Variant[];
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
}
