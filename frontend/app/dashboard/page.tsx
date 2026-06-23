import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-canvas text-body">
      <DashboardClient user={user} />
    </main>
  );
}
