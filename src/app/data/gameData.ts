export interface Move {
  name: string;
  input: string;
  damage: string;
  startup: string;
  type: string;
  description: string;
  gif?: string;
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
  image?: string;
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

import { guiltyGearStrive } from "./games/guiltyGearStrive";
import { streetFighter6 } from "./games/streetFighter6";
import { twoXKO } from "./games/2xko";

export const games: Game[] = [guiltyGearStrive, streetFighter6, twoXKO];

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
