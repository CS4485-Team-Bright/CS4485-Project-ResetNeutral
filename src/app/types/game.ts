export interface Move {
  id: string;
  character_id: string;
  game_id: string;
  name: string;
  input: string;
  damage: string;
  startup: string;
  type: string;
  description: string;
  gif?: string;
}

export interface Combo {
  id: string;
  character_id: string;
  game_id: string;
  name: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  inputs: string;
  damage: string;
  notes: string;
}

export interface Character {
  id: string;
  game_id: string;
  name: string;
  title: string;
  description: string;
  archetype: string;
  difficulty: "Easy" | "Medium" | "Hard";
  color: string;
  image?: string;
  banner?: string;
  moves: Move[];
  combos: Combo[];
}

export interface Game {
  id: string;
  name: string;
  short_name: string;
  description: string;
  release_year: number;
  developer: string;
  characters: Character[];
  color: string;
  accent_color: string;
  logo?: string;
  banner?: string;
  input_window_ms: number;
  combo_link_window_ms: number;
}