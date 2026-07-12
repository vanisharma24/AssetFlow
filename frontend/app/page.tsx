import Navbar from "./components/Navbar";
import DashboardShell from "./components/DashboardShell";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_35%)]">
        <DashboardShell />
      </main>
      <Footer />
    </>
  );
}
