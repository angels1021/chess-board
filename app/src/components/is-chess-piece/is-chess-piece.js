(function(){
    "use strict";

    angular.module('is-chess').component('isChessPiece', {
        templateUrl: 'components/is-chess-piece/is-chess-piece.html',
        bindings:{
            piece: '<'
        },
        controllerAs: 'pieceCtrl'

    });
})();