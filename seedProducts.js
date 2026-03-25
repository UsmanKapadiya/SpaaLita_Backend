const mongoose = require("mongoose");

// 1. Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/spaalita_database")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// 2. Define Product schema
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },

  sku: { type: String, required: true, unique: true, trim: true },

  price: { type: Number, required: true, min: 0 },

  regular_price: { type: String, default: '' },
  sale_price: { type: String, default: '' },

  qty: { type: Number, required: true, min: 0 },

  productImages: [{ type: String }],

  description: { type: String, required: true },
  short_description: { type: String, default: '' },

  // Changed to String because your data uses "18", "41"
  categories: [{ type: String }],

  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  slug: { type: String, default: '' },

  tax_status: { type: String, enum: ['taxable', 'none'], default: 'none' },

  shipping_required: { type: Boolean, default: true },
  shipping_taxable: { type: Boolean, default: false },

  stock_status: { type: String, enum: ['instock', 'outofstock'], default: 'instock' },

  related_ids: [{ type: Number }],

}, { timestamps: true }); // auto createdAt & updatedAt

const Product = mongoose.model("Product", productSchema);


// 3. Your data
const referenceData =[
    {
        "_id": "13462",
        "productName": "JANE IREDALE ColorLuxe Hydrating Cream Lipstick",
        "sku": "JI11812",
        "price": 42,
        "regular_price": "",
        "sale_price": "",
        "qty": 1,
        "productImages": [
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick1-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick3-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick2.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Rosebud-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Poppy1.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Poppy-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Peony-1.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Peony-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Passion-Fruit-1.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Passion-Fruit-scaled.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Mulberry-1.jpg",
            "http://localhost/spaalita/wp-content/uploads/2023/09/JANE-IREDALE-ColorLuxe-Hydrating-Cream-Lipstick-Mulberry-scaled.jpg"
        ],
        "description": "<h4>Introducing NEW ColorLuxe Hydrating Cream Lipstick in 15 rich-yet-weightless, pigment-packed shades that glide on smooth and wrap lips in moisture, for bold payoff and lasting softness.</h4>\n<ul>\n<li>Highly pigmented lip color for bold payoff</li>\n<li>Smooth, satin finish</li>\n<li>Creamy, no-tug texture</li>\n<li>Rich-yet-weightless feel</li>\n</ul>\n",
        "short_description": "<p>COLORLUXE HYDRATING CREAM LIPSTICK IN HIGHLY PIGMENTED SHADES FOR BOLD PAYOFF.</p>\n",
        "categories": [
            "18",
            "41"
        ],
        "status": "active",
        "slug": "jane-iredale-colorluxe-hydrating-cream-lipstick",
        "tax_status": "taxable",
        "shipping_required": true,
        "shipping_taxable": true,
        "stock_status": "instock",
        "related_ids": [],
        "createdAt": "2023-09-10T08:01:21.000Z",
        "updatedAt": "2023-09-10T09:28:03.000Z"
    }
    // remove other Products
]


// 4. Transform Data
const referenceDataWithIds = referenceData.map(product => ({
  _id: new mongoose.Types.ObjectId(),

  productName: product.productName?.trim(),

  sku: product.sku?.trim() || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,

  price: Number(product.price) || 0,

  regular_price: product.regular_price || '',
  sale_price: product.sale_price || '',

  qty: Number(product.qty) || 0,

  productImages: Array.isArray(product.productImages) ? product.productImages : [],

  description: product.description?.trim() || "No description available",
  short_description: product.short_description || '',

  categories: Array.isArray(product.categories) ? product.categories : [],

  status: ['publish', 'active'].includes(product.status) ? 'active' : 'inactive',

  slug: product.slug || '',

  tax_status: product.tax_status || 'none',

  shipping_required: product.shipping_required ?? true,
  shipping_taxable: product.shipping_taxable ?? false,

  stock_status: product.stock_status || 'instock',

  related_ids: Array.isArray(product.related_ids) ? product.related_ids : [],
}));


// 5. Seed database
const seedProducts = async () => {
  try {
    console.log("Seeding started...");

    await Product.deleteMany({});
    console.log("Existing products cleared");

    await Product.insertMany(referenceDataWithIds, { ordered: false });
    console.log("Products seeded successfully");

  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};


// 6. Run Seeder
seedProducts();