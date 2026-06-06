import db from './db.js';

const getAllCategories = async () => {
    const query = `
        SELECT category_id, name
        FROM public.category
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

const getProjectsByCategory = async (categoryId) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.date, p.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        JOIN public.project_category pc ON p.project_id = pc.project_id
        WHERE pc.category_id = $1
        ORDER BY p.date;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows;
};

/**
 * Creates a new category in the database.
 * @param {string} name - The name of the category.
 * @returns {number} The id of the newly created category record.
 */
const createCategory = async (name) => {
    const query = `
        INSERT INTO public.category (name)
        VALUES ($1)
        RETURNING category_id
    `;
    const result = await db.query(query, [name]);
    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }
    return result.rows[0].category_id;
};

/**
 * Updates an existing category in the database.
 * @param {number} id - The id of the category to update.
 * @param {string} name - The new name for the category.
 */
const updateCategory = async (id, name) => {
    const query = `
        UPDATE public.category
        SET name = $1
        WHERE category_id = $2
        RETURNING category_id
    `;
    const result = await db.query(query, [name, id]);
    if (result.rows.length === 0) {
        throw new Error('Failed to update category — record not found');
    }
    return result.rows[0].category_id;
};

/**
 * Assigns a category to a project in the many-to-many table.
 */
const assignCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO public.project_category (project_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `;
    await db.query(query, [projectId, categoryId]);
};

/**
 * Updates category assignments for a project (replaces all existing).
 * @param {number} projectId
 * @param {number[]} categoryIds - Array of category IDs to assign.
 */
const updateCategoryAssignments = async (projectId, categoryIds) => {
    // Remove all existing assignments for this project
    await db.query(
        'DELETE FROM public.project_category WHERE project_id = $1',
        [projectId]
    );
    // Re-add each selected category
    for (const categoryId of categoryIds) {
        await assignCategoryToProject(projectId, categoryId);
    }
};

/**
 * Retrieves all categories assigned to a specific project.
 */
const getCategoriesByServiceProjectId = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM public.category c
        JOIN public.project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

export {
    getAllCategories,
    getCategoryDetails,
    getProjectsByCategory,
    createCategory,
    updateCategory,
    assignCategoryToProject,
    updateCategoryAssignments,
    getCategoriesByServiceProjectId
};