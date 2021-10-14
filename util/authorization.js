const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET;

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username
        },
        SECRET_KEY,
        { expiresIn: "1h" }
    );
}
/*
function validateToken(token) {
    if (token) {
        try {
            const user = jwt.verify(token, SECRET_KEY);
            return user;
        } catch (err) {
            throw new Error("Invalid/Expired token");
        }
    }
}
*/

function validateToken(context) {
    const authHeader = context.headers.authorization;
    if (authHeader) {
        const token = authHeader.split("Bearer ")[1];
        if (token) {
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch (err) {
                throw new AuthenticationError("Invalid/Expired token");
            }
        }
        throw new Error("Authorization token must be 'Bearer [token]");
    }
    throw new Error("Authorization header must be provided");
}

module.exports = {
    generateToken,
    validateToken
};
