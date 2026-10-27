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
  let HB=false;try{HB=!/[?&]honte=0/.test(location.search);}catch(e){}   /* (23/10) EN MARCHE par défaut : LA FIDÈLE EN COUCHES (la version « sans traits noirs » de Léo) ; `?honte=0` = la Fidèle d'avant */   // (`?honte=1` : dalles ; `?honte=2` : l'ENTRE-DEUX, briques + couches plates)
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
  let HB3=false,HB4=false;try{HB3=!/[?&]honte=[012]/.test(location.search);HB4=!/[?&]honte=[0123]/.test(location.search);}catch(e){}   // (`?honte=4` : l'ENTRE-DEUX du 2 et du 3 — flancs en petits blocs de 8 cm, cabine en briques lisses, couches de base et de ceinture)
  if(HB3){   /* LE MÉLANGE (23/10, Léo : « un mélange technique des deux : répartition stratégique de la taille des cubes ») — de GROS blocs là où la tôle est plate (les flancs : 13 cm d'épaisseur, longs), des couches TRÈS FINES
     (4 cm, tronçons de 6 cm) là où la forme se complique (le nez, la poupe, le capot, la cabine et le toit). Les passages de roue restent des vides en marches. */
    const xAt=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;};
    const ZA=-1.85,ZBm=1.75,YM=1.00,Sz=z=>S(Math.max(ZB+.001,Math.min(ZE-.001,z)));
    const rangee=(yc,dy,dz,q,zA,zB,kf)=>{let run=null;const flush=z1=>{if(run&&run.w>.02)PL.box(run.k,2*run.w,dy+.002,z1-run.z0,0,yc,(run.z0+z1)/2);run=null;};
      for(let z=zA+dz/2;z<zB;z+=dz){const w=Math.round(xAt(Sz(z),yc)/q)*q,k=kf(z,yc);if(!run||run.w!==w||run.k!==k){flush(z-dz/2);run={w:w,k:k,z0:z-dz/2};}}flush(zB);};
    // 1. les GROS blocs : le flanc entre la poupe et le nez, sous la ceinture
    const DYF=HB4?.08:.13;for(let yc=.22+DYF/2;yc<YM-.001;yc+=DYF)rangee(yc,DYF,.12,HB4?.03:.04,ZA,ZBm,()=>'p');
    // 2. les COUCHES FINES : le nez et la poupe sur toute la hauteur, tout le reste au-dessus de la ceinture
    const verre=(z,y)=>(y>1.0&&y<1.40&&z<ZW-.02&&z>ZHT+.02&&xAt(Sz(z),y)<.72)?'g':'p';
    for(let yc=.22+.02;yc<1.43;yc+=.04){
      if(yc>=YM&&!HB4)rangee(yc,.04,.06,.02,ZB,ZE,verre);}
    /* LES PORTES (23/10, Léo : « aussi les portes ») deux panneaux de porte par flanc, en RELIEF de 1,6 cm de la couleur de la caisse, séparés par un joint qui laisse voir le fond sombre ; chaque porte porte sa poignée chromée
       en bloc et un filet chromé sous la vitre. Le panneau suit la largeur réelle de la caisse à mi-hauteur. */
    for(const sd of [1,-1])for(const [z0,z1] of [[.70,-.12],[-.22,-1.00]]){const zc=(z0+z1)/2,L=Math.abs(z0-z1),xw=xAt(Sz(zc),.64)+.002;
      PL.box('p',.05,.58,L,sd*(xw+.012),.64,zc);                              // le panneau de porte, en relief de 3,7 cm
      PL.box('c',.05,.034,.22,sd*(xw+.045),.84,zc+(z0>z1?.20:-.20));          // la poignée : un bloc chromé, bien saillant
      PL.box('c',.022,.014,L*.94,sd*(xw+.03),.915,zc);}                       // le filet chromé sous la vitre
    if(HB4){   // la cabine : des BRIQUES lisses (le loft rectangulaire du 2), rentrées de 1,5 cm sous les blocs ; les couches de base et de ceinture du 2
      PL.loft(zsB.filter(z=>z>=ZA-.001&&z<=ZBm+.001),z=>{const q=SB(z);for(let i=1;i<=3;i++)q[i]=[Math.max(0,q[i][0]-.015),q[i][1]];return q;},peintB);
      const couche=(y,h,k,grow,zA,zB)=>{let run=null;const flush=z1=>{if(run&&run.w>.02)PL.box(k,2*run.w,h,z1-run.z0,0,y,(run.z0+z1)/2);run=null;};
        for(let z=zA+.045;z<zB;z+=.09){const w=Math.round((xAt(Sz(z),y)+grow)/.03)*.03;if(!run||run.w!==w){flush(z-.045);run={w:w,z0:z-.045};}}flush(zB);};
      couche(.985,.022,'c',.012,-2.0,1.0);}
    /* LE MUSEAU ET LA POUPE en POLY ARRONDI (Léo : « il faut que ce soit beau, tu peux faire des formes poly arrondies ») : un loft à 7 points — le dessous, un chanfrein bas, le flanc, un chanfrein haut, l'épaule qui s'arrondit
       vers le capot — sur 6 tranches, mesuré sur la vraie section ; il remplace les marches sous la ceinture. */
    const SR=z=>{const s=S(z),xm=s[1][0]+.10*Math.min(1,s[1][0]/.62),yb=s[0][1],yt=s[NC][1],yc=s[s.length-1][1],sx=z>=ZE-1e-6||z<=ZB+1e-6?.02:1;
      return [[0,yb],[(xm-.16)*sx,yb],[xm*sx,yb+.13],[xm*sx,Math.max(yb+.14,yt-.10)],[(xm-.07)*sx,yt+(yc-yt)*.25],[xm*.55*sx,Math.max(yt+.02,yc-.015)],[0,yc]];};
    // (« le museau doit être plus fidèle à la Fidèle ») : le nez et la poupe reprennent les VRAIES sections du plan (S), une tranche sur deux — la forme exacte, taillée en larges facettes
    const zN=zs.filter(z=>z>=ZBm-.001),zT=zs.filter(z=>z<=ZA+.001).filter((z,i)=>i%2===0||z<-2.2);
    PL.loft(zN,S,j=>j===0?'k':'p');PL.loft(zT,S,j=>j===0?'k':'p');
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
  if(!HB||(typeof HB3!=='undefined'&&HB3)){const zf=PROF.zf,dens=Q=>{const o=[];for(let i=0;i<Q.length;i++){const a=Q[i],b=Q[(i+1)%Q.length],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.02));for(let k=0;k<n;k++)o.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]);}return o;};
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
     if(HB3){   /* LA CALANDRE SPORTIVE (23/10, Léo : « quelque chose de plus beau, sportif ») une BOUCHE large et basse en trois étages — le cadre chromé, le fond noir, puis un NID D'ABEILLES de petits plots gris posés en quinconce */
       piece('c',F9.grille,.022,-.010,sd);piece('k',rentre9(F9.grille,.016),.030,.004,sd);
       const dedansP=(Pt,x,y)=>{let c=false;const n=Pt.length;for(let i=0,j=n-1;i<n;j=i++){const a=Pt[i],b=Pt[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
       const G2=F9.grille.concat(F9.grille.slice(1,-1).reverse().map(p=>[-p[0],p[1]])),inner=rentre9(F9.grille,.034).concat(rentre9(F9.grille,.034).slice(1,-1).reverse().map(p=>[-p[0],p[1]]));
       for(let r=0;r<9;r++){const y=.29+r*.027;for(let c=0;c<26;c++){const x=(c-12.5)*.034+(r%2?.017:0);if(x<0&&sd>0||x>0&&sd<0)continue;if(!dedansP(inner,x,y))continue;
         P.box('h',.018,.016,.018,sd*Math.abs(x),y,zf(Math.abs(x),y)+.034);}}}
     piece('k',F9.prise,.016,-.012,sd);                                  // la prise d'air du bouclier : un bloc noir en relief…
     piece('c',japRuban(JONC_L,.022),.026,.008,sd);                      // …et son jonc chromé, posé dessus au bord haut
     if(VP==='e'){piece('k',NET,.010,-.012,sd);piece('W',LED2,.017,.004,sd);}   // e : UNE pièce découpée net (sans la pointe basse) + sa lame de LED, collées par-dessus
     else if(VP==='a'){}                                                       // a : plat, sans pièce (le phare est un aplat de la tôle)
     else if(VP==='b'){piece('k',PH,.012,-.012,sd);piece('W',LED,.020,.008,sd);}                                   // b : UN plateau mince + sa lame de LED
     else if(VP==='c'){piece('k',PH,.014,-.012,sd);piece('g',VERRE,.022,.010,sd);piece('W',LED,.028,.018,sd);}   // c : boîtier, verre brillant, LED — sans l'oeil, bas
     else{piece('k',NET,.032,-.012,sd);piece('h',VNET,.052,.024,sd);piece('W',LED2,.064,.044,sd);piece('c',ONET,.074,.040,sd);}}}   // d : les quatre étages (v. précédente)
  if(HB)for(const sd of [1,-1]){   // (23/10) LES PHARES, empilés sur la face avant (z = ZE) : une plaque noire, le verre gris, la lame de LED ; les feux : une plaque noire et le bloc rouge ; sur chaque roue, DEUX couches de bavolet
    const xA=(sc,y)=>{let m=0;for(let i=1;i<sc.length;i++){const a=sc[i-1],b=sc[i];if((a[1]-y)*(b[1]-y)<=0&&a[1]!==b[1]){const x=a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);if(x>m)m=x;}}return m;},
      zAv=(x,y)=>{for(let z=ZE-.003;z>0;z-=.01)if(xA(S(z),y)>=x)return z;return 2.2;},zAr=(x,y)=>{for(let z=ZB+.003;z<0;z+=.01)if(xA(S(z),y)>=x)return z;return -2.2;};
    const plaque=(k,x0,x1,y,h,e,dep,av)=>{const n=4,w=(x1-x0)/n;for(let i=0;i<n;i++){const xc=x0+w*(i+.5),z=(av?zAv:zAr)(xc+w/2,y);P.box(k,w+.004,h,.022,sd*xc,y,z+(av?1:-1)*(e+dep));}};   // une plaque en 4 tronçons, chacun posé sur SA marche de la face
    plaque('k',.28,.72,.93,.12,0,.010,false);plaque('L',.30,.70,.935,.07,0,.028,false);
    for(const z of [ZF,ZR]){const n=22,y0=.32;   /* LES PASSAGES DE ROUE EN RELIEF (23/10, Léo : « la c'est plat au niveau des roues ; protège-les de manière cool ») un BOMBÉ d'aile en trois couches qui sortent de plus en plus : le bavolet noir épais (6 cm), l'aile de la couleur de la caisse par-dessus (3 cm de plus, rayon plus grand), le filet chromé tout au bord. */
      for(const [r,xx,w,h,k] of [[.345,.884,.05,.034,'d'],[.375,.905,.075,.05,'d'],[.405,.915,.065,.045,'p'],[.428,.936,.016,.016,'c']])for(let i=0;i<n;i++){const a0=Math.PI*(.07+.86*i/n),a1=Math.PI*(.07+.86*(i+1)/n),am=(a0+a1)/2,L=2*r*Math.sin((a1-a0)/2)+.012;
        P.box(k,w,h,L,sd*xx,y0+Math.sin(am)*r,z+Math.cos(am)*r,Math.PI/2-am,0,0);}}
  }
  if(HB){   /* L'AILERON TUNING (23/10) : une lame sur deux jambes, posée sur la malle, le bord relevé — noir mat, avec sa lèvre chromée */
   const yt=yDessus(0,-1.98);P.box('d',1.46,.034,.27,0,yt+.15,-2.05,.10,0,0);P.box('c',1.46,.012,.02,0,yt+.172,-2.17,.10,0,0);
   for(const sd of [1,-1]){P.box('d',.03,.11,.28,sd*.73,yt+.15,-2.05,.10,0,0);P.box('d',.045,.15,.05,sd*.45,yt+.07,-2.02);}
  }
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
  if(!HB3){const LA=K.kit({c:{g:'c',c:0xc7ccd3},q:{g:'g',c:0xd9dde2},K:{g:'g',c:0x0b0b0e}}),h=.0036,ep=.018;
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
  if(HB4){   /* (23/10, Léo : « montre ce que tu peux faire ») LA JANTE EN COUCHES PLIÉES : le fond sombre, un disque d'acier, CINQ bras en deux étages (une plaque noire large, une plaque chromée plus étroite et plus haute, chacune
       coudée vers le moyeu), un anneau de rebord, cinq boulons — chaque pièce a sa matière et son épaisseur. */
    J.lathe('s',[[.19,fx-.03],[.19,fx-.012],[.06,fx-.012],[.06,fx-.03]],20,0,0,0,'x');             // le disque d'acier
    const bras=(w0,w1,w2,r0,r1,r2,dep,xx,k)=>{const sh=new THREE.Shape();sh.moveTo(-w0,r0);sh.lineTo(w0,r0);sh.lineTo(w1,r1);sh.lineTo(w2,r2);sh.lineTo(-w2,r2);sh.lineTo(-w1,r1);sh.lineTo(-w0,r0);
      for(let q=0;q<5;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:dep,bevelEnabled:false});g.rotateY(-Math.PI/2);g.rotateX(q/5*Math.PI*2);g.translate(xx,0,0);J.put(k,g,0,0,0);}};
    bras(.034,.030,.044,.06,.12,.19,.012,fx-.012,'k');                                             // étage 1 : la plaque noire, large, coudée
    bras(.020,.018,.030,.07,.12,.186,.012,fx+.002,'a');                                            // étage 2 : la plaque chromée, plus étroite, par-dessus
    for(let q=0;q<5;q++){const a=q/5*Math.PI*2+Math.PI/5;J.put('a',new THREE.CylinderGeometry(.009,.009,.014,6),fx+.012,Math.cos(a)*.085,Math.sin(a)*.085,0,0,Math.PI/2);}   // cinq boulons
    J.lathe('a',[[.20,fx-.006],[.206,fx+.004],[.19,fx+.01],[.186,fx+.002]],24,0,0,0,'x');           // l'anneau de rebord
  }else{
  {const sh=new THREE.Shape();sh.moveTo(-.0075,.06);sh.lineTo(.0075,.06);sh.lineTo(.005,.194);sh.lineTo(-.005,.194);sh.lineTo(-.0075,.06);
   for(let q=0;q<20;q++){const g=new THREE.ExtrudeGeometry(sh,{depth:.018,bevelEnabled:true,bevelThickness:.003,bevelSize:.002,bevelSegments:1,curveSegments:1});
     g.rotateY(-Math.PI/2);g.rotateX(Math.floor(q/2)/10*Math.PI*2+(q%2?.075:-.075));g.translate(fx-.004,0,0);J.put('s',g,0,0,0);   // (le flanc anthracite…)
     const f=new THREE.ShapeGeometry(sh);f.rotateY(Math.PI/2);f.rotateX(Math.floor(q/2)/10*Math.PI*2+(q%2?.075:-.075));f.translate(fx+.0175,0,0);J.put('a',f,0,0,0);}}   // (…et la face usinée)
  }
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
  /* LA BÊTE v4 — LA BÊTE DE RALLYE (2026-10-26, Léo : « reprendre la forme de l'ANCIENNE 2, qui ressemble vraiment à une voiture de rallye, et
     y instaurer le nouveau coloris de e21 ; la traduire dans le même langage visuel — le poly poli, les mèches —, un design adapté au modèle ;
     puis plus noble, plus majestueux, en mode arabe / asiatique »). La bête de course de côte de 2013 (la ligne de la 208 T16 Pikes Peak :
     875 chevaux pour 875 kilos), sur les cotes du PLAN de l'ancienne (empattement 2,69 m, 4,14 m de caisse, pavillon à 1,27 m) : la citadine
     trois portes courte et large, le capot qui monte au pare-brise très couché, le pavillon bombé, le hayon qui plonge, les ailes évasées aux
     arches rondes, l'écope en tête de pavillon, l'aileron monumental sur deux cols de cygne, la lame au ras du sol. Taillée en MÈCHES : un
     loft de sections propres (9 points), de grands pans plans, des arêtes nettes, les détails posés.
     Deux livrées sur la même caisse (`LIVREE`) : 'A' = le coloris de e21 (l'avant blanc, la poupe bleu nuit, une diagonale ourlée de rouge, le coq
     gaulois en facettes) · 'B' = LA NOBLE (bleu nuit profond, pavillon ivoire lisse, jantes or, un collier de losanges d'or) — la livrée validée par Léo (V24).
     Repère : x à droite, y en haut, z vers l'avant, mètres. */
  if(K.muet)return {};   // (la préchauffe des japonaises, voir japChauffe : plus de découpe au plan, rien à préparer)
  const LIVREE='B';
  const U=LPU,L=(t,z)=>U.lin(t,z),R=.36,JW=.32,ZF=1.347,ZR=-1.347,ZN=2.14,ZT=-2.0,ZW=1.26,ZH=-1.0,NB=LIVREE==='B';
  /* LES MATIÈRES (règles de Léo : aucun trait noir sur la tôle — le relief seulement ; laqué comme LA HONTE). La tôle : la laque (`p`, celle que
     la boutique repeint), le bleu nuit (`N`, une autre clé : il reste sous toutes les peintures), leurs nuances pour les reliefs (q, M). La
     MARQUE et les filets dans LEURS matières (`k`) : ni la boutique ni le vernis n'y touchent. Le noir : châssis, plastiques, vitres. */
  const P=K.kit({p:{g:'p',c:NB?0x0a1234:0xe2e5ea},N:{g:'p',c:NB?0x0a1234:0x0e1747},q:{g:'p',c:NB?0x1a2552:0xc3c9d2},M:{g:'p',c:NB?0x1a2552:0x1d2862},
    k:{g:'m',c:0x131417},K:{g:'g',c:0x0b0c10},g:{g:'g',c:0x172231},s:{g:'s',c:0x2a2d34},c:{g:'c',c:0xe9ecf0},R:{g:NB?'o':'p',c:NB?0xd9b45a:0xd51029},V:{g:'p',c:0xefe6cf},
    W:{g:'l',c:0xf2f6ff},L:{g:'l',c:0xff1f2e},Q:{g:'l',c:0xe6e8ec},
    B:{g:'k',c:NB?0xf3ead6:0xf4f6fa},G:{g:NB?'o':'k',c:NB?0xd2b26a:0xc2cbdc},C:{g:'k',c:NB?0xc8102e:0xe1062c},O:{g:'o',c:0xd9b45a},I:{g:'k',c:0xf3ead6}});   // la MARQUE (blanc · acier · rouge ; en B : ivoire · or · rouge), l'or (O), l'ivoire (I)
  /* ---- LES LIGNES (z → valeur), sur les cotes du plan — en PANS (26/10, Léo : « évite d'imiter les coins arrondis de l'ancienne ; le même langage
     que les voitures acceptées ») : chaque ligne n'a que les nœuds qui racontent la forme, chaque nœud est une coupe. Le pavillon est UN pan,
     le hayon DEUX (la lunette, puis la poupe), le capot DEUX (le plat, puis la chute du nez), l'arche un trapèze (dessus plat, flancs droits). ---- */
  const AR=[[0,.79],[.28,.79],[.48,.16]];   // l'arche : dessus plat de 56 cm, deux flancs droits qui dégagent le pneu
  const xW=z=>L([[ZT,.82],[-1.90,.97],[-1.827,.985],[-.867,.985],[-.80,.925],[.80,.925],[.867,.985],[1.827,.985],[1.90,.96],[ZN,.86]],z),  // la LARGEUR : les ailes évasées à 1,97 m, la portière à 1,85
        yBs=z=>L([[ZT,.22],[-1.90,.14],[1.90,.14],[ZN,.22]],z),                                                                                // le bas de caisse
        yS=z=>L([[ZT,.72],[-1.90,.80],[-1.627,.90],[-1.067,.925],[-.80,.905],[.80,.885],[1.067,.925],[1.627,.90],[1.90,.76],[ZN,.62]],z),           // l'ÉPAULE
        yBl=z=>L([[ZT,.76],[-1.90,.82],[-1.627,.90],[ZH,.93],[.42,.895],[ZW,.90]],z),                                                          // la ceinture de la serre (droite le long des vitres)
        yC=z=>L([[ZT,.78],[-1.90,.84],[-1.627,.94],[ZH,1.20],[.02,1.27],[.42,1.255],[ZW,.90],[1.75,.79],[ZN,.58]],z);                         // le dessus, au milieu
  /* LA SECTION (9 points) : dessous, chanfrein du bas, LE FLANC (une dalle), l'arête d'épaule, l'étagère, puis la serre (vitre rentrée, bord du
     toit, pavillon) — ou, devant le pare-brise, l'aile, sa joue et le capot. */
  const S=z=>{
    const xw=xW(z),yb=Math.max(U.arch(z,[ZF,ZR],AR,0),yBs(z)),ys=yS(z),c=yC(z),kA=U.cl((yb-.14)/.63,0,1);
    const y2=Math.max(yb+.05,.28),y3=Math.max(y2+.02,ys-.045),y4=Math.max(y3+.008,ys);
    const s=[[0,Math.min(yb,c-.05)],[xw-.10,Math.min(yb,c-.03)],[xw-.025+.05*kA,y2],[xw,y3],[xw-.045,y4]];   // (le plafond du passage de roue reste SOUS le capot)
    if(z>ZW)s.push([xw-.16,y4-.004],[.62,c-.012],[.30,c-.004],[0,c]);                                     // l'aile, sa joue, le CAPOT
    else{const xb=L([[ZT,.62],[-1.90,.74],[-1.627,.80]],z),xr0=L([[ZT,.46],[-1.90,.56],[-1.627,.62]],z),x8=L([[ZT,.40],[-1.90,.50],[-1.627,.56]],z),
      y5=Math.min(yBl(z),c-.03),y6=Math.max(y5+.006,c-.035),y7=Math.max(y6+.004,c),
      xr=xb-(y6-y5)*(xb-xr0)/.235,x8b=Math.min(x8,xr-.05);   // (la vitre rentre d'une pente FIXE : là où elle s'effile, son bord haut glisse dans le même plan — des pans de verre PLANS, jamais dentelés)
      s.push([xb,y5],[xr,y6],[x8b,y7],[0,Math.max(c,y7-.03)]);}                                            // la SERRE
    return s;};
  const zs0=[ZT,-1.90,-1.627,ZH,-.80,-.40,.02,.42,.80,ZW,ZW+.004,1.75,1.90,ZN];
  for(const w of [ZF,ZR])for(const a of AR)if(a[0]>0)zs0.push(w-a[0],w+a[0]);
  zs0.sort((a,b)=>a-b);const zs=zs0.filter((z,i)=>i===0||z-zs0[i-1]>.003);
  // LA PEINTURE du loft, triangle par triangle (t = 0 l'arrière-bas, 1 l'avant-haut) : le dessous noir, la poupe, la serre et le pavillon bleu nuit
  const fen=z=>z>ZH&&z<1.0;
  const peint=(j,z,y,x,t)=>{
    if(j<=1)return 'k';                                                              // le dessous, le chanfrein du bas
    if(z>ZW)return 'p';
    if(j===5)return fen(z)?'g':'N';                                                  // les vitres latérales ; les montants
    if(j===7&&z>.42&&z<ZW)return 'g';                                                // le pare-brise
    if(j===7&&z>-1.62&&z<ZH)return 'g';                                              // la lunette
    if(NB&&j>=6&&z>ZH&&z<.42)return 'V';                                             // (B) le pavillon IVOIRE
    if(j>=6)return 'N';                                                              // pavillon, montants, poupe
    if(z<-.80)return 'N';                                                            // la hanche
    return 'p';};
  const tr=(k,a,b,c)=>{P.tri(k,a,b,c);P.tri(k,[-a[0],a[1],a[2]],[-c[0],c[1],c[2]],[-b[0],b[1],b[2]]);};   // un triangle et son miroir
  {const sec=zs.map(S),N=sec[0].length;
   for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],A=sec[i],C=sec[i+1];
     for(let j=0;j<N-1;j++){const a=[A[j][0],A[j][1],z0],b=[A[j+1][0],A[j+1][1],z0],c=[C[j+1][0],C[j+1][1],z1],d=[C[j][0],C[j][1],z1];
       for(const [t,p,q,r] of [[0,a,b,d],[1,b,c,d]])tr(peint(j,(p[2]+q[2]+r[2])/3,(p[1]+q[1]+r[1])/3,(p[0]+q[0]+r[0])/3,t),p,q,r);}}
   for(const [s9,z,dir] of [[sec[0],zs[0],-1],[sec[sec.length-1],zs[zs.length-1],1]]){   // les deux bouchons : la face et la poupe
     const ct=[];for(let j=0;j<N;j++)ct.push(new THREE.Vector2(s9[j][0],s9[j][1]));for(let j=N-2;j>=1;j--)ct.push(new THREE.Vector2(-s9[j][0],s9[j][1]));
     for(const f of THREE.ShapeUtils.triangulateShape(ct,[])){let a=ct[f[0]],b=ct[f[1]],c=ct[f[2]];
       if((((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x))>0)!==(dir>0)){const t=b;b=c;c=t;}
       P.tri(dir>0?'p':'N',[a.x,a.y,z],[b.x,b.y,z],[c.x,c.y,z]);}}}
  const pm=pts=>pts.map(p=>[-p[0],p[1]]).reverse();   // le miroir d'un contour de face
  // ---- POSER SUR LA TÔLE ----
  const clip=(q,ax,lim,sg)=>{const o=[];for(let i=0;i<q.length;i++){const p=q[i],r=q[(i+1)%q.length],ip=(p[ax]-lim)*sg>=0,ir=(r[ax]-lim)*sg>=0;
      if(ip)o.push(p);if(ip!==ir){const u=(lim-p[ax])/(r[ax]-p[ax]),n=[p[0]+(r[0]-p[0])*u,p[1]+(r[1]-p[1])*u];o.push(n);}}return o;},
        bandPt=(j,z,y,o)=>{const s=S(z),A=s[j],B=s[j+1],u=(y-A[1])/((B[1]-A[1])||1),dx=B[0]-A[0],dy=B[1]-A[1],nl=Math.hypot(dx,dy)||1;return [A[0]+dx*u+dy/nl*o,A[1]+dy*u-dx/nl*o,z];},
        fan=(k,Q)=>{for(let i=1;i<Q.length-1;i++)tr(k,Q[0],Q[i],Q[i+1]);},
        // un contour de PROFIL [z,y] coupé aux bords de chaque bande du flanc (2 → 4) et posé dessus à `o` : des bords droits d'un bout à l'autre
        //   (chaque sommet est relu en POSITION DANS LA BANDE — 0 en bas, 1 en haut — à sa propre coupe : sur les étagères étroites de l'épaule, une
        //   hauteur absolue sortait de la tôle et plantait des dents dans les vitres)
        bandU=(j,z,u,o)=>{const s=S(z),A=s[j],B=s[j+1],dx=B[0]-A[0],dy=B[1]-A[1],nl=Math.hypot(dx,dy)||1;u=U.cl(u,0,1);return [A[0]+dx*u+dy/nl*o,A[1]+dy*u-dx/nl*o,z];},
        DECAL=(k,poly,o)=>{const zc=poly.reduce((s,p)=>s+p[0],0)/poly.length,s0=S(zc);
          for(let j=2;j<=4;j++){const ya=s0[j][1],yb=s0[j+1][1];let q=clip(clip(poly,1,ya,1),1,yb,-1);if(q.length>2)fan(k,q.map(p=>bandU(j,p[0],(p[1]-ya)/((yb-ya)||1),o)));}},
        // un contour en RELIEF sur une bande plane : chaque sommet levé de hs[i], et ses flancs
        RELIEF=(k,j,poly,hs)=>{const T=poly.map((p,i)=>bandPt(j,p[0],p[1],.003+hs[i])),B=poly.map(p=>bandPt(j,p[0],p[1],-.003));fan(k,T);
          for(let i=0;i<poly.length;i++){const n=(i+1)%poly.length;tr(k,B[i],B[n],T[n]);tr(k,B[i],T[n],T[i]);}},
        // LE DESSUS (capot, pavillon) relu sur le loft : la hauteur aux deux coupes qui encadrent z, puis mêlée — rien ne s'y enterre
        dessS=(x,s)=>{for(let j=5;j<8;j++){const A=s[j],B=s[j+1];if(x<=A[0]&&x>=B[0])return A[1]+(B[1]-A[1])*(A[0]-x)/((A[0]-B[0])||1);}return s[8][1];},
        dessus=(x,z)=>{let i=0;while(i<zs.length-2&&zs[i+1]<z)i++;const za=zs[i],zb=zs[i+1],u=(z-za)/((zb-za)||1);return dessS(x,S(za))*(1-u)+dessS(x,S(zb))*u;},
        surDessus=(k,pts,h)=>{for(let i=0;i<zs.length-1;i++){const q=clip(clip(pts,1,zs[i],1),1,zs[i+1],-1);if(q.length<3)continue;
          fan(k,q.map(p=>[p[0],dessus(p[0],Math.min(Math.max(p[1],zs[i]+1e-5),zs[i+1]-1e-5))+h,p[1]]));}};
  /* LA MARQUE : le COQ GAULOIS en douze facettes planes (voir e21) — tête haute, crête en trois lames, poitrail bombé, queue en faucilles. */
  const COQ=[   // la silhouette : bec a, front, couronne, nuque, dos, croupe, ventre, poitrail — un coq HÉRALDIQUE, le poitrail en avant
    ['B',[[.72,.66],[.72,.78],[.66,.88],[.48,.94],[.32,.76],[.46,.62],[.66,.56]]],                // la tête
    ['G',[[.96,.72],[.72,.78],[.72,.66]]],                                                        // le bec
    ['G',[[.46,.62],[.32,.76],[.22,.50],[.70,.36],[.66,.56]]],                                    // le cou
    ['B',[[.22,.50],[.24,.06],[.52,-.28],[.70,.06],[.70,.36]]],                                   // le poitrail, bombé
    ['G',[[.22,.50],[-.10,.36],[-.40,.14],[.24,.06]]],                                            // le dos (l'aile repliée)
    ['G',[[.24,.06],[-.40,.14],[-.44,-.14],[-.16,-.38],[.20,-.44],[.52,-.28]]],                   // le ventre
    ['B',[[-.10,.36],[-.36,.80],[-.70,1.04],[-.52,.62],[-.40,.14]]],                              // la queue en faucilles : la haute…
    ['C',[[-.40,.14],[-.62,.66],[-.98,.80],[-.70,.38],[-.44,-.14]]],                              // …la rouge…
    ['G',[[-.44,-.14],[-.74,.20],[-1.02,.30],[-.70,-.06],[-.40,-.30]]],                           // …la basse
    ['G',[[.06,-.40],[.26,-.44],[.20,-.74],[.40,-.90],[.04,-.92],[.02,-.74]]],                     // la patte, courte et plantée, l'ergot
    ['C',[[.36,.82],[.30,1.06],[.44,.94],[.50,1.12],[.58,.94],[.68,1.04],[.66,.86]]],              // la crête, trois lames
    ['C',[[.62,.60],[.72,.64],[.66,.42]]]],                                                       // la barbe
    COUCHE=[0,0,0,0,0,0,.003,.003,.003,.003,.003,.003],
    marque=(f,o0)=>{COQ.forEach(([k,pts],n)=>{const V=pts.map(p=>new THREE.Vector2(p[0],p[1])),o=o0+COUCHE[n];
      for(const q of THREE.ShapeUtils.triangulateShape(V,[]))tr(k,f(pts[q[0]],o),f(pts[q[1]],o),f(pts[q[2]],o));});};

  const YH=.95,cz=q=>clip(clip(q,0,.79,-1),0,-.80,1);
  if(!NB){ // 'A' — le coloris de e21 : l'avant blanc, la poupe bleu nuit qui avance sur la portière en UNE diagonale couchée, ourlée d'un filet rouge
    const Lz=y=>.78-.53*(y-.28);
    DECAL('C',cz([[Lz(.28),.28],[Lz(YH),YH],[Lz(YH)-.045,YH],[Lz(.28)-.045,.28]]),.005);
    DECAL('N',cz([[Lz(.28)-.045,.28],[Lz(YH)-.045,YH],[-.80,YH],[-.80,.28]]),.005);
  }
  // LE COQ AUX FLANCS : toute la hauteur de la portière, tourné vers l'avant (le miroir le retourne de l'autre côté)
  {const zc=-.05,yc=.535,s=.265;marque((p,o)=>bandPt(2,zc+p[0]*s,yc+p[1]*s,o),.009);}
  // SUR LE PAVILLON, derrière l'écope : deux coqs FACE À FACE, la tête vers l'avant — lus droits depuis la caméra de poursuite ('A')
  if(!NB){const zc=-.42,s=.23,xs=.26;marque((p,o)=>{const x=xs-p[0]*s,z=zc+p[1]*s;return [x,dessus(x,z)+o,z];},.006);}
  if(NB){ // 'B' — LA NOBLE : le bleu nuit profond, le pavillon ivoire, l'or en fils fins, rien de plus
    // LE COLLIER D'OR : une chaîne de losanges d'or sur l'étagère de l'épaule, de l'aile avant à la hanche (le treillis, en miniature)
    for(let z=-1.52;z<=1.84;z+=.09)fan('O',[[z-.034,.5],[z,.92],[z+.034,.5],[z,.08]].map(p=>bandU(4,p[0],p[1],.004)));
    // (26/10, Léo valide B « sans l'étoile du toit » : le pavillon ivoire reste LISSE, voulu)
  }
  // SUR LES JOUES DE L'AILERON
  {const zc=-2.17,yc=1.518,s=.15;marque((p,o)=>[1.104+o,yc+p[1]*s,zc+p[0]*s],0);}
  // ---- LA LAME : le plateau au ras du sol et sa lèvre, le menton, les dérives des coins, les canards ----
  P.box('k',2.0,.03,.42,0,.09,2.17);P.box('R',2.0,.016,.016,0,.099,2.381);P.box('k',1.50,.14,.06,0,.16,2.12);
  P.sym(sd=>{P.prism('N',[[1.90,.075],[2.38,.075],[2.38,.115],[2.20,.40],[1.94,.46]],.025,sd*.985);
    P.box('k',.14,.012,.12,sd*.92,.34,2.0,-.10,0,sd*.18);P.box('k',.12,.012,.10,sd*.92,.43,1.99,-.10,0,sd*.24);});
  // ---- LA FACE : la grande bouche, les phares en lame qui froncent, les écopes de frein, le menton bleu nuit ----
  P.plate('N',[[-.75,.225],[.75,.225],[.83,.275],[.85,.45],[.55,.47],[-.55,.47],[-.85,.45],[-.83,.275]],.006,ZN);
  P.plate('k',[[.46,.25],[.52,.44],[-.52,.44],[-.46,.25]],.015,ZN);for(const y of [.31,.38])P.box('s',.94,.018,.02,0,y,ZN+.02);
  const PH=[[.50,.47],[.78,.545],[.78,.585],[.53,.53]],PHc=[[.48,.455],[.80,.53],[.80,.60],[.51,.545]],EC=[[.58,.25],[.72,.25],[.72,.36],[.61,.36]];
  for(const f of [x=>x,pm]){P.plate('K',f(PHc),.012,ZN);P.plate('W',f(PH),.02,ZN);P.plate('k',f(EC),.015,ZN);}
  // ---- LE CAPOT : les quatre GRIFFES levées (une nuance de la tôle) ; LES AILES : leurs ouïes en relief ----
  const griffe=(k,pts,h)=>{surDessus(k,pts,h);const n=pts.length;
    for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],A0=[a[0],dessus(a[0],a[1])-.004,a[1]],A1=[a[0],dessus(a[0],a[1])+h,a[1]],B0=[b[0],dessus(b[0],b[1])-.004,b[1]],B1=[b[0],dessus(b[0],b[1])+h,b[1]];
      tr(k,A0,B0,B1);tr(k,A0,B1,A1);}};
  griffe('q',[[.36,1.36],[.53,1.39],[.49,1.84],[.42,1.86]],.015);
  griffe('q',[[.15,1.44],[.26,1.45],[.24,1.76],[.18,1.77]],.015);
  P.sym(sd=>{for(const z of [1.45,1.52,1.59,1.66])P.box('q',.08,.012,.035,sd*.88,yS(z)+.004,z,Math.atan((yS(z-.05)-yS(z+.05))/.10));});
  // ---- LE TOIT : l'écope EN TÊTE DE PAVILLON ; LA CUSTODE : son écope en relief (plus de becquet : sa dalle flottait au-dessus du hayon) ----
  P.prism(NB?'V':'N',[[.40,1.25],[.38,1.385],[.30,1.40],[-.02,1.335],[-.10,1.262]],.30,0);P.box('k',.26,.10,.02,0,1.32,.395);
  RELIEF('M',5,[[-1.06,.935],[-1.38,.935],[-1.12,1.05]],[.035,0,.035]);
  // ---- L'AILERON MONUMENTAL : le plan, le volet, la lèvre, les joues, les deux cols de cygne plantés dans le hayon ----
  P.prism('k',[[-1.84,1.52],[-1.90,1.555],[-2.02,1.575],[-2.20,1.57],[-2.32,1.56],[-2.32,1.545],[-2.10,1.535],[-1.92,1.525]],2.14,0);
  P.prism('N',[[-2.16,1.605],[-2.23,1.645],[-2.36,1.685],[-2.37,1.67],[-2.24,1.625],[-2.17,1.595]],2.14,0);
  P.box('R',2.14,.035,.012,0,1.695,-2.37);
  P.sym(sd=>{P.prism('N',[[-1.74,1.40],[-2.40,1.32],[-2.43,1.40],[-2.43,1.76],[-2.30,1.78],[-1.80,1.62]],.03,sd*1.085);
    P.prism('k',[[-1.64,.935],[-1.82,.865],[-2.04,1.53],[-1.88,1.53]],.025,sd*.32);});
  // ---- LA POUPE : les feux en GRIFFES sous un verre fumé, la plaque, le double échappement, le diffuseur et ses dérives, le feu de pluie ----
  const FEc=[[.40,.585],[.74,.585],[.74,.685],[.46,.685]];
  for(const f of [x=>x,pm]){P.plate('K',f(FEc),.012,ZT-.012);
    for(const x0 of [.46,.56,.66])P.plate('L',f([[x0,.595],[x0+.045,.595],[x0+.075,.675],[x0+.03,.675]]),.02,ZT-.02);}
  P.plate('k',[[.70,.235],[.77,.29],[.775,.40],[-.775,.40],[-.77,.29],[-.70,.235]],.012,ZT-.012);
  P.box('Q',.40,.11,.01,0,.48,ZT-.006);
  P.box('k',1.50,.03,.22,0,.12,-2.11);for(const x of [-.48,-.12,.12,.48])P.box('k',.02,.14,.22,x,.19,-2.12);
  P.sym(sd=>{P.cyl('c',.065,.22,10,sd*.30,.31,-2.01,'z');P.cyl('s',.069,.035,10,sd*.30,.31,-2.085,'z');P.cyl('k',.052,.02,10,sd*.30,.31,-2.115,'z');});
  P.box('L',.10,.05,.02,0,.20,-2.22);
  // ---- LES FLANCS : les jupes, les rétros de course ----
  P.sym(sd=>{P.box('k',.06,.07,1.56,sd*.915,.15,0);
    P.box('k',.12,.02,.04,sd*.86,.93,1.0);P.box('N',.07,.08,.16,sd*.95,.975,.98);P.box('K',.06,.06,.006,sd*.95,.975,.899);});
  K.commit(P);
  return {hl:[.65,.53,ZN+.02],tl:[.58,.635,ZT-.02],wx:.82,wzF:ZF,wzR:-ZR,pots:[[.30,.31,-2.12],[-.30,.31,-2.12]],
          lpw:{R:R,w:JW,style:'multi',n:12,jante:NB?0xc9a24a:0xd7dbe1,accent:NB?0xc9a24a:0xd7dbe1,branches:1}};
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
