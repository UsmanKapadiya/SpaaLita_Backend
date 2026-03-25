const GiftCard = require('../models/GiftCard');
const Category = require("../models/Category"); 


// Add new gift card
const addGiftCard = async (req, res) => {
  try {
    let {
      productName,
      sku,
      price,
      qty,
      description,
      slug,
      regular_price,
      sale_price,
      short_description,
      tax_status,
      shipping_required,
      shipping_taxable,
      stock_status,
      categories,
      related_ids
    } = req.body;

    // ✅ Fix categories parsing (handles all cases)
    categories = categories || req.body["categories[]"] || [];

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = [categories];
      }
    }

    if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // ✅ Required fields check (FIXED)
    if (!productName || !sku || !price || !qty || !description || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    // ✅ SKU check
    const existingProduct = await GiftCard.findOne({ sku });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    // ✅ Images
    const productImages = req.files ? req.files.map(f => f.filename) : [];

    // ✅ Create product
    const giftCard = new GiftCard({
      productName,
      sku,
      price,
      qty,
      description,
      productImages,
      slug: slug || '',
      regular_price: regular_price || '',
      sale_price: sale_price || '',
      short_description: short_description || '',
      tax_status: tax_status || 'none',
      shipping_required: shipping_required !== undefined ? shipping_required : true,
      shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
      stock_status: stock_status || 'instock',
      categories,
      related_ids: related_ids || []
    });

    await giftCard.save();

    res.status(201).json({
      success: true,
      message: "GiftCard created successfully",
      data: giftCard
    });

  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Error creating GiftCard",
      error: error.message
    });
  }
};

// Update gift card
const updateGiftCard = async (req, res) => {
  try {
    let {
      productName,
      sku,
      price,
      qty,
      description,
      slug,
      regular_price,
      sale_price,
      short_description,
      tax_status,
      shipping_required,
      shipping_taxable,
      stock_status,
      categories,
      related_ids,
      existingImages
    } = req.body;

    // ✅ Parse categories (IMPORTANT)
    categories = categories || req.body["categories[]"] || [];

    if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = [categories];
      }
    }

    if (!Array.isArray(categories)) {
      categories = [categories];
    }

    // ✅ Parse existingImages (IMPORTANT)
    if (typeof existingImages === "string") {
      try {
        existingImages = JSON.parse(existingImages);
      } catch {
        existingImages = [existingImages];
      }
    }

    if (!Array.isArray(existingImages)) {
      existingImages = existingImages ? [existingImages] : [];
    }

    // ✅ New uploaded images
    const newImages = req.files ? req.files.map(f => f.filename) : [];

    // ✅ Merge images
    const productImages = [...existingImages, ...newImages];

    // ✅ Update object (clean & controlled)
    const updateData = {
      productName,
      sku,
      price,
      qty,
      description,
      slug: slug || '',
      regular_price: regular_price || '',
      sale_price: sale_price || '',
      short_description: short_description || '',
      tax_status: tax_status || 'none',
      shipping_required: shipping_required !== undefined ? shipping_required : true,
      shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
      stock_status: stock_status || 'instock',
      categories,
      related_ids: related_ids || [],
      productImages
    };

    const updatedProduct = await GiftCard.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "GiftCard not found",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: "GiftCard updated successfully",
      data: updatedProduct
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Error updating giftcard",
      error: error.message
    });
  }
};

// Get all gift cards (active only)
const getGiftCards = async (req, res) => {
  // try {
  //   const { page = 1, limit = 10, search = '' } = req.query;
  //   const query = {
  //     status: { $ne: 'inactive' }
  //   };
  //   if (search) {
  //     query.$or = [
  //       { productName: { $regex: search, $options: 'i' } },
  //       { sku: { $regex: search, $options: 'i' } },
  //       { category: { $regex: search, $options: 'i' } }
  //     ];
  //   }
  //   const skip = (parseInt(page) - 1) * parseInt(limit);
  //   const products = await GiftCard.find(query)
  //     .sort({ createdAt: -1 }) 
  //     .skip(skip)
  //     .limit(parseInt(limit));
  //   const total = await GiftCard.countDocuments(query);
  //   res.status(200).json({
  //     success: true,
  //     data: products,
  //     pagination: {
  //       total,
  //       page: parseInt(page),
  //       limit: parseInt(limit),
  //       pages: Math.ceil(total / parseInt(limit))
  //     }
  //   });
  // } catch (error) {
  //   res.status(500).json({ success: false, message: 'Error fetching gift cards', error: error.message });
  // }
  try {
      const { page = 1, limit = 10, search = '', sort = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      // Fetch and flatten all categories (to map later)
      const allCategories = await Category.find().lean();
      const flatCategories = flattenCategoriesTree(allCategories);
  
      // Build aggregation pipeline
      const pipeline = [
        { $match: { status: { $ne: 'inactive' }, productImages: { $exists: true, $ne: [] } } },
  
        // Lookup categories
        {
          $lookup: {
            from: 'categories',
            localField: 'categories',
            foreignField: '_id',
            as: 'categories'
          }
        },
      ];
  
      // Apply search if provided
      if (search) {
        const regex = new RegExp(search, 'i');
        pipeline.push({
          $match: {
            $or: [
              { productName: regex },
              { sku: regex },
              { 'categories.name': regex }
            ]
          }
        });
      }
  
      // Count total after search
      const totalResult = await GiftCard.aggregate([...pipeline, { $count: 'total' }]);
      const total = totalResult[0]?.total || 0;
  
      // Apply sorting
      pipeline.push({ $sort: getSortOption(sort) });
  
      // Pagination
      pipeline.push({ $skip: skip }, { $limit: parseInt(limit) });
  
      // Project fields
      pipeline.push({
        $project: {
          productName: 1,
          sku: 1,
          price: 1,
          regular_price: 1,
          sale_price: 1,
          qty: 1,
          productImages: 1,
          description: 1,
          short_description: 1,
          status: 1,
          categories: { _id: 1, name: 1, slug: 1 },
          slug: 1,
          stock_status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      });
  
      // Execute aggregation
      let products = await GiftCard.aggregate(pipeline);
  
      // Map all categories using flattened tree to ensure **all parent & child categories appear**
      products = products.map(product => {
        const productCategories = [];
        if (Array.isArray(product.categories)) {
          product.categories.forEach(cat => {
            // Find in flatCategories using _id
            const found = flatCategories.find(c => c._id === String(cat._id));
            if (found && !productCategories.find(pc => pc._id === found._id)) {
              productCategories.push(found);
            }
          });
        }
        return { ...product, categories: productCategories };
      });
  
      // Return response
      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
  
    } catch (error) {
      console.error("Error fetching giftCard:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching giftCard",
        error: error.message
      });
    }
};

function flattenCategoriesTree(categories) {
  const result = [];
  categories.forEach(cat => {
    result.push({ _id: String(cat._id), name: cat.name, slug: cat.slug });
    if (cat.children && cat.children.length > 0) {
      cat.children.forEach(child => {
        result.push({ _id: String(child._id), name: child.name, slug: child.slug });
      });
    }
  });
  return result;
}

// Helper: get sort option
function getSortOption(sort) {
  switch (sort) {
    case 'latest': return { createdAt: -1 };
    case 'price_low_high': return { price: 1 };
    case 'price_high_low': return { price: -1 };
    case 'popular': return { soldCount: -1 };
    case 'recommended': return { rating: -1 };
    default: return { createdAt: -1 };
  }
}

// Get single gift card
const getGiftCard = async (req, res) => {
  try {
     const { id } = req.params;
 
     // 1 Fetch product
     const product = await GiftCard.findById(id).lean();
     if (!product) {
       return res.status(404).json({ success: false, message: "GiftCard not found" });
     }
 
     // 2 Fetch all categories and flatten them
     const allCategories = await Category.find().lean();
     const flatCategories = flattenCategoriesTree(allCategories);
 
     // 3 Map product category IDs to actual category objects
     const productCategories = [];
     const missingCategories = [];
 
     if (Array.isArray(product.categories)) {
       product.categories.forEach(catId => {
         const found = flatCategories.find(c => c._id === String(catId));
         if (found) {
           productCategories.push(found);
         } else {
           missingCategories.push(catId);
         }
       });
     }
 
     // 4 Log missing categories
     if (missingCategories.length > 0) {
       console.warn(`Product "${product.productName}" has missing categories:`, missingCategories);
     }
 
     // 5 Attach populated categories
     product.categories = productCategories;
 
     //6 Return product details
     return res.status(200).json({
       success: true,
       data: product,
     });
 
   } catch (error) {
     console.error("Error fetching GiftCard details:", error);
     return res.status(500).json({
       success: false,
       message: "Error fetching GiftCard details",
       error: error.message
     });
   }
};

// Delete gift card (soft delete)
const deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    res.status(200).json({ success: true, message: 'Gift Card deleted (status set to inactive)' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting gift card', error: error.message });
  }
};

// Get related gift cards (same category, exclude self, only active)
const getRelatedGiftCards = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);
    if (!giftCard || giftCard.status === 'inactive') {
      return res.status(404).json({ success: false, message: 'Gift card not found' });
    }
    const related = await GiftCard.find({
      _id: { $ne: id },
      category: giftCard.category,
      status: { $ne: 'inactive' }
    }).limit(4);
    res.status(200).json({ success: true, data: related });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching related gift cards', error: error.message });
  }
};

module.exports = {
  addGiftCard,
  updateGiftCard,
  deleteGiftCard,
  getGiftCards,
  getGiftCard,
  getRelatedGiftCards,
};
