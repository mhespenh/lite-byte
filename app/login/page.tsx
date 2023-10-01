"use client";

import { login, Response } from "@/actions/login";
import { experimental_useFormState as useFormState } from "react-dom";

export default function Page() {
  const [formState, action] = useFormState<Response, FormData>(login, {});

  const { error } = formState;

  return (
    <form action={action}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Login</button>
      {error && <p>{error}</p>}
    </form>
  );
}
