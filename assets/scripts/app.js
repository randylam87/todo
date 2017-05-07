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
var duplicate = 0;

//Firebase listeners
//Checks if user is logged in or not
firebase.auth().onAuthStateChanged(function(firebaseUser) {

  ftdl.changeLogInBtn(firebaseUser);
  console.log("state change");
  // console.log(firebase.auth().currentUser.uid);
  if (firebaseUser && duplicate == 0) {
    duplicate++;
    console.log("im logged in");
    ftdl.listAdd();
    ftdl.listRemove();
    ftdl.membersAdd();
  }
})

var ftdl = {
  //function that hides/removes login/registration buttons
  changeLogInBtn: function(firebaseUser) {
    if (firebaseUser) {
      $(".loggedIn").show();
      $(".loggedOut").hide();
      $(".test").html('Welcome ' + firebaseUser.displayName + " Family");
    } else {
      $(".loggedIn").hide();
      $(".loggedOut").show();
      $(".test").html('Please log in');
    }
  },

  membersAdd: function() {
    console.log("members list running");
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

  appendMembers: function(members, id) {
    var memberButton = $("<button class='btn btn-primary'>" + members.member + "</button>");
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
      '<img src="assets/images/check.png"></img>' +
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

  deleteTodo: function() {
    var todoNumber = $(this).attr("todoID");
    database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).remove();
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
    var family = $('#familyReg').val()
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
        })
        //Creates new family based off of the family's name and saves the family's Uid
      database.ref('/Users/' + auth.currentUser.uid).set({
        family: family,
        email: email,
        password: password,
        uid: auth.currentUser.uid
      })
      database.ref('/Users/' + auth.currentUser.uid + '/members').push({
        member: member
      })
    }).catch(function(error) {
      console.log(error.message)
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
      Description: comments
    });
    $("#form").trigger('reset');
  },

  //ADD MEMBER BUTTON
  btnAddMember: function() {
    event.preventDefault();
    var member = $("#memberAdd").val();
    database.ref('/Users/' + firebase.auth().currentUser.uid + '/members').push({
      member: member
    })
  }
};

$(document.body).on("click", ".closeTodo", ftdl.deleteTodo);


//LOGOUT//SIGN OUT BUTTON
$('.btnLogout').on('click', function() {
  $(".todoList").empty();
  duplicate--;
  firebase.auth().signOut().catch(function(error) {
    console.log('logout ' + error.message);
  });
});
