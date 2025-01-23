var express = require("express");
var bodyParser = require("body-parser");
var app = express();
const logger = require('./logger');

const PORT = process.env.PORT || 5051;
var startPage = "index.html";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./public"));

const statusMonitor = require('express-status-monitor');
app.use(statusMonitor());

const { addbeverage, viewBeverage } = require("./utils/beverageUtil");
const { editbeverage } = require("./utils/updateUtil");
const { searchbeverage } = require("./utils/searchUtil");
app.post("/add-beverage", addbeverage);
app.put("/edit-beverage/:id", editbeverage);
app.get('/view-beverage', viewBeverage);
app.get('/search-beverage', searchbeverage);



server = app.listen(PORT, function () {
    const address = server.address();
    const baseUrl = `http://${
        address.address == "::" ? "localhost" : address.address
    }:${address.port}`;
    console.log(`Demo project at: ${baseUrl}`);
    logger.info(`Demo project at: ${baseUrl}!`);
    logger.error(`Example or error log`)
});
module.exports = { app, server };
