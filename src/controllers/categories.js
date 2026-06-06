import {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory,
    createCategory,
    updateCategory,
    updateCategoryAssignments,
    getCategoriesByServiceProjectId
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// Renders the full categories list
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

// Renders a single category details page with its projects
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        const projects = await getProjectsByCategory(categoryId);
        const title = category.name;
        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

// Renders the new category form
const showNewCategoryForm = async (req, res, next) => {
    try {
        const title = 'Add New Category';
        res.render('new-category', { title, categoryName: '' });
    } catch (error) {
        next(error);
    }
};

// Processes the new category form submission
const processNewCategoryForm = async (req, res, next) => {
    try {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect('/new-category');
        }

        const { name } = req.body;
        const categoryId = await createCategory(name);

        req.flash('success', 'Category created successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

// Renders the edit category form pre-populated with existing data
const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryDetails(categoryId);

        if (!category) {
            const err = new Error('Category Not Found');
            err.status = 404;
            return next(err);
        }

        const title = 'Edit Category';
        res.render('edit-category', { title, category });
    } catch (error) {
        next(error);
    }
};

// Processes the edit category form submission
const processEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        const results = validationResult(req);
        if (!results.isEmpty()) {
            results.array().forEach((error) => {
                req.flash('error', error.msg);
            });
            return res.redirect(`/edit-category/${categoryId}`);
        }

        const { name } = req.body;
        await updateCategory(categoryId, name);

        req.flash('success', 'Category updated successfully!');
        res.redirect(`/category/${categoryId}`);
    } catch (error) {
        next(error);
    }
};

// Renders the assign categories form for a project
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await getProjectDetails(projectId);

        if (!project) {
            const err = new Error('Service Project Not Found');
            err.status = 404;
            return next(err);
        }

        const allCategories = await getAllCategories();
        const assignedCategories = await getCategoriesByServiceProjectId(projectId);
        const title = 'Assign Categories to Project';

        res.render('assign-categories', { title, project, allCategories, assignedCategories });
    } catch (error) {
        next(error);
    }
};

// Processes the assign categories form submission
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        // categories may be undefined (nothing checked), a string, or an array
        let categoryIds = req.body.categoryIds || [];
        if (!Array.isArray(categoryIds)) {
            categoryIds = [categoryIds];
        }
        categoryIds = categoryIds.map(Number);

        await updateCategoryAssignments(projectId, categoryIds);

        req.flash('success', 'Categories updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

// Validation rules for category forms
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Category name must be between 3 and 100 characters')
];

export {
    showCategoriesPage,
    showCategoryDetailsPage,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    categoryValidation
};