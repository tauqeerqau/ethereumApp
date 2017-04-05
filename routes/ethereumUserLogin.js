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
var jwt = require('jsonwebtoken');

var EthereumUser = require('./../models/EthereumUser');
var EthereumUserMobileCode = require('./../models/EthereumUserMobileCode');
var EthereumUserContactSyncing = require('./../models/EthereumUserContactSyncing');
var EthereumUserMobileDevices = require('./../models/EthereumUserMobileDevices');
var TransactionChart = require('./../models/TransactionChart');
var GasUsedChart = require('./../models/GasUsedChart');
var AverageGasLimitChart = require('./../models/AverageGasLimitChart');
var DashboardData = require('./../models/DashboardData');
var EthereumUserTransactions = require('./../models/EthereumUserTransactions');

// create reusable transporter object using the default SMTP transport
//let transporter = nodemailer.createTransport({
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'testingideofuzion@gmail.com',
        pass: 'quality123'
    }
});

var randomstring = require("randomstring");

var multipartMiddleware = multipart();


var postEthereumUserLoginRoute = router.route('/ethereumUserLogin');

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

var passcodeStatus = new PasscodeStatus({

});

var ethereumUserContactSyncing = new EthereumUserContactSyncing({

});

// Connection URL. This is where your mongodb server is running.

var url = utility.getURL();

mongoose.connect(url, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully Connected");
    }
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('I am Ethereum User');
});


postEthereumUserLoginRoute.post(function (req, res) {
    if (utility.validateEmail(req.body.userName) == true) {
        EthereumUser.findOne({ 'userEmail': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
            if (err) {
                res.send(err);
            } else {
                if (ethereumUser == null) {
                    response.message = "User does not Exist";
                    response.code = serverMessage.returnNotFound();
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
                    if (ethereumUser.isEmailVerified == false) {
                        response.message = "User Email Not Verified";
                        response.code = serverMessage.returnEmailNotVerified();
                        response.data = null;
                        res.json(response);
                        return;
                    }
                    else if (ethereumUser.isEmailVerified == true) {
                        var validate = password.validateHash(ethereumUser.userPassword, req.body.userPassword);
                        if (validate == true) {
                            var ethereumUserMobileDevices = new EthereumUserMobileDevices();
                            ethereumUserMobileDevices.userName = ethereumUser.userName;
                            ethereumUserMobileDevices._userId = ethereumUser._id;
                            ethereumUserMobileDevices.userMobileUniqueId = req.body.userMobileUniqueId;
                            ethereumUserMobileDevices.userMobileOSName = req.body.userMobileOSName;
                            ethereumUserMobileDevices.userMobileOSVersion = req.body.userMobileOSVersion;
                            ethereumUserMobileDevices.userDeviceName = req.body.userDeviceName;
                            var dt = dateTime.create();
                            var formatted = dt.format('Y-m-d H:M:S');
                            ethereumUserMobileDevices.userLastLoginTime = formatted;
                            ethereumUserMobileDevices.save(function (err) {
                                if (err) {

                                } else {
                                    EthereumUserMobileDevices.find({ 'userName': req.body.userName }, null, { sort: { userLastLoginTime: 'descending' } }, function (err, ethereumUserMobileDevices) {
                                        if (err) {

                                        } else {
                                            response.message = "User's Login  is Successfull";
                                            response.code = serverMessage.returnSuccess();
                                            var devicesNames = [];
                                            ethereumUserMobileDevices.forEach(function (element) {
                                                devicesNames.push(element.userDeviceName);
                                            }, this);
                                            ethereumUser.userGCM = req.body.userGCM;
                                            ethereumUser.save(function (err) {
                                                ethereumUser.ethereumUserLoginDetail = devicesNames;
                                                EthereumUserTransactions.find({}, function (err, ethereumUserTransactions) {
                                                    if (err) {

                                                    }
                                                    else {
                                                        var start = new Date();
                                                        start.setHours(0, 0, 0, 0);
                                                        start = start.toUTCString / 1000;
                                                        var end = new Date();
                                                        end.setHours(23, 59, 59, 999);
                                                        end = end.toUTCString / 1000;
                                                        var transactionsByDays = [];
                                                        for (var iDayCounter = 0; iDayCounter < 7; iDayCounter++) {
                                                            var dailyTransactions = [];
                                                            for (var iEthereumUserTransactionsCounter = 0; iEthereumUserTransactionsCounter < ethereumUserTransactions.length; iEthereumUserTransactionsCounter++) {
                                                                if (ethereumUserTransactions[iEthereumUserTransactionsCounter].createdOnUTC > start && ethereumUserTransactions[iEthereumUserTransactionsCounter].createdOnUTC <= end) {
                                                                    dailyTransactions.push(ethereumUserTransactions[iEthereumUserTransactionsCounter]);
                                                                }
                                                            }
                                                            var dailyTransactionWithDayObject = new Object();
                                                            dailyTransactionWithDayObject.day = iDayCounter;
                                                            dailyTransactionWithDayObject.count = dailyTransactions.length;
                                                            if (dailyTransactions.length > 0) {
                                                                transactionsByDays.push(dailyTransactionWithDayObject);
                                                            }
                                                            start = start + 86400;
                                                            end = end + 86400;
                                                        }
                                                        ethereumUser.transactionsByDays = transactionsByDays;
                                                    }
                                                    EthereumUserTransactions.find({ $or: [{ fromUser: ethereumUser._id }, { toUser: ethereumUser._id }] }, function (err, top2Transactions) {
                                                        ethereumUser.top2Transactions = top2Transactions;
                                                        var token = jwt.sign(user, "ETHEREUM", {
                                                            expiresIn: 60 * 60 * 24
                                                        });
                                                        ethereumUser.token = token;
                                                        response.data = ethereumUser;
                                                        res.json(response);
                                                    }).sort({ createdOnUTC: -1 }).limit(2);
                                                });
                                            });
                                        }
                                    }).limit(5);
                                }
                            });
                        }
                    }
                    else {
                        response.message = "User Password is incorrect";
                        response.code = serverMessage.returnPasswordMissMatch();
                        response.data = null;
                        res.json(response);
                    }
                }
            }
        });
    } else {
        EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
            if (err) {
                res.send(err);
            } else {
                if (ethereumUser == null) {
                    response.message = "User does not Exist";
                    response.code = serverMessage.returnNotFound();
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
                    if (ethereumUser.isEmailVerified == false) {
                        response.message = "User Email Not Verified";
                        response.code = serverMessage.returnEmailNotVerified();
                        response.data = null;
                        res.json(response);
                        return;
                    }
                    else if (ethereumUser.isEmailVerified == true) {
                        var validate = password.validateHash(ethereumUser.userPassword, req.body.userPassword);
                        if (validate == true) {
                            var ethereumUserMobileDevices = new EthereumUserMobileDevices();
                            ethereumUserMobileDevices.userName = ethereumUser.userName;
                            ethereumUserMobileDevices._userId = ethereumUser._id;
                            ethereumUserMobileDevices.userMobileUniqueId = req.body.userMobileUniqueId;
                            ethereumUserMobileDevices.userMobileOSName = req.body.userMobileOSName;
                            ethereumUserMobileDevices.userMobileOSVersion = req.body.userMobileOSVersion;
                            ethereumUserMobileDevices.userDeviceName = req.body.userDeviceName;
                            var dt = dateTime.create();
                            var formatted = dt.format('Y-m-d H:M:S');
                            ethereumUserMobileDevices.userLastLoginTime = formatted;
                            ethereumUserMobileDevices.save(function (err) {
                                if (err) {

                                } else {
                                    EthereumUserMobileDevices.find({ 'userName': req.body.userName }, null, { sort: { userLastLoginTime: 'descending' } }, function (err, ethereumUserMobileDevices) {
                                        if (err) {

                                        } else {
                                            response.message = "User's Login is Successfull";
                                            response.code = serverMessage.returnSuccess();
                                            var devicesNames = [];
                                            ethereumUserMobileDevices.forEach(function (element) {
                                                devicesNames.push(element.userDeviceName);
                                            }, this);
                                            ethereumUser.userGCM = req.body.userGCM;
                                            ethereumUser.save(function (err) {
                                                ethereumUser.ethereumUserLoginDetail = devicesNames;
                                                EthereumUserTransactions.find({}, function (err, ethereumUserTransactions) {
                                                    if (err) {

                                                    }
                                                    else {
                                                        var start = new Date();
                                                        start.setHours(0, 0, 0, 0);
                                                        start = start.toUTCString / 1000;
                                                        var end = new Date();
                                                        end.setHours(23, 59, 59, 999);
                                                        end = end.toUTCString / 1000;
                                                        var transactionsByDays = [];
                                                        for (var iDayCounter = 0; iDayCounter < 7; iDayCounter++) {
                                                            var dailyTransactions = [];
                                                            for (var iEthereumUserTransactionsCounter = 0; iEthereumUserTransactionsCounter < ethereumUserTransactions.length; iEthereumUserTransactionsCounter++) {
                                                                if (ethereumUserTransactions[iEthereumUserTransactionsCounter].createdOnUTC > start && ethereumUserTransactions[iEthereumUserTransactionsCounter].createdOnUTC <= end) {
                                                                    dailyTransactions.push(ethereumUserTransactions[iEthereumUserTransactionsCounter]);
                                                                }
                                                            }
                                                            var dailyTransactionWithDayObject = new Object();
                                                            dailyTransactionWithDayObject.Day = iDayCounter;
                                                            dailyTransactionWithDayObject.Transactions = dailyTransactions;
                                                            transactionsByDays.push(dailyTransactionWithDayObject);
                                                            start = start + 86400;
                                                            end = end + 86400;
                                                        }
                                                        ethereumUser.transactionsByDays = transactionsByDays;
                                                    }
                                                    EthereumUserTransactions.find({ $or: [{ fromUser: ethereumUser._id }, { toUser: ethereumUser._id }] }, function (err, top2Transactions) {
                                                        ethereumUser.top2Transactions = top2Transactions;
                                                        var token = jwt.sign(ethereumUser, "ETHEREUM", {
                                                            expiresIn: 60 * 60 * 24
                                                        });
                                                        ethereumUser.token = token;
                                                        response.data = ethereumUser;
                                                        res.json(response);
                                                    }).sort({ createdOnUTC: -1 }).limit(2);
                                                });
                                            });
                                        }
                                    }).limit(5);
                                }
                            });
                        } else {
                            response.message = "User Password is incorrect";
                            response.code = serverMessage.returnPasswordMissMatch();
                            response.data = null;
                            res.json(response);
                        }
                    }
                }
            }
        });
    }

});

module.exports = router;