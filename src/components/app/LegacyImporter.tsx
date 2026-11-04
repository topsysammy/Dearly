"use client";

import { useEffect } from "react";
import { importLegacyData } from "@/lib/storage/importLegacy";
import { useToast } from "@/components/ui/Toast";

/** Moves any pre-account drafts from this browser into the account, once. */
export function LegacyImporter() {
  const { toast } = useToast();
  useEffect(() => {
    importLegacyData()
      .then((n) => n > 0 && toast(`Moved ${n} letter${n > 1 ? "s" : ""} from this device into your account.`, { tone: "success" }))
      .catch(() => {});
  }, [toast]);
  return null;
}
