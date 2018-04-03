var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var NewsAPI = require('newsapi');


// Require all models
var db = require("./models");

var PORT = 3001;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// By default mongoose uses callbacks for async queries, we're setting it to use promises (.then syntax) instead
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/nytReact", {
  useMongoClient: true
});

// Routes
const newsapi = new NewsAPI('ee767d19a39549aa8ee9014e1ac39645');

app.get("/search", function(req, res) {
  newsapi.v2.everything({
    // q: 'trump',
    sources: 'bbc-news',
    // domains: 'nytimes.com',
    from: '1990-12-01',
    to: '2017-12-12',
    language: 'en',
    // sortBy: 'relevancy',
    page: 2
  }).then(response => {
    res.json(response);
    console.log(response);
  });
});




// A GET route for pulling from the New York Times API
// app.get("/search", function(req, res) {
//   // First, we grab the body of the html with request
//   axios.get('https://api.nytimes.com/svc/search/v2/articlesearch.json', {
//     params: {
//       'api-key': "84aa031760554e5b9c69de6a647b17d0",
//       'q': "cars"
//       // 'begin_date': "19900624",
//       // 'end_date': "20100924"
//     }
//   }).then(data => console.log(data.response))
//     // .catch(error => res.json(error));
// });


// Route for retieving all saved Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving articles
app.post("/articles/", function(req, res) {
  db.Article.create(req.body)
  .then(function(dbArticle) {
    // View the added result in the console
    console.log(dbArticle);
  })
  .catch(function(err) {
    // If an error occurred, send it to the client
    return res.json(err);
  });
})


// Route for removing an article from the database
app.delete("/articles/:id", function(req, res) {

  db.Article.findOneAndRemove({ _id: req.params.id })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      console.log("removed ID# "+ req.params.id)
 //     res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
