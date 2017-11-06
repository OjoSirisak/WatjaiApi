    'use strict';

    const Boom = require('boom');
    const uuid = require('node-uuid');
    const Joi = require('joi');

    exports.register = function (server, options, next) {

        const db = server.app.db;

        server.route({
            method: 'POST',
            path: '/checkuser/patient',
            handler: function (request, reply) {
                var username = request.payload.username;
                var password = request.payload.password;
                username = username.toUpperCase();
                var success;
                var status;

                db.Patients.find({
                    patId: username
                }, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (!result) {
                        return reply(Boom.notFound());
                    }
                        
                    var data = result[0];
                    if (data != null) {
                        var data_pass = data.patTel;
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

                    reply( {"success" : success, "status" : status , "patId" : user} );
                });
            
            },
            config: {
                validate: {
                    payload: {
                        username: Joi.string().required(),
                        password: Joi.string().required()
                    }
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/checkuser/doctor',
            handler: function (request, reply) {
                var username = request.payload.username;
                var password = request.payload.password;
                username = username.toUpperCase();
                var success;
                var status;

                db.Doctors.find({
                    docId: username
                }, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (!result) {
                        return reply(Boom.notFound());
                    }
                        
                    var data = result[0];
                    if (data != null) {
                        var data_pass = data.docTel;
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

                    reply( {"success" : success, "status" : status, "docId" : user} );
                });
            
            },
            config: {
                validate: {
                    payload: {
                        username: Joi.string().required(),
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
