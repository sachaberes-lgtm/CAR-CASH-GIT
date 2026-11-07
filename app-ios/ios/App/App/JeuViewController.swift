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

        // Les achats intégrés (StoreKit 2) : le plugin « Achats » que natif/achats.js appelle (voir Achats.swift).
        bridge?.registerPluginInstance(Achats())

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
    }

    // L'INDICATEUR D'ACCUEIL QUI S'EFFACE (2026-11-05, Opus : jury IOS-21) : le bloc SystemBars de capacitor.config.json n'a aucun
    // module installé (inerte) ; c'est ce contrôleur qui le demande à iOS. Il revient au premier toucher du bas de l'écran (règle d'iOS).
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
