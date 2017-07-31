
var express = require('express');
var https = require('https');
var mongo = require('mongodb').MongoClient

var app = express();

mongo.connect(process.env.URL, function(err, db) {
   var collection = db.collection("searchHistory");
  
       app.get('/', function(req,res){
  res.sendFile(process.cwd() + '/views/index.html');
});
     
     app.use(express.static(process.cwd() + '/public'));
  
  
  app.get('/api/imagesearch/:que', function(req, res){
  
      var que = req.params.que
      var page = req.query  
      var startIndex='&start='
    console.log(page);
    if(page.hasOwnProperty('offset')){
      startIndex+=page.offset;
    }
    else {
      startIndex=''
    }
    https.get(process.env.SEARCHURL+que+startIndex
    , function(response) {
       
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
          var responseData=[];
            var parsed = JSON.parse(body);
            parsed.items.forEach(function(element) {
                responseData.push({url: element.link, snippet: element.snippet, thumbnail: element.image.thumbnailLink, context: element.image.contextLink})
            });
          var doc={term: que , when: new Date().toString()}
           collection.insert(doc, function(err, data) {
                      if(err){
                          res.send({error: err});
                       }
                  else {
                      res.send(responseData);
                  }
              })
            
            
        });
    }).on('error', function() {
     console.log('error');
            res.send({error:"error", greska:"ova"})
        });
  })
     

     
     app.get('/api/latest/imagesearch/', function(req,res){
  
         var url = req.params.url
         collection.find({}).project({ term: 1 , when: 1 , _id: 0}).toArray(function(err, result) {
            if(err){
              res.send({error:'error'});
            }
            else {
              if(result) {
                console.log(result)
                res.send(result) 
              }
              else {
                  res.send({"error": "This url is not on the database."});
              }
                             
          }
                
                  
         });   
      

});


});




// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

 module.exports = app;