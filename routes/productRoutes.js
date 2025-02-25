const express = require('express');
const Product = require("../models/product");
const createPath = require("../helper/ejs-path");
const router = express.Router();
const { verifyToken } = require('../controllers/authController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const isAuthorMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).render(createPath('error'), { title: 'Error', message: 'Product not found' });
        }

        if (product.author === req.user.username) {
            return next();
        }
        return res.status(403).render(createPath('error'), { title: 'Error', message: 'Forbidden: You are not the author of this product' });
    } catch (error) {
        console.error(error);
        res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred' });
    }
};

const {
    getProducts,
    getProductById,
    deleteProductById,
    editProductGet,
    editProductPut,
    productComment,
    addProductGet,
    addProductPost,
    searchProducts,
    getCart,
    addToCart,
    updateCart,
    clearCart,
} = require('../controllers/productController');

router.get('/products', verifyToken, getProducts);
router.get('/products/search', verifyToken, searchProducts);
router.get('/products/:id', verifyToken, getProductById);
router.delete('/products/:id', verifyToken, isAuthorMiddleware, deleteProductById);
router.post('/products/:id/comments', verifyToken, productComment);
router.get('/edit/:id', verifyToken, isAuthorMiddleware, editProductGet);
router.put('/edit/:id', verifyToken, isAuthorMiddleware, upload.single('image'), editProductPut);
router.get('/add-product', verifyToken, addProductGet);
router.post('/add-product', verifyToken, upload.single('image'), addProductPost);

router.get('/cart', verifyToken, getCart);
router.post('/cart', verifyToken, addToCart);
router.put('/cart', verifyToken, updateCart);
router.delete('/cart', verifyToken, clearCart);

module.exports = router;
