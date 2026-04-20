import { useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function AuthPage() {
  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/profile" />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        await signUp(email, password, username || email.split("@")[0]);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message ?? "Authentication failed");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111d33] border border-blue-500/20 rounded-xl p-6">
        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${mode === "login" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`px-3 py-1 rounded ${mode === "signup" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"}`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded bg-slate-800 text-white px-3 py-2"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full rounded bg-slate-800 text-white px-3 py-2"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full rounded bg-slate-800 text-white px-3 py-2"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2">
            {mode === "signup" ? "Create Account" : "Login"}
          </button>
        </form>

        <button
          onClick={() => signInWithGoogle()}
          className="w-full mt-3 bg-slate-700 hover:bg-slate-600 text-white rounded py-2"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}