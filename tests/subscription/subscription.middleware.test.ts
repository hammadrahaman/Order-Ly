import { subscriptionMiddleware } from "../../src/middlewares/subscription.middleware";
import prisma from "../../src/config/db";

/**
 * Mock Prisma
 */
jest.mock("../../src/config/db", () => ({
  restaurant: {
    findUnique: jest.fn(),
  },
}));

/**
 * Mock Express Response
 */
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Mock next()
 */
const mockNext = () => jest.fn();

describe("Subscription Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * ✅ ACTIVE subscription → allow
   */
  it("allows request when subscription is ACTIVE", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();
    const next = mockNext();

    (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue({
      id: "rest_1",
      subscriptionStatus: "ACTIVE",
    });

    await subscriptionMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * ✅ Valid TRIAL → allow
   */
  it("allows request when TRIAL is still valid", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();
    const next = mockNext();

    (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue({
      id: "rest_1",
      subscriptionStatus: "TRIAL",
      trialEndsAt: new Date(Date.now() + 60 * 60 * 1000), // future
    });

    await subscriptionMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * ❌ Expired TRIAL → block
   */
  it("blocks request when TRIAL is expired", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();
    const next = mockNext();

    (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue({
      id: "rest_1",
      subscriptionStatus: "TRIAL",
      trialEndsAt: new Date(Date.now() - 60 * 60 * 1000), // past
    });

    await subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({
      message: "Subscription expired. Please subscribe to continue.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * ❌ EXPIRED subscription → block
   */
  it("blocks request when subscription is EXPIRED", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();
    const next = mockNext();

    (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue({
      id: "rest_1",
      subscriptionStatus: "EXPIRED",
    });

    await subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({
      message: "Subscription expired. Please renew to continue.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * ❌ Restaurant not found → unauthorized
   */
  it("returns 404 when restaurant is not found", async () => {
    const req: any = {
      user: { restaurantId: "rest_1" },
    };

    const res = mockResponse();
    const next = mockNext();

    (prisma.restaurant.findUnique as jest.Mock).mockResolvedValue(null);

    await subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Restaurant not found",
    });
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * ❌ Missing user in request → unauthorized
   */
  it("returns 401 when user is missing in request", async () => {
    const req: any = {};
    const res = mockResponse();
    const next = mockNext();

    await subscriptionMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
