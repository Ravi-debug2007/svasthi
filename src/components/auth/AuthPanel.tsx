"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

/**
 * Sign-up / login / logout UI. Real Supabase Auth — there is no anonymous or
 * shared session anymore. Kept deliberately simple: email + password.
 */
export function AuthPanel() {
  const { state, signIn, signUp, signOut } = useJourney();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (state.status === "signed-in") {
    return (
      <section className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-ink-muted">
          Signed in as <strong>{state.email}</strong>
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Your entries are stored privately under this account and only this account can read them.
        </p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            signOut().catch(() => setError("Could not sign out. Try again."));
          }}
          className="mt-4 min-h-[44px] rounded-full border border-stone-300 px-5 text-sm font-semibold text-ink transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Log out
        </button>
        {error && <p className="mt-3 text-sm text-support">{error}</p>}
      </section>
    );
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    if (mode === "signup" && password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    const action = mode === "login" ? signIn(email.trim(), password) : signUp(email.trim(), password);
    action
      .then(() => {
        if (mode === "signup") {
          setNotice(
            "Account created. If email confirmation is required, check your inbox — otherwise you are now signed in.",
          );
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not sign you in.");
      })
      .finally(() => setBusy(false));
  }

  return (
    <section className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">
        {mode === "login" ? "Welcome back" : "Create your private space"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">
        Your check-ins and reflections are stored under your own account. Nothing is shared — not
        with other users, not with a common session.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-ink">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
        </label>
        <label className="block text-sm font-semibold text-ink">
          Password
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          />
        </label>
        {mode === "signup" && (
          <label className="block text-sm font-semibold text-ink">
            Confirm password
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            />
          </label>
        )}

        {error && <p className="text-sm text-support">{error}</p>}
        {notice && <p className="text-sm text-ink-muted">{notice}</p>}

        <PrimaryButton type="submit" disabled={busy}>
          {busy ? "One moment…" : mode === "login" ? "Log in" : "Create account"}
        </PrimaryButton>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setNotice(null);
        }}
        className="mt-4 min-h-[44px] text-sm font-semibold text-ink-muted underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </section>
  );
}

/** Renders children only when a user is signed in; shows AuthPanel otherwise. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useJourney();

  if (state.status === "restoring") {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-6 text-sm text-ink-muted shadow-sm">
        Preparing your space…
      </section>
    );
  }

  if (state.status !== "signed-in") {
    return (
      <div className="space-y-4">
        <AuthPanel />
        {state.authError && <p className="text-sm text-support">{state.authError}</p>}
      </div>
    );
  }

  return <>{children}</>;
}
