"use client";

import { useEffect } from "react";
import { clearLegacyOrderStorage } from "@/lib/orderStorage";

export default function BrowserPrivacyCleanup() {
  useEffect(() => {
    clearLegacyOrderStorage();
  }, []);

  return null;
}
