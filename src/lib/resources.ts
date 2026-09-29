/**
 * Curated, verified mental health resources & destinations (F10).
 *
 * Non-negotiable data-honesty rules (build-plan.md F10, code-standards.md):
 * - No fabricated clinician credentials, availability, or booking systems.
 * - Official, credible destinations verified before listing.
 * - Clear distinction between acute crisis intervention (24/7 emergency lines)
 *   and scheduled therapy / non-emergency psychosocial counseling.
 * - Sample demo cards are explicitly tagged with `isSample: true` and must be
 *   labeled with SourceBadge kind="sample" in the UI — never silently mixed.
 * - External-link semantics must be honored everywhere.
 */

export type ResourceCategory = "all" | "crisis" | "counseling" | "student" | "specialized";

export interface ResourceCategoryMeta {
  id: ResourceCategory;
  label: string;
  description: string;
}

export const RESOURCE_CATEGORIES: ResourceCategoryMeta[] = [
  {
    id: "all",
    label: "All Destinations",
    description: "Browse all verified mental health services and helplines.",
  },
  {
    id: "crisis",
    label: "Crisis & Distress",
    description: "Immediate, free 24/7 human support for acute emotional distress or self-harm concerns.",
  },
  {
    id: "counseling",
    label: "Free Tele-Counseling",
    description: "Scheduled and on-demand talk therapy and emotional guidance with qualified psychologists.",
  },
  {
    id: "student",
    label: "Youth & Students",
    description: "Support programs focused on young adults, academic pressure, and adolescent wellbeing.",
  },
  {
    id: "specialized",
    label: "Specialized Care",
    description: "Apex psychiatric institutes, clinical evaluations, and long-term psychological rehabilitation.",
  },
];

export interface Resource {
  id: string;
  name: string;
  operator: string;
  description: string;
  category: Exclude<ResourceCategory, "all">;
  /** True strictly for 24/7 emergency and immediate crisis intervention lines. */
  isCrisis: boolean;
  hours: string;
  cost: string;
  languages: string[];
  phone?: string;
  phoneDisplay?: string;
  email?: string;
  url: string;
  /** Month/year when contact details and availability were last verified by maintainers. */
  verifiedAsOf: string;
  /** Optional flag for fictional demo fixture cards. Must be badged in UI. */
  isSample?: boolean;
}

export const VERIFIED_RESOURCES: Resource[] = [
  {
    id: "tele-manas",
    name: "Tele-MANAS",
    operator: "Ministry of Health & Family Welfare & NIMHANS",
    description:
      "India's national 24/7 mental health helpline. Connects you with trained counselors and mental health specialists for immediate distress support or ongoing guidance in your regional language.",
    category: "crisis",
    isCrisis: true,
    hours: "24/7, 365 days",
    cost: "100% Free (Government of India, toll-free)",
    languages: [
      "English",
      "Hindi",
      "Assamese",
      "Bengali",
      "Gujarati",
      "Kannada",
      "Malayalam",
      "Marathi",
      "Odia",
      "Punjabi",
      "Tamil",
      "Telugu",
      "Urdu",
      "and other scheduled languages",
    ],
    phone: "14416",
    phoneDisplay: "14416 / 1800-891-4416",
    url: "https://telemanas.mohfw.gov.in",
    verifiedAsOf: "2026-09",
  },
  {
    id: "kiran-helpline",
    name: "KIRAN Helpline",
    operator: "Department of Empowerment of Persons with Disabilities, MSJE",
    description:
      "National 24/7 helpline providing early psychological screening, first-aid counseling, panic and stress management, and referrals to rehabilitation professionals across India.",
    category: "crisis",
    isCrisis: true,
    hours: "24/7, 365 days",
    cost: "100% Free (Toll-free)",
    languages: [
      "Hindi",
      "English",
      "Tamil",
      "Telugu",
      "Malayalam",
      "Gujarati",
      "Marathi",
      "Odia",
      "Bengali",
      "Assamese",
      "Punjabi",
      "Kannada",
      "Urdu",
    ],
    phone: "18005990019",
    phoneDisplay: "1800-599-0019",
    url: "https://disabilityaffairs.gov.in",
    verifiedAsOf: "2026-09",
  },
  {
    id: "icall-tiss",
    name: "iCall Psychosocial Helpline",
    operator: "Tata Institute of Social Sciences (TISS), Mumbai",
    description:
      "Free telephonic and email counseling for individuals experiencing emotional distress, relationship conflict, work strain, anxiety, and grief. Staffed by qualified professional psychologists. Note: This is a professional counseling service, not an emergency medical intervention line.",
    category: "counseling",
    isCrisis: false,
    hours: "Monday to Saturday, 10:00 AM – 8:00 PM IST",
    cost: "Free counseling (standard telephone network charges apply)",
    languages: ["English", "Hindi", "Marathi", "Gujarati", "Bengali", "Malayalam", "Tamil"],
    phone: "9152987821",
    phoneDisplay: "+91 91529 87821",
    email: "icall@tiss.edu",
    url: "https://icallhelpline.org",
    verifiedAsOf: "2026-09",
  },
  {
    id: "vandrevala-foundation",
    name: "Vandrevala Foundation Helpline",
    operator: "Vandrevala Foundation",
    description:
      "Round-the-clock free mental health counseling helpline staffed by experienced clinical psychologists. Provides confidential, non-judgmental emotional support, stress management, and compassionate listening.",
    category: "counseling",
    isCrisis: false,
    hours: "24/7, 365 days",
    cost: "Free counseling service",
    languages: [
      "English",
      "Hindi",
      "Gujarati",
      "Marathi",
      "Tamil",
      "Telugu",
      "Kannada",
      "Malayalam",
      "Bengali",
    ],
    phone: "9999666555",
    phoneDisplay: "+91 9999 666 555 / 1800 233 3330",
    url: "https://www.vandrevalafoundation.com",
    verifiedAsOf: "2026-09",
  },
  {
    id: "nimhans-cwb",
    name: "NIMHANS Centre for Well-Being (NCWB)",
    operator: "National Institute of Mental Health and Neuro Sciences, Bengaluru",
    description:
      "Outpatient community center offering clinical psychological counseling, family and couples therapy, stress clinics, and student support from clinicians at India's premier mental health institution.",
    category: "specialized",
    isCrisis: false,
    hours: "Monday to Saturday, 9:00 AM – 4:30 PM IST (by appointment)",
    cost: "Nominal public consultation fees apply",
    languages: ["English", "Hindi", "Kannada", "Tamil", "Telugu"],
    phone: "08026995000",
    phoneDisplay: "080 2699 5000 / 080 2668 5948",
    url: "https://nimhans.ac.in",
    verifiedAsOf: "2026-09",
  },
  {
    id: "sangath-youth",
    name: "Sangath Youth Mental Health",
    operator: "Sangath (Goa, New Delhi, Bhopal)",
    description:
      "Leading mental health non-profit providing evidence-based community programs, youth resources (It's Ok To Talk, Mann Mela), and accessible psychosocial counseling initiatives for adolescents and young adults.",
    category: "student",
    isCrisis: false,
    hours: "Monday to Friday, 9:30 AM – 5:30 PM IST",
    cost: "Free community support programs and research-backed initiatives",
    languages: ["English", "Hindi", "Konkani", "Marathi"],
    url: "https://sangath.in",
    verifiedAsOf: "2026-09",
  },
];

/**
 * Fictional sample fixture for demo mode.
 * Demonstrates how a private clinic card renders without inventing real practitioner names.
 */
export const SAMPLE_RESOURCE: Resource = {
  id: "sample-community-clinic",
  name: "Aarogyam Counseling Collective (Example)",
  operator: "Sample Demo Fixture",
  description:
    "Fictional example showing how private psychological clinics or peer counseling groups appear in the directory. Svasthi does not book appointments or endorse private practitioners.",
  category: "counseling",
  isCrisis: false,
  hours: "Sample: Mon–Fri, 9:00 AM – 5:00 PM IST",
  cost: "Sample: Sliding-scale consultation fee",
  languages: ["English", "Hindi"],
  url: "https://example.com/sample-clinic",
  verifiedAsOf: "2026-09",
  isSample: true,
};

/**
 * Filters resources by category and optional search term.
 * Guarantees pure, deterministic ordering.
 */
export function filterResources(
  resources: Resource[],
  category: ResourceCategory,
  searchQuery = "",
): Resource[] {
  const query = searchQuery.trim().toLowerCase();

  return resources.filter((resource) => {
    const matchesCategory = category === "all" || resource.category === category;
    if (!matchesCategory) return false;

    if (!query) return true;

    return (
      resource.name.toLowerCase().includes(query) ||
      resource.operator.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.languages.some((lang) => lang.toLowerCase().includes(query))
    );
  });
}
