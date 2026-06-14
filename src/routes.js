import express from 'express';
import { showHomePage } from './controllers/index.js';
import {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    showEditOrganizationForm,
    processEditOrganizationForm,
    organizationValidation
} from './controllers/organizations.js';
import {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
} from './controllers/projects.js';
import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation
} from './controllers/categories.js';
import {
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
} from './controllers/users.js';
import { processAddVolunteer, processRemoveVolunteer } from './controllers/volunteers.js';
import { testErrorPage } from './controllers/errors.js';

const router = express.Router();

// ─── Home ─────────────────────────────────────────────────────────────────────
router.get('/', showHomePage);

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.get('/register', showUserRegistrationForm);
router.post('/register', registrationValidation, processUserRegistrationForm);

router.get('/login', showLoginForm);
router.post('/login', processLoginForm);

router.get('/logout', processLogout);

// ─── Protected Dashboard ──────────────────────────────────────────────────────
router.get('/dashboard', requireLogin, showDashboard);

// ─── Admin: Users List ────────────────────────────────────────────────────────
router.get('/users', requireLogin, requireRole('admin'), showUsersPage);

// ─── Organizations ────────────────────────────────────────────────────────────
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);

// Admin-only: create / edit organizations
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), organizationValidation, processEditOrganizationForm);

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);

// Admin-only: create / edit projects
router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireLogin, requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), projectValidation, processEditProjectForm);

// ─── Volunteer routes (login required) ────────────────────────────────────────
router.post('/project/:projectId/volunteer', requireLogin, processAddVolunteer);
router.post('/project/:projectId/unvolunteer', requireLogin, processRemoveVolunteer);

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// Admin-only: create / edit / assign categories
router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireLogin, requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), categoryValidation, processEditCategoryForm);

// Admin-only: assign categories to project
router.get('/project/:projectId/assign-categories', requireLogin, requireRole('admin'), showAssignCategoriesForm);
router.post('/project/:projectId/assign-categories', requireLogin, requireRole('admin'), processAssignCategoriesForm);

// ─── Error test ───────────────────────────────────────────────────────────────
router.get('/test-error', testErrorPage);

export default router;
