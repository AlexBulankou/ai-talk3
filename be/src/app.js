'use strict';

const express = require('express');
const mongoClient = require('mongodb').MongoClient;
const url = require('url');
const http = require('http');
const appInsights = require("applicationinsights");
const app = express();

// Constants
const PORT = 8080;
const MONGO_PORT = 27017;

appInsights.setup(process.env.AI_KEY).start();

app.get('/stock', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var stock = query["s"];
    if (stock) {
        stock = stock.toLowerCase();
        var path = "/finance/info?client=ig&q=";
        if (Math.random() > 0.7) {
            path = "/finance/info?client=ig&c=";
        }

        http.get({ host: "finance.google.com", path: path + stock }, function (response) {
            if (response.statusCode === 400) {
                res.statusCode = 204;
                res.end();
            }

            var stockData = "";
            response.on('data', function (d) {
                stockData += d;
            });
            response.on("end", function () {
                res.end(stockData);
            });
            response.on("error", function () {
                res.statusCode = 204;
                res.end();
            });
        });
    } else {
        res.end();
    }
});

app.get('/checkdb', function (req, res) {
    // Connection URL
    var mongoPort = process.env.MISTRAL_MONGO_PORT;
    if (mongoPort) {
        mongoPort = mongoPort.substr(6);
    } else {
        mongoPort = "0.0.0.0:" + MONGO_PORT;
    }
    var url = "mongodb://unit_test_user:run@" + mongoPort;
    mongoClient.connect(url, function (err, db) {
        if (err) {
            res.send(err.toString());
        }
        else {
            res.send("ok");
            return;
        }
        db.close();
    });
}
)

app.listen(PORT, function () {
    console.log('App listening on port ' + PORT.toString() + '!')
})