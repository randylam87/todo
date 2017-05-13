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
var currentMember = "";
var myData;
var bgInterval;
var loggedIn = false;
var photoArray = [];
var currentPhoto = 0;
var myLatLong = { lat: 33.644906, lng: -117.834748 };

//Firebase listeners
//Checks if user is logged in or not
var workerList = {};
var workerListItem = {};

firebase.auth().onAuthStateChanged(function(firebaseUser) {

    if (firebaseUser && loggedIn === false) {
        loggedIn = true;
        ftdl.showPage2();
        ftdl.initialAdd();
        ftdl.listAdd();
        ftdl.listRemove();
        ftdl.completeAdd();
        ftdl.eventAdd();
        ftdl.eventRemove();
        ftdl.membersAdd();
        ftdl.calStats();
        currentMember = $('#current-member').val();
        ftdl.changeLogInBtn(currentMember);
    } else if (firebaseUser === null) {
        ftdl.showPage1();
    }
});


var ftdl = {

    calStats: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').on('value', function(snapshot) {
            var todoInfo = snapshot.val();
            workerList = {};
            workerListItem = {};
            // Getting an array of each key In the snapshot object
            var listKeyArr = Object.keys(todoInfo);
            for (var i = 0; i < listKeyArr.length; i++) {
                var currentKey = listKeyArr[i];
                var currentObject = todoInfo[currentKey];
                var worker = currentObject.CompletedBy;
                var creator = currentObject.Creator;
                var todoName = currentObject.Name;
                if (!(workerList[worker])) {
                    workerListItem[worker] = [];
                    workerListItem[worker].push(todoName);
                    workerList[worker] = 1;
                } else {
                    workerListItem[worker].push(todoName);
                    workerList[worker]++;
                }
            }
            ftdl.appendStats(workerList, workerListItem);
        });
    },

    appendStats: function() {
        var workerListSorted = [];
        var sortUser = function(listUser, userSorted) {
            for (var user in listUser) {
                userSorted.push([user, listUser[user]]);
            }
            userSorted.sort(function(a, b) {
                return b[1] - a[1];
            });
        };

        sortUser(workerList, workerListSorted);
        var totalCompleted = 0;
        var completedHtml = '';
        $(".member-stats").html('');
        for (var i = 0; i < workerListSorted.length; i++) {
            var memberHtml = '';
            var currentElement = workerListSorted[i];
            var name = currentElement[0];
            var value = currentElement[1];
            if (name != 'undefined') {
                totalCompleted += value;
                memberHtml = '<a href="#" class="list-group-item" data-toggle="collapse" data-target="#' + name + '">' +
                    name + '<span class="badge">' + value + '</span>' + '<div id="' + name + '" class="collapse">';
                var listItem = workerListItem[name];
                for (var j = 0; j < listItem.length; j++) {
                    completedHtml = completedHtml + '<li  class="list-group-item">' + listItem[j] + '</li>';
                    memberHtml = memberHtml + '<li  class="list-group-item">' + listItem[j] + '</li>';
                }
                memberHtml += '</div></a>';
                $(".member-stats").append(memberHtml);
            }
        }

        // $(".completedStats").html("Completed " + '<span class="badge">' + totalCompleted + '</span>');
        // $(".completedStats").append('<div id="totalCompleted" class="collapse">');
        // $("#totalCompleted").append(completedHtml);
        // $("#totalCompleted").append('</div>');
    },
    //function that hides/removes login/registration buttons
    changeLogInBtn: function(currentMember) {
        if (currentMember.length > 0) {
            ftdl.showPage3();
            $(".currentMemberHeader").html('<div class="welcomeHeader">Welcome ' + currentMember + " to the " + firebase.auth().currentUser.displayName + ' Family To-Do List!</div>');
        }
    },

    membersAdd: function() {
        $(".memberSelect").empty();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/members').on('child_added', function(snapshot) {
            var members = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.appendMembers(members, id);
        });
    },

    initialAdd: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').limitToFirst(1).on('child_added', function(snapshot) {
            var completeInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.listAdd(completeInfo, id);
        });
    },

    listAdd: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').orderByChild("Index").once('value', function(snapshot) {
            $(".todoList").empty();
            $(".completedList").empty();
            $(".timedEvents").empty();
            snapshot.forEach(function(childSnapshot) {
                if (childSnapshot.val().Status == "completed") {
                    ftdl.appendComplete(childSnapshot.val(), childSnapshot.key);
                } else if (childSnapshot.val().Timed.length > 0) {
                    ftdl.appendList(childSnapshot.val(), childSnapshot.key, true);
                } else if (childSnapshot.val().Status == "not complete") {
                    ftdl.appendList(childSnapshot.val(), childSnapshot.key, false);
                }
            });
            ftdl.getData();
        });
    },

    listRemove: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').on('child_removed', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            console.log(todoInfo.Status);
            $("#" + id).remove();
        });
    },

    completeAdd: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid).on('child_changed', function(snapshot) {
            var completeInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.listAdd();
        });
    },

    eventAdd: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').on('child_added', function(snapshot) {
            var eventInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            ftdl.appendEvent(eventInfo, id);
        });
    },

    eventRemove: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').on('child_removed', function(snapshot) {
            var todoInfo = snapshot.val();
            var id = snapshot.key; //THIS IS THE ID PER LIST ITEM
            $("#" + id).remove();
        });
    },

    appendMembers: function(members, id) {
        var memberButton = $('<button>').addClass('chooseMember btn btn-primary')
            .attr('data-member', members.member)
            .bind('click', ftdl.chooseMember)
            .text(members.member);
        var memberLi = $('<li><a href="#">' + members.member + '</a></li>');
        $(".memberSelect").append(memberButton);
        $("#header-members").append(memberLi); //removing header
    },

	appendList: function(todoInfo, id, timed) {
		var $todoDiv = $('<div>').addClass('todoDiv').attr("id", id);
		var $name = $('<span>').text('Item Name: ' + todoInfo.Name).addClass('listitem');		
		var $imgDiv = $('<div>').addClass('pull-right')
		var $img1 = $('<img>').attr({'src': 'assets/images/timed_event.jpg', 'title': 'Timed Events'})
			.addClass('link-icon');
		var $img2 = $('<img>').attr({
				'src': 'assets/images/location.png','data-toggle': 'modal', 'data-target': '#mapModal', 'title': 'Map'})
			.addClass('link-icon');
		var $img3 = $('<img>').attr({ 'src': 'assets/images/check.png', 'todoID': id, 'title': 'Mark as completed'})
			.addClass('link-icon completeTodo');
		var $img4 = $('<img>').attr({ 'src': 'assets/images/delete.png', 'todoID': id, 'title': 'Delete item'})
			.addClass('link-icon closeTodo');
		var $img5 = $('<img>').attr({ 'src': 'assets/images/notes.png', 'todoID': id, 'data-toggle': 'modal', 'data-target': '#noteModal', 'title': 'Notes' })
			.addClass('link-icon noteTodo')
		$imgDiv.append($img1, $img2, $img3, $img4, $img5);
		if (todoInfo.Categories != 'Timed Event') {
			$img1.addClass('hide');
		}
		$name.append($imgDiv);
		var $description = $('<p>').addClass('clear descpar').text('Description: ' + todoInfo.Description);
		$todoDiv.append($name, $description);
		if (timed === true) {
			$(".timedEvents").append($todoDiv);
		}
		if (timed === false) {
			$(".todoList").append($todoDiv);
		}
	},

	appendEvent: function(eventInfo, id) {
		var $eventDiv = $('<div>').addClass('eventDiv').attr("id", id);
		var $name = $('<span>').text('Event Name: ' + eventInfo.Name).addClass('listitem');
		var $imgDiv = $('<div>').addClass('pull-right')
		var $img1 = $('<img>').attr({'src': 'assets/images/location.png', 'title': 'Location'}).addClass('link-icon');
		var $img2 = $('<img>').attr({'src': 'assets/images/delete.png', 'title': 'Delete','todoID': id})
			.addClass('link-icon closeTodo');
		$imgDiv.append($img1, $img2);
		var $description = $('<p>').addClass('clear descpar').text('Description: ' + eventInfo.Description);
		$eventDiv.append($name, $imgDiv, $description);
		$(".future-items").append($eventDiv);
	},

	appendComplete: function(completeInfo, id) {
		var $completeDiv = $('<div>').addClass('eventDiv').attr("id", id);
		var $name = $('<span>').text('Item Name: ' + completeInfo.Name).addClass('listitem');
		var $imgDiv = $('<div>').addClass('pull-right')
		var $img1 = $('<img>').attr({'src': 'assets/images/check.png', 'title': 'Completed','todoID': id})
			.addClass('link-icon');
		$imgDiv.append($img1);
		var $description = $('<p>').addClass('clear descpar').text('Completed By: ' + completeInfo.CompletedBy);
		$completeDiv.append($name, $imgDiv, $description);
		$(".completedList").append($completeDiv);
	},

    deleteTodo: function() {
        var todoNumber = $(this).attr("todoID");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).remove();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event/' + todoNumber).remove();
    },

    completeTodo: function() {
        var todoNumber = $(this).attr("todoID");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).update({
            "Status": "completed",
            "CompletedBy": currentMember
        });
    },

    //LOGIN//SIGN IN BUTTON
    loginSubmit: function(e) {
        e.preventDefault();
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
        $("#login").trigger('reset');
    },

    //REGISTER BUTTON
    registerSubmit: function(e) {
        e.preventDefault();
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
        $("#register").trigger('reset');
    },

    //TODO SUBMIT BUTTON
    todoSubmit: function(e) {
        e.preventDefault();
        $('#todoModal').modal('hide');
        var name = $("#todoName").val();
        var cat = $("#todoCatInput").val();
        var location = $("#locationinput").val();
        var locationinfo = {
            lat: parseFloat($("#locationinput").attr('data-lat')),
            long: parseFloat($("#locationinput").attr('data-long')),
            address: $("#locationinput").attr('data-address')
        };
        var comments = $("#todoComments").val();
        var todoTime = $("#todo-dtpicker").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').push({
            Name: name,
            Categories: cat,
            Location: location,
            LocationInfo: locationinfo,
            Timed: todoTime,
            TimeCreated: Date.now(),
            Description: comments,
            Creator: currentMember,
            Status: "not complete"
        });

        $("#locationinput").removeAttr('data-lat');
        $("#locationinput").removeAttr('data-long');
        $("#locationinput").removeAttr('data-address');

        $("#submittodo").trigger('reset');
    },

    //EVENT SUBMIT BUTTON
    eventSubmit: function(e) {
        e.preventDefault();
        $('#eventModal').modal('hide');
        var name = $("#eventName").val();
        var cat = $("#eventCatInput").val();
        var location = $("#eventlocationinput").val();
        var locationinfo = {
            lat: parseFloat($("#eventlocationinput").attr('data-lat')),
            long: parseFloat($("#eventlocationinput").attr('data-long')),
            address: $("#eventlocationinput").attr('data-address')
        };
        var comments = $("#eventComments").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/event').push({
            Name: name,
            Categories: cat,
            Location: location,
            LocationInfo: locationinfo,
            Description: comments,
            TimeCreated: Date.now(),
            Creator: currentMember,
            CompletedBy: ""

        });

        $("#submitevent").trigger('reset');
    },

    //ADD MEMBER BUTTON
    btnAddMember: function(e) {
        e.preventDefault();
        var member = $("#memberAdd").val();
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/members').push({
            member: member
        });
        $('#membermodal').modal('hide');
    },

    //CHOOSE MEMBER
    chooseMember: function() {
        currentMember = $(this).attr('data-member');
        $('#current-member').val(currentMember);
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
        clearInterval(bgInterval);
        bgInterval = undefined;
        photoArray = [];
        $('body').css("background-image", "none");

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
            if (photoArray.length < 6) {
                photoArray.push("url(" + response.sizes.size[9].source + ")");
                ftdl.setPhotoAsBG();
            }
        });
    },

    setPhotoAsBG: function() {
        if (photoArray.length == 5) {
            var body = $('body');
            bgInterval = setInterval(ftdl.nextBackground, 10000);
            body.css('background-image', photoArray[0]);

        }
    },

    nextBackground: function() {
        var body = $('body');
        body.css("background-image", photoArray[currentPhoto = ++currentPhoto % photoArray.length]);
    },

    initMap: function() {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: myLatLong
        });
        var marker = new google.maps.Marker({
            position: myLatLong,
            map: map
        });

        ftdl.geocodeLatLng();

        marker.addListener('click', function() {
            map.setZoom(20);
            map.setCenter(marker.getPosition());
        });

        google.maps.event.addListener(map, 'click', function(event) {
            myLatLong.lat = event.latLng.lat();
            myLatLong.lng = event.latLng.lng();
            ftdl.initMap();
        });

        $('#recenter').on('click', function() {
            map.panTo(marker.getPosition());
        });
    },

    findLocation: function() {
        var address = $('#addresstext').val().trim();
        if (address.length > 0) {
            $('#address').text('');
            address = address.replace(/ /g, '+');
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' +
                address + '&key=AIzaSyDlqM5HOhxP8DcUtTclMRu0RSvWy9t59qk';
            $.getJSON(url, function() {
                    console.log('success');
                })
                .done(function(data) {
                    var loc = data.results;
                    var locAdd = loc[0].formatted_address;
                    $('#address').text(locAdd);
                    myLatLong.lat = loc[0].geometry.location.lat;
                    myLatLong.lng = loc[0].geometry.location.lng;
                    ftdl.initMap();
                })
                .fail(function(error) {
                    console.log(error);
                });
        }
    },

    geocodeLatLng: function() {
        var addressInfo = "";
        var geocoder = new google.maps.Geocoder;
        geocoder.geocode({ 'location': myLatLong }, function(results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    addressInfo = results[1].formatted_address;
                } else {
                    addressInfo = 'No results found';
                }
            } else {
                addressInfo = 'Geocoder failed due to: ' + status;
            };
            $('#clicklat').text(myLatLong.lat.toFixed(4))
                .attr('data-lat', myLatLong.lat);
            $('#clicklng').text(myLatLong.lng.toFixed(4))
                .attr('data-long', myLatLong.lng);
            if ($('#address').text() === '') {
                $('#address').text(addressInfo);
            };
        });
    },

    getLatLng: function() {
        var lat = parseFloat($('#clicklat').attr('data-lat'));
        var long = parseFloat($('#clicklng').attr('data-long'));
        var address = $('#address').text();
        var latLong = { lat: lat, lng: long, add: address };
        $('#clicklat').removeAttr('data-lat').text('');
        $('#clicklng').removeAttr('data-long').text('');
        $('#address').text('');
        return latLong;
    },

    logOut: function() {
        ftdl.logOutReset();
        ftdl.changeLogInBtn(currentMember);
        if (currentMember.length > 0) {
            photoArray = [];
            ftdl.findPhotoID();
            currentPhoto = 0;
        }
        currentMember = "";
        loggedIn = false;
        firebase.auth().signOut().catch(function(error) {
            console.log('logout ' + error.message);
        });

    },

    appendNote: function(todoInfo, id) {
        $('#note').val('');
        var todoNumber = $(this).attr("todoID");
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber).on('value', function(snapshot) {
            var todoInfo = snapshot.val();
            $('.note-title').html('<h1>' + todoInfo.Name + ' notes:</h1> <br> <span class="creator">Created by: ' + todoInfo.Creator + '</span>');
        })
        $('#btn-note').attr("todoID", todoNumber) //SAVES THE ITEM'S ID PER LIST ITEM
        if (database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber + '/note')) { 
            $('.note-display').empty();
            //Note listner
            database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber + '/note').off(); 
            database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber + '/note').on("child_added", function(snapshot) {
                var noteMessage = snapshot.val().note;
                var userName = snapshot.val().name;
                var noteDiv = $("<div>");
                noteDiv.append(userName + ": " + noteMessage);
                $(".note-display").append(noteDiv);
            })
        }

    },

    saveNote: function(e) {
        e.preventDefault();
        var note = $("#note").val();
        var todoNumber = $(this).attr("todoID");
        if (note.length > 0) { 
            database.ref('/Users/' + firebase.auth().currentUser.uid + '/list/' + todoNumber + '/note').push({ "note": note, "name": currentMember });
        }
        $('#note').val('');
    },

    logOutReset: function() {
        $(".completedList").empty();
        $(".todoList").empty();
        $('.future-items').empty();
        $('#header-members').empty();
    },

    getData: function() {
        database.ref('/Users/' + firebase.auth().currentUser.uid + '/list').once('value', function(snapshot) {
            myData = snapshot.val();

        });
    },

    setTodoIndex: function() {
        for (i = 0; i < $(".todoDiv").length; i++) {
            var todoID = $($(".todoDiv")[i]).attr("id");
            myData[todoID]["Index"] = i;
        }
        database.ref('/Users/' + firebase.auth().currentUser.uid).update({
            "list": myData
        });

    }
};

$(".sortable").sortable({
    stop: function(event, ui) {
        ftdl.setTodoIndex();
    }
});

ftdl.findPhotoID();
$(document.body).on('click', '.closeTodo', ftdl.deleteTodo);
$(document.body).on('click', '.completeTodo', ftdl.completeTodo);
$(document.body).on('click', '.noteTodo', ftdl.appendNote);
$(document.body).on('click', '#btn-note', ftdl.saveNote);
$('.btnLogout').bind('click', ftdl.logOut);
$('#loginbtn').on('click', function(event) { ftdl.loginSubmit(event) });
$('#registerbtn').on('click', function(event) { ftdl.registerSubmit(event) });
$('#todobtn').on('click', function(event) { ftdl.todoSubmit(event) });
$('#eventbtn').on('click', function(event) { ftdl.eventSubmit(event) });
$('#memberbtn').on('click', function(event) { ftdl.btnAddMember(event) });
//on enter keypress listeners
$('#register').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        ftdl.registerSubmit(event);
    }
});
$('#login').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        ftdl.loginSubmit(event);
    }
});
$('.add-member').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        ftdl.btnAddMember(event);
    }
});

$('#submitTodo').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        ftdl.todoSubmit(event);
    }
});

$('#submitEvent').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        ftdl.eventSubmit(event);
    }
});
$('#note-input').keypress(function(e) {
    var key = e.which;
    if (key == 13) // the enter key code
    {
        $('#btn-note').click();
    }
});


//Map
$('#mapmodal').on('shown.bs.modal', function() { ftdl.initMap() });
$('#findlocation').on('click', function() { ftdl.findLocation() });

$('#loc-confirm').on('click', function() {
    var latLong = ftdl.getLatLng();
    // You can use latLong object variable to store
    // the location information here.
    // latLong.lat & latLong.lng & latLong.add
    var dataInput = $('#data-input').val();
    $('#' + dataInput).attr({
        'data-address': latLong.add,
        'data-lat': latLong.lat,
        'data-long': latLong.lng
    });

    $('#data-input').val('');
    $('#mapmodal').modal('hide');
});

$('.openmap').click(function() {
    var $id = $(this).prev().attr('id');
    $('#data-input').val($id);
    // $('#mapmodal').modal('show');
});

$('.dtpicker input[type=radio]').change(function() {
    if ($(this).val() === 'timed') {
        $('#todo-dtpicker').removeClass('hide');
    } else {
        $('#todo-dtpicker').addClass('hide');
    };
})

// $.datetimepicker.setDateFormatter({
//     parseDate: function (date, format) {
//         var d = moment(date, format);
//         return d.isValid() ? d.toDate() : false;
//     },

//     formatDate: function (date, format) {
//         return moment(date).format(format);
//     }
// });

var dtOptions = {
    lang: 'en',
    // format:'ddd, MMM DD, YYYY h:mm A',
    dayOfWeekStart: 1,
    step: 15
};
// $.datetimepicker.setLocale('en');
$('#todo-dtpicker').datetimepicker(dtOptions);

$('#eventdate').datetimepicker(dtOptions);

function getTodayDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    return today;
}
