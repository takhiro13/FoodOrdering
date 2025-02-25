const express = require('express');
const router = express.Router();

const {
    registrationGet,
    registrationPost,
    loginGet,
    loginPost,
    logoutGet,
    verifyToken,
} = require('../controllers/authController');

router.get('/register', registrationGet);
router.post('/register', registrationPost);
router.get('/login', loginGet);
router.post('/login', loginPost);
router.get('/logout', logoutGet);

// Защищенный маршрут (пример)
router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: "Доступ разрешен", user: req.user });
});

module.exports = router;
