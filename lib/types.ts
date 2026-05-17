export type VariantType = 'sealed' | 'opened' | 'decant' | 'sample';

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
  /**
   * When `false`, the product is hidden from the public catalog and its
   * /product/[id] page returns 404. Admin still sees it (marked "Ανενεργό").
   * Missing/undefined treated as `true` for backward compat with existing
   * inventory entries.
   */
  active?: boolean;
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  quantity: number;
}
