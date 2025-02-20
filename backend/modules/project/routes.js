const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');

const ProjectController = require('./controller');

const { hasToken } = require('../../common/middleware/token');
const {
    isBefore,
    isAfter,
    canSubmitProject,
    isEventOrganiser,
    getEventFromParams
} = require('../../common/middleware/events');

router.route('/id/:projectId').get(
    asyncHandler(async (req, res) => {
        console.log('req', req.params);
        const project = await ProjectController.getPublicProjectById(req.params.projectId);
        return res.status(200).json(project);
    })
);

router
    .route('/:slug')
    /** Get all projects for an event (limited fields) */
    .get(
        getEventFromParams,
        asyncHandler(async (req, res) => {
            const projects = await ProjectController.getProjectPreviewsByEvent(req.event._id);
            return res.status(200).json(projects);
        })
    );

router
    .route('/:slug/team')
    /** Get the project submitted by a user's team at a given event */
    .get(
        hasToken,
        canSubmitProject,
        asyncHandler(async (req, res) => {
            const project = await ProjectController.getProjectByEventAndTeam(req.event._id, req.team._id);
            return res.status(200).json(project);
        })
    )
    /** Submit a project for a user's team at a given event */
    .post(
        hasToken,
        canSubmitProject,
        isAfter.submissionsStartTime,
        isBefore.submissionsEndTime,
        asyncHandler(async (req, res) => {
            const project = await ProjectController.createProjectForEventAndTeam(req.event, req.team, req.body.data);
            return res.status(200).json(project);
        })
    )
    /** Update the project for a user's team at a given event */
    .patch(
        hasToken,
        canSubmitProject,
        isAfter.submissionsStartTime,
        isBefore.submissionsEndTime,
        asyncHandler(async (req, res) => {
            const project = await ProjectController.updateProjectForEventAndTeam(req.event, req.team, req.body.data);
            return res.status(200).json(project);
        })
    );

router
    .route('/:slug/admin')
    /** As an event admin, get all projects for an event */
    .get(
        hasToken,
        isEventOrganiser,
        asyncHandler(async (req, res) => {
            const projects = await ProjectController.getAllProjectsByEvent(req.event._id);
            return res.status(200).json(projects);
        })
    );

router
    .route('/:slug/admin/:challengeSlug/link')
    /** Generate the unique link with which partners can access their projects */
    .get(
        hasToken,
        isEventOrganiser,
        asyncHandler(async (req, res) => {
            const data = await ProjectController.generateChallengeLink(req.event, req.params.challengeSlug);
            return res.status(200).json(data);
        })
    );

router
    .route('/:slug/token/:token')
    /** Get the projects for a challenge with an admin token */
    .get(
        getEventFromParams,
        asyncHandler(async (req, res) => {
            const projects = await ProjectController.getProjectsWithToken(req.event, req.params.token);
            return res.status(200).json(projects);
        })
    );

module.exports = router;
