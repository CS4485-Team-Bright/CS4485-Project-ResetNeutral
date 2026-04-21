import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router";
import { supabase } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useUserMoveMastery, useUserComboMastery } from "../hooks/useMastery";
import { ChevronDown, User, Gamepad2, Check, Save, Trophy, Play, ArrowDownAZ, SortAsc, SortDesc, Flame, Zap, Activity } from "lucide-react";

type MoveLite = { id: string; name: string };
type ComboLite = { id: string; name: string };

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
  const [sortOrder, setSortOrder] = useState<"alpha" | "most" | "least">("alpha");

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
        .select("id, name, characters(id, name, image, moves(id, name), combos(id, name))");
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

  const { totalItemsCount, masteredItemsCount } = useMemo(() => {
    let tCount = 0;
    let mCount = 0;
    games.forEach((g) => g.characters.forEach((c) => {
      c.moves?.forEach((m) => {
        tCount++;
        if (masteryMap.get(m.id)?.mastered) mCount++;
      });
      c.combos?.forEach((cm) => {
        tCount++;
        if (comboMasteryMap.get(cm.id)?.mastered) mCount++;
      });
    }));
    return { totalItemsCount: tCount, masteredItemsCount: mCount };
  }, [games, masteryMap, comboMasteryMap]);

  const stats = useMemo(() => {
    let highestStreak = 0;
    let highestStreakOrigin = null as null | { characterName: string; moveName: string; image?: string | null };

    let fastestTime = Infinity;
    let fastestTimeOrigin = null as null | { characterName: string; moveName: string; image?: string | null };

    let charactersMasteredCount = 0;

    games.forEach((game) => {
      game.characters.forEach((character) => {
        let charMasteredCount = 0;
        const charTotalCount = (character.moves?.length || 0) + (character.combos?.length || 0);

        character.moves?.forEach((move) => {
          const row = masteryMap.get(move.id);
          if (row?.mastered) charMasteredCount++;
          if (row) {
            const maxVal = Math.max(row.best_streak_count || 0, row.current_streak_count || 0);
            if (maxVal > highestStreak) {
              highestStreak = maxVal;
              highestStreakOrigin = { characterName: character.name, moveName: move.name, image: character.image };
            }
            if (row.best_avg_time_ms !== null && row.best_avg_time_ms < fastestTime && row.best_avg_time_ms > 0) {
              fastestTime = row.best_avg_time_ms;
              fastestTimeOrigin = { characterName: character.name, moveName: move.name, image: character.image };
            }
          }
        });
        character.combos?.forEach((combo) => {
          const row = comboMasteryMap.get(combo.id);
          if (row?.mastered) charMasteredCount++;
          if (row) {
            const maxVal = Math.max(row.best_streak_count || 0, row.current_streak_count || 0);
            if (maxVal > highestStreak) {
              highestStreak = maxVal;
              highestStreakOrigin = { characterName: character.name, moveName: combo.name, image: character.image };
            }
            if (row.best_avg_time_ms !== null && row.best_avg_time_ms < fastestTime && row.best_avg_time_ms > 0) {
              fastestTime = row.best_avg_time_ms;
              fastestTimeOrigin = { characterName: character.name, moveName: combo.name, image: character.image };
            }
          }
        });

        if (charTotalCount > 0 && charMasteredCount === charTotalCount) {
          charactersMasteredCount++;
        }
      });
    });

    return { 
      highestStreak, 
      highestStreakOrigin, 
      fastestTime: fastestTime === Infinity ? null : fastestTime, 
      fastestTimeOrigin,
      charactersMasteredCount
    };
  }, [games, masteryMap, comboMasteryMap]);

  const overallMasteryPct = totalItemsCount === 0 ? 0 : Math.round((masteredItemsCount / totalItemsCount) * 100);

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap');
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold tracking-wide font-['Orbitron']">Profile</h1>
        <p className="text-slate-400 mt-1">Manage your account and track your character mastery progress.</p>
      </div>

      {/* PROFILE SETTINGS CARD */}
      <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden mb-8 shadow-lg">
        <div className="p-4 border-b border-blue-500/20 flex items-center gap-2">
          <User className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold font-['Orbitron']">Account Details</h3>
        </div>
        
        <div className="p-6">
          <div className="max-w-md">
            <div className="mb-5">
              <label className="block text-slate-400 text-sm font-medium mb-2 font-['Orbitron']">Display Name</label>
              <div className="flex gap-3">
                <input
                  value={usernameDraft}
                  onChange={(e) => setUsernameDraft(e.target.value)}
                  className="flex-1 rounded-lg bg-[#0a1628] border border-slate-700 hover:border-blue-500/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white px-4 py-2 transition-all outline-none font-['Orbitron']"
                  placeholder="Enter your username"
                />
                <button 
                  onClick={saveName} 
                  className="flex items-center gap-2 text-sm font-semibold text-blue-400 bg-blue-500/10 px-5 py-2 rounded-lg border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)] hover:bg-blue-500/20 hover:text-blue-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.25)] transition-all font-['Orbitron']"
                >
                  <Save size={16} />
                  Save
                </button>
              </div>
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 font-['Orbitron']">Email Address</label>
              <p className="text-slate-300 font-medium">{profile?.email ?? user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* EMPTY STATE CTA */}
      {totalItemsCount > 0 && masteredItemsCount === 0 && (
        <div className="mb-8 rounded-xl border border-blue-500/40 bg-[#0a1628] p-8 text-center shadow-[0_0_25px_rgba(59,130,246,0.15)] relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent mix-blend-overlay" />
          <h2 className="text-2xl font-bold text-white mb-2 font-['Orbitron']">Ready to begin your journey?</h2>
          <p className="text-slate-400 mb-6 max-w-lg mx-auto font-['Orbitron'] text-sm tracking-wide">
            You haven't mastered any moves or combos yet. Step into the arena and choose a game!
          </p>
          <Link 
            to="/games" 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold font-['Orbitron'] tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] group-hover:scale-105"
          >
            <Play size={18} fill="currentColor" />
            Start Practicing
          </Link>
        </div>
      )}

      {/* STATS SECTION */}
      <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden mb-8 shadow-lg">
        <div className="p-4 border-b border-blue-500/20 flex items-center gap-2">
          <Activity className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold font-['Orbitron']">Stats</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* HIGHEST STREAK */}
            <div className="relative z-0 bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 flex flex-col justify-between transition-all hover:bg-slate-800/60 hover:border-orange-500/30 overflow-hidden">
              {stats.highestStreakOrigin?.image && (
                <div className="absolute right-0 top-0 bottom-0 pointer-events-none -z-10 flex justify-end">
                  <img 
                    src={stats.highestStreakOrigin.image} 
                    className="h-full w-auto opacity-50"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
                    }}
                    alt=""
                  />
                </div>
              )}
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 font-['Orbitron'] flex items-center gap-1.5 focus-within:z-10">
                <Flame size={14} className="text-orange-500" strokeWidth={2.5} />
                Highest Streak
              </label>
              {stats.highestStreak > 0 ? (
                <>
                  <div className="text-4xl font-black font-['Orbitron'] text-orange-400 mb-2 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                    {stats.highestStreak}
                  </div>
                  <div className="text-slate-300 font-medium font-['Orbitron'] leading-tight relative z-10 w-fit drop-shadow-md">
                    {stats.highestStreakOrigin?.characterName}
                  </div>
                  <div className="text-slate-500 text-sm font-mono truncate relative z-10 w-3/4 drop-shadow-md">
                    {stats.highestStreakOrigin?.moveName}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-sm font-['Orbitron'] mt-2">No streaks yet.</p>
              )}
            </div>

            {/* FASTEST EXECUTION TIME */}
            <div className="relative z-0 bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 flex flex-col justify-between transition-all hover:bg-slate-800/60 hover:border-blue-500/30 overflow-hidden">
              {stats.fastestTimeOrigin?.image && (
                <div className="absolute right-0 top-0 bottom-0 pointer-events-none -z-10 flex justify-end">
                  <img 
                    src={stats.fastestTimeOrigin.image} 
                    className="h-full w-auto opacity-50"
                    style={{
                      maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)'
                    }}
                    alt=""
                  />
                </div>
              )}
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 font-['Orbitron'] flex items-center gap-1.5">
                <Zap size={14} className="text-blue-400" strokeWidth={2.5} />
                Fastest Execution
              </label>
              {stats.fastestTime ? (
                <>
                  <div className="text-4xl font-black font-['Orbitron'] text-blue-300 mb-2 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {stats.fastestTime} <span className="text-lg text-blue-500 font-medium tracking-wide">ms</span>
                  </div>
                  <div className="text-slate-300 font-medium font-['Orbitron'] leading-tight relative z-10 w-fit drop-shadow-md">
                    {stats.fastestTimeOrigin?.characterName}
                  </div>
                  <div className="text-slate-500 text-sm font-mono truncate relative z-10 w-3/4 drop-shadow-md">
                    {stats.fastestTimeOrigin?.moveName}
                  </div>
                </>
              ) : (
                <p className="text-slate-500 text-sm font-['Orbitron'] mt-2">No data yet.</p>
              )}
            </div>
             {/* CHARACTERS MASTERED */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-5 flex flex-col justify-between transition-all hover:bg-slate-800/60 hover:border-emerald-500/30">
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3 font-['Orbitron'] flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" strokeWidth={2.5} />
                Characters Mastered
              </label>
              <div className="text-4xl font-black font-['Orbitron'] text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                {stats.charactersMasteredCount}
              </div>
              <div className="text-slate-300 font-medium font-['Orbitron'] leading-tight">
                Fully Completed
              </div>
              <div className="text-slate-500 text-sm font-mono truncate">
                out of all characters
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OVERALL PROGRESS SUMMARY */}
      {totalItemsCount > 0 && (
        <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden mb-8 shadow-[0_0_15px_rgba(59,130,246,0.15)] relative">
          <div className="p-4 border-b border-blue-500/20 flex items-center justify-between bg-blue-500/5">
            <div className="flex items-center gap-2">
              <Trophy className="text-emerald-400 font-['Orbitron']" size={20} />
              <h3 className="text-white font-semibold font-['Orbitron'] tracking-wider">Universal Mastery</h3>
            </div>
            <span className="text-emerald-400 font-bold font-['Orbitron'] text-xl">{overallMasteryPct}%</span>
          </div>
          <div className="p-6">
            <p className="text-slate-400 text-sm mb-4 font-['Orbitron'] flex justify-between items-center tracking-wider">
              <span>Overall Progress</span>
              <span className="text-slate-300"><span className="text-emerald-400 font-bold">{masteredItemsCount}</span> / {totalItemsCount} Mastered</span>
            </p>
            <div className="w-full h-3.5 bg-[#0a1628] rounded-full overflow-hidden border border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] relative">
              <div 
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 relative shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                style={{ width: `${overallMasteryPct}%`, transition: 'width 1s ease-in-out' }}
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite] -translate-x-full" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GAME MASTERY CARD */}
      <div className="bg-[#0d1f35] border border-blue-500/30 rounded-xl overflow-hidden shadow-lg border-t border-t-blue-500/50">
        <div className="p-4 border-b border-blue-500/20 flex items-center gap-2">
          <Gamepad2 className="text-blue-400" size={20} />
          <h3 className="text-white font-semibold font-['Orbitron']">Game Mastery</h3>
        </div>

        <div className="p-6">
          <p className="text-slate-400 text-sm mb-5 font-['Orbitron']">
            Select a game below to view your mastery percentage for each character. Master moves in the Practice Arena to achieve mastery!
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
                      <span className="text-white font-semibold text-lg font-['Orbitron']">{game.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {gamePct > 0 ? (
                        <span className="text-sm font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.15)] flex items-center gap-1.5 font-['Orbitron']">
                          <Check size={14} />
                          Mastery: {gamePct}%
                        </span>
                      ) : (
                         <span className="text-sm font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1.5 font-['Orbitron']">
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
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-2">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-['Orbitron'] font-semibold">
                          Characters
                        </span>
                        <div className="flex items-center bg-[#0a1628] rounded-lg p-1 border border-slate-700 shadow-inner gap-1">
                          <button
                            onClick={() => setSortOrder("alpha")}
                            className={`p-1.5 rounded flex items-center justify-center transition-all ${sortOrder === "alpha" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
                            title="Alphabetical"
                          >
                            <ArrowDownAZ size={16} />
                          </button>
                          <button
                            onClick={() => setSortOrder("most")}
                            className={`p-1.5 rounded flex items-center justify-center transition-all ${sortOrder === "most" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
                            title="Most Mastered"
                          >
                            <SortDesc size={16} />
                          </button>
                          <button
                            onClick={() => setSortOrder("least")}
                            className={`p-1.5 rounded flex items-center justify-center transition-all ${sortOrder === "least" ? "bg-blue-500/20 border border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
                            title="Least Mastered"
                          >
                            <SortAsc size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {[...game.characters].sort((a, b) => {
                        if (sortOrder === "alpha") {
                          return a.name.localeCompare(b.name);
                        }
                        const pctA = characterMasteryPercent(a);
                        const pctB = characterMasteryPercent(b);
                        return sortOrder === "most" ? pctB - pctA : pctA - pctB;
                      }).map((character) => {
                        const pct = characterMasteryPercent(character);

                        return (
                          <Link 
                            to={`/game/${game.id}/character/${character.id}`}
                            key={character.id} 
                            className="flex flex-col items-center p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer"
                          >
                            <div className="relative w-24 h-24 mb-3 rounded-xl overflow-hidden bg-[#0d1f35] border border-slate-700 transition-transform duration-300 group-hover:scale-105 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                              {/* rising border fill */}
                              {pct > 0 && pct < 100 && (
                                <div
                                  className="absolute inset-0 bg-gradient-to-t from-emerald-700 to-emerald-300"
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
                                    className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110 ${pct === 100 ? 'brightness-110 contrast-110' : ''}`} 
                                  />
                                ) : (
                                  <span className="text-2xl transition-transform duration-500 group-hover:scale-110">??</span>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-300 text-sm font-medium truncate w-full text-center group-hover:text-white transition-colors mb-0.5 font-['Orbitron']">{character.name}</p>
                            {pct > 0 ? (
                              <p className="text-emerald-400 text-xs font-bold tracking-wide font-['Orbitron']">{pct}%</p>
                            ) : (
                              <p className="text-slate-600 text-xs font-medium tracking-wide font-['Orbitron']">0%</p>
                            )}
                          </Link>
                        );
                      })}
                      </div>
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