var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


var EthereumUser = require('./../models/EthereumUser');

var postEthereumUserRoute = router.route('/addEthereumUser');
var getEthereumUserRoute = router.route('/getEthereumUsers');
var postEthereumUserLoginRoute = router.route('/ethereumUserLogin');
var postEthereumUserMobileRoute = router.route('/ethereumUserMobileChange');

var Password = require('./../utilities/Pass');
var Utility = require('./../utilities/UtilityFile');
var Response = require('./../utilities/response');

var utility = new Utility(
    {
    });

var password = new Password(
    {
    });

var response = new Response(
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
    var ethereumUser = new EthereumUser();
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
            res.json({ message: 'Ethereum User Added', data: ethereumUser });
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
            response.code = 200;
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
                    response.code = 200;
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
                    var validate = password.validateHash(ethereumUser.userPassword, req.body.userPassword);
                    if (validate == true) {
                        response.message = "User Login is Successful";
                        response.code = 200;
                        response.data = ethereumUser;
                        res.json(response);
                    }
                    else {
                        response.message = "User Password is incorrect";
                        response.code = 200;
                        response.data = ethereumUser;
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
                    response.code = 200;
                    response.data = null;
                    res.json(response);
                }
                if (ethereumUser != null) {
                    var validate = password.validateHash(ethereumUser.userPassword, req.body.userPassword);
                    if (validate == true) {
                        response.message = "User Login is Successful";
                        response.code = 200;
                        response.data = ethereumUser;
                        res.json(response);
                    }
                    else {
                        response.message = "User Password is incorrect";
                        response.code = 200;
                        response.data = ethereumUser;
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
                response.code = 200;
                response.data = null;
                res.json(response);
            }
            if (ethereumUser != null) {
                if (req.body.userMobileCode == 1234) 
                {
                    ethereumUser.userContactNumber = "66666623";
                    ethereumUser.save(function (err, ethereumUser) 
                    {
                        if (err) 
                        {

                        }
                        else 
                        {
                            response.message = "User Mobile Number is Updated";
                            response.code = 200;
                            response.data = ethereumUser;
                            res.json(response);
                        }
                    });
                }
                else 
                {
                    response.message = "Code is not Correct";
                    response.code = 200;
                    response.data = null;
                    res.json(response);
                }
            }
        }

    });
});



module.exports = router;
