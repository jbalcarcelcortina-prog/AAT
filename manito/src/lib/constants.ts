/**
 * Manito — domain vocabulary.
 *
 * SQLite cannot store Prisma enums, so every "enum" column in the schema is a
 * plain string. This file is the single source of truth for the allowed values
 * and their display labels. Adding a trade or a neighborhood is a one-line
 * change here plus a seed entry — no migration required.
 */

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const ROLES = ["CONSUMER", "PROVIDER"] as const;
export type Role = (typeof ROLES)[number];

// ---------------------------------------------------------------------------
// Service categories (trades)
// ---------------------------------------------------------------------------

export const SERVICE_CATEGORIES = [
  {
    value: "PLUMBING",
    label: "Plumbing",
    blurb: "Leaks, clogs, water heaters, pipe repair",
    icon: "droplets",
  },
  {
    value: "ELECTRICAL",
    label: "Electrical",
    blurb: "Wiring, outlets, panels, lighting",
    icon: "zap",
  },
  {
    value: "HVAC",
    label: "HVAC",
    blurb: "Heating, cooling, ventilation, minisplits",
    icon: "wind",
  },
  {
    value: "HANDYMAN",
    label: "Handyman",
    blurb: "Mounting, carpentry, drywall, odd jobs",
    icon: "hammer",
  },
  {
    value: "APPLIANCE_REPAIR",
    label: "Appliance repair",
    blurb: "Washers, dryers, fridges, ovens",
    icon: "washing-machine",
  },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

export const SERVICE_CATEGORY_VALUES = SERVICE_CATEGORIES.map(
  (c) => c.value,
) as readonly ServiceCategory[];

export function categoryLabel(value: string): string {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function categoryIconName(value: string): string {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.icon ?? "wrench";
}

// ---------------------------------------------------------------------------
// Service areas (neighborhoods)
// ---------------------------------------------------------------------------

/**
 * MOCK: a flat list of CDMX neighborhoods. A real version would use
 * coordinates plus a travel radius, so "close enough" becomes a distance
 * rather than a string equality check.
 */
export const SERVICE_AREAS = [
  { value: "ROMA", label: "Roma", city: "CDMX" },
  { value: "CONDESA", label: "Condesa", city: "CDMX" },
  { value: "POLANCO", label: "Polanco", city: "CDMX" },
  { value: "COYOACAN", label: "Coyoacán", city: "CDMX" },
  { value: "SANTA_FE", label: "Santa Fe", city: "CDMX" },
] as const;

export type ServiceArea = (typeof SERVICE_AREAS)[number]["value"];

export const SERVICE_AREA_VALUES = SERVICE_AREAS.map(
  (a) => a.value,
) as readonly ServiceArea[];

export function areaLabel(value: string): string {
  return SERVICE_AREAS.find((a) => a.value === value)?.label ?? value;
}

/**
 * MOCK adjacency: which neighborhoods a pro can realistically reach even when
 * they have not listed them. Used only for the "also available nearby"
 * fallback in the matcher. Replace with real travel-time data later.
 */
export const ADJACENT_AREAS: Record<ServiceArea, readonly ServiceArea[]> = {
  ROMA: ["CONDESA", "COYOACAN"],
  CONDESA: ["ROMA", "POLANCO"],
  POLANCO: ["CONDESA", "SANTA_FE"],
  COYOACAN: ["ROMA"],
  SANTA_FE: ["POLANCO"],
};

// ---------------------------------------------------------------------------
// Urgency
// ---------------------------------------------------------------------------

export const URGENCY_LEVELS = [
  { value: "LOW", label: "Low", hint: "Whenever someone is free this week" },
  { value: "MEDIUM", label: "Medium", hint: "In the next day or two" },
  { value: "HIGH", label: "High", hint: "Today — this is getting worse" },
] as const;

export type Urgency = (typeof URGENCY_LEVELS)[number]["value"];

export const URGENCY_VALUES = URGENCY_LEVELS.map(
  (u) => u.value,
) as readonly Urgency[];

export function urgencyLabel(value: string): string {
  return URGENCY_LEVELS.find((u) => u.value === value)?.label ?? value;
}

// ---------------------------------------------------------------------------
// Job lifecycle
// ---------------------------------------------------------------------------

export const JOB_STATUSES = [
  { value: "OPEN", label: "Open", hint: "Posted, no pro contacted yet" },
  { value: "REQUESTED", label: "Requested", hint: "Waiting on a pro to reply" },
  { value: "ACCEPTED", label: "Accepted", hint: "A pro is on it" },
  { value: "COMPLETED", label: "Completed", hint: "Work finished" },
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number]["value"];

export const JOB_STATUS_VALUES = JOB_STATUSES.map(
  (s) => s.value,
) as readonly JobStatus[];

export function jobStatusLabel(value: string): string {
  return JOB_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const REQUEST_STATUSES = ["PENDING", "ACCEPTED", "DECLINED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
