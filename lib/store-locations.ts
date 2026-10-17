import "server-only";

import { createClient } from "@/lib/supabase/server";
import { reportServerError } from "@/lib/server/report-error";
import type { PublicStoreLocation } from "@/types/store-location";

type PublicStoreLocationRow = {
  id: number;
  name: string;
  township: string;
  address: string;
  phone: string | null;
  opening_hours: string | null;
  map_url: string | null;
};

export async function getPublicStoreLocations(): Promise<PublicStoreLocation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_store_locations");

  if (error) {
    reportServerError({
      operation: "customer.store_locations.load",
      error,
    });

    return [];
  }

  return ((data ?? []) as PublicStoreLocationRow[]).map((location) => ({
    id: location.id,
    name: location.name,
    township: location.township,
    address: location.address,
    phone: location.phone,
    openingHours: location.opening_hours,
    mapUrl: location.map_url,
  }));
}
