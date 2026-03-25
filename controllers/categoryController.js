const Category = require('../models/Category');
const mongoose = require('mongoose');

const addCategory = async (req, res) => {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.image = `/uploads/categories/${req.file.filename}`;
        } else if (data.image && typeof data.image === 'object') {
            data.image = data.image.src;
        }

        let parent = null;

        // Check if this category has a parent
        if (data.parentId && data.parentId !== 'none') {
            parent = await Category.findById(data.parentId);
            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: 'Parent category not found'
                });
            }
            data.depth = (parent.depth || 0) + 1;

            // Only push child inside parent's children array
            const child = {
                _id: new mongoose.Types.ObjectId(),
                name: data.name,
                slug: data.slug,
                description: data.description || '',
                image: data.image || null,
                count: data.count || 0,
                children: []
            };
            parent.children.push(child);
            await parent.save();

            return res.status(201).json({
                success: true,
                message: 'Child category added successfully',
                data: child,
            });

        } else {
            // No parent → root category → save in collection
            data.depth = 0;
            data.parentId = null;

            const category = new Category(data);
            const savedCategory = await category.save();

            return res.status(201).json({
                success: true,
                message: 'Category added successfully',
                data: savedCategory,
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error adding category',
            error: error.message,
        });
    }
};


const updateCategory = async (req, res) => {
    try {
        // Extract categoryId
        const { id: categoryId } = req.params;
        const data = { ...req.body };

        // Handle uploaded image
        if (req.file) {
            data.image = `/uploads/categories/${req.file.filename}`;
        } else if (data.image && typeof data.image === 'object') {
            data.image = data.image.src;
        }

        // 1️⃣ Try to find as root category
        let category = await Category.findById(categoryId);

        if (category) {
            // Update root fields
            category.name = data.name ?? category.name;
            category.slug = data.slug ?? category.slug;
            category.description = data.description ?? category.description;
            category.image = data.image ?? category.image;
            category.count = data.count ?? category.count;

            // Handle parent change
            if (data.parentId) {
                if (data.parentId === 'none') {
                    // Already root, just update
                    const updatedCategory = await category.save();
                    return res.status(200).json({
                        success: true,
                        message: 'Category updated successfully as root',
                        data: updatedCategory,
                    });
                } else {
                    // Move root → new parent
                    const newParent = await Category.findById(data.parentId);
                    if (!newParent) {
                        return res.status(404).json({ success: false, message: 'New parent not found' });
                    }

                    // Delete root category
                    await category.deleteOne();

                    const child = {
                        _id: category._id,
                        name: category.name,
                        slug: category.slug,
                        description: category.description,
                        image: category.image,
                        count: category.count,
                        children: category.children || [],
                    };

                    newParent.children.push(child);
                    await newParent.save();

                    return res.status(200).json({
                        success: true,
                        message: 'Category moved under new parent successfully',
                        data: child,
                    });
                }
            }

            // No parent change, just save
            const updatedCategory = await category.save();
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory,
            });
        }

        // 2️⃣ Try to find as child category
        const parent = await Category.findOne({ 'children._id': categoryId });
        if (!parent) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const child = parent.children.find(c => c._id.toString() === categoryId);
        if (!child) {
            return res.status(404).json({ success: false, message: 'Child category not found' });
        }

        // Update child fields
        child.name = data.name ?? child.name;
        child.slug = data.slug ?? child.slug;
        child.description = data.description ?? child.description;
        child.image = data.image ?? child.image;
        child.count = data.count ?? child.count;

        // Handle parent change
        if (data.parentId) {
            if (data.parentId === 'none') {
                // Move child to root
                parent.children = parent.children.filter(c => c._id.toString() !== categoryId);
                await parent.save();

                const newRoot = new Category({
                    _id: child._id,
                    name: child.name,
                    slug: child.slug,
                    description: child.description,
                    image: child.image,
                    count: child.count,
                    children: child.children || [],
                });
                await newRoot.save();

                return res.status(200).json({
                    success: true,
                    message: 'Child category moved to root successfully',
                    data: newRoot,
                });
            } else if (data.parentId !== parent._id.toString()) {
                // Move child → new parent
                const newParent = await Category.findById(data.parentId);
                if (!newParent) {
                    return res.status(404).json({ success: false, message: 'New parent not found' });
                }

                parent.children = parent.children.filter(c => c._id.toString() !== categoryId);
                await parent.save();

                newParent.children.push(child);
                await newParent.save();

                return res.status(200).json({
                    success: true,
                    message: 'Child category moved under new parent successfully',
                    data: child,
                });
            }
        }

        // No parent change, just save updates
        await parent.save();
        return res.status(200).json({
            success: true,
            message: 'Child category updated successfully',
            data: child,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message,
        });
    }
};

//  Get All Categories
const getAllCategories = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = '' } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const regex = search ? new RegExp(search, 'i') : null;

        let categories;

        if (regex) {
            // Aggregation to filter children
            categories = await Category.aggregate([
                {
                    $match: {
                        $or: [
                            { name: { $regex: regex } },
                            { 'children.name': { $regex: regex } },
                        ],
                    },
                },
                {
                    $project: {
                        name: 1,
                        slug: 1,
                        description: 1,
                        image: 1,
                        count: 1,
                        children: {
                            $filter: {
                                input: '$children',
                                as: 'child',
                                cond: { $regexMatch: { input: '$$child.name', regex: regex } },
                            },
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit },
            ]);
        } else {
            // No search → fetch normally
            categories = await Category.find({})
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
        }

        const total = await Category.countDocuments(
            regex
                ? { $or: [{ name: { $regex: regex } }, { 'children.name': { $regex: regex } }] }
                : {}
        );

        res.status(200).json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message,
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID'
            });
        }

        const objectId = new mongoose.Types.ObjectId(id);

        // 1. Try parent
        const category = await Category.findById(objectId);

        if (category) {
            return res.status(200).json({
                success: true,
                message: 'Category fetched successfully',
                data: category
            });
        }

        const result = await Category.aggregate([
            {
                $match: {
                    "children._id": objectId
                }
            },
            {
                $unwind: "$children"
            },
            {
                $match: {
                    "children._id": objectId
                }
            },
            {
                $addFields: {
                    "children.parentId": "$_id"
                }
            },
            {
                $replaceRoot: {
                    newRoot: "$children"
                }
            }
        ]);

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Child category fetched successfully',
            data: result[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category',
            error: error.message
        });
    }
};




const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Try deleting root category
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (deletedCategory) {
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        }

        // 2️⃣ Try deleting child category
        const parent = await Category.findOne({ 'children._id': id });
        if (!parent) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        // Remove child safely
        parent.children = parent.children.filter(c => c._id.toString() !== id);
        await parent.save();

        return res.status(200).json({
            success: true,
            message: 'Child category deleted successfully',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message,
        });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
};