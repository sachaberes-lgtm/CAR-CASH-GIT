package com.sachaberes.carcash;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/* CASH CAR — l'activité de l'app Android (2026-11-05, Sacha : « mettre le jeu sur le Google Play Store »).
   Le pendant de JeuViewController.swift côté iPhone :
   · la garde des liens (GardeNavigation) : rien ne sort de l'app ;
   · le plein écran : barres du système cachées (SystemBars.hidden dans capacitor.config.json), remises cachées à chaque
     retour dans l'app ; un glissement depuis le bord les montre un instant, sans quitter le jeu ; l'encoche est utilisée,
     la page lit ses marges (env(safe-area-inset-*)) ;
   · ni rebond ni lueur au bord de la page ;
   · le bouton RETOUR d'Android : c'est le jeu qui décide (natif.js, window.ccRetour = la touche Échap du jeu : pause en
     course, retour dans les menus). S'il n'y a plus rien à refermer, l'app passe en arrière-plan, comme partout sur Android. */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(GardeNavigation.class); // avant super.onCreate : le pont Capacitor naît dedans
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = getWindow().getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(lp);
        }
        pleinEcran();

        WebView vue = bridge != null ? bridge.getWebView() : null;
        if (vue != null) vue.setOverScrollMode(View.OVER_SCROLL_NEVER);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                WebView v = bridge != null ? bridge.getWebView() : null;
                if (v == null) { moveTaskToBack(true); return; }
                /* « 1 » : le jeu a pris le RETOUR (il rappellera GardeNavigation.enArriere s'il n'y avait rien à refermer).
                   Autre chose : le jeu n'est pas encore là, on passe en arrière-plan. */
                v.evaluateJavascript("(window.ccRetour?window.ccRetour():0)+''", valeur -> {
                    if (valeur == null || !valeur.contains("1")) moveTaskToBack(true);
                });
            }
        });
    }

    @Override
    public void onWindowFocusChanged(boolean focus) {
        super.onWindowFocusChanged(focus);
        if (focus) pleinEcran(); // retour d'arrière-plan, fin d'un appel, volet des notifications refermé
    }

    private void pleinEcran() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
        c.hide(WindowInsetsCompat.Type.systemBars());
    }
}
