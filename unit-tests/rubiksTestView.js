// MAIN

// standard global variables

var testIndex=1;
var commandStack=[];
var state=0;

var isSolving=false;
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var Q=new Queue();
var shiftButtonDown=false;
var isRotating=false;
var Action=null;

var rotationFactor=Math.PI/32;
var rotationCounter=0;

var N=3;
var theta=0;

var commands=['r','o','g','b','w','y'];

var scrambleInterval=200;
var scrambleIntervalHandle;
var cube=init();

animate(cube);
console.log (cube.toString());
// FUNCTIONS 	

function onKeyDown( event ) {
	var k=event.keyCode;
	console.log(k);
	
	var command=null;
	switch (k) {
	
	    case 16:
	    	shiftButtonDown=true;;
	        break;
	    case 82:
	    	command = 'r';
	        break;
	    case 76:
	    	command = 'o';
	        break;
	    case 85:
	    	command = 'w';
	        break;
	    case 68:
	    	command = 'y';
	        break;
	    case 70:
	    	command = 'g';
	        break;
	    case 66:
	    	command = 'b';
	        break;
	    case 71:
	    	command='g';
	    	break;
	    case 79:
	    	command='o';
	    	break;
	    case 87:
	    	command='w';
	    	break;
	    case 89:
	    	command='y';
	    	break;
	    case 65:  //a
	    	if (shiftButtonDown){
	    		isSolving=false;
	    		if (states[testIndex].moves.length==2){
	    			commandStack.push('n');
	    			commandStack.push(state);
	    			console.log(commandStack);
	    			states[testIndex].moves=commandStack;
	    			}
	    		testState(testIndex);
	    	}
	    	else{
	    		
	    		if (isSolving)
	    			isSolving=false;
	    		else {
	    			isSolving=true;
	    			//solve(testIndex);
	    			testState(testIndex++);
	    		}
	    		
	    		
	    		
	    	}
	    		
	    	break;
	    case 83: //s
	    	
	   // 	save();
	    case 67: //c
	    	console.log(cube.toString());
	    	break;
	    case 73: //i
	    	
	 	   if (shiftButtonDown){
	 		  if( testIndex > 1)
	 			  testIndex--;
	 	   }
	 	   else{
	 		   if (testIndex<states.length)
	 			   testIndex++;
	 	   }
	 	   console.log ("State number:", testIndex);
	 	   	cube.setCubeState(states[testIndex].initialState);
	 	   	commandStack=[];
	 	   break;
	}
    if (shiftButtonDown && command)
    	command+='!';
    
    if (command){
    	Q.enqueue(command);
    	commandStack.push(command);
    }
    	

}
var save=function(){
	var stateName;
	for (var i=0; i< 10; i++){
		var state=states[i];
		state.algorithm=0;
		if (state.stateName!=undefined)
			stateName=state.stateName;
		else
			state.stateName=stateName;
		
		
		$.post( "http://localhost/five/rubiksServer/public/states", state);
	}
};

var solve=function(state){
	
	
	
	var moves= states[state].moves;
	
	isRotating=true;
	for (var j=0; j<moves.length; j++)
		Q.enqueue(moves[j]);
    Q.enqueue('n');
    Q.enqueue(state.next);
	
	isRotating=false;
	return;
	

		
};

var testState=function(testIndex){
		var initialState=states[testIndex].initialState;
		cube.setCubeState(initialState);
		solve(testIndex);
};

function init() 
{
	// SCENE
	scene = new THREE.Scene();
	
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(150, 60, 100);
	camera.lookAt(scene.position);
	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);

	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xcdf2f4, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	
	var cube=new RubiksCube(scene,N );
    return cube;
    	
}


function onKeyUp( event ){
	if (event.keyCode==16)
		shiftButtonDown=false;
}

function animate(cube) 
{
    requestAnimationFrame( function(){animate(cube)} );
	render();		
	update(cube);
}

function update(cube)
{
	if (!isRotating)
		Action=Q.dequeue();
	
	if (Action){
		
		if (Action.substring(1,2)=='!')
			var direction=-1;
		else
			direction=1;
		
		var action=Action.substring(0,1);
	
		if (action == 'n') {
		
			number=Q.dequeue();
						
			
			var stateName= states[ states[testIndex].finalState ].stateName;
			var current=cube.toString();
			var expected= RegExp(states[ states[testIndex].finalState ].initialState);
			var success=expected.test(current);
			var moves= states[ testIndex].moves;
			var state=states[ testIndex].state;
			console.log (testIndex, state, success, current,expected, moves );
				if (isSolving){
					if (testIndex< states.length-1) {
						testIndex++;
						testState(testIndex);
					}
				}
						
		}
			
		else if ('rludfb'.indexOf(action)>=0) {
			isRotating=true;
			if (rotationCounter < 0.5 * Math.PI){
				cube.rotate(action, direction, rotationFactor);
				rotationCounter+=rotationFactor;
				
			}
			else
			{
				isRotating=false;
				if (action){
					cube.rotateFace(action,direction );
					action=null;
				}
				Action=null;
				rotationCounter=0;
			}
		}
	}

	controls.update();
	stats.update();
}

function render() 
{
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}
window.addEventListener( 'keydown', onKeyDown, false );
window.addEventListener( 'keyup', onKeyUp, false );

//http://mrdoob.github.io/three.js/examples/canvas_geometry_cube.html -- touch example 
