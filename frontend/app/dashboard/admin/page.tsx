import { getUserData } from "@/lib/cookies";
import AdminDashboardClient from "./_components/AdminDashboardClient";

export default async function AdminDashboardPage() {
  const user = await getUserData();
  return <AdminDashboardClient user={user!} />;
}
