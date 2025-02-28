"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import Link from "next/link";

const ReturnButtons = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="absolute top-6 left-6 flex items-center gap-3">
      {/* Home Button */}
      <Link href="/" passHref>
        <button className="flex items-center justify-center p-2 rounded-full bg-white shadow-md hover:bg-gray-200 transition-colors">
          <Home className="h-5 w-5 text-gray-700" />
        </button>
      </Link>

      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center justify-center p-2 rounded-full bg-white shadow-md hover:bg-gray-200 transition-colors"
      >
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
};

export default ReturnButtons;
