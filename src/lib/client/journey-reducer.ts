import { CheckIn, Insight, Journal } from "@/lib/types";

/**
 * Client-side journey state: who is signed in, what they have consented to,
 * and the data from their own journey. All rows shown here came from
 * Supabase under the signed-in user's own id — no shared session exists.
 *
 * The reducer is pure: the clock is injected so dates are testable.
 */

export type JourneyStatus =
  | "restoring" // auth state being read from Supabase
  | "signed-out"
  | "signed-in";

export type ConsentState = {
  aiProcessingAllowed: boolean;
  decidedAt: string | null;
};

export type JourneyState = {
  status: JourneyStatus;
  authError: string | null;
  userId: string | null;
  email: string | null;
  consent: ConsentState;
  checkIns: CheckIn[];
  journals: Journal[];
  latestInsight: Insight | null;
};

export type JourneyAction =
  | { type: "auth/restored"; user: { id: string; email: string | null } | null; error?: string }
  | { type: "profile/loaded"; consent: ConsentState }
  | { type: "consent/granted"; at: string }
  | { type: "consent/declined"; at: string }
  | { type: "session/signed-out" }
  | { type: "client-state/cleared" }
  | { type: "check-in/added"; checkIn: CheckIn }
  | { type: "check-ins/set"; checkIns: CheckIn[] }
  | { type: "journal/added"; journal: Journal }
  | { type: "insight/set"; insight: Insight };

export const initialJourneyState: JourneyState = {
  status: "restoring",
  authError: null,
  userId: null,
  email: null,
  consent: { aiProcessingAllowed: false, decidedAt: null },
  checkIns: [],
  journals: [],
  latestInsight: null,
};

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "auth/restored":
      if (action.error) {
        return { ...initialJourneyState, status: "signed-out", authError: action.error };
      }
      if (!action.user) {
        return { ...initialJourneyState, status: "signed-out" };
      }
      return {
        ...state,
        status: "signed-in",
        authError: null,
        userId: action.user.id,
        email: action.user.email,
      };
    case "profile/loaded":
      return { ...state, consent: action.consent };
    case "consent/granted":
      return { ...state, consent: { aiProcessingAllowed: true, decidedAt: action.at } };
    case "consent/declined":
      return { ...state, consent: { aiProcessingAllowed: false, decidedAt: action.at } };
    case "session/signed-out":
    case "client-state/cleared":
      return { ...initialJourneyState, status: "signed-out" };
    case "check-in/added":
      return { ...state, checkIns: [action.checkIn, ...state.checkIns] };
    case "check-ins/set":
      return { ...state, checkIns: action.checkIns };
    case "journal/added":
      return { ...state, journals: [action.journal, ...state.journals] };
    case "insight/set":
      return { ...state, latestInsight: action.insight };
    default:
      return state;
  }
}
