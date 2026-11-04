import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPageAuth } from "@/lib/server/page-auth";
import { SetupNeeded } from "@/components/app/SetupNeeded";

/** Entry point: signed in → home; first visit → onboarding; otherwise → sign in. */
export default async function Root() {
  const auth = await getPageAuth();
  if (auth.state === "unconfigured") return <SetupNeeded />;
  if (auth.state === "ok") redirect("/home");
  const onboarded = (await cookies()).get("dearly_onboarded")?.value === "1";
  redirect(onboarded ? "/login" : "/welcome");
}
