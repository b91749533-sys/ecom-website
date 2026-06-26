import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Lumière CRM | Luxury Fragrance Control Center",
  description: "Advanced Customer Relationship Management and real-time synchronization dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-950 text-slate-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
