import UIKit
import WebKit
import Capacitor

/// CAR CASH — le contrôleur de l'app (posé par SceneDelegate à la place de CAPBridgeViewController).
/// Le jeu web occupe tout l'écran : barre d'état cachée (Info.plist UIStatusBarHidden + les plugins StatusBar et SystemBars),
/// indicateur d'accueil qui s'efface (SystemBars), gestes du bord de l'écran différés (les pouces jouent près des bords :
/// le volant en bas à gauche, la NITRO en bas à droite), ni défilement, ni rebond, ni zoom.
class JeuViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        // Aucun lien ne sort de l'app (le jeu n'en a pas : c'est la garantie).
        bridge?.registerPluginInstance(GardeNavigation())

        if let defile = webView?.scrollView {
            defile.isScrollEnabled = false
            defile.bounces = false
            defile.alwaysBounceVertical = false
            defile.alwaysBounceHorizontal = false
            defile.minimumZoomScale = 1
            defile.maximumZoomScale = 1
            defile.pinchGestureRecognizer?.isEnabled = false
            defile.contentInsetAdjustmentBehavior = .never // les marges de l'encoche, c'est la page qui les lit (env(safe-area-inset-*))
        }
    }

    // L'indicateur d'accueil qui s'efface : réglé par capacitor.config.json (SystemBars.hidden, intégré à Capacitor 8).
    override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge { .all }
}

/// La garde de navigation : toute page qui n'est pas celle de l'app (http, https, mailto, tel, App Store…)
/// est refusée, au lieu d'ouvrir Safari ou une autre app. Seuls le jeu (capacitor://localhost) et les
/// adresses internes du moteur web (about:, blob:, data:) passent.
@objc(GardeNavigation)
class GardeNavigation: CAPPlugin, CAPBridgedPlugin {
    let identifier = "GardeNavigation"
    let jsName = "GardeNavigation"
    let pluginMethods: [CAPPluginMethod] = []

    override func shouldOverrideLoad(_ navigationAction: WKNavigationAction) -> NSNumber? {
        guard let url = navigationAction.request.url else { return nil }
        switch (url.scheme ?? "").lowercased() {
        case "capacitor", "about", "blob", "data":
            return nil // le jeu lui-même : Capacitor décide comme d'habitude
        default:
            CAPLog.print("⚡️  [natif] navigation bloquée (on reste dans l'app) : \(url.absoluteString)")
            return true
        }
    }
}
