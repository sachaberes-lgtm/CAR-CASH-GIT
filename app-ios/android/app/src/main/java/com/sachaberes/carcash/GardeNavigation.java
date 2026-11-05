package com.sachaberes.carcash;

import android.net.Uri;
import com.getcapacitor.Logger;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* CASH CAR — la garde de navigation (le pendant de GardeNavigation dans JeuViewController.swift).
   Toute page qui n'est pas celle de l'app (http, https d'un autre site, mailto, tel, market://…) est refusée, au lieu
   d'ouvrir Chrome ou une autre app. Seuls le jeu (https://localhost) et les adresses internes du moteur web passent.
   Elle porte aussi enArriere() : le bouton RETOUR d'Android quand le jeu n'a plus rien à refermer (voir natif.js). */
@CapacitorPlugin(name = "GardeNavigation")
public class GardeNavigation extends Plugin {

    @Override
    public Boolean shouldOverrideLoad(Uri url) {
        String schema = url.getScheme() == null ? "" : url.getScheme().toLowerCase();
        switch (schema) {
            case "about":
            case "blob":
            case "data":
                return null; // le moteur web lui-même : Capacitor décide comme d'habitude
            case "http":
            case "https":
                if (getBridge().getHost().equalsIgnoreCase(url.getHost())) return null; // le jeu
                break;
            default:
                break;
        }
        Logger.info("CashCar", "[natif] navigation bloquée (on reste dans l'app) : " + url);
        return true;
    }

    @PluginMethod
    public void enArriere(PluginCall call) {
        getActivity().runOnUiThread(() -> getActivity().moveTaskToBack(true));
        call.resolve();
    }
}
