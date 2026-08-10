"use client";

import { LoaderCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/routes";

export default function AdminSignOutButton({
  className = "text-sm text-[#8a7a6d] hover:text-[#9c7a4f]",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signOut({
      scope: "local",
    });

    if (error) {
      setIsSigningOut(false);
      return;
    }

    router.replace(routes.adminLogin);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      aria-label={compact ? (isSigningOut ? "Signing out" : "Sign out") : undefined}
      title={compact ? (isSigningOut ? "Signing out" : "Sign out") : undefined}
      className={`${
        compact
          ? "flex size-9 items-center justify-center rounded-[4px] text-[#aaa4a0] transition-colors hover:bg-white/10 hover:text-white"
          : className
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {compact ? (
        isSigningOut ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
        ) : (
          <LogOut aria-hidden="true" size={18} />
        )
      ) : isSigningOut ? (
        "Signing out..."
      ) : (
        "Sign out"
      )}
    </button>
  );
}
