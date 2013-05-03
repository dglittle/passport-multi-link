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
        clientSecret: 'c12806b0ae69cb61188e3e982b466fa417a27423',//GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ githubId: profile.id }, function (err, user) {
            return done(err, user);
        });
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

//other middlewares
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(app.router);

    app.configure('development', function () {
        console.log('Development enviroment!');
        app.use(express.errorHandler());
    });

//static pages
    app.get('/', function(request,response){
        console.log(request.uesr);
        response.render('index',{"github":request.user});
    });

    app.get('/auth/github',passport.authenticate('github'));
    app.get('/auth/github/callback',
        passport.authenticate('github', { failureRedirect: '/' }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });


});

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});