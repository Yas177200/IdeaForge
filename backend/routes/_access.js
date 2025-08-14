const {Card, Project, ProjectMembership} = require('../models');

async function canAccessByCard(userId, cardId) {
    const card = await Card.findByPk(cardId);
    if (!card) return {ok: false, status: 404, message: 'Card not found.'};

    const project = await Project.findByPk(card.projectId);
    if (!project) return {ok: false, status: 404, message: 'Project not found.'};

    if (project.ownerId === userId) return {ok: true, project, card};

    const membership = await ProjectMembership.findOne({
        where: { userId, projectId: card.projectId }
    });
    if (!membership) return {ok: false, status: 404, message: 'Not a project member'};

    return {ok: true, project, card, membership};
}

module.exports = {canAccessByCard};