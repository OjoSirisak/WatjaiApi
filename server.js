'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');




// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    //host: 'localhost',
    host: '128.199.245.253', 
    port: 3000
});

//Connect to db
server.app.db = mongojs('project:smartheart@128.199.245.253/Project?authMechanism=SCRAM-SHA-1', ['Doctors','Patients','WatjaiNormal','WatjaiAlert']);

//Load plugins and start server
server.route({
  method: 'GET',
  path: '/',
  handler: function(request, reply) {
    reply('<h1>Hello Hapi :)</h1');
  }
});

server.register([
    require('./routes/doctors'),require('./routes/patients'),require('./routes/watjainormal'),require('./routes/watjaialert'),require('./routes/search')
], (err) => {

    if (err) {
        throw err;
    }

    // Start the server
    server.start((err) => {
        console.log('Server running at:', server.info.uri);
    });

});
