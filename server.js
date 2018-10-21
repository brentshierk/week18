var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var request = require('request');
var axios = require("axios");
var cheerio = require("cheerio");
//models
var Article = require("./models/Article.js")
var Note = require("./models/Note.js")

var db = mongoose.connection;

var PORT = 3001;

var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/verge", { useNewUrlParser: true });

app.get("/scrape" , function(req,res){
  request("https://www.theverge.com/",function(response,error,html){
var $ = cheerio.load(html);

  $(".c-entry-box--compact__title").each(function(i,elemnt){
    var result = {};

      result.Headline = $(this).children("a").text();
      result.url = $(this).children("a").attr("href");

      var entry = new Article (result);
      entry.save(function(err , doc){
        if(err){
          console.log(err)
        }else {
          console.log(doc)
        }
      })

  });
  res.send("scrape complete")
});
});
app.get('/articles', function(req, res){
	Article.find({}, function(err, doc){
		if (err){
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});

app.get('/articles/:id', function(req, res){
	Article.findOne({'_id': req.params.id})
	.populate('note')
	.exec(function(err, doc){
		if (err){
			console.log(err);
		} else {
			res.json(doc);
		}
	});
});


app.post('/articles/:id', function(req, res){
	var newNote = new Note(req.body);

	newNote.save(function(err, doc){
		if(err){
			console.log(err);
		} else {
			Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
			.exec(function(err, doc){
				if (err){
					console.log(err);
				} else {
					res.send(doc);
				}
			});

		}
	});
});



app.listen(PORT , function(){
  console.log("listening on port!"+ PORT)
})
