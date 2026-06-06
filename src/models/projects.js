import db from './db.js';

const getAllProjects = async () => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.date,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        ORDER BY p.date;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getUpcomingProjects = async (number_of_projects) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.date, p.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.date >= CURRENT_DATE
        ORDER BY p.date ASC
        LIMIT $1;
    `;
    const result = await db.query(query, [number_of_projects]);
    return result.rows;
};

const getProjectDetails = async (id) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.date, p.organization_id,
               o.name AS organization_name
        FROM public.project p
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE p.project_id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT project_id, organization_id, title, description, location, date
        FROM public.project
        WHERE organization_id = $1
        ORDER BY date;
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
};

const getCategoriesForProject = async (projectId) => {
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

/**
 * Creates a new service project in the database.
 * @returns {number} The id of the newly created project record.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO public.project (title, description, location, date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id
    `;
    const result = await db.query(query, [title, description, location, date, organizationId]);
    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }
    return result.rows[0].project_id;
};

/**
 * Updates an existing service project in the database.
 */
const updateProject = async (id, title, description, location, date, organizationId) => {
    const query = `
        UPDATE public.project
        SET title = $1, description = $2, location = $3, date = $4, organization_id = $5
        WHERE project_id = $6
        RETURNING project_id
    `;
    const result = await db.query(query, [title, description, location, date, organizationId, id]);
    if (result.rows.length === 0) {
        throw new Error('Failed to update project — record not found');
    }
    return result.rows[0].project_id;
};

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getProjectsByOrganizationId,
    getCategoriesForProject,
    createProject,
    updateProject
};