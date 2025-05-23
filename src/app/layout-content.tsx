"use client";

import { useTranslation } from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

interface LayoutContentProps {
  children: React.ReactNode;
  lang: string;
  fontClassName: string;
}

export default function LayoutContentClient({ children, lang, fontClassName }: LayoutContentProps) {
  const { isRTL } = useTranslation();

  return (
    <html lang={lang} dir={isRTL ? "rtl" : "ltr"}>
      <body className={`${fontClassName} antialiased font-sans`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
