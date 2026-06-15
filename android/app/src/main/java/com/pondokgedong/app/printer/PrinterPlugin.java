package com.pondokgedong.app.printer;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;

import com.getcapacitor.*;

import org.json.JSONArray;

@CapacitorPlugin(name = "Printer")
public class PrinterPlugin extends Plugin {

    @PluginMethod
    public void getPairedDevices(PluginCall call) {

        BluetoothAdapter adapter =
                BluetoothAdapter.getDefaultAdapter();

        JSONArray devices = new JSONArray();

        try {

            for (BluetoothDevice device :
                    adapter.getBondedDevices()) {

                JSObject obj = new JSObject();

                obj.put("name", device.getName());
                obj.put("address", device.getAddress());

                devices.put(obj);
            }

            JSObject ret = new JSObject();
            ret.put("devices", devices);

            call.resolve(ret);

        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }
}