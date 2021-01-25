function RubiksCube(scene, N){
	var _this=this
	var debug=false;

	var cube=[];

	var UNITSIZE=18;
	var SPACE=1;
	var OFFSET=(UNITSIZE*4+SPACE*2)/2;

	var RED =0xf61d50;
	var ORANGE = 0xfa741a;
	var WHITE = 0xeceadc;
	var YELLOW =  0xf5e126;
	var GREEN=  0x38c53f;
	var BLUE=  0x2983d8;

	var NONE=0x333333;  // for inner size of cube
	var SILVER=0xaaaaaa; // for states testing

	var colors={
			'r': {color:RED, name: 'red'  },
			'o': {color: ORANGE, name: 'orange'},
			'l': {color: ORANGE, name: 'orange'},
			'w': {color:WHITE, name: 'white'},
			'u': {color:WHITE, name: 'white'},
			'y': {color:YELLOW, name: 'yellow'},
			'd': {color:YELLOW, name: 'yellow'},
			'g': {color:GREEN, name: 'green'},
			'f': {color:GREEN, name: 'green'},
			'b': {color:BLUE, name: 'blue'},
			's': {color:SILVER, name: 'silver'},
			'n': {color:NONE, name: 'none'},
			};


	var valid3pcsSubCubes;
	var valid2pcsSubCubes;

	this.resetCustomMode=function(){
		 valid3pcsSubCubes=[
		   	               	'wrg','wgo','wob','wbr',
		   	               	'ryg','byr','ybo','gyo',
		   	               ];

		 valid2pcsSubCubes=[ 'wr','wg','wb','wo',
		   	                 'yr','yg','yb','yo',
		   	                 'go','ob','br','rg',
		   	               ]

		this.valid3pcsSubCubes = valid3pcsSubCubes;
		this.valid2pcsSubCubes = valid2pcsSubCubes;
	}

	this.getColors=function(){
		return colors;
	}

	this.resetTestMode=function(){
	 valid3pcsSubCubes=[];
	 valid2pcsSubCubes=['gr','oy', 'yb','go' ];
			 _this.valid2pcsSubCubes = valid2pcsSubCubes;
	}

	var rightFace= [8, 7, 6, 15, 24, 25, 26, 17, 16];
	var leftFace=[20,19,18,9,0,1,2,11,10];
	var frontFace=[26, 25, 24, 21, 18, 19, 20, 23, 22];
	var backFace=[2,1,0,3,6,7,8,5,4];
	var bottomFace =[24,15,6,3,0,9,18,21,12];
	var topFace=[8, 17, 26, 23, 20, 11, 2, 5 ,14];
	var coronalFace=[9, 10, 11, 12, 13, 14, 15, 16, 17];
	var sagittalFace=[5, 4, 3, 12, 21, 22, 23, 14, 13];
	var transverseFace=[1,4,7,10,13,16,19,22,25];

	var faces=[rightFace,frontFace,leftFace,backFace,topFace,bottomFace];

	var valid3pcsFaces={
			'000': [bottomFace,backFace,leftFace],
			'200': [backFace,bottomFace,rightFace],
			'202': [rightFace, bottomFace,frontFace],
			'002': [frontFace,bottomFace,leftFace],
			'020': [topFace,leftFace,backFace],
			'220': [topFace,backFace,rightFace],
			'222': [topFace,rightFace,frontFace],
			'022': [topFace,frontFace,leftFace],
	}

	var rotationMatrix={
			// order = right front left back up down, sagittal
			rightClockWise:          {m:[null,         [0,4,1,3,2,2],null,        [4,0,5,7,6,6],[0,6,1,5,2,4],[0,2,1,1,2,0],null ], targetFace:rightFace, isCounterClockwise: false},
			rightCounterClockWise:   {m:[null,         [0,0,1,7,2,6],null,        [4,4,5,3,6,2],[0,2,1,1,2,0],[0,6,1,5,2,4],null ],  targetFace:rightFace, isCounterClockwise: true} ,
			leftClockWise:           {m:[null,         [4,0,5,7,6,6],null,        [0,4,1,3,2,2],[4,6,5,5,6,4],[4,2,5,1,6,0],null ],  targetFace:leftFace, isCounterClockwise: false} ,
			leftCounterClockWise:    {m:[null,		   [4,4,5,3,6,2],null,        [0,0,1,7,2,6],[4,2,5,1,6,0],[4,6,5,5,6,4],null ],  targetFace:leftFace, isCounterClockwise: true} ,
		  sagittalClockWise:       {m:[null,         [7,4,8,3,3,2],null,        [7,6,8,7,3,0],[7,6,8,5,3,4],[7,2,8,1,3,0],null ], targetFace: sagittalFace, isCounterClockwise: false},
		  sagittalCounterClockWise:{m:[null,         [0,0,1,7,2,6],null,        [4,4,5,3,6,2],[0,2,1,1,2,0],[0,6,1,5,2,4],null ],  targetFace:sagittalFace, isCounterClockwise: true} ,
      frontClockWise:          {m:[[6,6,5,7,4,0],null,         [0,4,1,3,2,2],null,        [2,6,3,5,4,4],[0,0,7,1,6,2],[6,5,4,1,5,8] ], targetFace:frontFace, isCounterClockwise: false},
			frontCounterClockWise:   {m:[[6,2,5,3,4,4],null,         [0,0,1,7,2,6],null,        [2,2,3,1,4,0],[0,4,7,5,6,6],[6,1,4,5,5,8] ],  targetFace:frontFace, isCounterClockwise: true} ,
			backClockWise:           {m:[[0,4,1,3,2,2],null,         [6,6,5,7,4,0],null,        [0,4,7,5,6,6],[2,2,3,1,4,0],[0,5,1,8,2,1] ],  targetFace:backFace, isCounterClockwise: false} ,
			backCounterClockWise:    {m:[[0,0,1,7,2,6],null,         [6,2,5,3,4,4],null,        [0,0,7,1,6,2],[2,6,3,5,4,4],[0,1,1,8,2,5] ],  targetFace:backFace, isCounterClockwise: true} ,
			topClockWise:            {m:[[0,6,7,7,6,0],[0,0,7,1,6,2],[0,2,7,3,6,4],[0,4,7,5,6,6],null,        null,         [6,1,0,5,7,8] ],  targetFace:topFace, isCounterClockwise: false} ,
			topCounterClockWise:     {m:[[0,2,7,3,6,4],[0,4,7,5,6,6],[0,6,7,7,6,0],[0,0,7,1,6,2],null,        null,         [6,5,0,1,7,8] ],  targetFace:topFace, isCounterClockwise: true} ,
			bottomClockWise:         {m:[[4,6,3,7,2,0],[4,4,3,5,2,6],[2,4,3,3,4,2],[2,2,3,1,4,0],null,        null,         [2,1,3,8,4,5] ],  targetFace:bottomFace, isCounterClockwise: false} ,
			bottomCounterClockWise:  {m:[[4,2,3,3,2,4],[4,0,3,1,2,2],[2,0,3,7,4,6],[2,6,3,5,4,4],null,        null,         [2,5,3,8,4,1] ],  targetFace:bottomFace, isCounterClockwise: true} ,
	};

	var actionToRotation={
			'r':{'cw':rotationMatrix.rightClockWise, 'ccw':rotationMatrix.rightCounterClockWise },
			'l':{'cw':rotationMatrix.leftClockWise, 'ccw':rotationMatrix.leftCounterClockWise },
			'o':{'cw':rotationMatrix.leftClockWise, 'ccw':rotationMatrix.leftCounterClockWise },
			'f':{'cw':rotationMatrix.frontClockWise, 'ccw':rotationMatrix.frontCounterClockWise },
			'g':{'cw':rotationMatrix.frontClockWise, 'ccw':rotationMatrix.frontCounterClockWise },
			'b':{'cw':rotationMatrix.backClockWise, 'ccw':rotationMatrix.backCounterClockWise },
			'u':{'cw':rotationMatrix.topClockWise, 'ccw':rotationMatrix.topCounterClockWise },
			'w':{'cw':rotationMatrix.topClockWise, 'ccw':rotationMatrix.topCounterClockWise },
			'd':{'cw':rotationMatrix.bottomClockWise, 'ccw':rotationMatrix.bottomCounterClockWise },
			'y':{'cw':rotationMatrix.bottomClockWise, 'ccw':rotationMatrix.bottomCounterClockWise },
			'c':{'cw':rotationMatrix.coronalClockWise, 'ccw':rotationMatrix.coronalCounterClockWise },
			's':{'cw':rotationMatrix.sagittalClockWise, 'ccw':rotationMatrix.sagittalCounterClockWise },
	};

	var cubeInitialParams=[
		  {face:backFace, coloredFaces:[10, 11],axis:'Z',offset:UNITSIZE - OFFSET, color: BLUE , colorName: "blue", },
		  {face:coronalFace, coloredFaces:null,axis:'Z',offset:UNITSIZE*2+SPACE - OFFSET, color: null , colorName: null, },
		  {face:frontFace, coloredFaces:[8, 9],axis:'Z',offset:UNITSIZE*3+2*SPACE - OFFSET, color: GREEN , colorName: "green", },
		  {face:leftFace, coloredFaces:[2, 3],axis:'X',offset:UNITSIZE - OFFSET, color: ORANGE , colorName: "orange", },
		  {face:sagittalFace, coloredFaces:null,axis:'X',offset:UNITSIZE*2+SPACE - OFFSET, color: null , colorName: null, },
		  {face:rightFace, coloredFaces:[0,1],axis:'X',offset:UNITSIZE*3+2*SPACE - OFFSET, color: RED , colorName: "red", },
		  {face:bottomFace, coloredFaces:[6,7],axis:'Y',offset:UNITSIZE -OFFSET, color: YELLOW, colorName: "yellow", },
		  {face:transverseFace, coloredFaces:null,axis:'Y',offset:UNITSIZE*2+SPACE -OFFSET, color: null , colorName: null,  },
		  {face:topFace, coloredFaces:[4,5],axis:'Y',offset:UNITSIZE*3+2*SPACE -OFFSET, color: WHITE , colorName: "white", }
		 ];

	var setSubCubesPosition=function(){
		for(var o=0; o< cubeInitialParams.length ; o++){
			var obj=cubeInitialParams[o];
			var axis=obj.axis;

			for (var i=0; i<N*N; i++){
		    	if (axis=='Z'){
		    		for (var c=0; c<12; c++ )
						cube[obj.face[i]].geometry.faces[ c ].color.setHex( NONE );
		    		cube[obj.face[i]].position.setZ(obj.offset);
		    	}
		    	else if (axis=='X')
		    		cube[obj.face[i]].position.setX(obj.offset);
		    	else
		    		cube[obj.face[i]].position.setY(obj.offset);

		    	if (obj.coloredFaces){
		    		cube[obj.face[i]].geometry.faces[obj.coloredFaces[0]].color.setHex( obj.color );
					cube[obj.face[i]].geometry.faces[obj.coloredFaces[1]].color.setHex( obj.color );
					cube[obj.face[i]].colors.push(obj.colorName);

				 	cube[obj.face[i]].coloredFaces=[obj.coloredFaces[0],obj.coloredFaces[1]];
		    	}
			};
		};
	};


	this.initCube=function(scene,N){
		var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors,} );
		var BoxGeometry;

		for (var i=0; i< N*N*N ; i++){
			BoxGeometry = new THREE.BoxGeometry( UNITSIZE, UNITSIZE, UNITSIZE, 1, 1, 1);
			cube[i] = new THREE.Mesh( BoxGeometry, cubeMaterial );
			cube[i].colors=[];
			cube[i].index=i;
			scene.add(cube[i]);
		};
		setSubCubesPosition();
    };

    this.initCube(scene, N);

    var rotateFaceArray=function(face, reverse){
    	 var last=face.pop();
    	  if(reverse)
      		  face.push(face.shift());
     	  else
    		  face.unshift(face.pop());
     	  face.push(last);

    	  return face;
    };

		var rotateTargetFace=function( RM ){ // RM stands for Rotation Matrix
			if (debug)
				console.log("right: ", rightFace, "left: ", leftFace, "front: ", frontFace, "back: ", backFace,"top: ", topFace,"bottom: ", bottomFace);

			for(var i=0; i<6; i++){
				var face=faces[i];
				if (RM.m[i]){
					face[RM.m[i][0]]=RM.targetFace[RM.m[i][1]];
					face[RM.m[i][2]]=RM.targetFace[RM.m[i][3]];
					face[RM.m[i][4]]=RM.targetFace[RM.m[i][5]];
				}
			}

			for (var i=0; i<2; i++)
				 rotateFaceArray(RM.targetFace, RM.isCounterClockwise);

			if (debug)
				console.log("right: ", rightFace, "left: ", leftFace, "front: ", frontFace, "back: ", backFace,"top: ", topFace,"bottom: ", bottomFace);
		};

    this.rotateFace=function(action,direction){
     	if (direction == 1)
    		direction='cw';
    	else if ( (direction == -1))
    		direction='ccw';

    	rotateTargetFace(actionToRotation[action][direction]);
   	};

   	this.setCubeState=function(state) {
			var x=0;
			var color;

			for (var i=0; i<6; i++ ){
				for (var j=0; j<9; j++ ){
					if ( state.indexOf('[^y]')>=0)
						state=state.replace(('[^y]'),'.');

					if ( state.indexOf('[^g]')>=0)
						state=state.replace(('[^g]'),'.');

					if ( state.indexOf('[^o]')>=0)
						state=state.replace(('[^o]'),'.');

					if ( state.indexOf('[^r]')>=0)
						state=state.replace(('[^r]'),'.');

					if ( state.indexOf('[^b]')>=0)
						state=state.replace(('[^b]'),'.');

					var stateColor = state.charAt(x);
					if (stateColor=='.'  )
						color=SILVER;
					else {
						color=colors[stateColor].color;

					}

					if (j!=8){
						var faceObj=getFaceColor(cube[faces[i][j]],faces[i], 'face' ); //face flag tells it to return a face
						if (faceObj.faceIndex< 11 &&  faceObj.object.geometry.faces[ faceObj.faceIndex +1].normal.equals(faceObj.face.normal) )
							faceObj.object.geometry.faces[ faceObj.faceIndex +1].color.setHex( color );
						if (faceObj.faceIndex> 0 && faceObj.object.geometry.faces[ faceObj.faceIndex -1].normal.equals(faceObj.face.normal) )
							faceObj.object.geometry.faces[ faceObj.faceIndex -1].color.setHex( color );
						faceObj.face.color.setHex( color );
						faceObj.object.geometry.colorsNeedUpdate = true;
					}
					x++;
				}
			}
		};

		var drawLine =function (x, y, z, a, b, c, color){
			var lineGeometry = new THREE.Geometry();
			var vertArray = lineGeometry.vertices;
			vertArray.push( new THREE.Vector3(x,y, z), new THREE.Vector3( a, b, c) );
			lineGeometry.computeLineDistances();
			var lineMaterial = new THREE.LineBasicMaterial( { color:color} );
			var line = new THREE.Line( lineGeometry, lineMaterial );
			scene.add(line);

		};

		var getFaceColor=function(cube,face, flag ){
			var list=[];
			list.push(cube);
			var x,y,z,d;

			if (face== bottomFace ){
				x=cube.position.x- (UNITSIZE/3 );
				y= -(2*UNITSIZE+2*SPACE);
				z=cube.position.z+ (UNITSIZE/3);
				d= new THREE.Vector3(0, 1 , 0 );

				if (debug)
					drawLine(x, y, z, x, -y, z, WHITE);
			} else if( face == topFace) {
				x=cube.position.x - (UNITSIZE/3);
				y= (2*UNITSIZE+2*SPACE);
				z=cube.position.z - (UNITSIZE/3);
				d= new THREE.Vector3(0, -1 , 0 );

				if (debug)
					drawLine(x, y, z, x, -y, z, YELLOW);
			} else if( face == rightFace) {
				x= (2*UNITSIZE+2*SPACE);
				y= cube.position.y + (UNITSIZE/3);
				z= cube.position.z + (UNITSIZE/3);
				d= new THREE.Vector3(-1, 0 , 0 );
				if (debug)
					drawLine(x, y, z, -x, y, z, ORANGE);
			} else if( face == leftFace) {
				x= -(2*UNITSIZE+2*SPACE);
				y= cube.position.y + (UNITSIZE/3);
				z= cube.position.z - (UNITSIZE/3);
				d= new THREE.Vector3(1, 0 , 0 );
				if (debug)
					drawLine(x, y, z, -x, y, z, RED);

			} else if( face == frontFace){
				x= cube.position.x -(UNITSIZE/3);
				y= cube.position.y +(UNITSIZE/3);
				z= (2*UNITSIZE+2*SPACE);
				d= new THREE.Vector3(0, 0 ,-1 );

				if (debug)
					drawLine(x, y, z, x, y, -z, BLUE);


			}	else if( face == backFace){
				x= cube.position.x +(UNITSIZE/3);
				y= cube.position.y -(UNITSIZE/3) ;
				z= -(2*UNITSIZE+2*SPACE);
				d= new THREE.Vector3(0, 0 ,1 );

				if (debug)
				drawLine(x, y, z, x, y, -z, GREEN);
			}

			var v1 = new THREE.Vector3(x, y , z  );
			var ray = new THREE.Raycaster(v1,  d );
	    var intersects = ray.intersectObjects( list );
			if ( intersects.length > 0 ) {
				if (flag=='face')
					return  intersects[ 0 ] ;

				var color=intersects[ 0 ].face.color.getHex();
				switch(color){
					case RED:
						return 'r';
						break;
					case ORANGE:
						return 'o';
						break;
					case WHITE:
						return 'w';
						break;
					case YELLOW:
						return 'y';
						break;
					case GREEN:
						return 'g';
						break;
					case BLUE:
						return 'b';
						break;
						default:
						return '.';
				}
			}
			return '.';
	};

	this.toString=function(test){
		if (!test)
			test=null;
		var string="";
		for (var i=0; i<6 ; i++){
			for (var j=0; j<N*N; j++){
				string+= getFaceColor(cube[faces[i][j]], faces[i], test);
			}
		}
		return string;
	};

	var silverFaces=[]; // this will hold the last silver face for letter assignment

	this.getSilverFaces=function(){
		silverFaces=[];
		for (var i=0; i<6; i++){
			for (var j=0; j<N*N; j++){
				if(getFaceColor(cube[faces[i][j]], faces[i], null)=='.')
					silverFaces.push(getFaceColor(cube[faces[i][j]], faces[i], 'face'))
			}
		}
		return silverFaces;
	}

	this.getSubCubeColors=function(index, point){
		silverFaces=[];
		var loopFaces=faces
		var subCubeCoordinate=this.getSubCubeCoordinate(point)
		if (valid3pcsFaces[subCubeCoordinate])
			loopFaces=valid3pcsFaces[subCubeCoordinate];

		var subCubeColors="";
		var silverCount=0;
		for (var i=0; i<loopFaces.length; i++){
			for (var j=0; j<N*N; j++){
				if (cube[loopFaces[i][j]].index==index){
					var color=getFaceColor(cube[loopFaces[i][j]], loopFaces[i], null);
					if (color=='.'){
						//color='s';
						silverCount++;
						silverFaces.push(getFaceColor(cube[loopFaces[i][j]], loopFaces[i], 'face'));
					}
					subCubeColors += color;
				}
			}
		}
		subCubeColors += silverCount;
		return subCubeColors;
	}

	this.markUnmatchedSubCube=function(index,point){
		var subCubeColors=this.getSubCubeColors(index, point)
		if (subCubeColors.length==4){
			valid3pcsSubCubes.push(subCubeColors.substr(0,3));
			cube[index].matched=false;
		}else if( subCubeColors.length==3){
			valid2pcsSubCubes.push(subCubeColors.substr(0,2));
			cube[index].matched=false;
		}
	}

	this.isCustomColorValid=function(index, point){
		var subCubeColors=this.getSubCubeColors(index, point)
		var silverCount=subCubeColors.charAt(subCubeColors.length - 1);
		subCubeColors=subCubeColors.substr(0,subCubeColors.length - 1);

		if (subCubeColors.length==3){
			if (silverCount >= 2)
				return {'valid':true};

			var match=match3pcsSubCubes(subCubeColors)
			console.log(match,subCubeColors );
			if(match){
				if (silverCount==1){
					var index=subCubeColors.indexOf('.');
					var missingColor=match.charAt(index);
					if (missingColor)
						return {'valid':true, 'missingColor':missingColor,'silverFaces':silverFaces[0] };
				}
				else if(silverCount==0){
					cube[index].matched=true;
				}
				return {'valid':true};
			}
			return {'valid':false};


		}
		if (subCubeColors.length==2){
			if (silverCount==1){

				var missingColor=tryMatch2pcsMissingColor(subCubeColors)
				if (missingColor){
					cube[index].matched=true;
					return {'valid': true,'missingColor':missingColor, 'silverFaces':silverFaces[0] }
				}
				else
					return {'valid':true};
			}
			else if( this.match2pcsSubCubes(subCubeColors)){
				cube[index].matched=true;
				return  {'valid':true}
			}
		}
		return  {'valid':false}
	}

	function match3pcsSubCubes(colors){
		var pattern=new RegExp(colors);
		var match,matchIndex;
		for( var i=0; i< valid3pcsSubCubes.length; i++){
			var valid=valid3pcsSubCubes[i];
			for (var j=0; j<3; j++){
				valid = valid.substr(1,2)+ valid.substr(0,1);
				if (pattern.test(valid)){
					match=valid;
					matchIndex=i;
					break;
				}
			}
			if (match)
				break;
		}
		if (matchIndex!=undefined){
			valid3pcsSubCubes.splice(matchIndex,1);
		}
		return match;
	}

	function tryMatch2pcsMissingColor(colors){
		var pattern=new RegExp(colors);
		var matchIndex, countMatches=0,lastValid, lastValidRotated;
		for( var i=0; i< valid2pcsSubCubes.length; i++){
			var valid=valid2pcsSubCubes[i];
			var validRotated=valid.substr(1,1) + valid.substr(0,1)
			if (pattern.test(valid) || pattern.test(validRotated)){
				countMatches++;
				matchIndex=i;
				lastValid=copyString(valid);
				lastValidRotated=copyString(validRotated);
			}
		}
		if (countMatches===1){
			var silverIndex=colors.indexOf('.')
			var missingColor=null;
			if (pattern.test(lastValidRotated))
				missingColor=lastValidRotated.charAt(silverIndex);
			else
				missingColor=lastValid.charAt(silverIndex);
			valid2pcsSubCubes.splice(matchIndex,1);
			return missingColor;
		}
		return false;
	}

	function copyString(str){
		var newStr='';
		for (var i=0; i<str.length; i++)
			newStr+=str.charAt(i);
		return newStr;
	}

	this.match2pcsSubCubes = function(colors, test){
		for( var i=0; i< valid2pcsSubCubes.length; i++){
			var valid=valid2pcsSubCubes[i];
			var validRotated=valid.substr(1,1) + valid.substr(0,1)
			if (colors == valid  || colors==validRotated  ){
				if (!test)
					valid2pcsSubCubes.splice(i,1);
				return true;
			}
		}
		return false;
	}

	this.getSubCubeCoordinate=function(point){
		// range map formula vrom [A:B] to [C:D]: Y = (((X - B) * (A - B)) / (D - C)) + C
		var A=0-(3*UNITSIZE+2*SPACE)/2
		var B=0-A;
		var C=0.05;
		var D=2.95;
		var X=Math.floor((point.x-A)/(B-A)*(D-C) +C);
		var Y=Math.floor((point.y-A)/(B-A)*(D-C) +C);
		var Z=Math.floor((point.z-A)/(B-A)*(D-C) +C);
		return X+''+Y+''+Z;
	}

	this.flipCube = function() {
		matrix = new THREE.Matrix4().makeRotationX( Math.PI );
		for (var i=0; i<27; i++)
				cube[i].applyMatrix(matrix);

		this.rotateFace('l', -1);
		this.rotateFace('l', -1);
		this.rotateFace('r', 1);
		this.rotateFace('r', 1);
    this.rotateFace('s', 1);
    this.rotateFace('s', 1);
	}

  this.rotate=function(action, direction, rotationFactor){
   	var face=null;
		switch (action){
		case 'r':
			direction=direction*(-1);
			face=rightFace;
			break;
		case 'l':
		case 'o':
			face=leftFace;
			break;
		case 'u':
		case 'w':
			face=topFace;
			direction=direction*(-1);
			break;
		case 'd':
		case 'y':
			face=bottomFace;
			break;
		case 'f':
		case 'g':
			direction=direction*(-1);
			face=frontFace;
			break;
		case 'b':
			face=backFace;

		}

		if (action=='r' || action=='l' || action=='o')
		  	matrix = new THREE.Matrix4().makeRotationX( direction * rotationFactor );
		else if ((action=='u' || action=='d' || action=='w' || action=='y'))
			 matrix = new THREE.Matrix4().makeRotationY( direction * rotationFactor );
		else
			 matrix = new THREE.Matrix4().makeRotationZ( direction * rotationFactor );

		for (var i=0; i<9; i++)
			cube[face[i]].applyMatrix(matrix);
    };

	this.getIntersection=function(x,y, camera) {
    	var mouse = { x: 0, y: 0 };
    	mouse.x = (x/ window.innerWidth)*2-1;
    	mouse.y =-(y/ window.innerHeight)*2+1;

    	// find intersections
    	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
  	 	var projector = vector.unproject(camera);
    	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

     	var intersects = ray.intersectObjects( cube );

    	// if there is one (or more) intersections
    	if ( intersects.length > 0 )
    	{
    		return intersects[ 0 ];
     	}
    	return null;
    }
}
