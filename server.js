const HTTP = require('http');
const port = process.env.PORT || 3000;//accesses node.js env variables, or 3000
const app = require('./app');

const server = HTTP.createServer(app);

//start the server
server.listen(port);