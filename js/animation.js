function animSeq(anims) {
    var curAnim = anims[0];
    if (curAnim.func) {
        curAnim.func();
        setTimeout(function() {
            animSeq(anims.splice(1));
        }, curAnim.timeout);
    }
    else {
        var elem = curAnim.elem;
        elem.style.transition = 'all ' + curAnim.duration + 'ms ' + (curAnim.transitionFunc || 'ease');
        elem.classList.add(curAnim.class);
        if (anims.length > 1) {
            setTimeout(function() {
                elem.classList.remove(curAnim.class);
                animSeq(anims.splice(1));
            }, curAnim.duration);
        }
    }
}

function Animation(elem) {
    var element = elem;
    var queue = [];

    return {
        switchTo: function(newElem) {
            element = newElem;
            return this;
        },
        thenExecAndWait: function(func, timeout) {
            queue.push({
                func: func,
                timeout: timeout
            });
            return this;
        },
        then: function(clazz, duration, transitionFunc) {
            queue.push({
                elem: element,
                class: clazz,
                duration: duration,
                transitionFunc: transitionFunc
            });
            return this;
        },
        run: function() {
            animSeq(queue);
        }
    }
}