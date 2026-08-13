import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-gutter min-h-screen">
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-border-subtle rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
          <h2 className="text-headline-md font-bold">Create account</h2>
        </div>

        <label className="text-label-md text-on-surface-variant block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-border-subtle rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="you@example.com"
        />

        <label className="text-label-md text-on-surface-variant block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-border-subtle rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="At least 8 characters"
        />
        <p className="text-label-sm text-on-surface-variant mb-4">Minimum 8 characters.</p>

        {error && <p className="text-error text-label-md mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-label-sm text-on-surface-variant text-center mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}