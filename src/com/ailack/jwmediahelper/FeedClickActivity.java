package com.ailack.jwmediahelper;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;

import org.apache.cordova.Config;
import org.apache.cordova.DroidGap;

/**
 * Created by CHOISH on 13. 5. 18.
 */
public class FeedClickActivity extends DroidGap {
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        super.loadUrl("file:///android_asset/www/feedClick.html");
    }
}