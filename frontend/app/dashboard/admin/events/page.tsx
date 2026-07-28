import { getUserData } from "@/lib/cookies";
import AdminMyEventsClient from "./_components/AdminMyEventsClient";

export default async function AdminMyEventsPage() {
  const user = await getUserData();
  return <AdminMyEventsClient user={user!} />;
}
