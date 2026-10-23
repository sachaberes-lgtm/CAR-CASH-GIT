// <<< fin SHAPES.e_anglaise (RONDES) >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.corolla (JAPONAISES) — début >>>
SHAPES.corolla=function(K){
  /* LA FIDÈLE — la berline compacte de 2019 (la ligne de la Toyota Corolla E210, quatre portes), ARGENT. Tout vient de son PLAN COTÉ
     VECTORIEL (dimensions.com, quatre vues, 127 unités/m, empattement 2,70 m) : la silhouette de côté (capot long qui plonge vers le nez en
     flèche, pare-brise couché, pavillon à 1,437 m, lunette qui file vers une malle courte, poupe droite), la largeur vue de dessus (1,78 m aux
     ailes), la coupe vue de face (flanc qui rentre vers l'épaule, vitres rentrées de 25°). Découpés dans la tôle (`japDecoupe`), les contours
     mêmes du plan : les phares effilés et leur signature, le projecteur, la grande calandre en trapèze, les prises d'air latérales, le bandeau
     noir sous le capot, les feux arrière reliés par leur barre chromée, la plaque, le bas de bouclier noir et ses catadioptres, les vitres et
     leurs montants noirs, la grille d'auvent, la lunette, les poignées ; les joints (portières, capot, malle, boucliers) et les plis (la ligne
     d'épaule, le pli bas des portières, les arcs d'ailes, les nervures du capot). Repère : x à droite, y en haut, z vers l'avant, mètres. */
  const U=LPU,R=.319,ZF=1.4015,ZR=-1.3047,ZE=2.316,ZB=-2.316;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t;
  const ARGENT=0x9fa3a9;   // (un argent moyen, celui des photos : en argent clair la laque sortait blanc rosé au studio des vignettes, comme la RF)
  const PAL={p:{g:'p',c:ARGENT},k:{g:'m',c:0x121214},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x141c26},s:{g:'s',c:0x2a2b30},b:{g:'s',c:0x151518},
    W:{g:'l',c:0xf2f6ff},L:{g:'l',c:0xd0101e},c:{g:'c',c:0xd4d8de},O:{g:'g',c:0xe08414},q:{g:'g',c:0xd9dde2},d:{g:'m',c:0x0d0e11},
    n:{g:'g',c:0x101013},Q:{g:'l',c:0xe6e6e6},h:{g:'g',c:0x6d7886}};   /* h : le verre GRIS des phares (22/10, Léo : « gris transparent comme avant, en 4 pièces empilées ») */
  const PLAN={"face":{"phare":[[0.759,0.808],[0.769,0.762],[0.772,0.723],[0.769,0.683],[0.759,0.645],[0.745,0.618],[0.724,0.594],[0.698,0.576],[0.663,0.558],[0.648,0.553],[0.641,0.555],[0.636,0.641],[0.633,0.649],[0.626,0.652],[0.462,0.634],[0.274,0.621],[0.294,0.675],[0.488,0.707],[0.641,0.744],[0.686,0.758],[0.722,0.773],[0.747,0.792],[0.757,0.804],[0.763,0.819]],"phareHaut":[[0.674,0.594],[0.694,0.606],[0.712,0.622],[0.721,0.634],[0.73,0.656],[0.737,0.686],[0.738,0.71],[0.731,0.732],[0.724,0.734],[0.519,0.686],[0.412,0.667],[0.342,0.658]],"projo":[[0.647,0.667],[0.651,0.682],[0.656,0.688],[0.669,0.695],[0.677,0.696],[0.691,0.69],[0.697,0.685],[0.703,0.671],[0.703,0.663],[0.697,0.65],[0.691,0.644],[0.677,0.639],[0.669,0.64],[0.656,0.647],[0.651,0.653]],"grilleHaut":[[0.274,0.621],[0.124,0.613],[0.103,0.604],[0.077,0.564],[0.066,0.553],[0.043,0.548],[0.004,0.547],[0.004,0.664],[0.177,0.666],[0.294,0.675]],"logo":[[0.067,0.617],[0.062,0.632],[0.051,0.643],[0.029,0.652],[0.002,0.656],[0.025,0.653],[0.047,0.645],[0.059,0.635],[0.066,0.621],[0.064,0.606],[0.047,0.59],[0.025,0.581],[0.002,0.579],[0.029,0.582],[0.051,0.592],[0.062,0.603]],"grille":[[0.0,0.249],[0.365,0.251],[0.46,0.255],[0.498,0.262],[0.52,0.272],[0.531,0.282],[0.535,0.305],[0.526,0.335],[0.504,0.377],[0.395,0.54],[0.38,0.558],[0.367,0.567],[0.345,0.574],[0.313,0.577],[0.0,0.578]],"prise":[[0.603,0.531],[0.522,0.501],[0.516,0.496],[0.513,0.489],[0.516,0.482],[0.578,0.401],[0.601,0.381],[0.638,0.368],[0.738,0.347],[0.767,0.336],[0.776,0.324],[0.784,0.278],[0.784,0.255],[0.778,0.25],[0.592,0.23]],"joncHaut":[[0.656,0.748],[0.488,0.707],[0.31,0.677],[0.185,0.666],[0.004,0.664]],"joncV":[[0.124,0.613],[0.103,0.604],[0.077,0.564],[0.066,0.553],[0.043,0.548],[0.004,0.547]],"joncPrise":[[0.603,0.531],[0.522,0.501],[0.516,0.496],[0.513,0.489],[0.521,0.475],[0.583,0.395],[0.601,0.381],[0.638,0.368],[0.738,0.347],[0.767,0.336],[0.772,0.331],[0.778,0.317],[0.786,0.262],[0.784,0.255],[0.778,0.25],[0.763,0.247],[0.592,0.23]],"capot":[[0.48,0.705],[0.228,0.718],[0.0,0.722]],"lignes":{"j":[[[0.889,0.668],[0.832,0.709],[0.772,0.743]]],"h":[[[0.611,0.629],[0.468,0.591],[0.399,0.576]]]}},"dos":{"feu":[[0.0,0.903],[0.307,0.902],[0.354,0.9],[0.369,0.896],[0.39,0.885],[0.458,0.832],[0.48,0.825],[0.511,0.823],[0.621,0.83],[0.691,0.844],[0.727,0.858],[0.754,0.874],[0.77,0.891],[0.773,0.907],[0.764,0.937],[0.746,0.962],[0.725,0.972],[0.694,0.975],[0.466,0.974],[0.427,0.967],[0.345,0.939],[0.291,0.932],[0.0,0.929]],"feuLigne":[[0.685,0.869],[0.664,0.9],[0.651,0.908],[0.636,0.912],[0.59,0.915],[0.397,0.916]],"logo":[[0.0,0.937],[0.03,0.943],[0.044,0.951],[0.053,0.963],[0.056,0.971],[0.053,0.986],[0.037,1.002],[0.023,1.008],[0.0,1.012],[0.023,1.008],[0.037,1.002],[0.049,0.992],[0.056,0.978],[0.053,0.963],[0.044,0.951],[0.023,0.941]],"plaque":[[0.0,0.666],[0.341,0.666],[0.364,0.672],[0.374,0.684],[0.374,0.692],[0.359,0.728],[0.321,0.796],[0.298,0.828],[0.274,0.848],[0.251,0.854],[0.228,0.856],[0.0,0.856]],"bas":[[0,0.512],[0.425,0.509],[0.503,0.504],[0.55,0.494],[0.577,0.478],[0.601,0.447],[0.692,0.255],[0.704,0.245],[0.735,0.241],[0.735,0.2],[0,0.2]],"catadi":[[0.65,0.512],[0.751,0.511],[0.767,0.508],[0.773,0.504],[0.777,0.489],[0.78,0.45],[0.779,0.349],[0.776,0.326],[0.769,0.323],[0.754,0.326],[0.75,0.34],[0.746,0.48],[0.747,0.496],[0.751,0.511]],"lignes":{"j":[[[0.0,1.089],[0.613,1.089],[0.617,1.074],[0.572,0.81],[0.559,0.749],[0.548,0.719],[0.537,0.698],[0.523,0.679],[0.506,0.663],[0.486,0.651],[0.464,0.643],[0.401,0.633],[0.268,0.629],[0.0,0.628]],[[0.809,0.294],[0.807,0.601],[0.81,0.812]]],"h":[[[0.0,0.529],[0.576,0.529],[0.552,0.55],[0.532,0.562],[0.51,0.569],[0.471,0.575],[0.377,0.578],[0.0,0.579]],[[0.0,1.037],[0.287,1.036],[0.609,1.022],[0.632,1.024],[0.655,1.03],[0.676,1.042],[0.694,1.057],[0.0,1.057]]]}},"cote":{"cadre":[[0.691,0.913],[0.542,0.917],[-0.582,0.986],[-1.061,1.02],[-1.178,1.032],[-1.31,1.054],[-1.347,1.066],[-1.358,1.077],[-1.36,1.085],[-1.36,1.093],[-1.352,1.106],[-1.327,1.125],[-1.231,1.178],[-1.131,1.226],[-1.052,1.26],[-0.956,1.296],[-0.873,1.321],[-0.804,1.336],[-0.672,1.356],[-0.499,1.368],[-0.255,1.369],[-0.019,1.357],[0.09,1.344],[0.215,1.323],[0.337,1.294],[0.435,1.264],[0.552,1.219],[0.718,1.147],[0.868,1.076],[0.964,1.022],[1.009,0.991],[1.038,0.964],[1.048,0.943],[1.045,0.936],[1.038,0.932],[1.015,0.926],[0.945,0.921]],"vitre":[[0.791,0.934],[0.957,0.941],[1.011,0.946],[1.024,0.949],[0.996,0.976],[0.95,1.007],[0.882,1.046],[0.804,1.084],[0.56,1.194],[0.45,1.238],[0.376,1.262],[0.254,1.294],[0.153,1.314],[0.052,1.329],[-0.065,1.34],[-0.27,1.349],[-0.506,1.348],[-0.67,1.336],[-0.803,1.316],[-0.872,1.301],[-0.94,1.28],[-1.094,1.221],[-1.187,1.178],[-1.284,1.127],[-1.325,1.103],[-1.331,1.089],[-1.327,1.082],[-1.314,1.075],[-1.236,1.061],[-1.104,1.044],[-0.955,1.031],[0.53,0.938],[0.64,0.933]],"montantB":[[-0.283,0.988],[-0.311,1.35],[-0.189,1.347],[-0.099,0.977]],"montantC":[[-0.867,1.024],[-0.894,1.294],[-0.87,1.301],[-0.841,1.023]],"ecoinc":[[0.854,1.083],[0.937,1.039],[1.003,0.996],[1.027,0.976],[1.043,0.958],[1.048,0.943],[1.045,0.936],[1.031,0.929],[1.015,0.926],[0.85,0.916],[0.868,0.937],[0.835,1.069]],"poigneeAr":[[-0.811,0.888],[-0.821,0.898],[-0.859,0.908],[-1.031,0.916],[-1.045,0.91],[-1.051,0.896],[-1.046,0.882],[-1.039,0.878],[-1.016,0.876],[-0.984,0.875],[-0.962,0.879],[-0.93,0.879],[-0.899,0.877],[-0.876,0.871],[-0.861,0.872],[-0.822,0.878]],"poigneeAv":[[0.106,0.827],[0.095,0.837],[0.057,0.847],[-0.115,0.855],[-0.129,0.849],[-0.135,0.835],[-0.133,0.827],[-0.122,0.817],[-0.076,0.814],[-0.029,0.819],[0.056,0.811],[0.095,0.817]],"creuxAr":[[-0.976,0.876],[-0.97,0.862],[-0.959,0.851],[-0.944,0.846],[-0.921,0.845],[-0.905,0.846],[-0.891,0.853],[-0.878,0.872]],"creuxAv":[[-0.06,0.815],[-0.053,0.801],[-0.042,0.79],[-0.027,0.785],[-0.012,0.784],[0.004,0.784],[0.019,0.788],[0.031,0.797],[0.038,0.811]],"feu":[[-1.728,0.892],[-2.146,0.821],[-2.154,0.822],[-2.166,0.832],[-2.209,0.906],[-2.215,0.911],[-2.23,0.914],[-2.235,0.92],[-2.236,0.928],[-2.235,0.936],[-2.229,0.94],[-2.206,0.945],[-2.183,0.966],[-2.161,0.973],[-2.074,0.976],[-1.933,0.972],[-1.855,0.963],[-1.802,0.949],[-1.761,0.925]],"phare":[[2.011,0.619],[1.989,0.641],[1.976,0.66],[1.963,0.688],[1.962,0.703],[2.008,0.697],[2.19,0.659],[2.262,0.652],[2.257,0.609],[2.158,0.633],[2.057,0.648],[2.034,0.645],[2.029,0.639],[2.03,0.623]],"lignes":{"j":[[[-1.174,1.052],[-1.188,1.006],[-1.192,0.983],[-1.186,0.961],[-1.175,0.94],[-0.956,0.595],[-0.823,0.363],[-0.793,0.327],[-0.759,0.306],[-0.73,0.296],[-0.691,0.288],[-0.582,0.28],[0.778,0.251],[0.817,0.253],[0.84,0.259],[0.853,0.268],[0.867,0.286],[0.879,0.315],[0.891,0.361],[0.912,0.517],[0.927,0.705],[0.927,0.783],[0.918,0.83],[0.856,1.081]],[[-0.171,0.273],[-0.156,0.539],[-0.156,0.648],[-0.16,0.75],[-0.171,0.851],[-0.25,1.369]],[[-1.728,0.892],[-1.524,0.63]],[[1.579,0.632],[1.639,0.681],[1.726,0.743]]],"h":[[[-1.893,0.999],[-1.562,0.995],[-1.24,0.984],[-0.942,0.969],[-0.581,0.945],[-0.205,0.914],[0.249,0.871],[1.304,0.756]],[[-0.815,0.408],[-0.787,0.422],[-0.749,0.431],[-0.702,0.436],[-0.639,0.438],[0.502,0.419],[0.612,0.411],[0.697,0.394],[0.771,0.367],[0.855,0.325]],[[1.899,0.25],[1.752,0.518],[1.727,0.558],[1.696,0.594],[1.644,0.641],[1.584,0.679],[1.519,0.706],[1.45,0.722],[1.372,0.725],[1.294,0.713],[1.257,0.701],[1.214,0.683],[1.147,0.642],[1.089,0.589],[1.059,0.553],[1.038,0.52],[1.005,0.449],[0.986,0.372]],[[-1.762,0.312],[-1.738,0.419],[-1.725,0.464],[-1.698,0.52],[-1.669,0.566],[-1.628,0.614],[-1.581,0.655],[-1.528,0.689],[-1.471,0.715],[-1.411,0.733],[-1.349,0.743],[-1.287,0.744],[-1.217,0.735],[-1.149,0.715],[-1.093,0.689],[-1.04,0.655],[-0.993,0.614]]]}},"dessus":{"parebrise":[[1.185,0.0],[1.178,0.204],[1.169,0.298],[1.154,0.4],[1.128,0.523],[1.114,0.576],[1.095,0.611],[1.072,0.631],[1.051,0.641],[1.028,0.646],[0.996,0.646],[0.957,0.641],[0.466,0.529],[0.444,0.522],[0.432,0.512],[0.428,0.505],[0.428,0.489],[0.456,0.366],[0.479,0.195],[0.487,0.181],[0.494,0.177],[0.561,0.156],[0.574,0.147],[0.579,0.141],[0.588,0.086],[0.591,0.0]],"cadrePB":[[0.427,0.0],[1.185,0.0],[1.178,0.204],[1.169,0.298],[1.154,0.4],[1.13,0.515],[1.114,0.576],[1.095,0.611],[1.072,0.631],[1.051,0.641],[1.02,0.647],[0.973,0.644],[0.934,0.636],[0.466,0.529],[0.437,0.517],[0.432,0.512],[0.427,0.497]],"lunetteK":[[-1.221,0.0],[-1.869,0.0],[-1.863,0.22],[-1.856,0.291],[-1.841,0.376],[-1.82,0.452],[-1.795,0.518],[-1.76,0.58],[-1.735,0.609],[-1.709,0.627],[-1.671,0.638],[-1.624,0.643],[-1.561,0.64],[-1.444,0.627],[-1.312,0.603],[-1.229,0.582],[-1.215,0.574],[-1.203,0.563],[-1.195,0.542],[-1.194,0.518],[-1.216,0.299]],"lunette":[[-1.818,0.0],[-1.286,0.0],[-1.282,0.22],[-1.266,0.448],[-1.271,0.486],[-1.282,0.507],[-1.307,0.526],[-1.359,0.542],[-1.452,0.559],[-1.584,0.577],[-1.631,0.58],[-1.663,0.576],[-1.692,0.565],[-1.717,0.546],[-1.741,0.515],[-1.762,0.473],[-1.781,0.422],[-1.795,0.36],[-1.804,0.306],[-1.812,0.22]],"auvent":[[1.276,0.004],[1.272,0.2],[1.253,0.371],[1.238,0.448],[1.218,0.532],[1.162,0.711],[1.012,0.647],[1.004,0.647],[1.02,0.647],[0.996,0.646],[1.028,0.646],[0.988,0.646],[1.035,0.645],[0.973,0.644],[1.043,0.643],[0.965,0.643],[1.051,0.641],[0.957,0.641],[1.058,0.639],[1.072,0.631],[1.09,0.617],[1.104,0.598],[1.114,0.576],[1.147,0.438],[1.167,0.314],[1.18,0.173],[1.185,0.0]],"lignes":{"j":[[[1.197,0.477],[0.504,0.481],[0.009,0.491],[0.235,0.502],[0.352,0.516]],[[1.229,0.697],[1.317,0.73],[1.385,0.749],[1.455,0.762],[1.526,0.766],[1.644,0.762],[1.831,0.742],[1.909,0.727],[1.951,0.707],[1.976,0.688],[2.003,0.659],[2.072,0.563],[2.169,0.401],[2.235,0.276],[2.247,0.239],[2.257,0.177],[2.265,0.09],[2.267,0.004]],[[-2.29,0.004],[-2.282,0.232],[-2.262,0.435],[-2.254,0.474],[-2.243,0.503],[-2.228,0.531],[-2.209,0.556],[-2.186,0.577],[-2.158,0.592],[-2.12,0.602],[-2.066,0.609],[-1.799,0.624],[-1.768,0.62],[-1.741,0.603]],[[1.608,0.889],[1.681,0.818],[1.718,0.776]],[[1.743,0.78],[1.661,0.823],[1.556,0.889]]],"h":[[[1.328,0.617],[1.39,0.558],[1.422,0.535],[1.458,0.518],[1.503,0.504],[1.619,0.484],[1.749,0.457],[1.87,0.424],[1.944,0.398],[2.031,0.361],[2.206,0.273]]]}}};
  // ---- LES COTES DU PLAN (mètres) ----
  const XM=[[ZB,.40],[-2.30,.46],[-2.28,.499],[-2.24,.582],[-2.20,.632],[-2.16,.678],[-2.12,.722],[-2.08,.762],[-2.04,.794],[-2.0,.809],[-1.96,.818],[-1.92,.826],
            [-1.88,.835],[-1.84,.844],[-1.80,.854],[-1.76,.863],[-1.72,.872],[-1.68,.88],[-1.64,.886],[-1.60,.888],[-1.56,.889],[-1.04,.887],[-.96,.885],[-.88,.882],
            [-.80,.878],[-.72,.875],[-.68,.874],[.60,.873],[.96,.874],[1.04,.875],[1.12,.879],[1.20,.884],[1.28,.887],[1.36,.888],[1.40,.889],[1.70,.889],[1.76,.884],
            [1.80,.878],[1.84,.87],[1.88,.862],[1.92,.853],[1.96,.84],[2.0,.82],[2.04,.812],[2.08,.799],[2.12,.752],[2.16,.69],[2.20,.626],[2.24,.559],[2.28,.481],
            [2.30,.43],[ZE,.38]],
        // le haut du flanc : la malle et sa poupe, la ceinture (le bas des vitres), la crête des ailes avant, le nez
        YT=[[ZB,.45],[-2.309,.565],[-2.29,.606],[-2.271,.621],[-2.264,.664],[-2.24,.69],[-2.236,.70],[-2.228,1.016],[-2.207,1.025],[-2.136,1.032],[-2.0,1.052],
            [-1.87,1.078],[-1.60,1.075],[-1.36,1.068],[-1.27,1.046],[-1.11,1.024],[-.95,1.011],[-.79,1.0],[-.63,.989],[-.47,.979],[-.31,.969],[-.15,.959],[.01,.95],
            [.17,.94],[.33,.93],[.49,.92],[.65,.913],[.81,.915],[.97,.922],[1.10,.94],[1.205,.962],[1.289,.928],[1.373,.886],[1.459,.846],[1.549,.816],[1.641,.796],
            [1.734,.779],[1.827,.763],[1.92,.745],[2.012,.726],[2.105,.707],[2.197,.685],[2.242,.672],[2.264,.665],[2.271,.645],[2.275,.603],[2.294,.59],[2.30,.567],
            [2.306,.544],[2.311,.521],[ZE,.47]],
        // le milieu du dessus : capot, pare-brise, pavillon, lunette, malle (la silhouette de côté)
        YC=[[ZB,.45],[-2.309,.565],[-2.29,.606],[-2.271,.621],[-2.264,.664],[-2.24,.69],[-2.236,.70],[-2.228,1.036],[-2.207,1.045],[-2.16,1.049],[-2.12,1.053],
            [-2.08,1.058],[-2.04,1.065],[-2.0,1.072],[-1.96,1.081],[-1.92,1.09],[-1.87,1.098],[-1.84,1.109],[-1.80,1.128],[-1.76,1.146],[-1.72,1.165],[-1.68,1.182],
            [-1.64,1.2],[-1.60,1.217],[-1.56,1.233],[-1.52,1.25],[-1.48,1.266],[-1.44,1.281],[-1.40,1.296],[-1.36,1.311],[-1.32,1.325],[-1.28,1.339],[-1.24,1.352],
            [-1.20,1.369],[-1.16,1.378],[-1.12,1.385],[-1.04,1.398],[-.96,1.409],[-.88,1.416],[-.80,1.422],[-.72,1.427],[-.64,1.431],[-.56,1.434],[-.44,1.437],
            [-.28,1.437],[-.16,1.434],[-.08,1.431],[0,1.426],[.08,1.419],[.16,1.409],[.24,1.396],[.32,1.381],[.36,1.371],[.40,1.359],[.44,1.342],[.48,1.328],
            [.52,1.312],[.56,1.297],[.60,1.281],[.64,1.264],[.68,1.247],[.72,1.23],[.76,1.212],[.80,1.194],[.84,1.175],[.88,1.156],[.92,1.137],[.96,1.118],[1.0,1.098],
            [1.04,1.078],[1.08,1.058],[1.12,1.038],[1.16,1.017],[1.20,.996],[1.24,.976],[1.28,.964],[1.32,.96],[1.36,.957],[1.40,.952],[1.48,.943],[1.56,.931],
            [1.64,.918],[1.72,.903],[1.80,.885],[1.88,.863],[1.96,.838],[2.04,.808],[2.10,.781],[2.166,.749],[2.227,.712],[2.264,.683],[2.271,.665],[2.275,.603],
            [2.294,.59],[2.30,.567],[2.306,.544],[2.311,.521],[ZE,.47]],
        YB=[[ZB,.40],[-2.314,.34],[-2.302,.32],[-2.285,.302],[-2.24,.285],[-2.12,.282],[-2.0,.27],[-1.88,.256],[-1.75,.244],[-1.66,.255],[-1.0,.224],[-.94,.206],
            [0,.198],[.94,.19],[1.0,.189],[1.07,.203],[1.75,.192],[1.80,.182],[1.86,.184],[1.90,.195],[2.25,.209],[2.28,.215],[2.293,.242],[2.30,.31],[2.31,.38],[ZE,.44]],
        ARF=[[0,.682],[.04,.68],[.08,.674],[.12,.664],[.16,.649],[.20,.627],[.24,.599],[.28,.561],[.30,.535],[.315,.48],[.322,.35],[.326,0]],
        ARR=[[0,.698],[.06,.693],[.10,.684],[.145,.667],[.18,.651],[.22,.624],[.26,.588],[.29,.56],[.305,.535],[.318,.45],[.325,.30],[.33,0]];
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z),yC=z=>L(YC,z);
  /* LA SERRE (z = 1.26 le pied du pare-brise, −1.87 le bas de la lunette) : le bord du toit `yr` suit le haut du cadre des vitres (relevé sur le
     plan), posé dans le PLAN DES VITRES (rentrée de 25°, relevée vue de face) ; devant le cadre, le pied du montant ; derrière, le montant de
     lunette qui rejoint la malle. */
  const ZW=1.26,ZHT=-1.87;
  const YR=[[-1.36,1.116],[-1.27,1.166],[-1.19,1.207],[-1.11,1.244],[-1.03,1.277],[-.95,1.306],[-.87,1.33],[-.79,1.347],[-.71,1.36],[-.63,1.369],[-.55,1.374],
            [-.47,1.377],[-.35,1.378],[-.23,1.376],[-.15,1.373],[-.07,1.368],[.01,1.362],[.09,1.352],[.17,1.34],[.25,1.324],[.33,1.304],[.41,1.281],[.49,1.252],
            [.57,1.22],[.65,1.185],[.73,1.149],[.81,1.112],[.89,1.072],[.97,1.027],[1.047,.95]];
  const vitreX=y=>.77-.47*(y-.95);
  const zone=z=>z>ZW?'capot':z>=ZHT?'serre':'malle';
  const DX=[[0,.04],[.05,.016],[.17,.014],[.33,.007],[.45,.002],[.55,0],[.65,0],[.70,.004],[.75,.011],[.80,.029],[.855,.05],[.91,.072],[.96,.09],[1.0,.105]];
  const TS=[.04,.12,.24,.38,.52,.64,.74,.83,.92],NC=2+TS.length;   // le flanc (vue de face), en part de sa hauteur ; NC : l'indice de l'épaule
  const S0=z=>{const xm=xM(z),y0=yB0(z),yt=yT(z),zo=zone(z),kx=Math.min(1,xm/.62),H=Math.max(.04,yt-y0);
    const yb=Math.max(y0,L(ARF,Math.abs(z-ZF)),L(ARR,Math.abs(z-ZR)));
    const sx=t=>xm-L(DX,t)*kx;
    const s=[[0,yb],[xm-.10*kx,yb]];
    const B9=Math.max(y0,yb),H9=Math.max(.04,yt-B9);   // (affinement : au-dessus d'un passage de roue, le flanc se répartit entre l'arche et l'épaule — tassé sur l'arche, il faisait un damier)
    let pr=yb;for(let i=0;i<TS.length;i++){let h=Math.max(B9+TS[i]*H9,pr+.0015);h=Math.min(h,yt-(TS.length-i)*.0015);if(h<pr+.0005)h=pr+.0005;pr=h;s.push([sx(cl((h-B9)/H9,0,1)),h]);}
    const xb=xm-.105*kx;
    if(zo==='capot'){const yh=Math.max(yC(z),yt),xc=xm-.09*kx;
      s.push([xc,yt],[xc-.02*kx,yt+.008],[xm*.72,yh-.022],[xm*.55,yh-.011],[xm*.36,yh-.004],[xm*.18,yh],[0,yh]);}
    else if(zo==='serre'){let xr,yr;
      if(z>1.047){xr=xb-.03;yr=yt+.015;}                                                        // (le pied du montant : le cadre n'a pas commencé)
      else if(z>=-1.36){yr=L(YR,z);xr=vitreX(yr);}                                               // le haut du cadre des vitres
      else{yr=mix(1.116,1.10,(-1.36-z)/(-1.36-ZHT));xr=vitreX(yr);}                              // le montant de lunette
      yr=Math.max(yr,yt+.01);xr=Math.min(xr,xb-.012);const yc=Math.max(yC(z),yr+.004);
      s.push([xb,yt],[xb-.008,yt+.012],[mix(xb,xr,.5)+.004,mix(yt,yr,.5)],[xr,yr],[xr-.06,yr+(yc-yr)*.64],[xr*.58,yc-.005],[0,yc]);}
    else{const yd=yC(z),ye=Math.min(yt,yd);s.push([xb,ye],[xb-.015*kx,ye+.004],[xm*.72,yd-.008],[xm*.55,yd-.004],[xm*.36,yd-.001],[xm*.18,yd],[0,yd]);}
    for(let i=NC+1;i<s.length;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]);   // (le dessus ne redescend jamais vers le milieu)
    if(z>=ZE-1e-6||z<=ZB+1e-6)for(const q of s)q[0]*=.02;                  // (les deux bouts se replient sur l'axe : la face est une bande du loft)
    return s;};
  const SM=new Map(),S=z=>{const k=Math.round(z*2000);let s=SM.get(k);if(!s){s=S0(k/2000);SM.set(k,s);}return s;};
  const zs0=[ZB,ZB+.003,-2.31,-2.30,-2.29,-2.28,-2.271,-2.264,-2.25,-2.24,-2.236,-2.228,-2.215,-2.2,-2.16,-2.12,-2.08,-2.04,-2.0,-1.96,-1.92,ZHT,ZHT-.004,-1.84,-1.80,
    -1.76,-1.72,-1.68,-1.64,-1.60,-1.56,-1.50,-1.44,-1.36,-1.27,-1.19,-1.11,-1.03,-.95,-.87,-.79,-.71,-.63,-.55,-.47,-.39,-.31,-.23,-.15,-.07,.01,.09,.17,.25,
    .33,.41,.49,.57,.65,.73,.81,.89,.97,1.047,1.10,1.16,1.205,ZW,ZW+.004,1.32,1.40,1.48,1.56,1.64,1.72,1.80,1.88,1.96,2.04,2.10,2.16,2.20,2.227,2.25,2.264,
    2.271,2.275,2.285,2.294,2.30,2.306,2.311,ZE-.003,ZE];
  for(const [w,a] of [[ZF,.326],[ZR,.33]])for(const f of [0,.2,.4,.55,.7,.8,.88,.95,.99,1])zs0.push(w-a*f,w+a*f);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.002);
  let HB=false;try{HB=/[?&]honte=[123]/.test(location.search);}catch(e){}   // (`?honte=1` : dalles ; `?honte=2` : l'ENTRE-DEUX, briques + couches plates)
  const peint=(j,z)=>j===0&&z<2.24&&z>-2.25?'k':(HB&&z<1.26&&z>-1.87&&((j>=11&&j<=12)||(j>=13&&(z>.3||z<-1.2))))?'g':'p';   // (aux deux bouts, la bande du plancher monte et devient le bas de la face : de la tôle, que la découpe habille)
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  /* (23/10, Léo : « traduis dans le style de LA HONTE, fidèle à la Fidèle ») `?honte=1` : la VRAIE forme (les sections du plan) taillée en quelques GROS pans — une tranche par grand changement
     de ligne —, sans découpe au plan ; les vitres, les phares, la bouche sont des pièces posées. */
  const zsB=[ZB,-2.28,-2.236,-2.0,-1.87,-1.36,-1.10,-.50,.30,.50,1.05,1.26,1.60,2.0,2.24,2.28,ZE,ZF-.36,ZF-.18,ZF+.18,ZF+.36,ZR-.36,ZR-.18,ZR+.18,ZR+.36].sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.003);
  /* EN BRIQUES (`?honte=1`) : chaque tranche est une section de 6 points, des BRIQUES — le dessous, le flanc DROIT, l'épaulement plat, la cabine à flancs droits, le toit —, mesurées sur la vraie section (largeur, hauteur de l'épaule, du toit, du bord de verre) :
     la forme de La Fidèle, taillée comme les caisses de LA HONTE, mais proprement (peu de plis, aucune diagonale parasite). */
  const SB=z=>{const s=S(z),xm=s[1][0]+.10*Math.min(1,s[1][0]/.62),yb=s[0][1],yt=s[NC][1],yc=s[s.length-1][1],cab=z<=ZW&&z>=ZHT,xr=cab?s[NC+3][0]:xm*.93,yr=cab?s[NC+3][1]:yt;
    const sx=z>=ZE-1e-6||z<=ZB+1e-6?.02:1;return [[0,yb],[xm*sx,yb],[xm*sx,yt],[xr*sx,yt],[xr*sx,Math.max(yr,yt+.01)],[0,yc]];};
  const peintB=(j,z)=>j===0?'k':(j===3&&z<1.0&&z>-1.3)?'g':(j===4&&z<1.26&&z>-1.87&&(z>.3||z<-1.2))?'g':'p';
  const PL=K.kit(PAL);let HB2=false;try{HB2=/[?&]honte=2/.test(location.search);}catch(e){}
  let HB3=false;try{HB3=/[?&]honte=3/.test(location.search);}catch(e){}
  if(HB3){   /* LE MÉLANGE (23/10, Léo : « un mélange technique des deux : répartition stratégique de la taille des cubes ») — de GROS blocs là où la tôle est plate (les flancs : 13 cm d'épaisseur, longs), des couches TRÈS FINES
     (4 cm, tronçons de 6 cm) là où la forme se complique (le nez, la poupe, le capot, la cabine et le toit). Les passages de roue restent des vides en marches. */
    const xAt=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
    const ZA=-1.85,ZBm=1.75,YM=1.00,Sz=z=>S(Math.max(ZB+.001,Math.min(ZE-.001,z)));
    const rangee=(yc,dy,dz,q,zA,zB,kf)=>{let run=null;const flush=z1=>{if(run&&run.w>.02)PL.box(run.k,2*run.w,dy+.002,z1-run.z0,0,yc,(run.z0+z1)/2);run=null;};
      for(let z=zA+dz/2;z<zB;z+=dz){const w=Math.round(xAt(Sz(z),yc)/q)*q,k=kf(z,yc);if(!run||run.w!==w||run.k!==k){flush(z-dz/2);run={w:w,k:k,z0:z-dz/2};}}flush(zB);};
    // 1. les GROS blocs : le flanc entre la poupe et le nez, sous la ceinture
    for(let yc=.22+.065;yc<YM;yc+=.13)rangee(yc,.13,.12,.04,ZA,ZBm,()=>'p');
    // 2. les COUCHES FINES : le nez et la poupe sur toute la hauteur, tout le reste au-dessus de la ceinture
    const verre=(z,y)=>(y>1.0&&y<1.40&&z<ZW-.02&&z>ZHT+.02&&xAt(Sz(z),y)<.72)?'g':'p';
    for(let yc=.22+.02;yc<1.43;yc+=.04){
      if(yc<YM){rangee(yc,.04,.06,.02,ZB,ZA,verre);rangee(yc,.04,.06,.02,ZBm,ZE,verre);}
      else rangee(yc,.04,.06,.02,ZB,ZE,verre);}
  }else if(HB&&HB2){   /* L'ENTRE-DEUX (23/10, Léo : « fais un entre-deux ») : la caisse en BRIQUES (sections rectangulaires, peu de plis), plus quelques COUCHES TRÈS PLATES empilées aux endroits qui
     portent le dessin — la base noire (2 couches), la ceinture, la dalle du toit (2 couches), la couche du capot. */
    PL.loft(zsB,SB,peintB);
    const xAt=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
    const couche=(y,h,k,grow,zA,zB)=>{let run=null;const flush=z1=>{if(run&&run.w>.02)PL.box(k,2*run.w,h,z1-run.z0,0,y,(run.z0+z1)/2);run=null;};
      for(let z=zA+.045;z<zB;z+=.09){const w=Math.round((xAt(S(Math.max(ZB+.001,Math.min(ZE-.001,z))),y)+grow)/.03)*.03;if(!run||run.w!==w){flush(z-.045);run={w:w,z0:z-.045};}}flush(zB);};
    couche(.245,.03,'d',.02,ZB+.2,ZE-.2);couche(.275,.03,'d',.015,ZB+.2,ZE-.2);          // la base : deux couches noires, plus larges
    couche(.985,.022,'c',.012,-2.0,1.0);                                                   // la ceinture : un filet chromé
    couche(.62,.03,'d',.012,-1.1,1.0);                                                     // le bas des portières : un liseré noir, par-dessus la ceinture basse
  }else if(HB){   /* (23/10, Léo : « empiler des formes TRÈS PLATES pour construire, comme LA HONTE, mais avec plus de couches ») LA FIDÈLE EN DALLES : la vraie silhouette taillée en TRANCHES HORIZONTALES de 5 cm ;
     dans chaque tranche, des dalles (une par tronçon de même largeur, mesurée sur la vraie section à cette hauteur) — le bas, la caisse, la ceinture, la cabine de verre, le toit : un empilement, des marches, comme un modèle en briques. */
    const xAt=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
    const DY=.05,Y0=.22,Y1=1.43,DZ=.09;
    for(let yc=Y0+DY/2;yc<Y1;yc+=DY){const top=yc+DY>Y1-.001;let run=null;
      const flush=z1=>{if(run&&run.w>.02){const L=z1-run.z0;PL.box(run.k,2*run.w,DY+.002,L,0,yc,(run.z0+z1)/2);}run=null;};
      for(let z=ZB+DZ/2;z<ZE;z+=DZ){const sc=S(Math.max(ZB+.001,Math.min(ZE-.001,z))),w=Math.round(xAt(sc,yc)/.03)*.03,
          k=(!top&&yc>1.00&&z<ZW-.02&&z>ZHT+.02&&w<.72)?'g':'p';
        if(!run||run.w!==w||run.k!==k){flush(z-DZ/2);run={w:w,k:k,z0:z-DZ/2};}}
      flush(ZE);}
  }else PL.loft(zs,S,peint);
  // ---- LA DÉCOUPE AU PLAN (`japDecoupe`) ----
  const MEM=(typeof SHAPES==='object'&&SHAPES.corolla)||null;
  const av=(x,y,z,nx,ny,nz)=>z>2.0&&nz>.2,ar=(x,y,z,nx,ny,nz)=>z<-2.0&&nz<-.2,cs=(x,y,z,nx,ny,nz)=>Math.abs(nx)>.5;
  const F9=PLAN.face,D9=PLAN.dos,C9=PLAN.cote,T9=PLAN.dessus;
  const bas=D9.bas;
  // le FEU arrière vu de dos, prolongé dans le coin (il s'enroule sur l'aile : sans cela le coin de la poupe restait à la couleur de la caisse)
  // (le COIN du feu, là où il tourne de la poupe sur l'aile : une zone « tout le plan » dans chaque vue, portée par le centre du triangle —
  //  ses triangles changent de vue selon leur pente et passaient entre les deux contours)
  const COIN={k:'r',p:[[-3,-1],[3,-1],[3,2],[-3,2]],axe:false,gate:(x,y,z,nx,ny,nz)=>z<-2.0&&Math.abs(x)>.56&&y>.83&&y<.976&&nz<-.3&&Math.abs(nx)>.3};
  const FEU=D9.feu.map(p=>[p[0]>.72?p[0]+(p[0]-.72)*2.2:p[0],p[1]]);
  // ---- LE COIN AVANT, taillé d'après la photo (Léo, sur le recadrage du coin de la vraie : « identique ») — vue de face (|x|, y) ----
  const decale=(P9,d)=>P9.map((p,i)=>{const a=P9[Math.max(0,i-1)],b=P9[Math.min(P9.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [p[0]+dy/l*d,p[1]-dx/l*d];});   // (décalé à droite du sens de marche)
  const aire9=P9=>{let a=0;for(let i=0;i<P9.length;i++){const p=P9[i],q=P9[(i+1)%P9.length];a+=p[0]*q[1]-q[0]*p[1];}return a/2;};
  const rentre9=(P9,d)=>{const n=P9.length,sg=aire9(P9)>0?1:-1;return P9.map((p,i)=>{const a=P9[(i-1+n)%n],b=P9[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [p[0]-sg*dy/l*d,p[1]+sg*dx/l*d];});};
  const PH=F9.phare,PHbas=PH.slice(1,16),PHhaut=PH.slice(16,24);   // le contour du phare : le bord extérieur puis le bas (vers la pointe intérieure) · le haut (vers l'aile)
  const BANDE=(()=>{const A=decale(PHhaut,.006),n=PHhaut.length,B=PHhaut.map((p,i)=>decale(PHhaut,.022+.03*i/(n-1))[i]);return A.concat(B.reverse());})();   // la bande noire du haut du phare
  const JONC_L=[[.615,.529],[.70,.523],[.758,.517],[.779,.507],[.787,.484],[.79,.40],[.792,.322],[.787,.275],[.769,.256],[.70,.248],[.60,.243]];   // le jonc chromé de la prise en L
  const CREUX_L=[[.632,.507],[.70,.502],[.748,.497],[.762,.488],[.767,.465],[.769,.40],[.77,.345]];                                               // son creux noir, dedans
  const xBord=(P9,y)=>{let m=0;for(let i=0;i<P9.length;i++){const a=P9[i],b=P9[(i+1)%P9.length];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
  const ZN={
    face:japZones([
      /* (22/10, Léo, sur le recadrage du phare : « tu n'arrives pas à dessiner et modeler en même temps — fabrique, colle, ajuste sur la voiture ») LE PHARE
         n'est plus DESSINÉ dans la tôle (cerclage, fond chromé, crochet de LED, projecteur : un dessin plat mal recopié) — il est FABRIQUÉ et POSÉ plus bas
         (voir « LES PHARES » : des blocs de verre fumé qui suivent le coin du nez, une lame de LED), comme les rectangles plats de LA HONTE. */
      {k:'K',p:F9.grilleHaut,gate:av},{k:'c',p:japRuban(F9.joncHaut,.013),gate:av,axe:false},                   // la CALANDRE HAUTE noire, bordée de chrome (il file dans les phares)…
      {k:'c',p:japRuban(F9.joncV,.011),gate:av,axe:false},{k:'c',p:F9.logo,gate:av},                            // …le V chromé et le logo
      {k:'K',p:F9.grille,creux:.026,gate:av},                                                                    // la GRANDE BOUCHE, creusée (ses lames sont posées devant, plus bas)
      /* (22/10, Léo : « le relief oui, mais le phare, ça va pas ») LE PHARE redevient SIMPLE ET À PLAT, un seul aplat noir au contour du plan et sa lame de LED
         blanche — plus de jonc, de crochet ni de projecteur dessinés, plus d'étages en relief. */
      /* (22/10) la PRISE EN L n'est plus dessinée : un bloc noir et son jonc chromé sont posés en relief (voir « LES PHARES ») */
      {k:'K',p:japOvale(.725,.298,.05,.046,18),creux:.022,gate:av},                                             // la coupelle de l'antibrouillard (l'optique est posée dedans, plus bas)
      {k:'c',p:japRuban([[0,.234],[.30,.234],[.60,.238]],.012),creux:-.003,gate:av,axe:false}]),               // le jonc chromé sous la bouche, qui rejoint le pied du L
    cote:japZones([
      {k:'K',p:C9.cadre,gate:cs},{k:'g',p:C9.vitre,gate:cs},{k:'K',p:C9.montantB,gate:cs},{k:'K',p:C9.montantC,gate:cs},{k:'K',p:C9.ecoinc,gate:cs},
      {k:'c',p:C9.poigneeAr,gate:cs},{k:'c',p:C9.poigneeAv,gate:cs},{k:'K',p:C9.creuxAr,creux:.008,gate:cs},{k:'K',p:C9.creuxAv,creux:.008,gate:cs},
      {k:'r',p:C9.feu.map(p=>[p[0]<-2.12?p[0]-.07:p[0],p[1]]),gate:(x,y,z,nx,ny,nz)=>z<-1.6},COIN,]),
    dos:japZones([
      {k:'r',p:FEU,gate:ar},COIN,{k:'L',p:japRuban(D9.feuLigne,.016),gate:ar,axe:false},{k:'p',p:japDemi(.37,.904,.936,.003,1),gate:ar},
      {k:'c',p:D9.logo,gate:ar},{k:'r',p:japRect(.56,.252,.80,.274,.006,2),gate:ar}]),   // le logo ; les catadioptres, couchés au pied du bouclier (comme sur la vraie)
    dessus:japZones([
      COIN,{k:'K',p:T9.cadrePB,gate:(x,y,z,nx,ny,nz)=>z>.3&&z<1.3&&ny>.2},{k:'g',p:T9.parebrise,gate:(x,y,z,nx,ny,nz)=>z>.3&&z<1.3&&ny>.2},
      {k:'K',p:T9.lunetteK,gate:(x,y,z,nx,ny,nz)=>z<-1.1&&ny>.2},{k:'g',p:T9.lunette,gate:(x,y,z,nx,ny,nz)=>z<-1.1&&ny>.2},
      {k:'b',p:T9.auvent,gate:(x,y,z,nx,ny,nz)=>z>1.0&&z<1.4&&ny>.3}])};
  const LG=v=>japLignes([].concat((PLAN[v].lignes.j||[]).map(p=>({k:'j',p:p})),(PLAN[v].lignes.h||[]).map(p=>({k:'h',p:p}))));
  const LGN={cote:LG('cote'),face:japLignes([].concat(F9.lignes.j.map(p=>({k:'j',p:p,gate:av})),F9.lignes.h.map(p=>({k:'h',p:p,gate:av})),[{k:'j',p:F9.capot,gate:av}])),
    dos:japLignes([].concat(D9.lignes.j.map(p=>({k:'j',p:p,gate:ar})),D9.lignes.h.map(p=>({k:'h',p:p,gate:ar})),[{k:'j',p:D9.plaque,gate:ar},{k:'h',p:bas.slice(0,-2),gate:ar}])),dessus:LG('dessus')};
  const CODES={p:{g:GP},gap:{g:GP,c:0x26282c},K:{g:'g',c:PAL.K.c,lisse:1},g:{g:'g',c:PAL.g.c,lisse:1},c:{g:'c',c:0xd4d8de},W:{g:'l',c:0xf2f6ff},
    h:{g:'g',c:0x2e323a,lisse:1},l2:{g:'c',c:0x9aa0a8},L:{g:'l',c:0xd8101e},r:{g:'l',c:0x7a0a14}   /* (le corps des feux : rouge sombre émissif — en verre, une grande facette du coin renvoyait le ciel en blanc) */,b:{g:'s',c:0x151518},O:{g:'g',c:PAL.O.c,lisse:1}};
  if(!HB){const f2=PL.done;PL.done=()=>{const gs=f2(),G=gs[GP];if(!G)return gs;
    const out=japDecoupe(G,{zones:ZN,lignes:LGN,codes:CODES,ns:()=>japLisse(G,32),GP:GP,colP:japColP(EP),cache:MEM,
      vue:(x,y,z,ax,ay,az,nx,ny,nz)=>{if(z>2.0&&nz>.2&&ny<.92&&y<.84)return 'face';   // (le bouclier en flèche : toute sa face est lue vue de face — sinon les zones s'y posaient en damier)if(z<-1.95&&y>.80&&y<1.0&&Math.abs(x)>.5)return -nz>Math.abs(nx)?'dos':'cote';   // (le coin des feux : jamais vu de dessus, il est vu de dos ou de côté)
        if(z<-2.15&&nz<-.3&&ny<.75&&y<1.05)return 'dos';
        if(z<ZW&&z>ZHT&&y>.9&&ny>.2){const s9=S(z);if(Math.abs(x)<s9[NC+3][0]-.004)return 'dessus';}
        return null;}});
    G.dispose();delete gs[GP];return japFusion(gs,out);};}
  /* LA PROFONDEUR DE LA TÔLE en (x, y) sur le nez (`zFace`, pour poser les lames et l'optique de l'antibrouillard) : par dichotomie sur z, la
     demi-largeur des deux tranches voisines à la hauteur y, interpolée. Calculée une fois (la préchauffe du menu passe ici) et gardée sur le gabarit. */
  const PROF=(MEM&&MEM._prof)||(()=>{const xCote=(s9,y)=>{let m=0;for(let i=1;i<s9.length;i++){const a=s9[i-1],b=s9[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
      const i0=zs.findIndex(z=>z>=1.88),Z9=zs.slice(Math.max(0,i0-1)),xAt=(z,y)=>{let i=0;while(i<Z9.length-2&&Z9[i+1]<z)i++;const t=cl((z-Z9[i])/(Z9[i+1]-Z9[i]),0,1);return mix(xCote(S(Z9[i]),y),xCote(S(Z9[i+1]),y),t);};
      const zFace=(x,y)=>{let a=1.9,b=ZE;for(let k=0;k<20;k++){const m=(a+b)/2;if(xAt(m,y)>x)a=m;else b=m;}return (a+b)/2;};
      const L9=[];for(let k=0;k<11;k++){const y=.274+k*.0275,xe=xBord(F9.grille,y)-.016;if(xe<.05)continue;const r=[];for(let i=0;i<=12;i++){const x=xe*i/12;r.push([x,zFace(x,y)]);}L9.push([y,r]);}
      const x0=.725,y0=.298,F0=[zFace(x0,y0),(zFace(x0+.01,y0)-zFace(x0-.01,y0))/.02,(zFace(x0,y0+.01)-zFace(x0,y0-.01))/.02];
      const o={lames:L9,anti:F0,zf:zFace};if(MEM)MEM._prof=o;return o;})();   // (`zf` : la profondeur de la tôle en (x, y), pour poser les phares)
  K.commit(PL);if(K.muet)return {};
  // la hauteur de la tôle (le dessus) en (x, z)
  const ZS9=zs,SC9=ZS9.map(z=>S(z)),T=z=>{let i=0,j=ZS9.length-1;if(z<=ZS9[0])return SC9[0];if(z>=ZS9[j])return SC9[j];while(j-i>1){const m=(i+j)>>1;if(ZS9[m]<=z)i=m;else j=m;}
    const t=(z-ZS9[i])/(ZS9[j]-ZS9[i]),A=SC9[i],B=SC9[j];return A.map((p,q)=>[p[0]+(B[q][0]-p[0])*t,p[1]+(B[q][1]-p[1])*t]);};
  const yDessus=(x,z)=>{const s=T(z);for(let i=s.length-1;i>0;i--){const a=s[i],b=s[i-1];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0])return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return s[s.length-1][1];};
  // ---- LES DÉTAILS ----
  const P=K.kit(PAL);
  /* LES PHARES (22/10, Léo : « les pièces doivent être bien séparées : des blocs modelés sur mesure puis collés, entassés, comme LA HONTE ») — QUATRE PIÈCES
     EMPILÉES sur la tôle réelle du nez (`PROF.zf`), chacune avec son relief, ses flancs et sa couleur, donc des étages qu'on VOIT :
     1. le BOÎTIER noir mat (le contour du plan, 2,2 cm) · 2. le VERRE fumé, rentré de 1,2 cm, brillant (+1,6 cm de plus) · 3. la LAME DE LED blanche, posée sur le verre
     le long du bord bas (+1 cm) · 4. l'OEIL : le projecteur carré, un bloc chromé en saillie au coin. Chaque pièce est un plateau tendu sur la tôle (contour densifié
     tous les 2,5 cm pour épouser le bombé) fermé par des flancs verticaux — un bloc, pas un dessin. */
  if(!HB){const zf=PROF.zf,dens=Q=>{const o=[];for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.02));for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;};
   const tri3=(k,sd,a,b,c)=>{const A=[sd*a[0],a[1],a[2]],B=[sd*b[0],b[1],b[2]],C=[sd*c[0],c[1],c[2]],nz=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);if(nz<0)P.tri(k,A,C,B);else P.tri(k,A,B,C);};
   const piece=(k,poly,top,bot,sd)=>{const pts=dens(poly),cen=[pts.reduce((a,p)=>a+p[0],0)/pts.length,pts.reduce((a,p)=>a+p[1],0)/pts.length];
     const V=(p,h)=>[p[0],p[1],zf(p[0],p[1])+h];
     for(const f of THREE.ShapeUtils.triangulateShape(pts.map(p=>new THREE.Vector2(p[0],p[1])),[]))tri3(k,sd,V(pts[f[0]],top),V(pts[f[1]],top),V(pts[f[2]],top));
     for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],A=[sd*a[0],a[1],zf(a[0],a[1])+top],B=[sd*b[0],b[1],zf(b[0],b[1])+top],
         C=[sd*b[0],b[1],zf(b[0],b[1])+bot],D=[sd*a[0],a[1],zf(a[0],a[1])+bot],nx=B[1]-A[1],ny=-(B[0]-A[0]),mx=(A[0]+B[0])/2-sd*cen[0],my=(A[1]+B[1])/2-cen[1];
       if(nx*mx+ny*my<0){P.tri(k,A,C,B);P.tri(k,A,D,C);}else{P.tri(k,A,B,C);P.tri(k,A,C,D);}}};
   const yl=x=>x<.462?.621+(.634-.621)*(x-.274)/(.462-.274):.634+(.652-.634)*(x-.462)/(.626-.462);
   const VERRE=rentre9(PH,.022),LED=[[.30,yl(.30)+.020],[.60,yl(.60)+.020],[.60,yl(.60)+.040],[.30,yl(.30)+.040]],OEIL=japRect(.655,.66,.725,.715,.006,2);
   const NET=[[.30,.624],[.462,.634],[.626,.652],[.70,.642],[.745,.662],[.762,.72],[.755,.79],[.72,.775],[.641,.744],[.488,.707],[.30,.672]],
        VNET=[[.34,.638],[.462,.646],[.62,.663],[.69,.654],[.73,.672],[.744,.72],[.738,.768],[.714,.758],[.64,.732],[.488,.697],[.34,.665]],
        ONET=[[.655,.672],[.715,.672],[.715,.722],[.655,.722]],LED2=[[.36,yl(.36)+.012],[.60,yl(.60)+.012],[.60,yl(.60)+.026],[.36,yl(.36)+.026]];   // (le contour net du phare : un pan de 11 points, sans le crochet du plan)
   let VP='d';try{const m=/[?&]phare=([abcde])/.exec(location.search);if(m)VP=m[1];}catch(e){}   // (22/10, banc : `?phare=b|c|d` — trois relevés du phare, Léo choisit)
   for(const sd of [1,-1]){
     piece('d',[[0,.222],[.66,.222],[.78,.238],[.78,.262],[0,.262]],.034,-.010,sd);   // la LAME de bouclier : un patin noir en saillie sur toute la largeur du bas
     piece('k',F9.prise,.016,-.012,sd);                                  // la prise d'air du bouclier : un bloc noir en relief…
     piece('c',japRuban(JONC_L,.022),.026,.008,sd);                      // …et son jonc chromé, posé dessus au bord haut
     if(VP==='e'){piece('k',NET,.010,-.012,sd);piece('W',LED2,.017,.004,sd);}   // e : UNE pièce découpée net (sans la pointe basse) + sa lame de LED, collées par-dessus
     else if(VP==='a'){}                                                       // a : plat, sans pièce (le phare est un aplat de la tôle)
     else if(VP==='b'){piece('k',PH,.012,-.012,sd);piece('W',LED,.020,.008,sd);}                                   // b : UN plateau mince + sa lame de LED
     else if(VP==='c'){piece('k',PH,.014,-.012,sd);piece('g',VERRE,.022,.010,sd);piece('W',LED,.028,.018,sd);}   // c : boîtier, verre brillant, LED — sans l'oeil, bas
     else{piece('k',NET,.032,-.012,sd);piece('h',VNET,.052,.024,sd);piece('W',LED2,.064,.044,sd);piece('c',ONET,.074,.040,sd);}}}   // d : les quatre étages (v. précédente)
  if(HB)for(const sd of [1,-1]){P.box('h',.36,.05,.04,sd*.50,.80,2.235);P.box('W',.30,.014,.03,sd*.50,.76,2.245);P.box('k',.46,.10,.03,sd*.38,.58,2.255);P.box('L',.40,.07,.04,sd*.52,.93,-2.24);}   // phares, lame de LED, bouche, feux : des dalles posées
  // LES RÉTROVISEURS (relevés sur les trois vues) : la coque à la couleur de la caisse, la glace vers l'arrière, le répétiteur orange devant
  P.sym(sd=>{P.box('k',.10,.035,.10,sd*.80,.885,.745,0,0,0);                              // le pied, sur la portière
    const cx=sd*.94,cy=.995,cz=.71;
    {const g=new THREE.SphereGeometry(.08,8,5);   // (affinement : en facettes, plus une bulle)
    P.put('p',g,cx,cy,cz+.01,0,sd*.18,0,1.0,.82,.9);}
    P.box('K',.15,.105,.006,cx-sd*.004,cy-.002,cz-.063,0,sd*.18,0);
    P.box('O',.08,.012,.02,cx+sd*.03,cy-.04,cz+.07,0,sd*.18,0);});
  // L'ANTENNE en aileron, sur le pavillon
  {const g=new THREE.CylinderGeometry(.018,.03,.13,6);g.rotateX(Math.PI/2);P.put('n',g,0,yDessus(0,-1.08)+.03,-1.08,.12,0,0,1,1.2,1);}
  // LES LAMES DE LA BOUCHE : onze barres chromées sur la tôle d'origine, devant le fond noir creusé — elles suivent le nez en flèche (`zFace` : la
  // profondeur de la tôle en (x, y), cherchée tranche à tranche) ; l'OPTIQUE de l'antibrouillard, posée au fond de sa coupelle
  {const LA=K.kit({c:{g:'c',c:0xc7ccd3},q:{g:'g',c:0xd9dde2},K:{g:'g',c:0x0b0b0e}}),h=.0036,ep=.018;
   for(const [y,r] of PROF.lames)for(const sd of [1,-1]){let pv=null;for(const [x,z] of r){const p=[sd*x,y,z+.004];
       if(pv){LA.tri('c',[pv[0],y-h,pv[2]],[p[0],y-h,p[2]],[p[0],y+h,p[2]]);LA.tri('c',[pv[0],y-h,pv[2]],[p[0],y+h,p[2]],[pv[0],y+h,pv[2]]);
         LA.tri('c',[pv[0],y+h,pv[2]],[p[0],y+h,p[2]],[p[0],y+h,p[2]-ep]);LA.tri('c',[pv[0],y+h,pv[2]],[p[0],y+h,p[2]-ep],[pv[0],y+h,pv[2]-ep]);}
       pv=p;}}
   for(const sd of [1,-1]){const x0=.725,y0=.298,[z0,dzx,dzy]=PROF.anti;
     const n=new THREE.Vector3(-sd*dzx,-dzy,1).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),n),e=new THREE.Euler().setFromQuaternion(q),c=new THREE.Vector3(sd*x0,y0,z0).addScaledVector(n,-.009);
     LA.put('K',new THREE.CylinderGeometry(.043,.043,.02,18).rotateX(Math.PI/2),c.x-n.x*.006,c.y-n.y*.006,c.z-n.z*.006,e.x,e.y,e.z);                       // le fond de l'optique
     LA.put('c',new THREE.TorusGeometry(.034,.006,6,18),c.x+n.x*.007,c.y+n.y*.007,c.z+n.z*.007,e.x,e.y,e.z);                     // son cerclage chromé
     LA.put('q',new THREE.CircleGeometry(.03,18),c.x+n.x*.008,c.y+n.y*.008,c.z+n.z*.008,e.x,e.y,e.z);}                          // la glace
   K.commit(LA);}
  // LES ESSUIE-GLACES, couchés sur la grille d'auvent
  for(const x of [-.36,.12])P.box('k',.56,.012,.018,x,yDessus(Math.abs(x),1.17)+.012,1.17,0,-.08,0);
  // LE SUPPORT DE PLAQUE, entre les feux : une boîte claire que la plaque du jeu reconnaît (`plqDessinee`)
  P.box('Q',.40,.11,.006,0,.755,-2.232);
  // LA JOUE DES PASSAGES DE ROUE
  {const joue=(w,A9)=>{const o=[],a9=A9[A9.length-1][0];for(let i=A9.length-1;i>=0;i--){const p=A9[i];if(p[1]>=.17)o.push([w-p[0]*1.02,p[1]+.01]);}
      o.unshift([w-a9,.17]);for(let i=1;i<A9.length;i++){const p=A9[i];if(p[1]>=.17)o.push([w+p[0]*1.02,p[1]+.01]);}o.push([w+a9,.17]);return o;};
   P.sym(sd=>{P.prism('d',joue(ZF,ARF),.02,sd*.66);P.prism('d',joue(ZR,ARR),.02,sd*.66);});}
  K.commit(P);
  // ---- LE POT : discret, sous le bouclier, à gauche ----
  let pots=[[.50,.25,-2.27]];
  if(typeof ECHP==='object'&&ECHP.reel&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.reel(E,{r:.03,k:'c',len:.30,pts:[[.50,.25,-2.27]]});K.commit(E);}
  // ---- LA JANTE À DIX DOUBLES BRANCHES (17 pouces), bicolore : le fond anthracite, les faces usinées argent, le rebord poli ; le pneu 225/45 ----
  const JW=.21,hw=JW/2,fx=hw-.03,RJ=.208,J=lpKit({k:{g:'m',c:0x161719},a:{g:'c',c:0xc8ccd2},s:{g:'s',c:0x2f3136},d:{g:'m',c:0x0f1013}});
  J.lathe('k',[[RJ,-hw],[R*.92,-hw],[R,-hw*.62],[R,hw*.62],[R*.92,hw],[RJ,hw]],24,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.012],[RJ+.004,fx+.002],[RJ-.01,fx+.006],[RJ-.018,fx-.006]],24,0,0,0,'x');
  J.lathe('d',[[RJ-.02,-hw+.02],[RJ-.02,fx-.02],[.06,fx-.035],[0,fx-.035]],20,0,0,0,'x');
  {const sh=new THREE.Shape();sh.moveTo(-.0075,.06);sh.lineTo(.0075,.06);sh.lineTo(.005,.194);sh.lineTo(-.005,.194);sh.lineTo(-.0075,.06);
   for(let q=0;q<20;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.018,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:1,curveSegments:1});
     g.rotateY(-Math.PI/2);g.rotateX(Math.floor(q/2)/10*Math.PI*2+(q%2?.075:-.075));g.translate(fx-.004,0,0);J.put('s',g,0,0,0);   // (le flanc anthracite…)
     const f=new THREE.ShapeGeometry(sh);f.rotateY(Math.PI/2);f.rotateX(Math.floor(q/2)/10*Math.PI*2+(q%2?.075:-.075));f.translate(fx+.0175,0,0);J.put('a',f,0,0,0);}}   // (…et la face usinée)
  J.lathe('s',[[.064,fx-.03],[.062,fx+.004],[.05,fx+.012],[0,fx+.014]],16,0,0,0,'x');
  J.lathe('a',[[.034,fx+.012],[.03,fx+.022],[0,fx+.025]],12,0,0,0,'x');
  const JG=J.done();
  return {hl:[.60,.65,2.20],tl:[.62,.93,-2.23],wx:.765,wzF:ZF,wzR:-ZR,pots:pots,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xc4c8ce}};
};
// <<< SHAPES.corolla (JAPONAISES) — fin >>>
// <<< SHAPES.pikes (JAPONAISES) — début >>>
SHAPES.pikes=function(K){
  /* LA BÊTE — la bête de course de côte de 2013 (la ligne de la Peugeot 208 T16 Pikes Peak : 875 chevaux pour 875 kilos, le record de la
     montagne en 8 min 13 s), en livrée « un peu boisson énergisante » SANS AUCUN logo ni lettrage : bleu nuit mat, rouge, argent, le soleil
     jaune. Tout vient de son PLAN COTÉ (the-blueprints, quatre vues, 172 px/m, empattement 2,695 m, 4,50 × 2,00 × 1,30 m) : la caisse de
     citadine à trois portes étirée sur des ailes de 2 m, le pare-brise très couché (1,26 → 0,42), le pavillon à 1,275 m, le hayon qui plonge ;
     puis, posés dessus, LE GRAND BOUCLIER-LAME (un plateau au ras du sol qui dépasse de 25 cm, deux lames verticales aux coins), L'ÉNORME
     AILERON (1,97 m, deux éléments, joues de 50 cm, sur deux cols de cygne plantés dans le hayon), l'écope de toit et son antenne, le becquet de
     pavillon, les ouïes du capot et des ailes, le diffuseur et ses dérives. Découpés dans la tôle (`japDecoupe`) : vitres, montants, phares,
     feux, la grande bouche et ses radiateurs, les ouïes ; joints et plis ; et la livrée (`LIVREE`). Jantes multibranches 18", écrou doré.
     Repère : x à droite, y en haut, z vers l'avant, mètres. */
  const U=LPU,R=.355,ZF=1.347,ZR=-1.347,ZE=2.14,ZB=-2.0;
  const L=(t,z)=>U.lin(t,z),cl=(v,a,b)=>v<a?a:v>b?b:v,mix=(a,b,t)=>a+(b-a)*t;
  // LA LIVRÉE (à choisir par Léo) : 'A' proche de l'originale (le blanc devant, le bleu nuit derrière, la vague rouge, le soleil) ·
  // 'B' plus libre (tout en bleu nuit mat, l'argent en bas, deux filets rouges, un grand soleil cerclé de rouge)
  const LIVREE='A';
  const NUIT=0x1a2240,BLANC=0xf1f2f4,ROUGE=0xd51029,JAUNE=0xffc21a,ARG=0xb5bac3;
  const PAL={p:LIVREE==='A'?{g:'p',c:BLANC}:{g:'s',c:NUIT},k:{g:'m',c:0x111214},C:{g:'s',c:0x1b1c21},K:{g:'g',c:0x0b0b0e},g:{g:'g',c:0x141c26},
    n:{g:'g',c:0x0e0f12},W:{g:'l',c:0xf2f6ff},L:{g:'l',c:0xd0101e},a:{g:'k',c:ARG},o:{g:'o',c:0xd9a520},d:{g:'m',c:0x0d0e11},
    R:{g:'p',c:ROUGE},Y:{g:'p',c:JAUNE},N:{g:'s',c:NUIT},B:{g:'p',c:0x1e78d8},w:{g:'p',c:BLANC},Q:{g:'l',c:0xe6e6e6}};
  // ---- LES COTES DU PLAN (mètres) ----
  const XM=[[ZB,.70],[-1.99,.80],[-1.97,.88],[-1.94,.94],[-1.90,.97],[-1.84,.985],[-.95,.985],[-.86,.95],[-.75,.925],[.80,.925],[.92,.95],[1.0,.985],
            [1.80,.985],[1.92,.975],[2.0,.955],[2.06,.92],[2.10,.86],[2.125,.78],[ZE,.68]],
        YT=[[ZB,.50],[-1.99,.56],[-1.97,.60],[-1.93,.66],[-1.88,.71],[-1.80,.76],[-1.65,.83],[-1.50,.88],[-1.30,.92],[-1.10,.93],[-.90,.915],[-.60,.90],
            [0,.885],[.60,.88],[.95,.885],[1.0,.92],[1.15,.925],[1.35,.912],[1.50,.885],[1.60,.86],[1.70,.82],[1.80,.765],[1.88,.725],[1.95,.69],
            [2.03,.65],[2.08,.62],[2.11,.58],[ZE,.54]],
        YC=[[ZB,.53],[-1.99,.56],[-1.96,.63],[-1.90,.71],[-1.80,.79],[-1.70,.85],[-1.55,.93],[-1.40,1.01],[-1.25,1.10],[-1.10,1.17],[-1.0,1.215],[-.85,1.24],
            [-.60,1.258],[-.30,1.27],[0,1.275],[.20,1.27],[.42,1.258],[1.26,.90],[1.40,.86],[1.60,.82],[1.80,.775],[1.95,.72],[2.05,.66],[2.10,.61],[ZE,.55]],
        YB=[[ZB,.15],[-1.97,.09],[-1.80,.075],[1.80,.075],[2.0,.09],[ZE,.13]],
        ARF=[[0,.77],[.10,.757],[.20,.72],[.28,.672],[.34,.61],[.38,.53],[.405,.44],[.415,.35],[.418,0]],
        ARR=[[0,.73],[.10,.718],[.20,.684],[.28,.636],[.34,.574],[.375,.50],[.40,.41],[.41,.33],[.412,0]];
  const xM=z=>L(XM,z),yT=z=>L(YT,z),yB0=z=>L(YB,z),yC=z=>L(YC,z);
  /* LA SERRE (z = 1.26 le pied du pare-brise, −1.0 le haut du hayon) : le bord du toit `YR` (le haut des vitres latérales + 2 cm), posé dans
     le plan des vitres (rentrée de ~37°, relevée vue de face : épaule à ±0,86, pavillon à ±0,55) ; devant, le montant de pare-brise. */
  const ZW=1.26,ZHT=-1.0;
  const YR=[[-1.12,1.10],[-.97,1.19],[-.70,1.23],[-.38,1.245],[.10,1.245],[.42,1.235]];
  const zone=z=>z>ZW?'capot':z>=ZHT?'serre':'hayon';
  const DX=[[0,.05],[.06,.02],[.15,0],[.55,0],[.65,.012],[.75,.035],[.85,.07],[.93,.10],[1.0,.12]];
  const TS=[.04,.12,.25,.40,.55,.68,.78,.87,.94],NC=2+TS.length;
  const S0=z=>{const xm=xM(z),y0=yB0(z),yt=yT(z),zo=zone(z),kx=Math.min(1,xm/.62),H=Math.max(.04,yt-y0);
    const yb=Math.max(y0,L(ARF,Math.abs(z-ZF)),L(ARR,Math.abs(z-ZR)));
    const s=[[0,yb],[xm-.10*kx,yb]];
    const B9=Math.max(y0,yb),H9=Math.max(.04,yt-B9);   // (affinement : au-dessus d'un passage de roue, le flanc se répartit entre l'arche et l'épaule — tassé sur l'arche, il faisait des bandes)
    let pr=yb;for(let i=0;i<TS.length;i++){let h=Math.max(B9+TS[i]*H9,pr+.0015);h=Math.min(h,yt-(TS.length-i)*.0015);if(h<pr+.0005)h=pr+.0005;pr=h;s.push([xm-L(DX,cl((h-B9)/H9,0,1))*kx,h]);}
    const xb=xm-.12*kx;
    if(zo==='capot'){const yh=yC(z);   // la crête des ailes, puis le capot qui se creuse entre elles (il est plus bas que les ailes : vu de face, .80 contre .87)
      s.push([xb+.004,yt+.004],[xm*.80,yt-.012],[xm*.66,mix(yt,yh,.55)],[xm*.50,yh+.012],[xm*.33,yh+.004],[xm*.16,yh],[0,yh]);}
    else{   // la serre, puis le hayon (mêmes formules : la jonction ne fait pas d'arête) — au hayon, le bord du toit descend avec la lunette
      let yr=z>.42?mix(1.235,yt+.01,(z-.42)/(ZW-.42)):z>=-1.12?L(YR,z):mix(yt,yC(z),.82);yr=Math.max(yr,yt+.01);
      const xr=Math.min(xb-.012,xb-.75*(yr-yt)),yc=Math.max(yC(z),yr+.004);
      s.push([xb,yt],[xb-.008,yt+.012],[mix(xb,xr,.5)+.004,mix(yt,yr,.5)],[xr,yr],[xr-.06,yr+(yc-yr)*.64],[xr*.58,yc-.005],[0,yc]);}
    if(zo!=='capot')for(let i=NC+1;i<s.length;i++)s[i][1]=Math.max(s[i][1],s[i-1][1]);
    if(z>=ZE-1e-6||z<=ZB+1e-6)for(const q of s)q[0]*=.02;   // (les deux bouts se replient sur l'axe : la face est une bande du loft)
    return s;};
  const SM=new Map(),S=z=>{const k=Math.round(z*2000);let s=SM.get(k);if(!s){s=S0(k/2000);SM.set(k,s);}return s;};
  const zs0=[ZB,ZB+.003,-1.99,-1.98,-1.97,-1.955,-1.94,-1.92,-1.90,-1.87,-1.84,-1.80,-1.75,-1.70,-1.62,-1.55,-1.48,-1.40,-1.32,-1.25,-1.18,-1.10,ZHT,ZHT-.004,
    -.95,-.90,-.85,-.75,-.65,-.55,-.45,-.35,-.25,-.15,-.05,.05,.15,.25,.35,.42,.50,.60,.70,.80,.88,.95,1.0,1.06,1.12,1.18,ZW,ZW+.004,1.32,1.40,1.48,1.56,
    1.64,1.72,1.80,1.86,1.92,1.97,2.01,2.04,2.07,2.09,2.105,2.115,2.125,2.132,ZE-.003,ZE];
  for(const [w,a] of [[ZF,.418],[ZR,.412]])for(const f of [0,.2,.4,.55,.7,.8,.88,.95,.99,1])zs0.push(w-a*f,w+a*f);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.002);
  const peint=(j,z)=>j===0&&z<2.10&&z>-1.96?'k':'p';
  const EP=(typeof peintPal==='function'?peintPal(PAL):PAL).p,GP=EP.g;
  /* (23/10, Léo : « traduis dans le style de LA HONTE, fidèle à la Fidèle ») `?honte=1` : la VRAIE forme (les sections du plan) taillée en quelques GROS pans — une tranche par grand changement
     de ligne —, sans découpe au plan ; les vitres, les phares, la bouche sont des pièces posées. */
  const zsB=[ZB,-2.28,-2.236,-2.0,-1.87,-1.36,-1.10,-.50,.30,.50,1.05,1.26,1.60,2.0,2.24,2.28,ZE,ZF-.36,ZF-.18,ZF+.18,ZF+.36,ZR-.36,ZR-.18,ZR+.18,ZR+.36].sort((a,b)=>a-b).filter((z,i,a)=>i===0||z-a[i-1]>.003);
  /* EN BRIQUES (`?honte=1`) : chaque tranche est une section de 6 points, des BRIQUES — le dessous, le flanc DROIT, l'épaulement plat, la cabine à flancs droits, le toit —, mesurées sur la vraie section (largeur, hauteur de l'épaule, du toit, du bord de verre) :
     la forme de La Fidèle, taillée comme les caisses de LA HONTE, mais proprement (peu de plis, aucune diagonale parasite). */
  const SB=z=>{const s=S(z),xm=s[1][0]+.10*Math.min(1,s[1][0]/.62),yb=s[0][1],yt=s[NC][1],yc=s[s.length-1][1],cab=z<=ZW&&z>=ZHT,xr=cab?s[NC+3][0]:xm*.93,yr=cab?s[NC+3][1]:yt;
    const sx=z>=ZE-1e-6||z<=ZB+1e-6?.02:1;return [[0,yb],[xm*sx,yb],[xm*sx,yt],[xr*sx,yt],[xr*sx,Math.max(yr,yt+.01)],[0,yc]];};
  const peintB=(j,z)=>j===0?'k':(j===3&&z<1.0&&z>-1.3)?'g':(j===4&&z<1.26&&z>-1.87&&(z>.3||z<-1.2))?'g':'p';
  const PL=K.kit(PAL);
  if(HB){   /* (23/10, Léo : « empiler des formes TRÈS PLATES pour construire, comme LA HONTE, mais avec plus de couches ») LA FIDÈLE EN DALLES : la vraie silhouette taillée en TRANCHES HORIZONTALES de 5 cm ;
     dans chaque tranche, des dalles (une par tronçon de même largeur, mesurée sur la vraie section à cette hauteur) — le bas, la caisse, la ceinture, la cabine de verre, le toit : un empilement, des marches, comme un modèle en briques. */
    const xAt=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
    const DY=.05,Y0=.22,Y1=1.43,DZ=.09;
    for(let yc=Y0+DY/2;yc<Y1;yc+=DY){const top=yc+DY>Y1-.001;let run=null;
      const flush=z1=>{if(run&&run.w>.02){const L=z1-run.z0;PL.box(run.k,2*run.w,DY+.002,L,0,yc,(run.z0+z1)/2);}run=null;};
      for(let z=ZB+DZ/2;z<ZE;z+=DZ){const sc=S(Math.max(ZB+.001,Math.min(ZE-.001,z))),w=Math.round(xAt(sc,yc)/.03)*.03,
          k=(!top&&yc>1.00&&z<ZW-.02&&z>ZHT+.02&&w<.72)?'g':'p';
        if(!run||run.w!==w||run.k!==k){flush(z-DZ/2);run={w:w,k:k,z0:z-DZ/2};}}
      flush(ZE);}
  }else PL.loft(zs,S,peint);
  // ---- LA DÉCOUPE AU PLAN (`japDecoupe`) ----
  const MEM=(typeof SHAPES==='object'&&SHAPES.pikes)||null;
  const av=(x,y,z,nx,ny,nz)=>z>1.95&&nz>.2,ar=(x,y,z,nx,ny,nz)=>z<-1.8&&nz<-.2,cs=(x,y,z,nx,ny,nz)=>Math.abs(nx)>.45;
  const TOUT=[[-3,-1],[3,-1],[3,2],[-3,2]];
  const VAGUE=[[2.20,.32],[1.80,.40],[1.40,.47],[.90,.50],[.30,.53],[-.20,.58],[-.45,.66],[-.58,.80],[-.62,1.0],[-.60,1.45]];   // la limite du bleu nuit (lecture A)
  // la livrée, vue par vue (en tête de liste : les vitres, les feux et les ouïes passent devant)
  const LV=LIVREE==='A'?{
    cote:[{k:'N',p:[[2.5,-.2],[2.5,.30]].concat(VAGUE,[[-2.5,1.45],[-2.5,-.2]]),axe:false},                                    // le bleu nuit : le bas de caisse, puis toute la poupe…
          {k:'R',p:japRuban(VAGUE.slice(0,-1).map(p=>[p[0]+.02,p[1]+.035]),.04),axe:false},                                        // …souligné du filet rouge
          {k:'Y',p:japOvale(-.08,.31,.17,.17,28),axe:false},                                                                       // le soleil jaune, sur la portière
          {k:'a',p:[[2.5,-.2],[-2.5,-.2],[-2.5,.165],[2.5,.165]],axe:false}],                                                      // le bas de caisse argent
    dessus:[{k:'N',p:[[.20,0],[.20,1.3],[-2.5,1.3],[-2.5,0]]},{k:'N',p:[[1.29,0],[1.29,.44],[1.92,.64],[1.92,0]]},                // le pavillon et le trapèze du capot…
            {k:'R',p:[[2.25,0],[2.25,1.1],[1.95,1.1],[1.92,0]]}],                                                                 // …et le nez rouge
    face:[{k:'R',p:[[0,.57],[.58,.595],[.64,.655],[.60,.70],[0,.685]]},
          {k:'B',p:[[.66,.13],[.74,.13],[.99,.47],[.99,.58],[.92,.58]],axe:false},{k:'R',p:[[.74,.13],[.82,.13],[.99,.36],[.99,.47]],axe:false},
          {k:'Y',p:[[.82,.13],[.90,.13],[.99,.25],[.99,.36]],axe:false}],
    dos:[{k:'N',p:TOUT,axe:false,gate:(x,y,z)=>z<-.9}]}:{
    cote:[{k:'a',p:[[2.5,-.2],[-2.5,-.2],[-2.5,.20],[2.5,.20]],axe:false},
          {k:'R',p:japRuban([[2.10,.60],[1.80,.74],[1.40,.84],[.90,.845],[0,.835],[-.90,.85],[-1.40,.86],[-1.75,.77],[-1.97,.62]],.02),axe:false},
          {k:'R',p:japOvale(.02,.555,.285,.285,32),axe:false},{k:'Y',p:japOvale(.02,.555,.255,.255,32),axe:false}],
    dessus:[{k:'R',p:[[2.3,.065],[-2.3,.065],[-2.3,.115],[2.3,.115]]}],
    face:[{k:'R',p:[[0,.57],[.58,.595],[.64,.655],[.60,.70],[0,.685]]},{k:'a',p:[[0,.12],[.99,.12],[.99,.185],[0,.185]]}],
    dos:[{k:'R',p:japDemi(.99,.50,.545,.004,1)},{k:'a',p:[[0,.12],[.99,.12],[.99,.20],[0,.20]]}]};
  const SL=[];for(let y=.235;y<.48;y+=.03)SL.push({k:'a',p:japRect(.055,y-.0045,.375,y+.0045,.003,1),gate:av});   // les lames des radiateurs
  const LOU=[];for(const z0 of [1.12,1.19,1.26,1.33,1.40])LOU.push({k:'K',p:japRect(z0,.66,z0+.04,.84,.01,2),gate:(x,y,z,nx,ny,nz)=>ny>.4&&z>1.0&&z<1.5});   // les ouïes des ailes
  const ZN={
    face:japZones(LV.face.map(q=>Object.assign({gate:av},q)).concat([
      {k:'K',p:[[0,.18],[.42,.18],[.48,.21],[.50,.27],[.50,.47],[.47,.52],[0,.52]],gate:av},                                    // la GRANDE BOUCHE…
      {k:'n',p:japRect(.05,.22,.38,.49,.01,2),gate:av}],SL,[                                                                   // …ses deux radiateurs et leurs lames
      {k:'K',p:[[.60,.70],[.65,.765],[.76,.785],[.86,.75],[.87,.67],[.80,.62],[.68,.615]],gate:av},                            // les PHARES…
      {k:'W',p:japOvale(.70,.70,.034,.034,14),gate:av},{k:'W',p:japOvale(.80,.705,.03,.03,14),gate:av},                       // …leurs deux optiques
      {k:'W',p:japRuban([[.62,.72],[.70,.76],[.82,.755]],.01),gate:av,axe:false}])),                                          // …et leur filet de LED
    cote:japZones(LV.cote.map(q=>Object.assign({gate:cs},q)).concat([
      {k:'K',p:[[.95,.90],[.47,1.13],[.71,.865]],gate:cs},                                                                     // le triangle du montant
      {k:'g',p:[[.47,1.13],[.30,1.19],[.10,1.215],[-.15,1.22],[-.19,.915],[.30,.885],[.71,.865]],gate:cs},                     // la vitre de portière
      {k:'K',p:[[-.15,1.225],[-.38,1.225],[-.35,.91],[-.19,.915]],gate:cs},                                                    // le montant milieu
      {k:'g',p:[[-.38,1.225],[-.70,1.21],[-.97,1.165],[-1.06,1.11],[-1.10,1.065],[-.89,.99],[-.35,.91]],gate:cs},              // la custode
      {k:'K',p:[[2.08,.70],[1.95,.75],[1.80,.765],[1.77,.735],[1.85,.65],[1.97,.59],[2.07,.61]],gate:(x,y,z,nx,ny,nz)=>z>1.7},  // le phare vu de côté…
      {k:'W',p:japRuban([[2.03,.66],[1.93,.71],[1.82,.735]],.012),gate:(x,y,z,nx,ny,nz)=>z>1.7,axe:false},                     // …son filet de LED
      {k:'L',p:[[-1.55,.86],[-1.67,.845],[-1.78,.76],[-1.86,.64],[-1.80,.63],[-1.68,.70],[-1.58,.77]],gate:(x,y,z,nx,ny,nz)=>z<-1.45}])),   // le feu
    dos:japZones(LV.dos.map(q=>Object.assign({gate:ar},q)).concat([
      {k:'g',p:[[0,1.20],[.48,1.195],[.60,1.14],[.64,1.0],[.60,.92],[0,.91]],gate:(x,y,z,nx,ny,nz)=>z<-.95&&nz<-.1},          // la LUNETTE du hayon
      {k:'L',p:[[.52,.70],[.55,.80],[.66,.86],[.80,.87],[.89,.84],[.92,.74],[.86,.63],[.72,.585],[.60,.60]],gate:ar},          // les FEUX
      {k:'K',p:japRect(0,.53,.34,.71,.04,3),gate:ar}])),                                                                       // le creux de la plaque
    dessus:japZones(LV.dessus.map(q=>Object.assign({gate:(x,y,z,nx,ny,nz)=>ny>.2},q)).concat([
      {k:'g',p:[[1.27,0],[1.25,.30],[1.18,.52],[1.08,.60],[.90,.61],[.72,.53],[.71,0]],gate:(x,y,z,nx,ny,nz)=>z>.6&&z<1.3&&ny>.2},   // le PARE-BRISE…
      {k:'K',p:[[.71,0],[.72,.53],[.55,.51],[.42,.47],[.42,0]],gate:(x,y,z,nx,ny,nz)=>z>.38&&z<.75&&ny>.2},                    // …son bandeau teinté
      {k:'K',p:[[1.84,.52],[1.58,.60],[1.52,.32],[1.70,.26]],creux:.02,gate:(x,y,z,nx,ny,nz)=>z>1.45&&ny>.3}],LOU))};           // les OUÏES du capot
  const LGN={
    cote:japLignes([{k:'j',p:[[.82,.30],[.83,.60],[.82,.88]]},{k:'j',p:[[-.48,.30],[-.50,.60],[-.47,.91]]},{k:'j',p:[[.82,.30],[-.48,.30]]},
      {k:'h',p:[[.68,.39],[-.42,.88]]}]),
    dessus:japLignes([{k:'j',p:[[1.29,0],[1.29,.50],[1.40,.66],[2.10,.70]]},{k:'j',p:[[-1.0,0],[-1.0,.55]]}]),
    face:japLignes([]),dos:japLignes([{k:'j',p:[[0,.88],[.62,.88],[.72,.92]],gate:ar}])};
  const CODES={p:{g:GP},gap:{g:GP,c:0x202228},K:{g:'g',c:PAL.K.c,lisse:1},g:{g:'g',c:PAL.g.c,lisse:1},n:{g:'g',c:PAL.n.c},W:{g:'l',c:0xf2f6ff},
    L:{g:'l',c:0xc80c1c},a:{g:'k',c:ARG},R:{g:'p',c:ROUGE},Y:{g:'p',c:JAUNE},N:{g:'s',c:NUIT},B:{g:'p',c:0x1e78d8}};
  if(!HB){const f2=PL.done;PL.done=()=>{const gs=f2(),G=gs[GP];if(!G)return gs;
    const out=japDecoupe(G,{zones:ZN,lignes:LGN,codes:CODES,ns:()=>japLisse(G,32),GP:GP,colP:japColP(EP),cache:MEM,
      vue:(x,y,z,ax,ay,az,nx,ny,nz)=>{if(z>2.0&&nz>.3&&ny<.85&&y<.80)return 'face';
        if(z<-.95&&y>.86&&nz<-.1){const s9=S(z);if(Math.abs(x)<s9[NC+3][0]-.004)return 'dos';}   // (le hayon : la lunette est lue de dos)
        if(z<-1.8&&nz<-.3&&y<.95)return 'dos';
        if(z<ZW&&z>ZHT&&y>.9&&ny>.2){const s9=S(z);if(Math.abs(x)<s9[NC+3][0]-.004)return 'dessus';}
        return null;}});
    G.dispose();delete gs[GP];return japFusion(gs,out);};}
  K.commit(PL);if(K.muet)return {};
  // ---- LES PIÈCES POSÉES ----
  const P=K.kit(PAL);
  const clip=(Sb,Cp)=>{let o=Sb;for(let i=0;i<Cp.length;i++){const a=Cp[i],b=Cp[(i+1)%Cp.length],ins=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=0,I=[];
      for(let j=0;j<o.length;j++){const p=o[j],q=o[(j+1)%o.length],ip=ins(p),iq=ins(q);if(ip)I.push(p);
        if(ip!==iq){const dx=q[0]-p[0],dy=q[1]-p[1],ex=b[0]-a[0],ey=b[1]-a[1],t=(ex*(p[1]-a[1])-ey*(p[0]-a[0]))/(ey*dx-ex*dy);I.push([p[0]+dx*t,p[1]+dy*t]);}}o=I;if(!o.length)break;}return o;};
  // LE BOUCLIER-LAME : le plateau au ras du sol, et les deux lames verticales de ses coins (rayées de couleurs)
  P.box('k',1.96,.024,.46,0,.088,2.15);P.box('C',1.96,.03,.02,0,.098,2.375);
  const LAME=[[1.76,.10],[2.38,.10],[2.37,.29],[1.87,.52],[1.76,.52]];
  const RAY=LIVREE==='A'?[['B',1.96],['R',2.03],['Y',2.10]]:[['R',2.0],['Y',2.08]];
  P.sym(sd=>{P.prism(LIVREE==='A'?'w':'a',LAME,.024,sd*.972);
    for(const [k,c] of RAY){const st=[[c,.10],[c+.065,.10],[c+.065-.25,.55],[c-.25,.55]],q=clip(st,LAME);if(q.length>2)P.prism(k,q,.006,sd*(.972+.015));}});
  // L'AILERON : deux éléments en profil d'aile (1,97 m), les joues, les deux cols de cygne plantés dans le hayon
  P.prism('C',[[-1.86,1.53],[-1.92,1.565],[-2.02,1.585],[-2.17,1.62],[-2.17,1.60],[-2.02,1.556],[-1.92,1.524]],1.97,0);
  P.prism(LIVREE==='A'?'N':'R',[[-2.06,1.632],[-2.12,1.665],[-2.185,1.70],[-2.19,1.686],[-2.11,1.647],[-2.06,1.622]],1.97,0);
  P.sym(sd=>{P.prism('C',[[-1.85,1.70],[-2.20,1.70],[-2.20,1.19],[-2.05,1.19],[-1.84,1.47]],.012,sd*.99);
    P.prism('C',[[-1.63,.97],[-1.79,.97],[-2.03,1.535],[-1.87,1.535]],.02,sd*.13);});   // (les cols de cygne : deux grandes plaques de carbone)
  // LE BECQUET DE PAVILLON, son feu stop ; L'ÉCOPE DE TOIT et son antenne
  P.prism(LIVREE==='A'?'N':'p',[[-.92,1.235],[-1.52,1.232],[-1.53,1.215],[-1.30,1.198],[-.96,1.205]],1.20,0);
  P.box('L',.30,.018,.02,0,1.236,-1.50);
  P.prism(LIVREE==='A'?'N':'a',[[-.28,1.262],[-.30,1.40],[-.36,1.416],[-.60,1.402],[-.86,1.29],[-.88,1.258]],.28,0);
  P.box('K',.24,.105,.012,0,1.338,-.287);P.cyl('k',.006,.16,6,0,1.47,-.48,'y');
  // LES RÉTROVISEURS de course : un pied, une coque carbone, la glace
  P.sym(sd=>{P.box('C',.10,.03,.05,sd*.86,.97,.80);P.box('C',.14,.08,.07,sd*.95,1.0,.79,0,sd*.12,0);P.box('K',.12,.065,.006,sd*.952,1.0,.753,0,sd*.12,0);});
  // LE DIFFUSEUR et ses dérives, les bavettes derrière les roues, les bas de caisse
  P.box('k',1.30,.02,.48,0,.16,-1.80,-.25,0,0);
  for(const x of [-.45,-.20,.20,.45])P.box('k',.012,.11,.46,x,.19,-1.82);   // (affinement : les dérives ne pendent plus sous la poupe)
  P.sym(sd=>{P.box('k',.02,.36,.26,sd*.965,.22,-1.80);P.box('k',.05,.05,2.05,sd*.905,.085,0);
    P.box('C',.16,.012,.11,sd*.90,.40,2.07,0,0,sd*.12);P.box('C',.14,.012,.10,sd*.91,.30,2.08,0,0,sd*.10);});   // (les canards du bouclier)
  // LE SUPPORT DE PLAQUE (la plaque du jeu le reconnaît : `plqDessinee`)
  P.box('Q',.40,.11,.006,0,.62,-2.003);
  // LA JOUE DES PASSAGES DE ROUE
  {const joue=(w,A9)=>{const o=[],a9=A9[A9.length-1][0];for(let i=A9.length-1;i>=0;i--){const p=A9[i];if(p[1]>=.17)o.push([w-p[0]*1.02,p[1]+.01]);}
      o.unshift([w-a9,.17]);for(let i=1;i<A9.length;i++){const p=A9[i];if(p[1]>=.17)o.push([w+p[0]*1.02,p[1]+.01]);}o.push([w+a9,.17]);return o;};
   P.sym(sd=>{P.prism('d',joue(ZF,ARF),.02,sd*.66);P.prism('d',joue(ZR,ARR),.02,sd*.66);});}
  K.commit(P);
  // ---- LE POT : un gros tube au centre-droit, sous le diffuseur ----
  let pots=[[.30,.30,-1.99]];
  if(typeof ECHP==='object'&&ECHP.reel&&typeof ECH_PAL==='object'){const E=K.kit(ECH_PAL);E.ech=1;ECHP.reel(E,{r:.045,k:'c',len:.32,pts:[[.30,.30,-1.99]]});K.commit(E);}
  // ---- LA JANTE MULTIBRANCHE (18 pouces), argent, l'écrou central doré ; le pneu slick 30/68 ----
  const JW=.32,hw=JW/2,fx=hw-.03,RJ=.235,J=lpKit({k:{g:'m',c:0x161719},a:{g:'k',c:0xc0c4cb},o:{g:'o',c:0xd9a520},d:{g:'m',c:0x0f1013},s:{g:'s',c:0x3a3c42}});
  J.lathe('k',[[RJ,-hw],[R*.92,-hw],[R,-hw*.66],[R,hw*.66],[R*.92,hw],[RJ,hw]],26,0,0,0,'x');
  J.lathe('a',[[RJ,fx-.012],[RJ+.004,fx+.002],[RJ-.01,fx+.006],[RJ-.018,fx-.006]],26,0,0,0,'x');
  J.lathe('d',[[RJ-.02,-hw+.02],[RJ-.02,fx-.02],[.06,fx-.04],[0,fx-.04]],20,0,0,0,'x');
  {const sh=new THREE.Shape();sh.moveTo(-.008,.055);sh.lineTo(.008,.055);sh.lineTo(.005,.222);sh.lineTo(-.005,.222);sh.lineTo(-.008,.055);
   for(let q=0;q<14;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:1,curveSegments:1});
     g.rotateY(-Math.PI/2);g.rotateX(q/14*Math.PI*2);g.translate(fx-.002,0,0);J.put('a',g,0,0,0);}}
  J.lathe('s',[[.066,fx-.03],[.064,fx+.004],[.05,fx+.012],[0,fx+.014]],16,0,0,0,'x');
  J.lathe('o',[[.036,fx+.012],[.034,fx+.03],[.02,fx+.036],[0,fx+.036]],6,0,0,0,'x');   // l'écrou central, hexagonal, doré
  const JG=J.done();
  return {hl:[.74,.70,2.07],tl:[.74,.73,-1.93],wx:.82,wzF:ZF,wzR:-ZR,pots:pots,lamps:0,halos:0,
          roueDeco:w=>{for(const g in JG){const m=new THREE.Mesh(JG[g],(K.mats&&K.mats[g])||(typeof lpMat==='function'?lpMat(g):null));m.userData.lp=1;w.add(m);}},
          lpw:{R:R,w:JW,style:'nyan',jante:0xc0c4cb}};
};
// <<< SHAPES.pikes (JAPONAISES) — fin >>>
// · · ·
// · · ·
// · · ·
// <<< SHAPES.mx5na (JAPONAISES) — début >>>
/* ===== LES OUTILS DES JAPONAISES (2026-10-18, discussion JAPONAISES : MX-5 NA, MX-5 RF, AE86, Corolla) — la méthode de LA PERLE
   rendue GÉNÉRIQUE : la tôle d'un loft DÉCOUPÉE au plan (vitres, feux, bouches, joints, plis), sans recopier `peintPlan` à chaque caisse.
   · `japZones(L)` : des contours [[u,v],…] (+ code k, porte `gate`, creux) → zones prêtes à découper (segments, boîte) ;
   · `japLignes(L)` : des traits du plan → bandes à découper (joint = interstice sombre ; pli = arête de lumière) ;
   · `japDecoupe(G, o)` : la géométrie de la tôle (non indexée) découpée dans la vue qui regarde chaque triangle — chaque morceau prend
     la matière du dernier contour qui le contient ; les joints creusent un interstice, les plis inclinent la laque ; gardé sur `o.cache`.
   Repère des vues (comme le plan) : côté (z, y), dessus (z, |x|), face (|x|, y), dos (|x|, y) — tout est SYMÉTRIQUE (un seul flanc décrit).
   Formes : `japOvale`, `japRect` (rectangle aux coins ronds), `japLisse` (normales lissées, arêtes gardées). ===== */
function japOvale(cx,cy,rx,ry,n,a0,a1){const o=[];n=n||20;a0=a0||0;a1=a1==null?Math.PI*2:a1;const f=a1-a0>=Math.PI*2-1e-9;
  for(let i=0;i<(f?n:n+1);i++){const a=a0+(a1-a0)*i/n;o.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return o;}
function japRect(u0,v0,u1,v1,r,n){r=Math.min(r,(u1-u0)/2,(v1-v0)/2);n=n||4;const o=[],c=[[u1-r,v1-r,0],[u0+r,v1-r,Math.PI/2],[u0+r,v0+r,Math.PI],[u1-r,v0+r,Math.PI*1.5]];
  for(const q of c)for(let i=0;i<=n;i++){const a=q[2]+Math.PI/2*i/n;o.push([q[0]+Math.cos(a)*r,q[1]+Math.sin(a)*r]);}return o;}
// une zone posée SUR L'AXE (la bouche, une plaque) : bord droit sur l'axe, coins arrondis seulement au-dehors
function japDemi(u1,v0,v1,r,n){r=Math.min(r,u1,(v1-v0)/2);n=n||5;const o=[[0,v0]];
  for(let i=0;i<=n;i++){const a=-Math.PI/2+Math.PI/2*i/n;o.push([u1-r+Math.cos(a)*r,v0+r+Math.sin(a)*r]);}
  for(let i=0;i<=n;i++){const a=Math.PI/2*i/n;o.push([u1-r+Math.cos(a)*r,v1-r+Math.sin(a)*r]);}
  o.push([0,v1]);return o;}
function japZones(L){return (L||[]).map(z=>{const P=z.p;let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;const sg=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];
    u0=Math.min(u0,a[0]);u1=Math.max(u1,a[0]);v0=Math.min(v0,a[1]);v1=Math.max(v1,a[1]);
    if(z.axe!==false&&Math.abs(a[0])<1e-6&&Math.abs(b[0])<1e-6)continue;   // (un bord posé sur l'axe ne coupe rien : le miroir referme la zone)
    sg.push([a[0],a[1],b[0],b[1],Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}
  return Object.assign({},z,{P:P,sg:sg,bb:[u0,u1,v0,v1]});});}
// un trait : joint (k 'j' : demi-largeur w, interstice g, pente k) ou pli (k 'h' : l'arête et ses deux bords) — simplifié à 3 mm
function japLignes(L,R){R=R||{j:{w:.012,g:.0035,k:.6},h:{w:.016,g:0,k:.25}};
  const rdp=(Q,e)=>{if(Q.length<3)return Q;const a=Q[0],b=Q[Q.length-1],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1e-12;let bd=0,bi=-1;
    for(let i=1;i<Q.length-1;i++){const d=Math.abs((Q[i][0]-a[0])*dy-(Q[i][1]-a[1])*dx)/l;if(d>bd){bd=d;bi=i;}}
    return bd>e?rdp(Q.slice(0,bi+1),e).slice(0,-1).concat(rdp(Q.slice(bi),e)):[a,b];};
  return (L||[]).map(l=>{const r=Object.assign({},R[l.k||'j'],l.r||{}),P=rdp(l.p,.003),n=P.length;if(n<2)return null;
    const nm=i=>{const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],h=Math.hypot(dx,dy)||1;return [-dy/h,dx/h];};
    const off=d=>P.map((p,i)=>{const m=nm(i);return [p[0]+m[0]*d,p[1]+m[1]*d];}),segs=[];
    const add=Q=>{for(let i=0;i<Q.length-1;i++){const a=Q[i],b=Q[i+1];segs.push([a[0],a[1],b[0],b[1],Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])]);}};
    let segW=null;if(r.g){add(off(r.g));add(off(-r.g));const n0=segs.length;add(off(r.g+.011));add(off(-r.g-.011));segW=segs.splice(n0);}else{add(P);add(off(r.w));add(off(-r.w));}
    let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of P){u0=Math.min(u0,p[0]);u1=Math.max(u1,p[0]);v0=Math.min(v0,p[1]);v1=Math.max(v1,p[1]);}
    return {P:P,r:r,segs:segs,segW:segW,gate:l.gate,bb:[u0-r.w,u1+r.w,v0-r.w,v1+r.w]};}).filter(Boolean);}
// LISSER : normales moyennées sous `deg` (les arêtes au-delà restent vives) — rend un Float32Array
function japLisse(G,deg){const a=G.attributes.position.array,n=G.attributes.normal.array,M=new Map(),cs=Math.cos((deg||32)*Math.PI/180);
  for(let i=0;i<a.length;i+=3){const k=Math.round(a[i]*2e3)+','+Math.round(a[i+1]*2e3)+','+Math.round(a[i+2]*2e3);let l=M.get(k);if(!l)M.set(k,l=[]);l.push(i);}
  const o=new Float32Array(n.length);
  for(const l of M.values())for(const i of l){let x=0,y=0,z=0;for(const q of l)if(n[i]*n[q]+n[i+1]*n[q+1]+n[i+2]*n[q+2]>=cs){x+=n[q];y+=n[q+1];z+=n[q+2];}const h=Math.hypot(x,y,z)||1;o[i]=x/h;o[i+1]=y/h;o[i+2]=z/h;}
  return o;}
/* LA DÉCOUPE. `G` : la géométrie de la tôle (non indexée, une normale par facette). `o` :
   · ns : les normales lissées (japLisse), ou une fonction qui les rend (appelée seulement quand la découpe n'est pas gardée) ;
   · zones {cote,dessus,face,dos} (japZones) — chaque zone : k (code de matière), gate(cx,cy,cz,nx,ny,nz) facultative, creux (m) facultatif ;
   · lignes {cote,dessus,face,dos} (japLignes) ;
   · codes {k:{g:groupe, c:couleur, lisse:bool}} — 'p' = la tôle (couleur par colP(y)), 'gap' = l'interstice d'un joint ;
   · vue(cx,cy,cz,ax,ay,az,nx,ny,nz) facultative : la vue des zones pour ce triangle (sinon celle qui le regarde le plus en face) ;
   · colP(y,x,z) : la couleur de la tôle à une hauteur (`colTri` : prise au CENTRE de chaque triangle — une livrée à deux tons garde son trait net) ; GP : son groupe ; cache : un objet où garder la découpe (elle ne dépend que de la forme).
   Rend {groupe: géométrie}. Coût : une fois par session (le découpage est gardé, seules les couleurs sont refaites). */
/* ===== LA FENTE — L'OUTIL COMMUN (2026-10-19 ; Léo a choisi la lecture C, « l'ombre + le fil ») =====
   Un joint de tôle (portière, capot, malle, hayon, trappe) n'est plus un trait NOIR : c'est une FENTE — une ombre DE LA COULEUR DE LA CAISSE dans la
   fente, qui remonte en douceur vers la tôle, et un FIL CLAIR sur l'arête qui prend le ciel (plus fort sur une caisse foncée, où c'est lui qu'on voit).
   Fonctions DÉCLARÉES (hissées) : toute zone du fichier peut les appeler, à n'importe quel moment.
   · fenteRGB(c,d,g,out) — la couleur d'un SOMMET de tôle près d'un joint. c = [r,g,b] (0-1) de la tôle à cet endroit ; d = distance SIGNÉE (m) du
     sommet à la ligne du joint, d > 0 du côté qui porte le fil (l'arête éclairée, en général le haut ou l'avant) ; g = demi-largeur de la fente (m,
     défaut .0035). |d| < g : la fente (c × ,50) · puis l'ombre (× ,82 → 1 sur 1 cm) · côté d > 0, le fil sur 4 mm. Rend out (ou un tableau neuf).
     Pour que le dégradé se voie, la tôle doit avoir des SOMMETS à ±g et à ±(g + 1,1 cm) du joint (couper la tôle le long de ces deux lignes).
   · fenteHex(hex) — la couleur d'une fente pleine (hex × ,50) : un joint qui reste une BANDE d'une seule couleur (sans rampe).
   · fentePal(pal) — la palette d'un chantier de kit, plus 'J' (la fente : la PEINTURE de la caisse × ,50, celle de la boutique comprise) et 'Jf' (le
     fil : la peinture éclaircie), même matière que la tôle : `K.kit(fentePal(PAL))` puis `P.box('J',…)` à la place d'un joint `'k'` noir.
   La lecture : `fenteVar()` (A le trait noir d'avant · B l'ombre · C l'ombre + le fil · D le fondu) ; `?fente=A` en jeu pour comparer. */
var JAPFENTE_DEF='C';
var JAPFENTE_V={A:{gap:.16,bord:1,lb:0,fil:0,lf:0},B:{gap:.45,bord:.78,lb:.010,fil:0,lf:0},C:{gap:.50,bord:.82,lb:.010,fil:.20,lf:.004},D:{gap:.70,bord:.86,lb:.006,fil:0,lf:0}};
function japFente(){let v=null;try{if(japFente._u===undefined)japFente._u=((/[?&]fente=([A-D])/.exec(location.search)||[])[1])||null;v=(typeof window!=='undefined'&&window.JAPFENTE_FORCE)||japFente._u;}catch(e){}   // (l'adresse lue une fois)
  return v||(typeof JAPFENTE_DEF==='string'?JAPFENTE_DEF:'C');}
function fenteVar(){const V=typeof JAPFENTE_V==='object'&&JAPFENTE_V?JAPFENTE_V:{C:{gap:.50,bord:.82,lb:.010,fil:.20,lf:.004}};return V[japFente()]||V.C;}   // (repli : appelée avant que la table soit posée)
function fenteRGB(c,d,g,out,P){out=out||[0,0,0];P=P||fenteVar();const a=Math.abs(d||0),e=a-(g||.0035);let f=1,w=0;
  if(e<0)f=P.gap;
  else if(P.fil&&d>0&&e<P.lf){const lu=.3*c[0]+.59*c[1]+.11*c[2];w=P.fil*(.6+1.4*(1-Math.min(1,lu)))*(1-e/P.lf);}
  else if(e<P.lb){const u=e/P.lb;f=P.bord+(1-P.bord)*u*u*(3-2*u);}
  out[0]=c[0]*f+(1-c[0])*w;out[1]=c[1]*f+(1-c[1])*w;out[2]=c[2]*f+(1-c[2])*w;return out;}
function fenteHex(hex){const P=fenteVar(),r=(hex>>16&255)*P.gap,g=(hex>>8&255)*P.gap,b=(hex&255)*P.gap;return (Math.round(r)<<16)|(Math.round(g)<<8)|Math.round(b);}
function fentePal(pal){const ep=((typeof peintPal==='function'?peintPal(pal):pal)||pal).p||{g:'p',c:0x808080},c=ep.c!=null?ep.c:(ep.grad?ep.grad[1]:0x808080);
  const o=fenteRGB([(c>>16&255)/255,(c>>8&255)/255,(c&255)/255],.0035+.001,.0035),hx=v=>Math.round(Math.max(0,Math.min(1,v))*255);
  return Object.assign({},pal,{J:{g:ep.g&&ep.g.indexOf('pm:')===0?'p':ep.g,c:fenteHex(c)},Jf:{g:ep.g&&ep.g.indexOf('pm:')===0?'p':ep.g,c:(hx(o[0])<<16)|(hx(o[1])<<8)|hx(o[2])}});}
