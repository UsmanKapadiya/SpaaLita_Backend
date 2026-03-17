const mongoose = require('mongoose');

const childCategorySchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    image: {
        id: Number,
        src: String
    },
    count: { type: Number, default: 0 },
    children: [this], // recursive children
}, { _id: false }); // child _id handled manually

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
     image: {
        id: Number,
        src: String
    },
    count: { type: Number, default: 0 },
    children: [childCategorySchema],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // optional parent
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);