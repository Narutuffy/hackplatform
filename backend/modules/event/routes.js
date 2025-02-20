const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const { Auth } = require('@hackjunction/shared');
const asyncHandler = require('express-async-handler');
const EventController = require('./controller.js');
const AuthController = require('../auth/controller');
const UserProfileController = require('../user-profile/controller');
const RegistrationController = require('../registration/controller');
const TeamController = require('../team/controller');

const { hasPermission } = require('../../common/middleware/permissions');
const { isEventOwner, isEventOrganiser, hasRegisteredToEvent } = require('../../common/middleware/events');
const { hasToken } = require('../../common/middleware/token');

const router = express.Router();

const getPublicEvents = asyncHandler(async (req, res) => {
    const events = await EventController.getPublicEvents();
    return res.status(200).json(events);
});

const getPublicEventBySlug = asyncHandler(async (req, res) => {
    const event = await EventController.getPublicEventBySlug(req.params.slug);
    return res.status(200).json(event);
});

const getPublicEventById = asyncHandler(async (req, res) => {
    const event = await EventController.getPublicEventById(req.params.id);
    return res.status(200).json(event);
});

const createEvent = asyncHandler(async (req, res) => {
    const event = await EventController.createEvent(req.body, req.user);
    return res.status(201).json(event);
});

const updateEvent = asyncHandler(async (req, res) => {
    const updatedEvent = await EventController.updateEvent(req.event, req.body);
    return res.status(200).json(updatedEvent);
});

const getEventAsOrganiser = asyncHandler(async (req, res) => {
    const event = await EventController.getEventBySlug(req.event.slug);
    return res.status(200).json(event);
});

const getEventsAsOrganiser = asyncHandler(async (req, res) => {
    const events = await EventController.getEventsByOrganiser(req.user);
    return res.status(200).json(events);
});

const deleteEvent = asyncHandler(async (req, res) => {
    const deletedEvent = await EventController.deleteEventBySlug(req.event.slug);
    return res.status(200).json(deletedEvent);
});

const getOrganisers = asyncHandler(async (req, res) => {
    const event = await EventController.getEventBySlug(req.params.slug);
    const userIds = _.concat(event.owner, event.organisers);
    const userProfiles = await UserProfileController.getUserProfiles(userIds);
    return res.status(200).json(userProfiles);
});

const addOrganiser = asyncHandler(async (req, res) => {
    await AuthController.grantAssistantOrganiser(req.params.organiserId);
    const event = await EventController.addOrganiser(req.event, req.params.organiserId);
    return res.status(200).json(event.organisers);
});

const removeOrganiser = asyncHandler(async (req, res) => {
    const event = await EventController.removeOrganiser(req.event, req.params.organiserId);
    return res.status(200).json(event.organisers);
});

const updateWinners = asyncHandler(async (req, res) => {
    const event = await EventController.updateWinners(req.event._id, req.body.winners);
    return res.status(200).json(event);
});

const getWinnerProjects = asyncHandler(async (req, res) => {
    const projectIds = Object.keys(req.event.winners.trackWinners).map(track => {
        return req.event.winners.trackWinners[track];
    });

    const projects = await mongoose.model('Project').find({ _id: { $in: projectIds } });
    return res.status(200).json(projects);
});

/** Generate achievements for projects submitted in this event */
const generateAchievements = asyncHandler(async (req, res) => {
    const result = await EventController.generateAchievements(req.event);
    return res.status(200).json(result);
});

const clearAchievements = asyncHandler(async (req, res) => {
    const result = await EventController.clearAchivements(req.event);
    return res.status(200).json(result);
});

/** Create event, get events by logged in user */
router
    .route('/')
    .get(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), getEventsAsOrganiser)
    .post(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), createEvent);

/** Get all public events */
router.get('/public', getPublicEvents);

/** Get public event by slug */
router.get('/public/:slug', getPublicEventBySlug);

/** Get public event by id */
router.get('/public/id/:id', getPublicEventById);

/** Get, patch or delete a single event */
router
    .route('/:slug')
    .get(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, getEventAsOrganiser)
    .patch(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, updateEvent)
    .delete(hasToken, hasPermission(Auth.Permissions.DELETE_EVENT), isEventOwner, deleteEvent);

router
    .route('/:slug/achievements')
    .patch(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, generateAchievements)
    .delete(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, clearAchievements);

router
    .route('/:slug/winners')
    .get(hasToken, hasRegisteredToEvent, getWinnerProjects)
    .patch(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, updateWinners);

/** Get organisers for single event */
router.get('/organisers/:slug', hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOwner, getOrganisers);

/** Add or remove organisers from event */
router
    .route('/organisers/:slug/:organiserId')
    .post(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, addOrganiser)
    .delete(hasToken, hasPermission(Auth.Permissions.MANAGE_EVENT), isEventOrganiser, removeOrganiser);

module.exports = router;
