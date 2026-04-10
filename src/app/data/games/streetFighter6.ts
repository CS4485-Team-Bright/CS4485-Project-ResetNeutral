import type { Game } from "../gameData";

export const streetFighter6: Game = {
  id: "street-fighter-6",
  name: "Street Fighter 6",
  shortName: "SF6",
  description:
    "Street Fighter 6 is Capcom's latest entry in the legendary Street Fighter franchise. Featuring the innovative Drive System, gorgeous RE Engine graphics, and both Classic and Modern control types, SF6 is designed to welcome newcomers while satisfying veterans. It's widely regarded as one of the best fighting games of all time.",
  releaseYear: 2023,
  developer: "Capcom",
  color: "#dc2626",
  accentColor: "#fbbf24",
  logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuYhkxb_GGw-AJJSCndYBa641qNsAAC8DZfA&s",
  banner:"https://lh3.googleusercontent.com/proxy/i2jIwZW-6J-5t0ehFF7v1yp42zeb0airr5rneE_IRrGEouY5_JrM97LD36VskJ98RZxANtC1Csf39bRch8FiD0kOAjYbynGb5BaXauiqlMCka95Sdjw2voO9vInd_E_8n8Xl86Sg4IMCbzfE7CNNzvd4NUvH1HPeRiQZkGkuWwrh9M6utg",
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
      image: "https://external-preview.redd.it/til-street-fighters-ryu-is-based-on-a-real-life-karate-v0-tKEd3TfaVhTy3avC_vhoV14aPO0NbEtmrL62lwoFQsE.jpg?width=640&crop=smart&auto=webp&s=c47761738e2e2a4d66f9a62611c4f5b9bdc04a08",
      moves: [
        { name: "Hadouken", input: "236P", damage: "60", startup: "13f", type: "Special", description: "Ryu's iconic fireball. A key zoning tool and combo ender.", gif: "https://media.tenor.com/hQA6jk2FxwQAAAAM/ryu-hadouken.gif" },
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
};
