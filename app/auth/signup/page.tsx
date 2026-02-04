import Link from "next/link";

import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
          <p className="mt-4 text-sm text-black/60">
            Already have an account?{" "}
            <Link className="text-black underline" href="/auth/login">
              Sign in
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
