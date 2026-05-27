import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";


const font = DM_Sans({ 
  subsets: ["latin"]
 });

export const metadata: Metadata = {
  title: "UIUX Mock Generator",
  description: "Generate high quality free UI UX mobile and web mockup designs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
      className={font.className}
      >
        {children}
      </body>
    </html>
  );
}