import Foundation
import Capacitor
import StoreKit

/// CASH CAR — LES ACHATS INTÉGRÉS (2026-11-07, Sacha : « les achats en vrai argent, via StoreKit »).
/// Le plugin « Achats » (StoreKit 2) que le pont app-ios/natif/achats.js appelle (window.ccAchat). Tout est NON CONSOMMABLE :
/// une caisse ou une peinture achetée est à toi pour toujours, et l'App Store s'en souvient (possedes / restaurer).
/// LA RÈGLE : rien n'est jamais donné sans une transaction VÉRIFIÉE par StoreKit (signature d'Apple). Une transaction non vérifiée,
/// un produit inconnu ou une erreur de StoreKit = l'appel est REJETÉ, le jeu ne donne rien.
/// Le contrat avec achats.js :
///   produits({ids})  → {produits:[{id, prix, devise}]}   (prix affiché localisé par Apple ; un produit qu'Apple ne connaît pas est absent)
///   acheter({id})    → {etat:'ok'|'annule'|'attente'}    (un seul achat à la fois : un second pendant le premier est rejeté)
///   possedes()       → {ids:[…]}                          (les droits en cours : vérifiés, non remboursés)
///   restaurer()      → {ids:[…]}                          (AppStore.sync() puis possedes)
///   événement « achatRecu » {id} : une transaction vérifiée arrivée hors d'un acheter() (demande d'achat approuvée plus tard par un
///   parent, achat fait sur un autre appareil, achat resté inachevé au lancement précédent).
/// transaction.finish() n'est appelé qu'APRÈS avoir répondu au jeu (ou émis l'événement) : si l'app meurt entre les deux, StoreKit
/// la redonne au prochain lancement par Transaction.updates, et le jeu (dont les cadeaux sont idempotents) la reçoit alors.
@objc(Achats)
class Achats: CAPPlugin, CAPBridgedPlugin {
    let identifier = "Achats"
    let jsName = "Achats"
    let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "produits", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "acheter", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "possedes", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restaurer", returnType: CAPPluginReturnPromise)
    ]

    private let registre = RegistreAchats()
    private var ecoute: Task<Void, Never>?

    /// Au chargement du plugin : on écoute Transaction.updates pendant toute la vie de l'app (Apple le demande dès le lancement,
    /// sinon un achat approuvé hors de l'app ou resté inachevé n'est jamais livré).
    override func load() {
        ecoute = Task.detached { [weak self] in
            for await resultat in Transaction.updates {
                guard let self = self else { return }
                await self.recoit(resultat)
            }
        }
    }

    deinit { ecoute?.cancel() }

    // MARK: - produits

    @objc func produits(_ call: CAPPluginCall) {
        let ids = (call.getArray("ids", String.self) ?? []).filter { !$0.isEmpty }
        Task {
            do {
                let liste = ids.isEmpty ? [] : try await Product.products(for: Set(ids))
                let sortie: [[String: Any]] = liste.map { p in
                    ["id": p.id, "prix": p.displayPrice, "devise": p.priceFormatStyle.currencyCode]
                }
                call.resolve(["produits": sortie])
            } catch {
                call.reject("produits indisponibles : \(error.localizedDescription)", nil, error)
            }
        }
    }

    // MARK: - acheter

    @objc func acheter(_ call: CAPPluginCall) {
        guard let id = call.getString("id"), !id.isEmpty else {
            call.reject("acheter : id manquant")
            return
        }
        Task {
            guard await registre.prend(id) else {
                call.reject("un achat est déjà en cours", "indisponible")
                return
            }
            await achete(id, call)
            // l'achat est fini (quelle que soit l'issue) : les transactions de ce produit arrivées pendant le vol sont rejouées
            for t in await registre.relache() {
                await livre(t)
            }
        }
    }

    private func achete(_ id: String, _ call: CAPPluginCall) async {
        do {
            guard let produit = try await Product.products(for: [id]).first(where: { $0.id == id }) else {
                call.reject("produit inconnu de l'App Store : \(id)")
                return
            }
            let resultat = try await produit.purchase()
            switch resultat {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    guard transaction.productID == id, transaction.revocationDate == nil else {
                        call.reject("transaction inattendue pour \(id)")
                        return
                    }
                    await registre.tient(transaction.id) // Transaction.updates ne la rejouera pas en « achatRecu »
                    call.resolve(["etat": "ok"])         // d'abord le jeu donne…
                    await transaction.finish()           // …ensuite seulement on dit à Apple que c'est livré
                case .unverified(_, let erreur):
                    // signature invalide : on ne donne rien et on ne la termine pas (elle n'est pas « livrée »)
                    CAPLog.print("⚡️  [natif] achat NON VÉRIFIÉ refusé (\(id)) : \(erreur.localizedDescription)")
                    call.reject("achat non vérifié : \(erreur.localizedDescription)")
                }
            case .userCancelled:
                call.resolve(["etat": "annule"])
            case .pending:
                // demande d'achat (contrôle parental) ou action demandée par la banque : l'issue viendra par Transaction.updates
                call.resolve(["etat": "attente"])
            @unknown default:
                call.reject("résultat d'achat inconnu")
            }
        } catch {
            call.reject("achat impossible : \(error.localizedDescription)", nil, error)
        }
    }

    // MARK: - possedes / restaurer

    @objc func possedes(_ call: CAPPluginCall) {
        Task {
            call.resolve(["ids": await Achats.droits()])
        }
    }

    @objc func restaurer(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync() // peut demander l'identifiant Apple : c'est le bouton RESTAURER, le joueur l'a voulu
                call.resolve(["ids": await Achats.droits()])
            } catch {
                call.reject("restauration impossible : \(error.localizedDescription)", nil, error)
            }
        }
    }

    /// Les produits que le joueur possède selon l'App Store : seulement les transactions vérifiées et non remboursées.
    private static func droits() async -> [String] {
        var ids = Set<String>()
        for await resultat in Transaction.currentEntitlements {
            if case .verified(let t) = resultat, t.revocationDate == nil {
                ids.insert(t.productID)
            }
        }
        return ids.sorted()
    }

    // MARK: - Transaction.updates

    private func recoit(_ resultat: VerificationResult<Transaction>) async {
        guard case .verified(let transaction) = resultat else {
            if case .unverified(let t, let erreur) = resultat {
                CAPLog.print("⚡️  [natif] transaction NON VÉRIFIÉE ignorée (\(t.productID)) : \(erreur.localizedDescription)")
            }
            return
        }
        switch await registre.arrivee(transaction) {
        case .dejaLivree:
            await transaction.finish()   // celle d'un acheter() qui a déjà répondu au jeu : rien à rejouer
        case .differee:
            break                        // un acheter() de ce produit est en vol : elle sera livrée à sa fin (relache)
        case .aLivrer:
            await livre(transaction)
        }
    }

    /// Une transaction vérifiée venue d'ailleurs : l'événement au jeu, puis finish(). Remboursée = terminée sans rien donner.
    private func livre(_ transaction: Transaction) async {
        if transaction.revocationDate == nil {
            // retainUntilConsumed : si le jeu n'a pas encore posé son écouteur (lancement), Capacitor garde l'événement pour lui
            notifyListeners("achatRecu", data: ["id": transaction.productID], retainUntilConsumed: true)
        } else {
            CAPLog.print("⚡️  [natif] transaction remboursée (\(transaction.productID)) : rien à donner")
        }
        await transaction.finish()
    }
}

/// Le registre des achats en vol (un acteur : acheter() et Transaction.updates y passent depuis des tâches différentes).
actor RegistreAchats {
    enum Sort { case dejaLivree, differee, aLivrer }

    private var enVol: String?                 // le produit d'un acheter() en cours (un seul à la fois)
    private var tenues = Set<UInt64>()         // les transactions rendues « ok » par acheter() : pas d'« achatRecu » pour elles
    private var differees: [Transaction] = []  // arrivées par Transaction.updates pendant l'acheter() du même produit

    /// Vrai si l'achat peut partir (aucun autre en vol).
    func prend(_ id: String) -> Bool {
        guard enVol == nil else { return false }
        enVol = id
        return true
    }

    func tient(_ idTransaction: UInt64) { tenues.insert(idTransaction) }

    /// Fin de l'acheter() : libère le verrou et rend les transactions différées que l'achat n'a pas lui-même livrées.
    func relache() -> [Transaction] {
        enVol = nil
        let reste = differees.filter { !tenues.contains($0.id) }
        differees = []
        return reste
    }

    func arrivee(_ t: Transaction) -> Sort {
        if tenues.contains(t.id) { return .dejaLivree }
        if enVol == t.productID {
            if !differees.contains(where: { $0.id == t.id }) { differees.append(t) }
            return .differee
        }
        return .aLivrer
    }
}
