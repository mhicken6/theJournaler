
function addNewUser(user) {
    var newUserData = "firstName=" + encodeURIComponent(user.firstName);
    newUserData += "&lastName=" + encodeURIComponent(user.lastName);
    newUserData += "&email=" + encodeURIComponent(user.email);
    newUserData += "&plainPassword=" + encodeURIComponent(user.plainPassword);
    console.log("New user data: ", addNewUser);


    return fetch("", {
        credentials: 'include',
        method: "POST",
        body: newUserData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function userLogout(){
    return fetch("", {
        method: 'DELETE',
        credentials: "include",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded"
        }
    });
};


function authenticateUser(email, password) {
    console.log(email,password);
    let data = "email=" + encodeURIComponent(email);
    data += "&plainPassword=" + encodeURIComponent(password); 
    console.log(data);
    return fetch("", {
        credentials: 'include',
        method: 'POST',
        body: data,
        headers: {
        "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

//retrieve session (keep a user logged in) // this happens when the page loads
function getSession() {
    return fetch("", {
        credentials: "include"
    });
}

function addNewJournalEntry(entry) {
    var journalEntryData = "title=" + encodeURIComponent(entry.title);
    journalEntryData += "&date=" + encodeURIComponent(entry.date);
    journalEntryData += "&words=" + encodeURIComponent(entry.words);
    console.log("Journal Entry Data: ", journalEntryData);


    return fetch("", {
        credentials: 'include',
        method: "POST",
        body: journalEntryData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function editJournalEntry(entry) {
    var journalEntryData = "title=" + encodeURIComponent(entry.title);
    journalEntryData += "&date=" + encodeURIComponent(entry.date);
    journalEntryData += "&words=" + encodeURIComponent(entry.words);
    console.log("Journal Entry Data: ", journalEntryData);


    return fetch("" + entry._id, {
        credentials: 'include',
        method: "PUT",
        body: journalEntryData,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function deleteJournalEntry(entry) {
    console.log("I am going to delete something now", entry);


    return fetch("" + entry._id, {
        credentials: 'include',
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });
}

function getJournalEntriesFromServer() {
    return fetch("", {
        credentials: "include"
    });
};

console.log("working?");

var app = new Vue({
    el: '#app',
    data: {
        // journal entry data
        entryTitle: '',
        entryWords: '',
        entryDate: '',
        editEntry: {},
        deleteEntry: {},
        entries: [],

        //USER DATA
        firstName: '',
        lastName: '',
        email: '',
        plainPassword: '',
        users: [],

        //LOGIN DATA
        loginEmail: '',
        loginPassword: '',
       

        //State management
        logoutButton: false,
        whatToDo: true,
        registrationPage: false,
        loginPage:false,
        editing: false,
        addMode: false,
        sidebar: false,
        homepage: false,
        currentEntry: null,
        errorMessage: []
    },

    methods: {
        wantLogout: function(session){
            userLogout(
                session
            ).then((response) => {
                console.log(response);
                console.log('user was logged out');
            });
            this.registrationPage = false;
            this.addMode = false;
            this.sidebar = false;
            this.homepage = false;
            this.loginPage = false;
            this.whatToDo = true;
            this.logoutButton = false;
            
    

            
        },

        wantLogin: function() {
            this.registrationPage = false;
            this.addMode = false;
            this.sidebar = false;
            this.homepage = false;
            this.loginPage = true;
            this.whatToDo = false;
        },

        wantRegister: function() {
            this.registrationPage = true;
            this.addMode = false;
            this.sidebar = false;
            this.homepage = false;
            this.loginPage = false;
            this.whatToDo = false;
        },

        addEntry: function () {
            console.log("Add an entry?");
            this.addMode = true;
            this.sidebar = true;
            this.homepage = false;
            this.whatToDo = false;
            this.logoutButton = true;
        },

        validateEntry: function(){
            this.errorMessage = [];

            if (this.entryDate.length == 0){
                this.errorMessage.push('Please specify what day it is!');
            } 
            if (this.entryTitle.length == 0) {
                this.errorMessage.push("Dont forget a title!");
            }
            if (this.entryWords.length == 0) {
                this.errorMessage.push("Please add some words to your entry!");
            }

            return this.errorMessage == 0;
        },

        validateLogin: function(){
            this.errorMessage = [];

            if (this.firstName.length == 0){
                this.errorMessage.push('Please enter your first Name!');
            } 
            if (this.lastName.length == 0){
                this.errorMessage.push('Please enter your last Name!');
            } 
            if (this.email.length == 0) {
                this.errorMessage.push("Please enter your email!");
            }
            if (this.plainPassword.length == 0) {
                this.errorMessage.push("Please enter a valid password!");
            }

            return this.errorMessage == 0;
        },

        validateSignIn: function(){
            this.errorMessage = [];

            if (this.loginEmail.length == 0){
                this.errorMessage.push('Please enter a valid email!');
            } 
            if (this.loginPassword.length == 0){
                this.errorMessage.push('Please enter a valid password!');
            } 
            

            return this.errorMessage == 0;
        },

        submitNewEntry: function () {
            

            if (!this.validateEntry()){
                return;
            }
            
            console.log("submit new entry clicked?");
            addNewJournalEntry({
                title: this.entryTitle,
                date: this.entryDate,
                words: this.entryWords
            }).then((response) => {
                console.log(response);
                if (response.status == 201) {
                    this.loadEntries();
                } else {
                    alert("Failed!");
                }
            })

            this.loadEntries()

            this.entryDate = "";
            this.entryTitle = "";
            this.entryWords = "";

            this.addMode = false;
            this.sidebar = false;
            this.homepage = true;
            this.whatToDo = false;
            this.logoutButton = true;
        },

        updateEntry: function () {
            //refer to this.editEntry just like create
            

            editJournalEntry(
                this.editEntry
            ).then((response) => {
                console.log(response);
                if (response.status == 200) {
                    this.loadEntries();
                } else {
                    alert("Failed!");
                }
            })

            this.editEntry = {};

            this.homepage = true;
            this.editing = false;
            this.sidebar = false;
            this.whatToDo = false;
            this.logoutButton = true;

        },

        removeEntry: function (entry) {

            deleteJournalEntry(
                entry
            ).then((response) => {
                console.log(response);
                if (response.status == 200) {
                    this.loadEntries();
                    alert("are you sure you want to delete this entry?");
                } else {
                    alert("Failed!");
                }
            })
            this.addMode = false;
            this.sidebar = false;
            this.homepage = true;
            this.whatToDo = false;
            this.logoutButton = true;


        },

        openEntryDetails: function (entry) {
            this.currentEntry = entry;
        },

        closeEntryDetails: function (entry) {
            this.currentEntry = null;
        },

        editJournalEntry: function (entry) {
            
            console.log("edit a journal entry", entry);
            this.editEntry = entry;
            this.editing = true;
            this.addMode = false;
            this.homepage = false;
            this.whatToDo = false;
            this.logoutButton = true;
        },

        submitNewUser: function (user) {
            if (!this.validateLogin()){
                return;
            }

            console.log("submit new user clicked?");
            addNewUser({
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email,
                plainPassword: this.plainPassword
            }).then((response) => {
                console.log(response);
                if (response.status == 201) {
                    authenticateUser(
                        this.email, this.plainPassword
                    ).then((response) => {
                        console.log(response.status);
                        if (response.status == 201){
                            console.log("login successful");
                            this.registrationPage = false;
                            this.addMode = false;
                            this.sidebar = false;
                            this.homepage = true;
                            this.loginPage = false;
                            this.logoutButton = true;
                            this.loadEntries();
                        } else {
                            console.log('fail, I do not want this');
                            this.validateLogin();
                        }
                    });
                } else {
                    alert("Failed!");
                }
            });

        },

        loginUser: function() {
            if (!this.validateSignIn()){
                return;
            }
            console.log('login button was clicked?');
            console.log(this.loginEmail,this.loginPassword);
            authenticateUser(
                this.loginEmail, this.loginPassword
            ).then((response) => {
                console.log(response.status);
                if (response.status == 201){
                    console.log("login successful");
                    this.registrationPage = false;
                    this.addMode = false;
                    this.sidebar = false;
                    this.homepage = true;
                    this.loginPage = false;
                    this.whatToDo = false;
                    this.logoutButton = true;
                    this.loadEntries();
                } else {
                    console.log('fail, I do not want this');
                    alert('failed!');
                }
            });
        },

        loadEntries: function () {
            getJournalEntriesFromServer().then((response) => {
                response.json().then((data) => {
                    console.log("journal entries loaded from server:", data);
                    this.entries = data;
                });
            }); 

        },
        
        checkLoggedIn: function() {
            //this you can manipulate state of page or what you want to show or not show when logged in
            getSession().then(response => {
                if ( response.status == 402) {
                    //not logged in
                    console.log("user is not logged in");
                    this.registrationPage = false;
                    this.addMode = false;
                    this.sidebar = false;
                    this.homepage = false;
                    this.loginPage = false;
                    this.whatToDo = true;
                    this.logoutButton = false;
                } else if (response.status == 200) {
                    //logged in
                    console.log("user is logged in");
                    this.loadEntries();
                    this.registrationPage = false;
                    this.addMode = false;
                    this.sidebar = false;
                    this.homepage = true;
                    this.loginPage = false;
                    this.whatToDo = false;
                    this.logoutButton = true;
                }
            });
        }
    },

    created: function () {

        this.checkLoggedIn();

        // only if they are logged in
        
    }

});
