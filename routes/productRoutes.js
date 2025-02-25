const express = require('express');
const Product = require("../models/product");
const createPath = require("../helper/ejs-path");
const router = express.Router();
const authMiddleware = require('../helper/auth-midl');
const isAuthorMiddleware = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).render(createPath('error'), { title: 'Error', message: 'Product not found' });
        }

        if (product.author === req.session.username) {
            return next();
        }
        return res.status(403).render(createPath('error'), { title: 'Error', message: 'Forbidden: You are not the author of this product' });
    } catch (error) {a
        console.error(error);
        res.status(500).render(createPath('error'), { title: 'Error', message: 'An error occurred' });
    }
};
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });


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

router.get('/products', getProducts);
router.get('/products/search', searchProducts);
router.get('/products/:id', getProductById);
router.delete('/products/:id', authMiddleware, isAuthorMiddleware, deleteProductById);
router.post('/products/:id/comments', authMiddleware, productComment);
router.get('/edit/:id', authMiddleware, isAuthorMiddleware, editProductGet);
router.put('/edit/:id', authMiddleware, isAuthorMiddleware, upload.single('image'), editProductPut);
router.get('/add-product', authMiddleware, addProductGet);
router.post('/add-product', authMiddleware, upload.single('image'), addProductPost);

router.get('/cart', authMiddleware, getCart);
router.post('/cart', authMiddleware, addToCart);
router.put('/cart', authMiddleware, updateCart);
router.delete('/cart', authMiddleware, clearCart);


module.exports = router;