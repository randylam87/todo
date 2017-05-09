// Initialize Firebase
var config = {
    apiKey: "AIzaSyBfTYa8j8QJw6aDJoshnn5dVEWDBf5HS9Y",
    atuhDomain: "family-to-do-list.firebaseapp.com",
    databaseURL: "https://family-to-do-list.firebaseio.com",
    projectId: "family-to-do-list",
    storageBucket: "family-to-do-list.appspot.com",
    messagingSenderId: "824898029703"
};
firebase.initializeApp(config);
var database = firebase.database();
var familyRef = database.ref();
var currentMember;
var loggedIn = false;
var photoArray = [];
var currentPhoto = 0;
// $(".loggedOut").show();
//Firebase listeners
//Checks if user is logged in or not
firebase.auth().onAuthStateChanged(function(firebaseUser) {

    // ftdl.changeLogInBtn(firebaseUser);
    console.log("state change");
    // console.log(firebase.auth().currentUser.uid);
    if (firebaseUser && loggedIn === false) {
        loggedIn = true;
        console.log("im logged in page2");
        ftdl.showPage2();
        ftdl.listAdd();
        ftdl.listRemove();
        ftdl.eventAdd();
        ftdl.eventRemove();
        ftdl.membersAdd();
        currentMember = localStorage.getItem('currentMember');
        ftdl.changeLogInBtn(currentMember);
    } else if (firebaseUser === null) {
        console.log('page1');
        ftdl.showPage1();
    }
});

var ftdl = {
    //function that hides/removes login/registration buttons
    changeLogInBtn: function(currentMember) {
        if (currentMember.length > 0) {
            ftdl.showPage3();
            console.log('page3');
            $(".currentMemberHeader").html('Welcome ' + currentMember + "!");
        }
    },

    membersAdd: function() {
        console.log("members list running");
        $(".memberSelect").empty();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/members').on('child_added', function(snapshot) {
            var members = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.appendMembers(members, id);
        });
    },

    listAdd: function() {
        console.log("list add running");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').on('child_added', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.appendList(todoInfo, id);
        });
    },

    listRemove: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').on('child_removed', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            $("#item" + id).remove();
        });
    },

    eventAdd: function() {
        console.log("event add running");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').on('child_added', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.appendEvent(todoInfo, id);
        });
    },

    eventRemove: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').on('child_removed', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            $("#item" + id).remove();
        });
    },

    appendMembers: function(members, id) {
        var memberButton = $("<button class='chooseMember btn btn-primary'>" + members.member + "</button>");
        $(".memberSelect").append(memberButton);

    },

    appendList: function(todoInfo, id) {

        var todoDiv = $("<div class='todoDiv'>");
        //  var name = $("<h4>" + todoInfo.Name + "</h4>");

        var catIcon;

        if (todoInfo.Categories == 'Timed Event') {

            catIcon = 'assets/images/timed_event.jpg';

        }

        var name = $('<h4 class="left">' + '<img src=' + catIcon + '></img><img src="assets/images/location.png"></img>' +
            '<img src="assets/images/check.png" todoID="' + id + '" class="completeTodo"></img>' +
            '<img src="assets/images/delete.png" todoID="' + id + '" class="closeTodo">' + '</img>' +
            todoInfo.Name + "</h4>");

        // var cat = $("<h4> Category: " + todoInfo.Categories + "</h4>");
        // var location = $('<p class="left">' + todoInfo.Location + "</p>");
        var description = $('<p class="clear"> Description: ' + todoInfo.Description + "</p>");
        todoDiv.attr("id", "item" + id);
        // var todoClose = $("<button>");
        // todoClose.attr("todoID", id);
        // todoClose.addClass("closeTodo");
        // todoClose.append("✓");
        // todoDiv.append(todoClose);
        todoDiv.append(name);

        // todoDiv.append(cat);
        // todoDiv.append(location);

        todoDiv.append(description);


        $(".todoList").append(todoDiv);

    },

    appendEvent: function(todoInfo, id) {

        var eventDiv = $("<div class='eventDiv'>");
        var catIcon;
        var name = $('<h4 class="left">' + '</img><img src="assets/images/location.png"></img>' +
            '<img src="assets/images/delete.png" todoID="' + id + '" class="closeTodo">' + '</img>' +
            todoInfo.Name + "</h4>");
        var description = $('<p class="clear"> Description: ' + todoInfo.Description + "</p>");
        eventDiv.attr("id", "item" + id);
        eventDiv.append(name);
        eventDiv.append(description);
        $(".future-items").append(eventDiv);

    },

    deleteTodo: function() {
        var todoNumber = $(this).attr("todoID");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).remove();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event/' + todoNumber).remove();
    },

    //LOGIN//SIGN IN BUTTON
    loginSubmit: function() {
        event.preventDefault();
        var email = $('#emailSignIn').val();
        var password = $('#pwSignIn').val();
        var auth = firebase.auth();
        var promise = auth.signInWithEmailAndPassword(email, password);

        firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode === 'auth/wrong-password') {
                    alert('Wrong password.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
            });
        $("#signInModal").modal("hide");
        $("#form").trigger('reset');
    },

    //REGISTER BUTTON
    registerSubmit: function() {
        event.preventDefault();
        var family = $('#familyReg').val();
        var email = $('#emailReg').val();
        var password = $('#pwReg').val();
        var member = $('#memberReg').val();
        var auth = firebase.auth();
        //Register
        var promise = firebase.auth().createUserWithEmailAndPassword(email, password);
        //Promises to create the user with the details provided in the input box THEN updates the user's displayName based on the family name since its null be default
        promise.then(function() {
            //Updates the authentication to the family's name
            auth.currentUser.updateProfile({
                displayName: family
            });
            //Creates new family based off of the family's name and saves the family's Uid
            database.ref('/Users/' + auth.currentUser.uid).set({
                family: family,
                email: email,
                password: password,
                uid: auth.currentUser.uid
            });
            database.ref('/Users/' + auth.currentUser.uid + '/members').push({
                member: member
            });
        }).catch(function(error) {
            console.log(error.message);
        });
        $("#registerModal").modal("hide");
        $("#form").trigger('reset');
    },

    //TODO SUBMIT BUTTON
    todoSubmit: function() {
        event.preventDefault();
        $('#todoModal').modal('hide');
        var name = $("#todoName").val();
        var cat = $("#todoCatInput").val();
        var location = $("#locationInput").val();
        var comments = $("#todoComments").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').push({
            Name: name,
            Categories: cat,
            Location: location,
            Description: comments,
            Creator: currentMember
        });
        $("#form").trigger('reset');
    },

    //EVENT SUBMIT BUTTON
    eventSubmit: function() {
        event.preventDefault();
        $('#eventModal').modal('hide');
        var name = $("#eventName").val();
        var cat = $("#eventCatInput").val();
        var location = $("#eventLocationInput").val();
        var comments = $("#eventComments").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').push({
            Name: name,
            Categories: cat,
            Location: location,
            Description: comments,
            Creator: currentMember
        });
        $("#form").trigger('reset');
    },

    //ADD MEMBER BUTTON
    btnAddMember: function() {
        event.preventDefault();
        var member = $("#memberAdd").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/members').push({
            member: member
        });
    },

    //CHOOSE MEMBER
    chooseMember: function() {
        event.preventDefault();
        localStorage.setItem('currentMember', $(this).text());
        currentMember = localStorage.getItem('currentMember');
        ftdl.changeLogInBtn(currentMember);
    },

    showPage1: function() {
        $('.page').hide();
        $('.page-registration').show();
        $('.firstPagejumbo').show();
    },

    showPage2: function() {
        $('.page').hide();
        $('.page-members').show();
    },

    showPage3: function() {
        $('.page').hide();
        $('.page-main').show();
    },

    completeTodo: function() {
        var todoNumber = $(this).attr("todoID");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).push({
            completedBy: currentMember
        });
        // database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).on('child_added', function(snapshot) {
        //     var completedByInfo = snapshot.val();
        //     var completedByid = snapshot.key; 
        //     ftdl.appendList(todoInfo, id);
        // });
        // var completedBy = 
        // $('#id-' + todoNumber).append()
    },

    findPhotoID: function() {
        $.ajax({
            url: "https://api.flickr.com/services/rest/?",
            data: {
                method: "flickr.photos.search",
                api_key: "5a14553fa4191a526048889fe5a012bf",
                format: "json",
                user_id: "154480674@N02",
                nojsoncallback: "?"
            }
        }).done(function(response) {
            for (i = 0; i < 5; i++) {

                ftdl.getPhotoFromID(response.photos.photo[i].id);
            }
        });
    },

    getPhotoFromID: function(photoID) {

        $.ajax({
            url: "https://api.flickr.com/services/rest/?",
            data: {
                method: "flickr.photos.getSizes",
                api_key: "5a14553fa4191a526048889fe5a012bf",
                format: "json",
                photo_id: photoID,
                nojsoncallback: "?"
            }
        }).done(function(response) {
            photoArray.push("url(" + response.sizes.size[9].source + ")");
            ftdl.setPhotoAsBG();
        });
    },

    setPhotoAsBG: function() {
        if (photoArray.length > 4) {
            var body = $('body');
            setInterval(ftdl.nextBackground, 10000);
            body.css('background-image', photoArray[0]);

        }
    },

    nextBackground: function() {
        var body = $('body');
        body.css("background-image", photoArray[currentPhoto = ++currentPhoto % photoArray.length]);
        // setTimeout(this.nextBackground, 10000);
    }

};

ftdl.findPhotoID();
$(document.body).on("click", ".closeTodo", ftdl.deleteTodo);
$(document.body).on("click", ".chooseMember", ftdl.chooseMember);
$(document.body).on("click", ".completeTodo", ftdl.completeTodo);

//LOGOUT//SIGN OUT BUTTON need to review if we can store this function in the object
$('.btnLogout').on('click', function() {
    $(".todoList").empty();
    localStorage.removeItem('currentMember');
    ftdl.changeLogInBtn(currentMember);
    loggedIn = false;
    firebase.auth().signOut().catch(function(error) {
        console.log('logout ' + error.message);
    });
});
