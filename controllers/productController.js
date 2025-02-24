const Product = require("../models/product");
const Cart = require('../models/cart');
const ejsPath = require("../helper/ejs-path");


const getProducts = async  (req, res) => {
    const title = 'Menu';
    const username = req.session.username;

    try {
        const products = await Product.find().sort({ createdAt: -1 });

        const productsWithRatings = products.map(product => {
            const totalRatings = product.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
            const averageRating = product.comments.length ? (totalRatings / product.comments.length).toFixed(1) : 'No ratings yet';

            return {
                ...product.toObject(),
                averageRating
            };
        });

        res.render(ejsPath('products'), { products: productsWithRatings, title, username });
    } catch (error) {
        console.error(error);
        res.render(ejsPath('error'), { title: 'Error', message: 'Failed to load products' });
    }
}
const getProductById = async (req, res) => {
    const title = 'Product';

    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render(ejsPath('error'), { title: 'Error', message: 'Product not found' });
        }

        const totalRatings = product.comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = product.comments.length ? (totalRatings / product.comments.length).toFixed(1) : 'No ratings yet';

        res.render(ejsPath('product'), {
            product,
            title,
            username: req.session.username,
            averageRating
        });
    } catch (error) {
        console.error(error);
        res.status(500).render(ejsPath('error'), { title: 'Error', message: 'Product not found' });
    }
}
const deleteProductById = (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(() => res.redirect(`/products/`))
        .catch((error) => {
            console.log(error);
            res.render(ejsPath('error'), { title: 'Error' });
        });
}
const productComment = async (req, res) => {
    try {
        const { text, rating } = req.body;

        if (!text) {
            return res.status(400).send('Comment text is required');
        }
        if (!rating || rating < 1 || rating > 10) {
            return res.status(400).send('Rating must be a number between 1 and 10');
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.comments.push({
            text,
            author: req.session.username,
            rating
        });
        await product.save();

        res.redirect(`/products/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).render(ejsPath('error'), { title: 'Error', message: 'Failed to add comment' });
    }
}
const editProductGet = (req, res) => {
    const title = 'Edit Product';

    Product.findById(req.params.id)
        .then((product) => res.render(ejsPath('edit-product'), { product, title }))
        .catch((error) => {
            console.log(error);
            res.render(ejsPath('error'), { title: 'Error' });
        });
}
const editProductPut = async (req, res) => {
    const { title, text, cost} = req.body;

    try {
        const productData = {
            title,
            text,
            cost,
        };

        if (req.file) {
            productData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        await Product.findByIdAndUpdate(req.params.id, productData);
        res.redirect(`/products/${req.params.id}`);
    } catch (error) {
        console.error(error);
        res.render(ejsPath('error'), { title: 'Error', message: 'Failed to update product' });
    }
}
const addProductGet  = (req, res) => {
    const title = 'Add Product';
    res.render(ejsPath('add-product'), { title });
}
const addProductPost = async (req, res) => {
    const { title, text, cost } = req.body;

    try {
        const productData = {
            title,
            text,
            cost,
            author: req.session.username, // Track which user added this product
        };

        if (req.file) {
            productData.image = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        const newProduct = new Product(productData);
        await newProduct.save();

        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.status(500).render(ejsPath('error'), { title: 'Error', message: 'Failed to add product' });
    }
};

const searchProducts = async (req, res) => {
    const { search } = req.query;
    const title = 'Search Results';
    const username = req.session.username;

    try {
        const products = await Product.find({ title: { $regex: search, $options: 'i' } });

        const productsWithRatings = products.map(product => {
            const totalRatings = product.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
            const averageRating = product.comments.length ? (totalRatings / product.comments.length).toFixed(1) : 'No ratings yet';

            return {
                ...product.toObject(),
                averageRating
            };
        });

        res.render(ejsPath('products'), { products: productsWithRatings, title, username });
    } catch (error) {
        console.error(error);
        res.render(ejsPath('error'), { title: 'Error', message: 'Failed to search products' });
    }
};


const getCart = async (req, res) => {
    const title = 'Your Cart';
    const username = req.session.username;

    try {
        const cart = await Cart.findOne({ user: req.session.username }).populate('products.product');
        if (!cart) {
            return res.render(ejsPath('cart'), { title, username, products: [], totalCost: 0 });
        }

        const productsWithDetails = cart.products.map(item => ({
            product: item.product,
            quantity: item.quantity,
            subtotal: item.product.cost * item.quantity
        }));

        const totalCost = productsWithDetails.reduce((sum, item) => sum + item.subtotal, 0);
        res.render(ejsPath('cart'), { title, username, products: productsWithDetails, totalCost });
    } catch (error) {
        console.error(error);
        res.status(500).render(ejsPath('error'), { title: 'Error', message: 'Failed to load cart' });
    }
};
const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        const username  = (req.session.username);


        let cart = await Cart.findOne({ user : username });
        if (!cart) {
            cart = await Cart.create({ user: username, products: [] });
        }

        const existingProductIndex = cart.products.findIndex(item => item.product.equals(productId));
        if (existingProductIndex > -1) {
            cart.products[existingProductIndex].quantity += parseInt(quantity, 10);
        } else {
            cart.products.push({ product: productId, quantity: parseInt(quantity, 10) });
        }

        await cart.save();
        res.redirect('/cart');
    } catch (error) {
        console.error(error);
        res.status(500).render(ejsPath('error'), { title: 'Error', message: 'Failed to add product to cart' });
    }
};

const updateCart = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Лог входящих данных
        const { productId, quantity } = req.body;
        const username = req.session.username;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).send("Invalid product data received.");
        }

        const cart = await Cart.findOne({ user: username });
        if (!cart) {
            return res.status(404).send("Cart not found.");
        }

        console.log('Cart before update:', cart.products);

        const productIndex = cart.products.findIndex((item) => item.product.toString() === productId);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity = quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        console.log('Cart after update:', cart.products);

        res.status(200).send("Cart updated successfully.");
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).send("Failed to update cart.");
    }
};
const clearCart = async (req, res) => {
    try {
        const { username } = req.session;
        const cart = await Cart.findOne({ user: username });

        if (!cart) {
            return res.status(404).render(ejsPath('error'), {
                title: 'Error',
                message: 'Cart not found'
            });
        }

        cart.products = [];
        await cart.save();

        res.redirect('/cart');
    } catch (err) {
        console.error(err);
        res.status(500).render(ejsPath('error'), {
            title: 'Error',
            message: 'Failed to clear cart'
        });
    }
};


module.exports = {
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
}
