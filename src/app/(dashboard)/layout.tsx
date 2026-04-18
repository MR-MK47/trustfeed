"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile, loading } = useUser();

  const isUploadPage = pathname === "/upload";

  let navItems = [
    { name: "Feed", icon: "rss_feed", path: "/feed" },
    { name: "Vault", icon: "inventory_2", path: "/vault" },
    { name: "Profile", icon: "person", path: "/admin" },
  ];

  if (!loading && profile?.role !== "admin") {
    navItems = navItems.filter((item) => item.name !== "Vault");
  }

  return (
    <div className={`bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col ${isUploadPage ? 'pt-0 pb-0' : 'pb-[100px] pt-[72px]'}`}>
      {/* TopAppBar */}
      {!isUploadPage && (
        <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              account_balance
            </span>
            <div className="flex flex-col">
              <span className="font-headline font-bold tracking-tight text-2xl text-primary font-black tracking-tighter">
                TrustFeed
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-on-surface-variant/60 hover:opacity-80 transition-opacity active:scale-95 duration-200 cursor-pointer">
              search
            </span>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full mx-auto">
        {children}
      </main>

      {/* Floating Action Button (FAB) */}
      {!isUploadPage && (
        <Link
          href="/upload"
          className="fixed bottom-[90px] right-6 z-40 bg-secondary text-on-secondary w-16 h-16 rounded-[20px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,105,114,0.3)] hover:bg-secondary-container hover:text-on-secondary-container hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">
            add
          </span>
        </Link>
      )}

      {/* BottomNavBar */}
      {!isUploadPage && (
        <nav className="fixed bottom-0 w-full rounded-t-[24px] z-50 bg-surface shadow-[0_-4px_24px_rgba(1,45,29,0.04)] flex justify-around items-center px-4 py-3 pb-safe border-t border-outline-variant/15">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center rounded-xl px-5 py-2 transition-all active:scale-90 duration-150 ${
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="font-label text-[10px] font-semibold uppercase tracking-widest mt-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
