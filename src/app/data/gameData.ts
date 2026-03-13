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
      {
        id: "darius",
        name: "Darius",
        title: "The Hand of Noxus",
        description:
          "Darius is a brutal Noxian commander who excels at close-range combat. In 2XKO, he is a juggernaut-style character with powerful, simple tools that reward good spacing and decisive reads.",
        archetype: "Juggernaut / Brawler",
        difficulty: "Easy",
        color: "#b91c1c",
        moves: [
          {
            name: "Decimate",
            input: "214S",
            damage: "80",
            startup: "18f",
            type: "Special",
            description:
              "A wide axe swing that hits around Darius. Great for catching rolls and contesting space."
          },
          {
            name: "Crippling Strike",
            input: "6H",
            damage: "90",
            startup: "20f",
            type: "Special",
            description:
              "A heavy overhead chop that slows the opponent on hit."
          },
          {
            name: "Apprehend",
            input: "236P",
            damage: "40",
            startup: "22f",
            type: "Special",
            description:
              "Darius pulls the opponent towards him, setting up close-range pressure."
          },
          {
            name: "Noxian Guillotine",
            input: "236236P",
            damage: "320",
            startup: "10f",
            type: "Super",
            description:
              "A devastating dunk that deals more damage at low enemy health."
          }
        ],
        combos: [
          {
            name: "Basic Corner Chop",
            difficulty: "Beginner",
            inputs: "5L > 5M > 214S",
            damage: "150",
            notes: "Simple confirm into Decimate to secure a knockdown."
          },
          {
            name: "Pull and Punish",
            difficulty: "Intermediate",
            inputs: "236P > 5M > 6H",
            damage: "190",
            notes: "Use Apprehend to pull them in, then end with Crippling Strike."
          },
          {
            name: "Guillotine Finisher",
            difficulty: "Advanced",
            inputs: "5M > 5H > 214S > Tag > Assist > 5M > 236236P",
            damage: "380",
            notes: "Route into Noxian Guillotine when you have meter to close out a round."
          }
        ]
      },
      {
        id: "ahri",
        name: "Ahri",
        title: "The Nine-Tailed Fox",
        description:
          "Ahri is a charming Vastaya mage who manipulates emotions and orbs of magic. In 2XKO, she is a mobile, mid‑range mage/assassin hybrid with strong projectiles, deceptive movement, and powerful burst damage when she gets in.",
        archetype: "Mobile Zoner / Assassin",
        difficulty: "Medium",
        color: "#f97316",
        moves: [
          {
            name: "Orb of Deception",
            input: "236P",
            damage: "50+40",
            startup: "16f",
            type: "Special",
            description:
              "Ahri sends out and recalls her orb, dealing magic damage out and true damage on the way back."
          },
          {
            name: "Fox-Fire",
            input: "214P",
            damage: "3x30",
            startup: "14f",
            type: "Special",
            description:
              "Three flames circle Ahri and home in on nearby opponents. Great for pressure after knockdowns."
          },
          {
            name: "Charm",
            input: "236K",
            damage: "40",
            startup: "20f",
            type: "Special",
            description:
              "A heart-shaped projectile that briefly stuns and pulls the opponent toward Ahri on hit."
          },
          {
            name: "Spirit Rush",
            input: "236236P",
            damage: "260",
            startup: "9f",
            type: "Super",
            description:
              "Ahri dashes forward in a burst of energy, firing orbs in multiple directions for a high‑damage finisher."
          }
        ],
        combos: [
          {
            name: "Safe Poke String",
            difficulty: "Beginner",
            inputs: "5L > 5M > 236P",
            damage: "135",
            notes: "Basic confirm into Orb of Deception for chip and spacing."
          },
          {
            name: "Charm Confirm",
            difficulty: "Intermediate",
            inputs: "236K > 5M > 214P",
            damage: "185",
            notes: "Land Charm from mid‑range, then convert into Fox‑Fire for extra damage."
          },
          {
            name: "Spirit Rush Ender",
            difficulty: "Advanced",
            inputs: "5M > 5H > 236P > Tag > Assist > 5M > 236236P",
            damage: "375",
            notes: "Standard tag route into Spirit Rush to close out rounds when you have meter."
          }
        ]
      },
      {
        id: "illaoi",
        name: "Illaoi",
        title: "The Kraken Priestess",
        description:
          "Illaoi is a towering priestess of the Bearded Lady who tests the faith of her foes with crushing blows and spectral tentacles. In 2XKO, she is a slow but overwhelming brawler who controls space with tentacles and punishes anyone who dares to challenge her ground.",
        archetype: "Grappler / Space Control",
        difficulty: "Medium",
        color: "#16a34a",
        moves: [
          {
            name: "Tentacle Slam",
            input: "236P",
            damage: "90",
            startup: "20f",
            type: "Special",
            description:
              "Summons a tentacle in front of Illaoi to slam the ground. Strong mid‑range poke and combo ender."
          },
          {
            name: "Test of Spirit",
            input: "214P",
            damage: "70",
            startup: "24f",
            type: "Special",
            description:
              "Rips the opponent’s spirit a short distance away. On hit, follow‑up tentacle attacks deal extra damage."
          },
          {
            name: "Harsh Lesson",
            input: "623K",
            damage: "100",
            startup: "14f",
            type: "Special",
            description:
              "A leaping strike toward a nearby tentacle or the opponent. Great as a call‑out and combo extender."
          },
          {
            name: "Kraken’s Grasp",
            input: "632146P",
            damage: "340",
            startup: "10f",
            type: "Super",
            description:
              "Illaoi grabs the opponent and slams them repeatedly with spectral tentacles for massive damage."
          }
        ],
        combos: [
          {
            name: "Basic Tentacle Ender",
            difficulty: "Beginner",
            inputs: "5L > 5M > 236P",
            damage: "165",
            notes: "Simple confirm into Tentacle Slam for knockdown and oki."
          },
          {
            name: "Spirit Pull Conversion",
            difficulty: "Intermediate",
            inputs: "214P > 5M > 623K",
            damage: "210",
            notes: "Use Test of Spirit at mid‑range and convert with Harsh Lesson on hit."
          },
          {
            name: "Kraken Finish",
            difficulty: "Advanced",
            inputs: "5M > 5H > 236P > Tag > Assist > 5M > 632146P",
            damage: "390",
            notes: "Standard tag route into Kraken’s Grasp to close out rounds."
          }
        ]
      },
      {
        id: "braum",
        name: "Braum",
        title: "The Heart of the Freljord",
        description:
          "Braum is a warm‑hearted Freljordian hero who protects his allies with an indestructible shield. In 2XKO, he is a defensive support/tank who specializes in blocking for his partner, controlling the air, and turning defense into explosive counterattacks.",
        archetype: "Defensive Tank / Support",
        difficulty: "Easy",
        color: "#3b82f6",
        moves: [
          {
            name: "Winter’s Bite",
            input: "236P",
            damage: "60",
            startup: "17f",
            type: "Special",
            description:
              "Braum fires a freezing projectile that slows and applies a stack of stun. Great for checking approaches."
          },
          {
            name: "Stand Behind Me",
            input: "214K",
            damage: "-",
            startup: "12f",
            type: "Special",
            description:
              "Braum leaps to his partner or a position in front of them, raising his shield and improving their defense."
          },
          {
            name: "Unbreakable",
            input: "22P",
            damage: "-",
            startup: "5f",
            type: "Special",
            description:
              "Braum raises his shield to block incoming projectiles and lessen chip damage for both characters."
          },
          {
            name: "Vault Breaker",
            input: "623K",
            damage: "90",
            startup: "11f",
            type: "Special",
            description:
              "An upward shield bash that functions as an anti‑air and combo finisher."
          },
          {
            name: "Glacial Fissure",
            input: "236236P",
            damage: "300",
            startup: "10f",
            type: "Super",
            description:
              "Braum slams his shield into the ground, creating an icy shockwave that launches and controls a huge area."
          }
        ],
        combos: [
          {
            name: "Safe Shield String",
            difficulty: "Beginner",
            inputs: "5L > 5M > 236P",
            damage: "140",
            notes: "Simple confirm into Winter’s Bite for safety and space control."
          },
          {
            name: "Anti‑Air Conversion",
            difficulty: "Intermediate",
            inputs: "623K > 5M > 236P",
            damage: "195",
            notes: "Catch jumps with Vault Breaker and convert into Winter’s Bite."
          },
          {
            name: "Fissure Punish",
            difficulty: "Advanced",
            inputs: "5H > 236P > Tag > Assist > 5M > 236236P",
            damage: "380",
            notes: "Use a heavy starter into Glacial Fissure to close out rounds."
          }
        ]
      },
      {
        id: "blitzcrank",
        name: "Blitzcrank",
        title: "The Great Steam Golem",
        description:
          "Blitzcrank is a massive, steam‑powered golem who excels at isolating opponents. In 2XKO, he is a grappler/support hybrid with a terrifying hook, armored approaches, and big payoff once he closes the gap.",
        archetype: "Grappler / Support",
        difficulty: "Medium",
        color: "#facc15",
        moves: [
          {
            name: "Rocket Grab",
            input: "236P",
            damage: "70",
            startup: "20f",
            type: "Special",
            description:
              "Fires a mechanical hand forward and pulls the first opponent it connects with straight to Blitzcrank."
          },
          {
            name: "Power Fist",
            input: "6H",
            damage: "100",
            startup: "18f",
            type: "Special",
            description:
              "Empowers Blitzcrank’s next punch to pop the opponent into the air for big follow‑ups."
          },
          {
            name: "Overdrive",
            input: "214K",
            damage: "-",
            startup: "10f",
            type: "Special",
            description:
              "Blitzcrank revs up, gaining armor and increased movement speed for a short duration."
          },
          {
            name: "Static Field",
            input: "236236P",
            damage: "310",
            startup: "9f",
            type: "Super",
            description:
              "Unleashes a massive electrical blast around Blitzcrank, stunning nearby foes and dealing huge damage."
          }
        ],
        combos: [
          {
            name: "Hook into Fist",
            difficulty: "Beginner",
            inputs: "236P > 5M > 6H",
            damage: "185",
            notes: "Basic Rocket Grab confirm into Power Fist juggle."
          },
          {
            name: "Armored Approach",
            difficulty: "Intermediate",
            inputs: "214K > 5M > 236P > 6H",
            damage: "230",
            notes: "Use Overdrive armor to force your way in, then hook and launch."
          },
          {
            name: "Static Finish",
            difficulty: "Advanced",
            inputs: "236P > 5M > 6H > Tag > Assist > 5M > 236236P",
            damage: "395",
            notes: "Standard hook starter into Static Field to close out rounds."
          }
        ]
      },
      {
        id: "vi",
        name: "Vi",
        title: "The Piltover Enforcer",
        description:
          "Vi is a hot‑headed enforcer with giant hextech gauntlets. In 2XKO, she is a rushdown brawler who blows through defenses with armored dashes, crushing corner pressure, and explosive damage off a single hit.",
        archetype: "Rushdown / Brawler",
        difficulty: "Medium",
        color: "#ec4899",
        moves: [
          {
            name: "Vault Breaker",
            input: "236K (hold)",
            damage: "80–110",
            startup: "18f",
            type: "Special",
            description:
              "Vi charges forward with a powerful punch. Can be held to increase range and damage."
          },
          {
            name: "Denting Blows",
            input: "214P",
            damage: "3x30",
            startup: "12f",
            type: "Special",
            description:
              "A series of body blows that shreds guard and sets up frame advantage."
          },
          {
            name: "Excessive Force",
            input: "623P",
            damage: "90",
            startup: "11f",
            type: "Special",
            description:
              "An uppercut with a shockwave. Works as an anti‑air and combo extender near the corner."
          },
          {
            name: "Assault and Battery",
            input: "236236K",
            damage: "320",
            startup: "8f",
            type: "Super",
            description:
              "Vi locks on to the opponent and rushes them down with an unavoidable sequence of punches."
          }
        ],
        combos: [
          {
            name: "Simple Gauntlet String",
            difficulty: "Beginner",
            inputs: "5L > 5M > 214P",
            damage: "160",
            notes: "Easy confirm into Denting Blows for corner carry and pressure."
          },
          {
            name: "Charged Breaker Route",
            difficulty: "Intermediate",
            inputs: "5M > 5H > 236K(hold)",
            damage: "210",
            notes: "Use a charged Vault Breaker for extra damage and a strong knockdown."
          },
          {
            name: "Assault Finish",
            difficulty: "Advanced",
            inputs: "5M > 5H > 214P > Tag > Assist > 5M > 236236K",
            damage: "400",
            notes: "Spend meter on Assault and Battery to end high‑damage sequences."
          }
        ]
      },
      {
        id: "warwick",
        name: "Warwick",
        title: "The Uncaged Wrath of Zaun",
        description:
          "Warwick is a monstrous chimera who hunts by scent. In 2XKO, he is a rushdown/berserker character with strong mobility, life‑steal moves, and terrifying access to reversals when low on health.",
        archetype: "Rushdown / Berserker",
        difficulty: "Hard",
        color: "#10b981",
        moves: [
          {
            name: "Jaws of the Beast",
            input: "214K",
            damage: "80",
            startup: "14f",
            type: "Special",
            description:
              "A lunge bite that heals Warwick on hit and sideswitches when done close."
          },
          {
            name: "Blood Hunt",
            input: "22P",
            damage: "-",
            startup: "15f",
            type: "Special",
            description:
              "Warwick enters a hunting stance, gaining speed and tracking toward low‑health enemies."
          },
          {
            name: "Primal Howl",
            input: "236P",
            damage: "60",
            startup: "13f",
            type: "Special",
            description:
              "A burst of fear around Warwick that pushes the opponent away or sets up pressure on hit."
          },
          {
            name: "Infinite Duress",
            input: "236236K",
            damage: "330",
            startup: "9f",
            type: "Super",
            description:
              "Warwick pounces forward in a long‑range grab, mauling the opponent repeatedly and healing a large amount."
          }
        ],
        combos: [
          {
            name: "Bite Conversion",
            difficulty: "Beginner",
            inputs: "5L > 5M > 214K",
            damage: "170",
            notes: "Basic confirm into Jaws of the Beast for damage and healing."
          },
          {
            name: "Fear Loop",
            difficulty: "Intermediate",
            inputs: "5M > 236P > 5M > 214K",
            damage: "215",
            notes: "Use Primal Howl to extend pressure into another bite."
          },
          {
            name: "Duress Chaser",
            difficulty: "Advanced",
            inputs: "Blood Hunt active > 5M > 5H > 214K > Tag > Assist > 5M > 236236K",
            damage: "405",
            notes: "Leverage Blood Hunt speed to land a starter and route into Infinite Duress."
          }
        ]
      },
      {
        id: "teemo",
        name: "Teemo",
        title: "The Swift Scout",
        description:
          "Teemo is a yordle scout who specializes in guerrilla warfare and toxic traps. In 2XKO, he is a tricky hit‑and‑run zoner with strong movement, obnoxious projectiles, and lingering traps that force opponents to play his game.",
        archetype: "Tricky Zoner / Hit‑and‑Run",
        difficulty: "Medium",
        color: "#22c55e",
        moves: [
          {
            name: "Blinding Dart",
            input: "236P",
            damage: "60",
            startup: "16f",
            type: "Special",
            description:
              "Teemo fires a poisonous dart that briefly blinds and annoys opponents trying to swing back."
          },
          {
            name: "Move Quick",
            input: "214K",
            damage: "-",
            startup: "10f",
            type: "Special",
            description:
              "A mobility buff that increases Teemo’s walk speed and alters his jump arc for a short time."
          },
          {
            name: "Toxic Shot",
            input: "22P",
            damage: "40+20",
            startup: "12f",
            type: "Special",
            description:
              "Empowers Teemo’s next few attacks with extra poison damage over time."
          },
          {
            name: "Noxious Trap",
            input: "214P",
            damage: "70",
            startup: "24f",
            type: "Special",
            description:
              "Places an invisible mushroom on the ground that explodes when stepped on, poisoning and launching the opponent."
          },
          {
            name: "Guerrilla Ambush",
            input: "236236P",
            damage: "290",
            startup: "9f",
            type: "Super",
            description:
              "Teemo vanishes and reappears with a barrage of darts and traps, covering the screen in poison."
          }
        ],
        combos: [
          {
            name: "Basic Poison String",
            difficulty: "Beginner",
            inputs: "5L > 5M > 236P",
            damage: "140",
            notes: "Simple confirm into Blinding Dart for safe chip and poison."
          },
          {
            name: "Trap Conversion",
            difficulty: "Intermediate",
            inputs: "214P (trigger) > 5M > 22P > 5H",
            damage: "210",
            notes: "Use a triggered Noxious Trap to start a combo and layer Toxic Shot."
          },
          {
            name: "Ambush Ender",
            difficulty: "Advanced",
            inputs: "5M > 5H > 236P > Tag > Assist > 5M > 236236P",
            damage: "380",
            notes: "Standard Teemo route that ends in Guerrilla Ambush when you have meter."
          }
        ]
      },
      {
        id: "caitlyn",
        name: "Caitlyn",
        title: "The Sheriff of Piltover",
        description:
          "Caitlyn is a precise sniper who dominates long‑range combat. In 2XKO, she is a pure zoner with powerful rifle shots, traps that control the ground, and a devastating snipe super that punishes any mistake.",
        archetype: "Pure Zoner / Sniper",
        difficulty: "Medium",
        color: "#38bdf8",
        moves: [
          {
            name: "Piltover Peacemaker",
            input: "236P",
            damage: "70",
            startup: "18f",
            type: "Special",
            description:
              "A straight‑line rifle shot that pierces through opponents at longer ranges."
          },
          {
            name: "Yordle Snap Trap",
            input: "214P",
            damage: "50",
            startup: "22f",
            type: "Special",
            description:
              "Places a bear trap on the ground. On trigger, it roots the opponent and marks them for bonus damage."
          },
          {
            name: "90 Caliber Net",
            input: "214K",
            damage: "40",
            startup: "16f",
            type: "Special",
            description:
              "Fires a net that pushes Caitlyn backward and the opponent slightly forward, great for repositioning and escaping pressure."
          },
          {
            name: "Ace in the Hole",
            input: "236236P",
            damage: "320",
            startup: "12f",
            type: "Super",
            description:
              "Caitlyn lines up a full‑screen snipe on the marked opponent for massive, precise damage."
          }
        ],
        combos: [
          {
            name: "Safe Rifle Confirm",
            difficulty: "Beginner",
            inputs: "5L > 5M > 236P",
            damage: "150",
            notes: "Basic confirm into Piltover Peacemaker to keep opponents at arm’s length."
          },
          {
            name: "Trap Setup Route",
            difficulty: "Intermediate",
            inputs: "5M > 214P > (trap trigger) > 5H > 236P",
            damage: "215",
            notes: "Use Yordle Snap Trap mid‑string, then convert when it triggers for bonus damage."
          },
          {
            name: "Marked Snipe",
            difficulty: "Advanced",
            inputs: "214P (trigger) > 5M > 5H > Tag > Assist > 5M > 236236P",
            damage: "395",
            notes: "Spend meter on Ace in the Hole after a trap mark for maximum payoff."
          }
        ]
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
