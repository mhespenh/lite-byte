import { Analytics } from "@/util/analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lite Byte - Home",
  description: "Control your Light Byte devices from anywhere in the world.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Analytics />
      <body className={inter.className}>
        {children}
        <VercelAnalytics />
      </body>
    </html>
  );
}
