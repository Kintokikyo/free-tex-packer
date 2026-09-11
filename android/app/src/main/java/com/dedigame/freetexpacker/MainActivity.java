package com.dedigame.freetexpacker;

import android.app.Activity;
import android.os.Bundle;
import android.net.Uri;
import android.content.Intent;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewAssetLoader;

public class MainActivity extends Activity {

    private WebView webView;

    private ValueCallback<Uri[]> filePathCallback;

    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // WebViewAssetLoader
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

        // File picker untuk <input type="file">
        webView.setWebChromeClient(new WebChromeClient() {

            @Override
            public boolean onShowFileChooser(
                    WebView webView,
                    ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams
            ) {

                // Batalkan callback sebelumnya jika masih ada
                if (MainActivity.this.filePathCallback != null) {
                    MainActivity.this.filePathCallback.onReceiveValue(null);
                }

                MainActivity.this.filePathCallback = filePathCallback;

                try {
                    Intent intent = fileChooserParams.createIntent();

                    startActivityForResult(
                            intent,
                            FILE_CHOOSER_REQUEST_CODE
                    );

                } catch (Exception e) {

                    MainActivity.this.filePathCallback = null;

                    return false;
                }

                return true;
            }
        });

        webView.loadUrl(
                "https://appassets.androidplatform.net/assets/web/index.html"
        );
    }

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

    @Override
    public void onBackPressed() {

        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
