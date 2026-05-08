import { Link, useLocation } from "react-router";
import { Menu, X, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { resetAllUserMastery } from "../hooks/useMastery";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user, signOut } = useAuth();
  
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsRef]);

  async function handleResetMastery() {
    if (user) {
      await resetAllUserMastery(user.id);
      setShowConfirmModal(false);
      setSettingsOpen(false);
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#0a1628]/95 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <span
                className="text-2xl text-white transition-all duration-300 ease-out inline-block group-hover:scale-110 group-hover:text-cyan-100 group-hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.9)] italic font-semibold uppercase"
                style={{ fontFamily: "'Titillium Web', sans-serif" }}
              >
                Reset Neutral
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/"
                className={`inline-block transition-all duration-300 ease-out hover:scale-110 font-['Orbitron'] font-bold tracking-wider uppercase text-sm ${
                  location.pathname === "/"
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Home
              </Link>
              <Link
                to="/games"
                className={`inline-block transition-all duration-300 ease-out hover:scale-110 font-['Orbitron'] font-bold tracking-wider uppercase text-sm ${
                  location.pathname.startsWith("/game")
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Games
              </Link>
              <Link
                to="/profile"
                className={`inline-block transition-all duration-300 ease-out hover:scale-110 font-['Orbitron'] font-bold tracking-wider uppercase text-sm ${
                  location.pathname === "/profile"
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Profile
              </Link>

              {user ? (
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`p-2 rounded-full transition-all duration-300 ease-out hover:scale-110 ${
                      settingsOpen ? "bg-slate-700/50 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Settings className={`transition-transform duration-500 ${settingsOpen ? "rotate-90" : ""}`} size={20} />
                  </button>
                  
                  {/* SETTINGS DROPDOWN (DESKTOP) */}
                  <div className={`absolute right-0 mt-3 w-56 bg-[#0d1f35] rounded-xl border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] transform-origin-top transition-all duration-200 overflow-hidden z-50 ${settingsOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}>
                    <div 
                      className="p-3 bg-slate-800/30 border-b border-slate-700/50 text-slate-300 text-xs font-semibold uppercase tracking-wider"
                      style={{ fontFamily: "'Orbitron', sans-serif" }}
                    >
                      Settings
                    </div>
                    <div className="p-2 flex flex-col gap-1">
                      <button 
                         onClick={() => setShowConfirmModal(true)}
                         className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                         Reset Mastery Progress
                      </button>
                      <div className="h-px bg-slate-700/50 my-1 mx-2" />
                      <button
                        onClick={async () => {
                          setSettingsOpen(false);
                          await signOut();
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-bold tracking-wider"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className={`inline-block transition-all duration-300 ease-out hover:scale-110 font-['Orbitron'] font-bold tracking-wider uppercase text-sm ${
                    location.pathname === "/auth"
                      ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
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

          {/* MOBILE MENU */}
          {mobileOpen && (
            <div className="md:hidden pb-6 pt-2 flex flex-col gap-2">
              <Link
                to="/"
                className="text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors border-b border-slate-800/50 font-['Orbitron'] font-bold tracking-wider uppercase text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/games"
                className="text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors border-b border-slate-800/50 font-['Orbitron'] font-bold tracking-wider uppercase text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Games
              </Link>
              <Link
                to="/profile"
                className="text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-lg transition-colors border-b border-slate-800/50 font-['Orbitron'] font-bold tracking-wider uppercase text-sm"
                onClick={() => setMobileOpen(false)}
              >
                Profile
              </Link>

              {user ? (
                <div className="flex flex-col gap-2 pt-4 px-2 mt-2">
                  <span 
                    className="text-slate-500 text-xs font-semibold uppercase tracking-wider pl-1 mb-1"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    Settings
                  </span>
                  <button 
                     onClick={() => {
                        setShowConfirmModal(true);
                     }}
                     className="w-full text-left px-3 py-3 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-colors border border-slate-700/50"
                  >
                     Reset Mastery Progress
                  </button>
                  <button
                    onClick={async () => {
                      await signOut();
                      setMobileOpen(false);
                    }}
                    className="w-full text-center px-4 py-3 mt-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors font-bold tracking-wider"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="text-slate-300 hover:text-white p-3 rounded-lg transition-colors font-['Orbitron'] font-bold tracking-wider uppercase text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-[#0d1f35] border border-blue-500/30 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2 font-['Orbitron']">Reset Mastery Progress</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to completely remove your mastery progress? This will delete all your streaks and best times permanently from the database.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                 onClick={handleResetMastery}
                 className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)] text-sm tracking-wide"
              >
                 Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}