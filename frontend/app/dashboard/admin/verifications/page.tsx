import { getUserData } from "@/lib/cookies";
import AdminVerificationsClient from "./_components/AdminVerificationsClient";

export default async function AdminVerificationsPage() {
  const user = await getUserData();
  return <AdminVerificationsClient user={user!} />;
}
