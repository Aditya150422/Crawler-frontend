import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebScrapper AI - Intelligent Web Scraping & Chat",
  description: "Transform any website into a conversational knowledge base with AI-powered scraping and real-time chat",
  keywords: ["web scraping", "AI", "chat", "knowledge base", "machine learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="noise" />
        <div className="grid-bg fixed inset-0 pointer-events-none" />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(15, 23, 42, 0.9)",
              color: "#fff",
              border: "1px solid rgba(14, 165, 233, 0.2)",
              backdropFilter: "blur(10px)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
