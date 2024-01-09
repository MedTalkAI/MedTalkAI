import { Inter, Raleway } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
});

import "./globals.css";

export const metadata = {
  title: "MedTalk AI | Insight",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${raleway.variable} ${inter.variable}`}>
      <head>
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
