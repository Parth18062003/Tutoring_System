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

export async function getUserData() {
    const session = await auth.api.getSession({
        headers: await headers(),
        });

    try {
      // Replace with your actual data fetching logic
      // This runs on the server - can directly query your database
      const userData = await prisma.user.findUnique({
        where: { id: session?.user.id }, // Get the user ID from auth
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