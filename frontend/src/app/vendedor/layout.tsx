"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface VendedorLayoutProps {
  children: React.ReactNode;
}

export default function VendedorLayout({ children }: VendedorLayoutProps) {
  return (
    <DashboardLayout role="vendedor">
      {children}
    </DashboardLayout>
  );
}
