import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router";
import { supabase } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useUserMoveMastery, useUserComboMastery } from "../hooks/useMastery";
import { ChevronDown, User, Gamepad2, Check, Save } from "lucide-react";

type MoveLite = { id: string };
type ComboLite = { id: string };

type CharacterLite = {
  id: string;
  name: string;
  image?: string | null;
  moves: MoveLite[];
  combos: ComboLite[];
};

type GameLite = {
  id: string;
  name: string;
  characters: CharacterLite[];
};

type ProfileRow = {
  id: string;
  username: string;
  email: string | null;
};

export function ProfilePage() {
  const { user, updateUsername } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [games, setGames] = useState<GameLite[]>([]);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, username, email")
        .eq("id", user.id)
        .single();

      if (data) {
        const row = data as ProfileRow;
        setProfile(row);
        setUsernameDraft(row.username ?? "");
      }
    }
    loadProfile();
  }, [user]);

  useEffect(() => {
    async function loadGamesAndMoves() {
      const { data } = await supabase
        .from("games")
        .select("id, name, characters(id, name, image, moves(id), combos(id))");
      setGames((data ?? []) as unknown as GameLite[]);
    }
    loadGamesAndMoves();
  }, []);

  const allMoveIds = useMemo(() => {
    const ids: string[] = [];
    games.forEach((g) => g.characters.forEach((c) => c.moves?.forEach((m) => ids.push(m.id))));
    return ids;
  }, [games]);

  const allComboIds = useMemo(() => {
    const ids: string[] = [];
    games.forEach((g) => g.characters.forEach((c) => c.combos?.forEach((cm) => ids.push(cm.id))));
    return ids;
  }, [games]);

  const { map: masteryMap } = useUserMoveMastery(allMoveIds);
  const { map: comboMasteryMap } = useUserComboMastery(allComboIds);

  if (!user) return <Navigate to="/auth" />;

  async function saveName() {
    await updateUsername(usernameDraft);
    setProfile((p) => (p ? { ...p, username: usernameDraft } : p));
  }

  function characterMasteryPercent(character: CharacterLite) {
    const totalCount = (character.moves?.length || 0) + (character.combos?.length || 0);
    if (totalCount === 0) return 0;
    
    let masteredCount = 0;
    character.moves?.forEach((m) => {
      if (masteryMap.get(m.id)?.mastered) masteredCount++;
    });
    character.combos?.forEach((c) => {
      if (comboMasteryMap.get(c.id)?.mastered) masteredCount++;
    });
    
    return Math.round((masteredCount / totalCount) * 100);
  }

  function gameMasteryPercent(game: GameLite) {
    let totalItems = 0;
    let masteredItems = 0;

    game.characters.forEach((c) => {
      c.moves?.forEach((m) => {
        totalItems += 1;
        if (masteryMap.get(m.id)?.mastered) masteredItems += 1;
      });
      c.combos?.forEach((cm) => {
        totalItems += 1;
        if (comboMasteryMap.get(cm.id)?.mastered) masteredItems += 1;
      });
    });

    if (totalItems === 0) return 0;
    return Math.round((masteredItems / totalItems) * 100);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold tracking-wide">Player Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account and track your character mastery progress.</p>
      </div>

      {/* PROFILE SETTINGS CARD */}
      <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden mb-8 shadow-lg">
        <div className="p-4 border-b border-blue-500/20 flex items-center gap-2">
          <User className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold">Account Details</h3>
        </div>
        
        <div className="p-6">
          <div className="max-w-md">
            <div className="mb-5">
              <label className="block text-slate-400 text-sm font-medium mb-2">Display Name</label>
              <div className="flex gap-3">
                <input
                  value={usernameDraft}
                  onChange={(e) => setUsernameDraft(e.target.value)}
                  className="flex-1 rounded-lg bg-[#0a1628] border border-slate-700 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white px-4 py-2 transition-all outline-none"
                  placeholder="Enter your username"
                />
                <button 
                  onClick={saveName} 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors border border-blue-500 shadow-md shadow-blue-900/20"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-slate-300 font-medium">{profile?.email ?? user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GAME MASTERY CARD */}
      <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-blue-500/20 flex items-center gap-2">
          <Gamepad2 className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold">Game Mastery</h3>
        </div>

        <div className="p-6">
          <p className="text-slate-400 text-sm mb-5">
            Select a game below to view your mastery percentage for each character. Master moves in the Practice Arena to fill your rings!
          </p>

          <div className="space-y-3">
            {games.map((game) => {
              const gamePct = gameMasteryPercent(game);
              const isOpen = expandedGameId === game.id;

              return (
                <div 
                  key={game.id} 
                  className={`border rounded-xl transition-colors overflow-hidden ${
                    isOpen 
                      ? "border-blue-500/50 bg-[#0a1628] shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
                      : "border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600"
                  }`}
                >
                  <button
                    className={`w-full px-5 py-4 flex items-center justify-between text-left transition-colors ${
                      isOpen ? "border-b border-blue-500/20 bg-blue-500/5" : ""
                    }`}
                    onClick={() => setExpandedGameId(isOpen ? null : game.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">{game.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {gamePct > 0 ? (
                        <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)] flex items-center gap-1.5">
                          <Check size={14} />
                          Mastery: {gamePct}%
                        </span>
                      ) : (
                         <span className="text-sm font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1.5">
                           Mastery: 0%
                         </span>
                      )}
                      
                      <ChevronDown 
                        className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-400" : ""}`} 
                        size={20} 
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {game.characters.map((character) => {
                        const pct = characterMasteryPercent(character);

                        return (
                          <Link 
                            to={`/game/${game.id}/character/${character.id}`}
                            key={character.id} 
                            className="flex flex-col items-center p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                          >
                            <div className="relative w-24 h-24 mb-3 rounded-xl overflow-hidden bg-black border border-slate-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                              {/* rising border fill */}
                              {pct > 0 && pct < 100 && (
                                <div
                                  className="absolute inset-0 bg-gradient-to-t from-green-600 to-emerald-400 opacity-90"
                                  style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}
                                />
                              )}

                              {/* 100% mastery border */}
                              {pct === 100 && (
                                <div className="absolute inset-0 border-[3px] border-emerald-400 rounded-xl shadow-[0_0_15px_rgba(52,211,153,0.6)]" />
                              )}

                              {/* inner portrait frame */}
                              <div className="absolute inset-[4px] rounded-lg overflow-hidden bg-[#1c2f4f] flex items-center justify-center shadow-inner">
                                {character.image ? (
                                  <img 
                                    src={character.image} 
                                    alt={character.name} 
                                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${pct === 100 ? 'brightness-110 contrast-110' : ''}`} 
                                  />
                                ) : (
                                  <span className="text-2xl transition-transform duration-500 group-hover:scale-110">??</span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-300 text-sm font-medium truncate w-full text-center group-hover:text-white transition-colors mb-0.5">{character.name}</p>
                            {pct > 0 ? (
                              <p className="text-emerald-400 text-xs font-bold tracking-wide">{pct}%</p>
                            ) : (
                              <p className="text-slate-600 text-xs font-medium tracking-wide">0%</p>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}