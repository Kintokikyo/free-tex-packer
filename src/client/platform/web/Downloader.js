import JSZip from 'jszip';
import FileSaver from 'file-saver';


class Downloader {

    static run(files, fileName) {

        let zip = new JSZip();


        // =========================================================
        // MASUKKAN SEMUA FILE KE ZIP
        // =========================================================

        for (let file of files) {

            zip.file(
                file.name,
                file.content,
                {
                    base64: !!file.base64
                }
            );
        }


        // =========================================================
        // PASTIKAN EXTENSION .ZIP
        // =========================================================

        let ext = fileName.split(".").pop();

        if (ext !== "zip") {
            fileName = fileName + ".zip";
        }


        // =========================================================
        // ANDROID WEBVIEW
        // =========================================================

        if (
            window.AndroidDownload &&
            typeof window.AndroidDownload.saveBase64 === "function"
        ) {

            zip.generateAsync({
                type: "base64"
            }).then((content) => {

                window.AndroidDownload.saveBase64(
                    fileName,
                    content
                );

            });


        // =========================================================
        // WEB BROWSER / CHROME
        // =========================================================

        } else {

            zip.generateAsync({
                type: "blob"
            }).then((content) => {

                FileSaver.saveAs(
                    content,
                    fileName
                );

            });
        }
    }
}


export default Downloader;
