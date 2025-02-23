import mongoose from "mongoose";
import { type } from "os";

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User must be contained"],
    },
    cartItem: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        price: Number,
        quantity: Number,
        color: [String],
      },
    ],
    shippingAddress: {

      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      }, street: {
        type: String,
        required: true
      }
    },
    textPrice: Number,
    shippingPrice: {
      type: Number,
      default: false,
    },
    totalOrderPrice: Number,

    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    paymentMethod: {
      type: String,
      enum: ["card", "cash"],
      default: "cash",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isPaidAt: {
      type: Date,

    },

    OrderStatus :{
      type:String,
      enum: ["active", "canceled"],
      default: "active",

    },
    canCancel :{
      type:Boolean,
      default: true,

    },

    cancelDate:{
      type:Date,
    }
  
  },
  { timestamps: true }
);

OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email profileImg phone",
  }).populate({
    path: "cartItem.product",
    select: "name "
  }
  );
  next();
});


export default mongoose.model('Order', OrderSchema)