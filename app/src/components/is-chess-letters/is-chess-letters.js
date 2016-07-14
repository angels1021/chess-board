(function(){
    "use strict";

    angular.module('is-chess').component('isChessLetters', {
        templateUrl: 'components/is-chess-letters/is-chess-letters.html',
        bindings:{
            letters: '<'
        },
        controllerAs: 'lettersCtrl'

    });
})();