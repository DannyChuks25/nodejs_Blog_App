// Middleware to check token
const authMiddleware = (req, res, next) => {
    // const token = req.headers.authorization?.split(" ")[1];
    const token = req.cookies.token;
    if(!token){
        return res.status(404).json({ error: "Invalid Token Found!"})
    }
    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch(error){
        res.status(401).json({ error: "Invalid Token" });
    }
}

module.exports = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect("/login");
};
