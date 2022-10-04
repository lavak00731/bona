let iframeChannelReady = false;
let iframeResizeEventReceived = false;
let resizeAttempts = 0;

if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);
} else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function acknowledgeChannelReady() {
    console.log("CHANNEL IS READY IN PARENT!");
    iframeChannelReady = true;
}
function acknowledgeIframeSizeReceived() {
    iframeResizeEventReceived = true;
}

function onMessage(event) {

    const data = event.data;
    if(data.func) {
        switch (data.func) {
            case 'acknowledgeIframeSizeReceived' :
                acknowledgeIframeSizeReceived();
                break;
            case 'acknowledgeChannelReady' :
                acknowledgeChannelReady();
                break;
        }
    }
}

function mostrarParte2() {
    $('#parte-2').show();
    $('#parte-2-title').show();
}

function resizeFrame() {
    resizeAttempts++;
    const height = $('body').height() + 100;

    window.parent.postMessage({
        'func': 'resizeCancerFrame',
        'height': height + 'px',
    }, "*");

    /* RETRY RESIZE FRAME UNTIL PARENT IS READY AND INFORMED HE RECEIVED THE RESIZE EVENT */
    if(!iframeChannelReady || !iframeResizeEventReceived) {
        setTimeout(function() {
            resizeFrame();
        },100);
    }
}

function focusOnTarget(target) {
    const targetElem = document.querySelector('#'+target);
    document.querySelectorAll('[data-remove="true"]').forEach((subsection) => subsection.setAttribute('hidden', true));
    targetElem.removeAttribute('hidden');
    targetElem.scrollIntoView({
        behavior: "smooth"
    });

}

(function () {

    function scrollHandling(e) {
        const target = e.target.dataset.target;
        focusOnTarget(target)
    }

    document.querySelectorAll('button[data-target]').forEach((elem) => {
        elem.addEventListener('click', scrollHandling);
    });

    $('body').resize(function() {
        resizeFrame();
    });

    $('#retirar').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: '/controller.php',
            data: $(this).serialize(),
            dataType: 'json',
            success: function(response) {
                console.log(response)
                focusOnTarget('finform');
            },
            error: function(response) {
                console.log(response)
                focusOnTarget('finform');
            }
        });
    })

    resizeFrame();
})();
