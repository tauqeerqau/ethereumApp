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

var EthereumUser = require('./../models/EthereumUser');
var EthereumUserMobileCode = require('./../models/EthereumUserMobileCode');
var EthereumUserContactSyncing = require('./../models/EthereumUserContactSyncing');
var EthereumUserMobileDevices = require('./../models/EthereumUserMobileDevices');
var TransactionChart = require('./../models/TransactionChart');
var GasUsedChart = require('./../models/GasUsedChart');
var AverageGasLimitChart = require('./../models/AverageGasLimitChart');
var DashboardData = require('./../models/DashboardData');

var multipartMiddleware = multipart();

var postEthereumUserRoute = router.route('/addEthereumUser');
var getEthereumUserRoute = router.route('/getEthereumUsers');
var getAboutTextRoute = router.route('/getAboutText');
var getTermsAndConditionsTextRoute = router.route('/getTermsAndConditionsText');
var postEthereumUserLoginRoute = router.route('/ethereumUserLogin');
var postEthereumUserMobileRoute = router.route('/ethereumUserMobileChange');
var postEthereumUserCompleteProfileRoute = router.route('/ethereumUserCompleteProfile');
var postEthereumUserMobileCodeRoute = router.route('/ethereumUserMobileCode');
var postEthereumUserSyncContactsRoute = router.route('/ethereumUserSyncContacts');
var postEthereumUserMobileNumberSyncRoute = router.route('/ethereumUserMobileNumberSync');
var postEthereumUserAddPasscodeRoute = router.route('/ethereumUserAddPasscode');
var postEthereumUserChangePasswordRoute = router.route('/ethereumUserChangePassword');
var postEthereumUserChangePasscodeRoute = router.route('/ethereumUserChangePasscode');
var postEthereumUsersLoginListWithDevicesRoute = router.route('/ethereumUsersLoginListWithDevices');
var postEthereumUsersChangePasscodeStatusRoute = router.route('/ethereumUsersChangePasscodeStatus');
var postEthereumUsersChangeDoubleAuthenticationRoute = router.route('/ethereumUsersChangeDoubleAuthentication');
var postEthereumUsersChangeNotificationStatusRoute = router.route('/ethereumUsersChangeNotificationStatus');
var postConvertGivenTwoCurrenciesRoute = router.route('/convertGivenTwoCurrencies');
var postConvertFromSourceToTargetCurrenciesRoute = router.route('/convertFromSourceToTargetCurrencies');
var getAllCurrenciesRoute = router.route('/getAllCurrencies');
var getDasboardDataRoute = router.route('/getDasboardData');
var getChartForDailyTransactionsDataRoute = router.route('/getChartForDailyTransactionsData');
var getTotalDailyGasUsedDataRoute = router.route('/getTotalDailyGasUsedData');
var getAverageGasLimitChartDataRoute = router.route('/getAverageGasLimitChartData');
var getSaveNetworkStatsInDatabaseRoute = router.route('/getSaveNetworkStatsInDatabase');
var postGetUserByContactNumberRoute = router.route('/getUserByContactNumber');

var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');
var ServerMessage = require('./../utilities/ServerMessages');
var PasscodeStatus = require('./../utilities/PasscodeStatuses');

var utility = new Utility(
    {
    });

var password = new Password(
    {
    });

var response = new Response(
    {

    });

var serverMessage = new ServerMessage(
    {

    });

var passcodeStatus = new PasscodeStatus(
    {

    }
);

var ethereumUserContactSyncing = new EthereumUserContactSyncing(
    {

    });

// Connection URL. This is where your mongodb server is running.

var url = utility.getURL();

mongoose.connect(url, function (err, db) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Successfully Connected");
    }
});


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('I am Ethereum User');
});

postEthereumUserRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (ethereumUser != null) {
            response.message = "User already Exists";
            response.code = serverMessage.returnUserAlreadyExists();
            response.data = ethereumUser;
            res.json(response);
        }
        else {
            ethereumUser = new EthereumUser();
            ethereumUser.userName = req.body.userName;
            ethereumUser.userEmail = req.body.userEmail;
            ethereumUser.userContactNumber = req.body.userContactNumber;
            ethereumUser.userPassword = password.createHash(req.body.userPassword);
            ethereumUser.userEthereumId = req.body.userEthereumId;
            ethereumUser.ethereumUserApplicationToken = Math.floor(Math.random() * 900000) + 100000;
            ethereumUser.userProfileStatus = 1;
            ethereumUser.ethereumUserPasscodeStatus = passcodeStatus.returnNotSet();
            ethereumUser.ethereumUserDoubleAuthenticationMode = passcodeStatus.returnPasscodeOff();
            ethereumUser.ethereumUserNotificationStatus = passcodeStatus.returnPasscodeOn();
            ethereumUser.userGCM = req.body.userGCM;
            ethereumUser.save(function (err) {
                if (err) {
                    res.send(err);
                }
                else {
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

                        }
                        else {
                            response.message = "User Added Successfully";
                            response.code = serverMessage.returnSuccess();;
                            response.data = ethereumUser;
                            res.json(response);
                        }
                    });
                }
            });

        }
    });
});



getEthereumUserRoute.get(function (req, res) {
    EthereumUser.find({}, null, { sort: { '_id': -1 } }, function (err, ethereumUsers) {
        if (err) {
            res.send(err);
        }
        else {
            response.message = "Success";
            response.code = serverMessage.returnSuccess();
            response.data = ethereumUsers;
            res.json(response);
        }
    });
});

postEthereumUserLoginRoute.post(function (req, res) {
    if (utility.validateEmail(req.body.userName) == true) {
        EthereumUser.findOne({ 'userEmail': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
            if (err) {
                res.send(err);
            }
            else {
                if (ethereumUser == null) {
                    response.message = "User does not Exist";
                    response.code = serverMessage.returnNotFound();
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
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

                            }
                            else {
                                EthereumUserMobileDevices.find({ 'userName': req.body.userName }, null, { sort: { userLastLoginTime: 'descending' } }, function (err, ethereumUserMobileDevices) {
                                    if (err) {

                                    }
                                    else {
                                        response.message = "User's Login  is Successfull";
                                        response.code = serverMessage.returnSuccess();
                                        var devicesNames = [];
                                        ethereumUserMobileDevices.forEach(function (element) {
                                            devicesNames.push(element.userDeviceName);
                                        }, this);
                                        ethereumUser.userGCM = req.body.userGCM;
                                        ethereumUser.save(function (err) {
                                            ethereumUser.ethereumUserLoginDetail = devicesNames;
                                            response.data = ethereumUser;
                                            res.json(response);
                                        });
                                    }
                                }).limit(5);
                            }
                        });
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
    }
    else {
        EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
            if (err) {
                res.send(err);
            }
            else {
                if (ethereumUser == null) {
                    response.message = "User does not Exist";
                    response.code = serverMessage.returnNotFound();
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
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

                            }
                            else {
                                EthereumUserMobileDevices.find({ 'userName': req.body.userName }, null, { sort: { userLastLoginTime: 'descending' } }, function (err, ethereumUserMobileDevices) {
                                    if (err) {

                                    }
                                    else {
                                        response.message = "User's Login is Successfull";
                                        response.code = serverMessage.returnSuccess();
                                        var devicesNames = [];
                                        ethereumUserMobileDevices.forEach(function (element) {
                                            devicesNames.push(element.userDeviceName);
                                        }, this);
                                        ethereumUser.userGCM = req.body.userGCM;
                                        ethereumUser.save(function (err) {
                                            ethereumUser.ethereumUserLoginDetail = devicesNames;
                                            response.data = ethereumUser;
                                            res.json(response);
                                        });
                                    }
                                }).limit(5);
                            }
                        });
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
    }

});

postEthereumUserMobileRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            res.send(err);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = serverMessage.returnNotFound();
                response.data = null;
                res.json(response);
            }
            if (ethereumUser != null) {
                EthereumUserMobileCode.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUserMobileCode) {
                    if (ethereumUserMobileCode == null) {
                        response.message = "User Code is not sent yet";
                        response.code = serverMessage.returnNotFound();
                        response.data = null;
                        res.json(response);
                    }
                    else {
                        if (ethereumUserMobileCode.userMobileCode == req.body.userMobileCode) {
                            ethereumUser.userContactNumber = ethereumUserMobileCode.userContactNumber;
                            ethereumUser.userProfileStatus = 2;
                            ethereumUser.save(function (err, ethereumUser) {
                                if (err) {

                                }
                                else {
                                    response.message = "User Mobile Number is Updated";
                                    response.code = serverMessage.returnSuccess();;
                                    response.data = ethereumUser;
                                    res.json(response);
                                }
                            });
                        }
                        else {
                            response.message = "Code Entered is Invalid";
                            response.code = serverMessage.returnPasswordMissMatch();;
                            response.data = ethereumUser;
                            res.json(response);
                        }
                    }
                });
            }
        }

    });
});

postEthereumUserCompleteProfileRoute.post(multipartMiddleware, function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            res.send(err);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = serverMessage.returnNotFound;
                response.data = null;
                res.json(response);
            }
            if (ethereumUser != null) {
                ethereumUser.userOccupation = req.body.userOccupation;
                ethereumUser.userAddress = req.body.userAddress;
                ethereumUser.userFullName = req.body.userFullName;
                ethereumUser.userEmail = req.body.userEmail;
                if (req.files.file != null) {
                    var extension = "";
                    if (req.files.file.headers['content-type'] == 'image/jpeg') {
                        extension = ".jpg";
                    }
                    else if (req.files.file.headers['content-type'] == 'image/png') {
                        extension = ".png";
                    }
                    var imageName = uuid.v4() + extension;
                    var fullUrl = req.protocol + '://' + req.get('host');
                    var file = __dirname + "./../public/images/" + imageName;
                    fs.readFile(req.files.file.path, function (err, data) {
                        fs.writeFile(file, data, function (err) {
                            console.log(data);
                            if (err) {
                                console.log(err);
                            } else {
                                ethereumUser.userProfilePictureURL = fullUrl + "/images/" + imageName;
                                ethereumUser.save(function (err) {
                                    if (err) {
                                        res.send(err);
                                    }
                                    else {
                                        response.message = "User Profile Added Successfully";
                                        response.code = serverMessage.returnSuccess();;
                                        response.data = ethereumUser;
                                        res.json(response);
                                    }
                                });
                            }
                        });
                    });
                }
                else {
                    ethereumUser.save(function (err) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            response.message = "User Profile Added Successfully";
                            response.code = serverMessage.returnSuccess();;
                            response.data = ethereumUser;
                            res.json(response);
                        }
                    });
                }
            }
        }

    });
});

postEthereumUserMobileCodeRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userContactNumber': req.body.userContactNumber }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            response.message = "User Mobile Code is not Saved";
            response.code = serverMessage.returnFailure();
            response.data = err;
            res.json(response);
        }
        if (ethereumUser != null) {
            response.message = "User with this Contact Number Already Exists";
            response.code = serverMessage.returnUserAlreadyExists();
            response.data = err;
            res.json(response);
        }
        else {
            EthereumUserMobileCode.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUserMobileCode) {
                if (ethereumUserMobileCode == null) {
                    ethereumUserMobileCode = new EthereumUserMobileCode();
                    ethereumUserMobileCode.userName = req.body.userName;
                    ethereumUserMobileCode.userContactNumber = '+' + req.body.userContactNumber;
                    ethereumUserMobileCode.userMobileCode = Math.floor(Math.random() * 9000) + 1000;
                    ethereumUserMobileCode.save(function (err, etherUserMobileCode) {
                        if (err) {
                            response.message = "User Mobile Code is not Saved";
                            response.code = serverMessage.returnFailure();;
                            response.data = err;
                            res.json(response);
                        }
                        else {
                            var sinchSms = require('sinch-sms')({
                                key: '44366d3f-d7b9-42f2-8f41-de72956b2ab4',
                                secret: 'jOLGxUbOcU6oEu4TAx09Eg=='
                            });
                            sinchSms.send(etherUserMobileCode.userContactNumber, 'Hi, Your Mobile Code is ' + etherUserMobileCode.userMobileCode).then(function (resp) {
                                //All good, response contains messageId
                                response.message = "User Mobile Code is Saved";
                                response.code = serverMessage.returnSuccess();
                                response.data = etherUserMobileCode;
                                var status = sinchSms.getStatus(resp.messageId);
                                res.json(response);
                            }).fail(function (error) {
                                response.message = "User Mobile Code is not Sent";
                                response.code = serverMessage.returnFailure();
                                response.data = error;
                                res.json(response);
                                // Some type of error, see error object
                                console.log(error);
                            });
                        }
                    });
                }
                else {
                    ethereumUserMobileCode.userName = req.body.userName;
                    ethereumUserMobileCode.userContactNumber = '+' + req.body.userContactNumber;
                    ethereumUserMobileCode.userMobileCode = Math.floor(Math.random() * 9000) + 1000;
                    ethereumUserMobileCode.save(function (err, etherUserMobileCode) {
                        if (err) {
                            response.message = "User Mobile Code is not Saved";
                            response.code = serverMessage.returnFailure();;
                            response.data = err;
                            res.json(response);
                        }
                        else {
                            var sinchSms = require('sinch-sms')({
                                key: '44366d3f-d7b9-42f2-8f41-de72956b2ab4',
                                secret: 'jOLGxUbOcU6oEu4TAx09Eg=='
                            });
                            sinchSms.send(etherUserMobileCode.userContactNumber, 'Hi, Your Mobile Code is ' + etherUserMobileCode.userMobileCode).then(function (resp) {
                                //All good, response contains messageId
                                response.message = "User Mobile Code is Sent";
                                response.code = serverMessage.returnSuccess();
                                response.data = etherUserMobileCode;
                                var status = sinchSms.getStatus(resp.messageId);
                                res.json(response);
                            }).fail(function (error) {
                                //All good, response contains messageId
                                response.message = "User Mobile Code is not Sent";
                                response.code = serverMessage.returnFailure();
                                response.data = error;
                                res.json(response);
                                // Some type of error, see error object
                                console.log(error);
                            });
                        }
                    });
                }
            });
        }
    });
});

postEthereumUserSyncContactsRoute.post(function (req, res) {
    var arrayToSend = [];
    var arrayOfNumbers = JSON.parse(req.body.mobileNumberList);
    EthereumUser.find({}, 'userContactNumber', { sort: { '_id': -1 } }, function (err, ethereumUsersContactNumber) {
        if (err) {

        }
        else {
            for (var iNumberCount = 0; iNumberCount < arrayOfNumbers.length; iNumberCount++) {
                ethereumUserContactSyncing = new EthereumUserContactSyncing();
                ethereumUserContactSyncing.userContactNumber = arrayOfNumbers[iNumberCount];
                ethereumUserContactSyncing.doesNumberExist = utility.checkIfElementExistsInArray(ethereumUsersContactNumber, arrayOfNumbers[iNumberCount]);
                if (ethereumUserContactSyncing.doesNumberExist == true) {
                    arrayToSend.push(ethereumUserContactSyncing.userContactNumber);
                }
            }
            response.message = "Mobile Numbers are Synced";
            response.code = serverMessage.returnSuccess();
            response.data = arrayToSend;
            res.json(response);
        }
    });
});

postEthereumUserMobileNumberSyncRoute.post(function (req, res) {
    console.log(req.body.userName);
    console.log(req.body.authToken);
    var arrayToSend = [];
    var arrayOfNumbers = JSON.parse(req.body.mobileNumberList);
    EthereumUser.find({}, 'userContactNumber', { sort: { '_id': -1 } }, function (err, ethereumUsersContactNumber) {
        if (err) {

        }
        else {
            for (var iNumberCount = 0; iNumberCount < arrayOfNumbers.length; iNumberCount++) {
                ethereumUserContactSyncing = new EthereumUserContactSyncing();
                ethereumUserContactSyncing.userContactNumber = arrayOfNumbers[iNumberCount].m;
                ethereumUserContactSyncing.doesNumberExist = utility.checkIfElementExistsInArray(ethereumUsersContactNumber, arrayOfNumbers[iNumberCount].m);
                if (ethereumUserContactSyncing.doesNumberExist == true) {
                    arrayToSend.push(arrayOfNumbers[iNumberCount].c);
                }
            }
            response.message = "Mobile Numbers are Synced";
            response.code = serverMessage.returnSuccess();
            response.data = arrayToSend;
            res.json(response);
        }
    });
});

postEthereumUserChangePasswordRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (ethereumUser == null) {
            response.message = "User does not Exist";
            response.code = serverMessage.returnUserAlreadyExists();
            response.data = ethereumUser;
            res.json(response);
        }
        else {
            var validate = password.validateHash(ethereumUser.userPassword, req.body.userOldPassword);
            if (validate == true) {
                ethereumUser.userPassword = password.createHash(req.body.userNewPassword);
                ethereumUser.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.message = "User Password Updated Successfully";
                        response.code = serverMessage.returnSuccess();;
                        response.data = ethereumUser;
                        res.json(response);
                    }
                });

            }
            else {
                response.message = "User Old Password is incorrect";
                response.code = serverMessage.returnPasswordMissMatch();
                response.data = null;
                res.json(response);
            }
        }
    });
});

postEthereumUserAddPasscodeRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (ethereumUser == null) {
            response.message = "User does not Exist";
            response.code = serverMessage.returnUserAlreadyExists();
            response.data = ethereumUser;
            res.json(response);
        }
        else {
            ethereumUser.ethereumUserPasscode = req.body.passcode;
            ethereumUser.ethereumUserPasscodeStatus = passcodeStatus.returnPasscodeOff();
            ethereumUser.save(function (err) {
                if (err) {
                    res.send(err);
                }
                else {
                    response.message = "User Passcode Added Successfully";
                    response.code = serverMessage.returnSuccess();;
                    response.data = ethereumUser;
                    res.json(response);
                }
            });
        }
    });
});

postEthereumUserChangePasscodeRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (ethereumUser == null) {
            response.message = "User does not Exist";
            response.code = serverMessage.returnUserAlreadyExists();
            response.data = ethereumUser;
            res.json(response);
        }
        else {
            if (ethereumUser.ethereumUserPasscode == req.body.oldPasscode) {
                ethereumUser.ethereumUserPasscode = req.body.newPasscode;
                ethereumUser.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        response.message = "User Passcode Updated Successfully";
                        response.code = serverMessage.returnSuccess();;
                        response.data = ethereumUser;
                        res.json(response);
                    }
                });

            }
            else {
                response.message = "User Old Passcode is incorrect";
                response.code = serverMessage.returnPasswordMissMatch();
                response.data = null;
                res.json(response);
            }
        }
    });
});

postEthereumUsersLoginListWithDevicesRoute.post(function (req, res) {
    EthereumUserMobileDevices.find({ 'userName': req.body.userName }, null, { sort: { userLastLoginTime: 'descending' } }, function (err, ethereumUserMobileDevices) {
        if (err) {

        }
        else {
            response.message = "User's Login Details";
            response.code = serverMessage.returnSuccess();
            response.data = ethereumUserMobileDevices;
            res.json(response);
        }
    }).limit(5);
});

postEthereumUsersChangePasscodeStatusRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            response.message = "Error in Getting User Details";
            response.code = serverMessage.returnFailure();
            response.data = null;
            res.json(response);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = serverMessage.returnNotFound();
                response.data = null;
                res.json(response);
            }
            else {
                if (ethereumUser.ethereumUserPasscodeStatus == passcodeStatus.returnNotSet()) {
                    ethereumUser.ethereumUserPasscodeStatus = passcodeStatus.returnPasscodeOff();
                }
                else if (ethereumUser.ethereumUserPasscodeStatus == passcodeStatus.returnPasscodeOff()) {
                    ethereumUser.ethereumUserPasscodeStatus = passcodeStatus.returnPasscodeOn();
                }
                else if (ethereumUser.ethereumUserPasscodeStatus == passcodeStatus.returnPasscodeOn()) {
                    ethereumUser.ethereumUserPasscodeStatus = passcodeStatus.returnPasscodeOff();
                }
                ethereumUser.save(function (err) {
                    response.message = "Passcode status updated Successfully";
                    response.code = serverMessage.returnSuccess();
                    response.data = ethereumUser;
                    res.json(response);
                });
            }
        }
    });
});

getAboutTextRoute.get(function (req, res) {
    res.json("<b>I am about Text");
});

getTermsAndConditionsTextRoute.get(function (req, res) {
    res.json("<b>I am Terms & Conditions Text");
});

postEthereumUsersChangeDoubleAuthenticationRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            response.message = "Error in Getting User Details";
            response.code = serverMessage.returnFailure();
            response.data = null;
            res.json(response);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = serverMessage.returnNotFound();
                response.data = null;
                res.json(response);
            }
            else {

                if (ethereumUser.ethereumUserDoubleAuthenticationMode == passcodeStatus.returnPasscodeOff()) {
                    ethereumUser.ethereumUserDoubleAuthenticationMode = passcodeStatus.returnPasscodeOn();
                }
                else if (ethereumUser.ethereumUserDoubleAuthenticationMode == passcodeStatus.returnPasscodeOn()) {
                    ethereumUser.ethereumUserDoubleAuthenticationMode = passcodeStatus.returnPasscodeOff();
                }
                ethereumUser.save(function (err) {
                    response.message = "Double Authentication Mode Updated Successfully";
                    response.code = serverMessage.returnSuccess();
                    response.data = ethereumUser;
                    res.json(response);
                });
            }
        }
    });
});

postEthereumUsersChangeNotificationStatusRoute.post(function (req, res) {
    EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            response.message = "Error in Getting User Details";
            response.code = serverMessage.returnFailure();
            response.data = null;
            res.json(response);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = serverMessage.returnNotFound();
                response.data = null;
                res.json(response);
            }
            else {

                if (ethereumUser.ethereumUserNotificationStatus == passcodeStatus.returnPasscodeOff()) {
                    ethereumUser.ethereumUserNotificationStatus = passcodeStatus.returnPasscodeOn();
                }
                else if (ethereumUser.ethereumUserNotificationStatus == passcodeStatus.returnPasscodeOn()) {
                    ethereumUser.ethereumUserNotificationStatus = passcodeStatus.returnPasscodeOff();
                }
                ethereumUser.save(function (err) {
                    response.message = "Double Authentication Mode Updated Successfully";
                    response.code = serverMessage.returnSuccess();
                    response.data = ethereumUser;
                    res.json(response);
                });
            }
        }
    });
});

postConvertGivenTwoCurrenciesRoute.post(function (req, res) {
    var sourceCurrency = req.body.sourceCurrency;
    var targetCurrency = req.body.targetCurrency;
    var client = new Client();
    var urlString = "https://min-api.cryptocompare.com/data/price?fsym=" + sourceCurrency + "&tsyms=" + targetCurrency;
    client.get(urlString, function (data, resp) {
        response.message = "Currency is converted";
        response.code = serverMessage.returnSuccess();
        response.data = data;
        res.json(response);
    });
});

postConvertFromSourceToTargetCurrenciesRoute.post(function (req, res) {
    var sourceCurrency = req.body.sourceCurrency;
    var jsonfile = require('jsonfile');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = __dirname + "./../public/currency.json";
    var currencyGreaterThan20 = false;
    var urlStringForFirst20 = "https://min-api.cryptocompare.com/data/price?fsym=" + sourceCurrency + "&tsyms=";
    var urlStringForNext20 = "https://min-api.cryptocompare.com/data/price?fsym=" + sourceCurrency + "&tsyms=";
    jsonfile.readFile(file, function (err, obj) {
        if (err) {
            console.log(err);
        }
        for (var i = 0; i < obj.length; i++) {
            var obj1 = obj[i];
            console.log(obj1.value);
            if (i < 20) {
                urlStringForFirst20 = urlStringForFirst20 + obj1.value + ",";
            }
            else {
                urlStringForNext20 = urlStringForNext20 + obj1.value + ",";
                currencyGreaterThan20 = true;
            }
        }
        var client = new Client();
        client.get(urlStringForFirst20, function (dataForFirst20, resp) {
            if (currencyGreaterThan20 == true) {
                client.get(urlStringForNext20, function (dataForNext20, respon) {
                    var obj2 = new Object();
                    response.message = "Currency is converted";
                    response.code = serverMessage.returnSuccess();
                    var object3 = extend({}, dataForFirst20, dataForNext20);
                    console.log(object3);
                    response.data = object3;
                    res.json(response);
                });
            }
            else {
                response.message = "Currency is converted";
                response.code = serverMessage.returnSuccess();
                response.data = responseArray;
                res.json(response);
            }
        });
    });
});

getAllCurrenciesRoute.get(function (req, res) {
    var jsonfile = require('jsonfile');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = __dirname + "./../public/currency.json";
    jsonfile.readFile(file, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            response.message = "Currency's list";
            response.code = serverMessage.returnSuccess();
            response.data = data;
            res.json(response);
        }
    });
});

function extend(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function (source) {
        for (var prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
}

getDasboardDataRoute.get(function (req, res) {
    DashboardData.findOne({}, null, { sort: { '_id': -1 } }, function (err, dashboardDataObject) {
    var obj = new Object();
    obj.averageBlockTime = dashboardDataObject.averageBlockTime;
    obj.hashRate = dashboardDataObject.hashRate;
    obj.lastBlock = dashboardDataObject.lastBlock;
    obj.currentRate = dashboardDataObject.currentRate;
    obj.difficulty = dashboardDataObject.difficulty;
    obj.uncleRate = dashboardDataObject.uncleRate;
    obj.gasLimit = dashboardDataObject.gasLimit;
    obj.gasPrice = dashboardDataObject.gasPrice;
    obj.activeNodeCount = dashboardDataObject.activeNodeCount;
    obj.marketCapacity = dashboardDataObject.marketCapacity;
    obj.totalTransactionCount = dashboardDataObject.totalTransactionCount;
	obj.totalSupply = dashboardDataObject.totalSupply;
    AverageGasLimitChart.find({}, null, { sort: { '_id': -1 } }, function (err, averageGasLimitChartData) {
        obj.blockTimeChartData = averageGasLimitChartData;
        GasUsedChart.find({}, null, { sort: { '_id': -1 } }, function (err, gasUsedChartData) {
            obj.gasUsedChartData = gasUsedChartData;
            TransactionChart.find({}, null, { sort: { '_id': -1 } }, function (err, transactionChartData) {
                obj.transactionChartData = transactionChartData;
                res.json(obj);
            }).limit(10);
        }).limit(10);
    }).limit(10);
    });
});
//test
getChartForDailyTransactionsDataRoute.get(function (req, res) {
    var http = require('http');
    var fs = require('fs');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = __dirname + "./../public/blocksize.txt";
    var fileToBeUploaded = fs.createWriteStream(file);
    var dataToSend = [];
    var request = http.get("http://etherscan.io/chart/tx?output=csv", function (response) {
        response.pipe(fileToBeUploaded);
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
        });
        var readline = require('linebyline'),
            rl = readline(file);
        rl.on('line', function (line, lineCount, byteCount) {
            // do something with the line of text 
            console.log(lineCount);
        })
            .on('error', function (e) {
                // something went wrong 
            })
            .on('end', function (e) {
                console.log("Finished");
                res.json(dataToSend);
                dataToSend.forEach(function (element) {
                    var transactionChart = new TransactionChart();
                    transactionChart.transactionTimestamp = element.timestamp;
                    transactionChart.transactionValue = element.value;
                    transactionChart.save(function (req, res) {

                    });
                }, this);
            });
        var i = 0;
        console.log(lineReader);
        lineReader.on('line', function (line, lineCount, byteCount) {
            console.log('Line from file:', line);
            console.log('Line Count : ' + lineCount);
            i++;
            if (i > 3) {
                var lineData = line.split(';');
                var obj = new Object();
                obj.timestamp = lineData[0];
                obj.value = lineData[1];
                console.log(lineData[0]);
                console.log(lineData[1]);
                dataToSend.push(obj);
            }

            if (line == null) {
                res.json(dataToSend);
            }
        });
    });
});

getTotalDailyGasUsedDataRoute.get(function (req, res) {
    var http = require('http');
    var fs = require('fs');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = __dirname + "./../public/GasUsedChart.txt";
    var fileToBeUploaded = fs.createWriteStream(file);
    var dataToSend = [];
    var request = http.get("http://etherscan.io/chart/gasused?output=csv", function (response) {
        response.pipe(fileToBeUploaded);
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
        });
        var readline = require('linebyline'),
            rl = readline(file);
        rl.on('line', function (line, lineCount, byteCount) {
            // do something with the line of text 
            console.log(lineCount);
        })
            .on('error', function (e) {
                // something went wrong 
            })
            .on('end', function (e) {
                console.log("Finished");
                res.json(dataToSend);
                dataToSend.forEach(function (element) {
                    var gasUsedChart = new GasUsedChart();
                    gasUsedChart.gasUsedTimestamp = element.gasUsedTimestamp;
                    gasUsedChart.gasUsedValue = element.gasUsedValue;
                    gasUsedChart.save(function (req, res) {

                    });
                }, this);
            });
        var i = 0;
        console.log(lineReader);
        lineReader.on('line', function (line, lineCount, byteCount) {
            console.log('Line from file:', line);
            console.log('Line Count : ' + lineCount);
            i++;
            if (i > 3) {
                var lineData = line.split(';');
                var obj = new Object();
                obj.gasUsedTimestamp = lineData[0];
                obj.gasUsedValue = lineData[1];
                console.log(lineData[0]);
                console.log(lineData[1]);
                dataToSend.push(obj);
            }

            if (line == null) {
                res.json(dataToSend);
            }
        });
    });
});

getAverageGasLimitChartDataRoute.get(function (req, res) {
    var http = require('http');
    var fs = require('fs');
    var fullUrl = req.protocol + '://' + req.get('host');
    var file = __dirname + "./../public/blocktime.txt";
    var fileToBeUploaded = fs.createWriteStream(file);
    var dataToSend = [];
    var request = http.get("http://etherscan.io/chart/blocktime?output=csv", function (response) {
        response.pipe(fileToBeUploaded);
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream(file)
        });
        var readline = require('linebyline'),
            rl = readline(file);
        rl.on('line', function (line, lineCount, byteCount) {
            // do something with the line of text 
            console.log(lineCount);
        })
            .on('error', function (e) {
                // something went wrong 
            })
            .on('end', function (e) {
                console.log("Finished");
                res.json(dataToSend);
                dataToSend.forEach(function (element) {
                    var averageGasLimitChart = new AverageGasLimitChart();
                    averageGasLimitChart.gasLimitTimestamp = element.gasLimitTimestamp;
                    averageGasLimitChart.gasLimitValue = element.gasLimitValue;
                    averageGasLimitChart.save(function (req, res) {

                    });
                }, this);
            });
        var i = 0;
        console.log(lineReader);
        lineReader.on('line', function (line, lineCount, byteCount) {
            console.log('Line from file:', line);
            console.log('Line Count : ' + lineCount);
            i++;
            if (i > 3) {
                var lineData = line.split(';');
                var obj = new Object();
                obj.gasLimitTimestamp = lineData[0];
                obj.gasLimitValue = lineData[1];
                console.log(lineData[0]);
                console.log(lineData[1]);
                dataToSend.push(obj);
            }

            if (line == null) {
                res.json(dataToSend);
            }
        });
    });
});

getSaveNetworkStatsInDatabaseRoute.get(function (req, res) {
    var client = new Client();
    var urlString = "https://www.etherchain.org/api/basic_stats";
    var urlStringGasPrice = "https://etherchain.org/api/gasPrice";
    var urlStringActiveNodeCount = "https://etherchain.org/api/nodes";
    var urlStringGetTotalSupplyOfEther = "https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=QQBE2GAH8MKB8XVHI8PEYZCXTIEWF4Z11D";
    var urlStringTotalTransactionCount = "https://etherchain.org/api/txs/count";
    var dashboardData = new DashboardData();
    DashboardData.remove(function (err) {
        client.get(urlString, function (data, resp) {
            dashboardData.averageBlockTime = data.data.stats.blockTime;
            dashboardData.hashRate = data.data.stats.hashRate;
            dashboardData.lastBlock = data.data.difficulty.number;
            dashboardData.currentRate = "$" + data.data.price.usd + " @ " + data.data.price.btc;
            dashboardData.difficulty = data.data.stats.difficulty;
            dashboardData.uncleRate = data.data.stats.uncle_rate;
            dashboardData.gasLimit = data.data.difficulty.gasLimit;
            client.get(urlStringGasPrice, function (dataForGas, resp) {
                dashboardData.gasPrice = dataForGas.data[0].price;
                // to convert from wei to gwei
                dashboardData.gasPrice = dashboardData.gasPrice / 1000000000;
                dashboardData.gasPrice = dashboardData.gasPrice + " GWEI";
                client.get(urlStringActiveNodeCount, function (dataForActiveNodeCount, resp) {
                    dashboardData.activeNodeCount = dataForActiveNodeCount.data[0].data.length;
                    client.get(urlStringGetTotalSupplyOfEther, function (dataForTotalSupplyOfEther, resp) {
                        var totalSupply = dataForTotalSupplyOfEther.result;
                        totalSupply = totalSupply / 1000000000000000000;
                        dashboardData.totalSupply = totalSupply;
                        dashboardData.marketCapacity = totalSupply * data.data.price.usd;
                        client.get(urlStringTotalTransactionCount, function (dataForTotalTransactionCount, resp) {
                            dashboardData.totalTransactionCount = dataForTotalTransactionCount.data[0].count;
                            dashboardData.save(function (err, dashboardDataObject) {
                                if (err) {
                                    res.json(err);
                                }
                                else {
                                    res.json(dashboardDataObject);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});

postGetUserByContactNumberRoute.post(function(req,res){
    var contactNumber = req.body.contactNumber;
    contactNumber = "+" + contactNumber;
    EthereumUser.findOne({ 'userContactNumber': contactNumber }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if(ethereumUser == null)
        {
            response.message = "User does not exist";
            response.code = serverMessage.returnNotFound();
            response.data = null;
            res.json(response);
        }
        else
        {
            response.message = "User Found";
            response.code = serverMessage.returnSuccess();
            response.data = ethereumUser;
            res.json(response);
        }
    });
});

module.exports = router;
