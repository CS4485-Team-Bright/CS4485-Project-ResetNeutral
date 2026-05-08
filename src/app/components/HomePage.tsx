import { Link } from "react-router";
import { Swords, BookOpen, Gamepad2, Users, Target, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useGames } from "../hooks/useGameData";

const heroImg =
"https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/5b769bc7-3c83-4b1a-9acf-11a4a31144c2/dd310zv-2357e34a-1c4d-44ec-834d-f392722c5510.png/v1/fill/w_1032,h_774,q_70,strp/fighting_game_protagonists_by_artwprks_dd310zv-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9OTYwIiwicGF0aCI6Ii9mLzViNzY5YmM3LTNjODMtNGIxYS05YWNmLTExYTRhMzExNDRjMi9kZDMxMHp2LTIzNTdlMzRhLTFjNGQtNDRlYy04MzRkLWYzOTI3MjJjNTUxMC5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.NRuq5ykTMfCKttasDK6DmHEPMdUVebjuizkHkdfV_oc";

const actionImg =
"https://preview.redd.it/super-smash-bros-melee-roster-wallpaper-ai-upscaled-v0-3tgvi7xgzne51.png?auto=webp&s=fba992928641163e89424da1c43d8840f36a905c";

const controllerImg =
"https://fightrise.com/wp-content/uploads/2023/01/03-unlocking-potential-part1.jpg";

const GAME_COLORS: Record<string, string> = {
  "guilty-gear-strive": "from-red-500 via-orange-500 to-yellow-500",
  "street-fighter-6": "from-blue-600 via-purple-500 to-red-500",
  "2xko": "from-purple-500 via-pink-500 to-cyan-500",
};

export function HomePage() {
  const { games } = useGames();

  return (
    <div className="min-h-screen bg-[#040c17]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .anim-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
        
        .anim-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0a1628] to-[#040c17] -z-10" />
        
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-5xl md:text-7xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] italic font-semibold uppercase"
              style={{ fontFamily: "'Titillium Web', sans-serif" }}
            >
              Reset Neutral
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/70 mb-10 font-['Orbitron'] tracking-wide max-w-2xl mx-auto leading-relaxed">
              The perfect place to reach the skillfloor. Learn fighting games,
              practice combos, and master your favorite characters — all for free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Glowing Shimmer CTA */}
              <Link
                to="/games"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(52,211,153,0.5)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent anim-shimmer -translate-x-full" />
                
                <Gamepad2 size={22} className="text-white relative z-10" />
                <span className="text-white font-['Orbitron'] font-bold tracking-widest uppercase relative z-10 text-lg">
                  Browse Games
                </span>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-[#0d1f35] border border-blue-500/30 hover:bg-blue-900/30 hover:border-blue-400/60 text-blue-200 px-8 py-4 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all font-['Orbitron'] font-bold tracking-widest uppercase hover:text-white"
              >
                <BookOpen size={20} />
                Learn More
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-16 anim-float">
          <div className="relative rounded-2xl overflow-hidden h-56 md:h-[400px] border border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.2)] bg-[#0a1628]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10" />
            <ImageWithFallback
              src={heroImg}
              alt="Fighting games"
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      {/* Supported Games */}
      <section className="py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-[#0a1628]/50 border-y border-blue-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white font-['Orbitron'] tracking-wider mb-2">Supported Games</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {games.map((game) => (
              <div key={game.id} className="relative group w-72">
                <div className={`absolute inset-0 bg-gradient-to-r ${GAME_COLORS[game.id] || "from-blue-500 to-purple-500"} rounded-2xl blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500`} />
                <Link
                  to={`/game/${game.id}`}
                  className="relative block bg-[#0d1f35] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-white/20"
                >
                  <div className="h-48 overflow-hidden relative">
                    <ImageWithFallback
                      src={game.logo}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-transparent to-transparent opacity-80`} />
                  </div>
                  <div className="px-5 py-4 border-t border-white/5 relative z-10 bg-[#0d1f35]">
                    <p className="text-white font-bold font-['Orbitron'] text-center tracking-wide group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-200 transition-colors">
                      {game.name}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Character Overviews Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 font-['Orbitron'] text-xs font-bold uppercase tracking-wider">
                <Target size={14} /> Knowledge Base
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-['Orbitron'] tracking-wide leading-tight">
                Master Every <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">Character</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                View move lists, frame data, and BnB combos to learn new
                characters or improve your skills. Every character across all
                supported games is documented with detailed move properties and
                practical combos for every skill level.
              </p>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 bg-[#0a1628] hover:bg-[#0d1f35] border border-blue-500/40 hover:border-blue-400 flex-shrink-0 text-blue-300 font-bold px-6 py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] font-['Orbitron'] uppercase tracking-widest text-sm"
              >
                <Swords size={18} />
                View Roster
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20" />
              <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-[#0d1f35]">
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay z-10" />
                <ImageWithFallback
                  src={actionImg}
                  alt="Character overviews"
                  className="w-full h-72 md:h-96 object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Ground Section */}
      <section className="py-16 md:py-24 bg-[#0a1628]/40 border-y border-blue-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-2xl opacity-10" />
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.1)] bg-[#0d1f35]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent z-10" />
                <ImageWithFallback
                  src={controllerImg}
                  alt="Training Ground"
                  className="w-full h-72 md:h-96 object-cover opacity-80"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 font-['Orbitron'] text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                <Zap size={14} /> Interactive Arena
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-['Orbitron'] tracking-wide leading-tight">
                Simulate The <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">Training Ground</span>
              </h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Practice combos in a browser simulation of our supported games.
                Try out character inputs, learn motion commands, and see if a
                game or character clicks with you — before buying anything.
              </p>
              <Link
                to="/games"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(52,211,153,0.2)] transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d1f35] to-[#0a1628] border border-emerald-500/40 rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent anim-shimmer -translate-x-full" />
                <Target size={18} className="text-emerald-400 relative z-10" />
                <span className="text-emerald-400 font-['Orbitron'] font-bold tracking-widest uppercase relative z-10 text-sm">
                  Enter The Arena
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-['Orbitron'] tracking-wider mb-4">Why Reset Neutral?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to break through the fighting game barrier, built into one seamless platform.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Comprehensive Move Lists",
                description:
                  "Every character's full move set documented with inputs, frame data, damage values, and modular descriptions.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] group-hover:border-blue-400/50"
              },
              {
                icon: Target,
                title: "Interactive Practice",
                description:
                  "A browser-based training mode where you can practice motion inputs and combos using your keyboard.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(52,211,153,0.2)] group-hover:border-emerald-400/50"
              },
              {
                icon: Zap,
                title: "Combo Guides",
                description:
                  "Curated BnB combos for every character, organized by difficulty from beginner to advanced.",
                color: "text-orange-400",
                bg: "bg-orange-500/10",
                border: "border-orange-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(249,115,22,0.2)] group-hover:border-orange-400/50"
              },
              {
                icon: Users,
                title: "Beginner Friendly",
                description:
                  "Designed for newcomers to fighting games. Clear explanations, no jargon overload, and step-by-step learning.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(168,85,247,0.2)] group-hover:border-purple-400/50"
              },
              {
                icon: Gamepad2,
                title: "Multi-Game Support",
                description:
                  "Coverage for Guilty Gear Strive, Street Fighter 6, and 2XKO — the most popular modern fighters.",
                color: "text-pink-400",
                bg: "bg-pink-500/10",
                border: "border-pink-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(236,72,153,0.2)] group-hover:border-pink-400/50"
              },
              {
                icon: Swords,
                title: "Try Before You Buy",
                description:
                  "Explore characters and practice their inputs to see if a game is right for you before spending a dime.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
                border: "border-cyan-500/30",
                glow: "group-hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] group-hover:border-cyan-400/50"
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`group bg-[#0d1f35] border ${feature.border} rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${feature.glow}`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 border border-white/5`}>
                  <feature.icon size={24} className={`${feature.color} transition-transform duration-300 group-hover:scale-110`} />
                </div>
                <h4 className="text-white mb-3 font-['Orbitron'] tracking-wide">{feature.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/20 bg-[#0a1628] py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span
                className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 italic font-bold uppercase"
                style={{ fontFamily: "'Titillium Web', sans-serif", fontWeight: 700 }}
              >
                Reset Neutral
              </span>
              <span className="text-xs text-slate-500 font-['Orbitron'] tracking-widest uppercase">The skillfloor awaits</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium">
              <Link to="/games" className="hover:text-blue-400 transition-colors font-['Orbitron'] tracking-wider">
                Games Directory
              </Link>
              <Link to="/profile" className="hover:text-blue-400 transition-colors font-['Orbitron'] tracking-wider">
                My Profile
              </Link>
              <span className="text-slate-600 block w-full md:w-auto text-center md:text-left text-xs mt-2 md:mt-0">
                All game content belongs to respective publishers.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}