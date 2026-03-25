const mongoose = require('mongoose');


const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    regular_price: { type: String, default: '' },
    sale_price: { type: String, default: '' },
    qty: { type: Number, required: true },
    productImages: [{ type: String }],
    description: { type: String, required: true },
    short_description: { type: String, default: '' },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
      }
    ],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    slug: { type: String, default: '' },
    tax_status: { type: String, enum: ['taxable', 'none'], default: 'none' },
    shipping_required: { type: Boolean, default: true },
    shipping_taxable: { type: Boolean, default: false },
    stock_status: { type: String, enum: ['instock', 'outofstock'], default: 'instock' },
    related_ids: [{ type: Number }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
