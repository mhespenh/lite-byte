import { LiteByte } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import { DeviceCard } from ".";

const setup = (lastContactedAt: Date | null = new Date()) => {
  const device: LiteByte = {
    id: 1,
    name: "Test User",
    createdAt: new Date(),
    updatedAt: new Date(),
    serial: "1234567890",
    ownerId: 1,
    lastContactedAt,
  };

  render(<DeviceCard device={device} />);

  return device;
};

it("renders a card with information about the device", () => {
  const { name, lastContactedAt } = setup();

  expect(screen.getByRole("heading", { name })).toBeVisible();
  expect(screen.getByText(/Last seen (.*) ago/)).toBeVisible();
});

it("renders without lastContactedAt", () => {
  const { lastContactedAt } = setup(null);

  expect(screen.getByText("Never been online")).toBeVisible();
});
