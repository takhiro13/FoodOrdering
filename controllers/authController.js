const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const JWT_SECRET = "your-secret-key"; // Вынеси в .env

const generateToken = (user) => {
    return jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: "1h" });
};

const registrationGet = (req, res) => {
    const title = 'Register';
    res.render("register", { title });
};

const registrationPost = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.render("error", { title: "Error", message: "Registration failed" });
    }
};

const loginGet = (req, res) => {
    const title = 'Login';
    res.render("login", { title });
};

const loginPost = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: "Пользователь не найден" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Неверный пароль" });

        const token = generateToken(user);
        res.json({ message: "Успешный вход", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
};

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "Требуется токен" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Неверный токен" });
        req.user = decoded;
        next();
    });
};

const logoutGet = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

module.exports = {
    registrationGet,
    registrationPost,
    loginGet,
    loginPost,
    logoutGet,
    verifyToken
};
