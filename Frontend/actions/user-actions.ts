"use server";

import { cache } from "react";
import { revalidateTag } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type UserDashboardData = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: boolean | null;
  bio: string | null;
  dob: string | null;
  gender: string | null;
  image: string | null;
  role: string;
  phone: string | null;
  school: string | null;
  grade: string | null;
  address: string | null;
  twoFactorEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

const getUserDataPromise = cache(async (): Promise<UserDashboardData> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id as string;

  try {
    const userData = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        address: true,
        bio: true,
        dob: true,
        gender: true,
        phone: true,
        school: true,
        grade: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        // Add other fields as needed for the dashboard
      },
    });

    return userData;
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    throw new Error("Failed to fetch user data");
  }
});

export async function getUserData(): Promise<UserDashboardData> {
  return await getUserDataPromise();
}

export async function updateUserData(data: Partial<UserDashboardData>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id as string;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email || undefined,
        name: data.name || undefined,
        image: data.image || undefined,
        address: data.address || undefined,
        bio: data.bio || undefined,
        dob: data.dob || undefined,
        gender: data.gender || undefined,
        phone: data.phone || undefined,
        school: data.school || undefined,
        grade: data.grade || undefined,
        twoFactorEnabled: data.twoFactorEnabled || undefined,
        emailVerified: data.emailVerified || undefined,
        updatedAt: new Date(), // Update the updatedAt field
      },
    });

    // Revalidate the cache after update
    revalidateTag("user-data");

    return { success: true };
  } catch (error) {
    console.error("Failed to update user data:", error);
    return {
      success: false,
      error: "Failed to update user data",
    };
  }
}
