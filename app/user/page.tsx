import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedUser } from "@/util/get-authenticated-user";

export default async function Page() {
  const { name, createdAt, devices } = await getAuthenticatedUser();

  return (
    <Card className="m-5 max-w-sm">
      <CardHeader>
        <CardTitle>Hi, {name}</CardTitle>
        <CardDescription>
          Owner since: {createdAt.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        You have {devices.length} active{" "}
        <Logo className="text-inherit inline" />
      </CardContent>
    </Card>
  );
}
