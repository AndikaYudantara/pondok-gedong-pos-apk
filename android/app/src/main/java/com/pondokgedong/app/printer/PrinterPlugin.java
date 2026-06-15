package com.pondokgedong.app.printer;

import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;

import android.bluetooth.BluetoothSocket;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.dantsu.escposprinter.textparser.PrinterTextParserImg;
import com.getcapacitor.*;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import com.pondokgedong.app.R;

import android.graphics.Canvas;
import android.graphics.Color;
import android.os.Build;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import java.io.ByteArrayOutputStream;

import org.json.JSONArray;

@CapacitorPlugin(
        name = "Printer",
        permissions = {
                @Permission(
                        alias = "bluetooth",
                        strings = {
                                Manifest.permission.BLUETOOTH_CONNECT,
                                Manifest.permission.BLUETOOTH_SCAN
                        }
                )
        }
)
public class PrinterPlugin extends Plugin {

    private BluetoothSocket socket;
    private OutputStream outputStream;


    @PluginMethod
    public void getPairedDevices(PluginCall call) {
        if (hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "getPairedDevicesCallback");
            return;
        }
        loadPairedDevices(call);
    }

    @PermissionCallback
    private void getPairedDevicesCallback(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            loadPairedDevices(call);
        } else {
            call.reject("Bluetooth permission was denied");
        }
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (hasBluetoothPermission()) {
            requestPermissionForAlias("bluetooth", call, "connectCallback");
            return;
        }
        executeConnect(call);
    }

    @PermissionCallback
    private void connectCallback(PluginCall call) {
        if (getPermissionState("bluetooth") == PermissionState.GRANTED) {
            executeConnect(call);
        } else {
            call.reject("Bluetooth permission was denied");
        }
    }

    private boolean hasBluetoothPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            return getPermissionState("bluetooth") != PermissionState.GRANTED;
        }
        return true;
    }

    private void executeConnect(PluginCall call) {
        String macAddress = call.getString("macAddress");

        if (macAddress == null) {
            call.reject("MAC address required");
            return;
        }

        try {
            BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();

            if (adapter == null) {
                call.reject("Bluetooth not supported");
                return;
            }

            BluetoothDevice device = adapter.getRemoteDevice(macAddress);

            UUID uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

            if (socket != null) {
                try {
                    socket.close();
                } catch (Exception ignored) {
                }

                socket = null;
                outputStream = null;
            }

            adapter.cancelDiscovery();

            socket = device.createRfcommSocketToServiceRecord(uuid);

            socket.connect();

            outputStream = socket.getOutputStream();

            JSObject ret = new JSObject();
            ret.put("connected", true);

            call.resolve(ret);
        } catch (SecurityException e) {
            call.reject("Bluetooth permission required: " + e.getMessage());
        } catch (Exception e) {
            call.reject("Connect failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void printTest(PluginCall call) {

        try {

            if (outputStream == null) {
                call.reject("Printer not connected");
                return;
            }

            String text =
                    """
                            
                            ================
                               TEST PRINT
                            ================
                            HELLO WORLD
                            
                            
                            
                            """;

            outputStream.write(
                    text.getBytes()
            );

            outputStream.flush();

            call.resolve();

        } catch (Exception e) {

            call.reject(
                    "Print failed: " + e.getMessage()
            );
        }
    }



    @PluginMethod
    public void printReceipt(PluginCall call) {


        String text = call.getString("text");

        if (text == null) {
            call.reject("Text required");
            return;
        }

        try {

            if (outputStream == null) {
                call.reject("Printer not connected");
                return;
            }

            Bitmap logo =
                    BitmapFactory.decodeResource(
                            getContext().getResources(),
                            R.drawable.logo_print_full
                    );



            int targetWidth = 360;

            int targetHeight =
                    logo.getHeight() *
                            targetWidth /
                            logo.getWidth();

            logo = Bitmap.createScaledBitmap(
                    logo,
                    targetWidth,
                    targetHeight,
                    true
            );

            int printerWidth = 380; // typical 58mm printer

            Bitmap centeredBitmap =
                    Bitmap.createBitmap(
                            printerWidth,
                            logo.getHeight(),
                            Bitmap.Config.ARGB_8888
                    );

            Canvas canvas =
                    new Canvas(centeredBitmap);

            canvas.drawColor(Color.WHITE);

            int left =
                    (printerWidth - logo.getWidth()) / 2;

            canvas.drawBitmap(
                    logo,
                    left,
                    0,
                    null
            );


            byte[] imageBytes =
                    decodeBitmap(centeredBitmap);

            outputStream.write(imageBytes);

            outputStream.write(text.getBytes(StandardCharsets.UTF_8));

            outputStream.write("\n".getBytes());

            outputStream.flush();

            call.resolve();

        } catch (Exception e) {

            call.reject(
                    "Print failed: " + e.getMessage()
            );
        }
    }

    @PluginMethod
    public void isConnected(PluginCall call) {

        JSObject ret = new JSObject();

        ret.put(
                "connected",
                socket != null &&
                        socket.isConnected()
        );

        call.resolve(ret);
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        try {
            if (outputStream != null) {
                outputStream.close();
            }

            if (socket != null) {
                socket.close();
            }

            outputStream = null;
            socket = null;

            call.resolve();
        } catch (Exception e) {
            call.reject("Disconnect failed: " + e.getMessage());
        }
    }

    private void loadPairedDevices(PluginCall call) {
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();

        if (adapter == null) {
            call.reject("Bluetooth adapter not available");
            return;
        }

        JSONArray devices = new JSONArray();

        try {
            for (BluetoothDevice device : adapter.getBondedDevices()) {
                JSObject obj = new JSObject();
                obj.put("name", device.getName());
                obj.put("address", device.getAddress());
                devices.put(obj);
            }

            JSObject ret = new JSObject();
            ret.put("devices", devices);
            call.resolve(ret);
        } catch (SecurityException e) {
            call.reject("Bluetooth permission required: " + e.getMessage());
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    private byte[] decodeBitmap(Bitmap bmp) {

        int width = bmp.getWidth();
        int height = bmp.getHeight();

        ByteArrayOutputStream baos =
                new ByteArrayOutputStream();

        baos.write(0x1D);
        baos.write(0x76);
        baos.write(0x30);
        baos.write(0x00);

        int widthBytes = (width + 7) / 8;

        baos.write(widthBytes & 0xFF);
        baos.write((widthBytes >> 8) & 0xFF);

        baos.write(height & 0xFF);
        baos.write((height >> 8) & 0xFF);

        for (int y = 0; y < height; y++) {

            for (int x = 0; x < widthBytes; x++) {

                int slice = 0;

                for (int bit = 0; bit < 8; bit++) {

                    int px = x * 8 + bit;

                    if (px < width) {

                        int pixel =
                                bmp.getPixel(px, y);

                        int r = (pixel >> 16) & 0xff;
                        int g = (pixel >> 8) & 0xff;
                        int b = pixel & 0xff;

                        int gray =
                                (r + g + b) / 3;

                        if (gray < 128) {
                            slice |= (1 << (7 - bit));
                        }
                    }
                }

                baos.write(slice);
            }
        }

        return baos.toByteArray();
    }
}