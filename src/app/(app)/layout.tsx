import { redirect } from "next/navigation";
import { getPageAuth } from "@/lib/server/page-auth";
import { UserProvider } from "@/components/app/UserProvider";
import { TabBar } from "@/components/app/TabBar";
import { LegacyImporter } from "@/components/app/LegacyImporter";
import { SetupNeeded } from "@/components/app/SetupNeeded";
import { Doodles } from "@/components/sketch/Doodles";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const auth = await getPageAuth();
  if (auth.state === "unconfigured") return <SetupNeeded />;
  if (auth.state === "anon") redirect("/login");
  return (
    <UserProvider user={auth.user}>
      <Doodles />
      <LegacyImporter />
      <main className="relative min-h-dvh pb-32">{children}</main>
      <TabBar />
    </UserProvider>
  );
}
