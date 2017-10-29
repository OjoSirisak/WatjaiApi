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

    // create Wat jai Measure Alert
    server.route({
        method: 'POST',
        path: '/watjaimeasure',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth, checkDay;
            var year, month, day;
            var getDate;
            getDate = new Date(Date.now());
            getDate.setUTCHours(getDate.getUTCHours() + 7);
            getDate = getDate.toISOString();
            getDate = getDate.substr(2, 8);
            year = getDate.substr(0, 2); 
            month = getDate.substr(3, 2);
            day = getDate.substr(6, 2);
            db.WatjaiMeasure.find({}, { measuringId: 1, _id: 0 }).sort({ measuringId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getId = tmp[0].measuringId + "";
                    var getNumber = getId.substr(2, 11);
                    checkYear = getId.substr(2, 2);
                    checkMonth = getId.substr(4, 2);
                    checkDay = getId.substr(6, 2);
                    if (year == checkYear && month == checkMonth && day == checkDay) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "ME" + number;
                    } else {
                        genId = "ME" + year + month + day + "00001";
                    }
                } else {
                    genId = "ME" + year + month + day + "00001";
                }
                const measuring = request.payload;
                var date = new Date(Date.now());
                date.setUTCHours(date.getUTCHours() + 7);
                measuring.alertTime = date;
                measuring.measuringId = genId;
                db.WatjaiMeasure.save(measuring, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(measuring);
                });
            })
        },
        config: {
            validate: {
                payload: {
                    measuringData: Joi.array().min(1).required(),
                    heartRate: Joi.number().required(),
                    abnormalStatus: Joi.boolean().required(),
                    patId: Joi.string().min(9).max(9).required()
                }
            }
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
                var restApiKey = 'NTAwZWM1OWMtZjhjNS00YTc4LTk5OTgtODVjYjNhOGZhNmE4';
                var params = {
                    app_id: '3b2a8959-e726-41d4-b83d-82c965cfabe1',
                    contents: {
                        'en': request.payload.comment,
                        'th': request.payload.comment
                    },
                    tags: [{ "key": "patId", "relation": "=", "value": patId}]
                };
                onesignal_client.notifications.create(restApiKey, params, function (err, response) {
                    if (err) {
                        console.log('Encountered error', err);
                      } else {
                        console.log(response);
                      }
                });
            });
        },
        config: {
            validate: {
                payload: Joi.object({
                    abnormalStatus: Joi.boolean(),
                    comment: Joi.string().min(5),
                    alertTime: Joi.date()
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
                    status: "read"
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
