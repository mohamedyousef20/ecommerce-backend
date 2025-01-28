import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import dotenv from "dotenv";
import Cart from "../models/Cart.js";
import createError from "../utils/errors.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { deleteOne, getAllDocuments, getOne } from "./handler.js";
import { data } from "react-router-dom";

dotenv.config();

export const deleteOrder = deleteOne(Order)


export const cashingOrder = asyncHandler(async (req, res, next) => {
  // maintenance later and make it set by admin
  const textPrice = 0;
  const shippingPrice = 0;
  // get cart by cart id
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new createError(`No cart founded`, 404));
  }
  // get order price by cart price ' check if there is coupon'
  let OrderPrice = 0;
  if (cart.priceAfterDiscount) {
    OrderPrice = cart.priceAfterDiscount;
  } else {
    OrderPrice = cart.totalPrice;
  }
  const totalOrderPrice = OrderPrice + textPrice + shippingPrice;
  // create order with default payment method 'cashing method'
  const order = await Order.create({
    user: req.user._id,
    cartItem: cart.cartItem,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice: totalOrderPrice,
  });
  if (order) {
    // decrement product quantity and increment product sold in product schema
    const bulkOptions = cart.cartItem.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    const product = await Product.bulkWrite(bulkOptions, {});

    // clear the cart of user as is done

    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({ msg: "success", data: order });
});

export const filterObjForLoggedUser = asyncHandler(async (req, res, next) => {

  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});


// cancel order
export const cancelOrder = asyncHandler(async (req, res, next) => {
  console.log(req.body.id, "ddddddddddddddd")
  const { id } = req.body;
  console.log(id)
  const order = await Order.findById(id);
  if (!order) {
    next(new createError('No order found '))
  }
  // get date now
  const currentDate = Date.now();
  // get createAt order to milliseconds
  const orderCreatedAt = order.createdAt.getTime();
  const toDayInMilliseconds = 2 * 24 * 60 * 60 * 1000;



  if (currentDate - orderCreatedAt >= toDayInMilliseconds) {

    order.canCancel = false;

    next(createError('to days left '))

  }

  order.OrderStatus = "canceled";
  order.canCancel = false;
  order.cancelDate = currentDate;

  // delete order after one day
  const orderCancelDate = order.cancelDate.getTime();
  const OneDayInMilliseconds = 1 * 24 * 60 * 60 * 1000;

  if (currentDate - orderCancelDate >= OneDayInMilliseconds) {
    deleteOne(order)
  }

  await order.save();

  res.status(200).json({ msg: "Order canceled successfully" });


})


// active order
export const activeOrder = asyncHandler(async (req, res, next) => {
  console.log('update succ')
  const { id } = req.body;
  console.log(id)
  const order = await Order.findById(id);
  if (!order) {
    next(new createError('No order found '))
  }
  // get date now
  // get createAt order to milliseconds
  const cancelDate = order.cancelDate.getTime();
  const oneDayInMilliseconds = 1 * 24 * 60 * 60 * 1000;



  if (cancelDate - oneDayInMilliseconds >= oneDayInMilliseconds) {


    next(new createError('One days left '))

  }

  order.OrderStatus = "active"; 
  order.canCancel = true;
  await order.save();

  res.status(200).json({ msg: "Order active successfully" });


})


// get all orders 'admin , logged user'
export const getAllOrders = getAllDocuments(Order);

// get specific orders 'admin , logged user'
export const getOrder = getOne(Order);


export const updatedOrderPaymentMethod = asyncHandler(async (req, res, next) => {
  console.log('req of body is', req.body)
  const { id, method } = req.body
  const order = await Order.findOne({ _id: id });
  console.log(order)
  order.paymentMethod = method;
  await order.save();
  res.status(201).json({ msg: "success", data: order });
});


// updated status by admin

export const updatedOrderPaidByAdmin = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id });
  order.isPaid = true;
  order.isPaidAt = Date.now();
  await order.save();
  res.status(201).json({ msg: "success", data: order });
});

export const updatedOrderDeliveredByAdmin = asyncHandler(
  async (req, res, next) => {
    const order = await Order.findOne({ _id: req.params.id });
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    await order.save();
    res.status(201).json({ msg: "success", data: order });
  }
);




const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);  // ⬅ Fix Here!

export const checkOutSession = asyncHandler(async (req, res, next) => {
  const shippingPrice = 70;
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(new createError(`No cart found`, 404));
  }

  let orderPrice = cart.priceAfterDiscount || cart.totalPrice;
  const totalOrderPrice = orderPrice + shippingPrice;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "egp",
            product_data: {
              name: req.user.name,
            },
            unit_amount: totalOrderPrice * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/order`,
      cancel_url: `${req.protocol}://${req.get("host")}/cart`,
      customer_email: req.user.email,
      client_reference_id: cart._id.toString(),
      metadata: req.body.shippingAddress,
    });

    res.status(200).json({ msg: "success", session });
  } catch (error) {
    console.error("Stripe Error:", error);
    next(new createError(`Stripe error: ${error.message}`, 500));
  }
});
