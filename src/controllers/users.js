import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';
import { getVolunteerProjectsByUserId } from '../models/volunteers.js';

const SALT_ROUNDS = 10;

// ─── Registration ────────────────────────────────────────────────────────────

const showUserRegistrationForm = (req, res, next) => {
    try {
        res.render('register', { title: 'Create Account' });
    } catch (error) {
        next(error);
    }
};

const processUserRegistrationForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => req.flash('error', error.msg));
            return res.redirect('/register');
        }

        const { name, email, password } = req.body;

        // Hash the password before storing
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await createUser(name, email, passwordHash);

        req.flash('success', 'Account created successfully! Please log in.');
        res.redirect('/login');
    } catch (error) {
        // Handle duplicate email
        if (error.code === '23505') {
            req.flash('error', 'An account with that email already exists.');
            return res.redirect('/register');
        }
        next(error);
    }
};

// ─── Login / Logout ───────────────────────────────────────────────────────────

const showLoginForm = (req, res, next) => {
    try {
        res.render('login', { title: 'Sign In' });
    } catch (error) {
        next(error);
    }
};

const processLoginForm = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authenticateUser(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password. Please try again.');
            return res.redirect('/login');
        }

        // Store user (without password_hash) on session
        req.session.user = user;
        console.log('User logged in:', user.email, '| Role:', user.role_name);

        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
};

const processLogout = (req, res, next) => {
    // 1. Remove the user data from the session
    req.session.user = null;

    // 2. Save the session to ensure the user is removed
    req.session.save((err) => {
        if (err) return next(err);

        // 3. Now we can safely set a flash message because the session still exists
        req.flash('success', 'You have been logged out.');
        res.redirect('/login');
    });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const showDashboard = async (req, res, next) => {
    try {
        const { user_id, name, email, role_name } = req.session.user;

        // Fetch projects the user has volunteered for
        const volunteerProjects = await getVolunteerProjectsByUserId(user_id);

        res.render('dashboard', { title: 'Dashboard', name, email, role_name, volunteerProjects });
    } catch (error) {
        next(error);
    }
};

// ─── Users List (admin only) ──────────────────────────────────────────────────

const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('users', { title: 'Registered Users', users });
    } catch (error) {
        next(error);
    }
};

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * requireLogin — standard middleware.
 * Redirects to /login if no session user exists.
 */
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

/**
 * requireRole — middleware factory.
 * Returns a middleware function that checks the user's role_name.
 *
 * @param {string} role - The role_name required (e.g. 'admin')
 */
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access that page.');
            return res.redirect('/login');
        }
        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access that page.');
            return res.redirect('/dashboard');
        }
        next();
    };
};

// ─── Validation rules ─────────────────────────────────────────────────────────

const registrationValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .normalizeEmail()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    showDashboard,
    showUsersPage,
    requireLogin,
    requireRole,
    registrationValidation
};
