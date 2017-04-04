var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuid = require('node-uuid');
var fs = require("fs");
var sinchAuth = require('sinch-auth');
var sinchSms = require('sinch-messaging');
var Client = require('node-rest-client').Client;
var dateTime = require('node-datetime');
'use strict';
const nodemailer = require('nodemailer');

var EthereumUser = require('./../models/EthereumUser');
var EthereumUserTransactions = require('./../models/EthereumUserTransactions');

var multipartMiddleware = multipart();

var postEthereumUserTransactionRoute = router.route('/postEthereumUserTransaction');

var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');
var ServerMessage = require('./../utilities/ServerMessages');
var PasscodeStatus = require('./../utilities/PasscodeStatuses');

var utility = new Utility({});

var password = new Password({});

var response = new Response({

});

var serverMessage = new ServerMessage({

});



// Connection URL. This is where your mongodb server is running.

var url = utility.getURL();

mongoose.createConnection(url, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully Connected");
    }
});


postEthereumUserTransactionRoute.post(function(req,res){
    var ethereumUserTransactions = new EthereumUserTransactions();
    ethereumUserTransactions.fromUser = req.body.fromUser;
    ethereumUserTransactions.toUser = req.body.toUser;
    ethereumUserTransactions.transactionAmount = req.body.transactionAmount;
    ethereumUserTransactions.transactionReason = req.body.transactionReason;
    ethereumUserTransactions.createdOnUTC = Math.floor(new Date() / 1000);
    ethereumUserTransactions.updatedOnUTC = Math.floor(new Date() / 1000);
    ethereumUserTransactions.transactionId = req.body.transactionId;
    ethereumUserTransactions.save(function(err,ethereumUserTransaction){
        if(err)
        {
            response.message = "Failure";
            response.code = serverMessage.returnFailure();
            response.data = null;
            res.json(response);
        }
        else
        {
            response.message = "Success";
            response.code = serverMessage.returnSuccess();
            response.data = ethereumUserTransaction;
            res.json(response);
        }
    });
});

module.exports = router;