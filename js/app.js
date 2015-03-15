angular
    .module('LifeQuiz', ['ngSanitize', 'ngAnimate'])
    .controller('appCtrl', ["$scope", "$sce", "quiz", function($scope, $sce, quiz) {
        $scope.init = function() {
            $scope.showTopHeader = true;
            $scope.quizStarted = false;
            $scope.quizCompleted = false;
            $scope.allVideoBkgsLoaded = false;
            $scope.curInd = 0;
            $scope.userAnswers = [];
            $scope.quiz = quiz;
            $scope.updateVideoBkg(0, 'init');
        };
        $scope.sources = quiz.questions.map(function(q) {
            return "./video-bkg/mp4/" + q.bkg.mp4;
        });
        $scope.$on('allVideosPreloaded', function() {
            $scope.allVideoBkgsLoaded = true;
        });

        //Анимация основана на классах, которые вешает ngAnimate
        var $questionBlock = document.querySelector('.questionBlock');
        $scope.startQuiz = function() {
            var interval = setInterval(function() {
                if ($scope.allVideoBkgsLoaded) {
                    $scope.$apply(function() {
                        $scope.quizStarted = true;
                        $scope.updateVideoBkg();
                        clearInterval(interval);
                    });
                }
                else {
                    console.log('videos are not ready yet');
                }
            }, 10);
        };

        //Анимация основана на классах, навешиваемых вручную
        var t2;
        $scope.nextQuestion = function() {
            $scope.updateVideoBkg(0);
            $scope.applyClass($questionBlock, 'nextQuestionAnimation');
            clearTimeout(t2);
            t2 = setTimeout(function() {
                $scope.$apply(function() {
                    if ($scope.curInd < $scope.quiz.questions.length - 1) {
                        $scope.curInd++;
                        $scope.uncheckAll();
                    }
                    else {
                        $scope.quizCompleted = true;
                    }
                });
            }, 750); //Обновляем вопрос когда блок уже справа за экраном и вот-вот вылетит
        };

        var t4;
        $scope.prevQuestion = function() {
            $scope.updateVideoBkg(0);
            $scope.applyClass($questionBlock, 'prevQuestionAnimation');
            clearTimeout(t4);
            t4 = setTimeout(function() {
                $scope.$apply(function() {
                    $scope.curInd--;
                    $scope.uncheckAll();
                });
            }, 750);
        };

        $scope.getCurQuestion = function() {
            return $scope.quiz.questions[$scope.curInd];
        };

        $scope.getCurQuestionHtml = function() {
            return $sce.getTrustedHtml($scope.getCurQuestion().question);
        };

        $scope.getCurQuestionType = function() {
            return $scope.getCurQuestion().type;
        };

        /**
         * Вешает класс checkedVariant на выбранный вариант ответа (checkbox'ы и radio)
         */
        var checkedClass = 'checkedVariant';
        $scope.checkVariant = function($event) {
            if ($event.target.tagName === "INPUT") {
                if ($scope.getCurQuestionType() === "checkbox") {
                    $event.currentTarget.classList.toggle(checkedClass);
                }
                else {
                    var $checkedElem = $event.currentTarget.parentElement.querySelector('.variant.checkedVariant');
                    if ($checkedElem)
                        $checkedElem.classList.remove(checkedClass);
                    $event.currentTarget.classList.add(checkedClass);
                }
            }
        };

        $scope.uncheckAll = function() {
            var $checkedElems = document.querySelectorAll('.variant.checkedVariant');
            Array.prototype.forEach.call($checkedElems, function($elem) {
                $elem.classList.remove(checkedClass);
            });
        };

        $scope.mouseDownedBlock = undefined;
        $scope.mouseDownEffect = function($event) {
            $scope.mouseDownedBlock = $event.currentTarget;
                if ($scope.mouseDownedBlock) {
                    var oldTransition = $scope.mouseDownedBlock.style.transition;
                    $scope.mouseDownedBlock.style.transition = 'all .2s ease';
                    $scope.mouseDownedBlock.style.transform = 'scale(0.99)';
                    setTimeout(function () {
                        if ($scope.mouseDownedBlock) {
                            $scope.mouseDownedBlock.style.transition = oldTransition;
                        }
                    }, 200);
                }
        };

        $scope.mouseUpEffect = function() {
            if ($scope.mouseDownedBlock)
                $scope.mouseDownedBlock.style.transform = '';
            $scope.mouseDownedBlock = undefined;
        };

        $scope.applyClass = function(element, clazz, timeout) {
            $scope.removeAnimationClasses(element);
            setTimeout(function() { //Если удалить-добавить класс синхронно, то анимация не прменяется
                element.classList.add(clazz);
            }, 0);
            if (timeout) {
                setTimeout(function () {
                    element.remove(clazz);
                }, timeout);
            }
        };

        $scope.removeAnimationClasses = function(element) {
            for (var i = 0; i < element.classList.length; i++) {
                if (element.classList[i].indexOf('Animation') != -1)
                    element.classList.remove(element.classList[i]);
            }
        };

        //Интерполяция {{xxx}} не работает в атрибутах-ссылках на контент, поэтому обновляем ссылки на видео-фон вручную
        var $bkgVid = document.getElementById('bgvid');
        $scope.updateVideoBkg = function(timeout, cmd) {
            setTimeout(function() {
                var source = $scope.getCurVideoBkgSource();
                if (cmd != 'init') {
                    $bkgVid.classList.add('bkgReplaceAnimation');
                    setTimeout(function() {
                        $bkgVid.setAttribute('poster', './img/' + source.png);
                        $bkgVid.setAttribute('src', './video-bkg/mp4/' + source.mp4);
                    }, 300);
                    setTimeout(function() {
                        $bkgVid.classList.remove('bkgReplaceAnimation');
                    }, 1000);
                }
                else {
                    $bkgVid.setAttribute('poster', './img/' + source.png);
                    $bkgVid.setAttribute('src', './video-bkg/mp4/' + source.mp4);
                }
            }, timeout || 0);
        };

        $scope.getCurVideoBkgSource = function() {
            return $scope.quizStarted ? quiz.questions[$scope.curInd].bkg : quiz.bkg;
        };

        $scope.init();
    }]);
