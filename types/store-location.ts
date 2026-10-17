export type PublicStoreLocation = {
  id: number;
  name: string;
  township: string;
  address: string;
  phone?: string | null;
  openingHours?: string | null;
  mapUrl?: string | null;
};
