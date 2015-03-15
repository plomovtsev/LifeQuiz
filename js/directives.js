angular
    .module('LifeQuiz')
/**
 * Загружает все видео, переданные в атрибуте sources,
 * по окончанию загрузки пробрасывает событие allVideosPreloaded.
 */
    .directive('preloadSources', ["$timeout", function($timeout) { return {
        restrict: 'A',
        scope: {
            preloadSources: '='
        },
        template: '<div id="videoPreloader" style="display: none">' +
                      '<video ng-repeat="source in preloadSources" src="{{source}}"></video>' +
                  '</div>',
        link: function($scope) {
            var loadedCount = 0;
            $timeout(function() { //Дожидаемся пока ng-repeat вставит в DOM все <video>
                var $videos = document.querySelectorAll('#videoPreloader video');
                Array.prototype.forEach.call($videos, function($video) {
                    $video.load();
                    $video.addEventListener('loadeddata', function () {
                        loadedCount++;
                        if (loadedCount == $scope.preloadSources.length) {
                            $scope.$emit('allVideosPreloaded');
                        }
                    });
                });
            });
        }
    }
}]);
