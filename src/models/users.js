import bcrypt from 'bcrypt';
import db from './db.js';

/**
 * Creates a new user in the database, assigning them the default "user" role.
 * @param {string} name
 * @param {string} email
 * @param {string} passwordHash - Already hashed password
 * @returns {number} The new user's user_id
 */
const createUser = async (name, email, passwordHash) => {
    const query = `
        INSERT INTO users (name, email, password_hash, role_id)
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = 'user'))
        RETURNING user_id
    `;
    const result = await db.query(query, [name, email, passwordHash]);
    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }
    return result.rows[0].user_id;
};

/**
 * Finds a user by email, joining to retrieve their role_name.
 * Updated per Team Activity Step 6 to return role_name instead of role_id.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const queryParams = [email];
    const result = await db.query(query, queryParams);
    if (result.rows.length === 0) {
        return null; // User not found
    }
    return result.rows[0];
};

/**
 * Compares a plain-text password against a stored bcrypt hash.
 * @returns {boolean}
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticates a user by email and password.
 * Returns the user object (without password_hash) on success, or null on failure.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    // Remove password_hash before returning
    const { password_hash, ...safeUser } = user;
    return safeUser;
};

/**
 * Retrieves all users with their role names (admin-only use).
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.name
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createUser, authenticateUser, getAllUsers };