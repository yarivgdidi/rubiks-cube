function Solver(){

    //000000000011111111112222222222333333333344444444445555
    //012345678901234567890123456789012345678901234567890123
    //rrrrrrrrrgggrgggggooooooooobbbbbbbbbwwwwwwwwwyyyyyyyyy'

    var _this=this;
    var red, green, orange, blue, white, yellow;
    var solution = [];
    this.counter = 0;

    this.set=function(cube) {
        _this.cube = cube ;
        _this.resetEdges();
    };

    this.resetCounter = function() {
        this.counter = 0;
    }

    this.setStates = function(states) {
        this.states = states;
    }

    this.solve=function(state){
        this.counter++;
        var selectedStates=[];
        var cube = _this.cube;
        if (state == 0) {
            solution = []
        }
        for (var i=0; i < states.length; i++){
            if ( states[i].state != state)
                continue;

            var pattern=new RegExp(states[i].initialState);
            if (pattern.test(cube))
                selectedStates.push(states[i]);

        }

        var selected = 0;
        if (selectedStates.length < 1){
            console.log ("state:",  "pattern not found", cube.toString());
            return false;
        }
        else if (selectedStates.length > 1) {
            console.log ("more then one patern was found",selectedStates , cube.toString() );
            var minMoves=Number.MAX_VALUE;
            for (var j=0; j<selectedStates.length; j++ ){
                if (selectedStates[j].moves.length < minMoves){
                    selected = j
                    minMoves = selectedStates[j].moves.length
                }
            }
        }
        if(selectedStates[selected].moves.length > 0)
            solution.push(selectedStates[selected]);

        var moves = selectedStates[selected].moves;
        var next = selectedStates[selected].next;
        for (i = 0 ; i< moves.length; i++) {
            rotateFunction = '_this.' + moves[i].replace('!', '_') + '()';
            eval(rotateFunction);
        }
        if (next === -1){
            console.log(_this.counter);
            return solution; // finished solving
        }
        else if (this.counter > 100) {
            console.log("invalid cube - no solution", this.counter);
            return false;
        }

        else
            return _this.solve( next );
    };

    this.resetEdges = function() {
        red = _this.cube.slice(0, 8);
        green = _this.cube.slice(9, 17);
        orange = _this.cube.slice(18, 26);
        blue = _this.cube.slice(27,35);
        white = _this.cube.slice(36,44);
        yellow = _this.cube.slice(45, 53);
    };

    this.get = function() {
        return this.cube;
    };

    this.r = function() {
        var newRed = red[6] + red[7] + red.slice(0,6) + 'r' ;
        var newGreen = yellow[0] + yellow[1] + yellow[2] + green.slice(3,8)  + 'g';
        var newWhite = green[0] +  green[1] +  green[2] + white.slice(3,8) + 'w';
        var newBlue = blue.slice(0,4) + white[0] + white[1] + white[2] + blue[7] + 'b';
        var newYellow = blue[4] + blue[5] + blue[6] + yellow.slice(3,8) + 'y'
        _this.cube = newRed + newGreen+ orange + 'o' + newBlue + newWhite + newYellow;
        _this.resetEdges();

    };

    this.r_ = function() {
        var newRed = red.slice(2,8) +  red[0] + red[1]  + 'r' ;
        var newGreen =  white.slice(0,3) + green.slice(3,8) + 'g';
        var newWhite =  blue.slice(4,7) + white.slice(3,8) + 'w';
        var newBlue = blue.slice(0,4) + yellow.slice(0,3)  + blue[7] + 'b';
        var newYellow = green.slice(0,3) + yellow.slice(3,8) + 'y';
        _this.cube = newRed + newGreen+ orange + 'o' + newBlue + newWhite + newYellow;
        _this.resetEdges();

    };

    this.g = function() {
        var newRed = red.slice(0,4) + white.slice(2,5) + red[7] + 'r' ;
        var newGreen =  green[6] + green[7] + green.slice(0,6) + 'g' ;
        var newOrange = yellow[6] + yellow[7] + yellow[0] + orange.slice(3,8) + 'o';
        var newWhite = white.slice(0,2) + orange.slice(0,3) + white.slice(5,8) + 'w';
        var newYellow = red[6] + yellow.slice(1,6) + red[4] + red[5] + 'y';
        _this.cube = newRed + newGreen+ newOrange + blue + 'b' + newWhite + newYellow;
        _this.resetEdges();
    };

    this.g_ = function() {
        var newRed = red.slice(0,4) + yellow.slice(6,8) + yellow[0] + red[7] + 'r' ;
        var newGreen = green.slice(2,8) +  green[0] + green[1] +  'g' ;
        var newOrange = white.slice(2,5) + orange.slice(3,8) + 'o';
        var newWhite = white.slice(0,2) + red.slice(4,7) + white.slice(5,8) + 'w';
        var newYellow = orange[2] + yellow.slice(1,6) + orange.slice(0,2) + 'y';
        _this.cube = newRed + newGreen+ newOrange + blue + 'b' + newWhite + newYellow;
        _this.resetEdges();
    };


    this.o = function() {
        var newGreen= green.slice(0,4) + white.slice(4,7) + green[7] + 'g';
        var newOrange = orange[6] + orange[7] + orange.slice(0,6) + 'o' ;
        var newWhite = white.slice(0,4) + blue.slice(0,3) + white[7] + 'w';
        var newBlue = yellow.slice(4,7) + blue.slice(3,8) + 'b';
        var newYellow = yellow.slice(0,4) + green.slice(4,7) + yellow[7] + 'y';

        _this.cube = red + 'r' + newGreen+ newOrange + newBlue  + newWhite + newYellow;
        _this.resetEdges();

    };

    this.o_ = function() {
        var newGreen= green.slice(0,4) + yellow.slice(4,7) + green[7] + 'g';
        var newOrange = orange.slice(2,8) +  orange[0] + orange[1]  + 'o' ;
        var newWhite = white.slice(0,4) + green.slice(4,7) + white[7] + 'w';
        var newBlue = white.slice(4,7) + blue.slice(3,8) + 'b';
        var newYellow = yellow.slice(0,4) + blue.slice(0,3) + yellow[7] + 'y';

        _this.cube = red + 'r' + newGreen+ newOrange + newBlue  + newWhite + newYellow;
        _this.resetEdges();

    };

    this.b = function() {
        var newRed = yellow.slice(2,5) + red.slice(3,8) + 'r' ;
        var newOrange = orange.slice(0,4) + white[6] + white[7]+ white[0] + orange[7] + 'o' ;
        var newWhite = red[2] + white.slice(1,6) + red.slice(0,2) + 'w';
        var newBlue = blue[6] + blue[7] + blue.slice(0,6) +  'b';
        var newYellow = yellow.slice(0,2) + orange.slice(4,7) + yellow.slice(5,8) + 'y';

        _this.cube = newRed + green + 'g' + newOrange + newBlue  + newWhite + newYellow;
        _this.resetEdges();

    };

    this.b_ = function() {
        var newRed = white.slice(6,8) + white[0] + red.slice(3,8) + 'r' ;
        var newOrange = orange.slice(0,4) + yellow.slice(2,5) + orange[7] + 'o' ;
        var newWhite = orange[6] + white.slice(1,6) + orange.slice(4,6) + 'w';
        var newBlue =  blue.slice(2,8) +  blue[0] + blue[1]  + 'b' ;
        var newYellow = yellow.slice(0,2) + red.slice(0,3) + yellow.slice(5,8) + 'y';

        _this.cube = newRed + green + 'g' + newOrange + newBlue  + newWhite + newYellow;
        _this.resetEdges();

    };

    this.w = function() {
        var newWhite = white[6] + white[7] + white.slice(0,6) + 'w' ;
        var newRed = blue[0] + red.slice(1,6) + blue.slice(6,8) + 'r';
        var newGreen= red[0] + green.slice(1,6) + red.slice(6,8) + 'g';
        var newOrange= green[0] + orange.slice(1,6) + green.slice(6,8) + 'o';
        var newBlue= orange[0] + blue.slice(1,6) + orange.slice(6,8) + 'b';

        _this.cube = newRed + newGreen + newOrange + newBlue  + newWhite + yellow + 'y';
        _this.resetEdges();
    };

    this.w_ = function() {
        var newWhite = white.slice(2,8) +  white[0] + white[1]  + 'w' ;
        var newRed =green[0] + red.slice(1,6) + green.slice(6,8) + 'r';
        var newGreen= orange[0] + green.slice(1,6) + orange.slice(6,8) + 'g';
        var newOrange= blue[0] + orange.slice(1,6) + blue.slice(6,8) + 'o';
        var newBlue= red[0] + blue.slice(1,6) + red.slice(6,8) + 'b';

        _this.cube = newRed + newGreen + newOrange + newBlue  + newWhite + yellow + 'y';
        _this.resetEdges();
    };

    this.y = function() {
        var newRed =  red.slice(0,2) + green.slice(2,5) +  red.slice(5,8) + 'r';
        var newGreen = green.slice(0,2) + orange.slice(2,5) + green.slice(5,8) + 'g';
        var newOrange =  orange.slice(0,2) + blue.slice(2,5) + orange.slice(5,8) + 'o';
        var newBlue = blue.slice(0,2) + red.slice(2,5) + blue.slice(5,8) + 'b';
        var newYellow =  yellow[6] + yellow[7] + yellow.slice(0,6) + 'y';
        _this.cube = newRed + newGreen + newOrange + newBlue  + white + 'w' + newYellow ;
        _this.resetEdges();
    };

    this.y_ = function() {
        var newRed =  red.slice(0,2) + blue.slice(2,5) +  red.slice(5,8) + 'r';
        var newGreen = green.slice(0,2) + red.slice(2,5) + green.slice(5,8) + 'g';
        var newOrange =  orange.slice(0,2) + green.slice(2,5) + orange.slice(5,8) + 'o';
        var newBlue = blue.slice(0,2) + orange.slice(2,5) + blue.slice(5,8) + 'b';
        var newYellow = yellow.slice(2,8)+ yellow[0] + yellow[1]+ 'y';
        _this.cube = newRed + newGreen + newOrange + newBlue  + white + 'w' + newYellow ;
        _this.resetEdges();
    }

    this.log = function() {
        console.log(this.cube);
    }
}
