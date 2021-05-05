const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect(//mongoDB connection goes here,
{useNewUrlParser: true, useUnifiedTopology: true});

// new user schema

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true
    },
    
    encryptedPassword: {
        type: String,
        required: true
    }
   
});

userSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.encryptedPassword;
    return obj;
};

userSchema.methods.setEncryptedPassword = function (plainPassword, callback) {
    bcrypt.hash(plainPassword, 12).then(hash => {
        this.encryptedPassword = hash;
        callback();
    });
};

userSchema.methods.verifyPassword = function (plainPassword, callback) {
    bcrypt.compare(plainPassword, this.encryptedPassword).then(result => {
        callback(result);
    }); 
};

const User = mongoose.model('User', userSchema);

//end of new user schema

const entrySchema = mongoose.Schema({
    date: {
        type: String,
        required: [true, "A date is required."]
    },
    
    title: {
        type: String,
        required: true,
        minLength: [1, "A title must be between 1-10 characters!"],
        maxLength: [10, "A title must be between 1-10 characters!"] 
    },
    
    words: {
        type: String,
        required: true,
        minLength: [1, "An entry must have at least one word."]
    },
    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = {
    Entry: Entry,
    User: User
};