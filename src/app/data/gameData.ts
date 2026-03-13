export interface Move {
  name: string;
  input: string;
  damage: string;
  startup: string;
  type: string;
  description: string;
}

export interface Combo {
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  inputs: string;
  damage: string;
  notes: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  archetype: string;
  difficulty: "Easy" | "Medium" | "Hard";
  moves: Move[];
  combos: Combo[];
  color: string;
}

export interface Game {
  id: string;
  name: string;
  shortName: string;
  description: string;
  releaseYear: number;
  developer: string;
  characters: Character[];
  color: string;
  accentColor: string;
}

export const games: Game[] = [
  {
    id: "guilty-gear-strive",
    name: "Guilty Gear Strive",
    shortName: "GGST",
    description:
      "Guilty Gear -Strive- is a fighting game developed by Arc System Works. It features stunning visuals, a rock-inspired soundtrack, and a deep combat system that rewards creative play. The game strikes a balance between accessibility and depth, making it a great entry point for the anime fighting game subgenre.",
    releaseYear: 2021,
    developer: "Arc System Works",
    color: "#dc2626",
    accentColor: "#fbbf24",
    characters: [
      {
        id: "sol-badguy",
        name: "Sol Badguy",
        title: "The Flame of Corruption",
        description:
          "Sol Badguy is the main protagonist of the Guilty Gear series. A bounty hunter with a gruff exterior, Sol wields a blunt sword called the Fireseal and uses fire-based attacks. He excels at close-range combat with powerful normals and devastating special moves.",
        archetype: "Balanced / Rushdown",
        difficulty: "Easy",
        color: "#dc2626",
        moves: [
          { name: "Gun Flame", input: "236P", damage: "65", startup: "19f", type: "Special", description: "Sol fires a ground-level flame projectile. Great for controlling space at mid-range." },
          { name: "Volcanic Viper", input: "623S or 623H", damage: "90-130", startup: "9f", type: "Special", description: "Sol's signature uppercut. Invincible on startup, excellent as a reversal." },
          { name: "Bandit Revolver", input: "236K", damage: "70", startup: "16f", type: "Special", description: "A forward-moving kick attack that closes distance quickly." },
          { name: "Wild Throw", input: "623K", damage: "120", startup: "5f", type: "Command Grab", description: "A close-range command grab that deals solid damage." },
          { name: "Night Raid Vortex", input: "214S", damage: "85", startup: "20f", type: "Special", description: "A low-hitting slide that goes under some attacks." },
          { name: "Tyrant Rave", input: "632146H", damage: "200", startup: "11f", type: "Overdrive", description: "Sol's super move. Devastating damage with full meter." },
        ],
        combos: [
          { name: "Basic BnB", difficulty: "Beginner", inputs: "c.S > f.S > 236K", damage: "145", notes: "Simple confirm from close slash into Bandit Revolver." },
          { name: "Midscreen Combo", difficulty: "Intermediate", inputs: "c.S > f.S > 5H > 236K > 66 > c.S > 623H", damage: "210", notes: "Solid midscreen damage with wall carry." },
          { name: "Corner Combo", difficulty: "Advanced", inputs: "c.S > 2H > 236K > 66 > c.S > f.S > 5H > 623H > Wall Break", damage: "280", notes: "High damage corner route that leads to wall break." },
        ],
      },
      {
        id: "ky-kiske",
        name: "Ky Kiske",
        title: "The Thunderseal",
        description:
          "Ky Kiske is the quintessential well-rounded character. A noble knight who wields the Thunderseal sword, Ky has strong fundamentals with good projectiles, solid normals, and a reliable reversal. He's the perfect character for learning the game.",
        archetype: "All-Rounder",
        difficulty: "Easy",
        color: "#2563eb",
        moves: [
          { name: "Stun Edge", input: "236S", damage: "55", startup: "13f", type: "Special", description: "A lightning projectile that travels across the screen." },
          { name: "Charged Stun Edge", input: "236H", damage: "70", startup: "20f", type: "Special", description: "A slower, more powerful version of Stun Edge." },
          { name: "Vapor Thrust", input: "623S or 623H", damage: "80-120", startup: "9f", type: "Special", description: "Ky's invincible uppercut. Key reversal tool." },
          { name: "Stun Dipper", input: "236K", damage: "75", startup: "11f", type: "Special", description: "A sliding low attack that covers ground quickly." },
          { name: "Foudre Arc", input: "214K", damage: "50", startup: "22f", type: "Special", description: "An overhead attack that can be used to open up crouching opponents." },
          { name: "Ride the Lightning", input: "632146H", damage: "196", startup: "8f", type: "Overdrive", description: "Ky's super. Fast startup and huge damage." },
        ],
        combos: [
          { name: "Basic Confirm", difficulty: "Beginner", inputs: "c.S > f.S > 236K", damage: "130", notes: "Easy hit confirm into Stun Dipper knockdown." },
          { name: "Midscreen Route", difficulty: "Intermediate", inputs: "c.S > 2H > 236S > 66 > c.S > 623H", damage: "195", notes: "Good midscreen damage with projectile link." },
          { name: "Shock State Combo", difficulty: "Advanced", inputs: "c.S > f.S > 5H > 214K > c.S > 2H > 623H", damage: "250", notes: "Uses Foudre Arc reset for extended damage." },
        ],
      },
      {
        id: "may",
        name: "May",
        title: "The Whimsical Pirate",
        description:
          "May is an energetic pirate girl who fights with a giant anchor. She specializes in close-range pressure with her dolphins and has some of the most explosive damage in the game. Great for players who like aggressive, fun playstyles.",
        archetype: "Rushdown / Charge",
        difficulty: "Easy",
        color: "#f97316",
        moves: [
          { name: "Mr. Dolphin (Horizontal)", input: "[4]6S or [4]6H", damage: "70-90", startup: "12f", type: "Special", description: "May rides a dolphin forward. Core of her offense." },
          { name: "Mr. Dolphin (Vertical)", input: "[2]8S or [2]8H", damage: "80", startup: "9f", type: "Special", description: "May rides a dolphin upward. Anti-air and combo tool." },
          { name: "Arisugawa Sparkle", input: "236K", damage: "65", startup: "25f", type: "Special", description: "A command grab that pulls the opponent in." },
          { name: "Overhead Kiss", input: "j.236K", damage: "55", startup: "15f", type: "Special", description: "An aerial overhead attack." },
          { name: "Great Yamada Attack", input: "632146S", damage: "220", startup: "13f", type: "Overdrive", description: "May summons a giant whale. Massive damage." },
        ],
        combos: [
          { name: "Dolphin BnB", difficulty: "Beginner", inputs: "c.S > f.S > [4]6S", damage: "140", notes: "Basic combo into horizontal dolphin. Easy execution." },
          { name: "Totsugeki Loop", difficulty: "Intermediate", inputs: "c.S > 2H > [4]6H > 66 > c.S > [4]6S", damage: "200", notes: "Dolphin loop for good damage and carry." },
          { name: "Whale Combo", difficulty: "Advanced", inputs: "c.S > 2H > [4]6H > 66 > c.S > f.S > 5H > 632146S", damage: "310", notes: "Max damage combo ending in super." },
        ],
      },
    ],
  },
  {
    id: "street-fighter-6",
    name: "Street Fighter 6",
    shortName: "SF6",
    description:
      "Street Fighter 6 is Capcom's latest entry in the legendary Street Fighter franchise. Featuring the innovative Drive System, gorgeous RE Engine graphics, and both Classic and Modern control types, SF6 is designed to welcome newcomers while satisfying veterans. It's widely regarded as one of the best fighting games of all time.",
    releaseYear: 2023,
    developer: "Capcom",
    color: "#dc2626",
    accentColor: "#fbbf24",
    characters: [
      {
        id: "ryu",
        name: "Ryu",
        title: "Street Fighter's Signature Martial Artist",
        description:
          "Ryu is the iconic world warrior and face of fighting games. A disciplined martial artist seeking the true meaning of the fight, Ryu is the quintessential shoto character with a fireball, uppercut, and hurricane kick. Perfect for learning fighting game fundamentals.",
        archetype: "All-Rounder / Shoto",
        difficulty: "Easy",
        color: "#ffffff",
        moves: [
          { name: "Hadouken", input: "236P", damage: "60", startup: "13f", type: "Special", description: "Ryu's iconic fireball. A key zoning tool and combo ender." },
          { name: "Shoryuken", input: "623P", damage: "100-140", startup: "6f", type: "Special", description: "The legendary uppercut. Invincible reversal that defines Ryu." },
          { name: "Tatsumaki Senpukyaku", input: "214K", damage: "80-120", startup: "14f", type: "Special", description: "Ryu's spinning kick. Good for closing distance and combos." },
          { name: "Hashogeki", input: "236P (charged)", damage: "90", startup: "28f", type: "Special", description: "A charged energy blast unique to SF6 Ryu." },
          { name: "Denjin Charge", input: "22P", damage: "-", startup: "-", type: "Special", description: "Powers up Ryu's next special move for enhanced properties." },
          { name: "Shinku Hadouken", input: "236236P", damage: "300", startup: "11f", type: "Super Art 1", description: "Ryu's super fireball. Massive damage." },
        ],
        combos: [
          { name: "Basic Punish", difficulty: "Beginner", inputs: "5MP > 5MP > 236P", damage: "165", notes: "Simple two-hit confirm into Hadouken." },
          { name: "Drive Rush Combo", difficulty: "Intermediate", inputs: "5MP > 5HP > 66 > 5MP > 2HP > 623HP", damage: "280", notes: "Uses Drive Rush for extended combo." },
          { name: "Denjin Combo", difficulty: "Advanced", inputs: "5HP > 22P > 5HP > 623HP > 236236P", damage: "420", notes: "Denjin Charge combo into Super Art." },
        ],
      },
      {
        id: "ken",
        name: "Ken",
        title: "Blazing Champion",
        description:
          "Ken Masters is Ryu's eternal rival and best friend. While sharing the shoto archetype, Ken is more aggressive and flashy with his fire-infused kicks. In SF6, Ken has been reimagined as a fugitive on the run, sporting a new look and evolved moveset.",
        archetype: "Rushdown / Shoto",
        difficulty: "Medium",
        color: "#dc2626",
        moves: [
          { name: "Hadouken", input: "236P", damage: "60", startup: "13f", type: "Special", description: "Ken's fireball. Similar to Ryu's but with different frame data." },
          { name: "Shoryuken", input: "623P", damage: "110-150", startup: "6f", type: "Special", description: "Ken's flaming uppercut. Higher damage than Ryu's version." },
          { name: "Tatsumaki Senpukyaku", input: "214K", damage: "90-130", startup: "12f", type: "Special", description: "Ken's spinning kick. Hits multiple times." },
          { name: "Dragonlash Kick", input: "214K (air)", damage: "70", startup: "10f", type: "Special", description: "A diving kick that changes Ken's trajectory." },
          { name: "Jinrai Kick", input: "236K", damage: "60", startup: "16f", type: "Special", description: "A rekka-style kick series with multiple follow-ups." },
          { name: "Shippu Jinraikyaku", input: "236236K", damage: "320", startup: "10f", type: "Super Art 1", description: "Ken's devastating super kick combo." },
        ],
        combos: [
          { name: "Easy Confirm", difficulty: "Beginner", inputs: "5MP > 5HP > 623HP", damage: "180", notes: "Easy hit confirm into Shoryuken." },
          { name: "Jinrai Route", difficulty: "Intermediate", inputs: "5MP > 5HP > 236K > K > K", damage: "230", notes: "Jinrai Kick follow-up combo." },
          { name: "Max Damage", difficulty: "Advanced", inputs: "5HP > 66 > 5MP > 2HP > 236K > K > 623HP > 236236K", damage: "450", notes: "Full Drive Rush combo into super." },
        ],
      },
      {
        id: "luke",
        name: "Luke",
        title: "The New Face of SF",
        description:
          "Luke is a young MMA fighter and the new poster boy for Street Fighter. He has a fast, aggressive playstyle built around his Sand Blast projectile and Flash Knuckle punches. Luke is designed to be approachable while having depth for advanced players.",
        archetype: "Rushdown / All-Rounder",
        difficulty: "Easy",
        color: "#3b82f6",
        moves: [
          { name: "Sand Blast", input: "236P", damage: "60", startup: "14f", type: "Special", description: "Luke's projectile. Can be charged for more hits." },
          { name: "Flash Knuckle", input: "236P (held)", damage: "80-100", startup: "18f", type: "Special", description: "A charging punch. Can be held for different timings." },
          { name: "Rising Uppercut", input: "623P", damage: "100", startup: "7f", type: "Special", description: "Luke's invincible reversal uppercut." },
          { name: "Avenger", input: "214K", damage: "70", startup: "20f", type: "Special", description: "A forward-moving kick with follow-up options." },
          { name: "Vulcan Blast", input: "236236P", damage: "290", startup: "11f", type: "Super Art 1", description: "Luke's super art. Multi-hit projectile." },
        ],
        combos: [
          { name: "Quick Punish", difficulty: "Beginner", inputs: "5MP > 5MP > 236P", damage: "155", notes: "Simple jab confirm into Sand Blast." },
          { name: "Flash Knuckle Combo", difficulty: "Intermediate", inputs: "5MP > 5HP > 236P(hold) > 66 > 5MP > 623HP", damage: "270", notes: "Charged Flash Knuckle into Drive Rush." },
          { name: "Corner Pressure", difficulty: "Advanced", inputs: "5HP > 66 > 5MP > 2HP > 236P(hold) > 5HP > 623HP > 236236P", damage: "430", notes: "Maximum damage corner combo." },
        ],
      },
    ],
  },
  {
    id: "2xko",
    name: "2XKO",
    shortName: "2XKO",
    description:
      "2XKO (formerly Project L) is Riot Games' upcoming free-to-play 2v2 tag-team fighting game set in the League of Legends universe. Featuring champions from Runeterra, 2XKO emphasizes teamwork, assist mechanics, and accessible controls. With Riot's commitment to free-to-play, it aims to lower the barrier to entry for the fighting game genre.",
    releaseYear: 2025,
    developer: "Riot Games",
    color: "#8b5cf6",
    accentColor: "#06b6d4",
    characters: [
      {
        id: "jinx",
        name: "Jinx",
        title: "The Loose Cannon",
        description:
          "Jinx is a manic, trigger-happy criminal from Zaun. In 2XKO, she's a zoner character who excels at controlling space with her various weapons. Her Fishbones rocket launcher and Zap give her strong ranged options while Pow-Pow provides close-range pressure.",
        archetype: "Zoner",
        difficulty: "Medium",
        color: "#ec4899",
        moves: [
          { name: "Zap!", input: "236P", damage: "55", startup: "18f", type: "Special", description: "A long-range electric shot. Great for controlling space." },
          { name: "Switcheroo!", input: "22P", damage: "-", startup: "-", type: "Special", description: "Switches between Pow-Pow and Fishbones for different attack properties." },
          { name: "Flame Chompers!", input: "214K", damage: "40", startup: "25f", type: "Special", description: "Places traps that snare opponents who step on them." },
          { name: "Fishbones Rocket", input: "236H", damage: "90", startup: "22f", type: "Special", description: "Fires an explosive rocket for area damage." },
          { name: "Super Mega Death Rocket!", input: "236236P", damage: "350", startup: "15f", type: "Super", description: "Jinx fires a massive rocket across the screen." },
        ],
        combos: [
          { name: "Pow-Pow Pressure", difficulty: "Beginner", inputs: "5L > 5L > 5M > 236P", damage: "130", notes: "Basic light chain into Zap." },
          { name: "Weapon Swap Combo", difficulty: "Intermediate", inputs: "5M > 5H > 22P > 5M > 236H", damage: "210", notes: "Uses Switcheroo mid-combo for damage." },
          { name: "Rocket Barrage", difficulty: "Advanced", inputs: "5H > 236H > Tag > Assist > 5M > 5H > 236236P", damage: "380", notes: "Tag combo into Super." },
        ],
      },
      {
        id: "ekko",
        name: "Ekko",
        title: "The Boy Who Shattered Time",
        description:
          "Ekko is a genius inventor from Zaun who can manipulate time. In 2XKO, he's a tricky rushdown character who uses his time-manipulation abilities to create unique mix-up situations. His ability to rewind makes him incredibly slippery and hard to pin down.",
        archetype: "Rushdown / Trickster",
        difficulty: "Hard",
        color: "#06b6d4",
        moves: [
          { name: "Timewinder", input: "236P", damage: "50+40", startup: "16f", type: "Special", description: "Throws a device that returns to Ekko, hitting twice." },
          { name: "Phase Dive", input: "623K", damage: "60", startup: "10f", type: "Special", description: "A quick dash forward with invincibility frames." },
          { name: "Parallel Convergence", input: "214P", damage: "70", startup: "30f", type: "Special", description: "Places a time zone. Entering it stuns opponents." },
          { name: "Chronobreak", input: "22S", damage: "-", startup: "20f", type: "Special", description: "Rewinds Ekko to his previous position." },
          { name: "Temporal Shatter", input: "236236P", damage: "320", startup: "12f", type: "Super", description: "Ekko reverses time for a devastating attack." },
        ],
        combos: [
          { name: "Quick Hit", difficulty: "Beginner", inputs: "5L > 5M > 236P", damage: "120", notes: "Simple confirm into Timewinder." },
          { name: "Phase Dive Loop", difficulty: "Intermediate", inputs: "5M > 5H > 623K > 5M > 236P", damage: "195", notes: "Phase Dive link for extended combo." },
          { name: "Chronobreak Reset", difficulty: "Advanced", inputs: "5H > 623K > 5M > 22S > (behind) 5M > 5H > 236236P", damage: "370", notes: "Uses Chronobreak for a side-switch into super." },
        ],
      },
      {
        id: "yasuo",
        name: "Yasuo",
        title: "The Unforgiven",
        description:
          "Yasuo is a wandering swordsman seeking to clear his name. In 2XKO, he's a fast-paced character who uses his Wind Wall defensively and dashes through opponents for mix-ups. His Gathering Storm mechanic rewards aggressive play with powered-up specials.",
        archetype: "Rushdown / Footsies",
        difficulty: "Hard",
        color: "#0ea5e9",
        moves: [
          { name: "Steel Tempest", input: "236S", damage: "65", startup: "11f", type: "Special", description: "A quick sword thrust. Hitting 3 times unlocks a tornado." },
          { name: "Wind Wall", input: "214P", damage: "-", startup: "8f", type: "Special", description: "Creates a wall that blocks projectiles." },
          { name: "Sweeping Blade", input: "236K", damage: "50", startup: "12f", type: "Special", description: "Dashes through the opponent. Can only be used once per target." },
          { name: "Gathering Storm", input: "236S (3rd)", damage: "90", startup: "15f", type: "Special", description: "After 3 Steel Tempests, launches a tornado." },
          { name: "Last Breath", input: "236236S", damage: "340", startup: "10f", type: "Super", description: "Blinks to an airborne opponent for a devastating slash." },
        ],
        combos: [
          { name: "Steel Tempest BnB", difficulty: "Beginner", inputs: "5L > 5M > 236S", damage: "125", notes: "Quick chain into Steel Tempest. Builds tornado stacks." },
          { name: "Dash Through Mix", difficulty: "Intermediate", inputs: "5M > 236K > (cross-up) 5M > 5H > 236S", damage: "205", notes: "Uses Sweeping Blade for a side switch." },
          { name: "Tornado Super", difficulty: "Advanced", inputs: "5H > 236S(3rd) > Tag > Assist > j.H > 236236S", damage: "400", notes: "Tornado launch into aerial Last Breath." },
        ],
      },
    ],
  },
];

export function getGame(gameId: string): Game | undefined {
  return games.find((g) => g.id === gameId);
}

export function getCharacter(
  gameId: string,
  characterId: string
): { game: Game; character: Character } | undefined {
  const game = getGame(gameId);
  if (!game) return undefined;
  const character = game.characters.find((c) => c.id === characterId);
  if (!character) return undefined;
  return { game, character };
}
