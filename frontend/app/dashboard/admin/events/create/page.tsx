import { getUserData } from "@/lib/cookies";
import CreateEventClient from "./_components/CreateEventClient";

export default async function CreateEventPage() {
  const user = await getUserData();
  return <CreateEventClient user={user!} />;
}
