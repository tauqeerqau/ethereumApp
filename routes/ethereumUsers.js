var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var multipart = require('connect-multiparty');

var EthereumUser = require('./../models/EthereumUser');


var multipartMiddleware = multipart();

var postEthereumUserRoute = router.route('/addEthereumUser');
var getEthereumUserRoute = router.route('/getEthereumUsers');
var postEthereumUserLoginRoute = router.route('/ethereumUserLogin');
var postEthereumUserMobileRoute = router.route('/ethereumUserMobileChange');
var postEthereumUserCompleteProfileRoute = router.route('/ethereumUserCompleteProfile'); 

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
            response.code = serverMessage.returnSuccess();
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
                else 
                {
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
                if (req.body.userMobileCode == 1234) {
                    ethereumUser.userContactNumber = "66666623";
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
                    response.message = "Code is not Correct";
                    response.code = serverMessage.returnPasswordMissMatch();
                    response.data = null;
                    res.json(response);
                }
            }
        }

    });
});

postEthereumUserCompleteProfileRoute.post(multipartMiddleware, function(req,res){
    console.log(res.json(req.body.userName));
    /*EthereumUser.findOne({ 'userName': req.body.userName }, null, { sort: { '_id': -1 } }, function (err, ethereumUser) {
        if (err) {
            res.send(err);
        }
        else {
            if (ethereumUser == null) {
                response.message = "User does not Exist";
                response.code = 200;
                response.data = null;
                res.json(response);
            }
            if (ethereumUser != null) 
            {
                ethereumUser.userOccupation = req.body.userOccupation;
                ethereumUser.userAddress = req.body.userAddress;
            }
        }

    });*/
});

module.exports = router;
