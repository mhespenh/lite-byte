"use client";

import { Response, signup } from "@/actions/signup";
import { experimental_useFormState as useFormState } from "react-dom";

export default function Page() {
  const [formState, action] = useFormState<Response, FormData>(signup, {});

  const { error } = formState;

  return (
    <form action={action}>
      <input name="name" type="text" />
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
    </form>
  );
}
