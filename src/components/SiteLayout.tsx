import { Outlet } from "react-router";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
