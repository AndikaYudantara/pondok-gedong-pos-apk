package com.pondokgedong.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.pondokgedong.app.printer.PrinterPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        registerPlugin(PrinterPlugin.class);
    }
}