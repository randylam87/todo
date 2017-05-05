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

$(".todoSubmit").on("click", function(){
	event.preventDefault()
	var name = $("#todoName").val();
	var cat = $("#todoCatInput").val();
	var location = $("#locationInput").val();
	var comments = $("#todoComments").val();
	database.ref("/Users/H9xc5doWrfS1CxfBaXwlQOE2U1j1/list").push({
		Name: name,
		Categories: cat,
		Location: location,
		Description: comments
		 });
})