import fs from "fs";
import path from "path";
import type { Metadata } from "next";

const ogImagePath = path.join(process.cwd(), "public", "og-image.jpg");

if (!fs.existsSync(ogImagePath)) {
  console.warn(
    "[SEO] Upload your profile image to public/og-image.jpg for the OG image. Recommended size: 1200x630."
  );
}

export const metadata: Metadata = {
  metadataBase: new URL("https://bambangsumantri.my.id"),
  title: "Bambang S - Creator Digital & Portfolio",
  description:
    "Saya adalah kreator digital yang suka membangun ide menjadi produk yang terasa hidup, menarik, dan bermanfaat untuk orang banyak.",
  keywords: [
    "Bambang Sumantri",
    "Bambang S",
    "Portfolio",
    "Creator Digital",
    "Semarang",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bambangsumantri.my.id",
    title: "Bambang S - Creator Digital & Portfolio",
    description:
      "Saya adalah kreator digital yang suka membangun ide menjadi produk yang terasa hidup, menarik, dan bermanfaat untuk orang banyak.",
    siteName: "Bambang S",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bambang S - Creator Digital & Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bambang S - Creator Digital & Portfolio",
    description:
      "Saya adalah kreator digital yang suka membangun ide menjadi produk yang terasa hidup, menarik, dan bermanfaat untuk orang banyak.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://bambangsumantri.my.id",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
