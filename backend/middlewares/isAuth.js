import jwt from 'jsonwebtoken';

const isAuth = async(req,res,next) =>{
    try {
        const token = req.cookies.token 
        if (!token) {
            return res.status(401).json({ message: "Token not Found" });
        }
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = verifyToken.userId

        next()
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Invalid Token" });
    }
}

export default isAuth