// Dependencies
var express = require("express");
var mongojs = require("mongojs");

var cheerio = require("cheerio");
var axios = require("axios");
var mongoose = require("mongoose");
// Initialize Express
var app = express();
var exphbs = require('express-handlebars');

// Require routes
var routes = require("./routes");

var bodyParser = require("body-parser");

// Connect Handlebars to Express app
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(routes);

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
});

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

app.get("/", function (req, res) {
    res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function (req, res) {
    // Find all results from the scrapedData collection in the db
    db.scrapedData.find({}, function (error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

axios.get("https://www.cbsnews.com/").then(function (response) {

    // Loads the body of the HTML into cheerio
    var $ = cheerio.load(response.data);

    // Empty array to save scraped data
    var results = [];

    // Loop through results using Cheerio
    $("article.item").each(function (i, element) {

        var title = $(element)
            .children()
            .find("h4")
            .text();

        var link = $(element)
            .children()
            .attr("href");

        if (title && link) {
            // Insert the data in the scrapedData db
            db.scrapedData.insert({
                title: title,
                link: link
            },
                function (err, inserted) {
                    if (err) {
                        // Log the error if one is encountered during the query
                        console.log(err);
                    }
                    else {
                        // Otherwise, log the inserted data
                        console.log(inserted);
                    }

                })
        };
        console.log(results);
    })
});


// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});