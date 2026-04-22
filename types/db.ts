export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          slug: string;
          name: string;
          owner_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          owner_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          slug: string;
          name: string;
          owner_id: string;
          is_active: boolean;
        }>;
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          slug: string;
          title: string;
          description: string | null;
          price: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          slug: string;
          title: string;
          description?: string | null;
          price: number;
          is_published?: boolean;
          created_at?: string;
        };
        Update: Partial<{
          store_id: string;
          slug: string;
          title: string;
          description: string | null;
          price: number;
          is_published: boolean;
        }>;
      };
    };
  };
};
