import "./globals.css";
import ClientLayout from "@/client-layout";

export const metadata = {
  title: "Plated Stories",
  description: "by Blue Moon Creatives",
  // Icons come from the file conventions in this folder: favicon.ico,
  // icon.png and apple-icon.png.
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
