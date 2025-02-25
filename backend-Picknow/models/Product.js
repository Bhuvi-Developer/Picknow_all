import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: true,
    },
    pShortDescription: {
      type: String,
      required: true,
    },
    pDescription: {
      type: String,
      required: true,
    },
    pPrice: {
      type: Number,
      required: true,
      min: [0, 'Price must be greater than 0']
    },
    pPreviousPrice: {
      type: Number,
      default: 0,
      min: [0, 'Previous price must be greater than or equal to 0']
    },
    pSold: {
      type: Number,
      default: 0,
    },
    pQuantity: {
      type: String,
      required:true,
    },
    pCategory: {
      type: String,
      required: true,
    },
    pSubCategory: {
      type: String,
      required: true,
    },
    pNestedSubCategory: {
      type: String,
      required: false
    },
    pStock: {
      type: Number,
      required: true,
      min: [0, 'Stock must be greater than or equal to 0']
    },
    pImage: {
      type: Array,
      required: true,
    },
    pBrand: {
      type: String,
      required: true,
    },
    pOffer: {
      type: String,
      required: true,
    },
    pTax: {
      type: Number,
      required: true,
      min: [0, 'Tax must be greater than or equal to 0']
    },
    pRatingsReviews: [
      {
        review: String,
        user: { type: ObjectId, ref: "User" },
        rating: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    pStatus: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("products", productSchema);
export default productModel;
