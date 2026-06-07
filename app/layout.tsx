import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import RealtimeProvider from "@/components/layout/RealtimeProvider";
import ToastContainer from "@/components/layout/ToastContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SentinelAI - Emergency Command Center",
  description: "AI-Powered Response and Coordination Command Center Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full bg-background text-on-background flex">
        {/* Global Sidebar */}
        <Sidebar />
        
        {/* Main Application Container */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative pl-20 md:pl-64 transition-all duration-300">
          {/* Global Header */}
          <Header />
          
          {/* Page Contents */}
          <main className="flex-1 flex flex-col pt-16 overflow-y-auto">
            <RealtimeProvider>{children}</RealtimeProvider>
          </main>
        </div>

        {/* Global Toasts */}
        <ToastContainer />
      </body>
    </html>
  );
}
