import { signupOwner } from "../../src/modules/auth/auth.service";
import prisma from "../../src/config/db";

import bcrypt from "bcrypt";
import { loginUser } from "../../src/modules/auth/auth.service";

jest.mock("../../src/config/db", () => ({
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  restaurant: {
    create: jest.fn(),
  },
}));

describe("Auth Service - Signup", () => {
  it("should create a restaurant and owner and return token", async () => {
    // Arrange (fake DB responses)
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.restaurant.create as jest.Mock).mockResolvedValue({
      id: "rest_1",
    });
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user_1",
      role: "OWNER",
    });

    // Act
    const result = await signupOwner({
      name: "Hammad",
      email: "test@test.com",
      password: "123456",
      restaurantName: "Test Cafe",
      city: "Bangalore",
      gstPercentage: 5,
    });

    // Assert
    expect(result.token).toBeDefined();


  });

  it("should throw error if email already exists", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "existing_user",
    });
  
    await expect(
      signupOwner({
        name: "Hammad",
        email: "test@test.com",
        password: "123456",
        restaurantName: "Test Cafe",
        city: "Bangalore",
        gstPercentage: 5,
      })
    ).rejects.toThrow("Email already registered");
  });


  


it("should login user with correct password", async () => {
  const hashedPassword = await bcrypt.hash("123456", 10);

  (prisma.user.findFirst as jest.Mock).mockResolvedValue({
    id: "user_1",
    restaurantId: "rest_1",
    role: "OWNER",
    password: hashedPassword,
  });

  const result = await loginUser("test@test.com", "123456");

  expect(result.token).toBeDefined();
});


it("should throw error if password is incorrect", async () => {
    // Arrange: user exists with hashed password
    const hashedPassword = await bcrypt.hash("correct_password", 10);

    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
      id: "user_1",
      restaurantId: "rest_1",
      role: "OWNER",
      password: hashedPassword,
    });

    // Act + Assert
    await expect(
      loginUser("test@test.com", "wrong_password")
    ).rejects.toThrow("Invalid credentials");
  });


});
