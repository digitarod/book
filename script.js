pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
const pdfUrl = 'https://digitarod.github.io/book/pdf/docpass.pdf';

const password = prompt('PDFのパスワードを入力してください:');

if (password) {
    alert("PDFの読み込み処理を開始します...");

    pdfjsLib.getDocument({ url: pdfUrl, password: password }).promise.then(
        function(pdf) {
            alert("PDFの読み込みに成功しました！ページ数: " + pdf.numPages);
            // 成功した場合、元の処理に戻すためリロードを促す
            if(confirm("元のビューワに戻しますか？")) {
                // ここではユーザーに手動でのリロードをお願いする形になりますが、
                // 次のステップで元のスクリプトに戻します。
                alert("お手数ですが、次の指示でスクリプトを元に戻してください。");
            }
        },
        function(error) {
            // 失敗時のコールバック
            let errorMessage = "原因不明のエラーです。";
            if (error) {
                if (error.message) {
                    errorMessage = error.message;
                } else if (error.name) {
                    errorMessage = "エラー種別: " + error.name;
                } else {
                    try {
                        errorMessage = JSON.stringify(error);
                    } catch (e) {
                        errorMessage = "エラーオブジェクトを解析できませんでした。"
                    }
                }
            }
            alert("PDFの読み込みに失敗しました。\n\nエラー詳細: " + errorMessage);
        }
    );
} else {
    alert("パスワードが入力されなかったため、処理を中断しました。");
}
