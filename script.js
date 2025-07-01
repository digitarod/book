const pdfUrl = 'https://digitarod.github.io/book/pdf/docpass.pdf';

// --- DOM Elements ---
const $loader = $('#loader');
const $title = $('#title');
const $container = $('#container');
const $magazine = $('#magazine');
const $pageNumbers = $('#page-numbers');

// --- Functions ---

/**
 * Updates the page number display.
 * @param {Array<number>} view - The current pages in view.
 */
function updatePageNumbers(view) {
    if (!view) return;
    $pageNumbers.find('#left-page').text(view[0] || '');
    $pageNumbers.find('#right-page').text(view[1] || '');
}

/**
 * Sets up or re-initializes the turn.js instance based on window size.
 */
function setupTurnJs() {
    if ($magazine.turn('is')) {
        $magazine.turn('destroy');
    }

    const isMobile = window.innerWidth < 900;
    const display = isMobile ? 'single' : 'double';
    const width = isMobile ? window.innerWidth : 900;
    const height = isMobile ? window.innerHeight : 600;

    $magazine.turn({
        width: width,
        height: height,
        display: display,
        autoCenter: true,
        gradients: true,
        acceleration: true,
        when: {
            turned: (event, page, view) => {
                updatePageNumbers(view);
            }
        }
    });

    updatePageNumbers($magazine.turn('view'));
}

/**
 * Loads the PDF and renders its pages into the magazine.
 * @param {string} password - The password for the PDF.
 */
async function loadMagazine(password) {
    $loader.removeClass('hidden');
    $title.addClass('hidden');

    try {
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, password: password }).promise;

        const renderPage = async (pageNumber) => {
            const page = await pdf.getPage(pageNumber);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            return canvas.toDataURL('image/jpeg');
        };

        for (let i = 1; i <= pdf.numPages; i++) {
            const imageUrl = await renderPage(i);
            const $pageElement = $('<div>').css('background-image', `url(${imageUrl})`);
            $magazine.append($pageElement);
        }

        const $reviewPage = $('<div>')
            .addClass('review-page')
            .html('<p>商品の感想を教えてください！</p><button class="review-button" onclick="window.location.href=\'https://digitarod.github.io/book/survey.html\'">感想を書く</button>');
        $magazine.append($reviewPage);

        $loader.addClass('hidden');
        $container.removeClass('hidden');
        $pageNumbers.removeClass('hidden');

        setupTurnJs();

    } catch (err) {
        $loader.addClass('hidden');
        $title.removeClass('hidden');
        alert(`PDFの読み込みに失敗しました: ${err.message}`);
    }
}

// --- Event Handlers ---
$(window).on('resize', () => {
    // Debounce resize event for performance
    let timeout;
    clearTimeout(timeout);
    timeout = setTimeout(setupTurnJs, 250);
}).on('keydown', (e) => {
    if (e.key === 'ArrowLeft') $magazine.turn('previous');
    if (e.key === 'ArrowRight') $magazine.turn('next');
});

$('#prev-button').on('click', () => $magazine.turn('previous'));
$('#next-button').on('click', () => $magazine.turn('next'));

// --- Initialization ---
const password = prompt('PDFのパスワードを入力してください:');
if (password) {
    loadMagazine(password);
} else {
    $title.removeClass('hidden');
}
