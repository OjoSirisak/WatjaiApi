'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;
    
    server.route({
        method: 'GET',
        path: '/watjaialert',
        handler: function (request, reply) {

            db.WatjaiAlert.find((err, docs) => {

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
        path: '/watjaialert/{measureAlertId}',
        handler: function (request, reply) {

            db.WatjaiAlert.find({
                alertId: request.params.measureAlertId
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
        path: '/watjaialert',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth, checkDay;
            db.WatjaiAlert.find({}, { alertId: 1, _id: 0 }).sort({ alertId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getId = tmp[0].alertId + "";
                    var getNumber = getId.substr(2, 11);
                    checkYear = getId.substr(2, 2);
                    checkMonth = getId.substr(4, 2);
                    checkDay = getId.substr(6, 2);
                    if (year == checkYear && month == checkMonth && day == checkDay) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "AL" + number;
                    } else {
                        genId = "AL" + year + month + day + "00001";
                    }
                } else {
                    genId = "AL" + year + month + day + "00001";
                }
                const measurealret = request.payload;
                var date = new Date(Date.now());
                date.setUTCHours(date.getUTCHours() + 7);
                measurealret.alertTime = date;
                measurealret.alertId = genId;
                db.WatjaiAlert.save(measurealret, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(measurealret);
                });
            })
        },
        config: {
            validate: {
                payload: {
                    alertData: Joi.array().min(1).required(),
                }
            }
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-watjaialert'
};
