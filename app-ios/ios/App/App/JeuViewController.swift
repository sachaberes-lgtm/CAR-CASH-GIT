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

        // Le son sort par les haut-parleurs, jamais par l'écouteur du haut (voir GardeHautParleur).
        GardeHautParleur.partage.demarre()

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
        #if DEBUG
        // (2026-11-07, passe 3) BUILDS DE DEV SEULEMENT : la page est inspectable (Safari › Développement, ou pymobiledevice3 webinspector) — jamais dans une édition Release/App Store.
        if #available(iOS 16.4, *) { webView?.isInspectable = true }
        #endif
    }

    // L'INDICATEUR D'ACCUEIL QUI S'EFFACE (2026-11-05, Opus : jury IOS-21) : le bloc SystemBars de capacitor.config.json n'a aucun
    // module installé (inerte) ; c'est ce contrôleur qui le demande à iOS. Il revient au premier toucher du bas de l'écran (règle d'iOS).
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        SerpentVue.partage.montre(sur: view.window) // dès que l'écran existe : le serpent tourne pendant que la page lit son script
    }

    override var prefersHomeIndicatorAutoHidden: Bool { true }
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

    func demarre() {
        guard !lance else { return }
        lance = true
        let centre = NotificationCenter.default
        let s = AVAudioSession.sharedInstance()
        centre.addObserver(forName: AVAudioSession.routeChangeNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
        centre.addObserver(forName: AVAudioSession.interruptionNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
        centre.addObserver(forName: AVAudioSession.mediaServicesWereResetNotification, object: s, queue: .main) { [weak self] _ in self?.verifie() }
        centre.addObserver(forName: UIApplication.didBecomeActiveNotification, object: nil, queue: .main) { [weak self] _ in self?.verifie() }
        verifie()
        // WebKit change la catégorie sans toujours changer de sortie : un coup d'œil de plus toutes les 2 s (lire la sortie ne coûte rien).
        Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.verifie() }
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
    ]

    @objc func fondu(_ call: CAPPluginCall) {
        let d = call.getDouble("duree") ?? 0.5
        DispatchQueue.main.async { SerpentVue.partage.fondu(d); call.resolve() }
    }

    @objc func retire(_ call: CAPPluginCall) {
        DispatchQueue.main.async { SerpentVue.partage.retire(); call.resolve() }
    }
}
