import UIKit
import WebKit
import Capacitor

/// CASH CAR — le contrôleur de l'app (posé par SceneDelegate à la place de CAPBridgeViewController).
/// Le jeu web occupe tout l'écran : barre d'état cachée (Info.plist UIStatusBarHidden + les plugins StatusBar et SystemBars),
/// indicateur d'accueil qui s'efface (SystemBars), gestes du bord de l'écran différés (les pouces jouent près des bords :
/// le volant en bas à gauche, la NITRO en bas à droite), ni défilement, ni rebond, ni zoom.
class JeuViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        // Aucun lien ne sort de l'app (le jeu n'en a pas : c'est la garantie).
        bridge?.registerPluginInstance(GardeNavigation())
        // L'écran reste allumé pendant qu'on joue (natif.js, partie 8).
        bridge?.registerPluginInstance(Eveil())

        // Le modèle exact de l'iPhone, dit au jeu AVANT son premier script (la page n'est chargée qu'après, dans viewDidLoad).
        let modele = JeuViewController.modele()
        let palier = (JeuViewController.bancPalier ?? JeuViewController.palier(modele)).map(String.init) ?? "null"
        webView?.configuration.userContentController.addUserScript(WKUserScript(
            source: "window.__ccAppareil={modele:'\(modele)',palier:\(palier),banc:\(JeuViewController.banc),carte:'\(JeuViewController.bancCarte)',"
                + "dissection:\(JeuViewController.banc && ProcessInfo.processInfo.arguments.contains("-ccDissection")),ab:'\(JeuViewController.bancAB)'};",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))

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

    /// LE BANC DE MESURE SUR LE VRAI IPHONE (2026-10-14, Sacha : « ultra saccadé quand on va vite »). Lancée avec l'argument `-ccBanc`
    /// (`xcrun devicectl device process launch --console --device <id> com.sachaberes.carcash -ccBanc`, build Debug pour lire la
    /// console), l'app joue une course toute seule et écrit ses mesures (natif.js, partie 9). Son stockage web est alors JETABLE : la
    /// vraie sauvegarde est lue (Preferences) mais jamais écrite. Sans l'argument (toujours, pour un joueur) : rien ne change.
    static let banc = ProcessInfo.processInfo.arguments.contains("-ccBanc")
    /// `-ccCarte volcan` (avec -ccBanc) : la carte de la course mesurée (lettres seules, sinon ignorée).
    static let bancCarte: String = {
        let a = ProcessInfo.processInfo.arguments
        guard banc, let i = a.firstIndex(of: "-ccCarte"), i + 1 < a.count, a[i + 1].allSatisfy({ $0.isLetter }) else { return "" }
        return a[i + 1]
    }()
    /// `-ccAB filtres` (avec -ccBanc) : un A/B toutes les 5 s (natif.js, partie 9) — ici, les filtres CSS du HUD coupés ou non.
    static let bancAB: String = {
        let a = ProcessInfo.processInfo.arguments
        guard banc, let i = a.firstIndex(of: "-ccAB"), i + 1 < a.count, a[i + 1].allSatisfy({ $0.isLetter }) else { return "" }
        return a[i + 1]
    }()
    /// `-ccPalier 1` (avec -ccBanc) : mesurer un autre palier que celui du modèle.
    static let bancPalier: Int? = {
        let a = ProcessInfo.processInfo.arguments
        guard banc, let i = a.firstIndex(of: "-ccPalier"), i + 1 < a.count, let n = Int(a[i + 1]), (0...2).contains(n) else { return nil }
        return n
    }()

    override func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let config = super.webViewConfiguration(for: instanceConfiguration)
        if JeuViewController.banc { config.websiteDataStore = .nonPersistent() }
        return config
    }

    /// LE PALIER DE L'APPAREIL, SANS DEVINER (2026-10-14, passe « iPhone au max »). Le jeu choisit son palier graphique (PAL : 0 ancien ·
    /// 1 moyen · 2 récent) avec un petit banc du processeur, retenu 7 jours : couru téléphone chaud ou en mode économie d'énergie, il
    /// classait un iPhone récent « ancien » pour une semaine. L'app, elle, connaît la puce : iPhone8,x à iPhone10,x (6s, SE 1, 7, 8, X :
    /// A9 à A11) → 0 ; iPhone11,x et iPhone12,x (XS, XR, 11, SE 2 : A12, A13) → 1 ; iPhone13,x et après (12 et plus récents, SE 3
    /// compris) → 2. Hors iPhone (iPad en mode compatibilité) : nil, le banc du jeu décide. preparer-www.js branche `__ccAppareil`
    /// dans PAL après `?palier` et « appris en course » : la mesure réelle en course prime toujours.
    static func modele() -> String {
        if let simule = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] { return simule }
        var u = utsname()
        uname(&u)
        return withUnsafeBytes(of: &u.machine) { String(decoding: $0.prefix(while: { $0 != 0 }), as: UTF8.self) }
    }

    static func palier(_ modele: String) -> Int? {
        guard modele.hasPrefix("iPhone"), let n = Int(modele.dropFirst(6).prefix(while: { $0.isNumber })) else { return nil }
        return n <= 10 ? 0 : n <= 12 ? 1 : 2
    }
}

/// L'ÉCRAN RESTE ALLUMÉ PENDANT QU'ON JOUE (2026-10-14, passe « iPhone au max ») : un pouce posé sans bouger sur le volant ou la NITRO
/// n'envoie plus aucun toucher à iOS — avec le verrouillage automatique à 30 s, l'écran s'assombrissait en pleine course. natif.js
/// (partie 8) coupe la mise en veille au premier toucher et la rend à iOS après 3 minutes sans toucher.
@objc(Eveil)
class Eveil: CAPPlugin, CAPBridgedPlugin {
    let identifier = "Eveil"
    let jsName = "Eveil"
    let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "garde", returnType: CAPPluginReturnPromise),
                                            CAPPluginMethod(name: "etat", returnType: CAPPluginReturnPromise)]

    @objc func garde(_ call: CAPPluginCall) {
        let allume = call.getBool("on") ?? false
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = allume
            call.resolve()
        }
    }

    /// LE GOUVERNEUR THERMIQUE (2026-10-15, mesuré sur l'iPhone 13 Pro de Sacha : « ultra saccadé quand on va vite »). L'état thermique
    /// d'iOS (0 normal · 1 tiède · 2 chaud : iOS bride la puce · 3 critique) et le mode économie d'énergie : `etat()` à la demande, et
    /// l'événement « thermique » à chaque changement — natif.js (partie 10) cale alors le jeu à 30 images/s stables.
    private var observe = false

    override public func load() {
        guard !observe else { return }
        observe = true
        for nom in [ProcessInfo.thermalStateDidChangeNotification, Notification.Name.NSProcessInfoPowerStateDidChange] {
            NotificationCenter.default.addObserver(forName: nom, object: nil, queue: .main) { [weak self] _ in
                self?.notifyListeners("thermique", data: Eveil.mesure())
            }
        }
    }

    static func mesure() -> [String: Any] {
        ["thermique": ProcessInfo.processInfo.thermalState.rawValue, "eco": ProcessInfo.processInfo.isLowPowerModeEnabled]
    }

    @objc func etat(_ call: CAPPluginCall) {
        call.resolve(Eveil.mesure())
    }
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
