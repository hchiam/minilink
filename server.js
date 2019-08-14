'use strict';

var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');

var app = express();

var validUrlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
var rootUrl = 'https://minilink.glitch.me/'; // note the final '/' in the string
var shortenedUrlModel = null;

setEverythingUp();

function setEverythingUp() {
  setUpDatabaseConnection();
  shortenedUrlModel = setUpDatabaseRecordsFormat();
  useStyleSheetEtc();
  setUpShorteningGetRequest();
  setUpHomePage();
  setUpRedirectToShortenedUrl();
  setUpResponseToWrongRoutes();
  setUpResponseToServerErrors();
  listenToPort();
}

function setUpDatabaseConnection() {
    // set up database connection
    var mongoDB = 'mongodb://'+process.env.USER+':'+process.env.PASS+'@'+process.env.HOST+':'+process.env.DB_PORT+'/'+process.env.DB;
    mongoose.connect(mongoDB, { useMongoClient: true });
    var db = mongoose.connection; // default connection
    // set up to log errors upon connection error
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

function setUpDatabaseRecordsFormat() {
    var Schema = mongoose.Schema;
    var shortenedUrlSchema = new Schema({
        fullUrl: String,
        shortenedUrl: String
    });
    var shortenedUrlModel = mongoose.model('shortened_url', shortenedUrlSchema);
    return shortenedUrlModel;
}

function handleError(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
}

function makeShortenedURL() {
    var text = '';
    // note: when choosing characters, avoid similar-looking symbols, including when links are underlined
    var possible = 'BCDGHJMNPRSTVWYbcdfghjmnpqrstvwyz0123456789';
    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function setUpShorteningGetRequest() {
    app.get('/new/*', function(req, res) {
        var urlToShorten = req.params[0]; // get the '*' in '/new/*'
        var isRequestedUrlValid = validUrlRegex.test(urlToShorten);
        if (!isRequestedUrlValid) {
            console.log('invalid URL: ' + urlToShorten);
            res.send( {"Error": 'Invalid URL: ' + urlToShorten + " -> URLs must begin with http://, https://, or www. Example: " + rootUrl + "new/https://google.com'"} );
        } else {
            console.log(urlToShorten + ' is valid');
            shortenedUrlModel.findOne({ fullUrl: urlToShorten }, '-_id fullUrl shortenedUrl', function (err, alreadyExists) {
                if (err) return handleError(err);
                if (alreadyExists) {
                    return res.send('A shortened URL for "' + urlToShorten + '" already exists: <a href="' + rootUrl + alreadyExists.shortenedUrl + '">' + rootUrl + alreadyExists.shortenedUrl + '</a><input id="url-to-copy" type="text" value="' + rootUrl + alreadyExists.shortenedUrl + '" style="position: absolute; left: -1000px;"> <button onclick="document.getElementById(\'url-to-copy\').select();document.execCommand(\'copy\');">Copy to clipboard</button>');
                }
                
                var randomString = makeShortenedURL();
                // get new random string if shortened URL already exists
                shortenedUrlModel.findOne({ shortenedUrl: randomString }, function (err, alreadyExists) {
                    if (err) return handleError(err);
                    if (alreadyExists) {
                        randomString = makeShortenedURL(); // run makeShortenedURL() one more time
                    }
                });

                // actually create the new record
                var newMongoDbRecord = new shortenedUrlModel({ fullUrl: urlToShorten, shortenedUrl: randomString });
                console.log('New document created' + newMongoDbRecord);
                res.send(urlToShorten + '<br/> -> Here\'s your shortened URL: <a href="' + rootUrl + randomString + '">' + rootUrl + randomString + '</a><input id="url-to-copy" type="text" value="' + rootUrl + alreadyExists.shortenedUrl + '" style="position: absolute; left: -1000px;"> <button onclick="document.getElementById(\'url-to-copy\').select();document.execCommand(\'copy\');">Copy to clipboard</button>');  
                newMongoDbRecord.save(function (err) {
                    if (err) {
                        return err;
                    }
                });
            });
        }
    });
}

function useStyleSheetEtc() {
    // use things like public/style.css
    app.use('/public', express.static(process.cwd() + '/public'));
}

function setUpHomePage() {
    app.route('/').get(function(req, res) {
        res.sendFile(process.cwd() + '/views/index.html');
    });
}

function setUpRedirectToShortenedUrl() {
    app.get('/*', function (req, res) {
        var shortenedUrlPart = req.params[0]; // get the '*' in '/*'
        shortenedUrlModel.findOne({ shortenedUrl: shortenedUrlPart }, function (err, alreadyExists) {
            if (err) {
                return handleError(err);
            }
            if (alreadyExists) {
                console.log('redirecting to ' + alreadyExists.fullUrl);
                res.redirect(alreadyExists.fullUrl);
            } else {
                res.send('Please enter a valid shortened URL. To create a new shortened URL, call something like this: <a href="' + rootUrl + 'new/https://www.google.com">' + rootUrl + 'new/https://www.google.com</a>');
            }
        });
    });
}

function setUpResponseToWrongRoutes() {
    app.use(function(req, res, next){
        res.status(404);
        res.type('txt').send('Not found');
    });
}

function setUpResponseToServerErrors() {
    // error middleware
    app.use(function(err, req, res, next) {
        if (err) {
            res.status(err.status || 500)
            .type('txt')
            .send(err.message || 'SERVER ERROR');
        }
    });
}

function listenToPort() {
    app.listen(process.env.PORT, function () {
        console.log('Node.js is listening :)');
    });      
}