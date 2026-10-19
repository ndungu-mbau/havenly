import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return <AuthForm mode="sign-in" />;
}
