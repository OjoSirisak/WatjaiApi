'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/watjainormal',
        handler: function (request, reply) {

            db.WatjaiNormal.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }

                reply(docs);
            });

        }
    });

    // find by Measure Normal id
    server.route({
        method: 'GET',
        path: '/watjainormal/{measureId}',
        handler: function (request, reply) {

            db.WatjaiNormal.find({
                measuringId: request.params.measureId
            }).sort({ measuringTime : -1 } , (err, doc) => {
                
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

    return next();
};

exports.register.attributes = {
    name: 'routes-watjainormal'
};
