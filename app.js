//===============================================
// modules
//===============================================
var express = require('express');
var path = require('path');
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk(process.env.THACKS_MONGOLAB_URI);
db.ObjectID = mongo.ObjectID;

//===============================================
// config
//===============================================

// all environments
app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler());
  app.locals.pretty = true;
  app.use(app.router);
});

//===============================================
// routes
//===============================================
app.get('/', require('./routes/index')());
app.post('/upload/', require('./routes/upload')(db));

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
