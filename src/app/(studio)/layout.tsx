import { redirect } from "next/navigation";
import { getPageAuth } from "@/lib/server/page-auth";
import { UserProvider } from "@/components/app/UserProvider";
import { SetupNeeded } from "@/components/app/SetupNeeded";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const auth = await getPageAuth();
  if (auth.state === "unconfigured") return <SetupNeeded />;
  if (auth.state === "anon") redirect("/login");
  return <UserProvider user={auth.user}>{children}</UserProvider>;
}
