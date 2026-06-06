import db from './db.js';

const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM public.organization
        WHERE organization_id = $1;
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Creates a new organization in the database.
 * @returns {number} The id of the newly created organization record.
 */
const createOrganization = async (name, description, contactEmail, logoFilename) => {
    const query = `
        INSERT INTO public.organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;
    const queryParams = [name, description, contactEmail, logoFilename];
    const result = await db.query(query, queryParams);
    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }
    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization in the database.
 */
const updateOrganization = async (id, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE public.organization
        SET name = $1, description = $2, contact_email = $3, logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id
    `;
    const result = await db.query(query, [name, description, contactEmail, logoFilename, id]);
    if (result.rows.length === 0) {
        throw new Error('Failed to update organization — record not found');
    }
    return result.rows[0].organization_id;
};

export { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization };