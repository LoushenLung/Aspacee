import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ur-Space | Smart Space Booking",
  description: "Sistem reservasi coworking space dan workstation modern untuk freelancer, mahasiswa, startup, dan profesional.",
  keywords: "coworking space, reservasi, workstation, meeting room, booking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-primary)] antialiased">
        {children}
      </body>
    </html>
  );
}
