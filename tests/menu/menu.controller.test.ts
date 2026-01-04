import { createMenuCategory, getMenuCategories } from "../../src/modules/menu/menu.controller";
import prisma from "../../src/config/db";

// Mock Prisma
jest.mock("../../src/config/db", () => ({
  menuCategory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Menu Category Controller", () => {

  it("should create menu category successfully", async () => {
    const req: any = {
      body: { name: "Starters" },
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();

    (prisma.menuCategory.create as jest.Mock).mockResolvedValue({
      id: "cat_1",
      name: "Starters",
      restaurantId: "rest_1",
      isActive: true,
    });

    await createMenuCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Starters" })
    );
  });

  it("should return 400 if category name is missing", async () => {
    const req: any = {
      body: {},
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();

    await createMenuCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Category name is required",
    });
  });

  it("should fetch categories successfully", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();

    (prisma.menuCategory.findMany as jest.Mock).mockResolvedValue([
      { id: "cat_1", name: "Starters" },
      { id: "cat_2", name: "Main Course" },
    ]);

    await getMenuCategories(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Starters" }),
      ])
    );
  });
});
