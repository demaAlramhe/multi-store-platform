export type Store = {
  id: string;
  slug: string;
  name: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  storeId: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  isPublished: boolean;
  createdAt: string;
};
