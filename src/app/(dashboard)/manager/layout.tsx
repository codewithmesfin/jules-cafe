"use client";
import { RoleGuard } from "../../../components/RoleGuard";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["manager"]}>{children}</RoleGuard>;
}
