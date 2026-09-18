import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview AI | Simulador de entrevistas",
  description: "Práctica de entrevistas laborales con IA.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
