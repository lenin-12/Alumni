const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getOrSet, entityKey } = require('../utils/cache');

/
const withId = (user) => ({ ...user, id: String(user._id) });

const protect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Cache user lookup for 60s — stored without password (select: -password default)
        const user = await getOrSet(
            entityKey('user', decoded.id),
            60,
            () => User.findById(decoded.id).select('-password').lean()
        );

        if(!user){
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.user = withId(user);
        next();
    }catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({ success: false, message: 'Access token expired', code: 'TOKEN_EXPIRED' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized, token invalid' });
    }
};

const optionalProtect = async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next();
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        const user = await getOrSet(
            entityKey('user', decoded.id),
            60,
            () => User.findById(decoded.id).select('-password').lean()
        );

        if(user){
            req.user = withId(user);
        }
        next();
    }catch(error){
        next();
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({ success: false, message: 'User role not authorized' });
        }
        next();
    };
};

module.exports = { protect, authorize, optionalProtect };