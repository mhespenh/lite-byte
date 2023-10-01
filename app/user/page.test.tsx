import { render, screen } from "@testing-library/react";
import Page from "./page";

jest.mock("@/util/get-authenticated-user");

const setup = async () => {
  const Component = await Page();
  render(Component);
};

it("renders without crashing", async () => {
  await setup();
  expect(screen.getByRole("heading", { name: /Hi, Test User/i })).toBeVisible();
});
