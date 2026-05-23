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

// Retrieve the next number_of_projects upcoming service projects
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

// Retrieve a single service project by its ID
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

// Retrieve all service projects for a given organization
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

// Retrieve all categories for a given service project
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

export {
    getAllProjects,
    getUpcomingProjects,
    getProjectDetails,
    getProjectsByOrganizationId,
    getCategoriesForProject
};