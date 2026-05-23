import { getAllCategories, getCategoryDetails, getProjectsByCategory } from '../models/categories.js';

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

export { showCategoriesPage, showCategoryDetailsPage };