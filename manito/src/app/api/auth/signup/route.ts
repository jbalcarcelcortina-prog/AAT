import { hashPassword } from "@/lib/auth";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation";

/**
 * POST /api/auth/signup — create an account.
 *
 * The client signs in with the same credentials immediately afterwards, so
 * this route deliberately does not issue a session itself.
 */
export async function POST(request: Request) {
  try {
    const input = signupSchema.parse(await readJson(request));

    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) {
      return fail("An account with that email already exists", 409, {
        email: "That email is already registered",
      });
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        passwordHash: await hashPassword(input.password),
        role: input.role,
        // Providers get an empty profile right away so the dashboard has
        // something to edit instead of a null check in every component.
        ...(input.role === "PROVIDER"
          ? { providerProfile: { create: {} } }
          : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return ok(user, 201);
  } catch (error) {
    return handleError(error);
  }
}
