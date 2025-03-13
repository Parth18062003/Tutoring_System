import { NextRequest, NextResponse } from "next/server";
import { personalInfoSchema } from "@/lib/schema";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Helper function to safely parse phone number
function parsePhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined;

  // Remove all non-numeric characters
  const digitsOnly = phone.replace(/\D/g, "");

  // If we have digits, return as string, otherwise return undefined
  return digitsOnly ? digitsOnly : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("session", session);

    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("session", session);

    if (!session?.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    try {
      const validatedData = personalInfoSchema.parse(body);

      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: validatedData.fullName,
          bio: validatedData.bio,
          dob: validatedData.dateOfBirth,
          address: validatedData.location,
          gender: validatedData.gender,
          phone: parsePhoneNumber(validatedData.phoneNumber),
          school: validatedData.school,
          grade: validatedData.grade,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Personal information updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          fullName: updatedUser.name,
          bio: updatedUser.bio,
          phoneNumber: updatedUser.phone,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
          location: updatedUser.address,
          school: updatedUser.school,
          grade: updatedUser.grade,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
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
