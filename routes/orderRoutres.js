const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Order = require('../models/order');
const ejsPath = require('../helper/ejs-path');

router.get('/create-order', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.session.username }).populate('products.product');

        if (!cart) {
            return res.status(404).send('Cart not found. Add items to your cart first.');
        }

        const cartItems = cart.products;
        res.render(ejsPath('order-form'), { cartItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


router.post('/create-order', async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;

        const username = req.session.username;
        const cart = await Cart.findOne({ user: username }).populate('products.product');

        if (!cart || cart.products.length === 0) {
            return res.status(400).send('Your cart is empty. Add products before placing an order.');
        }

        const cartItems = cart.products.map(item => ({
            product: {
                title: item.product.title,
                _id: item.product._id,
            },
            quantity: item.quantity,
        }));

        const order = new Order({
            firstName,
            lastName,
            phone,
            address,
            cartItems,
            username,
        });
        await order.save();

        cart.products = [];
        await cart.save();

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error, please try again later.');
    }
});

router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.render(ejsPath('orders'), { title: 'All Orders', orders });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.delete('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Order.findByIdAndDelete(id);
        res.redirect('/orders');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


module.exports = router;

module.exports = router;