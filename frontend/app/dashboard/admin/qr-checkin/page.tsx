import { getUserData } from "@/lib/cookies";
import AdminQrCheckinClient from "./_components/AdminQrCheckinClient";

export default async function AdminQrCheckinPage() {
  const user = await getUserData();
  return <AdminQrCheckinClient user={user!} />;
}
