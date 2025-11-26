import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import ScrollToTop from "@/components/ScrollToTop";

export const metadata = {
  title: "Movie Booking System",
  description: "Book your favorite movies online",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900 text-white min-h-screen flex flex-col" suppressHydrationWarning>
        <ReduxProvider>
          <ScrollToTop />
          <Navbar />
          <main className="container mx-auto px-4 py-8 mt-16 flex-1">
            {children}
          </main>
          <Footer />
          <ToastContainer
            position="bottom-right"
            theme="dark"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            limit={3}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
