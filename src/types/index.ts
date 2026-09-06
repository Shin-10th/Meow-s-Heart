export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  is_admin: boolean
  loyalty_points: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price_mmk: number
  compare_at_price_mmk: number | null
  image_url: string | null
  images: string[] | null
  category_id: string | null
  category?: Category | null
  origin_country: string | null
  stock: number
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export type OrderStatus = 'awaiting_confirmation' | 'processing' | 'shipped' | 'completed' | 'cancelled'

export type PaymentMethod = 'kpay' | 'cod'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price_mmk: number
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  subtotal_mmk: number
  total_mmk: number
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  delivery_city: string | null
  payment_method: PaymentMethod | null
  kpay_receipt_url: string | null
  notes: string | null
  created_at: string
  order_items?: OrderItem[]
}

export interface LoyaltyTransaction {
  id: string
  user_id: string
  order_id: string | null
  paws: number
  reason: string
  created_at: string
}

export type ConsultationType =
  | 'AI Skintone Analysis'
  | 'Virtual Makeup Try-on'
  | '24/7 Beauty Assistant'
  | 'Color Matching Tool'
  | 'Skincare Consultation'
  | 'Makeup Consultation'
  | 'Color Matching Session'
  | 'AI Skin Analysis'

export interface ConsultationBooking {
  id: string
  user_id: string | null
  consultation_type: string
  full_name: string
  phone: string
  preferred_date: string | null
  preferred_time: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type SupportSender = 'customer' | 'ai' | 'admin'

export interface SupportConversation {
  id: string
  user_id: string
  status: 'open' | 'pending_admin' | 'closed'
  priority: number
  human_engaged: boolean
  last_message_at: string
  created_at: string
  // joined client-side for the admin inbox, not a real column
  profile?: Pick<Profile, 'full_name' | 'phone'> | null
}

export interface SupportMessage {
  id: string
  conversation_id: string
  sender: SupportSender
  body: string
  created_at: string
}
