import express from "express";
import { verifyToken, verifyRole } from "../controller/authController.js";
import {
  addProductToCart,
  getLoggedUserCart,
  removeProductFromCart,
  updateProductQuantity,
  applyCoupon
} from "../controller/cartController.js";

const router = express.Router();



// verifyToken, verifyRole

router.use(verifyToken,verifyRole('user'));

router.post("/", addProductToCart);
router.get("/", getLoggedUserCart);
router.patch("/:itemId", updateProductQuantity);
router.delete("/:itemId", removeProductFromCart);

// apply coupon route
router.patch("/coupons/applyCoupon", applyCoupon);

export default router;
