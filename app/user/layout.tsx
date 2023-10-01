import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getAuthenticatedUser } from "@/util/get-authenticated-user";
import Link from "next/link";

export const metadata = {
  title: "Light Byte - Home",
  description: "Control your Light Byte devices from anywhere in the world.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  return (
    <div>
      <div className="flex items-center justify-between gap-10 border-b p-2">
        <Logo className="text-[1rem]" />
        <div className="flex justify-start grow">
          <Button variant="ghost" asChild>
            <Link href="/user">Dashboard</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/user/devices">Devices</Link>
          </Button>
        </div>
        <UserMenu user={user} />
      </div>
      {children}
    </div>
  );
}
