const express = require('express'); //imports the Express module. express is a value exported by the express package (in fact it’s a function).

const {ServerConfig, LoggerConfig} = require('./config');
const apiRoutes = require('./routes');

const app = express(); //calls the above returned function to create an Express application instance (commonly named app). app is an object which represents my web application/serverno with methods like .get(), .post(), .use(), .listen(), etc.

app.use(express.json()); //middleware that parses incoming JSON requests and puts the parsed data in req.body
app.use(express.urlencoded({extended: true})); //middleware that parses incoming requests with URL-encoded payloads and is based on body-parser

app.use('/api', apiRoutes);

console.log("Server Configs Port:", ServerConfig.PORT);


// console.log(process.env);
// app.listen(ServerConfig.PORT, () => {
//     console.log("Actual port:", server.address().port);
//     console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
//     LoggerConfig.info("Successfully started the server");
//     //console.log(process.env);
// });

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    LoggerConfig.info("Successfully started the server");
    
});