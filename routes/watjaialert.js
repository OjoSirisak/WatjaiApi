'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const onesignal = require('node-opensignal-api');
const onesignal_client = onesignal.createClient();

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
            }).sort({ alertTime : -1 }, (err, docs) => {

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
            }).sort({ alertTime : -1 }, (err, docs) => {

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
                "comment" : {"$exists" : true, "$ne" : ""}
            }).sort({ alertTime : -1 }, (err, docs) => {

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
                "comment" : {"$exists" : true, "$ne" : ""},
                "measuringId" : { $gt : request.params.measuringId }
            }).sort({ alertTime : -1 }, (err, docs) => {

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
        path: '/watjaimeasure/{measuringId}',
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
                    $set: request.payload
                }, function (err, result) {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }
                    reply().code(204);
                });
                console.log(patId);
                var restApiKey = 'NTAwZWM1OWMtZjhjNS00YTc4LTk5OTgtODVjYjNhOGZhNmE4';
                var params = {
                    app_id: '3b2a8959-e726-41d4-b83d-82c965cfabe1',
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
                    abnormalStatus: Joi.boolean(),
                    comment: Joi.string().min(5),
                    alertTime: Joi.date(),
                    readStatus: Joi.string()
                }).required().min(1)
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/watjaimeasure/changereadstatus/{measuringId}',
        handler: function (request, reply) {

            db.WatjaiMeasure.update({
                measuringId: request.params.measuringId
            }, {
                    $set: request.payload
                }, function (err, result) {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }

                    reply().code(204);
                });
        },
        config: {
            validate: {
                payload: Joi.object({
                    measuringData: Joi.array(),
                    patId: Joi.string(),
                    alertTime: Joi.date(),
                    measuringId: Joi.string(),
                    heartRate: Joi.number(),
                    abnormalStatus: Joi.boolean(),
                    abnormalDetail: Joi.string(),
                    readStatus: Joi.string(),
                    comment: Joi.string()
                }).required().min(1)
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-watjaialert'
};
