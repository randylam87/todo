// Initialize Firebase
var config = {
    apiKey: "AIzaSyBfTYa8j8QJw6aDJoshnn5dVEWDBf5HS9Y",
    authDomain: "family-to-do-list.firebaseapp.com",
    databaseURL: "https://family-to-do-list.firebaseio.com",
    projectId: "family-to-do-list",
    storageBucket: "family-to-do-list.appspot.com",
    messagingSenderId: "824898029703"
};
firebase.initializeApp(config);
var database = firebase.database();
var familyRef = database.ref();

//function that hides/removes login/registration buttons
function changeLogInBtn(firebaseUser) {
    if (firebaseUser) {
        $(".regBtn").hide();
        $(".signBtn").hide();
        $(".btnLogout").show();
        $(".addBtn").show();
        $(".test").html('Welcome ' + firebaseUser.displayName);
    } else {
        $(".regBtn").show();
        $(".signBtn").show();
        $(".btnLogout").hide();
        $(".addBtn").hide();
        $(".test").html('Please log in');
    }
}

//Firebase listeners
//Checks if user is logged in or not
firebase.auth().onAuthStateChanged(function(firebaseUser) {
    changeLogInBtn(firebaseUser);
})

//Click handler for the register button
$('.btnRegister').on('click', function() {
    //Get family name, and email/pw
    var family = $('#familyReg').val()
    var email = $('#emailReg').val();
    var password = $('#pwReg').val();
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
            //Error handler
    }).catch(function(error) {
        console.log(error.message)
    });
     $("#registerModal").modal("hide");
        $("#form").trigger('reset');

});
//LOGOUT//SIGN OUT BUTTON
$('.btnLogout').on('click', function() {
    firebase.auth().signOut().catch(function(error) {
        console.log('logout ' + error.message);
    });
})
//LOGIN//SIGN IN BUTTON
$('.btnLogin').on('click', function() {
    var email = $('#emailSignIn').val();
    var password = $('#pwSignIn').val();
    var auth = firebase.auth();
    var promise = auth.signInWithEmailAndPassword(email, password);

    firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error) {
            // Handle Errors here.
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
})
//TODO SUBMIT BUTTON
$(".todoSubmit").on("click", function() {
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
})
