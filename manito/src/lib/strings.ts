/**
 * Every user-facing string in the app lives here.
 *
 * Manito is built for CDMX, so it will almost certainly ship in Spanish. Rather
 * than pull in a full i18n library for a mockup, all copy is centralised in one
 * object. Two ways forward when you want Spanish:
 *
 *   1. Quick: translate the values below in place. Nothing else changes.
 *   2. Proper: rename this object to `en`, add a matching `es` object, and
 *      export `export const t = locale === "es" ? es : en`. Because every
 *      component already reads from `t`, no component needs editing. From
 *      there, moving to next-intl is mechanical.
 *
 * Rule for the rest of the codebase: no hardcoded sentences in components.
 * Labels that come from domain data (trades, neighborhoods, statuses) live in
 * `constants.ts` instead, next to the values they describe.
 */

export const t = {
  brand: {
    name: "Manito",
    tagline: "Home repairs, handled.",
  },

  nav: {
    howItWorks: "How it works",
    trades: "Trades",
    forPros: "For pros",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    dashboard: "Dashboard",
    postJob: "Post a problem",
    myProfile: "My profile",
    account: "Account",
  },

  landing: {
    eyebrow: "Mexico City · Roma · Condesa · Polanco · Coyoacán · Santa Fe",
    headline: "Find a pro who actually shows up.",
    subhead:
      "Describe what broke. Manito matches you with vetted plumbers, electricians and handymen who work your neighborhood — and you pick who to call.",
    consumerCta: "I need help",
    consumerCtaHint: "Post a problem, free",
    providerCta: "I'm a pro",
    providerCtaHint: "Get matched with jobs nearby",
    trustLine: "No bidding wars. No call centers. No surprise fees.",

    stepsTitle: "How it works",
    stepsSubtitle: "Three steps, about two minutes.",
    steps: [
      {
        title: "Describe the problem",
        body: "Pick a trade, tell us what is going on and where you are. Plain language is fine.",
      },
      {
        title: "See who fits",
        body: "We filter by trade and neighborhood, then rank by rating so the strongest options are at the top.",
      },
      {
        title: "Request your pick",
        body: "Send the job to the pro you want. They accept or decline, and you see the answer on your dashboard.",
      },
    ],

    tradesTitle: "Trades on Manito",
    tradesSubtitle: "The five things that break most often in a CDMX apartment.",

    proTitle: "Work on Manito",
    proSubtitle:
      "Set your trades and the neighborhoods you cover. Get job requests that already match both — no leads to buy, no cold calls.",
    proBullets: [
      "Only see jobs in your trades and your area",
      "Accept or decline in one tap",
      "Your rating and experience decide where you rank",
    ],
    proCta: "Create a pro profile",

    footerNote: "A class project. Mock data, mock matching, no real payments.",
  },

  auth: {
    loginTitle: "Welcome back",
    loginSubtitle: "Log in to your Manito account.",
    signupTitle: "Create your account",
    signupSubtitle: "Takes about thirty seconds.",
    email: "Email",
    password: "Password",
    name: "Full name",
    phone: "Phone (optional)",
    roleQuestion: "How will you use Manito?",
    roleConsumer: "I need help with my home",
    roleConsumerHint: "Post problems and choose a pro",
    roleProvider: "I'm a pro looking for work",
    roleProviderHint: "Get matched with jobs near you",
    submitLogin: "Log in",
    submitSignup: "Create account",
    noAccount: "New to Manito?",
    hasAccount: "Already have an account?",
    goSignup: "Create one",
    goLogin: "Log in",
    invalidCredentials: "That email and password don't match an account.",
    passwordHint: "At least 8 characters.",
    demoTitle: "Demo accounts",
    demoHint: "Every seeded account uses the password below.",
  },

  consumer: {
    dashboardTitle: "Your jobs",
    dashboardSubtitle: "Everything you've posted, and where it stands.",
    emptyTitle: "No jobs yet",
    emptyBody: "Post your first problem and we'll find pros who work your area.",
    newJobCta: "Post a problem",

    formTitle: "What needs fixing?",
    formSubtitle: "The more specific you are, the better the match.",
    fieldCategory: "What kind of work is it?",
    fieldTitle: "One-line summary",
    fieldTitlePlaceholder: "Kitchen sink won't drain",
    fieldDescription: "What's going on?",
    fieldDescriptionPlaceholder:
      "Water backs up when the dishwasher runs. Started two days ago, plunger didn't help.",
    fieldArea: "Your neighborhood",
    fieldUrgency: "How urgent is it?",
    submitJob: "Find pros",
    submittingJob: "Finding pros…",

    matchesTitle: "Pros who match",
    matchesSubtitleFor: (category: string, area: string) =>
      `${category} in ${area}, ranked by rating.`,
    matchesNoneTitle: "Nobody covers this neighborhood yet",
    matchesNoneBody:
      "No pro on Manito lists this trade in this area. As the network grows this fills in — in the meantime, check the nearby pros below.",
    nearbyTitle: "Also available nearby",
    nearbySubtitle:
      "These pros work an adjacent neighborhood and may still take the job.",
    requestCta: "Request this pro",
    requestPending: "Requested",
    requestSending: "Sending…",
    requestSent: "Request sent",
    requestDeclined: "Declined",
    requestAccepted: "Accepted your job",

    jobDetailBack: "Back to your jobs",
    requestsTitle: "Your requests",
    requestsEmpty: "You haven't requested a pro for this job yet.",
    markComplete: "Mark as completed",
    markingComplete: "Saving…",
    completedNote: "This job is done.",
    acceptedBy: (name: string) => `${name} accepted this job.`,
  },

  provider: {
    dashboardTitle: "Job requests",
    dashboardSubtitle: "Jobs sent to you, newest first.",
    emptyTitle: "No requests yet",
    emptyBody:
      "You'll see a job here as soon as a neighbor picks you. Keep your trades and service areas up to date so you show up in more searches.",
    accept: "Accept",
    decline: "Decline",
    responding: "Saving…",
    acceptedTag: "You accepted this",
    declinedTag: "You declined this",
    takenTag: "Filled by another pro",
    activeTitle: "Active jobs",
    activeSubtitle: "Work you've accepted.",

    profileTitle: "Your pro profile",
    profileSubtitle:
      "This is what consumers see on a match card — and what the matcher filters on.",
    fieldCategories: "Trades you work in",
    fieldCategoriesHint: "Pick every trade you take jobs for.",
    fieldAreas: "Neighborhoods you cover",
    fieldAreasHint: "You'll only be matched with jobs in these areas.",
    fieldBio: "Short bio",
    fieldBioPlaceholder:
      "Twelve years on residential plumbing in the Roma/Condesa area. Same-day for leaks.",
    fieldYears: "Years of experience",
    fieldRate: "Typical hourly rate (MXN, optional)",
    saveProfile: "Save profile",
    savingProfile: "Saving…",
    profileSaved: "Profile saved.",
    profileIncomplete:
      "Add at least one trade and one neighborhood so consumers can find you.",
    completeProfileCta: "Complete profile",
    noReviewsYet: "No reviews yet",
    ratingMockNote:
      "Rating and review count are seeded demo data — reviews aren't built yet.",
  },

  common: {
    loading: "Loading…",
    saving: "Saving…",
    cancel: "Cancel",
    save: "Save",
    error: "Something went wrong. Please try again.",
    required: "Required",
    postedOn: (date: string) => `Posted ${date}`,
    reviews: (n: number) => (n === 1 ? "1 review" : `${n} reviews`),
    yearsExperience: (n: number) => (n === 1 ? "1 yr exp" : `${n} yrs exp`),
    perHour: "/hr",
    verified: "Verified",
    newOnManito: "New on Manito",
    urgencyLabel: "Urgency",
    statusLabel: "Status",
  },
} as const;
