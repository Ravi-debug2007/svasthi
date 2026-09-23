import { describe, expect, it } from "vitest";
import { crisisPatterns, hasCrisisSignal } from "@/lib/safety/crisis";

/**
 * Detector tests (F08 finish, build-plan.md ticket 8). The policy is recall
 * over precision: direct, indirect, negated, quoted, third-person, and
 * Hinglish distress phrasing all trigger; the documented cost is false
 * positives on news/fiction/lyrics, which the tests pin as accepted.
 */

describe("hasCrisisSignal — triggers (recall-biased by design)", () => {
  it("catches direct explicit statements", () => {
    const direct = [
      "I want to kill myself",
      "I'm going to end my life",
      "sometimes I think about suicide",
      "I feel suicidal today",
      "I want to die",
      "I wish I was dead",
      "I've been hurting myself again",
      "I keep cutting myself",
      "I want to hang myself",
      "I took an overdose last night",
      "there's no reason to live",
      "I can't go on like this",
      "I cannot go on",
      "my family would be better off without me",
      "I don't want to live anymore",
      "this is goodbye forever",
      "I have plans of ending it",
    ];
    for (const text of direct) expect(hasCrisisSignal(text), text).toBe(true);
  });

  it("catches indirect and veiled phrasing", () => {
    const indirect = [
      "honestly what's the point of living",
      "I'm just so tired of being alive",
      "maybe everyone would be better off if I wasn't around anymore",
      "I keep thinking about disappearing forever",
      "sometimes I have thoughts of ending it",
    ];
    for (const text of indirect) expect(hasCrisisSignal(text), text).toBe(true);
  });

  it("catches common Hinglish distress phrases", () => {
    const hinglish = [
      "jeene ka koi man nahi",
      "marna chahta hun",
      "marna chahti hoon",
      "khudkhushi ke bare mein soch raha hun",
      "jaan dena chahta hun",
      "zinda rehne ka koi dil nahi karta",
    ];
    for (const text of hinglish) expect(hasCrisisSignal(text), text).toBe(true);
  });

  it("still triggers on negated and hypothetical phrasing (documented trade-off)", () => {
    // Negation is NOT special-cased: over-triggering shows a calm panel to an
    // honest user; under-triggering hides support from an ambiguous one.
    const negated = [
      "I would never kill myself",
      "I'm not going to hurt myself",
      "I don't want to die",
      "I refuse to end my life",
    ];
    for (const text of negated) expect(hasCrisisSignal(text), text).toBe(true);
  });

  it("still triggers on quoted, fictional, and third-person mentions", () => {
    const thirdPerson = [
      'She said "I want to die" in her letter',
      "My friend talks about suicide",
      "The character ends his life in the last chapter",
      "he keeps asking what's the point of living",
    ];
    for (const text of thirdPerson) expect(hasCrisisSignal(text), text).toBe(true);
  });

  it("matches are case-insensitive and word-bounded", () => {
    expect(hasCrisisSignal("I WANT TO DIE")).toBe(true);
    expect(hasCrisisSignal("Suicide prevention helpline info")).toBe(true); // recall over precision
    expect(hasCrisisSignal("The microbiology report class studied bacteria")).toBe(false);
  });
});

describe("hasCrisisSignal — non-crisis text stays clean (precision floor)", () => {
  it("does not trigger on ordinary reflective journal text", () => {
    const ordinary = [
      "Today was heavy, but I got through it.",
      "I feel overwhelmed with deadlines and didn't sleep well.",
      "I had a fight with my friend and I can't stop replaying it.",
      "Feeling low and anxious about the exam tomorrow.",
      "I'm exhausted and everything hurts, hopefully tomorrow is better.",
      "work is killing my motivation lately",
      "this movie is so bad it's killing me",
      "I miss her so much it hurts",
      "Just a typed reflection before bed.",
      "I feel like staying in bed all day",
      "I hate mondays",
      "my back is killing me after the workout",
    ];
    for (const text of ordinary) expect(hasCrisisSignal(text), text).toBe(false);
  });

  it("does not trigger on empty or whitespace input", () => {
    expect(hasCrisisSignal("")).toBe(false);
    expect(hasCrisisSignal("   \n\t ")).toBe(false);
  });
});

describe("detector surface", () => {
  it("exports a non-empty pattern list for review", () => {
    // The gate review (definition-of-done.md) inspects this list directly.
    expect(crisisPatterns.length).toBeGreaterThanOrEqual(15);
  });

  it("every pattern is case-insensitive and safely stateless", () => {
    for (const pattern of crisisPatterns) {
      expect(pattern.flags).toContain("i");
      expect(pattern.global).toBe(false); // no lastIndex state carried between calls
    }
  });
});
