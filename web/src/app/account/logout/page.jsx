"use client";

import { useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  }, [signOut]);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-white mb-4">
          Signing you out...
        </h1>
        <div className="w-8 h-8 border-4 border-[#FF4F8E] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}
