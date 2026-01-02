export type ComponentType = 
  | 'hero_v1' 
  | 'hero_v2' 
  | 'hero_magic' 
  | 'services_grid' 
  | 'lead_form_split' 
  | 'lead_form_simple' 
  | 'trust_marquee' 
  | 'rich_text'
  | 'stats_bar'
  | 'faq_section'
  | 'local_map'
  | 'gallery_grid'
  | 'bento_grid';

export interface ComponentData {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  variant?: 'default' | 'inverted' | 'accent';
}

export interface PageConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  layout: string[]; // Array of Component IDs
  components: Record<string, ComponentData>;
  themeOverrides?: {
    primaryColor?: string;
    radius?: string;
  };
}

export interface GlobalConfig {
  companyName: string;
  phone: string;
  email: string;
  navigation: Array<{ label: string; href: string }>;
}

export interface ApiResponse {
  global: GlobalConfig;
  pages: Record<string, PageConfig>;
}