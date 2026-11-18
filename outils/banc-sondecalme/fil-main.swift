/* le pilote du banc du fil principal (voir banc-fil.sh) */
import Foundation
import Dispatch

var recus: [String] = []
func sortie(_ s: String, completionHandler: Any?) { recus.append(s) }

let mode = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "fond"
let duree = CommandLine.arguments.count > 2 ? Double(CommandLine.arguments[2]) ?? 12 : 12
let sonde = SondeNatif()

/* le temps pris sur .main par chaque bloc de la sonde : on chronomètre le fil principal lui-même (un top à 33 ms, comme l'écran à 30 i/s) */
var retards: [Double] = []
var precedent = DispatchTime.now().uptimeNanoseconds
let top = DispatchSource.makeTimerSource(queue: .main)
top.schedule(deadline: .now() + .milliseconds(33), repeating: .milliseconds(33), leeway: .nanoseconds(0))
top.setEventHandler {
    let t = DispatchTime.now().uptimeNanoseconds
    retards.append(Double(t &- precedent) / 1e6 - 33.0)
    precedent = t
}
top.resume()

/* le battement : l'ancien sur .main, le nouveau sur la file */
if mode == "main" {
    let mp = DispatchSource.makeMemoryPressureSource(eventMask: [.normal, .warning, .critical], queue: .main)
    mp.resume()
    let t = DispatchSource.makeTimerSource(queue: .main)
    t.schedule(deadline: .now() + 1, repeating: 1.0, leeway: .milliseconds(1))
    sonde.dernier = DispatchTime.now().uptimeNanoseconds
    t.setEventHandler { sonde.bat() }
    t.resume()
    sonde.minuteur = t
} else if mode == "fond" {
    sonde.demarreFond()
} /* « rien » : aucune sonde, le bruit de fond de la machine */

/* combien le fil principal passe dans les blocs de la sonde : la même sentinelle chronométrée sur .main (ancien) ; le bloc de passage (nouveau) */
DispatchQueue.main.asyncAfter(deadline: .now() + duree) {
    top.cancel()
    let r = retards.sorted()
    let q = { (p: Double) -> Double in r.isEmpty ? 0 : r[min(r.count - 1, Int(Double(r.count) * p))] }
    let n8 = retards.filter { $0 > 8 }.count, n33 = retards.filter { $0 > 33 }.count
    print(String(format: "[%@] %d tops de 33 ms en %.0f s · retard du top q50 %.2f ms · q99 %.2f ms · pire %.2f ms · > 8 ms : %d · > 33 ms (un top raté) : %d",
                 mode, retards.count, duree, q(0.5), q(0.99), r.last ?? 0, n8, n33))
    print("[\(mode)] \(recus.count) battements reçus par la « page » ; les 6 premiers :")
    for s in recus.prefix(6) { print("    " + s) }
    exit(0)
}
dispatchMain()
