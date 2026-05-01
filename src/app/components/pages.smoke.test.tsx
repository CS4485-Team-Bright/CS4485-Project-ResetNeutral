import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { act } from "react-dom/test-utils";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router";

import { HomePage } from "./HomePage";
import { GamesListPage } from "./GamesListPage";
import { CharacterPage } from "./CharacterPage";

vi.mock("../hooks/useGameData", () => ({
  useGames: vi.fn(),
  useCharacter: vi.fn(),
}));

vi.mock("./InputDisplay", () => ({
  InputDisplay: () => <div>Mock Input Display</div>,
}));

vi.mock("./PracticeArena", () => ({
  PracticeArena: () => <div>Mock Practice Arena</div>,
}));

import { useGames, useCharacter } from "../hooks/useGameData";

type RenderResult = {
  container: HTMLDivElement;
  root: Root;
};

const mounted: RenderResult[] = [];

function renderWithRouter(node: ReactNode, initialEntry = "/"): RenderResult {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>);
  });

  const result = { container, root };
  mounted.push(result);
  return result;
}

afterEach(() => {
  vi.clearAllMocks();
  while (mounted.length) {
    const { root, container } = mounted.pop()!;
    act(() => {
      root.unmount();
    });
    container.remove();
  }
});

describe("page smoke tests", () => {
  it("renders HomePage key heading and primary CTA", () => {
    vi.mocked(useGames).mockReturnValue({
      games: [],
      loading: false,
      error: null,
    });

    const { container } = renderWithRouter(<HomePage />);
    expect(container.textContent).toContain("Reset Neutral");
    expect(container.textContent).toContain("Browse Games");
  });

  it("renders GamesListPage loading state", () => {
    vi.mocked(useGames).mockReturnValue({
      games: [],
      loading: true,
      error: null,
    });

    const { container } = renderWithRouter(<GamesListPage />);
    expect(container.textContent).toContain("Loading Gateway...");
  });

  it("renders GamesListPage game cards when games load", () => {
    vi.mocked(useGames).mockReturnValue({
      games: [
        {
          id: "street-fighter-6",
          name: "Street Fighter 6",
          short_name: "SF6",
          description: "Classic 2D fighter.",
          release_year: 2023,
          developer: "Capcom",
          characters: [],
          color: "#fff",
          accent_color: "#000",
          input_window_ms: 250,
          combo_link_window_ms: 150,
        },
      ],
      loading: false,
      error: null,
    });

    const { container } = renderWithRouter(<GamesListPage />);
    expect(container.textContent).toContain("Select a Game");
    expect(container.textContent).toContain("Street Fighter 6");
  });

  it("renders CharacterPage loading state", () => {
    vi.mocked(useCharacter).mockReturnValue({
      game: null,
      character: null,
      loading: true,
      error: null,
    });

    const { container } = renderWithRouter(
      <Routes>
        <Route path="/game/:gameId/character/:characterId" element={<CharacterPage />} />
      </Routes>,
      "/game/street-fighter-6/character/ryu",
    );

    expect(container.textContent).toContain("Loading character...");
  });

  it("renders CharacterPage and includes Practice Arena content for valid route", () => {
    vi.mocked(useCharacter).mockReturnValue({
      game: {
        id: "street-fighter-6",
        name: "Street Fighter 6",
        short_name: "SF6",
        description: "",
        release_year: 2023,
        developer: "Capcom",
        characters: [],
        color: "#fff",
        accent_color: "#000",
        input_window_ms: 250,
        combo_link_window_ms: 150,
      },
      character: {
        id: "ryu",
        game_id: "street-fighter-6",
        name: "Ryu",
        title: "Wandering Warrior",
        description: "Balanced shoto character.",
        archetype: "Shoto",
        difficulty: "Easy",
        color: "#2e6bff",
        moves: [],
        combos: [],
      },
      loading: false,
      error: null,
    });

    const { container } = renderWithRouter(
      <Routes>
        <Route path="/game/:gameId/character/:characterId" element={<CharacterPage />} />
      </Routes>,
      "/game/street-fighter-6/character/ryu",
    );

    expect(container.textContent).toContain("Ryu");
    expect(container.textContent).toContain("Mock Practice Arena");
  });

  it("redirects CharacterPage to /games when character data fails", () => {
    vi.mocked(useCharacter).mockReturnValue({
      game: null,
      character: null,
      loading: false,
      error: "not found",
    });

    const { container } = renderWithRouter(
      <Routes>
        <Route path="/games" element={<div>Games Landing</div>} />
        <Route path="/game/:gameId/character/:characterId" element={<CharacterPage />} />
      </Routes>,
      "/game/street-fighter-6/character/ryu",
    );

    expect(container.textContent).toContain("Games Landing");
  });
});
