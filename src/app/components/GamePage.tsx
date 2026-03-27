import { useParams, Link, Navigate } from "react-router";
import { getGame } from "../data/gameData";
import { ChevronRight, ArrowLeft } from "lucide-react";

const GAME_GRADIENTS: Record<string, string> = {
  "guilty-gear-strive": "from-red-600/20 to-yellow-600/10",
  "street-fighter-6": "from-red-600/20 to-blue-600/10",
  "2xko": "from-purple-600/20 to-cyan-600/10",
};

export function GamePage() {
  const { gameId } = useParams();
  const game = getGame(gameId || "");

  if (!game) return <Navigate to="/games" />;

  return (
    <div className="min-h-screen">
      {/* Game Header */}
      <div
        className={`bg-gradient-to-br ${GAME_GRADIENTS[game.id]} border-b border-blue-500/15`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link
            to="/games"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> All Games
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <p className="text-blue-400 text-sm mb-1">
                {game.developer} &middot; {game.releaseYear}
              </p>
              <h1 className="text-white mb-3">{game.name}</h1>
              <p className="text-slate-300 max-w-2xl">{game.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Characters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h2 className="text-white mb-6">Characters</h2>

        <div className="grid gap-4">
          {game.characters.map((character) => (
            <Link
              key={character.id}
              to={`/game/${game.id}/character/${character.id}`}
              className="group bg-[#111d33] border border-blue-500/15 rounded-xl p-5 hover:border-blue-400/30 transition-all flex items-center gap-4"
            >
              <div
                className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl"
                style={{ backgroundColor: character.color + "30", borderColor: character.color + "60", borderWidth: 2 }}
              >
                {character.image ? (
                <div
                    className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2"
                    style={{
                      borderColor: character.color + "50",
                    }}
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border-2"
                    style={{
                      backgroundColor: character.color + "20",
                      borderColor: character.color + "50",
                    }}
                  >
                    <div className="text-center px-4">
                      <div className="text-blue-500/30 text-3xl mb-1">🥋</div>
                      <p className="text-slate-500 text-xs">Character portrait</p>
                    </div>
                  </div>
                )}
                </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-white">{character.name}</h3>
                <p className="text-slate-400 text-sm truncate">
                  {character.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {character.archetype}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      character.difficulty === "Easy"
                        ? "text-green-400 bg-green-500/10"
                        : character.difficulty === "Medium"
                        ? "text-yellow-400 bg-yellow-500/10"
                        : "text-red-400 bg-red-500/10"
                    }`}
                  >
                    {character.difficulty}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={20}
                className="text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
