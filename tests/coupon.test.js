import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../src/server.js";
import { Coupon } from "../src/models/coupon.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// ✅ Clear coupons before each test to ensure isolation
beforeEach(async () => {
  await Coupon.deleteMany({});
});

describe("Coupon API Tests", () => {
  it("should create a new cart-wise coupon", async () => {
    const res = await request(app)
      .post("/api/coupons")
      .send({
        type: "cart-wise",
        details: { threshold: 100, discount: 10 },
        expiration_date: "2099-12-31T23:59:59Z",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.coupon.type).toBe("cart-wise");
  });

  it("should fetch all coupons", async () => {
    // Create a dummy coupon to ensure response isn't empty
    await Coupon.create({
      type: "cart-wise",
      details: { threshold: 100, discount: 10 },
      expiration_date: "2099-12-31T23:59:59Z",
    });

    const res = await request(app).get("/api/coupons");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.coupons)).toBe(true);
    expect(res.body.coupons.length).toBeGreaterThan(0);
  });

  it("should skip expired coupons in applicable list", async () => {
    // create expired coupon
    await Coupon.create({
      type: "cart-wise",
      details: { threshold: 50, discount: 50 },
      expiration_date: "2000-01-01T00:00:00Z",
    });

    const res = await request(app)
      .post("/api/coupons/applicable-coupons")
      .send({
        cart: {
          items: [{ product_id: 1, quantity: 2, price: 100 }],
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.applicable_coupons.length).toBe(0);
  });

  it("should reject applying an expired coupon", async () => {
    const coupon = await Coupon.create({
      type: "cart-wise",
      details: { threshold: 50, discount: 50 },
      expiration_date: "2000-01-01T00:00:00Z",
    });

    const res = await request(app)
      .post(`/api/coupons/apply-coupon/${coupon._id}`)
      .send({
        cart: {
          items: [{ product_id: 1, quantity: 2, price: 100 }],
        },
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Coupon is expired");
  });
});
