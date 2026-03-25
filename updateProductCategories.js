const mongoose = require("mongoose");

// 1️⃣ Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/spaalita_database")
  .then(() => {
    console.log("MongoDB connected");
    updateProductCategories();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// 2️⃣ Models
const Product = mongoose.model(
  "Product",
  new mongoose.Schema({}, { strict: false })
);
const Category = mongoose.model(
  "Category",
  new mongoose.Schema({}, { strict: false })
);

// 3️⃣ Helper function: flatten category tree
const flattenCategories = (categories) => {
  let result = [];
  categories.forEach((cat) => {
    result.push(cat);
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategories(cat.children));
    }
  });
  return result;
};

// 4️⃣ Main function to update product categories
const updateProductCategories = async () => {
  try {
    console.log("Updating product categories...");

    // 4a. Fetch all categories
    const categoriesData = await Category.find().lean();

    // 4b. Flatten category tree
    const flatCategories = flattenCategories(categoriesData);

    // 4c. Build mapping oId -> _id
    const categoryMap = {};
    flatCategories.forEach((cat) => {
      if (cat.oId) categoryMap[String(cat.oId)] = String(cat._id);
    });
    console.log("Category Map:", categoryMap);

    // 4d. Fetch all products
    const products = await Product.find();

    let updatedCount = 0;

    // 4e. Loop through products
    for (const product of products) {
      if (!product.categories || product.categories.length === 0) continue;

      const oldCategories = product.categories;

      // Map product category oId to MongoDB ObjectId
      const newCategories = product.categories
        .map((catId) => {
          const mapped = categoryMap[String(catId)];
          if (!mapped)
            console.warn(
              `⚠️ Product "${product.productName}" has unmatched category oId: ${catId}`
            );
          return mapped ? new mongoose.Types.ObjectId(mapped) : null; // ✅ Use 'new'
        })
        .filter(Boolean); // remove unmatched

      if (newCategories.length === 0) continue;

      // 4f. Update product in DB
      await Product.updateOne(
        { _id: product._id },
        { $set: { categories: newCategories } }
      );

      console.log("✅ Updated product:", {
        name: product.productName,
        old: oldCategories,
        new: newCategories,
      });

      updatedCount++;
    }

    console.log(`\n🎯 Updated ${updatedCount} products successfully`);
  } catch (err) {
    console.error("Error updating products:", err);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};