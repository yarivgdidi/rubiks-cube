function RubiksView(ngController) {
	var _this=this;
	var container, scene, camera, renderer, controls, stats;
	var Q=new Queue();
	var shiftButtonDown=false;
	var isRotating=false, isFlipping=false;
	var Action=null;
	var rotationFactor=Math.PI/32;

  var azimuthalTarget,currentAzimut ,flipDistance, flipCounter, flipFactor, flipCounts;
	var polarTarget, currentPolar, panDistance, panCounts, panFactor, panCounter , verticallFlipP1, verticallFlipP2;

  var initialAzimuthalAngle;
	var rotationCounter=0;
	var N=3;
	var theta=0;
	var commands=['r','l','f','b','u','d'];
	var scrambleInterval=200;
	var scrambleIntervalHandle;
	var cube=init();
	var clickStateColor=null;
	var clickStateIsReplaceOnly=false;
	var solver = new Solver();

	this.start=function(){
		animate(cube);
	};

	this.getCube = function(){
		return cube;
	}

	this.setClickStateColor=function(color){
		clickStateColor=color;
	};

	this.setClickStateIsReplaceOnly=function(value){
		clickStateIsReplaceOnly=value;
	};

	this.solve = function () {
        var c = cube.toString();
        solver.set(c);
        solver.resetCounter();
        return solver.solve(0);
	};

	var camera, flippedCamera, activeCamera, controls, flippedCorrection = 1;
	var cameraPositionMatrix = {
        'GRW': [80, 80, 150, 1, 30, 60],
        'RBW': [150, 80, -80, 1, 120, 60],
        'BOW': [-80, 80, -150 , 1, -150, 60 ],
        'OGW': [-150, 80, 80, 1, -60 ,60],

        'GOY': [-80, -80, 150, -1, -30,115 ],
        'OBY': [-150, -80, -80, -1, -120,115 ],
        'BRY': [80, -80, -150, -1, 150,115 ],
        'RGY': [150, -80, 80, -1,  60 ,115]
	};

	this.setCameraPosition = function(positionKey) {
    if (! cameraPositionMatrix[positionKey])
			return;

		_this.isFliped = cameraPositionMatrix[positionKey][3] !== 1;
		activeCamera = _this.isFliped? flippedCamera : camera ;
		activeCamera.position.set(cameraPositionMatrix[positionKey][0], cameraPositionMatrix[positionKey][1], cameraPositionMatrix[positionKey][2] );
		flippedCorrection = cameraPositionMatrix[positionKey][3]
		controls.setCamera(activeCamera, flippedCorrection);
		controls.update();
  }

  var positionIndex=0;
	var cameraPositions = ['GRW', 'RBW', 'BOW', 'OGW', 'GOY', 'OBY', 'BRY' , 'RGY'  ];
	this.flip = function() {
    this.setCameraPosition(cameraPositions[positionIndex]);
		if (positionIndex < 7)
			positionIndex ++;
		else
			positionIndex = 0;
	}
	function init() {
		scene = new THREE.Scene();
		var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
		var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
		camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
		scene.add(camera);
		camera.position.set(80, 80, 150);
		activeCamera = camera;
		var VIEW_ANGLE2 = -45;
		flippedCamera = new THREE.PerspectiveCamera( VIEW_ANGLE2, ASPECT, NEAR, FAR);
		scene.add(flippedCamera);
		flippedCamera.position.set(-80, -80 , -150);

		// RENDERER
		if ( Detector.webgl )
			renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			renderer = new THREE.CanvasRenderer();

		renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
		container = document.getElementById( 'ThreeJS' );
		container.appendChild( renderer.domElement );

		controls = new THREE.OrbitControls( camera, renderer.domElement );
		var light = new THREE.PointLight(0xffffff);
		light.position.set(0,250,0);
		scene.add(light);
		initialAzimuthalAngle=controls.getAzimuthalAngle()
		var skyBoxGeometry = new THREE.BoxGeometry( 10000, 10000, 10000 );
		var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xFCFCFC, side: THREE.BackSide } ); //0xcdf2f4
		var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
		scene.add(skyBox);

		var cube=new RubiksCube(scene,N );
	    return cube;
	}

	this.scrumble=function(scrambling){
		if(!scrambling)
			scrumble();
		else
			stopScrumble();
	}

	function scrumble(){
		var min=0, max=5;
		var lastX=null;

		if (!scrambleIntervalHandle)
			scrambleIntervalHandle=setInterval(function(){
				var x=Math.floor(Math.random() * (max - min + 1)) + min;
				var d=Math.floor(Math.random() * (1 - 0 + 1)) ;

				if (x==lastX && d)
					return;

           		var command=commands[x];
				if (d)
					command=commands[x]+'!';

				Q.enqueue(command);
				lastX=x;

			}, scrambleInterval);
	}

	function stopScrumble(){
		clearInterval(scrambleIntervalHandle);
		scrambleIntervalHandle=false;
		while (! Q.isEmpty())
			x=Q.dequeue();
	}

	function onKeyDown( event ) {
		var k=event.keyCode;
		var command=null;
		var keyClicked=null;

		if (k > 64 && k < 91) //a -z
			keyClicked=String.fromCharCode(k).toLowerCase();
		else if (k==16)
			shiftButtonDown=true;

		switch (keyClicked) {
			case 'i':
				_this.reset();
		    	break;
			case 's':
				if (shiftButtonDown)
		    		stopScrumble();
		    	else
		    		scrumble();

				break;
			case 'a':
				solve(0);
		    	break;

			case 'x':
			    	_this.setCustom();
			    	break;

			case 'f':
				_this.flip();
				break;
			case 'e':
				ngController.toggleEditMode();
				break;
			case 'v':
				// cube.setCubeState("yybwwggwrwooybybogorrobbgrorrobroggbobrbygywwg.w.w.y.y");
				// cube.setCubeState("rowwgrwgrbboyrwobgbogoggogoyrwgryybbborwwybywy.g.o.y.y");
				// cube.setCubeState("ygwgwwrwrgooyywobgyggobbgyoroogbybbbrrwwbryrwg.r.w.o.y");
        // cube.setCubeState("rrrrrrrrrggggoggggoobywoyoooybbbbbbbwwwwwwgwwyyyoobyyy");
        cube.setCubeState("gygwowobrygwryrwogbbbogygoorrwwygrrbwybgrbywwbboooyrgy");
        //    cube.setCubeState("rrggyyrrrgbrbbogggoyyrrgooobyyrybbbbwwwwwwwwwgoogbyooy");
				cube.resetTestMode();
				ngController.startTestMode();
				_this.finish2PCS();
				break;
			case 't':
				 console.log(cube.toString(true))
				 break;y
			case 'z':
				 _this.finish2PCS();
				 break;
			default:
				 command=keyClicked;
			 	break;

		}
	    if (shiftButtonDown && command)
	    	command+='!';

	    if (command)
	    	Q.enqueue(command);

	}
	var permArr = [], usedChars = [];
	function permute(input) {
		if(input.length > 4)
			return [];

		var i, ch;
		for (i = 0; i < input.length; i++) {
			ch = input.splice(i, 1)[0];
			usedChars.push(ch);
			if (input.length == 0) {
				permArr.push(usedChars.slice());
			}
			permute(input);
			input.splice(i, 0, ch);
			usedChars.pop();
		}
		return permArr
	};

	this.finish2PCS=function(){
		var colorsLeft=ngController.getLeftColors();
		if (colorsLeft.lenght >4)
			return;

		var silverFaces=cube.getSilverFaces();
		var cubesColors = []
		for (var i=0; i< silverFaces.length; i++){
			colors=cube.getSubCubeColors(silverFaces[i].object.index, silverFaces[i].point)
			cubesColors.push( colors.substr(0,2) )

		}

		permArr = [], usedChars = [];
		var colorsLeftPermutations = permute(colorsLeft)
		var validLeftPermutations = []

//		console.log('cubesColors',cubesColors);
//		console.log('colorsLeftPermutations', colorsLeftPermutations);
//		console.log('cube.valid2pcsSubCubes', cube.valid2pcsSubCubes)
//
		for(var i=0; i<colorsLeftPermutations.length;i++ ){
			validPermCandidate=[];
			for (var j =0 ; j< cubesColors.length; j++){
				testColor = cubesColors[j][0] + colorsLeftPermutations[i][j];
				if (cube.match2pcsSubCubes(testColor, test=true))
					validPermCandidate.push(testColor)
				else
					break;
			}
			if (validPermCandidate.length == cubesColors.length )
				validLeftPermutations.push(validPermCandidate)
		}

		//remove duplicates
		for (x=0; x<2; x++){
			if (validLeftPermutations.length > 1){
				var flag=0
				var l = validLeftPermutations.length;
				for (i=0; i<validLeftPermutations[0].length; i++){
					if (validLeftPermutations[0][i]==validLeftPermutations[l-1][i])
						flag++
				}
				if (flag==validLeftPermutations[0].length)
					validLeftPermutations.pop();
			}
		}

		// special caee - 2 uncertainties
		if (validLeftPermutations.length == 2 ){
			var colors=cube.getColors()
			var  n1=false, n2=false

			if (validLeftPermutations[0][0][0]==validLeftPermutations[0][1][0]){
				n1=2
				n2=3

			}
			else if(validLeftPermutations[0][0][0]==validLeftPermutations[0][2][0] ){
				n1=1
				n2=3

			}
			else if(validLeftPermutations[0][0][0]==validLeftPermutations[0][3][0] ){
				n1=1
				n2=2

			}
			else if(validLeftPermutations[0][1][0]==validLeftPermutations[0][2][0] ){
				n1=0
				n2=3

			}
			else if(validLeftPermutations[0][1][0]==validLeftPermutations[0][3][0] ){
				n1=0
				n2=2

			}
			else if(validLeftPermutations[0][2][0]==validLeftPermutations[0][3][0] ){
				n1=0
				n2=1
			}
			if (n1 && n2 ){
				c1=validLeftPermutations[0][n1][1]
				c2=validLeftPermutations[0][n2][1]
				setFaceColor(silverFaces[n1],colors, colors[c1].color ,colors['s'].color,false )
				setFaceColor(silverFaces[n2],colors, colors[c2].color ,colors['s'].color,false )
				ngController.updateColorCount(colors[c1].name ,false)
				ngController.updateColorCount(colors[c2].name ,true)
			}
		}

		if (validLeftPermutations.length == 1 ){
			var colors=cube.getColors()
			for (var i=0; i< silverFaces.length; i++ ){
				setFaceColor(silverFaces[i],colors, colors[validLeftPermutations[0][i][1]].color ,colors['s'].color,false )
				ngController.updateColorCount(colors[validLeftPermutations[0][i][1]].name ,(i==(silverFaces.length-1)))
			}
		}
		else{
			console.log('validLeftPermutations',validLeftPermutations)
		}
	}

	this.reset=function(){
		cube.setCubeState("rrrrrrrrrgggggggggooooooooobbbbbbbbbwwwwwwwwwyyyyyyyyy");
	}

	this.setCubeState = function(state) {
		cube.setCubeState(state);
	};

	this.setCustom=function(){
		cube.setCubeState("........r........g........o........b........w........y");
		cube.resetCustomMode();
	}

	this.spin=function(command){
		Q.enqueue(command);
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

	function getPanningParams() {
		if (verticallFlipP1)
			return;
        polarTarget =  cameraPositionMatrix[Action][5];
        currentPolar = controls.getPolarAngle()* 180 / Math.PI;
        panDistance = polarTarget - currentPolar;
        panCounts = Math.abs(parseInt(panDistance / 2));
        panFactor = panDistance/panCounts * -1;
      //  console.log ('panDistance', panDistance);
        panCounter = 0;
	}

	function isVerticalFlip() {
    var flipCorrection= cameraPositionMatrix[Action][3];
		var oldFlipCorrection = controls.getFlippedCorrection()
		if (flipCorrection === -1 && oldFlipCorrection === 1 ) {
			console.log( "white to yellow");
			verticallFlipP1 = true;
			polarTarget = 179;
            currentPolar = controls.getPolarAngle()* 180 / Math.PI;
            panDistance = polarTarget - currentPolar;
            panCounts = Math.abs(parseInt(panDistance / 2));
            panFactor = panDistance/panCounts * -1;
            console.log ('panDistance', panDistance);
            panCounter = 0;

		}
		else if  (flipCorrection == 1 && oldFlipCorrection == -1 ){
			console.log(" yellow to white " );
		}
	}

	function getRotatingParams() {
        if (verticallFlipP1)
            return;
        azimuthalTarget = cameraPositionMatrix[Action][4];
        currentAzimut=  controls.getAzimuthalAngle()* 180 / Math.PI;
        if (currentAzimut < 0)
            currentAzimut += 360;

        flipDistance = azimuthalTarget - currentAzimut;
        if (flipDistance > 180)
            flipDistance = flipDistance - 360;

        else if (flipDistance < -180) {
            flipDistance = flipDistance + 360;
		}

        flipCounts = Math.abs(parseInt(flipDistance / 2));

        flipFactor = flipDistance/flipCounts * -1;
    //    console.log(Action, "flipDistance: " ,flipDistance, "    flipCounts: ", flipCounts, "   flipFactor: " , flipFactor);
        flipCounter = 0;
	}
	function rotateCube(){
        if (panCounter < panCounts){
            controls.setRotateUp( panFactor*Math.PI/180 * flippedCorrection );
            panCounter += 1;
        }
        else if (flipCounter < flipCounts) {
            controls.setRotateLeft( flipFactor*Math.PI/180 * flippedCorrection);
            flipCounter += 1;
        }
	}

	function update(cube)
	{
		if (!isRotating && !isFlipping && !verticallFlipP1 && !verticallFlipP2)
			Action=Q.dequeue();

		if (Action) {
			if (typeof Action === 'function' ){
				Action();
				return;
			} else if ( Action.length === 3 && 'GRW BOW RBW OGW BRY GOY OBY RGY'.indexOf(Action) >= 0 && ! isFlipping) {
				isFlipping = true;
        isVerticalFlip();
        getPanningParams();
				getRotatingParams();
        return;
			}	else if ( Action.length === 3 && 'GRW BOW RBW OGW BRY GOY OBY RGY'.indexOf(Action) >= 0 && isFlipping) {
				if (panCounter < panCounts || flipCounter < flipCounts ){
          rotateCube();
          return;
			  } else {
					if (verticallFlipP1) {
						//alert('done verticallFlipP1 ')
						console.log(activeCamera.position);
						p = activeCamera.position;

						flippedCamera.position.set(p.x, p.y, p.z);
						_this.isFliped = true;
						activeCamera = flippedCamera;
						flippedCorrection = -1;
						controls.setCamera(activeCamera, flippedCorrection);
						verticallFlipP1 = false;
						verticallFlipP2 = true;

						polarTarget = 115;
						controls.update();
						currentPolar = controls.getPolarAngle()* 180 / Math.PI;
						panDistance = polarTarget - currentPolar;
						panCounts = Math.abs(parseInt(panDistance / 2));
						panFactor = panDistance/panCounts * -1 ;
						console.log ('panDistance', panDistance);
						panCounter = 0;
						return;
					}
					if (verticallFlipP2) {
						 // alert('done verticallFlipP2 ')
							verticallFlipP2 = false
					}
			    flipCounter = 0;
			    panCounter = 0;
          isFlipping = false;
			    return;
        }
      }

			if (Action.substring(1,2) === '!')
				var direction=-1;
			else
				direction=1;

			var action=Action.substring(0,1);
			if (action == 'n') { //next state
				action=null;
				state=Q.dequeue();
				if (state!= -1){
						solve(state);
					}
				else
					{
					console.log ('finished', cube.toString());
					}
			}

			else if ('rlouwdyfgb'.indexOf(action)>=0) {
				isRotating=true;
				if (rotationCounter < 0.5 * Math.PI){
					cube.rotate(action, direction, rotationFactor);
					rotationCounter+=rotationFactor;
				} else {
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
	}

	function render()
	{
        activeCamera.lookAt( scene.position );
		renderer.render( scene, activeCamera );
	}

	function onMouseDown(event){
	//	console.log('mouseDown', event, cube.getIntersection(event.clientX, event.clientY, camera));
	}

	function onMouseUp(event){
		if (clickStateColor!=null){
			event.stopPropagation();
			var subCube=cube.getIntersection(event.clientX, event.clientY, camera);
			if (!subCube)
				return -1; //no face found

			if (subCube.object.colors.length === 1)
				return -2 // center clicked

			var colors=cube.getColors();
			var oldColor=subCube.face.color.getHex();
			if (oldColor == colors.n.color)
				return -3; // internal face clickd

			var color=colors[clickStateColor].color

			if (color==oldColor){
				if(subCube.object.matched)
					cube.markUnmatchedSubCube(subCube.object.index, subCube.point);

				setFaceColor(subCube,colors, colors['s'].color,color );
				return 	0
			}

			if (!clickStateIsReplaceOnly)
				setFaceColor(subCube,colors, color,oldColor );

			var isValid=cube.isCustomColorValid(subCube.object.index, subCube.point);
			if (!isValid.valid ){
				setTimeout(function(){setFaceColor(subCube,colors, oldColor, color );},300);
				return -4 // invalid
			}

			if (isValid.valid && isValid.missingColor){
				setFaceColor(isValid.silverFaces,colors, colors[isValid.missingColor].color , colors['s'].color,color );
				subCube.object.matched=true;
			}
			return 0; //success
		}
	}

	this.setLastColor=function(color){
		var faces=cube.getSilverFaces();
		var colors=cube.getColors();
		for (var i=0; i<faces.length; i++ ){
			setFaceColor(faces[i], colors, colors[color].color , colors['s'].color , false)
		}
	}

	var setFaceColor=function(subCube, colors, color, oldColor, notify){
		if (notify==undefined)
			notify=true;

		if (subCube.face == undefined){
            console.log("??")
			return;
		}
		subCube.face.color.setHex(color);
		if (subCube.faceIndex< 11 &&  subCube.object.geometry.faces[ subCube.faceIndex +1].normal.equals(subCube.face.normal) )
			 subCube.object.geometry.faces[ subCube.faceIndex +1].color.setHex( color );
		if (subCube.faceIndex> 0 && subCube.object.geometry.faces[ subCube.faceIndex -1].normal.equals(subCube.face.normal) )
			subCube.object.geometry.faces[ subCube.faceIndex -1].color.setHex( color );

		subCube.object.geometry.colorsNeedUpdate = true;
		var oldColorName=null;
		var newColorName=null

		Object.keys(colors).forEach(function(key) {
			if (oldColor == colors[key].color)
				oldColorName = colors[key].name;
			if (color == colors[key].color)
				newColorName =  colors[key].name
		});
		if (oldColorName && newColorName && notify)
			ngController.customColorWasSet(newColorName, oldColorName);
	}

	window.addEventListener( 'keydown', onKeyDown, false );
	window.addEventListener( 'keyup', onKeyUp, false );
	window.addEventListener( 'mousedown', onMouseDown, false );
	window.addEventListener( 'mouseup', onMouseUp, false );
	//http://mrdoob.github.io/three.js/examples/canvas_geometry_cube.html -- touch example
}
