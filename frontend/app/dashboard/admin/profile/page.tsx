import { getUserData } from "@/lib/cookies";
import AdminProfileClient from "./_components/AdminProfileClient";

export default async function AdminProfilePage() {
  const user = await getUserData();
  return <AdminProfileClient user={user!} />;
}
