import express from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupons,
  applyCouponToCart,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

router.post("/applicable-coupons", getApplicableCoupons);
router.post("/apply-coupon/:id", applyCouponToCart);

export default router;
