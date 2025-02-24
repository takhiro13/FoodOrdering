const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1, max: 10
    },
}, { timestamps: true });


const productSchema = new Schema({
    text: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String,
    },
    comments: [commentSchema],
    cost: {
        type: Number,
        required: true,
        min: 0,
    },

}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;

