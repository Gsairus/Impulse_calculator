import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Impulse Current Calculator",
  description: "Universal lightning impulse current calculator based on IEC 62305-1 standards",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
