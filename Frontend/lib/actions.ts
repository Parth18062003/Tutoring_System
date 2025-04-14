"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import prisma from "./prisma";

export type userData = {
  id?: string;
  name?: string;
  email?: string;
  fullName?: string;
  bio?: string;
  dob?: string;
  address?: string;
  gender?: string;
  phoneNumber?: string;
  school?: string;
  grade?: string;
};

export async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  try {
    if (!session?.user.id) {
      throw new Error("User ID not found in session");
    }
    return { success: true, userId: session.user.id };
  } catch (error) {
    console.error("Failed to fetch user ID:", error);
    return { success: false, error: "Failed to load user ID" };
  }
}

export async function getUserData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  try {
    const userData = await prisma.user.findUnique({
      where: { id: session?.user.id }, 
    });

    if (!userData) {
      throw new Error("User not found");
    }

    return { success: true, user: userData as userData };
  } catch (error) {
    console.error("Failed to fetch user data:", error);
    return { success: false, error: "Failed to load user data" };
  }
}
