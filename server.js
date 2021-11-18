import express from 'express';
import path from 'path';
import fs from 'fs';

import loggerfrom from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import logger from './core/logger/app.logger';
import config from './core/config/config.dev';
import connectToDb from './db/connect';
import utility from './core/utility';


import user from './routes/user.router.js';
import cron from './routes/cron.router.js';



import cors from 'cors';
import fileUpload from 'express-fileupload';
import engine from 'ejs-locals';




const port = config.serverPort;
logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};

async function connectToMongo() {
    connectToDb();
}
connectToMongo();


var app = express();



var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
    res.send('Med-Alert server working...!')
});


app.use(fileUpload());

// view engine setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));






// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(loggerfrom('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));



app.use(cors());

// app.use(utility.jwtAuth);


app.use(user);
app.use(cron);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');

    err.status = 404;
    //next(err);

    // HTTP status 404: NotFound
    res.status(404).send({ 'status': 404, 'msg': 'Not found' });
});







app = require('http').createServer(app);



console.log('run port on server...', port)
app.listen(port);





module.exports = app;