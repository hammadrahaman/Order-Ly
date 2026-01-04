import bcrypt from "bcrypt";
import prisma from "../../config/db";
import { generateToken } from "../../utils/jwt";

export async function signupOwner(data: {
  name: string;
  email: string;
  password: string;
  restaurantName: string;
  city: string;
  gstPercentage: number;
}) {
  // 1. Check if email already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 3. Create restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.restaurantName,
      city: data.city,
      gstPercentage: data.gstPercentage,
      trialEndsAt: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days trial
      ),
    },
  });

  // 4. Create owner user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "OWNER",
      restaurantId: restaurant.id,
    },
  });
  console.log("Before generating token");
  // 5. Generate JWT token
  const token = generateToken({
    userId: user.id,
    restaurantId: restaurant.id,
    role: user.role,
  });
  console.log("After generating token");
  return { token };
}

export async function loginUser(email: string, password: string) {
  // 1. Find user
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // 2. Compare password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  // 3. Generate JWT token
  const token = generateToken({
    userId: user.id,
    restaurantId: user.restaurantId,
    role: user.role,
  });

  return { token };
}
