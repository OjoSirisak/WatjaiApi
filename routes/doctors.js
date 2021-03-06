    'use strict';

    const Boom = require('boom');
    const uuid = require('node-uuid');
    const Joi = require('joi');

    exports.register = function (server, options, next) {

        const db = server.app.db;

         // find everything in collection
        server.route({
            method: 'GET',
            path: '/doctors',
            handler: function (request, reply) {

                db.Doctors.find((err, docs) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(docs);
                });

            }
        });

        // find by doctor id
        server.route({
            method: 'GET',
            path: '/doctors/{docId}',
            handler: function (request, reply) {

                db.Doctors.find({
                    docId: request.params.docId
                }, (err, doc) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (!doc) {
                        return reply(Boom.notFound());
                    }

                    reply(doc[0]);
                });

            }
        });

        function checkId(tmp) {
            var year, month, day;
            var number, checkYear, checkMonth, checkDay;
            var getDate;
            getDate = new Date(Date.now());
            getDate.setUTCHours(getDate.getUTCHours() + 7);
            getDate = getDate.toISOString();
            getDate = getDate.substr(2, 8);
            year = getDate.substr(0, 2);
            month = getDate.substr(3, 2);
            day = getDate.substr(6, 2);
    
            if (tmp[0] != null) {
                var getId = tmp[0].docId + "";
                var getNumber = getId.substr(2, 11);
                checkYear = getId.substr(2, 2);
                checkMonth = getId.substr(4, 2);
                if (year == checkYear && month == checkMonth) {
                    number = parseInt(getNumber);
                    number = number + 1;
                    return number;
                } else {
                    return year + month + "001";
                }
            } else {
                return year + month + "001";
            }
    
        }

        // create doctor user
        server.route({
            method: 'POST',
            path: '/doctors',
            handler: function (request, reply) {
                
                db.Doctors.find({}, { docId: 1, _id: 0 }).sort({ docId: -1 }).limit(1, (err, result) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    const tmp = result;
                    const doc = request.payload;

                    doc.docId = "DO" + checkId(tmp);

                    db.Doctors.save(doc, (err, result) => {

                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }

                        reply(doc);
                    });
                })
            },
            config: {
                validate: {
                    payload: {
                        docTitle: Joi.string().min(3).max(3).required(),
                        docFirstName: Joi.string().min(2).max(50).required(),
                        docLastName: Joi.string().min(2).max(50).required(),
                        docTel: Joi.string().min(10).max(10).required(),
                        docPic: Joi.string()
                    }
                }
            }
        });

        // update doctor user
        server.route({
            method: 'PATCH',
            path: '/doctors/{docId}',
            handler: function (request, reply) {

                db.Doctors.update({
                    docId: request.params.docId
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
                        docTitle: Joi.string().min(3).max(3),
                        docFirstName: Joi.string().min(2).max(50),
                        docLastName: Joi.string().min(2).max(50),
                        docTel: Joi.string().min(10).max(10),
                        docPic: Joi.string(),
                        patients: Joi.array()
                    }).required().min(1)
                }
            }
        });

        // delete doctor user by doctor id
        server.route({
            method: 'DELETE',
            path: '/doctors/{docId}',
            handler: function (request, reply) {

                db.Doctors.remove({
                    docId: request.params.docId
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

        server.route({
            method: 'GET',
            path: '/doctors/{docId}/showpatients',
            handler: function (request, reply) {
                db.Patients.find({
                    docId: request.params.docId
                }, { patId: 1, _id: 0, patFirstName: 1, patLastName: 1}, (err, docs) => {

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
            path: '/doctors/{docId}/showpatients/{patId}',
            handler: function (request, reply) {
                db.Patients.find({
                    docId: request.params.docId,
                    patId: request.params.patId
                }, (err, doc) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (!doc) {
                        return reply(Boom.notFound());
                    }

                    reply(doc[0]);
                });
    
            }
        });


        return next();
    };

    exports.register.attributes = {
        name: 'routes-doctors'
    };
