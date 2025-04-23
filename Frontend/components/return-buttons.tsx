"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ReturnButtonsProps = {
  className?: string;
};

const ReturnButtons: React.FC<ReturnButtonsProps> = ({ className }) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Home Button */}
      <Link href="/" passHref>
        <button className="flex items-center justify-center p-2 rounded-full shadow-md hover:bg-secondary transition-colors">
          <Home className="h-5 w-5" />
        </button>
      </Link>

      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center justify-center p-2 rounded-full shadow-md hover:bg-secondary transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ReturnButtons;
