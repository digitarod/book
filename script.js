const pdfUrl = 'https://digitarod.github.io/book/pdf/docpass.pdf';
let pdfDoc = null;

const password = prompt('PDFのパスワードを入力してください:');

pdfjsLib.getDocument({ url: pdfUrl, password: password }).promise.then(pdf => {
    pdfDoc = pdf;
    const magazine = $('#magazine');

    const loadPage = (pageNumber) => {
        return pdfDoc.getPage(pageNumber).then(page => {
            const scale = 2.0;
            const viewport = page.getViewport({ scale: scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            return page.render(renderContext).promise.then(() => {
                return canvas.toDataURL('image/jpeg');
            });
        });
    };

    const addPage = (pageNumber, url) => {
        const pageElement = $('<div>').css('background-image', 'url(' + url + ')');
        magazine.turn('addPage', pageElement, pageNumber);
    };

    const loadMagazine = async () => {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const url = await loadPage(i);
            const pageElement = $('<div>').css('background-image', 'url(' + url + ')');
            if (i === pdfDoc.numPages) {
                pageElement.addClass('review-page').html('<p>商品の感想を教えてください！</p><button class="review-button" onclick="window.location.href=\'https://digitarod.github.io/book/survey.html\'">感想を書く</button>');
            }
            magazine.append(pageElement);
        }


        magazine.turn({
            width: 900,
            height: 600,
            autoCenter: true,
            when: {
                turned: function(event, page, view) {
                    updatePageNumbers(view);
                }
            }
        });

        updatePageNumbers(magazine.turn('view'));
    };

    loadMagazine();

    $(window).on('keydown', (e) => {
        if (e.keyCode === 37) {
            magazine.turn('previous');
        } else if (e.keyCode === 39) {
            magazine.turn('next');
        }
    });

    $('#prev-button').on('click', () => {
        magazine.turn('previous');
    });

    $('#next-button').on('click', () => {
        magazine.turn('next');
    });

    function updatePageNumbers(view) {
        if (!view) return;
        $('#left-page').text(view[0] || '');
        $('#right-page').text(view[1] || '');
    }

}).catch(err => {
    alert('PDFの読み込みに失敗しました: ' + err.message);
});