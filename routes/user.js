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
                var success, status, id;
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
                            id = data.patId;
                        } else {
                            success = false;
                            status = "ชื่อผู้ใช้งานหรือรหัสผ่านผิด";
                            id = "";
                        }
                    } else {
                        success = false
                        status = "ชื่อผู้ใช้งานหรือรหัสผ่านผิด";
                        id = ""
                    }

                    reply( {"success" : success, "status" : status , "patId" : id} );
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
                var success, status, id;

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
                            id = data.docId;
                        } else {
                            success = false;
                            status = "ชื่อผู้ใช้งานหรือรหัสผ่านผิด";
                            id = "";
                        }
                    } else {
                        success = false
                        status = "ชื่อผู้ใช้งานหรือรหัสผ่านผิด";
                        id = "";
                    }

                    reply( {"success" : success, "status" : status, "docId" : id} );
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
