const jwt = require('jsonwebtoken');
const secretKey = "coolkey";

function generateAuthToken(userid, admin) {
    const payload = { sub: userid, admin: admin };
    console.log(payload);
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}

/** 
 *  Authentication where userid is stored in the request parameters
*/
function requireAuthenticationParams(req, res, next) {
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');

    const token = authHeaderParts[0] == 'Bearer' ? authHeaderParts[1] : null;

    console.log(token);

    try {
        const payload = jwt.verify(token, secretKey);
        req.user = payload.sub;
        req.admin = payload.admin;
        console.log(payload);
        console.log(`${req.user} | ${req.params.userid}`);

        if (req.user != req.params.userid && !req.admin) {
            res.status(403).json({
                error: "Unauthorized to access the specified resource"
            })
        } else {
            next();
        }
    } catch (err) {
        console.log(err);
        res.status(401).json({
            error: "Invalid authentication token provided."
        });
    }
}

/**
 * Auth is only checked with valid JWT
 */

function requireAuthentication(req, res, next) {
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');

    const token = authHeaderParts[0] == 'Bearer' ? authHeaderParts[1] : null;

    try {
        const payload = jwt.verify(token, secretKey);
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({
            error: "Invalid authentication token provided."
        });
    }
}

/**
 * Non-middleware function that authenticates user permissions based on parameters
 */
function authenticate(userid, req) {
    console.log(userid);
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');

    const token = authHeaderParts[0] == 'Bearer' ? authHeaderParts[1] : null;

    try {
        const payload = jwt.verify(token, secretKey);

        req.user = payload.sub;
        req.admin = payload.admin;

        if (req.user != userid && !req.admin) {
            return false;
        } else {
            return true;
        }
    } catch (err) {
        return false;
    }
}

exports.generateAuthToken = generateAuthToken;
exports.requireAuthenticationParams = requireAuthenticationParams;
exports.requireAuthentication = requireAuthentication;
exports.authenticate = authenticate;