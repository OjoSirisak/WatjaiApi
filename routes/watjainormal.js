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
                measureId: request.params.measureId
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

    // create Wat Jai Measure Normal
    server.route({
        method: 'POST',
        path: '/watjainormal',
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
            db.WatjaiNormal.find({}, { measureId: 1, _id: 0 }).sort({ measureId: -1 }).limit(1, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                const tmp = result;
                if (tmp[0] != null) {
                    var getMId = tmp[0].measureId + "";
                    var getNumber = getMId.substr(2, 11);
                    checkYear = getMId.substr(2, 2);
                    checkMonth = getMId.substr(4, 2);
                    checkDay = getMId.substr(6, 2);

                    if (year == checkYear && month == checkMonth && day == checkDay) {
                        number = parseInt(getNumber);
                        number = number + 1;
                        genId = "NM" + number;
                    } else {
                        genId = "NM" + year + month + day + "00001";
                    }
                } else {
                    genId = "NM" + year + month + day + "00001";
                }
                const measurenorm = request.payload;
                var date = new Date(Date.now());
                date.setUTCHours(date.getUTCHours() + 7);
                measurenorm.measureTime = date;
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
                    measureData: Joi.array().min(1).required(),
                    patId: Joi.string().min(9).max(9).required()
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/watjainormal/{patId}/history/5minute',
        handler: function (request, reply) {
            var getDate;
            getDate = new Date(Date.now());
            getDate.setUTCHours(getDate.getUTCHours() + 7);
            getDate.setUTCMinutes(getDate.getUTCMinutes() - 1);

                db.WatjaiNormal.find({ "measureTime" : { $gt : new Date(getDate)}, patId: request.params.patId}).sort({ measureTime : 1 } , (err, result) => {
                    if (err) {
                        return reply(Boom.wrap(err, 'Internal MongoDB error'));
                    }
                    
                    if (!result) {
                        return reply(Boom.notFound());
                    }
                    
                        reply(result);
                    
                });

        }
    });


    return next();
};

exports.register.attributes = {
    name: 'routes-watjainormal'
};
