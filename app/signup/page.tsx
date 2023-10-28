"use client";

import { Response, signup } from "@/actions/signup";
import { ErrorMessage } from "@/components/error-message";
import { Logo } from "@/components/logo";
import { PendingServerActionButton } from "@/components/pending-server-action-button";
import { Input } from "@/components/ui/input";
import { useFormState } from "react-dom";

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
        {error && <ErrorMessage title="Signup Error">{error}</ErrorMessage>}
      </form>
    </div>
  );
}
