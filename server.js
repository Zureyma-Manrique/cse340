import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import session from 'express-session';
import { testConnection } from './src/models/db.js';
import router from './src/routes.js';
import flash from './src/middleware/flash.js';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Session management (must come before flash middleware)
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Flash message middleware (must come after session)
app.use(flash);

// Parse POST request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Log all incoming requests in development
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// Make NODE_ENV, isLoggedIn, and user available to all templates
app.use((req, res, next) => {
    res.locals.NODE_ENV = NODE_ENV;
    res.locals.isLoggedIn = false;
    res.locals.user = null;

    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        res.locals.user = req.session.user;
    }

    next();
});

// Routes
app.use(router);

// Catch-all 404
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);

    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    res.status(status).render(`errors/${template}`, context);
});

app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
});