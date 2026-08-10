export type StorefrontSettings = {
  heroImageUrl: string | null;
  heroTitle: string;
  heroDescription: string;
};

export type AdminStorefrontSettings = StorefrontSettings & {
  heroImagePath: string | null;
  updatedAt: string;
};
