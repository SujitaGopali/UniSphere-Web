import { getUserData } from "@/lib/cookies";
import AdminUsersClient from "./_components/AdminUsersClient";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const user = await getUserData();
  
  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  return <AdminUsersClient user={user} />;
}
