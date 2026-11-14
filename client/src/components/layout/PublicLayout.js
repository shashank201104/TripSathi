import Navbar from "./Navbar";
import Footer from "./Footer";

const PublicLayout = ({ children }) => (
  <div className="flex min-h-screen flex-col bg-bg transition-theme">
    <div className="sticky top-0 z-50 w-full">
      <Navbar />
    </div>
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default PublicLayout;
