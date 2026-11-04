import { Doodles } from "@/components/sketch/Doodles";

/** The tour is open to everyone, including signed-in people replaying it. */
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Doodles />
      <div className="relative">{children}</div>
    </>
  );
}
