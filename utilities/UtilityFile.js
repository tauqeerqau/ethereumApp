/**
 * Created by Tauqeer on 15-08-2016.
 */

var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');

var UtilityFile = function Constructor() {

};


UtilityFile.prototype.getURL = function () {
    // Connection URL. This is where your mongodb server is running.
//var url = 'mongodb://localhost:27017/HRMS';

    var url ='mongodb://tauqeer:ideofuzion123@ds151028.mlab.com:51028/ethereumdb';
  return url;
};

/**
 * Created by Tauqeer on 11-08-2016.
 */

module.exports = UtilityFile;

