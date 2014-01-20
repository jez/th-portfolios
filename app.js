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
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('meowsers'));
app.use(express.session());
app.use(app.router);
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

//===============================================
// routes
//===============================================

app.get('/', require('./routes/index')());
app.post('/upload', require('./routes/upload')(db));
app.get('/resumes/', require('./routes/resumes')(db));
app.get('/all/resumes.:format', require('./routes/all')(db));
app.get(/^\/resumes\/(\w+)\/([A-Za-z-]+)\.(\w{2,4})$/, require('./routes/resumes')(db));

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
