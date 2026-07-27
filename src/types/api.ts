export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BrandSettings {
  name: string;
  tagline?: string;
}

export interface HeroSlide {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url?: string | null;
  cta_label?: string | null;
  cta_url?: string | null;
}

export interface ShoeSummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  thumbnail_url?: string | null;
  is_featured: boolean;
  collection?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface ShoeDetail extends ShoeSummary {
  supported_types?: string[];
  models?: {
    body?: string | null;
    upper?: string | null;
    sole?: string | null;
    logo?: string | null;
    inner?: string | null;
    default_buckle?: string | null;
  };
  materials?: Array<{
    id: number;
    name: string;
    slug: string;
    texture_url?: string | null;
    price_modifier: number;
  }>;
  colors?: Array<{ id: number; name: string; hex_code: string }>;
  buckles?: Array<{
    id: number;
    name: string;
    slug: string;
    model_url?: string | null;
    thumbnail_url?: string | null;
    price_modifier: number;
  }>;
  sizes?: Array<{ id: number; gender: string; label: string; value: number }>;
  sole_colors?: Array<{ id: number; name: string; slug: string; hex_code: string }>;
}

export interface CollectionSummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  shoes_count?: number;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedShoes {
  items: ShoeSummary[];
  pagination: PaginationMeta;
}

export interface ProcessStep {
  title: string;
  description: string;
  icon?: string | null;
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon?: string | null;
}

export interface Testimonial {
  customer_name: string;
  customer_title?: string | null;
  content: string;
  rating: number;
  avatar_url?: string | null;
}

export interface NewsletterSection {
  title: string;
  description: string;
}

export interface HomepageData {
  brand: BrandSettings;
  hero: HeroSlide[];
  featured_shoes: ShoeSummary[];
  process_steps: ProcessStep[];
  why_choose_us: WhyChooseItem[];
  testimonials: Testimonial[];
  newsletter: NewsletterSection;
}

export interface ContactPageContent {
  title: string;
  description: string;
  email: string;
  phone: string;
  hours: string;
  address: string;
}

export interface ContactPageData {
  brand: BrandSettings;
  contact: ContactPageContent;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}
