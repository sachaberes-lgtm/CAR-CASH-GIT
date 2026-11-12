import UIKit
import AVFoundation
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = JeuViewController() // CASH CAR : le contrôleur du jeu plein écran (JeuViewController.swift)
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // (2026-11-12, SON-CYCLE) LE CYCLE DE VIE VIT ICI. Avec un manifeste de scènes (Info.plist), UIKit n'appelle plus applicationWillResignActive / DidEnterBackground /
    // WillEnterForeground / DidBecomeActive de l'AppDelegate (relacheSessionAudio et reprendSessionAudio n'ont jamais tourné) : seules les méthodes de la scène arrivent.
    // `ccInactif` : l'app perd le premier plan (geste d'accueil, verrouillage, centre de contrôle ou de notifications, appel, Siri, sélecteur d'apps). La page y ouvre la PAUSE
    // en course (mobile-tactile.js, iosPose) et fait un fondu du son (natif.js 4 ter). `ccActif` : de retour — la page relance son contexte audio (natif.js, 4 essais).
    private var etaitDerriere = false

    private func dis(_ nom: String) {
        guard let vue = (window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView else { return }
        vue.evaluateJavaScript("window.dispatchEvent(new Event('\(nom)'));", completionHandler: nil)
    }

    func sceneWillResignActive(_ scene: UIScene) { dis("ccInactif") }

    func sceneDidEnterBackground(_ scene: UIScene) { etaitDerriere = true }

    func sceneDidBecomeActive(_ scene: UIScene) {
        if etaitDerriere {
            etaitDerriere = false
            // la session audio d'abord (sans changer de catégorie : c'est WebKit qui la choisit), puis la page : son resume() ne se fait plus refuser (« Failed to start the audio device »)
            try? AVAudioSession.sharedInstance().setActive(true)
        }
        dis("ccActif")
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
