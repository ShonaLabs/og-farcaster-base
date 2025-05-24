import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mini-apps-orcin.vercel.app/";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/FarcasterOG.png`,
  button: {
    title: "Migrate Your OG NFT",
    action: {
      type: "launch_frame",
      name: "Farcaster OG Migration",
      url: `${appUrl}`,
      splashImageUrl: `${appUrl}/FarcasterOG.png`,
      splashBackgroundColor: "#18181B", // zinc-900
    },
  },
};

// Mengatur revalidasi setiap 5 menit (300 detik)
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Farcaster OG Migration - Move your NFT to Base",
  description: "Celebrating Farcaster at permissionless - Migrate your OG NFT from Zora to Base",
  openGraph: {
    title: "Farcaster OG Migration - Move your NFT to Base",
    description: "Celebrating Farcaster at permissionless - Migrate your OG NFT from Zora to Base",
    images: [
      {
        url: `${appUrl}/FarcasterOG-square.png`,
        width: 1200,
        height: 1200,
        alt: "Farcaster OG NFT",
      }
    ],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
