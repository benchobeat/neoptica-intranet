"use client";

import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface OptometristaLayoutProps {
  children: React.ReactNode;
}

export default function OptometristaLayout({ children }: OptometristaLayoutProps) {
  return (
    <DashboardLayout role="optometrista">
      {children}
    </DashboardLayout>
  );
}
