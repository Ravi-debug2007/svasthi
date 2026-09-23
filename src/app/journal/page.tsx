"use client";

import { useEffect, useMemo, useState } from "react";
import { useJourney } from "@/components/providers/JourneyProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { VoiceRecorder } from "@/components/journal/VoiceRecorder";
import { VoiceSignals } from "@/components/journal/VoiceSignals";
import { CrisisPanel } from "@/components/safety/CrisisPanel";
import { TranscriptEditor } from "@/components/journal/TranscriptEditor";
import { api, ApiError } from "@/lib/client/api";
import { buildJournalPayload, validateJournalTranscript } from "@/lib/journal/domain";
import { MAX_RECORDING_SECONDS } from "@/lib/audio/features";
import { useRecorder, Recording } from "@/lib/audio/use-recorder";
import { Journal } from "@/lib/types";

/**
 * /journal (F03). One page, both doors in: a real one-minute voice recorder
 * and a typed reflection that always works. Consent to process is explicit
 * and per-entry — declining keeps the entry private-but-saved. The page owns
 * the recorder controller, so a recording can only be submitted after the
 * user pressed "Use this recording" for the *current* take (re-recording
 * invalidates the kept one), and every exit path tears the mic down.
 */

type SuccessfulPost = { journal: Journal; crisisSignal: boolean };

export default function JournalPage() {
  const { state, addJournal } = useJourney();
  const recorder = useRecorder();

  const [transcript, setTranscript] = useState("");
  // "Kept" is a deliberate review act (Use this recording). Starting a new
  // recording always un-keeps, so a stale take can never be submitted.
  const [keptCurrent, setKeptCurrent] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Journal | null>(null);
  const [crisisSignal, setCrisisSignal] = useState(false);

  useEffect(() => {
    if (recorder.status === "requesting" || recorder.status === "recording") {
      setKeptCurrent(false);
    }
  }, [recorder.status]);

  const keptRecording: Recording | null = keptCurrent ? recorder.recording : null;

  // Journals are loaded once per session by JourneyProvider; only the newest
  // few are shown here to keep the page focused.
  const recentJournals = useMemo(() => state.journals.slice(0, 5), [state.journals]);

  async function handleSubmit() {
    if (busy) return; // duplicate-submit guard
    setFormError(null);

    const transcriptIssue = validateJournalTranscript(transcript);
    if (transcriptIssue) {
      setTranscriptError(transcriptIssue);
      return;
    }
    setTranscriptError(null);
    setBusy(true);

    try {
      const result = await buildJournalPayload({ transcript, keptRecording });
      if (!result.ok) {
        setTranscriptError(result.errors.transcript ?? null);
        setFormError("Nothing was saved. Your words are still here — please review and retry.");
        return;
      }

      const body = await api<SuccessfulPost>("/api/journals", {
        method: "POST",
        body: JSON.stringify(result.value),
      });

      addJournal(body.journal);
      setSaved(body.journal);
      setCrisisSignal(body.crisisSignal);
      setKeptCurrent(false);
      setTranscript("");
      recorder.reset();
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? `${err.message} Your words are still here — try again.`
          : "Could not reach the server. Your words are still here — try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader
          eyebrow="Voice journal"
          title="Your reflection is saved."
          description="It is stored under your account — and only yours."
        />
        {crisisSignal && <CrisisPanel onClose={() => setCrisisSignal(false)} />}
        {saved.features && <VoiceSignals features={saved.features} />}
        <section
          role="status"
          aria-live="polite"
          className="rounded-3xl border border-sage-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <h2 className="text-xl font-semibold text-ink">Reflection saved</h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            You made a little space for yourself. You can write another one, or head back home.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryButton
              type="button"
              variant="secondary"
              onClick={() => {
                setSaved(null);
                setTranscript("");
              }}
            >
              Write another reflection
            </PrimaryButton>
            <NavLinkAction href="/">← Back home</NavLinkAction>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader
        eyebrow="Voice journal"
        title="Speak for a moment, or write instead."
        description="A recording can say what typing can't — and writing always works too, microphone or not. One minute at most; you review everything before it's saved."
      />

      <VoiceRecorder
        recorder={recorder}
        onKeep={() => setKeptCurrent(true)}
      />

      {keptRecording && (
        <p
          role="status"
          className="rounded-2xl border border-sage-200 bg-sage-50 p-4 text-sm leading-6 text-ink"
        >
          Recording kept — it will be measured on your device and saved with your words.{" "}
          <button
            type="button"
            onClick={() => setKeptCurrent(false)}
            className="font-semibold underline"
          >
            Discard it
          </button>{" "}
          if it isn&apos;t what you wanted to say.
        </p>
      )}

      <TranscriptEditor
        value={transcript}
        onChange={(value) => {
          setTranscript(value);
          setTranscriptError(null);
        }}
        disabled={busy}
        error={transcriptError}
      >
        {keptRecording && (
          <p className="mt-3 rounded-2xl bg-primary-soft p-3 text-xs leading-5 text-ink">
            You kept a recording — type here only if you want to add or correct the words.
          </p>
        )}
      </TranscriptEditor>

      {formError && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-support-soft p-4 text-sm leading-6 text-support"
        >
          {formError}
        </p>
      )}

      <section
        aria-label="Choose what happens next"
        className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
      >
        <h2 className="text-base font-semibold text-ink">Save your reflection</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          It is saved privately to your account, tied only to you. AI processing is currently{" "}
          <strong>{state.consent.aiProcessingAllowed ? "on" : "off"}</strong> for this app — that
          choice lives on the home page and applies to any future generated summary; nothing is
          sent anywhere else. Recording never starts without you clicking, and the audio itself
          never leaves your device.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <PrimaryButton
            type="button"
            onClick={() => void handleSubmit()}
            busy={busy}
            busyLabel="Saving your reflection…"
          >
            Save reflection
          </PrimaryButton>
        </div>
        <p className="mt-3 text-xs leading-5 text-ink-muted">
          Recording cap: {MAX_RECORDING_SECONDS} seconds. Only your reviewed words are stored —
          no audio is uploaded.
        </p>
      </section>

      <section aria-label="Your recent reflections" className="space-y-3">
        <h2 className="text-base font-semibold text-ink">Recent reflections</h2>
        {recentJournals.length === 0 ? (
          <EmptyState
            icon="🎙️"
            title="Nothing here yet"
            description="Your first reflection — spoken or typed — will appear here once you save it."
            action={<NavLinkAction href="/">← Back home</NavLinkAction>}
          />
        ) : (
          <ul className="space-y-3">
            {recentJournals.map((journal) => (
              <li
                key={journal.id}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">
                    {new Date(journal.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {journal.features ? (
                    <SourceBadge kind="measured" />
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-sage-300 bg-sage-50 px-2.5 py-0.5 text-xs font-semibold text-sage-800">
                      Typed
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink">{journal.transcript}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
