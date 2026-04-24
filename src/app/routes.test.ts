import { describe, expect, it, vi } from "vitest";

vi.mock("./api/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
    },
    from: () => ({
      upsert: async () => ({ error: null }),
    }),
  },
}));

import { router } from "./routes";

describe("app routes", () => {
  it("includes the expected top-level and nested page routes", () => {
    const rootRoute = router.routes.find((route) => route.path === "/");
    expect(rootRoute).toBeDefined();

    const childPaths = (rootRoute?.children ?? [])
      .map((child) => child.path ?? "(index)")
      .sort();

    expect(childPaths).toEqual(
      [
        "(index)",
        "*",
        "auth",
        "game/:gameId",
        "game/:gameId/character/:characterId",
        "games",
        "profile",
      ].sort(),
    );
  });

  it("routes Practice Arena through the character page URL", () => {
    const rootRoute = router.routes.find((route) => route.path === "/");
    const hasCharacterRoute = (rootRoute?.children ?? []).some(
      (child) => child.path === "game/:gameId/character/:characterId",
    );

    expect(hasCharacterRoute).toBe(true);
    expect((rootRoute?.children ?? []).some((child) => child.path === "practice-arena")).toBe(false);
  });
});
