import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  return <DashboardClient user={user} />;
}
