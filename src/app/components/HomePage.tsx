import { Link } from "react-router";
import { games } from "../data/gameData";
import { Swords, BookOpen, Gamepad2, Users, Target, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const heroImg =
  "https://images.unsplash.com/photo-1759171053096-e7dbe7c36eb6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaWdodGluZyUyMGdhbWUlMjBhcmNhZGUlMjBuZW9ufGVufDF8fHx8MTc3Mjc0NTcxNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const actionImg =
  "https://images.unsplash.com/photo-1767971162450-9477017b2cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJ0aWFsJTIwYXJ0cyUyMGZpZ2h0ZXIlMjBhY3Rpb258ZW58MXx8fHwxNzcyNzQ2NDYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const controllerImg =
  "https://images.unsplash.com/photo-1625675742564-07701bfbd753?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmNhZGUlMjBqb3lzdGljayUyMGNvbnRyb2xsZXJ8ZW58MXx8fHwxNzcyNzQ2NDYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

const GAME_COLORS: Record<string, string> = {
  "guilty-gear-strive": "from-red-500/20 to-yellow-500/20",
  "street-fighter-6": "from-red-600/20 to-blue-500/20",
  "2xko": "from-purple-500/20 to-cyan-500/20",
};

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className="text-4xl md:text-6xl text-white mb-4"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              Reset Neutral
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8">
              The perfect place to reach the skillfloor. Learn fighting games,
              practice combos, and master your favorite characters — all for
              free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/games"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Gamepad2 size={20} />
                Browse Games
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <BookOpen size={20} />
                Learn More
              </a>
            </div>
          </div>
        </div>
        {/* Gradient hero image */}
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-72">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-blue-400/40 to-purple-400/40" />
            <ImageWithFallback
              src={heroImg}
              alt="Fighting games"
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            />
          </div>
        </div>
      </section>

      {/* Supported Games */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-white mb-8">Supported Games:</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className={`group relative bg-gradient-to-br ${GAME_COLORS[game.id]} border border-blue-500/20 rounded-xl px-6 py-4 hover:border-blue-400/40 transition-all hover:scale-105`}
              >
                <span className="text-white text-lg">{game.shortName}</span>
                <p className="text-slate-400 text-sm">{game.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Character Overviews Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <h2 className="text-white mb-4">Character Overviews</h2>
              <p className="text-slate-400 mb-6">
                View move lists, frame data, and BnB combos to learn new
                characters or improve your skills. Every character across all
                supported games is documented with detailed move properties and
                practical combos for every skill level.
              </p>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors"
              >
                <Swords size={18} />
                View Characters
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden">
              <ImageWithFallback
                src={actionImg}
                alt="Character overviews"
                className="w-full h-64 md:h-80 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Training Ground Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-400/20 to-transparent" />
                <ImageWithFallback
                  src={controllerImg}
                  alt="Training Ground"
                  className="w-full h-full object-cover rounded-2xl opacity-60"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-white mb-4">Training Ground</h2>
              <p className="text-slate-400 mb-6">
                Practice combos in a browser simulation of our supported games.
                Try out character inputs, learn motion commands, and see if a
                game or character clicks with you — before buying anything.
              </p>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors"
              >
                <Target size={18} />
                Start Practicing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Comprehensive Move Lists",
                description:
                  "Every character's full move set documented with inputs, frame data, damage values, and descriptions.",
              },
              {
                icon: Target,
                title: "Interactive Practice",
                description:
                  "A browser-based training mode where you can practice motion inputs and combos using your keyboard.",
              },
              {
                icon: Zap,
                title: "Combo Guides",
                description:
                  "Curated BnB combos for every character, organized by difficulty from beginner to advanced.",
              },
              {
                icon: Users,
                title: "Beginner Friendly",
                description:
                  "Designed for newcomers to fighting games. Clear explanations, no jargon overload, and step-by-step learning.",
              },
              {
                icon: Gamepad2,
                title: "Multi-Game Support",
                description:
                  "Coverage for Guilty Gear Strive, Street Fighter 6, and 2XKO — the most popular modern fighters.",
              },
              {
                icon: Swords,
                title: "Try Before You Buy",
                description:
                  "Explore characters and practice their inputs to see if a game is right for you before spending a dime.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-[#111d33] border border-blue-500/15 rounded-xl p-6"
              >
                <feature.icon
                  size={24}
                  className="text-blue-400 mb-3"
                />
                <h4 className="text-white mb-2">{feature.title}</h4>
                <p className="text-slate-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/15 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <span
              className="text-xl text-white"
              style={{ fontFamily: "'UnifrakturMaguntia', cursive" }}
            >
              Reset Neutral
            </span>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link to="/games" className="hover:text-white transition-colors">
                Games
              </Link>
              <span className="cursor-default">
                All game content belongs to respective publishers.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
