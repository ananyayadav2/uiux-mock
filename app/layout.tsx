import { ClerkProvider } from "@clerk/nextjs";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";

const appFont = DM_Sans({ subsets: ["latin"] });

export const metadata = {
  title: "UIUX Mock Generator",
  description: "Generate high quality free UI UX mobile and web mockup designs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={appFont.className}>
          <Provider>
            {children}
          </Provider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}