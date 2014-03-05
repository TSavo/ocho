'use strict';

var express = require('express'),
    path = require('path'),
    config = require('./config'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    _ = require('lodash'),
    flash = require('connect-flash'),
    datastore = require('./datastore'),
    appsec = require('lusca'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt'));

/**
 * Passport configuration
 */

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  datastore.getUser(id)
  .then(function (user) {
    return done(null, user[0].username);
  });
});

passport.use(new LocalStrategy(function(username, password, done){
  datastore.getUsers().then(function (results) {
    if(!results){
       return done(null, false, { message: '???.' });
    }

    var user = _.where(results, { username : username})[0];
    if(!user){
       return done(null, false, { message: 'Incorrect username.' });
    }


    bcrypt.compareAsync(password, user.password).then(function (good) {
      if (good) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    }).catch(function (err) {
     return done(err);
    });
  })
}));


/**
 * Express configuration
 */
module.exports = function(app) {
  app.configure('development', function(){
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  });

  app.configure(function(){
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(appsec.csrf());
    // app.use(appsec.csp({
    //   policy:  {
    //     'default-src': 'none',
    //     'script-src': 'self',
    //     'connect-src': 'self',
    //     'img-src': 'self',
    //     'style-src': 'self'
    //   }
    // }));
    app.use(appsec.p3p('ABCDEF'));
    app.use(appsec.xframe('DENY'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'SECRET' }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    // app.use(express.multipart());
    app.use(express.methodOverride());
    // Router needs to be last
    app.use(app.router);
  });
};
