

const authMiddleware = (req, res, next) => {
    if (req.session && req.session.username) {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authMiddleware;