import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

 const auth = (req,res, next)=> {
    const authHeader = req.header('Authorization')
    if(!authHeader){
        return res.status(401).json({ error: 'ไม่พบ Authorization' });
    }
    const token = authHeader.replace('Bearer', '').trim();
    if(!token){
        return res.status(401).json({ error: 'ไม่พบ Token' });
    }
    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET )
        req.user = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ error: 'Token is not valid' });
    }
}

export default auth