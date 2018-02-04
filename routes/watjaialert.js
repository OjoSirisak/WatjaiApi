'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const onesignal = require('node-opensignal-api');
const onesignal_client = onesignal.createClient();
const restApiKey = 'NTAwZWM1OWMtZjhjNS00YTc4LTk5OTgtODVjYjNhOGZhNmE4';
const appId = '3b2a8959-e726-41d4-b83d-82c965cfabe1';

exports.register = function (server, options, next) {

    const db = server.app.db;
    
    server.route({
        method: 'GET',
        path: '/watjaimeasure',
        handler: function (request, reply) {

            db.WatjaiMeasure.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });

    // find by Measure Alert id
    server.route({
        method: 'GET',
        path: '/watjaimeasure/{measuringId}',
        handler: function (request, reply) {

            db.WatjaiMeasure.find({
                measuringId: request.params.measuringId
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }

                reply(doc);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/watjaimeasure/showabnormal',
        handler: function (request, reply) {
            db.WatjaiMeasure.find({
                "abnormalStatus" : false 
            }).sort({ measuringTime : -1 }, (err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!docs) {
                    return reply(Boom.notFound());
                }

                reply(docs);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/watjaimeasure/showabnormal/{patId}',
        handler: function (request, reply) {
            db.WatjaiMeasure.find({
                patId: request.params.patId,
                "abnormalStatus" : false 
            }).sort({ measuringTime : -1 }, (err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!docs) {
                    return reply(Boom.notFound());
                }

                reply(docs);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/watjaimeasure/showabnormal/{patId}/after/',
        handler: function (request, reply) {
            db.WatjaiMeasure.find({
                patId: request.params.patId,
                "commentStatus" : false
            }).sort({ measuringTime : -1 }, (err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!docs) {
                    return reply(Boom.notFound());
                }

                reply(docs);
            });

        }
    });

    server.route({
        method: 'GET',
        path: '/watjaimeasure/showabnormal/{patId}/after/{measuringId}',
        handler: function (request, reply) {
            db.WatjaiMeasure.find({
                patId: request.params.patId,
                "commentStatus" : false,
                "measuringId" : { $gt : request.params.measuringId }
            }).sort({ measuringTime : -1 }, (err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!docs) {
                    return reply(Boom.notFound());
                }

                reply(docs);
            });

        }
    });

    server.route({
        method: 'PATCH',
        path: '/watjaimeasure/comment/{measuringId}',
        handler: function (request, reply) {
            let patId;
            db.WatjaiMeasure.find({
                measuringId: request.params.measuringId
            }, (err, doc) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                if (!doc) {
                    return reply(Boom.notFound());
                }
                patId = doc[0].patId;
                db.WatjaiMeasure.update({
                    measuringId: request.params.measuringId
                }, {
                    $set: { commentStatus: true, 
                            comment : request.payload.comment }
                }, function (err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }
                    reply().code(204);
                });

                var params = {
                    app_id: appId,
                    contents: {
                        'en': request.payload.comment,
                        'th': request.payload.comment
                    },
                    tags: [{ "key": "patId", "relation": "=", "value": patId}]
                };
                if (request.payload.comment != "") {
                    onesignal_client.notifications.create(restApiKey, params, function (err, response) {
                        if (err) {
                            console.log('Encountered error', err);
                          } else {
                            console.log(response);
                          }
                    });
                }
            });
        },
        config: {
            validate: {
                payload: Joi.object({
                    comment: Joi.string().min(5)
                }).required().min(1)
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/watjaimeasure/changereadstatus/{measuringId}',
        handler: function (request, reply) {

            db.WatjaiMeasure.update({
                measuringId: request.params.measuringId
            }, {
                    $set: { readStatus : true }
                }, function (err, result) {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }

                    reply().code(204);
                });
        }
    });


    return next();
};

exports.register.attributes = {
    name: 'routes-watjaialert'
};
