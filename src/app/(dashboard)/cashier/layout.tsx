"use client";
import { RoleGuard } from "../../../components/RoleGuard";

export default function CashierLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["cashier"]}>{children}</RoleGuard>;
}
