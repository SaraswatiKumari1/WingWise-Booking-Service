const dotenv = require('dotenv'); //The require() function is a built-in Node.js method used to import external modules (packages or files).Here, it loads the npm package named dotenv

dotenv.config(); //config will read your .env file, parse the contents, assign it to process.env, and return an     Object with a parsed key containing the loaded content or an error key if it failed.

//dotenv->Object, and dotenv.config() returns an object with parsed variables.It also adds those variables to process.env

module.exports = {
    PORT: process.env.PORT
}