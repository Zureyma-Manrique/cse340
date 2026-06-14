import { getUpcomingProjects, getProjectDetails, getCategoriesForProject, createProject, updateProject } from '../models/projects.js';
import { getAllOrganizations } from '../models/organizations.js';
import { isVolunteering, getVolunteerCountForProject, getVolunteersForProject } from '../models/volunteers.js';
import { body, validationResult } from 'express-validator';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Renders the main upcoming projects list
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

// Renders the single project details page, including category tags and volunteer status
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Service Project Not Found');
            err.status = 404;
            return next(err);
        }

        const categories = await getCategoriesForProject(projectId);
        
        // Fetch the count of volunteers (visible to everyone)
        const volunteerCount = await getVolunteerCountForProject(projectId);

        // Check volunteer status and fetch admin data
        let userIsVolunteering = false;
        let volunteerList = []; // Default to empty array

        if (req.session && req.session.user) {
            userIsVolunteering = await isVolunteering(req.session.user.user_id, projectId);

            // SECURITY: Only query the database for names/emails if the user is an admin
            if (req.session.user.role_name === 'admin') {
                volunteerList = await getVolunteersForProject(projectId);
            }
        }

        const title = project.title;
        // Pass the new variables to the EJS template
        res.render('project', { 
            title, 
            project, 
            categories, 
            userIsVolunteering, 
            volunteerCount, 
            volunteerList 
        });
    } catch (error) {
        next(error);
    }
};

// Renders the new project form
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        next(error);
    }
};

// Processes the new project form submission
const processNewProjectForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-project');
        }

        const { organizationId, title, description, location, date } = req.body;
        const projectId = await createProject(title, description, location, date, organizationId);

        req.flash('success', 'Service project created successfully!');
        res.redirect('/projects');
    } catch (error) {
        next(error);
    }
};

// Renders the edit project form pre-populated with existing data
const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Service Project Not Found');
            err.status = 404;
            return next(err);
        }

        const organizations = await getAllOrganizations();
        const title = 'Edit Service Project';
        res.render('edit-project', { title, project, organizations });
    } catch (error) {
        next(error);
    }
};

// Processes the edit project form submission
const processEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-project/${projectId}`);
        }

        const { organizationId, title, description, location, date } = req.body;
        await updateProject(projectId, title, description, location, date, organizationId);

        req.flash('success', 'Service project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// Validation rules for project forms
const projectValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Project title is required')
        .isLength({ min: 3, max: 200 })
        .withMessage('Project title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ max: 1000 })
        .withMessage('Project description cannot exceed 1000 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Project location is required')
        .isLength({ max: 200 })
        .withMessage('Location cannot exceed 200 characters'),
    body('date')
        .notEmpty()
        .withMessage('Project date is required')
        .isISO8601()
        .withMessage('Please provide a valid date'),
    body('organizationId')
        .notEmpty()
        .withMessage('Please select an organization')
        .isInt()
        .withMessage('Invalid organization selected')
];

export {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};
