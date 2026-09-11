package com.dedigame.freetexpacker;

import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import android.content.Intent;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.OutputStream;
import java.io.File;
import java.io.FileOutputStream;

import androidx.webkit.WebViewAssetLoader;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;


public class MainActivity extends Activity {

    private WebView webView;

    // File picker
    private ValueCallback<Uri[]> filePathCallback;

    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowInsetsControllerCompat windowInsetsController = 
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        
        if (windowInsetsController != null) {
            windowInsetsController.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            windowInsetsController.hide(WindowInsetsCompat.Type.systemBars());
        }

        webView = new WebView(this);
        setContentView(webView);


        // =========================================================
        // JAVASCRIPT -> ANDROID BRIDGE
        // =========================================================

        webView.addJavascriptInterface(
                new AndroidDownload(),
                "AndroidDownload"
        );


        // =========================================================
        // WEBVIEW SETTINGS
        // =========================================================

        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);


        // =========================================================
        // LOAD LOCAL WEB ASSETS
        // =========================================================

        WebViewAssetLoader assetLoader =
                new WebViewAssetLoader.Builder()
                        .addPathHandler(
                                "/assets/",
                                new WebViewAssetLoader.AssetsPathHandler(this)
                        )
                        .build();


        webView.setWebViewClient(new WebViewClient() {

            @Override
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    WebResourceRequest request
            ) {

                return assetLoader.shouldInterceptRequest(
                        request.getUrl()
                );
            }


            @Override
            @SuppressWarnings("deprecation")
            public WebResourceResponse shouldInterceptRequest(
                    WebView view,
                    String url
            ) {

                return assetLoader.shouldInterceptRequest(
                        Uri.parse(url)
                );
            }
        });


        // =========================================================
        // FILE PICKER + WEBVIEW CHROME
        // =========================================================

        webView.setWebChromeClient(new WebChromeClient() {

            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams
            ) {

                // Batalkan callback sebelumnya
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }

                MainActivity.this.filePathCallback =
                        filePathCallback;


                try {

                    Intent intent =
                            fileChooserParams.createIntent();

                    startActivityForResult(
                            intent,
                            FILE_CHOOSER_REQUEST_CODE
                    );

                } catch (Exception e) {

                    MainActivity.this.filePathCallback = null;

                    Toast.makeText(
                            MainActivity.this,
                            "Tidak dapat membuka file picker",
                            Toast.LENGTH_SHORT
                    ).show();

                    return false;
                }

                return true;
            }
        });


        // =========================================================
        // LOAD FREE TEXTURE PACKER
        // =========================================================

        webView.loadUrl(
                "https://appassets.androidplatform.net/assets/web/index.html"
        );
    }


    // =============================================================
    // FILE PICKER RESULT
    // =============================================================

    @Override
    protected void onActivityResult(
            int requestCode,
            int resultCode,
            Intent data
    ) {

        super.onActivityResult(
                requestCode,
                resultCode,
                data
        );


        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {

            if (filePathCallback == null) {
                return;
            }


            Uri[] results =
                    WebChromeClient.FileChooserParams.parseResult(
                            resultCode,
                            data
                    );


            filePathCallback.onReceiveValue(results);

            filePathCallback = null;
        }
    }


    // =============================================================
    // ANDROID DOWNLOAD BRIDGE
    // =============================================================

    public class AndroidDownload {

        @JavascriptInterface
        public void saveBase64(
                String fileName,
                String base64
        ) {

            try {

                // Decode Base64 -> binary ZIP
                byte[] data =
                        Base64.decode(
                                base64,
                                Base64.DEFAULT
                        );


                // =================================================
                // ANDROID 10 / API 29+
                // =================================================

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                    ContentValues values =
                            new ContentValues();


                    values.put(
                            MediaStore.Downloads.DISPLAY_NAME,
                            fileName
                    );


                    values.put(
                            MediaStore.Downloads.MIME_TYPE,
                            "application/zip"
                    );


                    values.put(
                            MediaStore.Downloads.RELATIVE_PATH,
                            Environment.DIRECTORY_DOWNLOADS
                                    + "/Free Texture Packer"
                    );


                    values.put(
                            MediaStore.Downloads.IS_PENDING,
                            1
                    );


                    ContentResolver resolver =
                            getContentResolver();


                    Uri uri =
                            resolver.insert(
                                    MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                                    values
                            );


                    if (uri == null) {

                        throw new Exception(
                                "Gagal membuat file"
                        );
                    }


                    OutputStream outputStream =
                            resolver.openOutputStream(uri);


                    if (outputStream == null) {

                        throw new Exception(
                                "Gagal membuka file"
                        );
                    }


                    outputStream.write(data);

                    outputStream.flush();

                    outputStream.close();


                    // Tandai file sudah selesai ditulis
                    ContentValues completeValues =
                            new ContentValues();

                    completeValues.put(
                            MediaStore.Downloads.IS_PENDING,
                            0
                    );


                    resolver.update(
                            uri,
                            completeValues,
                            null,
                            null
                    );


                    Toast.makeText(
                            MainActivity.this,
                            "Export berhasil disimpan di Download/Free Texture Packer",
                            Toast.LENGTH_LONG
                    ).show();


                } else {

                    // =================================================
                    // ANDROID 9 / API 28 DAN LEBIH LAMA
                    // =================================================
                    //
                    // Untuk Android lama kita simpan ke folder
                    // Download milik aplikasi.
                    //
                    // Android modern tidak menggunakan bagian ini.
                    // =================================================


                    File downloadDir =
                            getExternalFilesDir(
                                    Environment.DIRECTORY_DOWNLOADS
                            );


                    if (downloadDir == null) {

                        throw new Exception(
                                "Folder Download tidak tersedia"
                        );
                    }


                    File folder =
                            new File(
                                    downloadDir,
                                    "Free Texture Packer"
                            );


                    if (!folder.exists()) {
                        folder.mkdirs();
                    }


                    File outputFile =
                            new File(
                                    folder,
                                    fileName
                            );


                    FileOutputStream outputStream =
                            new FileOutputStream(
                                    outputFile
                            );


                    outputStream.write(data);

                    outputStream.flush();

                    outputStream.close();


                    Toast.makeText(
                            MainActivity.this,
                            "Export berhasil disimpan",
                            Toast.LENGTH_LONG
                    ).show();
                }


            } catch (Exception e) {

                e.printStackTrace();


                Toast.makeText(
                        MainActivity.this,
                        "Export gagal: " + e.getMessage(),
                        Toast.LENGTH_LONG
                ).show();
            }
        }
    }


    // =============================================================
    // BACK BUTTON
    // =============================================================

    @Override
    public void onBackPressed() {

        if (webView.canGoBack()) {

            webView.goBack();

        } else {

            super.onBackPressed();
        }
    }
}
