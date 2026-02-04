import Link from "next/link";

import { signIn } from "@/app/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signIn} className="space-y-4">
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
                autoComplete="current-password"
                required
              />
            </div>
            <LoadingButton type="submit" className="w-full" loadingText="Signing in...">
              Sign in
            </LoadingButton>
          </form>
          <p className="mt-4 text-sm text-black/60">
            No account yet?{" "}
            <Link className="text-black underline" href="/auth/signup">
              Create one
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
