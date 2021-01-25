(function(){
	"use strict";
	angular.module('rubiks-app',['ngSanitize']);
})();


(function(){
	"use strict";
			angular.module('rubiks-app').controller('rubiks-controller',function($scope, $timeout, $interval){
            var _this=this;
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                this.isMobile = true
            }

			this.editorMode=false;
            this.toggleEditMode = function(){
                $scope.$apply(function(){
                	_this.editorMode=!_this.editorMode;
                	localStorage.setItem('editorMode', _this.editorMode);
                   	_this.solution = states;
                });
			}

			this.solving=false;
			this.solveButton="Solve";
			this.scrumbling=false;
			this.scrumbleButton="Scrumble";
			this.isCustom=false;
			this.customButton="Custom";
			this.colorBlink=false;
			this.colorActive=[];
			this.solution=[];
			this.currentState=0;
			this.currentMove=0;
			this.colors={'r': 'red', 'b': 'blue','g':'green', 'o':'orange', 'w':'white','y': 'yellow' };



			var colors=['white', 'green', 'red', 'blue', 'orange', 'yellow']
			var colorCount=[];
			var colorActive=[];
			var rubiksView=new RubiksView(_this);

			this.start=function(){
				rubiksView.start();
				for (var i=0; i< colors.length; i++){
					colorCount[colors[i]]=8;
					colorActive[colors[i]]=false;
				}

				 _this.editorMode = localStorage.getItem('editorMode');
				 if( _this.editorMode === "true" ){
					_this.solution = states;

					_this.currentState = localStorage.getItem('currentState') ? localStorage.getItem('currentState'):0;
					_this.setEditorState()
				 }
				 else
				 	_this.editorMode = false;

			};

			this.getLeftColors=function(){
				var c=[];
				for (var i=0; i< colors.length; i++){
					for (var j=0; j< colorCount[colors[i]]; j++ )
						c.push(colors[i][0]);
				}
				return c;
			}

			this.spin=function(command, colorName){
				if (!_this.isCustom){
					rubiksView.spin(command);
					return;
				}
				else{
					if (_this.colorActive[colorName]){
						rubiksView.setClickStateColor(null);
						_this.colorActive[colorName]=false
					}
					else{
						for (var i=0; i< colors.length; i++)
							_this.colorActive[colors[i]]=false;

						_this.colorActive[colorName]=true;
  					rubiksView.setClickStateColor(command);
						if (colorCount[colorName]>0)
							rubiksView.setClickStateIsReplaceOnly(false);
						else
							rubiksView.setClickStateIsReplaceOnly(true);
					}
				}
			}

			this.customColorWasSet=function(newColorName, oldColorName ){
				$scope.$apply(function(){
					if (oldColorName != 'silver')
						colorCount[oldColorName]++;


					if (colorCount[newColorName] > 0 ){
						colorCount[newColorName]--;
						finishIfLast4pcs();
						finishIfLastColor();
					}
					if (colorCount[newColorName] == 0 )	{
						rubiksView.setClickStateIsReplaceOnly(true);
						_this.colorActive[newColorName]=false;
						$interval.cancel(colorBlinkTimeoutHandle);
					}

					else
						rubiksView.setClickStateIsReplaceOnly(false);
				})

			}

			this.updateColorCount=function(color, apply){
				colorCount[color]--;
			}

			var finishIfLast4pcs=function(){
				if(rubiksView.getCube().valid2pcsSubCubes.length <= 4)
					rubiksView.finish2PCS();
			}

			var finishIfLastColor=function(){
				var flag=0, colorIndex=null;
				for (var i=0; i<colors.length; i++){
					if (colorCount[colors[i]]!=0){
						flag++;
						colorIndex=i
					}
				}

				if (flag==1 && colorIndex){
					rubiksView.setLastColor(colors[colorIndex].charAt(0));
					colorCount[colors[colorIndex]]=0;
				}
			}

			this.setPrevEditorState = function () {
					if(_this.currentState > 0) {
						_this.currentState--;
					}
					this.setEditorState()
			}

			this.setNextEditorState = function () {
					if(_this.currentState < this.solution.length - 1) {
							_this.currentState++;
					}
					this.setEditorState()
			}

			this.setEditorState = function () {
			    var s = _this.solution[_this.currentState];
                rubiksView.setCubeState(s.initialState);
                rubiksView.setCameraPosition(s.cameraPosition);
                localStorage.setItem('currentState',_this.currentState)
			}

			this.scrumble=function(){
					this.solving = false;
					rubiksView.scrumble(_this.scrumbling);
				  _this.scrumbling=!_this.scrumbling;
				  _this.scrumbling? _this.scrumbleButton="Stop" : _this.scrumbleButton = "Scrumble";
					_this.solution = [];
					_this.currentState=0;
					_this.currentMove=0;
			}

			this.solve=function(){
					if (_this.scrumbling) {
							_this.scrumble();
					} else {
							this.solving = true;
							_this.solution = rubiksView.solve(0);
							if ( _this.solution && _this.solution.length > 0) {
									console.log( _this.solution);
									rubiksView.setCameraPosition(_this.solution[0]['cameraPosition'])
									_this.currentState=0;
									_this.currentMove=0;
							}
					}
			};

			var colorMovesMap = {
					//       R        B        O        G        W        Y
					'GRW': {'r':'R', 'b':'B', 'o':'L', 'g':'F', 'w':'U', 'y':'D'},
					'RBW': {'r':'F', 'b':'R', 'o':'B', 'g':'L', 'w':'U', 'y':'D'},
					'BOW': {'r':'L', 'b':'F', 'o':'R', 'g':'B', 'w':'U', 'y':'D'},
					'OGW': {'r':'B', 'b':'L', 'o':'F', 'g':'R', 'w':'U', 'y':'D'},

					'GOY': {'r':'L', 'b':'B', 'o':'R', 'g':'F', 'w':'D', 'y':'U'},
					'OBY': {'r':'B', 'b':'R', 'o':'F', 'g':'L', 'w':'D', 'y':'U'},
					'BRY': {'r':'R', 'b':'F', 'o':'L', 'g':'B', 'w':'D', 'y':'U'},
					'RGY': {'r':'F', 'b':'L', 'o':'B', 'g':'R', 'w':'D', 'y':'U'}
			};

			this.getMove = function(m, orientation) {
				var move = colorMovesMap[orientation][m.substr(0,1)];
				if (m.length > 1)
					move += 'i';
				return move; //m.toUpperCase().replace('!', '\'')
			}

			this.getClass = function(m, i) {
				var moveClass = this.colors[m[0]];
				if (i === this.currentMove ) {
                    moveClass += ' ' + 'active'
				}
				return moveClass;
			};

			this.runToEnd = function() {
                if (_this.currentState < _this.solution.length && !_this.nextStateInProgress ){
                	_this.nextState();
                    rubiksView.spin( (function(__this){return function(){
                      __this.runToEnd();
                    }
                    })(_this)) ;
				}
				else(
					console.log('done')
				)
			}

			this.nextState = function() {
					if (this.currentState < this.solution.length && !this.nextStateInProgress ){
                    if (this.currentMove < this.solution[this.currentState]['moves'].length) {
                        this.nextStateInProgress = true;
                		var offset=0;
                        for (var i=this.currentMove ; i<  this.solution[this.currentState]['moves'].length; i++) {
                        	_this.nextMove(offset);
													offset++;
												}
                        rubiksView.spin( (function(__this, __scope){return function(){
                            __scope.$apply( function(){
                                __this.nextStateInProgress = false;
                            })
                        }
                        })(_this,$scope)) ;
                    }
                    else {
                        this.currentState++;
                        this.currentMove = 0;
					}
                }
			};

			this.nextMove = function(offset) {
					if (this.currentMove < this.solution[this.currentState]['moves'].length) {
							rubiksView.spin(this.solution[this.currentState]['moves'][this.currentMove+offset]);
							rubiksView.spin( (function(__this, __scope){return function(){
									__scope.$apply( function(){
									__this.currentMove++;
									if ( __this.currentMove === __this.solution[__this.currentState]['moves'].length
										   && !__this.nextStatePreviewInProgress
											 && __this.currentState < __this.solution.length - 1
									) {
												__this.currentState++;
												__this.currentMove = 0;
												rubiksView.spin(__this.solution[__this.currentState]['cameraPosition']);
									}
								})
							}
							})(_this,$scope)) ;
					} else {
							rubiksView.spin( (function(__this, __scope){return function(){
									__scope.$apply( function(){
											__this.currentMove++;
											if ( __this.currentMove === __this.solution[__this.currentState]['moves'].length) {
													__this.currentState++;
													__this.currentMove = 0;
											}
									})
							}
							})(_this,$scope)) ;
					}
			};

			this.backOneMove = function() {
					if (this.currentMove > 0) {
							this.currentMove--;
							rubiksView.spin(reverseMove(this.solution[this.currentState]['moves'][this.currentMove]));
							if (this.currentMove === 0 && this.currentState > 0) {
									this.currentState--;
									this.currentMove = this.solution[this.currentState]['moves'].length;
							}
					}
					else if (this.currentState > 0 ) {
							this.currentState--;
							this.currentMove = this.solution[this.currentState]['moves'].length - 1;
							rubiksView.spin(reverseMove(this.solution[this.currentState]['moves'][this.currentMove]));
					}

			};

			this.statePreview = function() {
					if (!this.nextStateInProgress && !this.nextStatePreviewInProgress ) {
							this.nextStatePreviewInProgress = true;
							var cube = rubiksView.getCube().toString();
							var state = this.currentState;
							var move = this.currentMove;
							var previewCube = this.solution[this.currentState]['initialState'];
							rubiksView.setCubeState(previewCube);
							this.nextState();
							rubiksView.spin( (function(__this, __scope, __cube, __state, __move){return function(){
								 // __scope.$apply(function(){ __this.currentState--} );
									$timeout( function(){
											rubiksView.setCubeState(__cube);
											__this.currentState = __state;
											__this.currentMove = __move;
											__this.nextStatePreviewInProgress = false;
									},1000)
							}
							})(_this,$scope,cube, state, move )) ;
					}
			};


			function reverseMove(move) {
					if (move.length === 1 )
						return move + '!'
			else
					return move[0];
			}

			this.setCustom=function(){
					this.solving = false;
					this.solution=[];
					this.currentState=0;
					this.currentMove=0;
					var custom=_this.isCustom;
					_this.isCustom=!_this.isCustom;
					if (!custom){
						rubiksView.setCustom();
						for (var i=0; i< colors.length; i++)
							colorCount[colors[i]]=8;
						_this.customButton="Reset"
					}
					else{
						rubiksView.reset();
						_this.customButton="Custom";
					}
			}

			this.getCount=function(color){
					if(! _this.isCustom )
							return "&#9658;";
					else
							return colorCount[color];
			}
		})
	}
)();
