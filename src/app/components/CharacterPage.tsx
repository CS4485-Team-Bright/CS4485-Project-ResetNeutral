import { useParams, Link, Navigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { InputDisplay } from "./InputDisplay";
import { PracticeArena } from "./PracticeArena";
import { useState, useMemo } from "react";
import { useCharacter } from "../hooks/useGameData";

function getDifficultyBadgeStyles(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-emerald-500/20 text-emerald-200 border-emerald-400/40";
    case "intermediate":
      return "bg-amber-500/20 text-amber-200 border-amber-400/40";
    case "advanced":
      return "bg-red-500/20 text-red-200 border-red-400/40";
    default:
      return "bg-slate-700/70 text-slate-200 border-slate-500/60";
  }
}

export function CharacterPage() {
  const { gameId, characterId } = useParams();
  const { game, character, loading, error } = useCharacter(gameId || "", characterId || "");
  const [facing, setFacing] = useState<"right" | "left">("right");

  // Determine the display order for moves universally
  const sortedMoves = useMemo(() => {
    if (!character?.moves) return [];
    
    const getWeight = (type: string) => {
      const t = (type || "").toLowerCase();
      if (t.includes("normal") && !t.includes("command")) return 1;
      if (t.includes("command normal") || t.includes("unique")) return 2;
      if (t.includes("special")) return 3;
      if (t.includes("super 1") || t.includes("super art 1")) return 4;
      if (t.includes("super 2") || t.includes("super art 2")) return 5;
      if (t.includes("super 3") || t.includes("super art 3")) return 6;
      if (t.includes("ultimate") || t.includes("critical")) return 7;
      if (t.includes("super")) return 8; // generic super fallback
      return 99; // unknown types fallback to the end
    };

    return [...character.moves].sort((a, b) => getWeight(a.type) - getWeight(b.type));
  }, [character?.moves]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading character...
      </div>
    );
  }

  if (error || !game || !character) return <Navigate to="/games" />;

  return (
    <div className="min-h-screen">
      <div className="relative border-b border-blue-500/15 overflow-hidden">
        {character.banner && (
          <div className="absolute inset-0 opacity-20">
            <img src={character.banner} alt="" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link to="/games" className="hover:text-white transition-colors font-['Orbitron']">Games</Link>
            <span>/</span>
            <Link to={`/game/${game.id}`} className="hover:text-white transition-colors font-['Orbitron']">
              {game.short_name}
            </Link>
            <span>/</span>
            <span className="text-white font-['Orbitron']">{character.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {character.image ? (
              <div
                className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border-2"
                style={{ borderColor: character.color + "50" }}
              >
                <img src={character.image} alt={character.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center flex-shrink-0 border-2"
                style={{ backgroundColor: character.color + "20", borderColor: character.color + "50" }}
              >
                <div className="text-center px-4">
                  <div className="text-blue-500/30 text-3xl mb-1">🥋</div>
                  <p className="text-slate-500 text-xs">Character portrait</p>
                </div>
              </div>
            )}

            <div className="flex-1">
              <p className="text-blue-400 text-sm font-['Orbitron']">{game.name}'s {character.title}</p>
              <h1 className="text-white font-['Orbitron'] mb-2">{character.name}</h1>
              <p className="text-slate-300 max-w-2xl mb-4">{character.description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-['Orbitron'] tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase border border-blue-500/20">
                  {character.archetype}
                </span>
                <span
                  className={`text-sm font-['Orbitron'] tracking-wider uppercase px-3 py-1 rounded-full border ${getDifficultyBadgeStyles(character.difficulty)}`}
                >
                  {character.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-white font-['Orbitron'] mb-4">Move List</h2>
              <div className="space-y-3">
                {sortedMoves.map((move) => (
                  <div key={move.id} className="bg-[#111d33] border border-blue-500/15 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-white font-['Orbitron']">{move.name}</h4>
                        <span className="text-[10px] uppercase tracking-wide text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {move.type}
                        </span>
                      </div>
                      <InputDisplay input={move.input} size="sm" />
                    </div>
                    {move.gif ? (
                      <div className="mt-3 mb-3 rounded-lg overflow-hidden border border-blue-500/20 bg-[#0a1628] flex justify-center bg-black/40">
                        <img src={move.gif} alt={`${move.name} demonstration`} className="max-w-full max-h-64 object-contain" />
                      </div>
                    ) : (
                      <div className="mt-3 mb-3 rounded-lg overflow-hidden border border-blue-500/20 bg-[#0a1628] aspect-video flex items-center justify-center">
                        <div className="text-center px-4">
                          <div className="text-blue-500/30 text-4xl mb-2">🎬</div>
                          <p className="text-slate-500 text-sm">Move demonstration GIF</p>
                          <p className="text-slate-600 text-xs mt-1">Coming soon</p>
                        </div>
                      </div>
                    )}
                    <p className="text-slate-400 text-sm mt-2">{move.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Damage: {move.damage}</span>
                      <span>Startup: {move.startup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-white font-['Orbitron'] mb-4">Combos</h2>
              <div className="space-y-3">
                {character.combos.map((combo) => (
                  <div key={combo.id} className="bg-[#111d33] border border-blue-500/15 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-['Orbitron']">{combo.name}</h4>
                      <span
                        className={`text-[10px] uppercase tracking-wide border px-2 py-0.5 rounded ${getDifficultyBadgeStyles(combo.difficulty)}`}
                      >
                        {combo.difficulty}
                      </span>
                    </div>
                    <div className="bg-[#0a1628] rounded-lg px-3 py-2 mb-2 font-mono text-sm text-blue-300 overflow-x-auto">
                      {combo.inputs}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{combo.notes}</span>
                      <span className="text-emerald-400 font-medium font-mono flex-shrink-0 ml-2">{combo.damage} dmg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="sticky top-4">
              <div className="bg-[#0d1f35] border border-blue-500/30 rounded-t-xl p-4 border-b-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-white font-['Orbitron']">Practice Arena</h2>
                  <div className="flex rounded-lg overflow-hidden border border-blue-500/20">
                    <button
                      onClick={() => setFacing("right")}
                      className={`px-3 py-1 text-sm transition-colors ${
                        facing === "right"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      → Right
                    </button>
                    <button
                      onClick={() => setFacing("left")}
                      className={`px-3 py-1 text-sm transition-colors ${
                        facing === "left"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ← Left
                    </button>
                  </div>
                </div>
              </div>
              <div className="rounded-t-none overflow-hidden">
                <PracticeArena
                  character={character}
                  gameId={game.id}
                  facing={facing}
                  inputWindowMs={game.input_window_ms}
                  comboLinkWindowMs={game.combo_link_window_ms}
                />
              </div>
              <Link
                to={`/game/${game.id}`}
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-['Orbitron'] transition-colors mt-4"
              >
                <ArrowLeft size={16} />
                Back to {game.short_name} Characters
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}