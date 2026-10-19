import { redirect, createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data, error } = await authClient.getSession();

    if (error || !data?.user) {
      throw redirect({ to: "/login" });
    }

    const role = data.user.role;
    let redirectTo = "/_auth/admin";

    switch (role) {
      case "admin":
        redirectTo = "/_auth/admin";
        break;
      case "caretaker":
        redirectTo = "/_auth/caretaker";
        break;
      case "tenant":
        redirectTo = "/_auth/tenant";
        break;
      default:
        redirectTo = "/_auth/landlord";
    }

    throw redirect({ to: redirectTo });
  },
  component: IndexPage,
});

function IndexPage() {
  return <div>Redirecting...</div>;
}
