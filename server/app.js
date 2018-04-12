var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require ( 'connect-redis' ) ( session );
var config = require('./config');
var cors = require('cors');

var api = require( "./routes/api" );
var image = require( "./routes/image" );
var routes = require('./routes/index');
var users = require('./routes/users');
var accounts = require( "./routes/account" );
var students = require("./routes/students");
var classes = require("./routes/classes");
var system = require('./routes/system');
var upload = require('./routes/upload');

var app = express();

var corsOptions = {
  credentials: true,
  origin:[
   'http://106.185.28.215',
   //'http://localhost:8100',
   ],
};

app.use(cors(corsOptions));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
    store: new RedisStore({host:config.redisHost,port:config.redisPort}),
    secret: 'ngedu key',
    resave: true,
    path:'/',
    name:'ngedu',
    saveUninitialized: true,
    cookie:{
      maxAge:60 * 1000 * 60 * 10 // 1 hour * 10
    }
}));
app.use(function(req, res, next){
  if(!req.session)
  {
    console.log('> redis session connect faild');
    return next(new Error('redis session connect faild')) // handle error
  }
  next();
});

//app files
var appPath = path.join(__dirname, '../client/app');
app.use(express.static(appPath));

// widgets imports
app.use( "/bower_components" , express.static( path.join( __dirname , "../client/bower_components" ) ) );
app.use( "/widgets" , express.static( path.join( __dirname , "../client/widgets" ) ) );

app.use('/', routes);
app.use('/users', users);
// /api/* router
app.use( "/api" , api );
app.use( "/image" , image );
app.use('/accounts', accounts);

app.use("/students", students);
app.use("/classes", classes);
app.use("/system", system);
app.use("/file",  upload);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
