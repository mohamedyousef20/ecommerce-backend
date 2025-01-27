import express from "express";
import { verifyToken, verifyRole } from "../controller/authController.js";
import {
  cashingOrder,
  getAllOrders,
  getOrder,
  filterObjForLoggedUser,
  updatedOrderPaidByAdmin,
  updatedOrderDeliveredByAdmin,
  checkOutSession,
  cancelOrder,
  updatedOrderPaymentMethod,
  deleteOrder
} from "../controller/orderController.js";
import getOrderValidator from '../utils/validator/orderValidator.js'

const router = express.Router();
router.post("/cancel", cancelOrder);

router.get("/check-out-session/:cartId", verifyToken, checkOutSession);

router.post("/:cartId", verifyToken, cashingOrder);

router.patch("/pay/method", verifyToken, updatedOrderPaymentMethod);



router.use(verifyToken, verifyRole('user', 'admin'));
router.get("/", filterObjForLoggedUser, getAllOrders);
router.get("/:id", getOrderValidator, getOrder);


//verifyToken



router.use(verifyToken, verifyRole("admin"));
router.patch("/:id/pay", updatedOrderPaidByAdmin);
router.patch("/:id/deliver", updatedOrderDeliveredByAdmin);
router.delete("/:id", deleteOrder);
export default router;
