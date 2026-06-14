import db from './db.js';

/**
 * Adds a user as a volunteer for a project.
 * Uses ON CONFLICT DO NOTHING to safely handle duplicate signups.
 */
const addVolunteer = async (userId, projectId) => {
    const query = `
        INSERT INTO public.volunteer (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
        RETURNING volunteer_id
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows[0] ?? null;
};

/**
 * Removes a user's volunteer signup for a project.
 */
const removeVolunteer = async (userId, projectId) => {
    const query = `
        DELETE FROM public.volunteer
        WHERE user_id = $1 AND project_id = $2
        RETURNING volunteer_id
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows[0] ?? null;
};

/**
 * Returns all projects a user has signed up to volunteer for.
 */
const getVolunteerProjectsByUserId = async (userId) => {
    const query = `
        SELECT p.project_id, p.title, p.description, p.location, p.date,
               o.name AS organization_name, o.organization_id,
               v.created_at AS signed_up_at
        FROM public.volunteer v
        JOIN public.project p ON v.project_id = p.project_id
        JOIN public.organization o ON p.organization_id = o.organization_id
        WHERE v.user_id = $1
        ORDER BY p.date ASC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Checks whether a specific user is already volunteering for a specific project.
 * Returns true/false.
 */
const isVolunteering = async (userId, projectId) => {
    const query = `
        SELECT 1 FROM public.volunteer
        WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows.length > 0;
};

/**
 * Gets the total count of volunteers registered for a specific project.
 */
const getVolunteerCountForProject = async (projectId) => {
    const query = `
        SELECT COUNT(*) AS count 
        FROM public.volunteer 
        WHERE project_id = $1
    `;
    const result = await db.query(query, [projectId]);
    return parseInt(result.rows[0].count, 10); // Ensure it returns a number
};

/**
 * Gets the detailed list of volunteers (names and emails) for a project.
 * Designed for admin use.
 */
const getVolunteersForProject = async (projectId) => {
    const query = `
        SELECT u.user_id, u.name, u.email, v.created_at
        FROM public.volunteer v
        JOIN users u ON v.user_id = u.user_id
        WHERE v.project_id = $1
        ORDER BY v.created_at ASC
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

export { 
    addVolunteer, 
    removeVolunteer, 
    getVolunteerProjectsByUserId, 
    isVolunteering,
    getVolunteerCountForProject,
    getVolunteersForProject
};
