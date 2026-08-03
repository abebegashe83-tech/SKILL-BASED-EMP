import "./globals.css";
import ThemeProvider from "./providers/theme-provider";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

export const metadata = {
  title: "SkillMatch - Find Your Perfect Job",
  description: "Connect job seekers with employers through AI-powered matching",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
