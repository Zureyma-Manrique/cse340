import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { createUser, authenticateUser, getAllUsers, findUserById, updatePassword } from '../models/users.js';
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
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await createUser(name, email, passwordHash);

        req.flash('success', 'Account created successfully! Please log in.');
        res.redirect('/login');
    } catch (error) {
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

        req.session.user = user;
        console.log('User logged in:', user.email, '| Role:', user.role_name);

        req.flash('success', `Welcome back, ${user.name}!`);
        res.redirect('/dashboard');
    } catch (error) {
        next(error);
    }
};

const processLogout = (req, res, next) => {
    req.session.user = null;
    req.session.save((err) => {
        if (err) return next(err);
        req.flash('success', 'You have been logged out.');
        res.redirect('/login');
    });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const showDashboard = async (req, res, next) => {
    try {
        const { user_id, name, email, role_name } = req.session.user;

        // Fetch projects
        const volunteerProjects = await getVolunteerProjectsByUserId(user_id);

        // Ensure these match EXACTLY what your EJS uses
        res.render('dashboard', { 
            title: 'Dashboard', 
            name: name,             // Make sure this is passed
            email: email,           // Make sure this is passed
            role_name: role_name,   // Make sure this is passed
            volunteerProjects: volunteerProjects 
        });
    } catch (error) {
        next(error);
    }
};

// ─── Change Password ──────────────────────────────────────────────────────────

const showChangePasswordForm = (req, res, next) => {
    try {
        res.render('change-password', { title: 'Change Password' });
    } catch (error) {
        next(error);
    }
};

const processChangePasswordForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => req.flash('error', error.msg));
            return res.redirect('/change-password');
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match.');
            return res.redirect('/change-password');
        }

        const userId = req.session.user.user_id;
        const user = await findUserById(userId);
        if (!user) {
            req.flash('error', 'User account not found.');
            return res.redirect('/change-password');
        }

        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
            req.flash('error', 'Current password is incorrect.');
            return res.redirect('/change-password');
        }

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await updatePassword(userId, newPasswordHash);

        req.flash('success', 'Password updated successfully!');
        res.redirect('/dashboard');
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

const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

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

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your new password')
];

export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    showDashboard,
    showChangePasswordForm,
    processChangePasswordForm,
    showUsersPage,
    requireLogin,
    requireRole,
    registrationValidation,
    changePasswordValidation
};
