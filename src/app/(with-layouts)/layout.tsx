import { getSession } from "@/lib/auth";
import WithLayoutClient from "./with-layout-client";

export default async function WithLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userRole = session?.role ?? "KASIR";

  return <WithLayoutClient userRole={userRole}>{children}</WithLayoutClient>;
}