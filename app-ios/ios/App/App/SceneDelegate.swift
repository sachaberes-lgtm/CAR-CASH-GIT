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

    private var derriereT: Date?

    func sceneDidEnterBackground(_ scene: UIScene) { etaitDerriere = true; derriereT = Date() }

    func sceneDidBecomeActive(_ scene: UIScene) {
        if etaitDerriere {
            etaitDerriere = false
            // la session audio d'abord (sans changer de catégorie : c'est WebKit qui la choisit), puis la page : son resume() ne se fait plus refuser (« Failed to start the audio device »)
            // (2026-11-13, Sacha : « le jeu coupe ma musique au lieu de couper son son ») L'AUTRE MUSIQUE AU RETOUR. Le joueur est sorti, a lancé sa musique, revient : la page
            // relançait son son (session « playback » de WebKit, non mélangeable) et coupait la musique du joueur. Après un VRAI passage en arrière-plan d'au moins 3 s (la page
            // s'y est tue : contexte endormi, <audio> en pause — ce qu'on lit n'est donc pas le son du jeu), si iOS dit qu'une autre app joue (les deux indices d'accord),
            // le jeu devient muet AVANT de se réveiller (`cc:autreson`, puis `ccActif`) ; la fin de l'autre musique est guettée par GardeThermique (toutes les 5 s).
            // Ce qui est lu est écrit dans la boîte noire (genre « son ») : c'est la mesure qui dira si iOS se trompe.
            let s = AVAudioSession.sharedInstance()
            let fond = derriereT.map { Date().timeIntervalSince($0) } ?? 0
            let autre = s.isOtherAudioPlaying, indice = s.secondaryAudioShouldBeSilencedHint
            /* (2026-11-13, le jeu en session « ambient ») son propre son ne lève plus l'indice : l'indice seul suffit, sans attendre 3 s d'arrière-plan */
            let muet = GardeThermique.ambiant ? indice : (fond >= 3 && autre && indice)
            if muet { GardeThermique.autreSon = true }
            if let vue = (window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView {
                let note = "retour dans l'app après \(Int(fond)) s : autre musique \(autre ? 1 : 0) · indice \(indice ? 1 : 0)" + (muet ? " → jeu muet" : "")
                var js = "try{window.__ccNote&&window.__ccNote('son',\"\(note)\");}catch(e){}"
                if muet { js += "window.__ccAutreSon=1;window.dispatchEvent(new CustomEvent('cc:autreson',{detail:{on:1}}));" }
                vue.evaluateJavaScript(js, completionHandler: nil)
            }
            if !muet { try? s.setActive(true) }
        } else if let vue = (window?.rootViewController as? CAPBridgeViewController)?.bridge?.webView {
            // (2026-11-13) retour sans passage en arrière-plan (centre de contrôle, notification) : on NOTE seulement ce qu'iOS répond — le son du jeu jouait peut-être encore
            let s = AVAudioSession.sharedInstance()
            vue.evaluateJavaScript("try{window.__ccNote&&window.__ccNote('son',\"redevenu actif sans arrière-plan : autre musique \(s.isOtherAudioPlaying ? 1 : 0) · indice \(s.secondaryAudioShouldBeSilencedHint ? 1 : 0)\");}catch(e){}", completionHandler: nil)
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
