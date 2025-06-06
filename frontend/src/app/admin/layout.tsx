"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}
