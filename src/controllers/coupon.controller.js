import { Coupon } from "../models/coupon.model.js";

//basic CRUD operations
// Create

export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ coupon, message: "Coupon created successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Read all

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({coupons, message: "Coupons fetched successfully"});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Read one

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({coupon, message: "Coupon fetched successfully"});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({coupon, message: "Coupon updated successfully"});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//
// applicable-coupon
/*
  Get applicable coupons for the given cart
*/

export const getApplicableCoupons = async (req, res) => {
    try {
      const { cart } = req.body;
      if (!cart || !Array.isArray(cart.items)) {
        return res.status(400).json({ message: "Invalid cart format" });
      }
  
      const coupons = await Coupon.find();
      const applicableCoupons = [];
  
      if (!coupons || coupons.length === 0) {
        return res.status(404).json({ message: "No coupons found" });
      }

      for (const coupon of coupons) {
        const { type, details } = coupon;
        let discount = 0;
  
        if (isCouponExpired(coupon)) {
            continue;
        }
        switch (type) {
          case "cart-wise": {
            const cartTotal = calculateCartTotal(cart);
            if (cartTotal > details.threshold) {
              discount = (details.discount / 100) * cartTotal;
              applicableCoupons.push({
                coupon_id: coupon._id,
                type,
                discount,
              });
            }
            break;
          }
  
          case "product-wise": {
            const product = cart.items.find(
              (i) => i.product_id === details.product_id
            );
            if (product) {
              discount =
                (details.discount / 100) * product.price * product.quantity;
              applicableCoupons.push({
                coupon_id: coupon._id,
                type,
                discount,
              });
            }
            break;
          }
  
          case "bxgy": {
            const { buy_products, get_products, repition_limit } = details;
            let totalDiscount = 0;
            let totalBuyQty = 0;
  
            // Count buy products in cart
            for (const b of buy_products) {
              const item = cart.items.find(
                (i) => i.product_id === b.product_id
              );
              if (item) totalBuyQty += item.quantity;
            }
  
            // Determine how many times offer applies
            const xRequired = buy_products.reduce(
              (sum, b) => sum + b.quantity,
              0
            );
            const yQty = get_products.reduce(
              (sum, g) => sum + g.quantity,
              0
            );
            const repeat = Math.min(
              Math.floor(totalBuyQty / xRequired),
              repition_limit
            );
  
            if (repeat > 0) {
              // calculate free item discount
              for (const g of get_products) {
                const item = cart.items.find(
                  (i) => i.product_id === g.product_id
                );
                if (item) {
                  totalDiscount += g.quantity * item.price * repeat;
                } else {
                  // if free product not in cart, still discount equals its value (assuming you get it free)
                  totalDiscount += g.quantity * get_products[0].price * repeat || 0;
                }
              }
              if (totalDiscount > 0) {
                applicableCoupons.push({
                  coupon_id: coupon._id,
                  type,
                  discount: totalDiscount,
                });
              }
            }
            break;
          }
  
          default:
            break;
        }
      }
  
      return res.json({ applicable_coupons: applicableCoupons });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while calculating coupons" });
    }
  };



//apply-coupon

/* 
  Apply the selected coupon and return updated cart with discounted totals
*/


export const applyCouponToCart = async (req, res) => {
    try {
      const { cart } = req.body;
      const couponId = req.params.id;
  
      if (!cart || !Array.isArray(cart.items)) {
        return res.status(400).json({ message: "Invalid cart format" });
      }
  
      const coupon = await Coupon.findById(couponId);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });

      if (isCouponExpired(coupon)) {
        return res.status(400).json({ message: "Coupon is expired" });
    }
  
      let updatedCart = JSON.parse(JSON.stringify(cart)); // deep copy
      let totalDiscount = 0;
  
      switch (coupon.type) {
        case "cart-wise": {
          const cartTotal = calculateCartTotal(cart);
          if (cartTotal > coupon.details.threshold) {
            totalDiscount = (coupon.details.discount / 100) * cartTotal;
          } else {
            return res.status(400).json({
              message: `Cart total must exceed ${coupon.details.threshold}`,
            });
          }
          break;
        }
  
        case "product-wise": {
          const product = updatedCart.items.find(
            (i) => i.product_id === coupon.details.product_id
          );
          if (product) {
            const productDiscount =
              (coupon.details.discount / 100) *
              product.price *
              product.quantity;
            totalDiscount += productDiscount;
            product.total_discount = productDiscount;
          } else {
            return res
              .status(400)
              .json({ message: "Product not found in cart for this coupon" });
          }
          break;
        }
  
        case "bxgy": {
          const { buy_products, get_products, repition_limit } = coupon.details;
          let totalBuyQty = 0;
  
          for (const b of buy_products) {
            const item = updatedCart.items.find(
              (i) => i.product_id === b.product_id
            );
            if (item) totalBuyQty += item.quantity;
          }
  
          const xRequired = buy_products.reduce(
            (sum, b) => sum + b.quantity,
            0
          );
          const repeat = Math.min(
            Math.floor(totalBuyQty / xRequired),
            repition_limit
          );
  
          if (repeat > 0) {
            for (const g of get_products) {
              const existing = updatedCart.items.find(
                (i) => i.product_id === g.product_id
              );
  
              const freeQty = g.quantity * repeat;
              const freeValue =
                existing?.price
                  ? existing.price * freeQty
                  : g.price
                  ? g.price * freeQty
                  : 0;
  
              totalDiscount += freeValue;
  
              if (existing) {
                existing.quantity += freeQty;
                existing.total_discount = (existing.total_discount || 0) + freeValue;
              } else {
                updatedCart.items.push({
                  product_id: g.product_id,
                  quantity: freeQty,
                  price: g.price || 0,
                  total_discount: freeValue,
                });
              }
            }
          } else {
            return res
              .status(400)
              .json({ message: "Cart does not meet Buy X requirement" });
          }
          break;
        }
  
        default:
          return res.status(400).json({ message: "Invalid coupon type" });
      }
  
      const totalPrice = calculateCartTotal(cart);
      const finalPrice = totalPrice - totalDiscount;
  
      return res.json({
        updated_cart: {
          items: updatedCart.items,
          total_price: totalPrice,
          total_discount: totalDiscount,
          final_price: finalPrice,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while applying coupon" });
    }
  };


// helper function

/*
  Calculate total price of cart items
  Coupon expiration check
*/

const calculateCartTotal = (cart) => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
  
  const isCouponExpired = (coupon) => {
    if (!coupon.expiration_date) return false;
  
    const now = new Date();
    const expiry = new Date(coupon.expiration_date);
  
    console.log("Checking expiration:", {
      now: now.toISOString(),
      expiry: expiry.toISOString(),
      expired: expiry < now,
    });
  
    return expiry < now;
  };
  
  
  
