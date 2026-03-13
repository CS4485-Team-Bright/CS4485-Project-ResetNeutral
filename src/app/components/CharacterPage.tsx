import { useParams, Link, Navigate } from "react-router";
import { getCharacter } from "../data/gameData";
import { ArrowLeft } from "lucide-react";
import { InputDisplay } from "./InputDisplay";
import { PracticeArena } from "./PracticeArena";
import { useState } from "react";

export function CharacterPage() {
  const { gameId, characterId } = useParams();
  const result = getCharacter(gameId || "", characterId || "");
  const [facing, setFacing] = useState<"right" | "left">("right");

  if (!result) return <Navigate to="/games" />;

  const { game, character } = result;

  return (
    <div className="min-h-screen">
      {/* Character Header */}
      <div className="border-b border-blue-500/15 bg-gradient-to-br from-blue-600/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
            <Link to="/games" className="hover:text-white transition-colors">
              Games
            </Link>
            <span>/</span>
            <Link
              to={`/game/${game.id}`}
              className="hover:text-white transition-colors"
            >
              {game.shortName}
            </Link>
            <span>/</span>
            <span className="text-white">{character.name}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0"
              style={{
                backgroundColor: character.color + "20",
                borderColor: character.color + "50",
                borderWidth: 2,
              }}
            >
              {character.name[0]}
            </div>

            <div className="flex-1">
              <p className="text-blue-400 text-sm">
                {game.name}'s {character.title}
              </p>
              <h1 className="text-white mb-2">{character.name}</h1>
              <p className="text-slate-300 max-w-2xl mb-4">
                {character.description}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {character.archetype}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Moves & Combos */}
          <div className="space-y-8">
            {/* Move List */}
            <div>
              <h2 className="text-white mb-4">Move List</h2>
              <div className="space-y-3">
                {character.moves.map((move) => (
                  <div
                    key={move.name}
                    className="bg-[#111d33] border border-blue-500/15 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h4 className="text-white">{move.name}</h4>
                        <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {move.type}
                        </span>
                      </div>
                      <InputDisplay input={move.input} size="sm" />
                    </div>
                    <p className="text-slate-400 text-sm mt-2">
                      {move.description}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      <span>Damage: {move.damage}</span>
                      <span>Startup: {move.startup}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Combos */}
            <div>
              <h2 className="text-white mb-4">Combos</h2>
              <div className="space-y-3">
                {character.combos.map((combo) => (
                  <div
                    key={combo.name}
                    className="bg-[#111d33] border border-blue-500/15 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white">{combo.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          combo.difficulty === "Beginner"
                            ? "text-green-400 bg-green-500/10"
                            : combo.difficulty === "Intermediate"
                            ? "text-yellow-400 bg-yellow-500/10"
                            : "text-red-400 bg-red-500/10"
                        }`}
                      >
                        {combo.difficulty}
                      </span>
                    </div>
                    <div className="bg-[#0a1628] rounded-lg px-3 py-2 mb-2 font-mono text-sm text-blue-300 overflow-x-auto">
                      {combo.inputs}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{combo.notes}</span>
                      <span className="text-blue-400 flex-shrink-0 ml-2">
                        {combo.damage} dmg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Practice Arena */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-white">Practice Arena</h2>
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
            <PracticeArena character={character} facing={facing} />

            {/* Back Link */}
            <Link
              to={`/game/${game.id}`}
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              Back to {game.shortName} Characters
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
