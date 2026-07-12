import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { AppButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { resetPassword, signIn } from "../services/auth";

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-red-400 focus:ring-2 focus:ring-red-500/20";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  };

  const handleResetPassword = async () => {
    setError("");

    if (!email) {
      setError("Enter your email address to reset your password.");
      return;
    }

    try {
      await resetPassword(email);
      setError("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 py-10">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-950/40">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your safety dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className={inputClass}
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className={inputClass}
          />
          {error ? (
            <p className={`text-sm ${error.includes("sent") ? "text-emerald-300" : "text-red-300"}`}>
              {error}
            </p>
          ) : null}
          <AppButton type="submit" className="w-full">
            Login
          </AppButton>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <button
            type="button"
            className="font-semibold text-red-300 hover:text-red-200"
            onClick={handleResetPassword}
          >
            Forgot password?
          </button>
          <Link className="font-semibold text-red-300 hover:text-red-200" to="/register">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
