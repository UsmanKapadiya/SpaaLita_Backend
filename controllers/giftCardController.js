const GiftCard = require('../models/GiftCard');
const Category = require("../models/Category");
const { normalizeProductImage } = require('../utils/normalizeImage');



// Add new gift card
// const addGiftCard = async (req, res) => {
//   try {
//     let {
//       productName,
//       sku,
//       price,
//       qty,
//       description,
//       slug,
//       regular_price,
//       sale_price,
//       short_description,
//       tax_status,
//       shipping_required,
//       shipping_taxable,
//       stock_status,
//       categories,
//       related_ids
//     } = req.body;

//     // ✅ Fix categories parsing (handles all cases)
//     categories = categories || req.body["categories[]"] || [];

//     if (typeof categories === "string") {
//       try {
//         categories = JSON.parse(categories);
//       } catch {
//         categories = [categories];
//       }
//     }

//     if (!Array.isArray(categories)) {
//       categories = [categories];
//     }

//     // ✅ Required fields check (FIXED)
//     if (!productName || !sku || !price || !qty || !description || categories.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "All required fields must be provided"
//       });
//     }

//     // ✅ SKU check
//     const existingProduct = await GiftCard.findOne({ sku });
//     if (existingProduct) {
//       return res.status(409).json({
//         success: false,
//         message: "SKU already exists"
//       });
//     }

//     // ✅ Images
//     const productImages = req.files ? req.files.map(f => f.filename) : [];

//     // ✅ Create product
//     const giftCard = new GiftCard({
//       productName,
//       sku,
//       price,
//       qty,
//       description,
//       productImages,
//       slug: slug || '',
//       regular_price: regular_price || '',
//       sale_price: sale_price || '',
//       short_description: short_description || '',
//       tax_status: tax_status || 'none',
//       shipping_required: shipping_required !== undefined ? shipping_required : true,
//       shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
//       stock_status: stock_status || 'instock',
//       categories,
//       related_ids: related_ids || []
//     });

//     await giftCard.save();

//     res.status(201).json({
//       success: true,
//       message: "GiftCard created successfully",
//       data: giftCard
//     });

//   } catch (error) {
//     console.error("ERROR:", error);

//     res.status(500).json({
//       success: false,
//       message: "Error creating GiftCard",
//       error: error.message
//     });
//   }
// };

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

    if (!productName || !sku || !price || !qty || !description || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const exists = await GiftCard.findOne({ sku });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "SKU already exists"
      });
    }

    // ✅ STORE ONLY PATH (NO BASE URL)
    const productImages = req.files
      ? req.files.map(f => `giftcards/${f.filename}`)
      : [];

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
      shipping_required: shipping_required ?? true,
      shipping_taxable: shipping_taxable ?? false,
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
    res.status(500).json({
      success: false,
      message: "Error creating GiftCard",
      error: error.message
    });
  }
};

// Update gift card
// const updateGiftCard = async (req, res) => {
//   try {
//     let {
//       productName,
//       sku,
//       price,
//       qty,
//       description,
//       slug,
//       regular_price,
//       sale_price,
//       short_description,
//       tax_status,
//       shipping_required,
//       shipping_taxable,
//       stock_status,
//       categories,
//       related_ids,
//       existingImages
//     } = req.body;

//     // ✅ Parse categories (IMPORTANT)
//     categories = categories || req.body["categories[]"] || [];

//     if (typeof categories === "string") {
//       try {
//         categories = JSON.parse(categories);
//       } catch {
//         categories = [categories];
//       }
//     }

//     if (!Array.isArray(categories)) {
//       categories = [categories];
//     }

//     // ✅ Parse existingImages (IMPORTANT)
//     if (typeof existingImages === "string") {
//       try {
//         existingImages = JSON.parse(existingImages);
//       } catch {
//         existingImages = [existingImages];
//       }
//     }

//     if (!Array.isArray(existingImages)) {
//       existingImages = existingImages ? [existingImages] : [];
//     }

//     // ✅ New uploaded images
//     const newImages = req.files ? req.files.map(f => f.filename) : [];

//     // ✅ Merge images
//     const productImages = [...existingImages, ...newImages];

//     // ✅ Update object (clean & controlled)
//     const updateData = {
//       productName,
//       sku,
//       price,
//       qty,
//       description,
//       slug: slug || '',
//       regular_price: regular_price || '',
//       sale_price: sale_price || '',
//       short_description: short_description || '',
//       tax_status: tax_status || 'none',
//       shipping_required: shipping_required !== undefined ? shipping_required : true,
//       shipping_taxable: shipping_taxable !== undefined ? shipping_taxable : false,
//       stock_status: stock_status || 'instock',
//       categories,
//       related_ids: related_ids || [],
//       productImages
//     };

//     const updatedProduct = await GiftCard.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({
//         success: false,
//         message: "GiftCard not found",
//         data: null
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "GiftCard updated successfully",
//       data: updatedProduct
//     });

//   } catch (error) {
//     console.error("UPDATE ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating giftcard",
//       error: error.message
//     });
//   }
// };

const safeCategories = (categories) => {
  if (!categories) return [];

  try {
    if (typeof categories === "string") {
      categories = JSON.parse(categories);
    }
  } catch {
    categories = [categories];
  }

  if (!Array.isArray(categories)) {
    categories = [categories];
  }

  return categories
    .filter(id => id && id !== "undefined")
    .map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

const updateGiftCard = async (req, res) => {
  try {
    let {
      existingImages = [],
      categories
    } = req.body;

    // ========================
    // FIX CATEGORIES (IMPORTANT)
    // ========================
    categories = safeCategories(categories);

    // ========================
    // FIX EXISTING IMAGES
    // ========================
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

    // ========================
    // NEW IMAGES
    // ========================
    const newImages = req.files
      ? req.files.map(f => `giftcards/${f.filename}`)
      : [];

    const productImages = [...existingImages, ...newImages];

    // ========================
    // CLEAN UPDATE DATA (NO RAW req.body SPREAD)
    // ========================
    const updateData = {
      productName: req.body.productName,
      sku: req.body.sku,
      price: req.body.price,
      qty: req.body.qty,
      description: req.body.description,
      slug: req.body.slug,
      regular_price: req.body.regular_price,
      sale_price: req.body.sale_price,
      short_description: req.body.short_description,
      tax_status: req.body.tax_status,
      shipping_required: req.body.shipping_required,
      shipping_taxable: req.body.shipping_taxable,
      stock_status: req.body.stock_status,
      related_ids: req.body.related_ids || [],
      categories,
      productImages
    };

    const updated = await GiftCard.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "GiftCard not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "GiftCard updated successfully",
      data: updated
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating GiftCard",
      error: error.message
    });
  }
};

// Get all gift cards (active only)
const getGiftCards = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    const query = { status: { $ne: 'inactive' } };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { productName: regex },
        { sku: regex }
      ];
    }

    const total = await GiftCard.countDocuments(query);

    let giftCards = await GiftCard.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    giftCards = giftCards.map(item => ({
      ...item,

      // ✅ FIX DUPLICATE URL ISSUE
      productImages: Array.isArray(item.productImages)
        ? item.productImages.map(img =>
            normalizeProductImage(img, 'giftcards')
          )
        : []
    }));

    res.status(200).json({
      success: true,
      data: giftCards,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching gift cards",
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
    const product = await GiftCard.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "GiftCard not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...product,

        productImages: Array.isArray(product.productImages)
          ? product.productImages.map(img =>
              normalizeProductImage(img, 'giftcards')
            )
          : []
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching GiftCard",
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
