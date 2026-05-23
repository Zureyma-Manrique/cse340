import express from 'express';
import { showProjectsPage, showProjectDetailsPage } from './controllers/projects.js';
import { getAllOrganizations } from './models/organizations.js';
import { getAllCategories } from './models/categories.js';

const router = express.Router();

// Home route
router.get('/', async (req, res) => {
    const title = 'Home';
    res.render('index', { title });
});

// Organizations route (Temporarily using inline controller context until assignment refactor)
router.get('/organizations', async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
});

// Categories route (Temporarily using inline controller context)
router.get('/categories', async (req, res) => {
    const categories = await getAllCategories();
    const title = 'Service Project Categories';
    res.render('categories', { title, categories });
});

// --- Team Activity Service Project Routes ---
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage); // Route Parameter Path Matcher

export default router;