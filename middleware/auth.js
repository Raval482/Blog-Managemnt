const jwt = require("jsonwebtoken");
const { secrateKey } = require("../key/secrate");
const UserModal = require("../model/UserModal")

const auth = async (req, res, next) => {
    let token = req?.body?.token || req?.query?.token || req?.headers["authorization"] ;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }


    try {
        const decoded = await jwt.verify(token, secrateKey.key);
        const userData = await UserModal.findOne({_id : decoded.id})
        req.user = userData 
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
}

module.exports = auth;
