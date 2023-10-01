import { AuthUser } from "@prisma/client";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { UserMenu } from "./user-menu";

const setup = () => {
  const user: Omit<AuthUser, "password"> = {
    id: 1,
    name: "Test User",
    email: "test.user@test.com",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSeenAt: new Date(),
  };

  render(<UserMenu user={user} />);

  return user;
};

it("Has a dropdown with the user initials", async () => {
  const { name } = setup();
  const user = userEvent.setup();

  const button = screen.getByRole("button", { name: "User Menu" });

  expect(button).toBeEnabled();
  expect(within(button).getByText(name[0])).toBeVisible();
});

it("has working dropdown with options", async () => {
  const { name, email } = setup();
  const user = userEvent.setup();

  const dropdown = screen.getByRole("button", { name: "User Menu" });
  await user.click(dropdown);
  const menu = screen.getByRole("menu");

  // User info
  expect(within(menu).getByText(name)).toBeVisible();
  expect(within(menu).getByText(email)).toBeVisible();
  // Menu options
  expect(
    within(menu).getByRole("menuitem", { name: /Profile/i })
  ).toHaveAttribute("aria-disabled", "true");
  expect(
    within(menu).getByRole("menuitem", { name: /Settings/i })
  ).toHaveAttribute("aria-disabled", "true");
  expect(
    within(menu).getByRole("menuitem", { name: /Log out/i })
  ).toHaveAttribute("href", "/login");
});
