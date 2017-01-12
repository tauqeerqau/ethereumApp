var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');
var uuid = require('node-uuid');
var fs = require("fs");

var EthereumUser = require('./../models/EthereumUser');
var EthereumUserMobileCode = require('./../models/EthereumUserMobileCode');


var multipartMiddleware = multipart();

var postEthereumUserRoute = router.route('/addEthereumUser');
var getEthereumUserRoute = router.route('/getEthereumUsers');
var postEthereumUserLoginRoute = router.route('/ethereumUserLogin');
var postEthereumUserMobileRoute = router.route('/ethereumUserMobileChange');
var postEthereumUserCompleteProfileRoute = router.route('/ethereumUserCompleteProfile');
var postEthereumUserMobileCodeRoute = router.route('/ethereumUserMobileCode');

var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');
var ServerMessage = require('./../utilities/ServerMessages');

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

// Connection URL. This is where your mongodb server is running.

var url = utility.getURL();

mongoose.connect(url, function (err, db) {
    if (err) {
        console.log("Failed to Connect to MongoDB");
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
            ethereumUser.userProfileStatus = 1;

            ethereumUser.save(function (err) {
                if (err) {
                    res.send(err);
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
                        response.message = "User Login is Successful";
                        response.code = serverMessage.returnSuccess();;
                        response.data = ethereumUser;
                        res.json(response);
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
                        response.message = "User Login is Successful";
                        response.code = serverMessage.returnSuccess();;
                        response.data = ethereumUser;
                        res.json(response);
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
                    ethereumUserMobileCode.userContactNumber = req.body.userContactNumber;
                    ethereumUserMobileCode.userMobileCode = Math.floor(Math.random() * 9000) + 1000;
                    ethereumUserMobileCode.save(function (err, etherUserMobileCode) {
                        if (err) {
                            response.message = "User Mobile Code is not Saved";
                            response.code = serverMessage.returnFailure();;
                            response.data = err;
                            res.json(response);
                        }
                        else {
                            response.message = "User Mobile Code is Saved";
                            response.code = serverMessage.returnSuccess();
                            response.data = etherUserMobileCode;
                            res.json(response);
                        }
                    });
                }
                else {
                    ethereumUserMobileCode.userName = req.body.userName;
                    ethereumUserMobileCode.userContactNumber = req.body.userContactNumber;
                    ethereumUserMobileCode.userMobileCode = Math.floor(Math.random() * 90000) + 10000;
                    ethereumUserMobileCode.save(function (err, etherUserMobileCode) {
                        if (err) {
                            response.message = "User Mobile Code is not Saved";
                            response.code = serverMessage.returnFailure();;
                            response.data = err;
                            res.json(response);
                        }
                        else {
                            response.message = "User Mobile Code is Saved";
                            response.code = serverMessage.returnSuccess();
                            response.data = etherUserMobileCode;
                            res.json(response);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
