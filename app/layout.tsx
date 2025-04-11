import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nacho Sales",
  description: "Nacho Ordinary Sales Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="">
        <DashboardWrapper>{children}</DashboardWrapper>
      </body>
    </html>
  );
}
