    'use strict';

    const Boom = require('boom');
    const uuid = require('node-uuid');
    const Joi = require('joi');

    exports.register = function (server, options, next) {

        const db = server.app.db;

        server.route({
        method: 'GET',
        path: '/patients',
        handler: function (request, reply) {

            db.Patients.find((err, docs) => {

                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                
                reply(docs);
            });

        }
    });

    // find by patient id
    server.route({
        method: 'GET',
        path: '/patients/{patId}',
        handler: function (request, reply) {
            $match: {patId : request.params.patId}
            db.Patients.aggregate([{ $lookup: { from: "Doctors", localField: "docId", foreignField: "docId", as: "Doctor"}},{$match: {patId : "PA1709001"}}], 
            (err, doc) => {

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


    // create patient user
    server.route({
        method: 'POST',
        path: '/patients',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth;
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
            db.Patients.find({}, { patId: 1, _id: 0 }).sort({ patId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getPatId = tmp[0].patId + "";
                    var getNumber = getPatId.substr(2, 7);
                    checkYear = getPatId.substr(2, 2);
                    checkMonth = getPatId.substr(4, 2);
                    if (year == checkYear && month == checkMonth) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "PA" + number;
                    } else {
                        genId = "PA" + year + month + "001";
                    }
                } else {
                    genId = "PA" + year + month + "001";
                }

                const pat = request.payload;

                pat.birthDay = new Date(request.payload.birthDay);
                pat.patId = genId;

                db.Patients.save(pat, { unique: true }, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(pat);

                    db.Doctors.update({ docId: pat.docId}, { $addToSet: {patients:  pat.patId  } }, function (err, result) {

                        if (err) {
                            return reply(Boom.wrap(err, 'Internal MongoDB error'));
                        }

                        if (result.n === 0) {
                            return reply(Boom.notFound());
                        }

                    });
                });

                


            })
        },
        config: {
            validate: {
                payload: {
                    patFirstName: Joi.string().min(2).max(50).required(),
                    patLastName: Joi.string().min(2).max(50).required(),
                    sex: Joi.string().required(),
                    birthDay: Joi.string().min(10).max(10).required(),
                    address: Joi.string().min(5).max(100).required(),
                    subDistrict: Joi.string().min(2).max(50).required(),
                    district: Joi.string().min(2).max(50).required(),
                    province: Joi.string().min(2).max(50).required(),
                    patTel: Joi.string().min(10).max(10).required(),
                    bloodType: Joi.string().required(),
                    underlyingDisease: Joi.string().min(2).max(100),
                    docId: Joi.string().min(9).max(9).required(),
                    password: Joi.string().min(3),
                    patPic: Joi.string()
                }
            }
        }
    });

    // update patients user
    server.route({
        method: 'PATCH',
        path: '/patients/{patId}',
        handler: function (request, reply) {

            db.Patients.update({
                patId: request.params.patId
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
                    patId: Joi.string(),
                    patFirstName: Joi.string().min(2).max(50),
                    patLastName: Joi.string().min(2).max(50),
                    sex: Joi.string().required(),
                    birthDay: Joi.string().min(10).max(10),
                    address: Joi.string().min(5).max(100),
                    subDistrict: Joi.string().min(2).max(50),
                    district: Joi.string().min(2).max(50),
                    province: Joi.string().min(2).max(50),
                    patTel: Joi.string().min(10).max(10),
                    bloodType: Joi.string(),
                    underlyingDisease: Joi.string().min(2).max(100),
                    docId: Joi.string().min(9).max(9),
                    patPic: Joi.string()
                }).required().min(1)
            }
        }
    });

    // delete patient user by patient id
    server.route({
        method: 'DELETE',
        path: '/patients/{patId}',
        handler: function (request, reply) {

            db.Patients.find({ patId : request.params.patId}, (err, result) => {
                var patient = result[0];
                db.Doctors.update({ docId : patient.docId}, { $pull : { patients : patient.patId}}, (err, result) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    if (result.n == 0) {
                        return reply(Boom.notFound());
                    }
                });
                db.Patients.remove({
                    patId: request.params.patId
                }, function (err, result) {
    
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
    
                    if (result.n === 0) {
                        return reply(Boom.notFound());
                    }
    
                    reply().code(204);
                });
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/patients/{patId}/watjainormal/oldest',
        handler: function (request, reply) {

            db.WatjaiNormal.find({
                patId: request.params.patId
            }).sort({ measureTime : 1 } , (err, doc) => {
                
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
        path: '/patients/{patId}/watjainormal/latest',
        handler: function (request, reply) {

            db.WatjaiNormal.find({
                patId: request.params.patId
            }).sort({ measureTime : -1 } , (err, doc) => {
                
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
        path: '/patients/{patId}/watjainormal/lastecg',
        handler: function (request, reply) {

            db.WatjaiNormal.find({
                patId: request.params.patId
            }).sort({ measureTime : -1 } , (err, doc) => {
                
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
        method: 'GET',
        path: '/patients/{patId}/watjaimeasure/oldest',
        handler: function (request, reply) {

            db.WatjaiMeasure.find({
                patId: request.params.patId
            }).sort({ alertTime : 1 } , (err, doc) => {
                
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
        path: '/patients/{patId}/watjaimeasure/latest',
        handler: function (request, reply) {

            db.WatjaiMeasure.find({
                patId: request.params.patId
            }).sort({ alertTime : -1 } , (err, doc) => {
                
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
        path: '/patients/{patId}/watjaimeasure/lastecg',
        handler: function (request, reply) {

            db.WatjaiMeasure.find({
                patId: request.params.patId
            }).sort({ alertTime : -1 } , (err, doc) => {
                
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
        method: 'GET',
        path: '/patients/{patId}/history',
        handler: function (request, reply) {

            db.WatjaiMeasure.find({
                patId: request.params.patId
            }).sort({ alertTime : -1 } , (err, doc) => {
                
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
        name: 'routes-patients'
    };
