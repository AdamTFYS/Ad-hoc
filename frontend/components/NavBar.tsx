"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import DeleteAccountModal from "./DeleteAccountModal";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/calendar", label: "Calendar" },
    { href: "/courses", label: "Courses" },
    { href: "/lock-in", label: "Lock In" },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-border bg-surface-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Ad Hoc
          </span>
          {user &&
            links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          {user && (
            <div className="ml-auto flex items-center gap-4">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-sm font-medium text-red-500 transition-colors hover:text-red-400"
              >
                Delete Account
              </button>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
