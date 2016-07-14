(function(){
    "use strict";
    const order = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    const hrz = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const vert = [8, 7, 6, 5, 4 , 3, 2, 1];

    function initPiece(vert, inx){
        if(vert >= 7){
            let player = 'black';
            let type = vert === 8 ? order[inx] : 'pawn';
            return {player, type};
        }else if (vert <= 2){
            let player = 'white';
            let type = vert === 1 ? order[inx] : 'pawn';
            return {player, type};
        } else {
            return null;
        }
    }

    const squares = _.flatten(_.map(vert, (vertItem)=>{
        return _.map(hrz, (hrzItem, inx)=> {
            return {
                id: `${hrzItem}${vertItem}`,
                x: inx+1,
                y: vertItem,
                piece: initPiece(vertItem, inx)
            };
        });
    }));

    function isSquareFull(id){
        let isFull = false;
        let toCheck = _.find(squares, {id});
        if(toCheck.piece){
            isFull = true;
        }
        return isFull;
    }

    function checkMove(from, to){
        if(to.piece && to.piece.player === from.piece.player){
            console.warn('blocked');
            return false;
        }
        let pieceType = from.piece.type;
        let legal = false;
        let xDiff;
        let yDiff;

        switch (pieceType){
            case 'king':
                //king [x, [y+1, y-1]], [x+1, [y, y+1, y-1]] [x-1, [y, y+1, y-1]]
                xDiff = to.x - from.x;
                if(xDiff === 0){
                    legal = Math.abs(to.y - from.y) === 1;
                } else if( Math.abs(xDiff) === 1){
                    legal = ((to.y === from.y) || (Math.abs(to.y - from.y) === 1));
                }

                if(legal){
                    to.piece = from.piece;
                    from.piece = null;
                }else{
                    console.warn('illegal');
                }
                break;

            case 'rook':
                //rook [+ - x , y], [x, + - y] check clear path
                xDiff =  to.x - from.x;
                yDiff =  to.y - from.y;
                legal = false;
                if(Math.abs(xDiff) > 0 && yDiff === 0){
                    legal = true;
                    let add = (xDiff > 0) ? 1: -1;
                    let startAt = from.x + add;
                    let stopAt = to.x - add;

                    if(xDiff < 0){
                        for(let i = startAt; i >= stopAt ; i--){
                            if(isSquareFull(`${hrz[i-1]}${from.y}`)){
                                legal = false;
                                break;
                            }
                        }
                    }else{
                        for(let i = startAt; i <= stopAt ; i++){
                            if(isSquareFull(`${hrz[i-1]}${from.y}`)){
                                legal = false;
                                break;
                            }
                        }
                    }
                    if(!legal){
                        console.warn('blocked');
                    }

                } else if(Math.abs(yDiff) > 0 && xDiff === 0){
                    legal = true;
                    let add = (yDiff > 0) ? 1: -1;
                    let startAt = from.y + add;
                    let stopAt = to.y - add;
                    if(yDiff < 0){
                        for(let i = startAt; i >= stopAt ; i--){
                            if(isSquareFull(`${hrz[from.x-1]}${i}`)){
                                legal = false;
                                break;
                            }
                        }
                    }else{
                        for(let i = startAt; i <= stopAt ; i++){
                            if(isSquareFull(`${hrz[from.x-1]}${i}`)){
                                legal = false;
                                break;
                            }
                        }
                    }

                    if(!legal){
                        console.warn('blocked');
                    }
                }

                console.log('tests done', legal);
                if(legal){
                    to.piece = from.piece;
                    from.piece = null;
                }else{
                    console.warn('illegal');
                }

                break;

            case 'bishop':
                //bishop [x - + max, y - + max] check clear path
                xDiff =  Math.abs(to.x - from.x);
                yDiff =  Math.abs(to.y - from.y);
                if(xDiff > 0 && yDiff > 0 && xDiff === yDiff){
                    //check path
                }
                break;

            case 'queen':
            //queen [+ - x , y], [x, + - y][x - + max, y - + max] check clear path
                break;

            case 'knight':
            //knight [x+1, [y+2, y-2]] [x+2, [y+1, y-1]] [x-1, [y+2, y-2]] [x-2, [y+1, y-1]]
                break;

            case 'pawn':
            //pawn white [x, y-1] //clean [x, y-2] check path including //check capture [x-1, y-1] [x+1, y-1]
            //pawn black [x, y+1] //clean [x, y+2] check path including //check capture [x-1, y+1] [x+1, y+1]
                break;
        }
    }

    class isBoardController{
        constructor(){
            this.hrz = hrz;
            this.vert = vert;
        }

        getPiece(hrz, vert){
            return _.find(squares, {id:`${hrz}${vert}`});
        }

        movePiece(from, to){
            let fromSq = _.find(squares, {id:from});
            let toSq = _.find(squares, {id:to});
            console.log('movePiece', fromSq, toSq);
            checkMove(fromSq, toSq);
        }
    }

    angular.module('is-chess').component('isBoard', {
        templateUrl: 'components/is-board/is-board.html',
        bindings:true,
        controller: isBoardController,
        controllerAs: 'boardCtrl'

    });
})();