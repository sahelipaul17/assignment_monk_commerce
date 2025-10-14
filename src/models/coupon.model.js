import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["cart-wise", "product-wise", "bxgy"],
      required: true,
    },
    details: {
      type: Object,
      required: true,
    },
    //bonus - Coupon Expiration Dates
    expiration_date: {
      type: Date,
      required: false, 
    },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model("Coupon", CouponSchema);
