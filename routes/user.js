    'use strict';

    const Boom = require('boom');
    const uuid = require('node-uuid');
    const Joi = require('joi');

    exports.register = function (server, options, next) {

        const db = server.app.db;

        server.route({
            method: 'GET',
            path: '/user',
            handler: function (request, reply) {

                db.User.find((err, docs) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(docs);
                });

            }
        });

        server.route({
            method: 'GET',
            path: '/user/{id}',
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

        server.route({
            method: 'POST',
            path: '/user',
            handler: function (request, reply) {
                    const user = request.payload;
                    db.User.save(user, (err, result) => {

                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }

                        reply(user);
                    });
            
            },
            config: {
                validate: {
                    payload: {
                        tel: Joi.string().min(10).max(10).required(),
                        password: Joi.string().required(),
                        id: Joi.string().required()
                    }
                }
            }
        });

        // update doctor user
        server.route({
            method: 'PATCH',
            path: '/user/{id}',
            handler: function (request, reply) {

                db.User.update({
                    id: request.params.id
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
                        tel: Joi.string().min(10).max(10).required(),
                        password: Joi.string().required(),
                        id: Joi.string().required()
                    }).required().min(1)
                }
            }
        });

        // delete doctor user by doctor id
        server.route({
            method: 'DELETE',
            path: '/user/{id}',
            handler: function (request, reply) {

                db.User.remove({
                    id: request.params.id
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

        server.route({
            method: 'POST',
            path: '/checkuser',
            handler: function (request, reply) {
                    var user = request.payload.tel;
                    var password = request.payload.password;
                    var success;
                    var status;
                    db.User.find(user, (err, result) => {

                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }

                        var data = result;
                        if (data[0] != null) {
                            let data_pass = data.password;
                            if  (data_pass == password) {
                                success = true;
                                status = "เข้าสู่ระบบ";
                            } else {
                                success = false;
                                status = "เบอร์โทรศัพท์หรือรหัสผ่านผิด";
                            }
                        } else {
                            success = false
                            status = "เบอร์โทรศัพท์หรือรหัสผ่านผิด";
                        }

                        reply( {"success" : success, "status" : status } );
                    });
            
            },
            config: {
                validate: {
                    payload: {
                        tel: Joi.string().min(10).max(10).required(),
                        password: Joi.string().required()
                    }
                }
            }
        });

        return next();
    };

    exports.register.attributes = {
        name: 'routes-user'
    };
