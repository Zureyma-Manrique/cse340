import { addVolunteer, removeVolunteer } from '../models/volunteers.js';

/**
 * Adds the logged-in user as a volunteer for a project,
 * then redirects back to the project details page.
 */
const processAddVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.session.user.user_id;

        await addVolunteer(userId, projectId);

        req.flash('success', 'You have signed up to volunteer for this project!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

/**
 * Removes the logged-in user as a volunteer for a project.
 * Supports redirect back to either the project page or the dashboard
 * depending on a `from` query parameter.
 */
const processRemoveVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const userId = req.session.user.user_id;
        const from = req.query.from;

        await removeVolunteer(userId, projectId);

        req.flash('success', 'You have been removed as a volunteer for this project.');

        if (from === 'dashboard') {
            return res.redirect('/dashboard');
        }
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        next(error);
    }
};

export { processAddVolunteer, processRemoveVolunteer };
