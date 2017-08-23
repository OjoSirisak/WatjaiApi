'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {

    const db = server.app.db;

    /**
     *  Start Doctor Section
     */

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

                reply(doc);
            });

        }
    });
    
    var year, month, day;
    var getDate;
    getDate = new Date(Date.now()).toISOString();
    console.log(getDate);
    getDate = getDate.substr(2, 8);
    year = getDate.substr(0, 2); 
    month = getDate.substr(3, 2);
    day = getDate.substr(6, 2);
    console.log(day);

    // create doctor user
    server.route({
        method: 'POST',
        path: '/doctors',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth;
            db.Doctors.find({}, { docId: 1, _id: 0 }).sort({ docId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getDocId = tmp[0].docId + "";
                    var getNumber = getDocId.substr(2, 7);
                    checkYear = getDocId.substr(2, 2);
                    checkMonth = getDocId.substr(4, 2);
                    if (year == checkYear && month == checkMonth) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "DO" + number;
                    } else {
                        genId = "DO" + year + month + "001";
                    }
                } else {
                    genId = "DO" + year + month + "001";
                }
                const doc = request.payload;

                //Create an id
                doc._id = uuid.v4();
                doc.docId = genId;

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
                    //docId: Joi.string().min(7).max(7).required(),
                    docTitle: Joi.string().min(3).max(3).required(),
                    docFirstName: Joi.string().min(2).max(50).required(),
                    docLastName: Joi.string().min(2).max(50).required(),
                    docTel: Joi.string().min(10).max(10).required(),
                    docPic: Joi.string()
                }
            }
        }
    });
    // create new user doctor 
    // fix input data
    /*server.route({
        method: 'POST',
        path: '/doctors',
        handler: function (request, reply) {
            var user = {
                id: request.payload.id,
                docId: request.payload.docId,
                fname: request.payload.fname,
                lname: request.payload.lname
            }
            db.Doctors.save(user);
            reply(user);
        }
    });*/

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
                    docPic: Joi.string()
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

    /**
     *  End Doctor Section
     */

    /**
    *  Start Patient Section
    */

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

            db.Patients.find({
                patId: request.params.patId
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


    // find with condition


    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            db.Patients.find({}, { patId: 1, _id: 0 }).sort({ patId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                reply(tmp);
                console.log(tmp[0].patId);
            })
        }
    });




    // create patient user
    server.route({
        method: 'POST',
        path: '/patients',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth;
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
                const patt = request.payload;
                //Create an id
                pat._id = uuid.v4();
                pat.birthDay = new Date(request.payload.birthDay);
                pat.aaa = new Date()
                pat.patId = genId;

                db.Patients.save(pat, { unique: true }, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(pat);
                });
            })
        },
        config: {
            validate: {
                payload: {
                    //patId: Joi.string().min(7).max(7).required(),
                    //patTitle: Joi.string().min(3).max(3).required(),
                    patFirstName: Joi.string().min(2).max(50).required(),
                    patLastName: Joi.string().min(2).max(50).required(),
                    birthDay: Joi.string().min(10).max(10).required(),
                    address: Joi.string().min(5).max(100).required(),
                    subDistrict: Joi.string().min(2).max(50).required(),
                    district: Joi.string().min(2).max(50).required(),
                    province: Joi.string().min(2).max(50).required(),
                    postcode: Joi.string().min(5).max(5).required(),
                    patTel: Joi.string().min(10).max(10).required(),
                    bloodType: Joi.string().min(1).max(3).required(),
                    underlyingDisease: Joi.string().min(2).max(100),
                    docId: Joi.string().min(9).max(9).required(),
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
                    //patTitle: Joi.string().min(3).max(3),
                    patFirstName: Joi.string().min(2).max(50),
                    patLastName: Joi.string().min(2).max(50),
                    birthDay: Joi.date(),
                    address: Joi.string().min(5).max(100),
                    subDistrict: Joi.string().min(2).max(50),
                    district: Joi.string().min(2).max(50),
                    province: Joi.string().min(2).max(50),
                    postcode: Joi.number().min(5).max(5),
                    patTel: Joi.string().min(10).max(10),
                    bloodType: Joi.string().min(1).max(3),
                    underlyingDisease: Joi.string().min(2).max(100),
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
        }
    });

    /**
     *  End Patient section
     */

    /**
    *  Start Measure Normal section
    */

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
        path: '/watjainormal/{measureNormId}',
        handler: function (request, reply) {

            db.WatjaiNormal.find({
                measureId: request.params.measureNormId
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

    // create Wat Jai Measure Normal
    server.route({
        method: 'POST',
        path: '/watjainormal',
        handler: function (request, reply) {
            var number, genId, checkYear, checkMonth, checkDay;
            db.WatjaiNormal.find({}, { measureId: 1, _id: 0 }).sort({ measureId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getMId = tmp[0].measureId + "";
                    var getNumber = getMId.substr(3, 11);
                    checkYear = getMId.substr(3, 2);
                    checkMonth = getMId.substr(5, 2);
                    checkDay = getMId.substr(7, 2);

                    if (year == checkYear && month == checkMonth && day == checkDay) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "MEN" + number;
                    } else {
                        genId = "MEN" + year + month + day + "00001";
                    }
                } else {
                    genId = "MEN" + year + month + day + "00001";
                }
                const measurenorm = request.payload;

                //Create an id
                measurenorm._id = uuid.v4();
                measurenorm.measureTime = new Date(Date.now()).toLocaleString();
                measurenorm.measureId = genId;

                db.WatjaiNormal.save(measurenorm, (err, result) => {

                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }

                    reply(measurenorm);
                });
            })
        },
        config: {
            validate: {
                payload: {
                    measureData: Joi.array().min(1).required()
                }
            }
        }
    });

    // update Measure Normal
    server.route({
        method: 'PATCH',
        path: '/watjainormal/{measureNormId}',
        handler: function (request, reply) {

            db.WatjaiNormal.update({
                measureId: request.params.measureNormId
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
                    measureData: Joi.array().min(1).required()
                }).required().min(1)
            }
        }
    });

    // delete Measure Normal user by Measure Normal id
    server.route({
        method: 'DELETE',
        path: '/watjainormal/{measureNormId}',
        handler: function (request, reply) {

            db.WatjaiNormal.remove({
                measureId: request.params.measureNormId
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

    /**
    *  End Measure Normal section
    */

    /**
    *  Start Measure Alert section
    */

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
                    var getNumber = getId.substr(3, 11);
                    checkYear = getId.substr(3, 2);
                    checkMonth = getId.substr(5, 2);
                    checkDay = getId.substr(7, 2);
                    if (year == checkYear && month == checkMonth && day == checkDay) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "MEA" + number;
                    } else {
                        genId = "MEA" + year + month + day + "00001";
                    }
                } else {
                    genId = "MEA" + year + month + day + "00001";
                }
                const measurealret = request.payload;

                //Create an id
                measurealret._id = uuid.v4();
                measurealret.alertTime = new Date(Date.now()).toLocaleString();
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

    // update Measure Alert
    server.route({
        method: 'PATCH',
        path: '/watjaialert/{measureAlertId}',
        handler: function (request, reply) {

            db.WatjaiAlert.update({
                alertId: request.params.measureAlertId
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
                    alertData: Joi.array().min(1).required()
                }).required().min(1)
            }
        }
    });

    // delete Measure Alert user by Measure Alert id
    server.route({
        method: 'DELETE',
        path: '/watjaialert/{measureAlertId}',
        handler: function (request, reply) {

            db.WatjaiNormal.remove({
                alertId: request.params.measureAlertId
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

    /**
    *  End Measure Alert section
    */

    return next();
};

exports.register.attributes = {
    name: 'routes-app'
};
