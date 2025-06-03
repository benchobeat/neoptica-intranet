"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface ClienteLayoutProps {
  children: React.ReactNode;
}

export default function ClienteLayout({ children }: ClienteLayoutProps) {
  return (
    <DashboardLayout role="cliente">
      {children}
    </DashboardLayout>
  );
}
