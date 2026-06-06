/**
 * Flash Message Middleware
 *
 * Provides temporary message storage that survives redirects but clears after display.
 * Messages are stored in the session and organized by type (success, error, warning, info).
 *
 * Usage in controllers:
 *   req.flash('success', 'Message text')  // Store a message
 *   req.flash('error')                    // Get all error messages (clears them)
 *   req.flash()                           // Get all messages (clears all)
 */

const flashMiddleware = (req, res, next) => {
    req.flash = function (type, message) {
        // Initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            req.session.flash = { success: [], error: [], warning: [], info: [] };
        }

        // SETTING: two arguments — store a new message
        if (type && message) {
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }
            req.session.flash[type].push(message);
            return;
        }

        // GETTING ONE TYPE: one argument — retrieve and clear that type
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }

        // GETTING ALL: no arguments — retrieve and clear everything
        const allMessages = req.session.flash || { success: [], error: [], warning: [], info: [] };
        req.session.flash = { success: [], error: [], warning: [], info: [] };
        return allMessages;
    };

    next();
};

const flashLocals = (req, res, next) => {
    // Make the flash function available to all EJS templates via res.locals
    // The function is NOT called here — messages are only consumed when a template calls flash()
    res.locals.flash = req.flash.bind(req);
    next();
};

const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;