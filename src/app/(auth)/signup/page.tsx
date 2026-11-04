import { AuthForm } from "../AuthForm";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
