"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut as apiSignOut } from "@/lib/client/api";
import {
  initialJourneyState,
  journeyReducer,
  JourneyState,
} from "@/lib/client/journey-reducer";

/**
 * JourneyProvider — single source of truth for auth status, consent, and the
 * signed-in user's own journey data. No shared session exists: data is only
 * loaded for an authenticated user (F01 acceptance criteria).
 */

type JourneyContextValue = {
  state: JourneyState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  grantConsent: () => void;
  declineConsent: () => void;
  addCheckIn: (checkIn: JourneyState["checkIns"][number]) => void;
  addJournal: (journal: JourneyState["journals"][number]) => void;
  setInsight: (insight: NonNullable<JourneyState["latestInsight"]>) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function useJourney(): JourneyContextValue {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useJourney must be used inside JourneyProvider");
  return context;
}

const CONSENT_STORAGE_KEY = "svasthi-consent-v1";

type StoredConsent = { aiProcessingAllowed: boolean; decidedAt: string | null; userId: string };

function readStoredConsent(userId: string): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    // A consent decision belongs to one account only.
    if (parsed.userId !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialJourneyState);

  // Restore the session once on mount, then load this user's own data.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let cancelled = false;

    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          dispatch({ type: "auth/restored", user: null, error: error.message });
          return;
        }
        if (!data.user) {
          dispatch({ type: "auth/restored", user: null });
          return;
        }
        dispatch({
          type: "auth/restored",
          user: { id: data.user.id, email: data.user.email ?? null },
        });
        const consent = readStoredConsent(data.user.id);
        dispatch({
          type: "profile/loaded",
          consent: {
            aiProcessingAllowed: consent?.aiProcessingAllowed ?? false,
            decidedAt: consent?.decidedAt ?? null,
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        dispatch({
          type: "auth/restored",
          user: null,
          error: error instanceof Error ? error.message : "Could not reach the auth service.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error("Sign-in did not return a user.");
    dispatch({ type: "auth/restored", user: { id: data.user.id, email: data.user.email ?? null } });
    const consent = readStoredConsent(data.user.id);
    dispatch({
      type: "profile/loaded",
      consent: {
        aiProcessingAllowed: consent?.aiProcessingAllowed ?? false,
        decidedAt: consent?.decidedAt ?? null,
      },
    });
  };

  const signUp = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // If email confirmation is on, data.user exists but there is no session.
    if (data.session && data.user) {
      dispatch({ type: "auth/restored", user: { id: data.user.id, email: data.user.email ?? null } });
    }
  };

  const signOut = async () => {
    await apiSignOut();
    // Clears visible client-side data as part of sign-out (F01 criterion).
    dispatch({ type: "session/signed-out" });
  };

  const grantConsent = () => {
    const at = new Date().toISOString();
    dispatch({ type: "consent/granted", at });
    if (state.userId) {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ aiProcessingAllowed: true, decidedAt: at, userId: state.userId }),
      );
    }
  };

  const declineConsent = () => {
    const at = new Date().toISOString();
    dispatch({ type: "consent/declined", at });
    if (state.userId) {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ aiProcessingAllowed: false, decidedAt: at, userId: state.userId }),
      );
    }
  };

  const value: JourneyContextValue = {
    state,
    signIn,
    signUp,
    signOut,
    grantConsent,
    declineConsent,
    addCheckIn: (checkIn) => dispatch({ type: "check-in/added", checkIn }),
    addJournal: (journal) => dispatch({ type: "journal/added", journal }),
    setInsight: (insight) => dispatch({ type: "insight/set", insight }),
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}
