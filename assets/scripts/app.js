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

const database = firebase.database();
const familyRef = database.ref();


//function that hides/removes login/registration buttons
function changeLogInBtn(firebaseUser) {
  if (firebaseUser) {
    $('.btnLogin').addClass('hide');
    $('.btnRegister').addClass('hide');
    $('.btnLogout').removeClass('hide');
    $('.test').html('Welcome ' + firebaseUser.displayName)
  } else {
    $('.btnLogin').removeClass('hide');
    $('.btnLogout').addClass('hide');
    $('.btnRegister').removeClass('hide');
    $('.test').html('Please log in')
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
  const family = $('#family').val()
  const email = $('#email').val();
  const password = $('#pw').val();
  const auth = firebase.auth();
  //Register
  const promise = firebase.auth().createUserWithEmailAndPassword(email, password);
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

  console.log('working');
  console.log('family name is: ' + family)
  console.log('email is: ' + email)
  console.log('pw is: ' + password)

});

$('.btnLogout').on('click', function (){
  firebase.auth().signOut().catch(function(error) {
  	console.log('logout ' + error.message);
  });
})

$('.btnLogin').on('click', function (){
	//Get family name, and email/pw
	const email = $('#email').val();
  const password = $('#pw').val();
  const auth = firebase.auth();
  const promise = auth.signInWithEmailAndPassword(email,password);
  console.log('login button working')
  
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

})
