import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useGames } from "../hooks/useGameData";

const GAME_GRADIENTS: Record<string, string> = {
  "guilty-gear-strive": "from-red-600/30 to-yellow-600/10",
  "street-fighter-6": "from-red-600/30 to-blue-600/10",
  "2xko": "from-purple-600/30 to-cyan-600/10",
};

export function GamesListPage() {
  const { games, loading, error } = useGames();

  return (
    <div className="min-h-screen py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-white mb-2">Select a Game</h1>
        <p className="text-slate-400 mb-10">
          Choose a fighting game to explore characters, moves, and combos.
        </p>

        {loading && (
          <p className="text-slate-400 text-center">Loading games...</p>
        )}
        {error && (
          <p className="text-red-400 text-center">Failed to load games: {error}</p>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/game/${game.id}`}
              className="group relative bg-[#111d33] border border-blue-500/20 rounded-xl overflow-hidden hover:border-blue-400/40 transition-all hover:scale-[1.02]"
            >
              {game.banner && (
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity">
                  <img src={game.banner} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-br ${GAME_GRADIENTS[game.id]}`} />
                </div>
              )}
              <div className="relative p-6">
                <div className="mb-4">
                  <h2 className="text-white mb-1">{game.name}</h2>
                  <p className="text-slate-400 text-sm">
                    {game.developer} &middot; {game.release_year}
                  </p>
                </div>
                <p className="text-slate-300 text-sm mb-6 line-clamp-3">
                  {game.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm">
                    {game.characters.length} Characters
                  </span>
                  <ChevronRight
                    size={20}
                    className="text-slate-500 group-hover:text-blue-400 transition-colors"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}