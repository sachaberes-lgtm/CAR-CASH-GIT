#!/usr/bin/env python3
# BANC DE CHALEUR (17/11) — LA PUISSANCE RÉELLE DU TÉLÉPHONE, lue par le câble toutes les 2 s.
# La jauge de la batterie (IORegistry, classe IOPMPowerSource) publie PowerTelemetryData :
#   SystemLoad = ce que consomme tout le téléphone (mW) · SystemPowerIn = ce qui entre par le câble (mW) · BatteryPower = ce qui sort (+) ou entre (−) dans la batterie.
# accl/accn = AccumulatedSystemLoad / SystemLoadAccumulatorCount : Δaccl/Δaccn = la puissance MOYENNE exacte entre deux lectures (la valeur instantanée n'est rafraîchie que toutes les ~10 s et saute).
# Plus la température de la batterie (centièmes de °C), la charge (%) et « en charge ». Une ligne par lecture, à la fin de batterie.txt :
#   AAAA-MM-JJ HH:MM:SS.ss BAT load=… in=… batt=… tbat=… tvirt=… pct=… charge=0|1 ext=0|1 ia=… v=…
# Lancement : nohup python3 batterie.py >> ~/cash-car/ios-ultime-mesures/chaleur/batterie.txt 2>> …/batterie.err &
import asyncio, sys, time, datetime
sys.path.insert(0, __import__('os').path.expanduser('~/Library/Python/3.9/lib/python/site-packages'))
from pymobiledevice3.lockdown import create_using_usbmux
from pymobiledevice3.services.diagnostics import DiagnosticsService
UDID = '00008110-000621041468401E'
PAS = float(sys.argv[1]) if len(sys.argv) > 1 else 2.0

async def boucle():
    while True:
        try:
            ld = await create_using_usbmux(serial=UDID)
            d = DiagnosticsService(lockdown=ld)
            while True:
                t = time.time()
                b = await d.get_battery()
                if b:
                    p = b.get('PowerTelemetryData') or {}
                    print('%s BAT load=%s in=%s batt=%s tbat=%s tvirt=%s pct=%s charge=%d ext=%d ia=%s v=%s accl=%s accn=%s' % (
                        datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:22],
                        p.get('SystemLoad'), p.get('SystemPowerIn'), p.get('BatteryPower'),
                        b.get('Temperature'), b.get('VirtualTemperature'), b.get('CurrentCapacity'),
                        1 if b.get('IsCharging') else 0, 1 if b.get('ExternalConnected') else 0,
                        b.get('InstantAmperage'), b.get('Voltage'), p.get('AccumulatedSystemLoad'), p.get('SystemLoadAccumulatorCount')), flush=True)
                await asyncio.sleep(max(0.2, PAS - (time.time() - t)))
        except Exception as e:
            print('%s ERR %r' % (datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), e), file=sys.stderr, flush=True)
            await asyncio.sleep(5)

asyncio.run(boucle())
