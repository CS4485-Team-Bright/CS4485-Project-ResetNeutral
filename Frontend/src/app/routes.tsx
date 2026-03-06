import { createBrowserRouter } from "react-router";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./components/HomePage";
import { GamesListPage } from "./components/GamesListPage";
import { GamePage } from "./components/GamePage";
import { CharacterPage } from "./components/CharacterPage";
import { Outlet } from "react-router";

function Layout() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white mb-2">Page Not Found</h1>
        <p className="text-slate-400">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "games", Component: GamesListPage },
      { path: "game/:gameId", Component: GamePage },
      { path: "game/:gameId/character/:characterId", Component: CharacterPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
