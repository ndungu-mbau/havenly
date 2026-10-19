import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@havenly/ui/components/button";
import { Input } from "@havenly/ui/components/input";
import { Label } from "@havenly/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@havenly/ui/components/card";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isSignIn = mode === "sign-in";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = isSignIn
      ? await signIn.email({
          email: String(form.get("email")),
          password: String(form.get("password")),
        })
      : await signUp.email({
          email: String(form.get("email")),
          password: String(form.get("password")),
          name: String(form.get("name")),
        });
    setPending(false);
    if (result.error) {
      setError(
        "We could not complete that request. Check your details and try again.",
      );
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <main className="bg-background text-foreground grid min-h-screen place-items-center px-5 py-10">
      <Card className="border-border w-full max-w-md shadow-xl">
        <CardHeader className="space-y-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-lg font-semibold"
          >
            <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-xl">
              H
            </span>
            Havenly
          </Link>
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-bold tracking-[.18em] uppercase">
              Owner workspace
            </p>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {isSignIn ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              {isSignIn
                ? "Sign in to manage your homes, renters, and payments."
                : "Start building a clearer rental operation."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {!isSignIn && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Jamie Smith"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="At least 8 characters"
              />
            </div>
            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}
            <Button
              disabled={pending}
              className="mt-2 w-full font-semibold"
              type="submit"
            >
              {pending
                ? "Please wait…"
                : isSignIn
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-border/40 flex justify-center border-t pt-6">
          <p className="text-muted-foreground text-sm">
            {isSignIn ? "New to Havenly?" : "Already have an account?"}{" "}
            <Link
              to={isSignIn ? "/sign-up" : "/sign-in"}
              className="text-primary font-semibold underline underline-offset-4"
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
