(function(){
    "use strict";

    class isSquareController{
        constructor(){
        }

        $onInit(){

        }

        onDrop(data, ev){
            let square = data['json/piece-object'];
            this.movePiece()(square.id, this.square.id);
        }

        onDragOver(ev){
            //console.log('onDragOver', ev);
        }
    }

    angular.module('is-chess').component('isChessSquare', {
        templateUrl: 'components/is-chess-square/is-chess-square.html',
        bindings:{
            square: '<',
            movePiece: '&'
        },
        controller: isSquareController,
        controllerAs: 'squareCtrl'

    });
})();