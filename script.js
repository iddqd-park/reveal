$(document).ready(function () {
    const $iframe = $('#content-frame');
    const $overlay = $('#reveal-overlay');
    const $slider = $('#blur-slider');
    const $urlInput = $('#url-input');
    const $loadBtn = $('#load-btn');
    const $homeBtn = $('#home-btn');
    const $goBtn = $('#go-btn');
    const $welcomeScreen = $('.welcome-screen');
    const $controls = $('.controls-container');

    // Initial State
    let currentBlur = 40; // Matches CSS var

    function loadUrl(url, fromHistory = false) {
        if (!url) return;

        // Add protocol if missing
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        // Validate URL (basic)
        try {
            new URL(url);
        } catch (e) {
            alert('Invalid URL');
            return;
        }

        // Show loading state (could be improved, but for now just load)
        $iframe.attr('src', url);

        // Hide welcome screen if visible
        $welcomeScreen.addClass('hidden');
        $homeBtn.removeClass('hidden');

        // Reset Blur
        setBlur(40);
        $slider.val(40);

        // Update Browser URL for sharing (GET param)
        if (!fromHistory) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('url', url);
            window.history.pushState({ path: newUrl.href }, '', newUrl.href);
        }
    }

    function setBlur(val) {
        currentBlur = val;
        $overlay.css('backdrop-filter', `blur(${val}px)`);
        $overlay.css('-webkit-backdrop-filter', `blur(${val}px)`); // Safari support
    }

    // Event Listeners
    $loadBtn.click(function () {
        loadUrl($urlInput.val());
    });

    $homeBtn.click(function () {
        // Reset State
        $iframe.attr('src', 'about:blank');
        $welcomeScreen.removeClass('hidden');
        $homeBtn.addClass('hidden');
        $urlInput.val('');

        // Clear Browser URL
        const newUrl = window.location.href.split('?')[0];
        window.history.pushState({ path: newUrl }, '', newUrl);
    });

    $urlInput.keypress(function (e) {
        if (e.which == 13) {
            loadUrl($urlInput.val());
        }
    });

    $slider.on('input', function () {
        const val = $(this).val();
        setBlur(val);
    });

    $goBtn.click(function () {
        const url = $iframe.attr('src');
        if (url && url !== 'about:blank') {
            // Small delay for effect
            setTimeout(() => {
                window.location.href = url;
            }, 200);
        } else {
            alert("Please load a URL first.");
        }
    });

    // Check for URL parameter on load
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url');
    if (sharedUrl) {
        $urlInput.val(sharedUrl);
        // Small delay to ensure UI is ready
        setTimeout(() => {
            loadUrl(sharedUrl, true);
        }, 500);
    }

    // Handle Back/Forward browser buttons
    window.onpopstate = function (event) {
        const params = new URLSearchParams(window.location.search);
        const backUrl = params.get('url');
        if (backUrl) {
            $urlInput.val(backUrl);
            loadUrl(backUrl, true);
        } else {
            // Reset to initial state if no param
            $iframe.attr('src', 'about:blank');
            $welcomeScreen.removeClass('hidden');
            $urlInput.val('');
        }
    };

    // Mobile address bar hide hack (slide up)
    setTimeout(() => {
        window.scrollTo(0, 1);
    }, 100);

    // Language Detection (Korean)
    const userLang = navigator.language || navigator.userLanguage;
    if (userLang.includes('ko')) {
        $('.welcome-desc').html(`
            <p><strong>의심스러운 링크를 안전하게 확인하세요.</strong></p>
            <p>1. 아래에 URL을 입력하세요.</p>
            <p>2. 생성된 '안심 링크'를 친구에게 공유하세요.</p>
            <p>3. 슬라이더를 움직여 내용을 천천히 확인하세요.</p>
        `);
        $('.welcome-desc').css('word-break', 'keep-all');
        $('#url-input').attr('placeholder', 'URL을 입력하세요 (예: example.com)');
    }
});
