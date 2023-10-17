const { showServerErrorPage, showUnauthorizedUserPage } = require("../helpers/showErrorPages");

const isAuthenticated = async (req, res, next) => {
    try {
        // Check if session exists and user is authenticated
        if ( req.session.authenticated === true ) {
            req.session.lang = "hu";
            return next();  // User is authenticated, proceed to the next middleware
        }
        else {
            return showUnauthorizedUserPage(req, res);
        }
    }
    catch (error) {
        return showServerErrorPage(req, res);
    }
};

module.exports = isAuthenticated;
