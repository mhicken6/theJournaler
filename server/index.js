const express = require('express');
const cors = require('cors');
const model = require('./model');

//STEP 2 & STEP 4
const passport = require('passport');
const session = require('express-session');
const passportLocal = require('passport-local');

const app = express()
const port = process.env.PORT || 3000

//const Entry = model.Entry

app.use(express.urlencoded({ extended: false }));
app.use(cors()); 

app.use(express.static('public'));

//passport middlewares - the secret gibberish verifies like a signature on the secret 
app.use(session({ secret: 'gibberishgoeshere', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());



// logout 
app.delete('/session', function (req, res) {
    req.logout();
    console.log("logout");
    res.sendStatus(200);
}); 


// PASSPORT implementation below!

passport.use(new passportLocal.Strategy({
    usernameField: "email", 
    passwordField: "plainPassword"
}, function (email, plainPassword, done) {
    //done is a function, call when done!! instead of return
    model.User.findOne({ email : email }).then(function (user) {
        //verify taht the user exists:
        if (!user) {
            //fail: user does not exist (no error no user)
            done(null, false);
            return;
        }

        // verify user's password use bcrypt.compare (same as bcrypt.verify)
        // first aprt of this is in model 
        user.verifyPassword(plainPassword, function(result){
            if(result) {
                // 
                done(null, user);
            } else {
                // user exists wrong password
                done(null, false);
            }
        });
    }).catch(function (err) {
        done(err);
    });  
}));

// 2. serialize user to session
passport.serializeUser(function( user,done) {
    done(null, user._id);
});

// 3. deserialize user from session
passport.deserializeUser(function ( userId, done) {
    model.User.findOne({_id: userId}).then(function(user){ 
        done(null, user);
    }).catch(function (err) {
        done(err);
    });   
});

// 4. authenticate endpoint -- use session because a user only has one
app.post("/session", passport.authenticate("local"), function (req, res) {
    // this function is called if authentication succeeds. -- if not successful it automatically gives a 401
    console.log('user was logged in');
    res.sendStatus(201);
});

// 5. "me" endpoint - me request = information on the logged in user stay logged in
app.get("/session", function (req, res) {
    if (req.user) {
        //send user details
        res.json(req.user);
    } else {
        //send 401
        res.sendStatus(401);
    }
});


// pull all entries 

app.get('/entries', (req, res) => {
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    //filter by user
    var filter = {
        user: req.user._id
    };

    //to get just the entries one user created
    model.Entry.find(filter).sort('user').then((entries) => {
        console.log("entries from the db:", entries);
        res.json(entries);
    });
});


// add an entry 

app.post('/entries', (req, res) => {
    //this makes it so you can only submit an entry if they are logged in
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    var entry = new model.Entry({
        title: req.body.title,
        date: req.body.date,
        words: req.body.words,
        //add the userId to assign a user to the entry
        user: req.user._id
    });

    entry.save().then((entry) => {
        console.log('a new entry was saved!');
        res.status(201).json(entry);
    }).catch(function (err) {
        if (err.errors) {
            var messages = {};
            for (var e in err.errors) {
                messages[e] = err.errors[e].message;
            }
            res.status(422).json(messages);
        } else{
                res.sendStatus(500);
            }
        });
        
});

// get just a single entry

app.get('/entries/:entryId', (req, res) => {
    model.Entry.findOne({ _id: req.params.entryId }).then((entry) => {
        if (entry) {
            res.json(entry);
        } else {
            res.sendStatus(404);
        }
    }).catch((err) => {
        res.sendStatus(400);
    });
});

// edit an entry

app.put('/entries/:entryId', (req, res) => {
    // make sure user is logged in
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    model.Entry.findOne({ _id: req.params.entryId, user: req.user._id }).then((entry) => {
        //the && entry.user thing makes it so that it will only let the owner edit it
        if (entry) {
            if (entry.user.equals(req.user._id)) {
                entry.date = req.body.date;
                entry.title = req.body.title;
                entry.words = req.body.words;
                
        
                entry.save().then(() => {
                    console.log('entry has been updated!');
                    res.sendStatus(200);
                }).catch((err) => {
                    console.log('it did not save..');
                    res.sendStatus(500);
                });
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(404);
        }
    }).catch((err) => {
      res.sendStatus(400);
    });

});

// delete an entry

app.delete('/entries/:entryId', (req, res) => {
    if (!req.user) {
        res.sendStatus(401);
        return;
    }

    model.Entry.findOne({_id: req.params.entryId, user: req.user._id }).then((entry) => {
        if (entry) {
            // change save to remove or delete or something instead
            entry.delete().then(() => {
                console.log('entry deleted');
                res.sendStatus(200);
            }).catch((err) => {
                console.log('something failed and did not delete!');
                res.sendStatus(500);
            });

        } else {
            res.sendStatus(404);
        }

    }).catch((err) => {
        res.sendStatus(400);
    });
});


//create new user

app.post('/users', (req, res) => {

    var user = new model.User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });
    
    // code for hashing
    user.setEncryptedPassword(req.body.plainPassword, function () {
        user.save().then((user) => {
            console.log('a new user was saved!');
            res.status(201).json(user);
        }).catch(function (err) {
            if (err.errors) {
                var messages = {};
                for (var e in err.errors) {
                    messages[e] = err.errors[e].message;
                }
                res.status(422).json(messages);
                } else if (err.code == 11000) {
                    console.log("is this really where its at?", err.code);
                    res.status(422).json({
                        email: "Already registered."
                    });
            } else{
                    //if there is a uniqueness validation failure it will trigger an else
                    res.sendStatus(500);
                    console.log("Unknown error occured:", err);
            }
        });
    });
    //end of code from hashing
    
        
});




app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });


