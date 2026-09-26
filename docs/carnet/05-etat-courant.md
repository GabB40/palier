## 5. État courant, v2.24

55 exercices, tous illustrés et tous porteurs d'une consigne respiratoire, plus 5 étapes
d'échauffement illustrées. Banque à 58 images, sans image morte : chaque entrée sert une fiche ou
une étape d'échauffement, et le build le vérifie.

Sur ces 55 fiches, mesuré et non estimé : 35 occupent une position d'un des quatre viviers, 7 sont
des replis douleur, 9 des substituts matériels, et 7 ne relèvent d'aucun vivier, le cardio et les
six étirements. Trois fiches comptent pour les deux, `step-ups-bas`, `box-squat` et
`rowing-elastique` : elles sont à la fois repli douleur et substitut matériel, ce qui est légitime,
la même variante allégée servant la douleur et l'absence de matériel. Replis et substituts vivent au catalogue hors des viviers, ne sortent jamais au tirage,
et se présentent comme tels dans la bibliothèque en nommant ce dont ils prennent la place.

L'inventaire est un profil nommé, deux à trois profils dont le domicile qui ne se supprime pas. Neuf
ressources déclarables et une dixième clé de besoin entièrement dérivée, `masse`, qui n'a pas
d'interrupteur et se lit sur la masse mobilisable de l'inventaire, six niveaux de bande dont la réalisation appartient au profil et se choisit
sur un nuancier de douze couleurs, trois paires de lestes déclarables, et un jeu de disques dont les
types s'ajoutent depuis un menu fermé de huit poids. Le mobilier n'est déclaré que là où l'exercice
exige une garantie qu'il n'offre pas, ce qui vaut aujourd'hui pour la seule marche basse : ni le sac
à dos des mollets lestés, ni le rebord des mollets, ni la chaise du squat sur une jambe, dont la
garantie s'écrit dans la fiche, ne franchissent ce seuil.

Portes de verrou au palier joué depuis la v2.18 : sur les performances antérieures au lot, la
charge jouée n'est pas écrite, et les portes « dernier cran » et « kettlebell la plus lourde »
restent fermées jusqu'au prochain passage de l'exercice source. Aucune n'était près de s'ouvrir au
15 septembre.

Premier lancement : inventaire vide, bandeau d'accueil qui pointe vers la card Matériel, et
validation par un bouton qui retire le bandeau sans rien verrouiller, définitivement et pas
seulement le temps de la session. Un inventaire vide sert les quatre groupes musculaires et onze
schémas moteurs sur dix-huit.

Card Matériel : chip du profil en tête, une section repliable par ressource, une seule colonne de
contrôles à droite, interrupteurs de présence, pastilles de réalisation et couples moins-plus, et
deux compteurs en pied, schémas servis et progressions encore disponibles ici. Plus aucun bouton
dont l'état est un mot, plus aucun dialogue du système nulle part dans l'application : les questions
se posent dans la page, en deux temps, y compris la sortie de séance déclenchée par la flèche
arrière du navigateur.

Ce que fait l'outil aujourd'hui : structure alternée, seule structure, circuit dans l'ordre
**poussé, jambes, tiré, gainage** depuis la v2.10, quatre adjacences dont la fermeture du tour, qui porte une pause
de 60 s **seulement sur les enchaînements nommés dans `PAUSE_RACCORD_PAIRS`**, deux depuis la v2.18, gainage latéral et son successeur
devant le développé au sol,
quatre viviers déphasés depuis la v2.8, 375 combinaisons possibles et plus aucune paire rigide,
à fréquence par exercice inchangée,
volume choisi en 2, 3
ou 4 séries par exercice avec durée calculée et annoncée, double progression en répétitions puis en charge, au pas de l'exercice
(1 répétition, 5 secondes sur les tenues), cible à mémoire de deux passages depuis la v2.14, la
plus haute des deux dernières lectures au palier courant plus une, recul dit au récapitulatif
quand deux passages l'ont produit, avec ses deux lectures depuis la v2.23, échelles ordinales de bandes
et de lestes, 4 variantes de tractions, échauffement sur écran unique, module cardio optionnel de
4 minutes à durée fixe, étirements de fin de séance en rotation, découpés en deux côtés avec bip
de bascule quand ils sont bilatéraux, tenues chronométrées à arrêt définitif, rognables d'une
seconde par appui après le Stop et jamais dans l'autre sens, mesurées côté par côté sur les
exercices unilatéraux, deux tenues rythmées au son depuis la v2.17, bird-dog et dead bug, sur une
échelle de trois barreaux de tenue, Stop non définitif et rognage d'une tenue, un exercice en
répétitions cadencées au son depuis la v2.19, le gainage latéral avec abductions, planche tenue et
jambe qui monte et descend en 1,5 s, un côté entier puis l'autre après 3 s d'établissement de la
ligne, Stop définitif par côté et rognage d'une répétition par côté, le pont fessier et ses
quatre successeurs en cadence à trois temps depuis la v2.22, montée 1,5 s, tenue en haut 1 s,
descente 2 s, un bloc ou un côté puis l'autre, avec reprise comme le bird-dog, sur toutes les
cadences l'aigu sur la montée de la répétition-cible et le grand chiffre à la répétition en cours,
décompte de lancement de 5 s fixes devant l'échauffement depuis la v2.22, plafond d'un exercice
au poids du corps ou tenu égal au haut de sa fourchette depuis la v2.16, ce qui suit étant une marche
écrite et non un relèvement, escalier de gainage à deux marches construites derrière verrou, la marche après les abductions
restant à décider,
retour d'un pas après une validation, repli douleur réversible
sur chaque exercice et sur le
cardio, palier tenu par exercice et mode entretien global, correction des valeurs de la dernière séance
depuis le récapitulatif ou l'historique, qui préserve les gestes manuels postérieurs à la
séance et annonce à part ce qu'elle défait, détail de séance avec matériel
consolidé et carrousel des séances à venir, objectif hebdomadaire en jours actifs avec prorata des semaines tronquées, statistiques
d'assiduité, de temps, de couverture musculaire à bande visée, de replis douleur et de trajectoire
des charges,
historique des douze dernières séances, dépliable, portant l'heure de début, le volume joué et les
deux durées, chaque entrée portant depuis la v2.12 les tours annoncés au lancement, la cible du jour
et la durée de chaque série, trois champs qu'aucun signal ne lit, et dépliant la décomposition de l'écart entre annonce et réel, écran de série rappelant
les séries déjà faites du jour, écran de repos portant la vignette de l'exercice suivant, les séries déjà faites du jour sur cet exercice, l'heure et le temps écoulé depuis le lancement, récapitulatif portant durée réelle contre annoncée, volume joué sur volume prévu et
comparaison au passage précédent exercice par exercice, décompte de
préparation sonore avant les chronos tenus et les
étirements, repère discret toutes les 5 s pendant les tenues chronométrées depuis la v2.20, actif par défaut et coupable, bips d'approche de cible, de bascule de côté et de fin d'étirement, interrupteur global des sons, XP, niveaux, rangs, douze badges tous atteignables dont huit portent
leur avancement tant qu'ils ne sont pas acquis, déblocages avec célébration animée,
navigation clavier et par hash, thèmes, export et import horodatés,
texte « Comment ça marche » en quatre blocs révélés progressivement, cible en tête, sur l'accueil jusqu'à
lecture puis dans Réglages, et critère de fin de série sur chaque fiche.
Fiche exercice : trois blocs repliés par défaut sous le corps de fiche, position sur l'échelle
avec fenêtre de trois marches de chaque côté et condition de déclenchement de la marche suivante,
sur les exercices sans échelle une marche unique, la fourchette du catalogue, avec la règle de
plafond et sa condition suivies de la marche écrite,
chemin des paliers entier avec montées et descentes datées, passages récents bornés à trois puis
douze avec leurs marqueurs et les séances de repli en ligne grisée cliquable, verrou dans les deux
sens avec l'état à la dernière séance et la mention du remplacement en rotation.

Séance allégée : bascule ponctuelle depuis l'accueil, variantes de repli là où elles existent,
cibles réduites de 30 % ailleurs avec débordement sur la charge, progression gelée dans les deux
sens, rotation figée sur les seuls emplacements substitués et débloquée dès la deuxième allégée
d'affilée, séance comptée normalement et exclue du capteur de douleur.
Contenu du jour : card repliée sur l'accueil, résumant les options en en-tête fermé et donnant la
décomposition chiffrée poste par poste, exercices, transitions, remontage de charge le cas échéant,
échauffement, cardio et étirements, avec ajustement ponctuel de l'échauffement, du cardio et
des étirements pour la séance qui vient, sans toucher aux valeurs par défaut de Réglages.
Temps de séance : modèle décomposé en quatre postes calculés, tempo par exercice, installation,
bascule de côté sur les deux exercices concernés et remontage de charge sur conflit de ressource,
tout le reste étant chronométré par l'outil et compté à sa valeur exacte ; temps de chaque exercice
affiché dans le détail de séance, avertissement nommant les deux montages à alterner et leur nombre
quand la séance en impose, fourchettes de durée dans Réglages avec la liste des postes réellement
inclus composée depuis les options actives.
Transition : temps inerte entre deux exercices du circuit, réglable de 5 à 30 s, défaut 15 s. Le
repos chronométré entre séries d'un même exercice a disparu avec le mode ciblé, `state.rest` avec
lui.

Carrousel du détail de séance : premier panneau la séance du jour, inchangé, panneaux suivants les
tirages à venir, autant de panneaux que le plus gros vivier une fois filtré des verrous, des
retraits et de la résolution matérielle, ce qui rétrécit le carrousel sur un profil réduit au lieu
de promettre des tirages impossibles. Un panneau à venir porte son intitulé, l'encart de niveau en tête, le
matériel à sortir, les quatre exercices avec cible, charge ou barreau de bande, et l'avertissement
de remontage sans le nombre de changements, qui dépend du volume pas encore choisi. Pas de durée,
pas de date. Barre arrondie en `--rail` sur toute la hauteur du panneau, jeton de couleur qui sert
aussi de filet à l'encart de niveau. Navigation par double flèche de retour au jour, éteinte sur le
panneau du jour, flèches précédente et suivante, points de position ; l'index ne va pas dans l'état
et repart à zéro à chaque affichage de l'accueil. Glissement piloté en 200 ms avec décélération, et
non défilement lissé natif : celui-ci n'est pas réglable, sa durée se calcule depuis la distance, et
sur une largeur de panneau il laissait voir deux panneaux côte à côte assez longtemps pour donner
l'impression d'un remplacement plutôt que d'une page tournée. L'accroche de défilement est coupée le
temps du trajet, sans quoi elle se bat avec une position écrite image par image.
Cards repliables : leur état d'ouverture survit au re-rendu de la vue courante, sur tous les écrans,
sans rien stocker et sans traverser un changement de vue ; chaque card écrit son ouverture dans le
HTML au moment où elle s'écrit, et la position de défilement est préservée autour du rendu, un
changement de vue continuant de remonter en haut. L'animation d'apparition des cards ne joue qu'à
l'arrivée sur un écran, jamais au rafraîchissement du même.
Couverture musculaire : moyenne sur les semaines révolues seulement, plafonnée à quatre, libellé
portant le nombre de semaines réellement moyennées, mention d'attente et rails masqués tant
qu'aucune semaine n'est terminée, échelle fixe de 0 à 24 commune aux quatre groupes, bande visée
dessinée et graduée, écrêtage hachuré au-delà, curseur vert dans la bande et orange en dehors,
plancher ramené de 8 à 4 sur un groupe dont tous les exercices tenables et déverrouillés sont
tenus, pastille « tenu » sur ce groupe, projection de la configuration courante en tête de card,
volume réellement joué par exercice juste dessous, sur la même fenêtre que les rails,
message d'avertissement au-dessus de la bande, référentiel dans une zone repliable fermée par
défaut. Toutes les décimales de Progrès passent par le formateur commun et portent la virgule.
Interface : écran d'exercice ordonné cible puis charge puis illustration entière, série en clair,
pastilles de séance regroupées par tour ou par exercice, réglages et badges en cards repliables
portant leur valeur courante en en-tête fermé, détail de séance repliable et ouvert par défaut,
onglet Progrès replié sauf Assiduité et Couverture, variante de repli nommée dans chaque fiche avec son matériel,
vues Réglages et Progrès ordonnées par fréquence d'usage, bibliothèque en lignes à vignettes avec
recherche instantanée, en trois paliers de lecture par groupe depuis la v2.15, en rotation, hors
tirage avec étiquette repli ou substitut, verrouillés dans un bloc replié portant leur compte et
ouvert par la recherche, niveau en ligne 2 et nom jamais tronqué. Accueil, fiche exercice et listes
courtes restent entièrement dépliés. Aucun nom ne se tronque, une valeur d'en-tête fermé passe à
la ligne. Accueil dans l'ordre lancement, semaine, contenu, détail, progression. Écran de série
portant le niveau joué la dernière fois quand il diffère du jour. Colonne de 600 px au-dessus de
900 px de large, 480 en dessous.

Card « Comment ça marche », repliable, portant le texte des quatre blocs avec leurs développements
dépliés d'office : c'est l'écran où l'on vient exprès pour lire. Card de pied des réglages : trois
blocs intitulés, ce que fait PALIER, comment les exercices sont choisis, pourquoi les séances sont
alternées, puis la ligne de prudence et la version en gras.

Hébergé sur `https://palier.s1t3.link`. Cinquante suites de tests, jouées à chaque build ; ce
paragraphe en annonçait encore quarante-trois en v2.18, corrigé en v2.19.
Le carnet a porté trois comptes différents en même temps, trente-cinq, trente-six et trente-sept,
pour trente-sept réelles avant la v2.12. Mesuré sur `build.sh` et non recopié : c'est la seule
façon de tenir ce nombre juste.

**L'historique des versions ne vit plus ici** : il est dans `docs/changelog.md`. Cette section
décrit l'état courant, pas la chronologie.

Gabriel s'entraîne depuis le 6 août, hébergement en ligne opérationnel. Il exporte une sauvegarde
chaque jour, par bonne pratique et parce que c'est ainsi qu'il partage où il en est en début de
session. Une version antérieure de ce carnet disait « le temps de prendre confiance dans la
persistance » : ce n'était pas son motif, et il ne l'avait pas dit.

Rodage de la synchronisation, en service depuis le 26 septembre : exports quotidiens jusqu'au
premier vrai déplacement, une séance hors de chez lui puis le retour, qui est le cas pour lequel
elle existe ; hebdomadaires ensuite. Le risque que ce cas éprouve : un état corrompu que la
récupération automatique propagerait à tous les appareils. Les 30 versions S3 le couvrent, mais
seulement en administrateur, en console, dans les 90 jours ; l'export reste le filet utilisable
seul.

**Questions ouvertes** : récupération éventuelle des séances perdues avant la v1.1, dont celle du
6 août (archives datées ; attention, l'import écrase, il ne fusionne pas) ; rythme de la file de
célébrations quand elle dépasse trois cartes (six cartes possibles sur une toute première séance,
soit environ treize secondes avant le récap) ; PWA hors-ligne si l'entraînement sans réseau
devient un besoin réel (remettrait en cause le fichier unique autonome) ; combinaisons de bandes
si un jour l'écart entre deux barreaux devient un mur ; calibrage de la constante d'installation,
seul paramètre libre du modèle de temps depuis la v1.14, à figer sur plusieurs séances jouées en
v1.13 ou plus, comptées à partir du 15 août (les mesures antérieures sont polluées : les premières
séances contenaient de la prise de notes en cours de route, et les deux séances de référence de la
v1.11 valaient 18 minutes avec cette pollution dedans) ; coût d'un remontage de charge, posé à 25 s
et à revoir à la baisse une fois les pinces à verrouillage rapide en service ; opportunité d'éviter
au tirage deux exercices qui se disputent la même ressource, ce qui toucherait la rotation et n'est
pas ouvert aujourd'hui.

**Verrouillage de phase des quatre viviers, levé en v2.8.** Le cadrage qui vivait ici a été consommé
par le lot. Il est conservé sous forme de décision tranchée en section 2, avec la garantie qui a été
échangée contre lui.

**Chantier matériel, livré en v2.0.** Le cadrage qui vivait ici, avec ses trois décisions à prendre
et son chiffrage des viviers sous matériel réduit, a été consommé par les quatre lots de la v2.0
puis par le lot de clôture. Il est conservé sous forme de décisions tranchées en section 2, à la
date où elles l'ont été, et non plus comme un chantier ouvert.

**Écarté volontairement** : cinquième série par exercice (l'ancien plafond de 5 tours était
atteignable à 20 minutes en échauffement court sans cardio ; le passage au choix explicite du
volume ferme ce chemin accidentel, Gabriel ayant confirmé ne pas vouloir ce volume, et raccourcir
l'échauffement pour gagner un tour reste exclu, ce serait troquer une protection contre du volume),
étiquetage des boutons de volume par une durée ronde (aucun nombre rond ne peut être exact avec un
cadran à tours entiers, c'est ce qui a fait tomber le modèle précédent), moyenne observée comme
source de la durée annoncée (elle intègre les interruptions, qui relèvent de l'utilisateur),
marqueur de « séance perturbée » dans l'outil (une décision de plus après chaque séance, alors que
l'information se donne de vive voix au moment du calibrage), validation d'un bilatéral sur un seul
côté (renforcerait un déséquilibre), variantes de pompes décoratives, banc de
musculation, moteur de lest générique, stats « meilleure semaine », conversion des bandes en
kilogrammes, latex naturel pour les bandes (le kit TPE neuf suffit), lestes de chevilles sur les
mollets debout, cap de répétitions sur les pompes (l'échelle de bandes le remplace), animation à
chaque montée de charge et à chaque niveau, objectif de semaine tronquée égal aux jours restants,
projection du volume hebdomadaire sous Réglages > Durée (elle vit dans la card Séries par exercice
depuis la v1.18, et la durée se choisit sur l'accueil) ; résumé de volume sur l'accueil (constant d'un jour
à l'autre, donc du bruit, et l'accueil promet qu'il n'y a rien à décider) ; bande d'entretien 4-8
avec plafond mobile (le plafond est un seuil de récupération, indépendant de l'objectif) ; plancher
d'entretien au prorata des exercices tenus (planchers fractionnaires illisibles) ; dégradé continu
sur les rails de couverture (quatre dégradés pour quatre chiffres, et son rouge sous la bande
contredit l'asymétrie retenue) ; échelle de couverture adaptative ou poussée jusqu'au maximum
atteignable (elle écraserait la bande, seule raison d'être de l'échelle) ; retouche manuelle du
JSON pour corriger une semaine (invente des jours actifs et fausse
histogramme, jours actifs, date de première séance et badges) ; refonte de la couverture
musculaire en indicateur de fréquence (c'est le seul instrument qui vérifie l'argument de volume
ayant fait choisir l'alterné contre le PPL, et les chiffres le valident : 8, 8 et 12 séries par
groupe et par semaine à 10, 15 et 20 minutes sur 4 séances) ; triage vert/orange/rouge avant
chaque séance (son effet utile est déjà obtenu par le blocage de la progression après douleur, et
il ajoute une décision là où l'accueil promet qu'il n'y en a aucune) ; validation qualité en trois
boutons après chaque exercice (quatre appuis par séance pour une information utilisée une fois sur
dix ; remplacée par l'action au récapitulatif) ; question posée en pleine séance pour arbitrer une
montée (coupe l'effort au pire moment) ; suivi de la marche et du vélo dans les jours actifs
(l'objectif hebdomadaire cesserait de mesurer l'habitude de renforcement) ; schéma de verrous
enrichi de champs de douleur ; libération d'un palier par des répétitions élevées (rendrait tout
palier intenable un bon jour) ; cards repliables sur l'accueil, la fiche exercice et les listes
courtes (le motif ne vaut que quand l'état fermé est un résumé utile, ailleurs il ajoute un clic
là où l'œil veut parcourir) ; chips de filtrage par groupe dans la bibliothèque (redondantes avec
la recherche et les sections) ; grille de tuiles dans la bibliothèque (les illustrations sont en
deux panneaux, une tuile carrée perd le panneau d'arrivée et le ratio natif rend la grille plus
longue que la liste) ; persistance de l'état ouvert/fermé des cards de réglages entre deux visites
ou après un rechargement (à ne pas confondre avec leur survie au re-rendu de la vue courante, qui
est un correctif de la v1.14 : rien n'est stocké, une card fermée reste le résumé par défaut à
chaque arrivée sur un écran) ; temps par série ou fourchette de durée dans la fiche exercice (la
fiche décrit l'exercice, pas la séance ; le chiffre bougerait à chaque progression, exposerait le
modèle interne là où il n'est pas vérifiable, et mélangerait la cible qui monte avec le volume qui
se choisit sans dire laquelle des deux varie) ; objectif hebdomadaire compté en séries plutôt qu'en
jours actifs (il mesure la tenue de l'habitude, pas le volume ; un objectif en séries se rattraperait
en une seule grosse séance, ferait valoir une séance à 2 séries moitié moins qu'une à 4 contre la
décision v1.13, et casserait le prorata des semaines tronquées, le streak et l'histogramme, tous
comptés en jours ; le volume hebdomadaire est déjà mesuré par la couverture musculaire et sa bande
8-16, que le produit séries × objectif couvre exactement) ;
dips (recrutement superposé aux pompes à plus de 90 %, la seule spécificité réelle, l'amplitude en
extension d'épaule, étant interdite par la contrainte d'épaule : exécutés en sécurité ils
n'apportent rien, même logique que la corde à sauter) ; pompes serrées (motif « variété de
rotation », littéralement le motif exclu par la règle des viviers ; le triceps est déjà couvert
deux fois et un vivier poussé de trois est un avantage de fréquence, pas un manque) ; extension
triceps au sol (sollicitation du coude, triceps déjà couvert) ; mollets debout à l'élastique
(préhension limitante avant le mollet, et premier refus du critère de non-interférence) ;
ajustement du nombre de séries en cours de séance (réduire existe déjà via « Passer » avec le bon
comportement, l'officialiser ouvrirait le chemin « une seule série = montée » fermé en v1.4, et
une quatrième série moyenne ferait perdre la montée acquise sur trois) ; repli de l'illustration à
partir de la deuxième série (c'est elle qui identifie l'exercice en un coup d'œil) ; dénominateur
de couverture compté en jours écoulés depuis la première séance (donnerait un chiffre dès le
premier jour, mais transformerait un bilan en débit instantané qui bouge chaque jour) ; prorata du
volume hebdomadaire sur les jours disponibles d'une semaine de démarrage (l'objectif mesure un
engagement et se proratise, la bande est un seuil physiologique et extrapoler inventerait du
travail non fait) ; flèches gauche et droite conservées comme second jeu d'ajustement (une fois les
deux états de touche acceptés sur `+` et `-`, l'argument d'accessibilité tombe, et deux flèches qui
défilent pendant que deux autres modifient une valeur remplacent une incohérence franche par une
incohérence sournoise) ; pavé de saisie remonté au-dessus de l'illustration (l'ordre en place suit
le déroulé réel de la série ; ce qui manquait était la possibilité de descendre, pas un autre
ordre) ; barre de progression vers l'ouverture d'un verrou sur la fiche (la condition se lit sur la
dernière séance et non sur un maximum historique, donc la barre reculerait après un passage moyen et
se lirait comme une perte alors que rien n'est perdu) ; courbe de répétitions dans le temps sur la
fiche (à chaque montée la cible retombe au bas de fourchette, donc la courbe plongerait exactement
quand la progression a lieu) ; échelle entière en pastilles sur la fiche (vingt-six marches sur les
haltères, mesurées, qui noient la position qu'elles servent à montrer) ; secondes sur le temps écoulé
de la transition (l'écran porte déjà un décompte à la seconde, et deux nombres qui défilent à la même
cadence en sens inverse ne se distinguent plus ; la seconde n'y est actionnable par rien) ; durée
annoncée affichée à côté du temps écoulé (transformerait un repère en course contre un modèle qui ne
représente pas les interruptions, et pousserait une décision sur l'écran qui promet qu'il n'y en a
aucune) ; indicateurs temporels sur l'écran de série, l'échauffement, le cardio ou les étirements
(le premier prescrit et passe déjà sous le pli, les trois autres portent chacun leur propre
chronomètre).

**Écarté en v1.15, avec la raison** : jauge d'avancement en pourcentage sur l'échelle d'un exercice
(les échelles vont de 7 positions sur le gainage latéral à 385 sur les curls, et un cran vaut 0,37 kg
ici, un barreau de bande entier là : une jauge sur ces échelles mentirait) ; élargissement des
fourchettes pour égaliser la cadence de progression (les fourchettes sont choisies par nature
d'exercice, 8-12 pour une poussée chargée, 3-8 pour une traction stricte, 12-25 pour les mollets ;
dégrader la qualité du stimulus pour corriger un problème d'ordonnancement est un mauvais échange) ;
échange d'emplacement, remplacer sur une séance un schéma moteur par un autre (à somme nulle, ce que
jambes gagne le poussé le perd, et les pectoraux à 8 séries par semaine sont le seul muscle qui
atteigne le plancher de la bande) ; cinquième emplacement systématique en joker rotatif uniforme
(multiplie tout par 1,25 et ne change aucun ratio : une addition uniforme est le seul design
structurellement incapable de corriger une distribution) ; instrument de couverture par muscle
(exigerait une table de pondérations sur 23 exercices, et le tableau qui en sort est constant tant
que les viviers ne changent pas, donc il a sa place au carnet et pas dans l'outil) ; doublement des
mollets dans le vivier jambes (l'objectif ne le justifie pas, la marche et les escaliers couvrent la
fonction, et le doublement ferait descendre les six autres exercices jambes de 1,71 à 1,50 séries
par semaine) ; signal autonome de recul de cible (la cible recule exactement quand un passage est
moins bon que le précédent, ce qui est le moteur qui fonctionne et non un événement ; l'information
n'est dite que là où elle informe, dans le message d'effondrement partiel ; rouvert en v2.14 pour
le seul recul à deux passages, qui est un événement, le recul à un passage restant muet) ; joker de rattrapage, cinquième exercice proposé quand un exercice
dépasse la taille de son vivier sans sortir (construit puis retiré avant livraison : le seul
décrochage possible est le redécoupage du modulo à un changement de composition de vivier, il se
résorbe seul en un cycle, et sur 200 séances simulées avec les cinq déblocages le mécanisme se
proposait 21 fois dont 16 sur des exercices fraîchement débloqués qui n'étaient pas en retard mais
n'existaient pas encore. Trois défauts en un jour pour cinq occurrences utiles sur la vie du
programme : le coût de l'instrument dépasse ce qu'il répare) ; combinaisons de bandes
pour réduire la hauteur des marches (à trancher sur retour d'expérience : on quitte le haut d'une
fourchette pour retomber sur le bas, 18 répétitions en jaune contre 10 en rouge n'est pas un mur).

**Reste ouvert après la v1.17** : le durcissement éventuel du verrou de la charnière de hanche,
aujourd'hui à une seule série de 15 ; un instrument de stagnation, distinct du filet, qui dirait
qu'une cible n'a pas progressé depuis n passages. L'upgrade de la card Réglages > Matériel, ouverte
depuis la v1.17, est faite. Dette reconduite :
aucune échelle de charge n'est branchée sur `mode:'time'`, donc les lestes sur la jambe levée,
marche 3 documentée du gainage latéral, ne sont pas outillables en l'état ; le texte de plafond le
dit à l'utilisateur au lieu de le taire. Soldée en v2.19, non par outillage : la marche a disparu,
le lest à la cheville chargeant la hanche et presque pas le tronc. Divergence identifiée en v1.17 et laissée en l'état : le
mode ciblé filtrait ses listes sur les verrous mais pas sur les retraits, donc un exercice retiré du
tirage alterné continuait d'y sortir. Corriger demandait de décider ce que devient une liste fixe
quand son contenu se substitue ; la v1.18 a répondu en retirant le mode, la dette est éteinte.

**File d'attente après la v2.4**, dans l'ordre où elle a été arrêtée. Elle vit ici et non dans un
document de travail.

Les trois entrées de la file d'attente de la v2.0 ont été livrées ensemble en v2.1, avec les
retours du test local : kettlebells multi-poids et fentes arrière lestées, micro-paliers du bas
d'échelle haltères, changement de volume en cours de séance. La v2.2 n'a consommé aucune entrée de
la file, c'est un lot d'affichage ouvert par quatre retours de test local. La v2.4 non plus, c'est
un lot double, deux illustrations de nuque et la progression par exercice sur les fiches, ouvert
par le test local. La v2.3 non plus, c'est
un correctif isolé sur le drapeau d'onboarding, remonté par le test local. Ce qui reste ouvert, dans
l'ordre :

1. **Durcissement éventuel du verrou de la charnière de hanche**, partiellement traité en v2.1 :
   les deux verrous exigent désormais deux séries, reste la question du compte lui-même, une série
   de 15 restant le seuil de référence.
2. **Instrument de stagnation** distinct du filet, qui dirait qu'une cible n'a pas progressé depuis
   *n* passages. C'est la seule statistique manquante qui commande une action : les autres pistes
   examinées en v2.2 sont soit des records déguisés, soit non calculables. Ce qui la bloquait, la
   cible du jour absente de l'historique, est levé depuis la v2.12 ; elle ne pourra rien dire des
   séances antérieures, et rien avant plusieurs passages enregistrés. Cas nommé par l'audit de la
   v2.14 : les dents de scie, 14, 11, 14, 11, que la fenêtre de cible lisse en une cible à 15
   jamais atteinte et jamais signalée. « Cible non atteinte depuis n passages » est le critère.
3. **Micro-paliers ailleurs qu'en bas d'échelle.** La règle additive n'ajoute rien au-dessus de
   4 kg parce que le saut symétrique y est déjà sous le seuil. Si l'usage montre qu'un palier
   intermédiaire manque plus haut, c'est le seuil qui bougera, pas la règle.
4. **Squat bulgare lesté**, marche suivante inscrite au catalogue derrière les fentes lestées et
   non outillée, à reprendre vers 5 kg par main (v2.18) : un bulgare au poids du corps serait un
   recul après 2 × 14,5 kg. Même statut pour le **pont sur une jambe lesté**, écarté du lot v2.13 et à insérer
   seulement si l'entrée dans le hip thrust se révèle trop raide, et pour le **pied surélevé**, qui
   restera en fiche.
5. **Instrument de charge sur les hanches, deuxième valeur de plafond.** `CAP_HANCHES` vaut 20 pour
   les deux fiches qui l'utilisent, alors que les deux raisons sont distinctes : monotonie de
   l'escalier sur `pont-fessier-leste`, stabilité du montage sur `hip-thrust-une-jambe-leste`. Le
   jour où l'une des deux bouge, la constante doit se dédoubler. Rien à faire avant, une constante
   unique qui se trouve valoir la même chose deux fois n'est pas une dette.
6. **Contrat d'effort, énoncé et non mécanisé. Soldé en v2.14.** La ligne vit en accroche du
   bloc de tête de « Comment ça marche » : la cible est ce que tu vises sur chaque série, pas là
   où tu t'arrêtes. Proposée par Claude, validée par Gabriel. Rien dans la card de pied.
7. **Montage de l'échelle du goblet squat.** L'échelle monte par lestes de poignets, 10, 12, 14
   puis 16 kg : les kilos ajoutés sont sanglés sur les avant-bras, c'est-à-dire sur la ressource
   dont l'usage signale déjà qu'elle limite l'exercice avant les cuisses. La mécanique de
   progression aggrave la limite observée. Question ouverte, non tranchée : à total égal, une
   kettlebell plus lourde tenue à deux mains n'impose pas la même charge aux avant-bras que 10 kg
   plus 6 kg aux poignets, et la règle d'ambiguïté préfère déjà la kettlebell la plus lourde
   disponible. Rien à décider avant d'avoir mesuré ce que donne l'ordre du circuit sur les mêmes
   séances. Cette condition n'est toujours pas remplie en septembre 2026 : l'ordre a changé deux fois
   depuis que la question a été posée, en v2.7 puis en v2.10, et une seule séance de goblet squat a
   été jouée sous l'ordre courant, le 15 septembre, à 15, 15, 15 sans gêne signalée.
   **Réduite en v2.18 par la kettlebell de 16 kg.** L'échelle réelle vaut 10, 12 et 14 kg en lestes
   sur la 10, puis 16 kg à deux mains : la question ne porte plus que sur deux barreaux au lieu de
   trois, 16 kg n'étant plus un montage à 6 kg de lestes. Elle devient concrète à la prochaine séance
   de goblet squat, prescrite à 12 kg, KB 10 plus 2 kg de lestes. **En v2.18**, les barreaux 18 à
   22 kg ne serviront plus, le squat sur une jambe s'ouvrant à 16 kg ; 12 et 14 kg restent, par
   décision de Gabriel « pour le moment ».
8. **Tirage en suspension lesté**, `rowing-suspension-leste`, sur le motif des fentes lestées :
   successeur derrière verrou au haut de fourchette du tirage en suspension, qui retire son
   prédécesseur. La marche écrite reste l'amplitude, que l'outil ne voit pas, tant que ce
   successeur n'existe pas. Décidé en septembre 2026 avec le lot v2.16, non conçu.

**Achat de gilet lesté : écarté, septembre 2026.** Question posée deux fois, tranchée sur mesure et
non sur avis. Aucune position du catalogue ne consomme un gilet aujourd'hui : trois fiches le
mentionnent comme marche lointaine, `pompes-poignees` derrière cinq barreaux de bande puis les pieds
surélevés, et les deux tractions strictes encore verrouillées ; deux l'excluent nommément au profit
d'une charge portée devant, `goblet-squat` et `fentes-arriere-lestee` ; et le gilet n'est pas une
ressource déclarable de l'inventaire, donc l'outil ne le verrait pas. La masse portée est déjà
mécanisée par la clé `masse` et l'échelle du sac au pas de 10 kg, dont quatre barreaux sont ouverts
et aucun atteint. S'y ajoutent deux motifs physiques : sur le squat la charge devant fait
contrepoids et réduit le moment lombaire, un gilet fait l'inverse ; et trente kilos pendus à la
ceinture scapulaire chargent en permanence la zone que le reste du programme protège. À rediscuter
quand les pompes seront en haut du dernier barreau de bande et les pieds surélevés épuisés, ou
quand les tractions strictes existeront, et ce sera alors un 10 ou un 20 kg à sacs fins.

Dette soldée en v2.19 : aucune échelle de charge n'est branchée sur `mode:'time'`, et les lestes sur
la jambe levée, marche 3 du gainage latéral, n'étaient pas outillables. L'exercice est passé en
répétitions cadencées et le lest n'est plus une marche écrite, voir la section de la v2.19. Les
quatre points reportés après l'audit de la v1.15 sont soldés en v2.12, le palier
tenu défait en silence, la correction muette, la charge de départ affichée à la place de la charge
courante, et `bandBest`.

Dette nommée en v2.16 : `p.range` est désormais, pour tout exercice, une copie constante de la
fourchette du catalogue, écrite à la création de la perf et normalisée à la migration, et `it.rng`
dans l'historique n'enregistre plus qu'une constante. Le moteur continue de lire `p.range` par
`rangeOf`, un seul chemin, mais deux écritures du même nombre finissent par diverger : à retirer
dans un lot propre, qui touchera `applyProgress`, `perfFor`, la migration, `it.rng` et une
vingtaine de suites. Pas dans ce lot, qui devait ne régénérer que ce qui change.

Dette nommée en v2.18 : `falsif38`, `falsif39` et `falsif42` appliquent encore des
mutations par `sed` nu, 14, 20 et 17, contre la règle de la section 6. `falsif41` a été converti en
v2.23, le lot touchant sa ligne visée. Relancés dans ce lot, ils
mordent tous, aucune survie : un motif qui ne mordrait pas se lirait ici comme une survie, visible.
À convertir dans le lot qui touchera leur code visé ; `falsif37` l'a été en v2.18, relancé pour
cause de `test37` retouchée.

**Reste ouvert après la v2.19.** La marche qui suit le gainage latéral avec abductions : discussion
dédiée quand Gabriel y sera, le lest à la cheville étant contesté comme travail de hanche plus que de
gainage ; une marche chargée en anti-inclinaison est une piste à vérifier par recherche, pas une
proposition. Les réglages
de cadence restent à éprouver à l'usage, Gabriel n'ayant pu tester la maquette qu'à l'oreille.

**Reste ouvert après la v2.22.** Les valeurs de cadence du pont, 1,5 / 1 / 2 s, n'ont pas eu de
maquette : premier retour à l'usage attendu sur le pont lesté. La faille des douze tenues avec une
pause au milieu, nommée en v2.17 pour le bird-dog, vaut désormais aussi pour le pont, non
journalisée de la même façon.

**Reste ouvert après la v2.24.** Le bouton « Une valeur est fausse ? Corriger » du récapitulatif
s'affiche en bouton plein, alors que le code le veut discret sous le bouton principal : la classe
`clr` n'est stylée que sous `.search`, et hors de la recherche le bouton prend le style par défaut.
Vu sur la maquette du lien de cohérence cardiaque, proposé, non traité.

**Synchronisation entre appareils, conception validée le 25 septembre 2026, lot B livré.**
Étape 1, stack `palier-backend` et `cle.sh`, déployée et vérifiée le 26 septembre, clé `gabriel`
créée ; étape 2, comportement `/api/*` de `palier-edge`, déployée et vérifiée le 26 septembre ;
étape 3, code client, v2.24, livrée et mise en service le 26 septembre : synchronisation activée
sur le PC, récupération vérifiée sur un second appareil.
Problème d'origine : en déplacement, la progression ne suit que si l'on a pensé à emporter une
sauvegarde du jour. Le lot A, migration de l'hébergement sous CloudFormation, est livré ; le lot B
est la synchronisation elle-même, v2.24. Décisions de Gabriel sur propositions de Claude, sauf
mention :
- **Hybride, local d'abord.** Sans clé, l'app se comporte exactement comme aujourd'hui, export et
  import compris, et la séance ne dépend jamais du réseau. La phrase « sans aucune dépendance
  réseau » de la section 3 deviendra « sans dépendance réseau obligatoire ».
- **Partage** avec le frère de Gabriel et quelques amis, un état par personne. Une clé est une
  personne, donc un état entier avec tous ses profils de matériel ; la card dit « clé de
  synchronisation », le backend « utilisateur », jamais « profil ».
- **Backend** : stack `palier-backend` en `eu-west-3`, CloudFront `/api/state` vers une Lambda
  Function URL avec OAC, concurrence réservée à 2. Un objet S3 versionné par utilisateur,
  `state/<id>.json`, bucket `palier-etat-727646498837` en `DeletionPolicy: Retain`, versions
  anciennes expirées à 90 jours, 30 gardées. S3 plutôt que DynamoDB : `state.hist` n'est pas borné
  et un item DynamoDB plafonne à 400 Ko. Table hash vers identifiant dans SSM, lue avec un cache de
  5 minutes, ce qui borne le délai d'une révocation. GET avec ETag, PUT conditionnel `If-Match`,
  412 en conflit, corps refusé au-delà de 2 Mo, identifiant tiré de la table et jamais de la
  requête.
- **Clé** : 20 caractères base32 de Crockford en 4 groupes de 5, 100 bits, générée par un script
  local qui affiche la clé et le SHA-256 de sa forme normalisée. Choix de Gabriel contre une phrase
  de passe de mots, qu'il s'enverra par e-mail. Saisie seule, pas de lien d'activation. Saisie
  normalisée : casse, tirets, espaces, confusions I, L, O. Rangée hors de l'état, donc absente des
  exports et de l'objet S3. Perte ou révocation : nouvelle clé rattachée au même identifiant.
  Écartés : une clé choisie par l'humain, devinable ; Cognito, disproportionné pour ce cercle.
- **En-tête `x-palier-key`**, pas `Authorization`, que CloudFront réécrit pour signer avec l'OAC.
  Les PUT portent `x-amz-content-sha256`, exigé par une Function URL derrière OAC. Politiques
  gérées `CachingDisabled` et `AllViewerExceptHostHeader`, le forfait gratuit n'en admettant pas
  d'autres.
- **Récupération automatique** quand l'état en ligne est plus récent, choix de Gabriel, à
  l'ouverture et au retour au premier plan, jamais pendant une séance, jugée sur l'ETag et non sur
  l'horloge. Envoi regroupé après `save()`, forcé en fin de séance, différé hors ligne, immédiat au
  passage en arrière-plan avec `keepalive`. Corps compressé en gzip, `keepalive` plafonnant à
  64 Ko.
- **Pas de fusion.** `perf`, `slotIdx`, `unlocked` et `prevMin` sont le produit séquentiel du
  moteur : deux états divergents ne se fusionnent pas sans incohérence. Un conflit se tranche par
  une question dans la page, qui montre la dernière séance de chaque côté. Envoi refusé si l'état
  distant porte un `appVersion` supérieur. Première liaison : envoi si rien en ligne, récupération
  si rien en local, question si les deux existent. Une séance jouée sur un appareil non configuré
  part d'un état vide et ne se rattachera pas : la clé se saisit avant, pas après.
- **Card Réglages > Synchronisation** : ligne d'information sur l'hébergement des données, les
  signalements de douleur étant des données de santé ; « Supprimer mes données en ligne » ;
  « Désactiver » ; dernière synchronisation en en-tête fermé.
- **Pas de mode démo**, décision de Gabriel : la navigation privée suffit, tant que la clé n'y est
  pas saisie.
- **Arbitrages de l'étape 1, 26 septembre**, trois écarts au bloc ci-dessus, décisions de Gabriel
  sur propositions de Claude :
  - *« Supprimer mes données en ligne » purge toutes les versions*, marqueurs compris, sur la clé
    exacte `state/<id>.json`. Un `DeleteObject` sur un bucket versionné pose un marqueur et laisse
    l'historique 90 jours : pour des données de santé, le bouton aurait menti.
  - *La table n'est pas une ressource de la stack.* Paramètre `/palier/utilisateurs`, type
    `String`, JSON empreinte vers identifiant, créé et édité par `cle.sh`. Une mise à jour de la
    ressource aurait réécrit sa valeur et effacé les clés. `String` et non `SecureString` : le
    SHA-256 d'une clé de 100 bits ne se renverse pas, et KMS n'apporte rien. Plafond de 4 Ko,
    une cinquantaine de personnes.
  - *Le script écrit la table*, au lieu d'afficher une empreinte à recopier : `cle.sh nouvelle`,
    `retirer`, `liste`. Une table illisible pour une autre cause que son absence arrête le script :
    la lire comme vide puis la réécrire aurait effacé les autres clés.
- **Contrat de l'API, arrêté à l'étape 1.** Route unique `/api/state`, `GET`, `PUT`, `DELETE`.
  La clé arrive sous sa forme canonique, la normalisation ne vit que dans le client ; toute autre
  forme vaut 401 sans lecture de la table. Cache de la table à 5 minutes, relu sur une empreinte
  inconnue au plus une fois par 15 s, pour qu'une clé neuve serve sans attendre ; une révocation
  prend effet à la relecture suivante, 5 minutes au plus. `GET` : 200 en gzip avec `ETag` et
  `x-palier-version`, 304 sur `If-None-Match` égal, 404 si rien en ligne. `PUT` : `If-Match` ou
  `If-None-Match: *` obligatoire, sinon 428 ; corps binaire au-delà de 2 Mo, ou décompressé
  au-delà de 16 Mo, 413 ; gzip, JSON ou `appVersion` invalides, 400 ; ETag périmé, conflit S3 ou
  objet supprimé entre-temps, 412. Table ou S3 en panne : 503, jamais une table plus vieille que
  le TTL. Le refus d'envoyer vers un `appVersion` supérieur reste au client : l'`If-Match` garantit
  qu'il a vu l'état qu'il remplace.
- **Prérequis au déploiement** : la concurrence réservée à 2 échoue si le quota du compte en
  `eu-west-3` est au plancher des comptes récents. Il l'était, à 10 ; relevé à 1 000 le
  26 septembre par demande de quota, sans toucher à la décision.
- **Étape 2, conception validée le 26 septembre** : seconde OAC de type `lambda` ; origine `api`
  ajoutée par condition sur `ApiHote`, vide par défaut ; comportement `/api/*` en `https-only`,
  une redirection perdant le corps d'un `PUT` ; sept méthodes, CloudFront n'admettant pas de
  sous-ensemble avec `PUT` ; `CachingDisabled` et `AllViewerExceptHostHeader`, la Function URL
  refusant l'hôte de la distribution ; `Compress: false`, pour un ETag qui reste fort. WAF
  inchangé. Contrainte pour l'étape 3 : tout `PUT` porte `x-amz-content-sha256`, empreinte du corps
  compressé, sans quoi la signature OAC échoue avant la Lambda. `testedge.sh`, quatorze
  vérifications vertes à travers la distribution : CloudFront transmet `If-Match` et
  `If-None-Match`, l'ETag reste fort, le repli `x-palier-if-match` est abandonné.
- **Étape 3, client, arbitrages du 26 septembre.** Huit recommandations de Claude validées par
  Gabriel, et un amendement demandé par Gabriel.
  - *Le lancement attend la synchronisation, 5 s au plus.* Demande de Gabriel : une séance lancée
    dans la fraction de seconde qui précède la réponse diverge. Il voulait un voile sur la page ;
    Claude a proposé de le limiter au bouton, remplacé par « Synchronisation… », et de le plafonner,
    un blocage sans plafond faisant dépendre la séance d'un Wi-Fi d'hôtel qui ne répond pas. Pas
    d'attente quand le navigateur se dit hors ligne. La garde vit dans `startSession`, que le
    clavier appelle aussi. Amende « la séance ne dépend jamais du réseau » : elle en dépend 5 s.
  - *Un conflit, ou une version plus récente en ligne, remplace le bouton de lancement.* Lancer
    créerait une divergence de plus. Choisir ne demande pas le réseau : « Garder cet appareil »
    prend l'ETag distant pour base et l'envoi part dès que possible. Proposition de Claude, qui
    revenait sur sa propre proposition antérieure d'une séance restant lançable.
  - *Son propre envoi se reconnaît* par un identifiant aléatoire porté dans le corps, `envoi`,
    retiré à la récupération. Sans lui, un `keepalive` dont la réponse se perd, téléphone
    verrouillé juste après la séance, donnait un faux conflit à l'ouverture suivante.
  - *Une version supérieure en ligne* bloque aussi la récupération, pas seulement l'envoi : un
    client ancien ne connaît pas les migrations d'un état plus récent. « Recharger » est proposé.
  - *404 après une liaison* : les données ont été supprimées ailleurs, la synchronisation se
    désactive sur l'appareil avec un message, sans renvoi qui annulerait la suppression.
  - *« Tout réinitialiser » se propage* à tous les appareils, un état par personne, et sa
    confirmation le dit. Les 30 versions S3 restent un filet côté administrateur.
  - *La ligne d'hébergement nomme l'accès administrateur* : le frère et les amis de Gabriel
    confient des données de santé à son compte AWS.
  - *Pas de bouton « Synchroniser maintenant »* : le focus de fenêtre déclenche une
    vérification, une par 30 s au plus, ce qui couvre l'ordinateur où changer de fenêtre ne change
    pas la visibilité de l'onglet.
  - *Thème, profil de matériel actif et dates d'export et d'import suivent l'état*, conséquence
    de l'absence de fusion. Le profil choisi en déplacement est actif au retour.
  - *Mesure sur l'export du 25 septembre* : 16 247 octets, 3 137 en gzip, environ 70 octets
    compressés par séance. Le plafond `keepalive` de 64 Ko est à plusieurs années ; au-delà,
    l'envoi part sans `keepalive`, et `sale`, persisté, fait rattraper l'envoi à l'ouverture
    suivante.
- **Choix d'implémentation de l'étape 3, confirmés par Gabriel le 26 septembre** :
  - *Métadonnées lues une seule fois, au démarrage*, écrites à chaque changement. La conception
    annonçait une relecture avant chaque échange : un second onglet y reprendrait la base du
    premier et écraserait son envoi sans conflit, alors qu'avec sa propre base il reçoit un 412 et
    pose la question.
  - *L'export réel du 25 septembre est embarqué dans `test49`*, donc dans `tests/test49.js`,
    signalements de douleur compris. Gardé : c'est la seule donnée réelle des suites, figée en
    v2.22, qui éprouvera chaque future migration sur un vrai historique. **Règle** : avant toute
    publication du dépôt, le remplacer par un état synthétique de même taille.
- **Fonctionnement du client**, valeurs dans `app10.js` : métadonnées `{cle, lie, base, baseVer,
  sale, gen, envoi, derniere}` ; envoi 4 s après le dernier enregistrement, requête abandonnée à
  10 s, vérification au retour au premier plan au plus une par 5 s. Première liaison : la clé
  n'est écrite qu'une fois acceptée ; « rien en local » veut dire aucune séance dans `hist`.
  Clé refusée : les modifications restent en attente, et une clé neuve rattachée au même
  identifiant garde la base et part avec elles. Une réponse arrivée pendant une séance, récap et
  correction compris, n'est jamais adoptée : une vérification neuve part au retour à l'accueil.
  L'envoi, lui, se fait aussi en séance, au passage en arrière-plan.

**Chantiers décidés en septembre 2026, conception à faire.** Ils ne sont pas ouverts : la forme est
tranchée, ce qui reste est la conception et l'écriture. Les motifs d'écartement comptent autant que
les formes retenues.

*Tenues rythmées, livrées en v2.17.* La conception de septembre a été livrée avec quatre écarts
tranchés en séance, plus deux corrections d'audit avant déploiement ; le détail, les motifs
d'écartement et ce que la conception avait de faux vivent à la section « Tenues rythmées » en 2.
Restent ouverts : les successeurs de plafond, carrés et résistance, encore des marches écrites, et
la faille des douze tenues avec une pause au milieu, non journalisée.

*Critère de fin de série, livré en v2.12.* Le champ `fin` porte le critère propre sur sept fiches,
et toutes portent la règle générale. Formulation retenue, issue de Gabriel et affinée : **une série se termine quand la répétition suivante ne serait plus le même
exercice.** Deux façons d'y arriver : l'agoniste lâche et on s'arrête 1 à 3 répétitions avant, ou
**la qualité se dégrade en premier et c'est elle qui commande**. Sur pompes, planche, gainage
latéral, tractions assistées, dead bug, pallof press et élévations latérales, la référence n'est pas
l'échec musculaire mais l'échec technique, qui arrive avant. Exemple de référence à conserver tel
quel : sur les pompes, la limite n'est pas l'épuisement des pectoraux mais l'affaissement du bassin ;
passer cette limite ne produit pas une pompe de plus, elle produit une extension lombaire sous
charge, que le programme interdit partout ailleurs. À écrire dans l'onboarding et dans les fiches.

Sur le **RIR**, pour lever une contradiction apparente avec le tableau des abandons : ce qui est
abandonné, c'est le RIR comme **champ déclaratif** saisi après la série, donnée invérifiable. Le
concept, lui, est retenu et il est déjà dans la formulation ci-dessus : « s'arrêter 1 à 3 répétitions
avant que l'agoniste lâche » est du RIR 1 à 3, dit sans le sigle. L'onboarding l'explique, l'outil ne
le demande jamais. Le vocabulaire de musculation est le bienvenu dans les textes destinés à Gabriel ;
c'est la saisie qui est refusée, pas le mot.

*Onboarding, livré en v2.12, réécrit en quatre blocs en v2.14* (voir section 2) sous la forme arrêtée ci-dessous, à une exception près : l'option
d'ouvrir la fiche au premier passage reste ouverte, elle seule demandant une migration. Elle se
décidera mieux une fois le texte lu en place, puisque la question est justement de savoir combien de
contenu technique il doit porter. Trois trous identifiés : la phase de calibration n'est documentée nulle part, le
critère de fin de série non plus, et la règle d'or « renseigne-toi sur l'exercice avant de le faire »
non plus. **Forme retenue : un seul texte, révélé progressivement.** Trois blocs courts de deux ou
trois phrases à l'accueil, calibration, fin de série, règle d'or, chacun portant un « en savoir
plus » qui déplie le développement **sur place**, sans changement d'écran ni de mode. Section
« Comment ça marche » dans Réglages avec le même texte déplié par défaut, plus un lien depuis chaque
fiche. **Écarté : deux versions distinctes, courte et longue, avec un sélecteur.** Le sélecteur
demande un choix avant de savoir ce qu'il y a dans l'autre version, et impose de maintenir deux
textes qui divergeront. Option connexe à trancher : ouvrir la fiche d'office au **premier** passage
de chaque exercice, ce qui déchargerait l'onboarding de tout le contenu technique, au prix d'un
drapeau « déjà vu » par exercice dans l'état, donc d'une migration. Contenu de la calibration à
écrire : elle existe au début, elle dure quelques semaines, les sauts de charge y sont grands et
c'est normal, elle se termine d'elle-même, et ses statistiques ne prédisent pas le rythme futur.

*Recomposition du vivier poussé.* **Moins urgente depuis la v2.11** : l'ordre du circuit sépare déjà
la paire, donc ce chantier ne traite plus qu'une erreur de catégorie, pas une gêne vécue. La gêne
du 15 septembre (v2.18) ne relève pas de lui, le poussé en cause étant le développé, un vrai
poussé ; mais si la pause de 60 s ne suffit pas, ce chantier et le mini-poste redeviennent les
leviers suivants. Position de
Gabriel, septembre 2026 : sortir les élévations latérales du vivier pour les remplacer par un
pushdown triceps serait dommage, il tient à l'exercice. Une option qui les conserve reste donc à
mettre en face avant de trancher, notamment le cinquième mini-poste d'épaule décrit plus bas. Sur le
fond, quatre auditeurs indépendants sur quatre convergent : **les
élévations latérales sont une erreur de catégorie dans le vivier poussé.** Ce n'est pas une poussée,
c'est une abduction isolée, et c'est le seul exercice du vivier qui pré-fatigue exactement ce que le
face pull cible. Les trois exercices du vivier étant marqués épaule 3, le poste poussé charge
l'épaule dans 100 % des séances ; un remplaçant qui n'y met pas l'épaule en facteur limitant
ramènerait ce chiffre à 67 %. Candidat proposé indépendamment par les deux audits ancrés :
**extension triceps à l'élastique en pushdown sur ancrage de porte**, matériel déjà présent. À
trancher : l'exercice de remplacement, et ce que deviennent les élévations latérales, poste optionnel
de fin, cinquième mini-poste, ou sortie du circuit. Effet cumulatif avec la v2.10 : l'ordre et la
pause réduisent les dégâts quand l'épaule est chargée, le vivier réduirait la fréquence à laquelle
elle l'est. Les deux sont complémentaires, pas redondants.

*Cinquième mini-poste d'épaule.* Option apparue à l'audit du 11 septembre, jamais évaluée. Les
élévations latérales **et** les face pulls sont deux exercices d'isolation d'épaule rangés dans deux
viviers d'exercices poly-articulaires : c'est la cause racine de la paire. Les sortir tous les deux
vers un cinquième poste court en fin de circuit, en rotation exclusive, jamais les deux dans la même
séance, conserverait les deux exercices, rendrait les viviers poussé et tiré purement composés, et
rendrait la fréquence de chacun réglable. Coût : cinq stations, structure de séance et modèle de
temps à revoir, et la question du raccord entièrement reposée. À ne pas décider sans observation.

*Journal enrichi, livré en v2.12.* Trois champs et non deux : aux deux recensés, durée par série et
tours prévus au lancement, s'est ajoutée la **cible du jour**, sans laquelle l'instrument de
stagnation restait non calculable. Ils ne rétroagissent pas sur les séances déjà enregistrées, et
aucun signal ne les lit encore. Sur la cadence, annoncée comme meilleur proxy d'effort : elle ne le
sera pas telle quelle, une interruption en pleine série se lisant comme une cadence lente, donc
comme une marge à l'échec qui n'existe pas. Voir l'entrée de la section 2.

**Points ouverts après l'audit de septembre 2026.**

1. **Promotion de la table de marqueurs en donnée du catalogue.** Sans objet depuis la v2.11 : la
   pause est conditionnée à une liste de paires constatées, pas à une table. Conservé ici parce que
   la table reste l'instrument de raisonnement hors application, et qu'elle est contestée. Deux
   audits proposent
   indépendamment de **scinder la ressource épaule** en abduction et coiffe, poussée antérieure,
   appui scapulaire en chaîne fermée, et de corriger deux lignes, planche 3 vers 2 et goblet squat 3
   vers 2. Avec l'ensemble de leurs corrections la moyenne passe de 1,93 à 1,50 poste sur 4. La table
   reste un jugement et non une mesure, et c'est pour cela qu'elle vit dans `audit-epaule.js`, hors
   application.
2. **Deux défauts de structure de la table de marqueurs**, trouvés à l'audit externe du 11 septembre,
   à garder en tête avant d'y toucher.
   D'abord le **seuil**. Un conflit est déclaré quand la somme des marqueurs atteint 5. Face à un
   vivier poussé uniformément marqué 3, toute adjacence poussé × (exercice marqué 2 ou plus) compte
   pour un conflit plein, que l'exercice vaille 2 ou 3. Conséquence non tirée à l'époque : les deux
   corrections proposées par les audits antérieurs, `planche` 3 → 2 et `goblet-squat` 3 → 2, ne
   changent **aucune** adjacence avec le poussé. Les tester donnait une robustesse trompeuse. Les
   vrais leviers sont les `2` du vivier gainage, `bird-dog` et `pallof-press`, qui portent 40 des
   80 points du raccord.
   Ensuite la **direction**. Un conflit dégrade le second exercice, pas le premier. Ce qui compte est
   « combien A fatigue la ressource » multiplié par « combien la performance de B en dépend », et la
   table fusionne les deux en un marqueur unique. Une tenue isométrique est un agresseur modéré mais
   une victime sensible ; un exercice à 12-20 répétitions au plafond est l'inverse. Une table à deux
   colonnes ne serait pas plus lourde à tenir et dirait ce qu'on veut savoir : **quel exercice on
   protège**.
3. **Micro-palier asymétrique sur les exercices à bras tendu**, voir la phase de calibration en
   section 1.
4. **La table de marqueurs ne connaît pas les tractions en pronation** (v2.18), ni l'escalier du
   squat, ni dans ses lignes ni dans ses états départ et mature, que la table recopie dans `seuil-r.js` et `ordre-circuit.js`.
   Ces états ne décrivent plus l'état réel : pronation, jambe levée et soulevé roumain sont débloqués
   au 15 septembre. À compléter par un jugement explicite avant toute nouvelle mesure.
4. **Dépassement de la contrainte de durée** : une séance à 27 minutes le 27 août, contre une
   contrainte affichée de 10 à 20 minutes. La pause de raccord ajoute 1,5 min à trois séries, ce qui
   aggrave le point sans le créer.
5. **Comparaison de rang**, série 1 contre série 1 d'un passage à l'autre plutôt que le minimum
   global, comme neutralisation du biais de tours, sans jamais regarder le découpage des séances.
   Proposition d'auditeur, non évaluée. Première observation concrète le 25 septembre 2026 :
   9/9/7 contre 9/9/6 aux pompes est supérieur ou égal à chaque rang, là où le minimum recule la
   cible (v2.23).
6. **Fenêtre de preuve fixe**, les trois dernières séries observées à la charge courante, comme
   alternative au comptage par tours. Proposition d'auditeur, à ne pas appliquer pendant la
   calibration.

**Cinq signaux calculables sur l'observable**, proposés en remplacement d'un champ RPE, qui est
abandonné. Tous informatifs, aucun décisionnel, ce qui est la condition pour qu'ils respectent le
principe d'architecture.

| signal | calcul | indique |
|---|---|---|
| gradient intra-séance | écart de chaque poste à son passage précédent, dans l'ordre du circuit | chute localisée = interférence ; chute sur 3 postes ou plus = fatigue systémique |
| descente de tours en cours | événement observé | auto-régulation |
| écart tours prévus contre réalisés | sur n dernières séances | réglage aspirationnel, nécessite un journal enrichi |
| cadence | répétitions par durée d'effort, série par série | proximité de l'échec, nécessite un journal enrichi |
| densité récente | séries sur 7 et 28 jours | charge accumulée |

Critère de sortie de calibration proposé, entièrement observable : trois séances consécutives aux
tours prévus, tous les postes dans leur fourchette, sans déclenchement du filet de sécurité. Les
tours prévus ne sont pas conservés aujourd'hui, donc il attend le journal enrichi.

**Garde-fou de méthode.** Une extrapolation faite en cours de session le 10 septembre 2026 annonçait
23 séries d'épaule par semaine ; le journal en donne **14,0**. La proportion tenait, 48 % prédits
contre 47 % observés, le volume absolu non, parce que l'objectif est à trois séances par semaine et
non quatre. Vérifier plutôt que juger à l'œil vaut aussi pour les chiffres dérivés d'une proportion
juste.
