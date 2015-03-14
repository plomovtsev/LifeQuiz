angular
    .module('LifeQuiz', ['ngSanitize', 'ngAnimate'])
    .controller('appCtrl', ["$scope", "$sce", "quiz", function($scope, $sce, quiz) {
        $scope.init = function() {
            $scope.showTopHeader = true;
            $scope.quizStarted = false;
            $scope.quizCompleted = false;
            $scope.curInd = 0;
            $scope.userAnswers = [];
            $scope.quiz = quiz;
            $scope.updateVideoBkg(0, 'init');
        };

        var $questionBlock = document.querySelector('.questionBlock');
        $scope.startQuiz = function() {
            $scope.quizStarted = true;
            $scope.updateVideoBkg(0);
        };
        var t1, t2;
        $scope.nextQuestion = function() {
            $scope.updateVideoBkg(0);
            clearTimeout(t1);
            t1 = $scope.applyClass($questionBlock, 'nextQuestionAnimation', 1500);
            clearTimeout(t2);
            t2 = setTimeout(function() {
                $scope.$apply(function() {
                    if ($scope.curInd < $scope.quiz.questions.length - 1) {
                        $scope.curInd++;
                        $scope.unpickAll();
                    }
                    else {
                        $scope.quizCompleted = true;
                    }
                });
            }, 1000); //Обновляем вопрос когда блок уже справа за экраном и вот-вот вылетит
        };
        var t3, t4;
        $scope.prevQuestion = function() {
            $scope.updateVideoBkg(0);
            $questionBlock.classList.add('prevQuestionAnimation');
            clearTimeout(t3);
            t3 = $scope.applyClass($questionBlock, 'prevQuestionAnimation', 1500);
            clearTimeout(t4);
            t4 = setTimeout(function() {
                $scope.$apply(function() {
                    $scope.curInd--;
                    $scope.unpickAll();
                });
            }, 1000);
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

        var checkedClass = 'checkedVariant';
        $scope.pickVariant = function($event) {
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
        $scope.unpickAll = function() {
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
            element.classList.remove(clazz); //
            element.classList.add(clazz);
            return setTimeout(function() {
                element.classList.remove(clazz);
            }, timeout);
        };

        //Интерполяция {{xxx}} не работает в атрибутах-ссылках на контент, поэтому обновляем ссылки на видео-фон вручную
        var $bkgVid = document.getElementById('bgvid');
        $scope.updateVideoBkg = function(timeout, cmd) {
            var source = getVideoBkgSource();
            setTimeout(function() {
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
        function getVideoBkgSource() {
            return $scope.quizStarted ? quiz.questions[$scope.curInd].bkg : quiz.bkg;
        }

        $scope.init();
    }]);
