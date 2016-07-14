(function(){
    "use strict";
    //provider chess
    const order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    const hrz = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const vert = [8, 7, 6, 5, 4 , 3, 2, 1];
    const players = ['white', 'black'];

    //provider chess factory
    function _initPiece(vert, inx){
        if(vert >= 7){
            let player = players[1];
            let type = vert === 8 ? order[inx] : 'pawn';
            return {player, type};
        }else if (vert <= 2){
            let player = players[0];
            let type = vert === 1 ? order[inx] : 'pawn';
            return {player, type};
        } else {
            return null;
        }
    }

    function _mapSquares(){
        return _.flatten(_.map(vert, (vertItem)=>{
            return _.map(hrz, (hrzItem, inx)=> {
                return {
                    id: `${hrzItem}${vertItem}`,
                    x: inx+1,
                    y: vertItem,
                    piece: _initPiece(vertItem, inx)
                };
            });
        }));
    }

    function _getOtherPlayer(player){
        return (player === players[0]) ? players[1] : players[0];
    }
    //

    //provider actions
    const _isBlocked = {
        linear(from, to, staticPoint, squares){
            let legal = true;
            let add = ((to - from) > 0) ? 1: -1;
            let startAt = from + add;
            while(startAt !== to){
                let dynamicPoint = _.isString(staticPoint) ? startAt : hrz[startAt-1];
                if(_isSquareFull(_buildSquareId(staticPoint, dynamicPoint), squares)){
                    legal = false;
                    break;
                }
                startAt += add;
            }
            return legal;
        },
        diagonal(from, to, squares){
            let legal = true;
            let addX = (to.x - from.x) > 0 ? 1 : -1;
            let addY = (to.y - from.y) > 0 ? 1 : -1;
            let startX = from.x + addX;
            let startY = from.y + addY;
            while(startX !== to.x){

                if(_isSquareFull(`${hrz[startX-1]}${startY}`, squares)){
                    legal = false;
                    break;
                }
                startX += addX;
                startY += addY;
            }
            return legal;
        }
    };

    const _moves = {
         king(from, to){
             //king [x, [y+1, y-1]], [x+1, [y, y+1, y-1]] [x-1, [y, y+1, y-1]]
             //xxx
             //xox
             //xxx
             let legal = false;
             let xDiff = to.x - from.x;
             if(xDiff === 0){
                 legal = Math.abs(to.y - from.y) === 1;
             } else if( Math.abs(xDiff) === 1){
                 legal = ((to.y === from.y) || (Math.abs(to.y - from.y) === 1));
             }
             return legal;
         },
        rook(from, to, squares){
            //rook [+ - x , y], [x, + - y] check clear path
            //  x
            //xxoxx
            //  x

            let xDiff =  to.x - from.x;
            let yDiff =  to.y - from.y;

            return (Math.abs(xDiff) > 0 && yDiff === 0) ?_isBlocked.linear(from.x, to.x, from.y, squares) :
                (Math.abs(yDiff) > 0 && xDiff === 0) ? _isBlocked.linear(from.y, to.y, hrz[from.x-1], squares) : false;

        },
        bishop(from, to, squares){
            //bishop [x - + max, y - + max] check clear path
            //x x
            // o
            //x x
            let xDiff = Math.abs(to.x - from.x);
            let yDiff = Math.abs(to.y - from.y);

            return (xDiff > 0 && yDiff > 0 && xDiff === yDiff) ? _isBlocked.diagonal(from, to, squares) : false;
        },
        queen(from, to, squares){
            //queen [+ - x , y], [x, + - y][x - + max, y - + max] check clear path
            return _moves.rook(to, from, squares) || _moves.bishop(to, from, squares);
        },
        knight(from, to){
            let xDiff =  Math.abs(to.x - from.x);
            let yDiff =  Math.abs(to.y - from.y);
            return (xDiff > 0 && yDiff > 0 && (Math.abs(xDiff - yDiff) === 1));
        },
        pawn(from, to, squares){
            if(to.piece){
                return false;
            }
            let yDiff =  Math.abs(to.y - from.y);
            if(to.x !== from.x || yDiff < 1 || yDiff > 2 || (from.piece.moved && yDiff > 1)){
                return false;
            }
            if(from.piece.player === players[0]){
                //pawn white [x, y+1] //clean [x, y+2] check path including //check capture [x-1, y+1] [x+1, y+1]
                return ((to.y - from.y) < 1) ? _isBlocked.linear(from.y, to.y, hrz[from.x-1], squares) : true;
            } else {
                return ((to.y - from.y) > 1) ? _isBlocked.linear(from.y, to.y, hrz[from.x-1], squares) : true;
            }
        }
    };

    const _postMove = {
        pawn(piece, to, squares){
            piece.moved = true;
            //capture x neighbours
            let x1 = _isSquareFull(`${hrz[to.x]}${to.y}`, squares);
            let x2 = _isSquareFull(`${hrz[to.x-2]}${to.y}`, squares);
            if(x1 && (x1.piece.player !== piece.player)) {
                x1.piece = null;
            }
            if(x2 && (x2.piece.player !== piece.player)) {
                x2.piece = null;
            }
        },
        all(){
        }
    };

    function _addPiece(type, moveHandler, postMoveHandler){
        //moveHandler receives  fromSquare, toSquare, currentBoardState
        //postMoveHandler receives  pieceMoved, toSquare, currentBoardState

        if(_.isFunction(moveHandler)){

            if(_.isFunction(_moves[type])){

                throw `piece ${type} moves already exist`;

            } else {

                _moves[type] = moveHandler.bind(_moves);

            }
        }
        if(_.isFunction(postMoveHandler)){

            if(_.isFunction(_postMove[type])){

                throw `piece ${type} post move already exists`;

            } else {

                _postMove[type] = postMoveHandler.bind(_postMove);

            }
        }
    }

    //provider actions factory
    function _isSquareFull(id, squares){
        let square = _.find(squares, {id}, {});
        return _.get(square, 'piece', false) ? square : false;
    }

    function _buildSquareId(axisCheck, axis2){
        if(_.isString(axisCheck)){
            //axis x;
            return `${axisCheck}${axis2}`;
        } else {
            //axis y
            return `${axis2}${axisCheck}`;
        }
    }

    function _checkMove(from, to, pieceType, squares){
        return _.isFunction(_moves[pieceType]) ? (_moves[pieceType])(from, to, squares) : false;
    }

    //

    class isBoardController{
        constructor(){
            this.hrz = hrz;
            this.vert = vert;
            this.squares = _mapSquares();

            this.turn = players[0];
        }

        reset(){
            this.squares = _mapSquares();
        }

        getPiece(hrz, vert){
            return _.find(this.squares, {id:`${hrz}${vert}`});
        }

        movePiece(from, to){
            let fromSq = _.find(this.squares, {id:from});
            let toSq = _.find(this.squares, {id:to});
            let pieceType = _.get(fromSq, 'piece.type', false);
            if(pieceType && !this.isGlobalBlock(fromSq, toSq) && _checkMove(fromSq, toSq, pieceType, this.squares)){
                let piece = fromSq.piece;
                fromSq.piece = null;
                if(_.isFunction(_postMove[pieceType])){
                    (_postMove[pieceType])(piece, toSq, this.squares);
                }
                _postMove.all();
                toSq.piece = piece;
                this.switchTurn();
            } else {
                console.warn('illegal move');
            }
        }

        isGlobalBlock(from, to){
            let fromPlayer = _.get(from, 'piece.player', false);
            let toPlayer = _.get(to, 'piece.player', false);

            return (!fromPlayer || (fromPlayer !== this.turn)|| (toPlayer && (fromPlayer === toPlayer)));
        }

        switchTurn(){
            this.turn = _getOtherPlayer(this.player);
            return this.turn;
        }
    }

    angular.module('is-chess').component('isBoard', {
        templateUrl: 'components/is-board/is-board.html',
        bindings:true,
        controller: isBoardController,
        controllerAs: 'boardCtrl'

    });
})();