const EmailTask = require('./model');
const SendgridService = require('../../common/services/sendgrid');
const EmailTypes = require('./types');
const EventController = require('../event/controller');
const UserController = require('../user-profile/controller');
const shortid = require('shortid');
const Promise = require('bluebird');
const _ = require('lodash');
const controller = {};

controller.createTask = (userId, eventId, type, params, schedule) => {
    const task = new EmailTask({
        user: userId,
        event: eventId,
        type: type
    });

    if (schedule) {
        task.schedule = schedule;
    }

    if (params) {
        task.params = params;
    }
    return task.save().catch(err => {
        if (err.code === 11000) {
            return Promise.resolve();
        }
        // For other types of errors, we'll want to throw the error normally
        return Promise.reject(err);
    });
};

controller.createAcceptedTask = async (userId, eventId, deliverNow = false) => {
    const task = await controller.createTask(userId, eventId, EmailTypes.registrationAccepted);
    if (deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createRejectedTask = async (userId, eventId, deliverNow = false) => {
    const task = await controller.createTask(userId, eventId, EmailTypes.registrationRejected);
    if (deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createRegisteredTask = async (userId, eventId, deliverNow = false) => {
    const task = await controller.createTask(userId, eventId, EmailTypes.registrationReceived);
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createTravelGrantAcceptedTask = async (registration, deliverNow = false) => {
    const task = await controller.createTask(registration.user, registration.event, EmailTypes.travelGrantAccepted, {
        amount: registration.travelGrant,
        countryOfTravel: registration.answers.countryOfTravel
    });
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createTravelGrantRejectedTask = async (registration, deliverNow = false) => {
    const task = await controller.createTask(registration.user, registration.event, EmailTypes.travelGrantRejected);
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createTravelGrantDetailsRejectedTask = async (registration, deliverNow = false) => {
    const task = await controller.createTask(
        registration.user,
        registration.event,
        EmailTypes.travelGrantDetailsRejected,
        {
            comment: registration.travelGrantComment
        }
    );
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createTravelGrantDetailsAcceptedTask = async (registration, deliverNow = false) => {
    const task = await controller.createTask(
        registration.user,
        registration.event,
        EmailTypes.travelGrantDetailsAccepted,
        {
            amount: registration.travelGrantAmount
        }
    );
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.createRecruiterMessageTask = async recruiterAction => {
    const [user, recruiter] = await Promise.all([
        UserController.getUserProfile(recruiterAction.user),
        UserController.getUserProfile(recruiterAction.recruiter)
    ]);
    // TODO implement Task for this type as well! Event is missing in this type of email.
    return SendgridService.sendRecruiterMessageEmail(
        recruiter,
        user,
        recruiter.recruiterOrganisation,
        recruiterAction.data.message
    );
};

controller.createGenericTask = async (userId, eventId, uniqueId, msgParams, deliverNow = false) => {
    if (!uniqueId) {
        uniqueId = shortid.generate();
    }
    const task = await controller.createTask(userId, eventId, 'generic_' + uniqueId, msgParams);
    if (task && deliverNow) {
        return controller.deliverEmailTask(task);
    }
    return task;
};

controller.deliverEmailTask = async task => {
    const [user, event] = await Promise.all([
        UserController.getUserProfile(task.user),
        EventController.getEventById(task.event)
    ]);
    switch (task.type) {
        case EmailTypes.registrationAccepted: {
            await SendgridService.sendAcceptanceEmail(event, user);
            break;
        }
        case EmailTypes.registrationRejected: {
            await SendgridService.sendRejectionEmail(event, user);
            break;
        }
        case EmailTypes.registrationReceived: {
            await SendgridService.sendRegisteredEmail(event, user);
            break;
        }
        case EmailTypes.travelGrantAccepted: {
            await SendgridService.sendTravelGrantAcceptedEmail(event, user, task.params);
            break;
        }
        case EmailTypes.travelGrantRejected: {
            await SendgridService.sendTravelGrantRejectedEmail(event, user, task.params);
            break;
        }
        case EmailTypes.travelGrantDetailsAccepted: {
            await SendgridService.sendTravelGrantDetailsAcceptedEmail(event, user, task.params);
            break;
        }
        case EmailTypes.travelGrantDetailsRejected: {
            await SendgridService.sendTravelGrantDetailsRejectedEmail(event, user, task.params);
            break;
        }
        default: {
            await SendgridService.sendGenericEmail(user.email, task.params);
            break;
        }
    }

    /** Here we'll have success so we can set the task as delivered */
    task.deliveredAt = Date.now();
    return task.save();
};

controller.sendPreviewEmail = async (to, msgParams) => {
    return SendgridService.sendGenericEmail(to, msgParams).catch(() => {
        return;
    });
};

controller.sendBulkEmail = async (recipients, msgParams, event, uniqueId) => {
    return Promise.map(
        recipients,
        recipient => {
            return controller
                .createGenericTask(recipient, event._id.toString(), uniqueId, msgParams, true)
                .then(task => {
                    if (task && task.deliveredAt) {
                        return true;
                    }
                    return false;
                });
        },
        {
            concurrency: 10
        }
    ).then(deliveredTasks => {
        const delivered = deliveredTasks.filter(taskDelivered => taskDelivered === true).length;
        const total = recipients.length;

        console.log('Email send statistics', {
            event: event._id.toString(),
            uniqueId,
            delivered,
            failed: total - delivered,
            total
        });

        return {
            delivered,
            failed: total - delivered,
            total
        };
    });
};

module.exports = controller;
