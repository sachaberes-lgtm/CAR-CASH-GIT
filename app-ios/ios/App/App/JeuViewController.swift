import UIKit
import WebKit
import Capacitor
import AVFoundation

/// CASH CAR — le contrôleur de l'app (posé par SceneDelegate à la place de CAPBridgeViewController).
/// Le jeu web occupe tout l'écran : barre d'état cachée (Info.plist UIStatusBarHidden + les plugins StatusBar et SystemBars),
/// indicateur d'accueil qui s'efface (SystemBars), gestes du bord de l'écran différés (les pouces jouent près des bords :
/// le volant en bas à gauche, la NITRO en bas à droite), ni défilement, ni rebond, ni zoom.
class JeuViewController: CAPBridgeViewController {

    override func capacitorDidLoad() {
        // Aucun lien ne sort de l'app (le jeu n'en a pas : c'est la garantie).
        bridge?.registerPluginInstance(GardeNavigation())
        bridge?.registerPluginInstance(SerpentNatif()) // le serpent de chargement, dessiné par iOS (voir SerpentNatif)

        // Les achats intégrés (StoreKit 2) : le plugin « Achats » que natif/achats.js appelle (voir Achats.swift).
        bridge?.registerPluginInstance(Achats())

        // Le son sort par les haut-parleurs, jamais par l'écouteur du haut (voir GardeHautParleur).
        GardeHautParleur.partage.demarre(bridge?.webView)

        // L'état thermique réel du téléphone, dit au jeu (voir GardeThermique).
        GardeThermique.partage.demarre(bridge?.webView)

        // La vue web morte et jamais relancée (voir GardeVue).
        GardeVue.partage.demarre(bridge?.webView)

        if let defile = webView?.scrollView {
            defile.isScrollEnabled = false
            defile.bounces = false
            defile.alwaysBounceVertical = false
            defile.alwaysBounceHorizontal = false
            defile.minimumZoomScale = 1
            defile.maximumZoomScale = 1
            defile.pinchGestureRecognizer?.isEnabled = false
            defile.contentInsetAdjustmentBehavior = .never // les marges de l'encoche, c'est la page qui les lit (env(safe-area-inset-*))

            defile.backgroundColor = .black
            defile.showsVerticalScrollIndicator = false
            defile.showsHorizontalScrollIndicator = false
        }
        // UNE VUE WEB OPAQUE (2026-11-08, Perf 3 / P4) : une WKWebView transparente oblige le compositeur à mélanger toute la page avec ce qu'il y a
        // derrière à chaque image. Capacitor la rend transparente (isOpaque=false) pendant le premier chargement puis remet l'état d'avant (WebViewDelegationHandler) :
        // on la pose opaque dès le départ, noire dessous (elle ne montre jamais autre chose que le jeu), et on le réaffirme une fois le jeu chargé.
        if let vue = webView {
            vue.isOpaque = true
            vue.backgroundColor = .black
            vue.underPageBackgroundColor = .black
            view.backgroundColor = .black
            DispatchQueue.main.asyncAfter(deadline: .now() + 6) { [weak vue] in
                guard let vue = vue else { return }
                if !vue.isOpaque { CAPLog.print("⚡️  [natif] vue web redevenue transparente, remise opaque") }
                vue.isOpaque = true
            }
        }
        #if DEBUG
        // (2026-11-07, passe 3) BUILDS DE DEV SEULEMENT : la page est inspectable (Safari › Développement, ou pymobiledevice3 webinspector) — jamais dans une édition Release/App Store.
        if #available(iOS 16.4, *) { webView?.isInspectable = true }
        #endif
    }

    // L'INDICATEUR D'ACCUEIL QUI S'EFFACE (2026-11-05, Opus : jury IOS-21 ; corrigé le 2026-11-08) : sous Capacitor 8 le plugin SystemBars est
    // intégré (le bloc SystemBars de capacitor.config.json, `hidden: true`, est lu) et il déclare lui-même `prefersHomeIndicatorAutoHidden`
    // sur CAPBridgeViewController (public, pas `open`) : la redéfinir ici ne COMPILE plus avec Capacitor 8.5.3. On ne la redéfinit donc pas.
    // À vérifier sur l'appareil : l'indicateur doit rester effacé (il revient au premier toucher du bas de l'écran, règle d'iOS).
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        SerpentVue.partage.montre(sur: view.window) // dès que l'écran existe : le serpent tourne pendant que la page lit son script
    }
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

/// LA GARDE DES HAUT-PARLEURS (2026-11-05, Léo : « dans l'app le son ne sort que du haut du téléphone, il faut que ça sorte en stéréo »).
/// Le moteur web (WebKit) règle lui-même la session audio de l'app selon ce que le jeu joue (navigator.audioSession : 'playback'
/// quand la musique joue, 'ambient' sinon, pour laisser vivre le Spotify du joueur). Il lui arrive de la passer en « lecture et
/// enregistrement » : l'iPhone envoie alors TOUT le son dans l'écouteur du haut, celui des appels — un seul côté, petit et faible.
/// La garde ne choisit pas la catégorie (le jeu garde la main sur 'ambient' / 'playback') : elle regarde seulement où sort le son,
/// au lancement, à chaque retour dans l'app, à chaque changement de sortie ou de catégorie, et si c'est l'écouteur du haut alors
/// qu'aucun casque n'est branché, elle renvoie le son vers les haut-parleurs — les deux, en stéréo. Casque, AirPods, voiture : rien ne change.
final class GardeHautParleur {
    static let partage = GardeHautParleur()
    private var lance = false
    private weak var vue: WKWebView?

    // (2026-11-12, SON-CYCLE) dit un événement à la page (window) : `ccActif` à la fin d'un appel / de Siri / d'une alarme (natif.js relance le contexte audio sans attendre un toucher),
    // `ccSortieSon` quand la sortie (Bluetooth, casque) disparaît (mobile-tactile.js : pause de la course, le son ne repart pas d'un coup dans le haut-parleur du téléphone).
    private func dit(_ nom: String) {
        vue?.evaluateJavaScript("window.dispatchEvent(new Event('\(nom)'));", completionHandler: nil)
    }

    func demarre(_ vue: WKWebView?) {
        self.vue = vue
        guard !lance else { return }
        lance = true
        let centre = NotificationCenter.default
        let s = AVAudioSession.sharedInstance()
        centre.addObserver(forName: AVAudioSession.routeChangeNotification, object: s, queue: .main) { [weak self] n in
            self?.verifie()
            if let r = n.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt,
               AVAudioSession.RouteChangeReason(rawValue: r) == .oldDeviceUnavailable { self?.dit("ccSortieSon") }
        }
        centre.addObserver(forName: AVAudioSession.interruptionNotification, object: s, queue: .main) { [weak self] n in
            self?.verifie()
            if let r = n.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt,
               AVAudioSession.InterruptionType(rawValue: r) == .ended { self?.dit("ccActif") }
        }
        centre.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
        centre.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in self?.verifie() }
        verifie()
        // WebKit change la catégorie sans toujours changer de sortie : un coup d'œil de plus toutes les 2 s (lire la sortie ne coûte rien).
        // (Perf 3 / P4) tolérance d'une seconde : iOS regroupe ce réveil avec d'autres au lieu de réveiller le processeur à heure fixe.
        let t = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.verifie() }
        t.tolerance = 1
    }

    private func verifie() {
        let s = AVAudioSession.sharedInstance()
        let sorties = s.currentRoute.outputs
        guard sorties.contains(where: { $0.portType == .builtInReceiver }) else { return }
        do {
            try s.overrideOutputAudioPort(.speaker)
            CAPLog.print("⚡️  [natif] son renvoyé de l'écouteur vers les haut-parleurs (catégorie \(s.category.rawValue))")
        } catch {
            CAPLog.print("⚡️  [natif] haut-parleurs refusés : \(error.localizedDescription)")
        }
    }
}

/// LE SERPENT DE CHARGEMENT, DESSINÉ PAR iOS (2026-11-06, Sacha : « enlève la latence du temps de chargement, le serpent doit toujours être super fluide »).
/// MESURÉ dans le simulateur iOS (WebKit/Metal, page de test, fil principal bloqué 6 s) : l'animation CSS `steps(48)` du serpent web se FIGE pendant que
/// la page calcule (WebKit la mène depuis le fil de la page, pas depuis le compositeur) ; or le chargement du jeu bloque ce fil par tranches de 0,3 à
/// 1,5 s (lecture du script, étapes de piste, garage, envois de textures). Ici le même sprite (2 496 × 52 px, 48 images de 52 px) est une animation
/// Core Animation à valeurs DISCRÈTES sur `contentsRect` : elle tourne dans le serveur de rendu d'iOS, hors du processus de la page, donc fluide quoi que
/// fasse le jeu. Même place que le serpent web (centré à 46 % de la hauteur, 104 pt), pixels nets (filtre « nearest »). La page cache son propre
/// serpent quand ce plugin existe (`#spCharge`, debut-corps.html) et l'éteint en fondu au moment où la boule de l'intro commence (`SerpentNatif.fondu`,
/// intro-161.js chCl) ; filet : retiré seul au bout de 45 s, ou par `SerpentNatif.retire` (natif.js, cc:revele).
final class SerpentVue {
    static let partage = SerpentVue()
    private var vue: UIView?
    private var calque: CALayer?
    private var filet: DispatchWorkItem?
    private var fini = false
    private var abonne = false

    func montre(sur fenetre: UIWindow?) {
        guard !fini, vue == nil, let f = fenetre, let img = UIImage(named: "SerpentNatif")?.cgImage else { return }
        let cote: CGFloat = 104
        let v = UIView(frame: CGRect(x: 0, y: 0, width: cote, height: cote))
        v.center = CGPoint(x: f.bounds.midX, y: f.bounds.height * 0.46)
        v.autoresizingMask = [.flexibleLeftMargin, .flexibleRightMargin, .flexibleTopMargin, .flexibleBottomMargin]
        v.isUserInteractionEnabled = false
        v.backgroundColor = .clear
        let c = CALayer()
        c.frame = v.bounds
        c.contents = img
        c.contentsRect = CGRect(x: 0, y: 0, width: 1.0 / 48.0, height: 1)
        c.magnificationFilter = .nearest
        c.minificationFilter = .nearest
        c.contentsScale = UIScreen.main.scale
        v.layer.addSublayer(c)
        f.addSubview(v)
        vue = v
        calque = c
        lance()
        filet = DispatchWorkItem { [weak self] in self?.retire() }
        if let w = filet { DispatchQueue.main.asyncAfter(deadline: .now() + 45, execute: w) }
        if !abonne {
            abonne = true // Core Animation vide les animations quand l'app passe en arrière-plan : on la repose au retour
            NotificationCenter.default.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in self?.lance() }
        }
    }

    private func lance() {
        guard let c = calque, c.animation(forKey: "serpent") == nil else { return }
        let a = CAKeyframeAnimation(keyPath: "contentsRect")
        a.values = (0..<48).map { NSValue(cgRect: CGRect(x: CGFloat($0) / 48.0, y: 0, width: 1.0 / 48.0, height: 1)) }
        a.calculationMode = .discrete
        a.duration = 0.8
        a.repeatCount = .infinity
        a.isRemovedOnCompletion = false
        c.add(a, forKey: "serpent")
    }

    func fondu(_ duree: TimeInterval) {
        guard let v = vue else { return }
        UIView.animate(withDuration: duree, delay: 0, options: [.curveLinear, .allowUserInteraction], animations: { v.alpha = 0 }) { [weak self] _ in self?.retire() }
    }

    /// (2026-11-09, debug iOS) LA PAGE SE RECHARGE (TOUT EFFACER, ENTRER UN CODE, RELANCER de l'écran « a calé », contexte 3D perdu, mise à jour
    /// en direct) : `fini` restait vrai pour toujours et `montre` n'est appelé qu'à viewDidAppear — tout le rechargement se passait sur un écran
    /// NOIR sans rien qui bouge (la page cache son propre serpent dès que ce plugin existe). natif.js appelle `SerpentNatif.montre` au début de
    /// chaque chargement de page : sans effet au premier lancement (le serpent est déjà là), il le repose aux suivants.
    func remontre(sur fenetre: UIWindow?) {
        guard vue == nil else { return }
        fini = false
        montre(sur: fenetre)
    }

    func retire() {
        fini = true
        filet?.cancel()
        calque?.removeAllAnimations()
        vue?.removeFromSuperview()
        vue = nil
        calque = nil
    }
}

@objc(SerpentNatif)
class SerpentNatif: CAPPlugin, CAPBridgedPlugin {
    let identifier = "SerpentNatif"
    let jsName = "SerpentNatif"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "fondu", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "retire", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "montre", returnType: CAPPluginReturnPromise),
    ]

    @objc func montre(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in SerpentVue.partage.remontre(sur: self?.bridge?.viewController?.view.window); call.resolve() }
    }

    @objc func fondu(_ call: CAPPluginCall) {
        let d = call.getDouble("duree") ?? 0.5
        DispatchQueue.main.async { SerpentVue.partage.fondu(d); call.resolve() }
    }

    @objc func retire(_ call: CAPPluginCall) {
        DispatchQueue.main.async { SerpentVue.partage.retire(); call.resolve() }
    }
}

/// L'ÉTAT THERMIQUE RÉEL, DIT AU JEU (2026-11-10, Léo : « rien n'est net, le jeu rapide a du mal à tourner fluidement »).
/// Le jeu estimait la chaleur du téléphone avec une horloge (le temps passé au menu et en course) : cinq minutes de garage suffisaient à lui
/// faire croire le téléphone brûlant, et il baissait la résolution à 0,8 pixel par point sur un iPhone froid. iOS, lui, SAIT :
/// `ProcessInfo.thermalState` (0 nominal · 1 fair · 2 serious · 3 critical). On l'envoie à la page par l'événement `cc:thermique`
/// (le jeu l'attendait : code/moteur/gouverneur-thermique.js), au lancement, à chaque changement, et rappelé toutes les 5 s — la page peut
/// se recharger, et son écoute n'existe qu'une fois le jeu chargé. Rien d'autre : aucune donnée ne sort du téléphone.
final class GardeThermique {
    static let partage = GardeThermique()
    private weak var vue: WKWebView?
    private var minuteur: Timer?
    private var enRoute = false

    func demarre(_ vue: WKWebView?) {
        self.vue = vue
        guard !enRoute else { return }
        enRoute = true
        NotificationCenter.default.addObserver(forName: ProcessInfo.thermalStateDidChangeNotification, object: nil, queue: .main) { [weak self] _ in self?.envoie() }
        /* (2026-11-12, ios-ultime vague 2) LE MODE ÉCONOMIE D'ÉNERGIE bride l'écran de la vue web à 30 images par seconde : le jeu doit le SAVOIR (window.__ccEco) pour ne pas prendre ces 33 ms pour de la lenteur. */
        NotificationCenter.default.addObserver(forName: Notification.Name.NSProcessInfoPowerStateDidChange, object: nil, queue: .main) { [weak self] _ in self?.envoie() }
        minuteur = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in self?.envoie() }
        envoie()
    }

    /// Le modèle exact de l'appareil (« iPhone14,2 » = 13 Pro), lu une fois : le jeu règle sa qualité par défaut dessus (window.__ccAppareil). Ne sort jamais du téléphone.
    static let modele: String = {
        var s = utsname(); uname(&s)
        let m = withUnsafePointer(to: &s.machine) { $0.withMemoryRebound(to: CChar.self, capacity: 1) { String(cString: $0) } }
        return m.filter { $0.isLetter || $0.isNumber || $0 == "," }
    }()

    private func envoie() {
        let n = ProcessInfo.processInfo.thermalState.rawValue
        let eco = ProcessInfo.processInfo.isLowPowerModeEnabled ? 1 : 0
        vue?.evaluateJavaScript("window.__ccAppareil='\(GardeThermique.modele)';window.__ccEco=\(eco);window.__ccThermique=\(n);window.dispatchEvent(new CustomEvent('cc:thermique',{detail:{etat:\(n)}}));", completionHandler: nil)
    }
}

/// LA VUE WEB MORTE (2026-11-12, ios-ultime : filet natif). Quand iOS tue le processus web (mémoire), Capacitor appelle `webView.reload()` tout de suite
/// (WebViewDelegationHandler.swift:164) ; si ce rechargement n'aboutit pas (la mort a frappé pendant le premier chargement : `webView.url` est nil, `reload()` ne fait rien),
/// l'écran reste noir pour toujours : aucun JS n'existe plus pour le dire. Toutes les 5 s, app au premier plan, on pose une question triviale à la page ; deux échecs de suite
/// (processus mort, ou aucune adresse) = on recharge la page de départ. Une page qui charge, ou qui répond, remet le compteur à zéro. Rien ne sort du téléphone.
final class GardeVue {
    static let partage = GardeVue()
    private weak var vue: WKWebView?
    private var minuteur: Timer?
    private var morts = 0

    func demarre(_ vue: WKWebView?) {
        self.vue = vue
        guard minuteur == nil else { return }
        let t = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in self?.sonde() }
        t.tolerance = 2
        minuteur = t
    }

    private func sonde() {
        guard let v = vue, UIApplication.shared.applicationState == .active, !v.isLoading else { morts = 0; return }
        v.evaluateJavaScript("1") { [weak self] _, erreur in
            guard let self = self else { return }
            let mort = (erreur as NSError?).map { $0.domain == WKError.errorDomain && $0.code == WKError.webContentProcessTerminated.rawValue } ?? false
            if mort || v.url == nil { self.morts += 1 } else { self.morts = 0 }
            if self.morts >= 2 {
                self.morts = 0
                CAPLog.print("⚡️  [natif] vue web morte depuis 10 s : on recharge la page de départ")
                if let u = URL(string: "capacitor://localhost/") { v.load(URLRequest(url: u)) }
            }
        }
    }
}
