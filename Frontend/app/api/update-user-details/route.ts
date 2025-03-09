import { NextRequest, NextResponse } from "next/server";
import { personalInfoSchema } from "@/lib/schema";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Create a rate limiter instance
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
  prefix: "@upstash/ratelimit-personal-info",
});

enum Gender {
  MALE,
  FEMALE,
  NONBINARY,
  OTHER,
}

// Helper function to convert enum gender to string
function mapGenderToString(gender: Gender | null | undefined): string {
  switch (gender) {
    case Gender.MALE:
      return "male";
    case Gender.FEMALE:
      return "female";
    case Gender.NONBINARY:
      return "nonbinary";
    case Gender.OTHER:
      return "other";
    default:
      return "other";
  }
}

// Helper function to safely parse phone number
function parsePhoneNumber(phone: string | undefined): number | undefined {
  if (!phone) return undefined;

  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, "");

  // If we have digits, parse as integer, otherwise return undefined
  return digitsOnly ? parseInt(digitsOnly, 10) : undefined;
}

export async function GET(request: NextRequest) {
  try {
    // Get the current user session using auth()

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("session", session);
    // Check if the session exists
    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    /*     const userId = session.user.id;
    const { success } = await ratelimit.limit(`personal_info_get_${userId}`);

     if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    } */

    // Fetch the user's information from the database
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });

    console.log("user", user);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fullName: user.name,
        displayName: user.name,
        bio: user.bio,
        dob: user.dob,
        location: user.address,
        phoneNumber: user.phone,
        school: user.school,
        grade: user.grade,
      },
    });
  } catch (error) {
    console.error("[PERSONAL_INFO_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the current user session using auth()
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("session", session?.user);
    // Check if the session exists
    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Apply rate limiting
    /*     const userId = session.user.id;
     const { success } = await ratelimit.limit(`personal_info_put_${userId}`);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }  */

    // Parse and validate the request body
    const body = await request.json();

    try {
      const validatedData = personalInfoSchema.parse(body);

      // Log validation success
      // console.log(`[${new Date().toISOString()}] User ${session.user.name} (${userId}) submitted valid personal info form`);

      // Update user information in the database
      const updatedUser = await prisma.user.update({
        where: {
          email: session.user.email,
        },
        data: {
          name: validatedData.fullName,
          bio: validatedData.bio,
          dob: validatedData.dateOfBirth,
          address: validatedData.location,
          phone: parsePhoneNumber(validatedData.phoneNumber),
          school: validatedData.school,
          grade: validatedData.grade,
        },
      });

      // Return the updated data (excluding sensitive fields)
      return NextResponse.json({
        success: true,
        message: "Personal information updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          fullName: updatedUser.name,
          bio: updatedUser.bio,
          dob: updatedUser.dob,
          location: updatedUser.address,
          school: updatedUser.school,
          grade: updatedUser.grade,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Log validation error details
        //console.error(`[${new Date().toISOString()}] Form validation error for user ${userId}:`, error.errors);

        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[PERSONAL_INFO_UPDATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
