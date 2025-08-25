"use client"

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to login after mount if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-2 text-center">
        <Link href="/" className="flex items-center space-x-2">
          <Palette className="h-8 w-8" />
          <span className="text-2xl font-bold">Artify Dashboard</span>
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome, {session.user.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          This is your dashboard.
        </p>
      </div>
      {/* Add more dashboard content here */}
    </div>
  );
} 