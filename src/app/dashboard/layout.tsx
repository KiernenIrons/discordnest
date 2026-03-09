import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        <DashboardSidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
