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

// Retrieve a single category by its ID
const getCategoryDetails = async (categoryId) => {
    const query = `
        SELECT category_id, name
        FROM public.category
        WHERE category_id = $1;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Retrieve all service projects for a given category
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

export { getAllCategories, getCategoryDetails, getProjectsByCategory };