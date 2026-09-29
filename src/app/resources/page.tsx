"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NavLinkAction } from "@/components/ui/NavLinkAction";
import { ResourceCard } from "@/components/resources/ResourceCard";
import {
  VERIFIED_RESOURCES,
  SAMPLE_RESOURCE,
  RESOURCE_CATEGORIES,
  ResourceCategory,
  filterResources,
} from "@/lib/resources";

/**
 * /resources (F10). Curated mental health directory & referral handoff:
 * - Statically verified Indian mental health organizations & helplines.
 * - Honest distinction between 24/7 crisis lines and ongoing/scheduled counseling.
 * - No fabricated clinician credentials, fake availability, or simulated bookings.
 * - Accessible category filters, keyword search, and optional sample card toggle.
 * - Calm, practical guidance for preparing to talk with a mental health professional.
 */
export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSample, setShowSample] = useState(false);

  const activeCategoryMeta = useMemo(() => {
    return (
      RESOURCE_CATEGORIES.find((cat) => cat.id === selectedCategory) ?? RESOURCE_CATEGORIES[0]
    );
  }, [selectedCategory]);

  const displayedResources = useMemo(() => {
    const list = showSample ? [...VERIFIED_RESOURCES, SAMPLE_RESOURCE] : VERIFIED_RESOURCES;
    return filterResources(list, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery, showSample]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        eyebrow="Directory"
        title="Verified Support & Referral Directory"
        description="A vetted directory of credible mental health organizations, tele-counseling services, student support, and specialized centers across India. Free, confidential, and verified by maintainers."
      >
        <NavLinkAction href="/support">Need urgent crisis help? →</NavLinkAction>
      </PageHeader>

      {/* Immediate Crisis Callout Banner */}
      <section
        aria-label="Urgent crisis guidance"
        className="rounded-3xl border border-rose-200 bg-support-soft p-5 text-sm leading-6 text-support sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-support">
              In acute emotional distress or need immediate help?
            </h2>
            <p className="mt-1 text-sm text-support/90">
              Tele-MANAS is free, confidential, and open 24/7 at{" "}
              <a href="tel:14416" className="font-semibold underline">
                14416
              </a>{" "}
              or{" "}
              <a href="tel:18008914416" className="font-semibold underline">
                1800-891-4416
              </a>
              . For physical safety or medical emergencies, call{" "}
              <a href="tel:112" className="font-semibold underline">
                112
              </a>
              .
            </p>
          </div>
          <Link
            href="/support"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-support bg-white px-5 font-semibold text-support transition-colors hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Emergency guide
          </Link>
        </div>
      </section>

      {/* Interactive Controls: Category Tabs & Search Bar */}
      <section
        aria-label="Resource filters"
        className="rounded-3xl border border-stone-200 bg-surface p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-4">
          {/* Category Filter Pills */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Filter by Category
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {RESOURCE_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={isActive}
                    className={`inline-flex min-h-[44px] items-center rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "border border-stone-300 bg-white text-ink hover:bg-stone-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-ink-muted">{activeCategoryMeta.description}</p>
          </div>

          {/* Search Input & Demo Toggle */}
          <div className="flex flex-col gap-3 border-t border-stone-200/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <label htmlFor="resource-search" className="sr-only">
                Search verified resources
              </label>
              <input
                id="resource-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, language, or organization…"
                className="w-full rounded-full border border-stone-300 bg-white px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              />
            </div>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-xs font-medium text-ink-muted">
              <input
                type="checkbox"
                checked={showSample}
                onChange={(e) => setShowSample(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-primary focus:ring-primary"
              />
              <span>Include sample demo fixture</span>
            </label>
          </div>
        </div>
      </section>

      {/* Resource Listings */}
      <section aria-label="Verified resource directory">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium text-ink-muted">
            Showing {displayedResources.length} verified{" "}
            {displayedResources.length === 1 ? "destination" : "destinations"}
          </p>
          {(selectedCategory !== "all" || searchQuery || showSample) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setShowSample(false);
              }}
              className="text-xs font-semibold text-primary underline hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              Reset all filters
            </button>
          )}
        </div>

        {displayedResources.length === 0 ? (
          <EmptyState
            title="No matching destinations found"
            description="Try changing your search terms or selecting a different category to see available support organizations."
            action={
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                View all destinations
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {displayedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* Practical Preparation Guide: Speaking with a Counselor */}
      <section
        aria-labelledby="prep-guide-heading"
        className="rounded-3xl border border-stone-200 bg-surface p-6 shadow-sm sm:p-8"
      >
        <h2 id="prep-guide-heading" className="text-xl font-semibold text-ink">
          Preparing to speak with a counselor
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Reaching out to a counselor or calling a helpline for the first time can feel daunting.
          Here are a few honest, grounded reminders:
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink">You don&apos;t need a speech ready</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              You can simply start with:{" "}
              <em className="font-medium text-ink">
                &ldquo;I&apos;ve been feeling overwhelmed lately and wanted to talk to someone.&rdquo;
              </em>{" "}
              Trained counselors know how to guide the conversation gently.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink">Bring your observations</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              If putting feelings into words is hard, your private Svasthi check-ins and journal
              notes can help you recall specific days, sleep patterns, or triggers that felt heavy.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink">Fit is your choice</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              Therapy is a human relationship. If a particular counselor or service doesn&apos;t feel
              safe, comfortable, or aligned with your values, you have every right to try a different
              helpline or request another counselor.
            </p>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-ink">Confidentiality is protected</h3>
            <p className="mt-1 text-xs leading-5 text-ink-muted">
              All accredited helplines and ethical clinical psychologists adhere to strict
              confidentiality standards, sharing information only in situations where immediate
              physical safety is at risk.
            </p>
          </div>
        </div>
      </section>

      {/* Onward Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center text-sm font-semibold text-ink-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          ← Return to Home
        </Link>
        <div className="flex flex-wrap gap-3">
          <NavLinkAction href="/exercises">Try a calming exercise</NavLinkAction>
          <NavLinkAction href="/support">Emergency support guide</NavLinkAction>
        </div>
      </div>
    </div>
  );
}
