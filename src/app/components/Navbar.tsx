import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span
              className="text-2xl text-white"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              Reset Neutral
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${
                location.pathname === "/"
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/games"
              className={`transition-colors ${
                location.pathname.startsWith("/game")
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Games
            </Link>
            <Link
              to="/profile"
              className={`transition-colors ${
                location.pathname === "/profile"
                  ? "text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Profile
            </Link>

            {user ? (
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className={`transition-colors ${
                  location.pathname === "/auth"
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <Link
              to="/"
              className="text-slate-300 hover:text-white py-2"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/games"
              className="text-slate-300 hover:text-white py-2"
              onClick={() => setMobileOpen(false)}
            >
              Games
            </Link>
            <Link
              to="/profile"
              className="text-slate-300 hover:text-white py-2"
              onClick={() => setMobileOpen(false)}
            >
              Profile
            </Link>

            {user ? (
              <button
                onClick={async () => {
                  await signOut();
                  setMobileOpen(false);
                }}
                className="text-left text-slate-300 hover:text-white py-2"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                className="text-slate-300 hover:text-white py-2"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}