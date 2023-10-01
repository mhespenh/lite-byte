"use client";

import { Response, signup } from "@/actions/signup";
import { Logo } from "@/components/logo";
import { PendingServerActionButton } from "@/components/pending-server-action-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";
import { experimental_useFormState as useFormState } from "react-dom";

export default function Page() {
  const [formState, action] = useFormState<Response, FormData>(signup, {});

  const { error } = formState;

  return (
    <div className="p-4">
      <form
        action={action}
        className="
          flex gap-5 mt-10 flex-wrap
          border border-primary rounded-xl
          bg-background
          m-auto
          w-full max-w-xl
          p-4 md:p-16 pt-2 md:pt-4
        "
      >
        <Logo className="m-auto text-2xl" />
        <Input
          name="name"
          aria-label="Name"
          placeholder="Name"
          type="text"
          className="min-w-full"
          required
        />
        <Input
          name="email"
          aria-label="Email"
          placeholder="Email"
          type="email"
          className="min-w-full"
          required
        />
        <Input
          name="password"
          aria-label="Password"
          placeholder="Password"
          type="password"
          className="min-w-full"
          required
        />
        <PendingServerActionButton type="submit" className="min-w-full">
          Sign Up
        </PendingServerActionButton>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Signup Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
