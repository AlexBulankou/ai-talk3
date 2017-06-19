'use strict';

const express = require('express');
const url = require('url');
const http = require('http');
const appInsights = require("applicationinsights");
const redis = require('redis');

const app = express();

// Constants
const PORT = 8080;
const REDIS_PORT = 6379;
const REDIS_HOST = "redis";

appInsights.setup(process.env.AI_KEY).start();
var appInsightsClient = appInsights.client;

var redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);
redisClient.on('connect', function () {
    appInsightsClient.trackEvent('RedisClientConnected');
});

var getFromFinanceServer = function (symbol, onResponse) {
    symbol = symbol.toLowerCase();
    var path = "/finance/info?client=ig&q=";
    if (Math.random() > 0.7) {
        path = "/finance/info?client=ig&c=";
    }
    http.get({ host: "finance.google.com", path: path + symbol }, function (response) {
        if (response.statusCode !== 200) {
            onResponse(null);
        }

        var stockData = "";
        response.on('data', function (d) {
            stockData += d;
        });
        response.on("end", function () {
            onResponse(stockData);
        });
        response.on("error", function () {
            onResponse(null);
        });
    });
}

app.get('/stock', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var stock = query["s"];
    var data = null;

    if (stock) {
        // Normalize stock symbol
        stock = stock.toLowerCase();

        // Try retrieving from Redis
        redisClient.get(stock, function (err, reply) {
            // if it is Redis, use the value
            if (reply) {
                console.log(stock + " data found in redis");
                data = reply;
                res.end(data);
            } else {
                console.log(stock + " data wasn't found in redis");
                // otherwise attempt to get the data from finance server
                getFromFinanceServer(stock, function (financeServerData) {
                    // can the data be retrieved from finance server?
                    if (financeServerData) {
                        console.log(stock + " data found in back end server, writing to redis with expiration");
                        // store it in cache
                        redisClient.set(stock, financeServerData);

                        // set it to expire in 30 seconds
                        redisClient.expire(stock, 20)
                        // write it to data
                        data = financeServerData;
                        res.end(data);

                    } else {
                        console.log(stock + " data cannot be retrieved from backend server");
                        // if it cannot be retrieved from finance serfver retrurn server error
                        res.statusCode = 500;
                        res.end();
                    }
                });
            }
        });
    } else {
        // stock cannot be retrieved, return 'Not found'
        res.statusCode = 400;
       res.end();
    }
});



app.listen(PORT, function () {
    appInsightsClient.trackEvent("AppStartListen");
    console.log('Now listening on port ' + PORT.toString() + '!');
})