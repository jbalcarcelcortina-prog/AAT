/**
 * Seed data for the Manito mockup.
 *
 * Eight providers spread across the five trades and five CDMX neighborhoods,
 * three consumers, and four jobs sitting in four different statuses so every
 * dashboard state is visible without clicking anything.
 *
 * The provider coverage is chosen so that every (trade x neighborhood) pair
 * returns at least one result — either a direct match or an adjacent-
 * neighborhood one — which keeps the demo from ever hitting an empty list.
 *
 * Run with:  npm run db:seed   (destructive — it clears the tables first)
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Shared by every seeded account. Printed at the end of the run. */
const DEMO_PASSWORD = "manito123";

const providers = [
  {
    name: "Rafael Guzmán",
    email: "rafael@manito.demo",
    phone: "55 1234 0001",
    categories: ["PLUMBING"],
    areas: ["ROMA", "CONDESA"],
    rating: 4.9,
    reviewCount: 41,
    yearsExperience: 14,
    hourlyRateMxn: 380,
    verified: true,
    bio: "Residential plumbing since 2011. Leaks, drains and water heaters. Same-day for anything actively flooding.",
  },
  {
    name: "Lucía Ramírez",
    email: "lucia@manito.demo",
    phone: "55 1234 0002",
    categories: ["PLUMBING", "APPLIANCE_REPAIR"],
    areas: ["CONDESA", "POLANCO"],
    rating: 4.6,
    reviewCount: 23,
    yearsExperience: 8,
    hourlyRateMxn: 420,
    verified: true,
    bio: "Plumbing plus washer and dishwasher installs. I bring my own parts for the common failures so most jobs finish in one visit.",
  },
  {
    name: "Marco Téllez",
    email: "marco@manito.demo",
    phone: "55 1234 0003",
    categories: ["ELECTRICAL"],
    areas: ["POLANCO", "SANTA_FE"],
    rating: 4.8,
    reviewCount: 57,
    yearsExperience: 11,
    hourlyRateMxn: 520,
    verified: true,
    bio: "Licensed electrician. Panel upgrades, rewiring and anything that keeps tripping a breaker. I explain what I found before I touch it.",
  },
  {
    name: "Daniela Ortiz",
    email: "daniela@manito.demo",
    phone: "55 1234 0004",
    categories: ["ELECTRICAL", "HANDYMAN"],
    areas: ["ROMA", "COYOACAN"],
    rating: 4.4,
    reviewCount: 12,
    yearsExperience: 5,
    hourlyRateMxn: 350,
    verified: false,
    bio: "Outlets, lighting, smart switches and the small carpentry that comes with them. Flexible on evenings.",
  },
  {
    name: "Héctor Villalobos",
    email: "hector@manito.demo",
    phone: "55 1234 0005",
    categories: ["HVAC"],
    areas: ["SANTA_FE", "POLANCO"],
    rating: 4.7,
    reviewCount: 33,
    yearsExperience: 16,
    hourlyRateMxn: 600,
    verified: true,
    bio: "Minisplit installs, service and refrigerant work. Sixteen years on residential and small-office systems.",
  },
  {
    name: "Alejandra Sosa",
    email: "alejandra@manito.demo",
    phone: "55 1234 0006",
    categories: ["HVAC", "APPLIANCE_REPAIR"],
    areas: ["CONDESA", "ROMA"],
    rating: 4.2,
    reviewCount: 9,
    yearsExperience: 4,
    hourlyRateMxn: 400,
    verified: false,
    bio: "AC servicing and appliance diagnostics. Newer on the platform, quick to respond, honest when a unit is not worth repairing.",
  },
  {
    name: "Nacho Peralta",
    email: "nacho@manito.demo",
    phone: "55 1234 0007",
    categories: ["HANDYMAN"],
    areas: ["COYOACAN", "ROMA"],
    rating: 4.9,
    reviewCount: 68,
    yearsExperience: 12,
    hourlyRateMxn: 300,
    verified: true,
    bio: "Shelves, doors, drywall, furniture assembly, the list of ten little things you have been putting off. One visit, all of it.",
  },
  {
    name: "Beto Mendoza",
    email: "beto@manito.demo",
    phone: "55 1234 0008",
    categories: ["APPLIANCE_REPAIR", "HANDYMAN"],
    areas: ["SANTA_FE", "POLANCO", "CONDESA"],
    rating: 3.9,
    reviewCount: 15,
    yearsExperience: 6,
    hourlyRateMxn: 330,
    verified: false,
    bio: "Fridges, ovens, washers and dryers. I cover the west side of the city and can usually come out the next morning.",
  },
] as const;

const consumers = [
  { name: "Sofía Márquez", email: "sofia@manito.demo", phone: "55 5555 0101" },
  { name: "Emilio Navarro", email: "emilio@manito.demo", phone: "55 5555 0102" },
  { name: "Paula Cervantes", email: "paula@manito.demo", phone: "55 5555 0103" },
] as const;

/** Minutes/hours/days ago, so the dashboards show a believable spread. */
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Clearing existing data…");
  // Order matters: children before parents.
  await prisma.jobRequest.deleteMany();
  await prisma.job.deleteMany();
  await prisma.providerCategory.deleteMany();
  await prisma.providerArea.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Creating providers…");
  const providerIdByEmail = new Map<string, string>();
  for (const p of providers) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        passwordHash,
        role: "PROVIDER",
        providerProfile: {
          create: {
            bio: p.bio,
            yearsExperience: p.yearsExperience,
            rating: p.rating,
            reviewCount: p.reviewCount,
            hourlyRateMxn: p.hourlyRateMxn,
            verified: p.verified,
            categories: {
              create: p.categories.map((category) => ({ category })),
            },
            areas: { create: p.areas.map((area) => ({ area })) },
          },
        },
      },
      include: { providerProfile: true },
    });
    providerIdByEmail.set(p.email, user.providerProfile!.id);
  }

  console.log("Creating consumers…");
  const consumerIdByEmail = new Map<string, string>();
  for (const c of consumers) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash,
        role: "CONSUMER",
      },
    });
    consumerIdByEmail.set(c.email, user.id);
  }

  const sofia = consumerIdByEmail.get("sofia@manito.demo")!;
  const emilio = consumerIdByEmail.get("emilio@manito.demo")!;
  const paula = consumerIdByEmail.get("paula@manito.demo")!;
  const rafael = providerIdByEmail.get("rafael@manito.demo")!;
  const hector = providerIdByEmail.get("hector@manito.demo")!;
  const nacho = providerIdByEmail.get("nacho@manito.demo")!;

  console.log("Creating sample jobs…");

  // 1. OPEN — posted, no pro contacted yet.
  await prisma.job.create({
    data: {
      consumerId: sofia,
      category: "APPLIANCE_REPAIR",
      title: "Dryer stopped heating",
      description:
        "The drum still spins but the clothes come out cold and damp. It's a Whirlpool, about six years old. No burning smell.",
      area: "ROMA",
      urgency: "LOW",
      status: "OPEN",
      createdAt: daysAgo(1),
    },
  });

  // 2. REQUESTED — waiting on one pro to answer.
  await prisma.job.create({
    data: {
      consumerId: sofia,
      category: "PLUMBING",
      title: "Kitchen sink backs up when the dishwasher runs",
      description:
        "Water comes up into the sink every time the dishwasher drains. Plunger did nothing. It's been two days and it's getting worse.",
      area: "ROMA",
      urgency: "HIGH",
      status: "REQUESTED",
      createdAt: daysAgo(2),
      requests: {
        create: {
          providerId: rafael,
          status: "PENDING",
          matchScore: 95.5,
          message: "Mornings work best for me if you have anything open.",
          createdAt: daysAgo(2),
        },
      },
    },
  });

  // 3. ACCEPTED — a pro took it.
  await prisma.job.create({
    data: {
      consumerId: emilio,
      category: "HVAC",
      title: "Minisplit in the bedroom blows warm air",
      description:
        "Unit turns on and the fan works, but nothing cold comes out. It was serviced about two years ago. Two-bedroom apartment in Santa Fe.",
      area: "SANTA_FE",
      urgency: "MEDIUM",
      status: "ACCEPTED",
      acceptedProviderId: hector,
      createdAt: daysAgo(5),
      requests: {
        create: {
          providerId: hector,
          status: "ACCEPTED",
          matchScore: 94.8,
          createdAt: daysAgo(5),
          respondedAt: daysAgo(4),
        },
      },
    },
  });

  // 4. COMPLETED — the full happy path.
  await prisma.job.create({
    data: {
      consumerId: paula,
      category: "HANDYMAN",
      title: "Hang five shelves and fix a sticking door",
      description:
        "Four floating shelves in the living room, one in the kitchen, plus the bathroom door that won't close all the way since the rains.",
      area: "COYOACAN",
      urgency: "LOW",
      status: "COMPLETED",
      acceptedProviderId: nacho,
      createdAt: daysAgo(12),
      requests: {
        create: {
          providerId: nacho,
          status: "ACCEPTED",
          matchScore: 96.0,
          createdAt: daysAgo(12),
          respondedAt: daysAgo(11),
        },
      },
    },
  });

  const [userCount, providerCount, jobCount] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.job.count(),
  ]);

  console.log("");
  console.log(`Seeded ${userCount} users (${providerCount} pros) and ${jobCount} jobs.`);
  console.log("");
  console.log("Log in with any of these — password for all of them:");
  console.log(`  ${DEMO_PASSWORD}`);
  console.log("");
  console.log("  Consumers: sofia@manito.demo  emilio@manito.demo  paula@manito.demo");
  console.log("  Providers: rafael@manito.demo  marco@manito.demo  nacho@manito.demo  (+5 more)");
  console.log("");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
