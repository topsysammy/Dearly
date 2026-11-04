import { redirect } from "next/navigation";
import { getPageAuth } from "@/lib/server/page-auth";
import { SetupNeeded } from "@/components/app/SetupNeeded";
import { Doodles } from "@/components/sketch/Doodles";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const auth = await getPageAuth();
  if (auth.state === "unconfigured") return <SetupNeeded />;
  if (auth.state === "ok") redirect("/home");
  return (
    <>
      <Doodles />
      <div className="relative">{children}</div>
    </>
  );
}
