/* ============ CONFIGURATION PROGRESSION (surcouche) ============
   mode  : 'load'   charge ajustable, double progression reps puis charge
           'fixed'  charge non ajustable (kettlebell 10 kg), progression en reps
           'bw'     poids du corps, progression en reps jusqu'au haut de fourchette
           'time'   tenue chronometree
           'circuit' cardio par rounds
           'stretch' etirement chronometre
   reps  : [bas, haut] de la fourchette de travail. Sur bw et time, le haut EST
           le plafond : au-dela, c est la marche ecrite dans NEXT qui prend le
           relais, successeur verrouille ou consigne manuelle.
   cat   : emplacement dans le circuit alterne
   v2.16 : le champ cap disparait. Il ne portait plus qu une copie du haut de
   fourchette, ou pire un nombre au-dessus, et un cap au-dessus du haut faisait
   « relever » la fourchette d un cran a chaque passage au plafond, 6-12 puis
   7-13 puis 8-14 : du +1 lineaire habille en fourchette, sans nature
   d exercice, que le carnet avait deja nomme relevements fantomes en v2.5 et
   v2.13 sans le generaliser. Onze entrees etaient encore dans ce cas, 39
   marches que personne n avait choisies. Le mecanisme est retire du moteur,
   aucune donnee ne peut plus le declencher, et test43 l interdit.
*/
/* v2.22 : cadence commune a la lignee du pont fessier, voir 'pont-fessier' */
const PONT_CAD={monte:1.5,tenue:1,descente:2,etab:0,reprise:true};
/* exercices cadences qui ont ete des tenues en secondes : la migration v2.19
   ne concerne qu eux (v2.22) */
const CAD_DEPUIS_SECONDES=['gainage-lateral-jambe-levee'];
const CFG={
 'pompes-poignees':{cat:'push',mode:'bw',reps:[6,15],sets:3,bnd:'res',bnd0:true,band0:'aucune'},
 'pompes-inclinees':{cat:'push',mode:'bw',reps:[8,20],sets:3},
 'developpe-sol':{cat:'push',mode:'load',reps:[8,12],sets:3,load0:6},
 'elevations-laterales':{cat:'push',mode:'load',reps:[12,20],sets:3,load0:2},
 'face-pulls':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'jaune'},
 'tirage-doux':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'jaune'},
 'rowing-elastique':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'rouge'},
 'rowing-kettlebell':{cat:'pull',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10},
 'rowing-suspension':{cat:'pull',mode:'bw',reps:[8,15],sets:3},
 'curls-halteres':{cat:'pull',mode:'load',reps:[10,20],sets:3,load0:4},
 'goblet-squat':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 'box-squat':{cat:'legs',mode:'bw',reps:[8,15],sets:3},
 'fentes-arriere':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 /* v2.1 : la marche suivante des fentes etait documentee depuis la v1.2, « prends
    un haltere dans chaque main », et n etait pas outillee. Elle l est, sur le
    motif de l escalier de gainage : le successeur retire son predecesseur du
    tirage a son deblocage, si bien que le vivier jambes garde CINQ entrees
    tirables dans les deux etats de verrou et qu aucune frequence ne bouge.
    Verrou a deux series au plafond, comme les deux successeurs de gainage.
    v2.16 : le plafond des fentes vaut le haut de leur fourchette, 15 par cote,
    et non 18. Le 18 ecrit ici en v2.1 « valait deja » n avait ete choisi par
    personne : c etait le cap fantome, herite et lu comme un fait. */
 'fentes-arriere-lestee':{retire:'fentes-arriere',cat:'legs',mode:'load',reps:[8,15],sets:2,side:true,load0:2,
   lock:{after:'fentes-arriere',cond:'Fais {n} séries de 15 fentes arrière par côté',need:15,minSets:2}},
 'step-ups':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 /* Lot catalogue v2.0. Ces sept exercices entrent dans DB et CFG HORS des
    viviers, exactement comme les replis douleur : le tirage ne les voit pas,
    seule la bibliotheque les affiche. Ils sont inertes jusqu a l existence du
    resolveur, qui les convoque par la table SUBS. Un substitut ne porte ni
    verrou, ni retrait, ni position propre : il herite de l eligibilite de la
    position qu il resout. */
 'step-ups-bas':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 'retraction-scapulaire':{cat:'pull',mode:'bw',reps:[8,15],sets:3},
 'ecartement-elastique':{cat:'pull',mode:'band',reps:[10,18],sets:3,bnd:'res',band0:'jaune',pos:true},
 'tirage-vertical-elastique':{cat:'pull',mode:'band',reps:[8,15],sets:3,bnd:'res',band0:'rouge',pos:true},
 'elevations-laterales-elastique':{cat:'push',mode:'band',reps:[12,20],sets:3,bnd:'res',band0:'jaune',pos:true},
 'curls-elastique':{cat:'pull',mode:'band',reps:[10,20],sets:3,bnd:'res',band0:'rouge',pos:true},
 'rdl-elastique':{cat:'legs',mode:'band',reps:[8,15],sets:3,bnd:'res',band0:'rouge',pos:true},
 /* Escalier des mollets (v2.5). Le plafond descend de 30 a 25 : a 30 il
    fabriquait cinq relevements de fourchette, 12-25 puis 13-26 jusqu a 17-30,
    qui ne sont pas une progression mais le seul levier qui restait au moteur
    faute d echelle branchee. Plafond egal au haut de fourchette, comme la
    planche et le gainage lateral : la fourchette ne monte jamais, une seule
    marche s affiche, et le successeur prend le relais.
    Quatre echelons, chacun retirant son predecesseur, donc CINQ entrees
    tirables dans le vivier jambes quel que soit l etat des verrous, comme pour
    les fentes et le gainage. Charge par mollet a 78 kg de poids de corps :
    39 kg a deux jambes, 44 / 49 / 54 / 59 avec le sac, 78 sur une jambe, puis
    88 / 98 / 108 / 118. Le plus grand saut vaut +32 %, la ou passer directement
    du poids du corps a une jambe en valait +100 %.
    L amplitude n entre pas dans l escalier : la marche est une instruction de
    fiche et non une ressource, l outil ne suit l amplitude nulle part, ni la
    profondeur de squat ni celle des pompes, et la marche suivante du tirage en
    suspension est deja une amplitude non outillee. */
 'mollets-debout':{cat:'legs',mode:'bw',reps:[12,25],sets:2},
 'mollets-debout-leste':{retire:'mollets-debout',cat:'legs',mode:'fixed',reps:[12,25],sets:2,load0:10,
   lock:{after:'mollets-debout',cond:'Fais {n} séries de 25 mollets debout',need:25,minSets:2}},
 /* Le verrou lit la charge en plus des repetitions, ce qu aucun verrou ne
    savait faire avant la v2.5 : sans cette condition il se serait ouvert des
    25 repetitions au premier barreau, a 10 kg, et les barreaux 20, 30 et 40 de
    la version bilaterale n auraient jamais ete joues.
    La charge exigee est le DERNIER barreau de l echelle disponible, pas un
    nombre pose : 40 kg pour un inventaire complet, 10 kg pour qui ne declare
    qu une kettlebell de dix. Difference assumee avec le verrou des tractions
    strictes, qui lit lui l echelle entiere et non l echelle filtree par
    l inventaire : la-bas la bande la plus dure EST la preuve, ici l exercice
    debloque ne demande aucun materiel et exiger du materiel pour l ouvrir
    enfermerait un inventaire pauvre dans un etat dont il ne pourrait plus
    sortir. */
 'mollets-une-jambe':{retire:'mollets-debout-leste',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,
   lock:{after:'mollets-debout-leste',cond:'Fais {n} séries de 25 mollets debout lestés au dernier cran de charge',need:25,minSets:2,loadTop:true}},
 'mollets-une-jambe-leste':{retire:'mollets-une-jambe',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,
   lock:{after:'mollets-une-jambe',cond:'Fais {n} séries de 15 mollets sur une jambe par côté',need:15,minSets:2}},
 'rdl-kettlebell':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 /* Escalier du pont fessier (v2.13). Deuxieme vraie impasse recensee en v2.5,
    meme profil que les mollets debout : un plafond a 25 pour une fourchette
    10-20 fabriquait cinq relevements fantomes, et la marche ecrite, passer sur
    une jambe, valait +100 % par jambe. Le plafond vaut desormais le haut de
    fourchette et l exercice ouvre sur un successeur.
    Deux barreaux lestes suffisent la ou les mollets en demandaient quatre,
    parce que la charge posee sur le bassin monte de l amplitude entiere quand
    le poids du corps n en monte que la moitie : voir l echelle des hanches.
    Sauts obtenus, en resistance par jambe : +33 %, +25 %, puis +21 % pour le
    passage sur une jambe.
    L amplitude reste hors de l escalier. Le pied sureleve vaut environ +45 %,
    soit le meme ordre que le hip thrust et pour la meme raison, donc un doublon
    moins stable ; il vit dans la fiche, comme la hauteur de marche des mollets.
    Ce que step-ups et step-ups-bas montrent est autre chose : deux hauteurs
    servies comme deux ressources, sans qu aucun verrou ne compare jamais des
    repetitions faites sur l une et sur l autre.
    Pas de pont-fessier-une-jambe-leste : a +10 kg il rendrait +33 % puis
    laisserait +12 % au hip thrust, deux barreaux colles au prix d une fiche et
    d une traversee de fourchette. Il reste l intermediaire a inserer si
    l entree dans le hip thrust se revele trop raide a l usage. */
/* v2.22 : le pont fessier et sa lignee en repetitions cadencees. Sur le dos,
    ou les epaules sur un banc, l ecran ne se voit pas : c est le critere qui a
    mis bird-dog, dead bug et abductions au son. La fiche prescrivait deja trois
    temps, monter, marquer un temps en haut, redescendre lentement, que rien
    n imposait ; accelerer un pont, c est finir en cambrant. Montee 1,5 s, tenue
    1 s, descente 2 s, cycle de 4,5 s : 20 repetitions font 90 s, contre environ
    5,4 s par repetition mesurees le 22 septembre 2026 sans son. Valeurs de
    depart proposees par Claude, a eprouver. Pas d etablissement, le decompte
    enchaine comme au bird-dog. Reprise, decision de Gabriel : rien n est
    continu, une pause en bas est un repos. */
 'pont-fessier':{cat:'legs',mode:'bw',reps:[10,20],sets:3,cadence:PONT_CAD},
 'pont-fessier-leste':{retire:'pont-fessier',cat:'legs',mode:'fixed',reps:[10,20],sets:3,load0:10,cadence:PONT_CAD,
   lock:{after:'pont-fessier',cond:'Fais {n} séries de 20 ponts fessiers',need:20,minSets:2}},
 'pont-fessier-une-jambe':{retire:'pont-fessier-leste',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,cadence:PONT_CAD,
   lock:{after:'pont-fessier-leste',cond:'Fais {n} séries de 20 ponts fessiers lestés au dernier cran de charge',need:20,minSets:2,loadTop:true}},
 'hip-thrust-une-jambe':{retire:'pont-fessier-une-jambe',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,cadence:PONT_CAD,
   lock:{after:'pont-fessier-une-jambe',cond:'Fais {n} séries de 15 ponts fessiers sur une jambe par côté',need:15,minSets:2}},
 'hip-thrust-une-jambe-leste':{retire:'hip-thrust-une-jambe',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,cadence:PONT_CAD,
   lock:{after:'hip-thrust-une-jambe',cond:'Fais {n} séries de 15 hip thrusts sur une jambe par côté',need:15,minSets:2}},
 /* Escalier du squat (v2.18). Le goblet squat plafonnait a la kettlebell la
    plus lourde : au-dessus, des lestes de poignets a deux kilos, soit environ
    2 % de la charge sur les cuisses (78 kg + kettlebell), et une marche
    ecrite, le sac porte devant, qui rendait la charge aux avant-bras. Avec ce
    materiel, la seule vraie suite est de passer sur une jambe.
    Premier barreau, le squat sur une jambe vers une chaise : la chaise borne
    la profondeur, contrainte genoux du carnet appliquee par construction. Par
    jambe, ordres de grandeur non mesures : 47 kg au goblet squat a 16 kg, 66 a
    70 kg ici, soit +41 a +49 %, dans le precedent de l entree du hip thrust
    (+50 %, absorbe par le retour au bas de fourchette). Le verrou lit la
    kettlebell la plus lourde, sans lestes : a 22 kg le saut ne perdait que
    neuf points, au prix de trois barreaux inutiles.
    La hauteur d assise est un palier du meme exercice, pas une fiche : meme
    image, memes positions, comme la tenue du bird-dog (decision tranchee).
    Deux barreaux, 50 puis 40 cm, les deux butees d un fauteuil de bureau,
    retrouvees a l identique ; essai de Gabriel le 15 septembre 2026 : 50 cm
    fait deja travailler, 40 cm pas trois repetitions d affilee. Des crans de
    2,5 cm ont ete proposes et refuses : a 15 repetitions a 50 cm, les muscles
    sont prets pour 8 a 40. Si l entree a 40 est trop raide, le filet de
    securite remonte la chaise.
    Second barreau, la version lestee a 40 cm, kettlebell tenue devant, par
    kettlebells seules : 10 puis 16 kg, la suite se decidera la. Le contrepoids
    qui facilite le mouvement de ceux que l equilibre limite n est pas un
    risque de marche descendante ici : apres 2 x 15 a 40 cm, la limite est
    musculaire.
    Pistol complet ecarte, pour la flexion lombaire qui l accompagne souvent en
    bas du mouvement et la profondeur non bornee, pas pour la cheville. */
 'squat-une-jambe-chaise':{retire:'goblet-squat',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,
   assise:{ladder:[[50,8,15],[40,8,15]]},
   lock:{after:'goblet-squat',cond:'Fais {n} séries de 15 goblet squats avec ta kettlebell la plus lourde, sans lestes',need:15,minSets:2,kbTop:true}},
 'squat-une-jambe-chaise-leste':{retire:'squat-une-jambe-chaise',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,kbSeules:true,
   lock:{after:'squat-une-jambe-chaise',cond:'Fais {n} séries de 15 squats sur une jambe par côté, assise à 40 cm',need:15,minSets:2,rungTop:true}},
 'kb-swings':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 /* Tenues rythmees (v2.17). La tenue de chaque repetition est le palier de
    l exercice, et l outil la rythme au son. Trois barreaux [tenue, bas, haut]
    par cote : 3 s sur 6-12, 6 s sur 4-8, 10 s sur 3-6, tenue cumulee par cote
    au haut 36, 48 puis 60 s. Bascule de 2 s entre deux tenues, constante
    d exercice et non reglage : a 1 s la bascule devient un balancement. Le
    premier barreau est la consigne actuelle des fiches, 3 + 2 = 5 s vaut le
    tempo modelise jusqu ici, la migration est donc neutre : fourchette, cible
    et memoire conservees, p.tenue absent vaut 3. Le mode reste bw : c est un
    exercice en repetitions dont chaque repetition est une tenue, la
    progression se lit en repetitions et l echelle joue le role de la bande. */
 'bird-dog':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:2,ladder:[[3,6,12],[6,4,8],[10,3,6]]}},
 'dead-bug':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:2,ladder:[[3,6,12],[6,4,8],[10,3,6]]}},
 'pallof-press':{cat:'core',mode:'band',pos:true,reps:[6,12],sets:2,side:true,bnd:'res',band0:'jaune'},
 'planche':{cat:'core',mode:'time',reps:[20,45],sets:2},
 'planche-ballon':{retire:'planche',cat:'core',mode:'time',reps:[15,45],sets:2,
   lock:{after:'planche',cond:'Tiens {n} séries de 45 s en planche au sol',need:45,minSets:2}},
 'gainage-lateral':{cat:'core',mode:'time',reps:[15,45],sets:2,side:true},
 /* v2.19 : la jambe ne se tient plus, elle monte et descend au son sur une
    planche tenue. C est la forme mesuree par Boren et al. 2011, la jambe
    tenue n ayant ete etudiee nulle part. Repetitions cadencees : montee et
    descente de 1,5 s, cycle de 3 s, 15 repetitions font 45 s de planche, le
    plafond des tenues au sol. etab : secondes de planche jambes serrees entre
    le zero du decompte, ou le bassin se decolle, et la premiere montee. Un
    cote entier puis l autre, jamais d alternance : changer de cote, c est se
    retourner. La progression est celle d un bw ordinaire, sans echelle. */
 'gainage-lateral-jambe-levee':{retire:'gainage-lateral',cat:'core',mode:'bw',reps:[8,15],sets:2,side:true,
   cadence:{monte:1.5,descente:1.5,etab:3},
   lock:{after:'gainage-lateral',cond:'Tiens {n} séries de 45 s en gainage latéral, côté faible compris',need:45,minSets:2}},
 'planche-genoux':{cat:'core',mode:'time',reps:[20,45],sets:2},
 'cardio-bas-impact':{cat:'cardio',mode:'circuit',reps:[4,10],sets:1},
 'marche-continue':{cat:'cardio',mode:'circuit',reps:[1,1],sets:1},
 'etir-nuque':{cat:'mob',mode:'stretch'},'etir-pecs':{cat:'mob',mode:'stretch'},
 'chat-vache':{cat:'mob',mode:'stretch'},'etir-hanches':{cat:'mob',mode:'stretch'},
 'etir-ischios':{cat:'mob',mode:'stretch'},'posture-enfant':{cat:'mob',mode:'stretch'}
};

/* --- trois exercices complementaires : tirage horizontal, gainage lateral, fessiers --- */
DB['rowing-suspension']={
 nom:'Tirage en suspension',en:'Inverted row',mus:'Milieu du dos, arrière d\'épaules, biceps',
 desc:['Sangles accrochées à la barre de traction, poignées tenues bras tendus, corps gainé en ligne droite des épaules aux talons.',
       'Recule les pieds pour amener le corps à environ 30° du sol, comme sur le dessin : c\'est l\'inclinaison de travail.',
       'Tire les poignées vers les côtes, coudes près du corps, omoplates serrées, souffle en tirant, puis redescends lentement.'],
 vig:'<b>Dos :</b> le corps reste une planche, ne laisse pas le bassin s\'affaisser. <b>Inclinaison :</b> vise environ 30° par rapport au sol ; plus tu es horizontal, plus c\'est dur. <b>Progression :</b> au plafond de répétitions, avance les pieds de quelques centimètres plutôt que d\'en faire plus.',
 fb:'rowing-elastique'};
DB['gainage-lateral']={
 nom:'Gainage latéral',en:'Side plank',mus:'Obliques, carré des lombes, stabilité du bassin',
 desc:['Sur le côté, en appui sur l\'avant-bras, coude sous l\'épaule, jambes tendues l\'une sur l\'autre.',
       'Décolle le bassin pour former une ligne droite de la tête aux pieds, et tiens.',
       'Le chrono s\'arrête dès que le bassin descend. Fais l\'autre côté.'],
 fin:'la hanche qui descend. Une tenue finit quand la ligne casse, pas quand le chrono paraît court.',
 vig:'<b>Dos :</b> pièce maîtresse pour les lombaires fragiles, aucune flexion de colonne. Si c\'est trop dur, plie les genoux et prends appui dessus : la version genoux compte pleinement. <b>Épaules :</b> pousse le sol avec l\'avant-bras et garde l\'épaule loin de l\'oreille, sans t\'affaisser dedans. La version genoux allège aussi l\'épaule. <b>Respiration :</b> ne bloque jamais, souffle lentement pendant la tenue.'};
DB['pont-fessier']={
 nom:'Pont fessier',en:'Glute bridge',mus:'Fessiers, ischios, bas du dos',
 desc:['Allongé sur le dos, genoux pliés, pieds à plat au sol écartés de la largeur des hanches, bras le long du corps.',
       'Pousse dans les talons pour décoller le bassin jusqu\'à aligner genoux, hanches et épaules.',
       'Serre fort les fessiers en haut en soufflant, marque un temps, redescends lentement sans poser complètement.'],
 fin:'le haut qui se gagne en cambrant. Dès que le bas du dos prend le relais des fessiers pour monter plus haut, la série est finie.',
 vig:'<b>Dos :</b> la poussée vient des fessiers, pas des lombaires : ne cherche pas à monter plus haut que l\'alignement. Des fessiers forts protègent directement ton bas du dos. <b>Progression :</b> au plafond, le pont fessier lesté prend le relais.'};

/* --- v2.13 : quatre marches de l escalier du pont fessier. Chacune retire son
   predecesseur du tirage a son deblocage, et les quatre replient sur le pont au
   sol, seul maillon sans verrou : un repli douleur doit rester atteignable a
   tout instant, motif impose par test11 aux mollets en v2.5. --- */
DB['pont-fessier-leste']={
 nom:'Pont fessier lesté',en:'Weighted glute bridge',mus:'Fessiers, ischios, bas du dos',
 desc:['Même position qu\'au sol, une charge posée en travers du pli de la hanche, sur le haut des cuisses, une serviette pliée dessous.',
       'Tiens la charge à deux mains pendant toute la série : elle ne doit jamais glisser vers le ventre.',
       'Pousse dans les talons jusqu\'à aligner genoux, hanches et épaules, souffle en montant, redescends lentement sans poser complètement.'],
 fin:'le haut qui se gagne en cambrant, ou la charge qui glisse. Si la charge bouge, c\'est le montage qui est à sa limite, pas les fessiers.',
 vig:'<b>Dos :</b> même règle qu\'au sol, aucune cambrure pour gagner de la hauteur. <b>Charge :</b> jamais sur le ventre ni sur l\'os du pubis à nu ; une kettlebell posée à plat est plus stable qu\'un sac, qui se déplace latéralement. <b>Progression :</b> l\'échelle s\'arrête à 20 kg, le pont sur une jambe prend le relais.',
 fb:'pont-fessier'};
DB['pont-fessier-une-jambe']={
 nom:'Pont fessier sur une jambe',en:'Single-leg glute bridge',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Allongé sur le dos, un pied à plat au sol, l\'autre jambe décollée, genou plié, cuisse dans l\'axe de la cuisse d\'appui.',
       'Pousse dans le talon d\'appui pour aligner genou, hanche et épaules, souffle en montant.',
       'Les deux hanches restent à la même hauteur pendant toute la montée. Fais l\'autre côté.'],
 fin:'le bassin qui tourne, ou le haut qui se gagne en cambrant. Une hanche qui descend d\'un côté finit la série, quel que soit le compte.',
 vig:'<b>Dos :</b> aucune cambrure en haut, la poussée vient du fessier d\'appui. <b>Bassin :</b> ne ramène pas le genou libre sur la poitrine, il ferait travailler la hanche libre et masquerait la bascule du bassin. <b>Amplitude :</b> pied d\'appui sur une marche basse pour aller plus loin ; l\'outil ne suit pas cette variante, elle ne change pas ta cible.',
 fb:'pont-fessier'};
DB['hip-thrust-une-jambe']={
 nom:'Hip thrust sur une jambe',en:'Single-leg hip thrust',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Assis au sol devant une assise stable à hauteur de genou, le haut du dos appuyé contre le bord, sous les omoplates.',
       'Un pied à plat au sol, l\'autre jambe décollée, genou plié. Menton rentré, côtes basses.',
       'Monte le bassin jusqu\'à ce que le tronc soit horizontal, tibia d\'appui vertical, souffle en montant, puis redescends lentement. Fais l\'autre côté.'],
 fin:'le haut qui se gagne en cambrant, ou le bassin qui tourne. La série finit là, pas quand le compte est atteint.',
 vig:'<b>Cou et épaules :</b> l\'appui va sous les omoplates, jamais sur la nuque ni sur une arête vive, et l\'assise doit être calée contre un mur. <b>Dos :</b> l\'amplitude est plus grande qu\'au sol, c\'est elle qui rend l\'exercice plus dur ; en haut on s\'arrête à l\'alignement, on ne cambre pas. <b>Progression :</b> le hip thrust lesté prend le relais.',
 fb:'pont-fessier'};
DB['hip-thrust-une-jambe-leste']={
 nom:'Hip thrust sur une jambe lesté',en:'Weighted single-leg hip thrust',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Même installation, charge posée en travers du pli de la hanche avec une serviette pliée dessous, posée avant de s\'installer.',
       'Tiens la charge à deux mains pendant toute la série, un pied à plat au sol, l\'autre jambe décollée, genou plié.',
       'Monte jusqu\'à l\'horizontale du tronc en soufflant, redescends lentement. Fais l\'autre côté.'],
 fin:'le haut qui se gagne en cambrant, le bassin qui tourne, ou la charge qui glisse.',
 vig:'<b>Cou et épaules :</b> appui sous les omoplates, assise calée contre un mur. <b>Charge :</b> posée avant de s\'installer, jamais attrapée une fois en position, et tenue à deux mains. <b>Dos :</b> aucune cambrure en haut. <b>Progression :</b> pas de marche outillée au-delà.',
 fb:'pont-fessier'};
DB['squat-une-jambe-chaise']={
 nom:'Squat sur une jambe vers la chaise',en:'Single-leg box squat',mus:'Cuisses, fessiers, stabilité du genou et du bassin',
 desc:['Chaise stable derrière toi, assise à la hauteur indiquée par l\'outil, 50 puis 40 cm. Debout sur une jambe, un petit pas devant, l\'autre jambe tendue devant, talon juste au-dessus du sol, bras tendus devant toi.',
       'Descends lentement en poussant les fesses vers l\'arrière, genou d\'appui dans l\'axe du pied, jusqu\'à effleurer l\'assise sans t\'y poser.',
       'Remonte sans élan en poussant dans le talon, souffle en montant. Enchaîne les répétitions sans t\'asseoir, puis fais l\'autre côté.'],
 fin:'le buste qui balance pour remonter, le genou qui rentre, ou l\'assise sur laquelle tu te laisses tomber. La série finit là, pas quand le compte est atteint.',
 vig:'<b>Genoux :</b> le genou d\'appui suit l\'axe du pied, jamais vers l\'intérieur, et la chaise fixe la profondeur : pas plus bas qu\'elle. <b>Dos :</b> le buste se penche depuis les hanches, dos droit, sans enrouler le bas du dos en bas du mouvement. <b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur ou un meuble ; toujours le même, repéré aux mêmes hauteurs. <b>Respiration :</b> souffle en remontant, ne bloque pas. <b>Progression :</b> 50 cm puis 40 cm, puis la version lestée.',
 fb:'box-squat'};
DB['squat-une-jambe-chaise-leste']={
 nom:'Squat sur une jambe vers la chaise lesté',en:'Weighted single-leg box squat',mus:'Cuisses, fessiers, stabilité du genou et du bassin',
 desc:['Même installation, assise à 40 cm. Tiens la kettlebell à deux mains par les cornes, collée au sternum, coudes vers le bas.',
       'Descends lentement jusqu\'à effleurer l\'assise, genou d\'appui dans l\'axe du pied, la kettlebell toujours contre la poitrine.',
       'Remonte sans élan en soufflant, sans t\'asseoir entre deux répétitions, puis fais l\'autre côté.'],
 fin:'le buste qui balance, le genou qui rentre, la kettlebell qui s\'écarte de la poitrine, ou l\'assise sur laquelle tu te laisses tomber.',
 vig:'<b>Genoux :</b> genou d\'appui dans l\'axe du pied, pas plus bas que la chaise. <b>Dos :</b> dos droit, la charge reste devant, jamais sur les épaules ni dans le dos. <b>Charge :</b> kettlebells seules, sans lestes aux poignets. <b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur. <b>Respiration :</b> souffle en remontant, ne bloque pas.',
 fb:'box-squat'};

/* --- v1.17 : deuxieme marche de l escalier de gainage. Les deux tenues au sol
   plafonnent a 45 s, leur fourchette ne monte jamais, et jusqu ici rien ne
   prenait le relais : c etait le cul-de-sac du carnet. Chaque successeur reste
   isometrique, ne demande aucune flexion de colonne, et retire son predecesseur
   du tirage a son deblocage. --- */
DB['planche-ballon']={
 nom:'Planche sur ballon',en:'Swiss ball plank',mus:'Gainage complet, stabilisateurs profonds',
 desc:['Avant-bras posés sur le dessus du ballon, coudes sous les épaules, mains jointes ou poings côte à côte.',
       'Installe-toi d\'abord à genoux, puis tends les jambes une par une : pointes de pieds au sol, corps aligné des épaules aux talons.',
       'Le ballon bouge en permanence, ton travail est de l\'empêcher de bouger. Le chrono s\'arrête dès que le bassin descend ou que les avant-bras glissent.'],
 vig:'<b>Dos :</b> l\'instabilité remplace le levier, aucune flexion de colonne ajoutée. <b>Ballon :</b> gonflé ferme, c\'est le gonflage qui fixe la difficulté ; un ballon mou rend l\'exercice plus facile, pas plus dur. <b>Respiration :</b> ne bloque jamais, souffle lentement pendant la tenue. <b>Épaules :</b> si l\'appui tire sur l\'épaule, redescends à la planche au sol pour la séance.',
 fb:'planche'};
DB['gainage-lateral-jambe-levee']={
 nom:'Gainage latéral, abductions',en:'Side plank with hip abduction',mus:'Obliques, carré des lombes, moyen fessier',
 desc:['Sur le côté, en appui sur l\'avant-bras, coude sous l\'épaule, jambes tendues l\'une sur l\'autre.',
       'Au double bip, décolle le bassin et établis la ligne de la tête aux pieds. Au bip aigu, monte la jambe du dessus en 1,5 s jusqu\'à environ 35°, pied dans l\'axe du corps, en soufflant ; au bip grave, redescends-la en 1,5 s jusqu\'à effleurer l\'autre jambe, sans t\'y reposer.',
       'Une répétition compte jambe revenue. Arrête dès que la ligne casse, puis fais l\'autre côté.'],
 fin:'le bassin qui descend ou qui part en arrière. Dès que la ligne casse, Stop, quel que soit le compte.',
 vig:'<b>Dos :</b> le tronc reste immobile, seule la hanche bouge ; aucune flexion de colonne. Si le bassin part en arrière, baisse la jambe plutôt que de tourner. <b>Hanche :</b> lève à hauteur confortable, une jambe trop haute fait travailler le tenseur du fascia lata et bascule le bassin. <b>Épaules :</b> même appui que la version au sol, pousse le sol avec l\'avant-bras et garde l\'épaule loin de l\'oreille, sans t\'affaisser dedans. <b>Respiration :</b> ne bloque jamais, souffle régulièrement pendant la série.',
 fb:'gainage-lateral'};

/* --- quatre variantes de tractions a partir des deux entrees d origine --- */
(function buildPullups(){
  const A=DB['tractions-assistees'], S=DB['tractions-strictes'];
  DB['tractions-assistees-supination']=Object.assign({},A,{
    nom:'Tractions assistées, supination',en:'Band-assisted chin-ups',
    desc:['Élastique passé sur la barre, pied ou genou dedans. Prise en supination, paumes vers toi, largeur épaules.',
          'Tire jusqu\'à amener le menton au niveau de la barre, coudes vers le bas, souffle en tirant.',
          'Descends lentement en 2-3 s, bras presque tendus en bas.']});
  DB['tractions-assistees-pronation']=Object.assign({},A,{
    nom:'Tractions assistées, pronation',en:'Band-assisted pull-ups',
    mus:'Grand dorsal, haut du dos',
    desc:['Même montage élastique, mais prise en pronation, paumes vers l\'avant, un peu plus large que les épaules.',
          'Tire en amenant la poitrine vers la barre, coudes vers le bas et légèrement écartés, souffle en tirant.',
          'Descends lentement, bras presque tendus en bas.'],
    vig:'<b>Épaules :</b> la pronation sollicite davantage le dos mais tire plus sur les épaules. Amplitude confortable uniquement, et arrête au moindre pincement.'});
  DB['tractions-strictes-supination']=Object.assign({},S,{
    nom:'Tractions strictes, supination',en:'Chin-ups',
    lock:{after:'tractions-assistees-supination',cond:'Atteins 10 tractions assistées supination sur une série avec ton élastique le plus fin',need:10,bandGate:true}});
  DB['tractions-strictes-pronation']=Object.assign({},S,{
    nom:'Tractions strictes, pronation',en:'Pull-ups',mus:'Grand dorsal, haut du dos',
    lock:{after:'tractions-assistees-pronation',cond:'Atteins 10 tractions assistées pronation sur une série avec ton élastique le plus fin',need:10,bandGate:true},
    vig:'<b>Épaules :</b> l\'exercice le plus exigeant du programme. Reste strict, pas de balancier, et descends contrôlé.'});
  delete DB['tractions-assistees']; delete DB['tractions-strictes'];
  Object.assign(CFG,{
    'tractions-assistees-supination':{cat:'pull',mode:'bw',reps:[4,10],sets:3,bnd:'ass',band0:'noir'},
    'tractions-assistees-pronation':{cat:'pull',mode:'bw',reps:[4,10],sets:3,bnd:'ass',band0:'noir',
      lock:{after:'tractions-assistees-supination',cond:'Fais {n} séries de 6 en supination avant d\'attaquer la pronation',need:6,minSets:3}},
    'tractions-strictes-supination':{retire:'tractions-assistees-supination',cat:'pull',mode:'bw',reps:[3,8],sets:3},
    'tractions-strictes-pronation':{retire:'tractions-assistees-pronation',cat:'pull',mode:'bw',reps:[3,8],sets:3}
  });
  DB['tractions-assistees-pronation'].lock=CFG['tractions-assistees-pronation'].lock;
})();
Object.keys(CFG).forEach(id=>{ if(DB[id]) Object.assign(DB[id],CFG[id]); });
/* marche suivante reelle de chaque exercice plafonne (decision carnet :
   pas de moteur generique, une marche propre a chacun) */
const NEXT={
 'pompes-inclinees':'passe aux pompes au sol',
 'box-squat':'passe au goblet squat',
 'planche-genoux':'passe à la planche complète',
 'rowing-suspension':'avance les pieds de quelques centimètres, corps plus proche de l\'horizontale',
 'fentes-arriere':'prends un haltère dans chaque main, le long du corps',
 'step-ups':'ajoute les lestes de chevilles, puis des haltères en mains',
 'step-ups-bas':'passe aux step-ups sur marchepied',
 'retraction-scapulaire':'marque une pause de 3 s omoplates serrées ; avec un élastique, l\'écartement prend le relais de lui-même',
 'mollets-debout':'les mollets debout lestés prennent le relais',
 'mollets-debout-leste':'les mollets sur une jambe prennent le relais',
 'mollets-une-jambe':'les mollets sur une jambe lestés prennent le relais',
 'mollets-une-jambe-leste':'pas de marche outillée au-delà',
 'pont-fessier':'le pont fessier lesté prend le relais',
 'pont-fessier-leste':'le pont fessier sur une jambe prend le relais',
 'pont-fessier-une-jambe':'le hip thrust sur une jambe prend le relais',
 'hip-thrust-une-jambe':'le hip thrust sur une jambe lesté prend le relais',
 'hip-thrust-une-jambe-leste':'pas de marche outillée au-delà',
 /* v2.17 : l allongement des tenues est devenu l echelle elle-meme, la marche
    ecrite est celle du dernier barreau, 10 s, que McGill n allonge pas. */
 'bird-dog':'au bout des tenues de 10 s, trace des carrés d\'au plus trente centimètres avec la main et le pied tendus, le bassin immobile ; jamais de lest ici',
 'dead-bug':'au bout des tenues de 10 s, tiens une résistance à deux mains, élastique ancré au sol derrière la tête ou haltère léger au-dessus de la poitrine, jambes seules en mouvement ; jamais de lest sur un membre',
 'planche':'la planche sur ballon prend le relais',
 'planche-ballon':'fais tourner lentement le ballon en petits cercles pendant la tenue ; l\'outil ne suit pas encore cette variante',
 'gainage-lateral':'le gainage latéral avec abductions prend le relais',
 /* v2.19 : plus de lest promis. A la cheville, le lest charge la hanche et
    presque pas le tronc ; la suite se decidera a part. */
 'gainage-lateral-jambe-levee':'pas de marche outillée au-delà ; la suite reste à décider',
 'tractions-strictes-supination':'lestes de chevilles en appoint fin ; sac ou gilet plus tard',
 'tractions-strictes-pronation':'lestes de chevilles en appoint fin ; sac ou gilet plus tard',
 'tractions-assistees-supination':'les tractions strictes prennent le relais',
 'tractions-assistees-pronation':'les tractions strictes prennent le relais',
 'pompes-poignees':'pieds surélevés à hauteur modérée, puis gilet lesté',
 'goblet-squat':'le squat sur une jambe vers la chaise prend le relais',
 'squat-une-jambe-chaise':'la version lestée prend le relais',
 'squat-une-jambe-chaise-leste':'sac lesté porté devant, jamais dans le dos',
 'rowing-kettlebell':'passe sur l\'haltère seul, tout le stock de disques sur une barre',
 'rdl-kettlebell':'pas de marche outillée au-delà',
 'kb-swings':'pas de marche outillée au-delà',
 'fentes-arriere-lestee':'squat bulgare avec haltères, en repartant vers 5 kg par main ; l\'outil ne le suit pas encore'
};
Object.keys(NEXT).forEach(id=>{ if(DB[id]) DB[id].next=NEXT[id]; });
/* Marche suivante des exercices a kettlebell (v2.1). Elle etait ecrite comme un
   fait, « plafond du materiel actuel », alors que le materiel est declare depuis
   la v2.0 : chez quelqu un qui n a pas encore declare la kettlebell suivante,
   la vraie marche est un achat ou une declaration, pas une impasse. Le texte se
   compose donc a l affichage, depuis l inventaire, et ne devient une impasse
   que lorsque la liste des poids est epuisee. */
/* v2.18 : le goblet squat sort de la liste, sa suite est desormais le squat
   sur une jambe, qui s ouvre a la kettlebell la plus lourde ; la version
   lestee y entre, son echelle n etant faite que de kettlebells. */
const KB_NEXT=['squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];
function nextFor(id,gear){
  const e=DB[id];
  if(!e) return '';
  if(KB_NEXT.indexOf(id)<0) return e.next||'';
  const g=gear||(typeof state!=='undefined'&&state?state.gear:null);
  const owned=kbOwned(g), top=owned.length?owned[owned.length-1]:0;
  const sup=KB_W.map(parseFloat).filter(w=>w>top);
  if(sup.length) return 'déclare une kettlebell de '+fmtNum(sup[0])+' kg quand tu l\'auras, l\'échelle la prendra toute seule';
  return e.next||'';
}
/* fallbacks mis a jour */
DB['tractions-assistees-supination'].fb='rowing-elastique';
DB['tractions-assistees-pronation'].fb='rowing-elastique';

/* ============ STRUCTURE DES SEANCES ============ */
/* mode alterne : 4 emplacements non concurrents, chacun avance dans son propre vivier */
const SLOTS={
 push:{label:'Poussé',pool:['pompes-poignees','elevations-laterales','developpe-sol']},
 pull:{label:'Tiré',pool:['tractions-assistees-supination','face-pulls','rowing-suspension','rowing-kettlebell','face-pulls','curls-halteres','tractions-assistees-pronation','tractions-strictes-supination','tractions-strictes-pronation']},
 legs:{label:'Jambes',pool:['goblet-squat','squat-une-jambe-chaise','squat-une-jambe-chaise-leste','fentes-arriere','fentes-arriere-lestee','pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste','mollets-debout','mollets-debout-leste','mollets-une-jambe','mollets-une-jambe-leste','step-ups','rdl-kettlebell','kb-swings']},
 /* v1.17 : chaque successeur est place juste apres son predecesseur, qu il
    retire a son deblocage. Le vivier filtre vaut donc cinq entrees dans les
    quatre etats de verrous, dans le meme ordre : la substitution se fait sur
    place et n allonge jamais l intervalle entre deux passages. */
 core:{label:'Gainage',pool:['planche','planche-ballon','bird-dog','gainage-lateral','gainage-lateral-jambe-levee','dead-bug','pallof-press']}
};
/* v2.7 : l ordre du circuit passe de poussé, tiré, jambes, gainage a poussé,
   tiré, gainage, jambes. Le circuit est CIRCULAIRE, le dernier exercice d un
   tour precede le premier du tour suivant : quatre adjacences, six ordres
   distincts et non vingt-quatre. Mesure sur toutes les combinaisons des
   viviers, deux etats de verrous et deux hypotheses sur l enchainement pousse
   vers tire, script ordre-circuit.js : l ordre d origine sortait cinquieme sur
   six dans le modele de base, et le restait sur 254 des 256 jeux de marqueurs
   testes. Celui-ci n est derriere lui dans aucun des quatre scenarios et il est
   premier dans trois. Il supprime l adjacence jambes vers gainage, soit
   l interference par les erecteurs relevee a l audit v1.6, et il referme le
   tour par jambes vers pousse, quatre des sept exercices jambes ne chargeant
   rien du haut du corps. Il ne touche ni la selection, ni la rotation, ni les
   frequences, ni les verrous : le tirage est inchange, seule la sequence
   bouge.
   v2.10 : pousse, jambes, tire, gainage. Deux corrections a la mesure v2.7.
   D abord un defaut de rapport : les six ordres forment trois paires miroir,
   conflits(a,b) etant symetrique, donc l ordre v2.7 n etait jamais meilleur
   SEUL, toujours ex aequo avec son miroir. Ensuite la premisse d independance
   des quatre emplacements, fausse sur l epaule : au moins un poste marque
   epaule=3 dans 100 % des 450 quatuors de l etat de depart, deux ou plus dans
   68 %, moyenne 1,93 sur 4.
   Ce que l ordre fait : il protege le face pull, dont le predecesseur
   conflictuait dans 67 % des quatuors en P,U,C,L et dans 13 % ici. Ce qu il
   coute : il cree une adjacence gainage vers pousse a 80 %, et le total passe
   de 1,43 a 1,53 conflit par seance. L ordre SEUL est donc une regression
   mesuree, et il n est jamais livre seul : la pause au raccord de tour ramene
   le total a 0,73. Les deux sont indissociables, voir PAUSE_TOUR.
   Inchange : selection, rotation, frequences, verrous, modele de temps. */
/* ============ COMMENT CA MARCHE (v2.12, reecrit en v2.14) ============
   Un seul texte, revele progressivement. Quatre blocs courts, chacun portant
   son developpement replie sur place : pas de deuxieme version longue avec un
   selecteur, qui demanderait de choisir avant de savoir ce qu il y a dans
   l autre et imposerait de tenir deux textes qui divergeraient.
   Le meme tableau sert l accueil et la section de Reglages : un seul chemin,
   donc aucun risque que les deux se mettent a dire autre chose.
   La v2.12 comblait trois trous recenses au carnet : la phase de calibration,
   le critere de fin de serie et la regle d or « renseigne-toi sur l exercice
   avant de le faire ». La v2.14 en comble un quatrieme, mis au jour par une
   lecture de Gabriel : la regle de cible, mecanisme permanent, vivait sous la
   calibration, qui est une phase, et rien ne disait ce qu est une cible. Un
   lecteur en deduisait que la cible etait la courbe de progression. Le bloc
   de tete le dit, et solde au passage le point « contrat d effort » de la
   file d attente : la cible est ce qu on vise, pas la ou on s arrete.
   Audit de forme du meme lot : les trois blocs de la v2.12 passaient de 552 a
   380 mots, l echec technique y etait enonce trois fois, l exemple du bassin
   deux fois, et le mecanisme n etait raconte qu a moitie, la montee de cible
   sans le retour au bas de fourchette, sans le filet et sans l allegee.
   L exemple des pompes est conserve mot pour mot, le carnet le marque « a
   conserver tel quel ». */
const COMMENT=[
 {t:'Cible, fourchette, charge',
  c:'La cible est ce que tu vises sur chaque série, pas là où tu t\'arrêtes. Elle suit ce que tu fais ; la charge, elle, ne monte que quand toutes tes séries atteignent le haut de la fourchette.',
  l:['À chaque passage, l\'outil retient ta plus petite série. La cible suivante vaut la plus haute des deux derniers passages, plus une : trois séries de 12 pompes pour une cible à 6 donnent 13, tu ne refais pas le chemin. Une mauvaise séance ne fait pas reculer la cible ; deux de suite, si, et le récap le dit.',
     'Quand toutes tes séries atteignent le haut de la fourchette, la charge ou la bande monte d\'un cran et la cible retombe au bas de la fourchette. Ta progression se lit sur la charge, pas sur la cible. Sans charge à monter, une variante plus dure prend le relais, derrière un verrou.',
     'Si toutes les séries d\'un passage tombent sous le bas de la fourchette, la charge redescend d\'un cran, sauf au premier passage après une montée. Pas en forme ? La séance allégée, choisie avant de lancer, ne touche ni à la cible ni à la charge.']},
 {t:'La calibration, au début',
  c:'Les premières semaines servent à trouver ta plage de travail. Les sauts y sont grands, en charge comme en répétitions, et c\'est normal.',
  l:['En répétitions, la cible te rattrape d\'elle-même. En charge, c\'est toi qui montes, à la main, de plusieurs crans d\'un coup s\'il le faut : tu cherches la charge où tu sens travailler le muscle visé, pas la progression la plus régulière.',
     'Ce que tu gagnes pendant cette phase ne prédit pas la suite : une montée par séance ne devient jamais une montée par séance sur l\'année, et aucun chiffre de l\'outil n\'est une promesse.',
     'Elle se termine d\'elle-même : quand tu tiens le volume lancé, que chaque exercice reste dans sa fourchette et que rien ne se fait alléger, tu es en régime normal.']},
 {t:'Quand arrêter une série',
  c:'Une série se termine quand la répétition suivante ne serait plus le même exercice.',
  l:['Deux signaux. Le muscle visé fatigue : arrête-toi une à trois répétitions avant qu\'il lâche. La technique se dégrade avant lui : c\'est elle qui commande, et sur ces exercices la fiche porte une ligne Fin de série qui nomme le signal.',
     'Exemple : sur les pompes, la limite n\'est pas l\'épuisement des pectoraux, c\'est l\'affaissement du bassin. Passer cette limite ne produit pas une pompe de plus, elle produit une extension lombaire sous charge, que le programme interdit partout ailleurs.',
     'L\'outil ne te demandera jamais de noter cet arrêt : il ne peut pas l\'observer, donc il ne décide rien dessus. C\'est à toi de le tenir.']},
 {t:'Renseigne-toi avant un exercice',
  c:'Avant un exercice que tu n\'as jamais fait, ouvre sa fiche : exécution, respiration, ligne de vigilance.',
  l:['L\'outil décide quoi faire, combien et quand. Il ne voit pas comment tu le fais : ni l\'amplitude, ni la position du dos, ni la vitesse. La ligne de vigilance nomme ce qui est en jeu, dos, cou, épaules ou genoux.',
     'Un texte rend mal l\'amplitude et le rythme : pour un geste que tu n\'as jamais vu faire, une vidéo d\'un site d\'entraînement sérieux complète la fiche.',
     'Une répétition mal placée sur une zone sensible coûte plus qu\'une séance n\'apporte. En cas de doute, la variante de repli en bas de la fiche fait le même travail en moins exigeant.']}
];
const SLOT_ORDER=['push','legs','pull','core'];
/* v2.8 : dephasage des quatre viviers. Les quatre compteurs valant toujours le
   meme entier, le tirage etait determine par un seul nombre : 25 combinaisons
   distinctes sur 375 possibles, et des paires rigides, goblet squat toujours
   avec planche, elevations laterales toujours avec face pulls.
   Ecarte : decaler les valeurs de depart des compteurs. Les indices resteraient
   la meme fonction affine du numero de seance, les paires resteraient donc
   rigides et seule leur identite changerait. Il faut que les indices cessent
   d etre cette fonction.
   Retenu : un decalage supplementaire au passage de chaque tour de vivier,
   idx = (c + k*floor(c/n)) % n, applique en LECTURE seule. Le compteur n est
   jamais touche, donc aucune migration, et la garantie de la v2.0 tient, un
   retour au profil precedent reprend la rotation ou elle en etait.
   Chaque tranche de n tirages consecutifs reste une permutation du vivier :
   la frequence de chaque exercice ne bouge pas d un iota, mesure a ecart nul
   sur les quatre viviers.
   Les valeurs de k sont choisies par mesure et ecrites ici, et non derivees du
   rang dans SLOT_ORDER : les deux decisions doivent rester separables, un futur
   changement d ordre du circuit n a pas a deplacer silencieusement la rotation.
   Mesure sur 900 seances, trois jeux de k compares : celui-ci atteint les 375
   quatuors possibles, soit le maximum arithmetique, les 25 paires jambes plus
   gainage et les 15 paires pousse plus tire, et il est le seul dont aucun
   vivier ne redonne le meme exercice deux seances de suite. k=0 sur le pousse
   laisse intacte la rotation du plus petit vivier, ou l irregularite se verrait
   le plus. */
const SLOT_PHASE={push:0,pull:1,core:2,legs:3};
/* Consigne commune aux exercices a bande (v2.0). Elle vaut pour les neuf
   exercices dont la tension depend d un montage : les cinq substituts a
   elastique et les quatre exercices existants. Elle n est ni une description
   d execution ni une vigilance de securite, elle porte son propre bloc et une
   constante unique, pour que neuf fiches ne soient pas neuf occasions de
   divergence. Hors liste a dessein : les tractions assistees, ou le barreau
   EST l assistance et ou la bande est bouclee sur la barre, et les pompes,
   ou il n y a pas d ancrage. */
const BAND_POS='Ta position modifie la tension autant que le choix du niveau : distance à l\'ancrage, hauteur du point d\'attache, angles. Si la série est trop dure ou trop facile, ajuste ta position avant de changer de niveau. À niveau identique, garde d\'une séance à l\'autre le même point d\'ancrage, la même longueur prise en main et la même position de départ.';
/* Table de substitution materielle (v2.0), declaree avec le catalogue et
   consommee par le resolveur. Elle est indexee par POSITION du vivier et non
   par identifiant : les face pulls occupent deux positions, et l ordre encode
   l espacement. Chaque chaine est ordonnee du plus proche de l intention au
   plus degrade ; une position absente n est jamais substituee, une chaine
   epuisee laisse la position non resolue et la perte est affichee.
   La retraction d omoplates ne resout que les positions d arriere d epaule et
   jamais le tirage horizontal : elle n offre ni extension d epaule chargee, ni
   flexion de coude, ni sollicitation des dorsaux. */
/* Besoins materiels par exercice. Seuls les exercices qui exigent quelque
   chose figurent ici : une absence signifie « rien d autre que le sol et le
   mobilier ». C est cette table, et non les libelles de MAT, qui decide de la
   resolution : MAT est un texte pour l utilisateur, NEEDS est un contrat. */
const NEEDS={
 'developpe-sol':['hal'],'elevations-laterales':['hal'],'curls-halteres':['hal'],
 'elevations-laterales-elastique':['elast'],'curls-elastique':['elast'],
 'ecartement-elastique':['elast'],'rowing-elastique':['elast'],'rdl-elastique':['elast'],
 'face-pulls':['elast','ancrage'],'tirage-doux':['elast','ancrage'],
 'tirage-vertical-elastique':['elast','ancrage'],'pallof-press':['elast','ancrage'],
 'tractions-assistees-supination':['barre','elast'],'tractions-assistees-pronation':['barre','elast'],
 'tractions-strictes-supination':['barre'],'tractions-strictes-pronation':['barre'],
 'rowing-suspension':['barre','sangles'],
 'rowing-kettlebell':['kb'],'goblet-squat':['kb'],'squat-une-jambe-chaise-leste':['kb'],'rdl-kettlebell':['kb'],'kb-swings':['kb'],
 'planche-ballon':['ballon'],'step-ups':['step'],'step-ups-bas':['stepbas'],
 'fentes-arriere-lestee':['hal'],
 'mollets-debout-leste':['masse'],'mollets-une-jambe-leste':['masse'],
 'pont-fessier-leste':['masse'],'hip-thrust-une-jambe-leste':['masse']
};
/* Nom du schema moteur porte par chaque position. Une perte se nomme par ce
   qu elle prive, pas par l exercice qui ne peut pas se jouer : l utilisateur
   n a pas perdu les face pulls, il a perdu son arriere d epaule. */
/* v2.18 : la ligne core suivait un ordre de vivier qui n est plus le sien
   (gainage lateral en 2, bird-dog en 4) : les libelles de perte et de
   couverture etaient decales. Realignee, et test45 verifie desormais que
   chaque ligne a la longueur de son vivier. */
const SCHEMA={
 push:['poussée horizontale','abduction d\'épaule','poussée horizontale chargée'],
 pull:['traction verticale','arrière d\'épaule','tirage horizontal','tirage horizontal chargé',
       'arrière d\'épaule','flexion de coude','traction verticale','traction verticale','traction verticale'],
 legs:['squat','squat unilatéral','squat unilatéral chargé','fente','fente chargée','extension de hanche','extension de hanche chargée','extension de hanche unilatérale','extension de hanche unilatérale surélevée','extension de hanche unilatérale surélevée chargée','mollets','mollets chargés','mollets unilatéraux','mollets unilatéraux chargés','montée sur marche','charnière de hanche','charnière balistique'],
 core:['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral',
       'gainage latéral chargé','anti-extension','anti-rotation']
};
const SUBS={
 push:{1:['elevations-laterales-elastique'],2:['pompes-poignees']},
 pull:{0:['tirage-vertical-elastique'],
       1:['ecartement-elastique','retraction-scapulaire'],
       2:['rowing-elastique'],
       3:['rowing-elastique'],
       4:['ecartement-elastique','retraction-scapulaire'],
       5:['curls-elastique'],
       6:['tirage-vertical-elastique'],
       7:['tractions-assistees-supination','tirage-vertical-elastique'],
       8:['tractions-assistees-pronation','tirage-vertical-elastique']},
 /* v2.18 : deux positions inserees apres le goblet squat, les cles suivantes
    decalees de deux. La version lestee du squat sur une jambe se replie sans
    kettlebell sur la version au poids du corps. */
 legs:{0:['box-squat'],2:['squat-une-jambe-chaise'],4:['fentes-arriere'],6:['pont-fessier'],9:['hip-thrust-une-jambe'],11:['mollets-debout'],13:['mollets-une-jambe'],14:['step-ups-bas'],15:['rdl-elastique']},
 core:{1:['planche']}
};

/* v1.18 : le mode cible est retire. Il livrait trois series par groupe et par
   semaine la ou l alterne en livre rounds x objectif, sur une table figee de
   douze exercices qui ignorait tout ce que le catalogue a gagne depuis, et sans
   filtre de retrait. Le decoupage par groupe n existe plus nulle part. */

const WARMUP=[
 {l:'Demi-cercles de nuque',s:25,img:'echauf-nuque',d:'Demi-cercles lents, menton vers poitrine puis oreille vers épaule. Jamais la tête en arrière à fond. Respire calmement, sans bloquer.'},
 {l:'Cercles de bras',s:25,img:'cercles-de-bras',d:'Grands cercles lents vers l\'avant puis l\'arrière, amplitude progressive. Inspire en montant, souffle en descendant.'},
 {l:'Chat-vache',s:30,img:'chat-vache',d:'À quatre pattes, dos rond puis dos creusé : souffle en arrondissant, inspire en creusant.'},
 {l:'Squats à vide lents',s:30,img:'squats-a-vide',d:'5-6 squats sans charge, lents, souffle en remontant, pour réveiller genoux et hanches.'},
 {l:'Marche dynamique sur place',s:40,img:'marche-continue',d:'Rythme croissant, bras actifs, respiration ample et par la bouche si besoin : fais monter légèrement le cœur.'}
];
const WARM_SHORT=[2,4];   /* indices retenus en echauffement court */
const CARDIO_ID='cardio-bas-impact';
const TRANSITION=15, CARDIO_SEC=240;
const TRANS_CHOICES=[5,10,15,20,30];
/* Pause au raccord de tour. Le circuit est circulaire : le dernier exercice
   d un tour precede le premier du tour suivant, et cette quatrieme adjacence
   est la seule ou une longue pause s insere sans casser la structure.
   60 s : la pause REMPLACE la transition au raccord, puis vient l installation,
   modelisee a 10 s, soit environ 70 s d intervalle reel. Le choix de 60 plutot
   que 90 est un choix de cout, +1,5 min contre +2,5 min sur une seance a trois
   series, sur une contrainte de 10 a 20 min deja depassee. Ce n est PAS un
   plafond physiologique : se reposer plus longtemps que necessaire ne degrade
   rien, sauf le temps. Le carnet disait le contraire en v2.10, c etait faux.
   Constante et non reglable : la duree n est pas ce qui se decide seance par
   seance. Ce qui se decide, c est OU elle se pose, et c est la liste ci-dessous. */
const PAUSE_TOUR=60;
/* v2.11 : la pause ne se pose QUE sur les raccords nommes ici.
   Une entree vaut 'id-du-gainage>id-du-pousse'.

   Pourquoi une liste et pas une regle. La v2.10 posait la pause a TOUS les
   raccords, sur la foi d une table de marqueurs par exercice, table qui est un
   jugement et non une mesure et qui vit hors application. Elle reparait ainsi
   une adjacence, gainage vers pousse, que personne n avait signalee, au prix
   de 90 s par seance de trois tours, dans un format dont la raison d etre est
   justement de supprimer le temps mort. Elle contredisait le principe
   d architecture du carnet : l outil decide sur ce qu il observe.

   Le probleme reellement vecu etait une paire, elevations laterales puis face
   pulls, deux exercices d isolation d epaule que l ancien ordre rendait
   adjacents avec 25 s entre eux. L ordre P,L,U,C le resout seul et a cout nul :
   un poste jambes separe pousse et tire dans le tour, un poste gainage les
   separe au raccord, ce qui donne 52 a 112 s selon l exercice intercale au lieu
   de 25. La paire n est plus adjacente dans aucun sens.

   La liste n est pas alimentee par un calcul : elle l est par ce que Gabriel
   constate. Une entree = un enchainement qu il a ressenti comme genant, pas
   un enchainement qu un tableau a deduit.

   v2.18, premiere paire constatee, le 15 septembre 2026. Quatuor developpe au
   sol, goblet squat, tractions assistees en pronation, gainage lateral. Au
   raccord, gainage lateral puis developpe : epaules en feu, halteres difficiles
   a stabiliser, trajectoire difficile a controler. Le developpe arrive au bout
   de trois postes d epaule enchaines, traction, gainage sur avant-bras puis
   lui-meme. La pause porte sur le raccord et non sur tire > gainage : c est le
   developpe qui a souffert, pas la tenue.

   Le successeur est nomme avec lui, et c est la seule entree qui ne vienne pas
   directement d un ressenti. Motif : meme appui sur l avant-bras, donc meme
   charge d epaule au moins, et son deblocage retire le gainage lateral du
   tirage. Sans lui, la pause disparaitrait en silence le jour du deblocage,
   qui est justement tombe pendant la seance du constat. Regle qui en decoule,
   verifiee par test45 : une paire nommee sur un exercice qui a un successeur
   par retrait nomme aussi ce successeur.

   Pas d autre paire par analogie, pompes ou planche au raccord : decision de
   Gabriel, on attend d y tomber. */
const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];
/* Modele de temps (v1.14). Tout ce que l outil chronometre est deja exact et
   ne se modelise pas : echauffement, decomptes de preparation, tenues,
   etirements, transitions, cardio. Seuls trois postes se calculent, parce que
   aucun chrono ne tourne pendant.
   TEMPO : tempo controle d une repetition, phase concentrique plus rapide que
   l excentrique plus la pause, conforme aux consignes des fiches (« monte en
   2 s », « descends lentement en 2-3 s »). TEMPO_EX porte les exercices qui
   s en ecartent nettement.
   INSTALL : arriver sur l ecran, se placer, saisir la valeur et valider.
   C est le seul parametre libre du modele, celui qui absorbe ce qui n est
   represente nulle part ; il se recalera sur des seances mesurees.
   INSTALL_STRETCH : un etirement ne demande ni saisie ni materiel, et le
   decompte de preparation couvre deja la fin de la mise en place.
   SWITCH_EX : bascule de cote, seulement la ou l outil n en compte aucune.
   Les tenues par cote rejouent un decompte de preparation a chaque cote, deja
   compte ; les etirements bilateraux enchainent seuls au bip ; fentes,
   bird-dog et dead bug alternent a chaque repetition d apres leurs fiches.
   Restent le pallof press, qui pivote autour d un ancrage fixe, et le rowing
   kettlebell, qui repose la charge et deplace ses deux appuis.
   REMOUNT : le montage se prepare avant la seance, c est la fonction du detail
   de seance. Il ne coute du temps que la ou deux exercices se disputent la
   meme ressource physique a des charges differentes, et alors a chaque
   passage de l un a l autre. */
const TEMPO=4.5, INSTALL=10, INSTALL_STRETCH=5, REMOUNT=25;
const TEMPO_EX={
 'tractions-assistees-supination':5,'tractions-assistees-pronation':5,
 'tractions-strictes-supination':5,'tractions-strictes-pronation':5,
 'pallof-press':5,'mollets-debout':3.5,'mollets-debout-leste':3.5,'mollets-une-jambe':3.5,'mollets-une-jambe-leste':3.5,'kb-swings':1.5
};
const SWITCH_EX={'pallof-press':5,'rowing-kettlebell':10};
const ROUNDS_CHOICES=[2,3,4];
/* etirements de fin de seance : deux par seance, en rotation, comptes dans le
   temps annonce depuis la v1.13. La liste etait derivee de la seance mobilite
   du mode cible ; elle est posee en clair depuis le retrait de ce mode. */
const STRETCH_POOL=['etir-nuque','etir-pecs','chat-vache','etir-hanches','etir-ischios','posture-enfant'];
const STRETCH_PER_SESSION=2;

/* ============ XP, RANGS, BADGES ============ */
const XP_SET=4, XP_SESSION=15, XP_WEEK=40;
function lvlThreshold(n){return 50*n*(n+1);}
const RANKS=[[16,'Inoxydable'],[13,'Acier'],[10,'Forgé'],[8,'Trempé'],[5,'Solide'],[3,'Régulier'],[1,'Mise en route']];
function rankOf(l){ for(const r of RANKS) if(l>=r[0]) return r[1]; return 'Mise en route'; }
/* niveau seuil du rang atteint : sert a detecter un changement de rang
   et a fusionner l animation quand un badge designe deja ce palier */
function rankLevel(l){ for(const r of RANKS) if(l>=r[0]) return r[0]; return 1; }
function lvlInfo(xp){
  let n=0; while(xp>=lvlThreshold(n+1)) n++;
  const base=n>0?lvlThreshold(n):0, next=lvlThreshold(n+1);
  return {lvl:n+1,pct:Math.min(100,Math.round((xp-base)/(next-base)*100)),next:next-xp};
}
/* Avancement d un badge non acquis (v2.2). Deux champs facultatifs a cote du
   predicat, un compteur et son seuil. Le compteur ne se deduit pas du test :
   un predicat est un booleen, il ne sait pas dire ou l on en est.
   Il n est porte que la ou il informe. Un seuil de 1, ou un predicat qui n est
   pas un compteur, ne produirait que « 0/1 », qui ne dit rien de plus que la
   ligne grisee : les quatre badges dans ce cas, s1, w1, load et unlock1, n en
   portent pas, et badgeProg refuse tout seuil inferieur a deux.
   Le badge mob5 « Souplesse assumee » disparait ici : son predicat lisait
   type==='mobilite', or toute seance s ecrit type:'alterne' depuis le retrait
   du mode cible en v1.18. Il etait inatteignable et pesait quand meme dans le
   denominateur affiche. w12 le remplace et prolonge l echelle des semaines,
   qui s arretait a un mois quand celle des seances va jusqu a quarante. */
const BADGES=[
 {id:'s1',ico:'🔥',nom:'Première étincelle',d:'Première séance terminée',test:st=>st.hist.length>=1},
 {id:'s5',ico:'🧱',nom:'Fondations',d:'5 séances terminées',test:st=>st.hist.length>=5,prog:st=>st.hist.length,seuil:5},
 {id:'s15',ico:'⚙️',nom:'Machine lancée',d:'15 séances terminées',test:st=>st.hist.length>=15,prog:st=>st.hist.length,seuil:15},
 {id:'s40',ico:'🏗️',nom:'Charpente',d:'40 séances terminées',test:st=>st.hist.length>=40,prog:st=>st.hist.length,seuil:40},
 {id:'w1',ico:'📅',nom:'Semaine validée',d:'Objectif hebdo atteint une première fois',test:st=>{const wc=weekCounts(st);return Object.keys(wc).some(k=>wc[k]>=goalForWeek(st,k));}},
 {id:'w4',ico:'🛡️',nom:'Un mois solide',d:'4 semaines validées d\'affilée',test:st=>weekStreak(st)>=4,prog:st=>weekStreak(st),seuil:4},
 {id:'w12',ico:'🏰',nom:'Trimestre tenu',d:'12 semaines validées d\'affilée',test:st=>weekStreak(st)>=12,prog:st=>weekStreak(st),seuil:12},
 {id:'load',ico:'⚖️',nom:'Première montée de charge',d:'Une charge augmentée grâce à la double progression',test:st=>st.loadUps>=1},
 {id:'load5',ico:'🏋️',nom:'Cinq paliers',d:'Cinq montées de charge cumulées',test:st=>st.loadUps>=5,prog:st=>st.loadUps,seuil:5},
 {id:'unlock1',ico:'🔓',nom:'Palier franchi',d:'Premier exercice débloqué',test:st=>Object.keys(st.unlocked).length>=1},
 {id:'lvl5',ico:'⭐',nom:'Palier 5',d:'Niveau 5 atteint, rang Solide',rank:5,test:st=>lvlInfo(st.xp).lvl>=5,prog:st=>lvlInfo(st.xp).lvl,seuil:5},
 {id:'lvl10',ico:'🌟',nom:'Palier 10',d:'Niveau 10 atteint, rang Forgé',rank:10,test:st=>lvlInfo(st.xp).lvl>=10,prog:st=>lvlInfo(st.xp).lvl,seuil:10}
];
/* Le compteur est borne au seuil : un badge dont le compteur a depasse le
   seuil sans que le badge soit pose, cas d une correction de seance qui
   fait redescendre loadUps, afficherait sinon 6/5. Rend null la ou
   l avancement ne doit pas s afficher, jamais une chaine vide. */
function badgeProg(b,st){
  if(typeof b.prog!=='function'||!(b.seuil>=2)) return null;
  return Math.max(0,Math.min(b.prog(st),b.seuil));
}

