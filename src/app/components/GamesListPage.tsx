import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useGames } from "../hooks/useGameData";

const GAME_GRADIENTS: Record<string, string> = {
  "guilty-gear-strive": "from-red-500 via-orange-500 to-yellow-500",
  "street-fighter-6": "from-blue-600 via-purple-500 to-red-500",
  "2xko": "from-purple-500 via-pink-500 to-cyan-500",
};

export function GamesListPage() {
  const { games, loading, error } = useGames();

  return (
    <div className="min-h-screen py-8 md:py-16 relative overflow-hidden bg-[#040c17]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        
        .anim-shimmer {
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>
      
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse delay-1000 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Orbitron'] tracking-wider drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            Select a Game
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-['Orbitron'] tracking-wide">
            Choose a fighting game to explore characters, moves, and master combos in the practice arena.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 mx-auto rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] mt-8" />
        </div>

        {loading && (
          <div className="flex justify-center my-20">
            <p className="text-blue-400 text-xl font-['Orbitron'] animate-pulse tracking-widest">Loading Gateway...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl text-center max-w-2xl mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <p className="text-red-400 font-bold font-['Orbitron'] tracking-widest uppercase">Connection Lost</p>
            <p className="text-slate-400 mt-2">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...games].sort((a, b) => a.name.localeCompare(b.name)).map((game) => (
            <div key={game.id} className="relative group h-full">
              {/* Glowing Background Blob */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${GAME_GRADIENTS[game.id] || "from-blue-500 to-purple-500"} rounded-2xl blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500`} />
              
              <Link
                to={`/game/${game.id}`}
                className="relative flex flex-col h-full bg-[#0d1f35] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              >
                {/* Image Banner Header */}
                <div className="h-48 overflow-hidden relative shrink-0 border-b border-white/5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${GAME_GRADIENTS[game.id] || "from-blue-500 to-purple-500"} opacity-30 mix-blend-overlay z-10 transition-opacity duration-500 group-hover:opacity-50`} />
                  {game.banner ? (
                    <img 
                      src={game.banner} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90" 
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0a1628]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f35] via-black/40 to-transparent z-10" />
                  
                  {/* Floating Game Name over Image */}
                  <div className="absolute bottom-4 left-6 right-6 z-20">
                     <h2 className="text-2xl font-black text-white font-['Orbitron'] tracking-wider drop-shadow-md">
                       {game.name}
                     </h2>
                     <p className="text-blue-300/80 text-xs font-bold font-['Orbitron'] uppercase tracking-widest mt-1">
                       {game.developer} &middot; {game.release_year}
                     </p>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-4">
                    {game.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-auto">
                    <span className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider font-['Orbitron'] bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      {game.characters.length} Fighters
                    </span>
                    
                    {/* Animated Enter Button */}
                    <div className="relative inline-flex items-center justify-center overflow-hidden rounded-lg p-[1px]">
                      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,rgba(59,130,246,0.5)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="inline-flex h-full w-full items-center justify-center rounded-lg bg-[#0a1628] px-3 py-1.5 text-sm font-medium text-white transition-colors group-hover:bg-blue-950/50 backdrop-blur-3xl gap-1 border border-slate-700/50 group-hover:border-transparent">
                        <span className="font-['Orbitron'] text-xs font-bold tracking-wider">Select</span>
                        <ChevronRight size={14} className="text-blue-400" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}