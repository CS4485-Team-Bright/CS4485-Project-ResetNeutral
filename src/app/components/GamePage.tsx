import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useGame } from "../hooks/useGameData";

const GAME_GRADIENTS: Record<string, string> = {
  "guilty-gear-strive": "from-red-600/20 to-yellow-600/10",
  "street-fighter-6": "from-red-600/20 to-blue-600/10",
  "2xko": "from-purple-600/20 to-cyan-600/10",
};

export function GamePage() {
  const { gameId } = useParams();
  const { game, loading, error } = useGame(gameId || "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading game...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Failed to load game: {error}
      </div>
    );
  }

  if (!game) return <Navigate to="/games" />;

  return (
    <div className="min-h-screen">
      <div className="relative border-b border-blue-500/15 overflow-hidden">
        {game.banner && (
          <div className="absolute inset-0 opacity-20">
            <img src={game.banner} alt="" className="w-full h-full object-cover" />
            <div className={`absolute inset-0 bg-gradient-to-br ${GAME_GRADIENTS[game.id]}`} />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            to="/games"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> All Games
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-blue-400 text-sm mb-1">
                {game.developer} &middot; {game.release_year}
              </p>
              <h1 className="text-white mb-3">{game.name}</h1>
              <p className="text-slate-300 max-w-2xl">{game.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h2 className="text-white mb-6 text-center text-5xl font-medium">Characters</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {game.characters.map((character) => (
            <Link
              key={character.id}
              to={`/game/${game.id}/character/${character.id}`}
              className="group relative w-[120px] h-[120px] rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ boxShadow: "0px 4px 4px 1px rgba(0,0,0,0.25)" }}
              title={character.name}
            >
              {character.image ? (
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: character.color + "30" }}
                >
                  <span className="text-3xl">🥋</span>
                </div>
              )}
              <div
                className="absolute top-0 left-0 right-0 py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "#550F0F" }}
              >
                <span className="text-white text-[15px] font-semibold text-center block truncate">
                  {character.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}