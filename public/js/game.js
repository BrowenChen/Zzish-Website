/*
Multiple choice table in an app. 
2x12, each array input numbers


Answer:
	 1 2 3 4    Ans.
	 _ _ _ _
1	|_|_|_|_|	1 2 3 4
2	|_|_|_|_|   2 4 6 8
3	|_|_|_|_|   3 6 9 12
4	|_|_|_|_|   4 8 12 16
5	|_|_|_|_|   5 10 15 20
6	|_|_|_|_|   6 12 18 24


User

	 1 2 3 4    
	 _ _ _ _
1	|_|_|_|_|	
2	|_|_|_|_|   
3	|_|_|_|_|   
4	|_|_|_|_|   
5	|_|_|_|_|   
6	|_|_|_|_|   


Marked Grid - Checks if current cell is marked or not

	 1 2 3 4    
	 _ _ _ _
1	|_|_|_|_|	
2	|_|_|_|_|   
3	|_|_|_|_|   
4	|_|_|_|_|   
5	|_|_|_|_|   
6	|_|_|_|_|   


cellCurCursor = (x,y) of where the current cursor is on the cell. 
	Cursor has options to move(LRUP) or click()

	click() action 
		Check if current cell has been previously selected
		If MarkedGrid (cellCurCursor(x,y) ) == false:
		(Continue with algorithm)
			prompt user for input 
			Listen for user input
			Check if input is equal to the answer grid
			Mark right or wrong in that current grid
			Mark in MarkedGrid that cellCurCursor(x, y) is marked
			Maybe draw in a picture on that cell grid for the User grid to show that it is marked

		If the markedGrid of (cellCurCursor(x,y)) is == true, we cannot use that cell 

	move(direction) action
		4 case switches
		Left - do those actions
		Right -
		Up -
		Down - 


	

	
*/

var score = 0;

var xLoc = 0;
var yLoc = 0;

var Z;
var activeActivity;

var previousBlock = "";

// - - - - Owen

/*
Function - ansChecker
@param: xCoor, yCoor, usrInput
@return: True, Fals
-------------------
Description:
Creating 2d ANSWERS table. 5x5 grid
ansChecker function. Take in x and y coordinates and usrInput. 
Return true or false
*/

function ansChecker(xCoor, yCoor, usrInput){
	var answers = {};

	var usrKey = String(xCoor + "," + yCoor);

	for (var y = 0; y < 10; y++){
		for (var x = 0; x < 10; x++){
			var key = String(x + "," + y);
			var value = x*y;
			answers[key] = value;
		}
	}

//Check usrInput with the anser Grid
	if (answers[usrKey] == usrInput){
		console.log("Yay");
		return true;
	} else {
		console.log("Boo!");
		return false;
	}
}


// - - - - Daryl

function init(callback)	{

	console.log('call init');

	Z.init({appId: '53468afc30043a19979e0533', debug: true, baseUrl: 'http://dev.zzish.com/api'});
	//Z.init({appId: '53468afc30043a19979e0533', debug: true, baseUrl: 'http://localhost:8080/platform-api/api'});
	Z.devices.create({name: 'device' + Date.now()}, function (err, result) {
			if (err) {
				console.log('error', err);
			}
			else {
				console.log('DEVICE ID: ' + result.id);
				localStorage.setItem("dev_id", result.id);
				callback(result.id);
			}
	});
}

window.onload = function(){
	var dev_id;

	if (typeof(Storage) != "undefined") {
		dev_id = localStorage.getItem("dev_id");
		user_id = localStorage.getItem("user_id");



		if(dev_id == null){
			init(function(dev_id) {
				console.log("dev_id generated:" + dev_id);

				Z.users.create({
					'deviceId': dev_id,
					'name': 'studentTest',
					},
					function (err, result) {
						if (err) {
							console.log('error', err);
						}
						else {
							//place new user in local storage
							localStorage.setItem("user_id", result.id);

							//create a session
							Z.sessions.create( {'deviceId': dev_id, 'userId' : result.id},
								function(err, session){
									if (err === null & session != null) {
										console.log(session);
										session.activities.create({name: 'gameTest'}, function(err, activity) {
											console.log(activity);
											activeActivity = activity;
												
											}
										);
									}
							});
						}
					}
				);

			});
		} 
		else {
			console.log("dev_id storage:" + dev_id);
			console.log("user_id storage:" + user_id);

			Z.init({appId: '53468afc30043a19979e0533', debug: true, baseUrl: 'http://dev.zzish.com/api'});
			Z.sessions.create( {'deviceId': dev_id, 'userId' : user_id},
				function(err, session){
					if (err === null & session != null) {
						console.log(session);
						session.activities.create({name: 'gameTest'}, function(err, activity) {
							console.log(activity);
							activeActivity = activity; 
							
							}
						);
					}
			});
		}

	} 
	else {
		console.log('no storage support');
	}
}

function finishGame(){
	activeActivity.stop( function (err, res) {
		console.log(res);
		}
	);
}


/*
Function - Checks for Key presses
@param: anyKey
@return: -
-------------------
Description:
Takes in key stroke (awsd) and moves curser as well as submits answer (enter)
*/

$(document).keypress(function(e){
	
	//get input from input
	//var input = $('#attack_input').val();

	console.log(e.keyCode);

	// - - - - Submitting Solution: if enter is pressed
	if(e.keyCode == '13') {
		console.log('x: ' + xLoc + ' yLoc: ' + yLoc + ' input: ' + input);
		//ansChecker(xLoc, yLoc, input);
	}

	// - - - - Moving curser

	// left - (a)
	if(e.keyCode == '97') {
		//change back previous block to not selected
		$('#' + previousBlock).removeClass("selected");
		

		console.log(previousBlock);

		//get new ID
		xLoc = xLoc - 1;
		if(xLoc < 0 ) xLoc = xDim;

		console.log('x ' + xLoc + ', y ' + yLoc);

		var id = "block" + xLoc + yLoc;
		console.log('new id: ' + id);
		previousBlock = id;

		//Change class to selected
    	$('#' + id).addClass("selected");
	}

	// // right - (d)
	// if(e.keyCode == '100') {
	// 	//change back previous block to not selected
	// 	$('#' + previousBlock).removeClass("selected");
		

	// 	console.log(previousBlock);

	// 	//get new ID
	// 	xLoc = xLoc + 1;
	// 	if(xLoc > xDim ) xLoc = 0;

	// 	console.log('x ' + xLoc + ', y ' + yLoc);

	// 	var id = "block" + xLoc + yLoc;
	// 	console.log('new id: ' + id);
	// 	previousBlock = id;

	// 	//Change class to selected
 //    	$('#' + id).addClass("selected");
	// }

	// // up - (w)
	// if(e.keyCode == '119') {
	// 	//change back previous block to not selected
	// 	$('#' + previousBlock).removeClass("selected");
		

	// 	console.log(previousBlock);

	// 	//get new ID
	// 	yLoc = yLoc - 1;
	// 	if(yLoc < 0 ) yLoc = yDim;

	// 	console.log('x ' + xLoc + ', y ' + yLoc);

	// 	var id = "block" + xLoc + yLoc;
	// 	console.log('new id: ' + id);
	// 	previousBlock = id;

	// 	//Change class to selected
 //    	$('#' + id).addClass("selected");
	// }

	// // down - (s)
	// if(e.keyCode == '115') {
	// 	//change back previous block to not selected
	// 	$('#' + previousBlock).removeClass("selected");
		

	// 	console.log(previousBlock);

	// 	//get new ID
	// 	yLoc = yLoc + 1;
	// 	if(yLoc > yDim) yLoc = 0;

	// 	console.log('x ' + xLoc + ', y ' + yLoc);

	// 	var id = "block" + xLoc + yLoc;
	// 	console.log('new id: ' + id);
	// 	previousBlock = id;

	// 	//Change class to selected
 //    	$('#' + id).addClass("selected");
	// }


});

/*
Function - checkSolution
@param: -
@return: - 
-------------------
Description:
Checks all the solutions submitted used ansChecker
*/

function checkSolutions() {	
	console.log('checkSol');
	finishGame();

	for(var i = 0 ; i < 13; i++){
		for(var j = 0 ; j < 13; j++){

			var input = document.getElementById('question' + j + 'x' + i + 'y').value;
			console.log('x: ' + j + ' yLoc: ' + i + ' input: ' + input);
			if(ansChecker(j,i,input)) score++;
		}
	}

	alert('score: ' + score);
}

/*
Function - ansChecker
@param: xCoor, yCoor, usrInput
@return: True, Fals
-------------------
Description:
Creating 2d ANSWERS table. 5x5 grid
ansChecker function. Take in x and y coordinates and usrInput. 
Return true or false
*/

function reset() {	
	console.log('reset');

	for(var i = 0 ; i < 13; i++){
		for(var j = 0 ; j < 13; j++){

			document.getElementById('question' + j + 'x' + i + 'y').value = "x";
		
		}
	}

	alert('score: ' + score);
}

function selectBlock(id, x, y) {
	xLoc = x;
	yLoc = y;


	console.log('x ' + xLoc + ', y ' + yLoc);

	//change back previous block to not selected
	$('#' + previousBlock).removeClass("selected");
	previousBlock = id;
	//Change class to selected
    $('#' + id).addClass("selected");
}



