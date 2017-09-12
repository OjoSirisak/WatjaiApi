'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;
    
    server.route({
        method: 'GET',
        path: '/doctors/firstname/{patFirstName}/showpatients',
        handler: function (request, reply) {
            db.Patients.find({
                patFirstName: request.params.patFirstName
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
        path: '/doctors/lastname/{patLastName}/showpatients',
        handler: function (request, reply) {
            db.Patients.find({
                patLastName: request.params.patLastName
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

    return next();
};

exports.register.attributes = {
    name: 'routes-search'
};
