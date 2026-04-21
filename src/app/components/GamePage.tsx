import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft, Users } from "lucide-react";
import { useGame } from "../hooks/useGameData";

const GAME_GRADIENTS: Record<string, string> = {
  "guilty-gear-strive": "from-red-500 via-orange-500 to-yellow-500",
  "street-fighter-6": "from-blue-600 via-purple-500 to-red-500",
  "2xko": "from-purple-500 via-pink-500 to-cyan-500",
};

export function GamePage() {
  const { gameId } = useParams();
  const { game, loading, error } = useGame(gameId || "");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040c17] flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');`}</style>
        <p className="text-blue-400 text-xl font-['Orbitron'] animate-pulse tracking-widest uppercase">
          Loading Arena...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#040c17] flex items-center justify-center p-4">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');`}</style>
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-xl text-center max-w-2xl w-full shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <p className="text-red-400 font-bold font-['Orbitron'] tracking-widest uppercase text-xl mb-4">
            Connection Lost
          </p>
          <p className="text-slate-400">{error}</p>
          <Link to="/games" className="inline-flex items-center justify-center mt-6 text-blue-400 hover:text-blue-300 font-['Orbitron'] font-bold uppercase tracking-wider text-sm transition-colors">
            <ArrowLeft size={16} className="mr-2" /> Return to Selection
          </Link>
        </div>
      </div>
    );
  }

  if (!game) return <Navigate to="/games" />;

  const gradientClasses = GAME_GRADIENTS[game.id] || "from-blue-500 to-purple-500";

  return (
    <div className="min-h-screen bg-[#040c17] relative overflow-hidden pb-20">
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
      <div className={`absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r ${gradientClasses} rounded-full mix-blend-screen filter blur-[120px] animate-pulse opacity-10 pointer-events-none`} />
      <div className={`absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-l ${gradientClasses} rounded-full mix-blend-screen filter blur-[150px] animate-pulse delay-1000 opacity-10 pointer-events-none`} />

      {/* Hero Banner Section */}
      <div className="relative border-b border-blue-500/20 bg-[#040c17] overflow-hidden z-10">
        {game.banner && (
          <div className="absolute inset-0">
            <img 
              src={game.banner} 
              alt="" 
              className="w-full h-full object-cover opacity-30 mix-blend-lighten" 
            />
            {/* Soft Edge Gradients to blend into the background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#040c17]/80 via-transparent to-[#040c17]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#040c17] via-transparent to-[#040c17]" />
            <div className={`absolute inset-0 bg-gradient-to-r ${gradientClasses} opacity-20 mix-blend-overlay`} />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            to="/games"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-white text-sm mb-6 transition-colors font-['Orbitron'] uppercase tracking-widest font-bold group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Directory
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 font-['Orbitron'] shadow-black drop-shadow-md">
                {game.developer} &middot; {game.release_year}
              </p>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 font-['Orbitron'] tracking-wider drop-shadow-lg leading-tight">
                {game.name}
              </h1>
              <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed drop-shadow-md">
                {game.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="flex flex-col items-center mb-12">
           <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
             <Users size={28} className="text-blue-400" />
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-white font-['Orbitron'] tracking-widest uppercase mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] text-center">
             Choose Your Fighter
           </h2>
           <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {game.characters.map((character) => (
            <Link
              key={character.id}
              to={`/game/${game.id}/character/${character.id}`}
              className="group flex flex-col items-center w-[140px] md:w-[160px] transition-transform duration-300"
            >
              <div 
                className="relative w-full aspect-[3/4] mb-4 rounded-xl overflow-hidden bg-[#0d1f35] border-2 group-hover:border-blue-400 transition-all duration-300 group-hover:-translate-y-3 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] shadow-lg z-10"
                style={{ borderColor: character.color ? `${character.color}80` : '#334155' }}
              >
                {/* Background Fill Layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#040c17] via-transparent to-transparent opacity-80 z-10 pointer-events-none" />
                
                {/* Optional Char Color Glow underneath */}
                {character.color && (
                   <div 
                     className="absolute inset-0 opacity-20 mix-blend-color z-0" 
                     style={{ backgroundColor: character.color }} 
                   />
                )}

                {character.image ? (
                  <img 
                    src={character.image} 
                    alt={character.name} 
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 relative z-0" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center relative z-0 opacity-50">
                    <span className="text-4xl mb-2">🥋</span>
                    <span className="text-slate-500 font-['Orbitron'] text-[10px] tracking-widest uppercase">Locked</span>
                  </div>
                )}
                
                {/* Bottom Gradient overlay to ensure text readability if overlaid */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#040c17] via-[#040c17]/50 to-transparent z-10 opacity-60 group-hover:opacity-90 transition-opacity" />
              </div>
              
              <div className="text-center w-full relative z-10">
                <span className="text-white font-['Orbitron'] font-bold text-sm md:text-base uppercase tracking-wider block truncate transition-colors duration-300 drop-shadow-md" style={{ color: character.color || 'white' }}>
                  {character.name}
                </span>
                <span className="text-slate-500 font-['Orbitron'] text-[10px] uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity block duration-300 text-blue-400">
                  Select
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}