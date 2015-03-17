var express = require('express'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    GitHubStrategy=require('passport-github').Strategy,
    OdeskStrategy=require('passport-odesk').Strategy;

//passport
var passport = require('passport');
passport.use(new GitHubStrategy({
        clientID: 'b184a671f543c260d055',//GITHUB_CLIENT_ID,
        clientSecret: 'ac6454f9c250c951d1000a9e6bc311762216834c',//GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback",
        customHeaders: { "User-Agent": "vodolaz095" }
    },
    function(accessToken, refreshToken, profile, done) {
            return done(null, profile);
    }
));

passport.use(new OdeskStrategy({
        consumerKey: '26739894934be7c046d268680146a8d0',
        consumerSecret: 'b694a28f79d55f7b',
        callbackURL: "http://127.0.0.1:3000/auth/odesk/callback"
    },
    function(token, tokenSecret, profile, done) {
            return done(null, profile);
    }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.set('layout', 'layout');
    app.engine('html', require('hogan-express'));

    app.configure('development', function () {
        app.use(express.responseTime());
        app.use(express.logger('dev'));
    });
    app.configure('production', function () {
        app.use(express.logger('short'));
    });

    app.use(express.compress());
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('hammering the keyboard'));
    app.use(express.session({
        secret:'hammering the keyboard'
    }));
    app.use(express.csrf());
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (req, res, next) {
        if (!req.user) req.user = {}
        req.user.github = req.session.github
        req.user.odesk = req.session.odesk
        next()
    })

//other middlewares
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

    app.configure('development', function () {
        console.log('Development enviroment!');
        app.use(express.errorHandler());
    });


    app.get('/', function(request,response){
        console.log(request.user);
        response.render('index',
            {
                "user":request.user,
                "github":request.user.github,
                "odesk":request.user.odesk

            }
        );
    });

    app.get('/logout',function(request,response){
        request.session.odesk=null;
        request.session.github=null;
        request.logout();
        response.redirect('/')
    });

    app.get('/auth/github',passport.authenticate('github'));
    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        function(request, response) {
            // Successful authentication, redirect home.
            request.session.github=request.user;
            response.redirect('/');
        });
    app.get('/logoffgithub',function(request,response){
        delete request.session.github;
        request.session.github=null;
        response.redirect('/');
    });


    app.get('/auth/odesk',passport.authenticate('odesk'));
    app.get('/auth/odesk/callback',
        passport.authenticate('odesk', { failureRedirect: '/' }),
        function(request, response) {
            // Successful authentication, redirect home.
            request.session.odesk=request.user;
            response.redirect('/');
        });
    app.get('/logoffodesk',function(request,response){
        delete request.session.odesk;
        request.session.odesk=null;
        response.redirect('/');
    });




});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});