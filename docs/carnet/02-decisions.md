## 2. Décisions structurantes et leur justification

Ces choix ont été débattus et tranchés. Ne pas les rouvrir sans raison nouvelle.

**Principe d'architecture : l'outil décide sur ce qu'il observe, jamais sur ce qu'il ne peut pas
observer.** Il observe les répétitions, les charges, les durées, les dates, l'identité et l'ordre
des exercices. Il n'observe pas l'effort, la douleur, la fatigue, la technique.

Corollaire opérationnel : deux historiques observables identiques doivent conduire à la même
décision automatique. Corollaire sur les champs déclaratifs : un champ qui ne décide de rien ne
sera pas rempli, et un champ qui décide crée une incitation à mal déclarer. Dans les deux cas la
donnée ne vaut rien.

Ce principe était déjà écrit en v1.13, à propos du Stop sur une tenue chronométrée, mais comme un
cas particulier : « ce n'est pas une question de triche, l'outil ne peut rien contrôler et n'a pas
à essayer ». Il est général, et c'est lui qui a fait retirer d'un coup, en septembre 2026, quatre
propositions d'auditeurs, dont l'exigence des tours prévus pour valider une montée de charge. Voir
la liste des abandons en fin de section.

**Structure alternée, seule structure (v1.18).**
Le premier découpage était Push/Pull/Jambes/Core/Mobilité. Abandonné comme défaut dès l'origine : à
4 séances par semaine, chaque muscle n'était vu qu'une fois, soit 3 séries hebdomadaires, très en
dessous de la dizaine nécessaire pour progresser.

**La raison d'origine du choix, à ne pas confondre avec sa vérification (rétabli en v2.7).** Le but
était le plus de résultat dans le moins de temps possible. Un muscle a besoin de 60 à 90 s de pause
entre deux séries pour la prise musculaire. Quatre exercices sur des groupes différents paient cette
pause par le travail des trois autres : la structure alternée supprime le temps mort, elle ne le
subit pas. C'est le mécanisme, et non un effet secondaire. Le volume hebdomadaire mesuré en v1.18,
8-16 séries par groupe pour une durée identique, en est la conséquence et sert de vérification. Le
carnet avait présenté le repos comme un bénéfice annexe, ce qui inversait la cause et l'effet.

Le repos réel est très au-dessus du besoin : avec un coût de série de 30 à 70 s et une transition à
15 s, l'écart entre deux séries d'un même exercice vaut 150 à 270 s. Ce n'est donc jamais l'horloge
qui manque quand un exercice paraît dur au troisième poste, c'est que les trois postes précédents
n'ont pas reposé la structure qui limite. Voir l'entrée sur l'ordre du circuit.

L'ancien découpage a survécu quinze versions comme mode secondaire, sans jamais être utilisé une
seule fois. Retiré en v1.18, mesures à l'appui : il délivrait 3 séries par groupe et par semaine à
l'objectif de 4 séances contre 12 en alterné, il faudrait environ 13 séances hebdomadaires pour
qu'il atteigne le bas de la fourchette visée. Sa table de 12 exercices était figée : 18 des 30
exercices du catalogue lui étaient invisibles, il ne filtrait pas les exercices retirés par un
verrou, et il n'avait ni cardio ni étirements de fin. Il coûtait 23 lectures de `state.mode` sur
sept points de branchement, que tout chantier futur devait traverser deux fois. Il n'y a plus de
structure à choisir : l'argument qualitatif vit dans la card du bas des réglages, le volume
hebdomadaire par groupe dans la card Séries par exercice, où il se recalcule seul.

**Double progression : répétitions puis charge.**
On progresse en répétitions dans une fourchette, et quand toutes les séries atteignent le haut de la
fourchette, la charge monte d'un palier et la cible redescend au bas de la fourchette. Filet de
sécurité : si les séries tombent nettement sous le bas de la fourchette, la charge redescend seule.
Pour les exercices sans charge ajustable, la progression se fait en répétitions jusqu'à un plafond,
puis c'est le déblocage d'une variante plus dure qui prend le relais.

**Échelle de charge calculée depuis l'inventaire réel, pas des paliers arbitraires.**
Le chiffre affiché est la charge par haltère, pas le total. Micro-palier prévu : un seul disque
supplémentaire sur une extrémité, déséquilibre négligeable sur une charge tenue au centre de la
main. Capacité du manchon respectée : 5 disques par extrémité (v1.2, réglable). Deux échelles :
la paire (inventaire divisé par deux barres, 35 paliers de 2 à 14,5 kg) et l'haltère seul
(`loadLadderMono`, tout le stock sur une barre, jusqu'à 17 kg) pour les exercices unilatéraux.

**Volume choisi au lancement, temps calculé et annoncé (v1.13, inverse la règle d'origine).**
2, 3 ou 4 séries par exercice. La règle antérieure était l'inverse : on choisissait 10, 15 ou 20
minutes et le contenu s'ajustait, avec un ordre de sacrifice quand le temps manquait. Trois raisons
l'ont fait tomber. Le nombre annoncé était en réalité un total moins les étirements, calculé avec un
coût de série sous-évalué d'un tiers : il annonçait 15 pour une séance de 18. Le cadran était
entier, on ajoute des tours complets de quatre exercices, si bien qu'aucune durée ronde ne pouvait
tomber juste ; demander 15 minutes de cœur en produisait 11 à 13 selon le tirage. Et l'ordre de
sacrifice agissait sans le dire : activer le cardio retirait un tour, soit un quart du volume.
Un cadran temporel à tours entiers ne peut pas tenir sa promesse, c'est la raison nouvelle qui
autorisait à rouvrir. Désormais le bouton porte ce qui est contrôlé, le nombre de séries, exact par
construction ; la ligne dessous porte ce que cela coûte aujourd'hui, calculée exercice par exercice
et marquée d'un tilde. Aucun des deux ne peut mentir. Les options s'ajoutent au total au lieu de
rogner le volume, donc l'ordre de sacrifice disparaît avec le budget qu'il défendait. Une séance
courte compte autant qu'une longue pour l'objectif hebdomadaire : mieux vaut 2 séries que rien.

**Le coût d'une série se calcule par exercice, jamais par une constante (v1.13).**
Un unilatéral vaut deux fois le travail, une tenue vaut sa cible plus son décompte de préparation,
deux fois si elle se fait par côté. Une constante unique se trompait de quatre à cinq minutes selon
le tirage du jour, à volume égal, ce qui ramenait au problème d'origine. La durée annoncée modélise
une séance faite proprement : les interruptions relèvent de l'utilisateur, pas de l'outil, sans quoi
aucun chiffre réaliste n'est possible.

**Le rendu réécrit la vue entière, et il n'y a qu'un seul chemin (v1.14).**
Aucune bibliothèque, aucun rendu incrémental : chaque interaction reconstruit tout le HTML de la
vue. Le prix est un repaint complet à chaque clic ; le bénéfice est qu'aucun état affiché ne peut
diverger de l'état réel, puisqu'il n'existe qu'une façon de produire l'affichage. Le rendu ciblé,
qui ne réécrirait que la card touchée, a été écarté : un seul clic sur l'échauffement change le
total de l'en-tête, les trois libellés des boutons de volume, le résumé de la card fermée, six
lignes de décomposition et le détail de séance, et multiplier les chemins de mise à jour garantit
qu'un jour l'un d'eux oubliera quelque chose. Ce qui se corrige sans y toucher, ce sont les effets
de bord du remplacement. Une animation CSS se rejoue à chaque création de l'élément : toute
animation d'apparition doit donc être conditionnée à une arrivée sur un écran, sinon elle se
déclenche à chaque clic sur toute la page. Chaque écran annonce sa clé en entrant, et la clé de
séance porte le numéro d'étape, pour qu'un changement de série s'anime et qu'un ajustement de charge
sur la même série reste muet. Dans le même esprit, l'ouverture des cards est écrite dans le HTML
plutôt que rétablie après coup, et la position de défilement est préservée autour du rendu.

**Ce que l'outil chronomètre ne se modélise pas (v1.14).**
La ligne de partage est mécanique, pas conventionnelle. Échauffement, décomptes de préparation,
tenues, étirements, transitions et cardio sont des minuteurs réels : ils comptent à leur valeur
exacte. Ne se modélise que ce pendant quoi aucun chrono ne tourne, et cela se réduit à quatre
postes. Le tempo d'une répétition appartient à l'exercice, valeur par défaut 4,5 s conforme aux
consignes que les fiches donnent elles-mêmes (« monte en 2 s », « descends lentement en 2-3 s »),
avec des exceptions déclarées là où le mouvement s'en écarte nettement. L'installation, arriver,
se placer, saisir la valeur et valider, vaut 10 s pour une série chiffrée ou une tenue et 5 s pour
un étirement, qui ne demande ni saisie ni matériel. La bascule de côté n'existe que là où l'outil
n'en compte aucune, soit deux exercices : le pallof press, qui pivote autour d'un ancrage fixe, et
le rowing kettlebell, qui repose la charge et déplace ses deux appuis ; les tenues par côté
rejouent déjà un décompte à chaque côté, les étirements bilatéraux enchaînent seuls au bip, et
fentes, bird-dog et dead bug alternent à chaque répétition d'après leurs fiches. Le remontage de
charge, enfin, ne se paie que là où il a lieu.

L'ancienne constante unique de 22 s n'était pas un calcul mais un solde : ce qui restait d'une
mesure de 18 minutes une fois soustrait le modélisable, réparti à parts égales sur les séries. Elle
facturait un réglage de charge à des étirements et à onze exercices sur vingt-trois qui n'en
demandent aucun, et masquait un tempo sous-évalué de 30 à 50 % par rapport aux consignes de l'outil.
La décomposition n'a presque pas déplacé le niveau annoncé, moins d'une demi-minute sur la moyenne
à 3 séries, mais elle a élargi la fourchette de 16,2-20,9 à 14,7-23,2 : l'outil distingue enfin une
séance de tenues au poids du corps d'une séance de tractions lentes avec remontage d'haltères.
L'installation reste le seul paramètre libre, celui qui absorbe ce qui n'est représenté nulle part.

**Le montage se prépare avant la séance, sauf conflit de ressource (v1.14).**
Compter un réglage de charge à chaque série était faux : chaque exercice garde son montage et le
détail de séance existe précisément pour le préparer. Le remontage ne coûte du temps que lorsque
deux exercices se disputent la même ressource physique, les deux barres d'haltères ou la kettlebell
et ses lestes, à des charges différentes. Il se compte alors sur la séquence réelle des séries, à
chaque passage de l'un à l'autre, le premier montage étant exclu puisqu'il est fait avant : deux
exercices en conflit dans un circuit valent 2R-1 remontages. Nul dans 83 % des tirages, jusqu'à
cinq à 3 séries. Une bande se change de barreau et ne compte pas. Le détail de séance nomme alors
les deux montages et leur nombre : la liste du matériel à sortir ne suffit pas à préparer une
séance qui change de charge en cours de route.

**Réglages annonce des fourchettes, jamais des moyennes (v1.14).**
Une moyenne ne dit rien quand le coût d'une série va de 30 à 70 s selon l'exercice et que deux
tirages au même volume s'écartent de huit minutes. Les bornes se calculent en balayant les
combinaisons réellement tirables, remontages compris, ce qui exclut au passage les exercices
verrouillés : la moyenne les incluait alors qu'ils ne peuvent pas sortir, et Réglages annonçait 43 s
de moins que l'accueil pour le même volume. La phrase qui accompagne le chiffre se compose depuis
les options actives au lieu d'affirmer un contenu fixe.

**Les ajustements de contenu du jour se font sur l'accueil (v1.13).**
Réglages porte les valeurs par défaut, l'accueil les ajuste pour la séance qui vient. Échauffement,
cardio et étirements se règlent depuis une card Contenu repliée par défaut, dont l'en-tête fermé
résume les options du jour et donne, ouverte, la décomposition chiffrée poste par poste. Les
transitions y forment une ligne distincte du poste Exercices depuis la v1.14, et le remontage de
charge une ligne qui n'apparaît que lorsqu'il y en a ; les postes s'affichent au dixième de minute
pour que le total se retrouve. Ces
ajustements suivent exactement le cycle de vie du mode allégé : ponctuels, signalés, ils ne
survivent ni à la séance, ni à l'abandon, ni au rechargement. L'exception faite aux cards
repliables, qui étaient exclues de l'accueil, tombe par son propre critère : l'état fermé est ici un
résumé utile, et il change avec les options.

**Pas plus de 4 séries par groupe dans une même séance.**
Au-delà d'environ 5 à 8 séries par groupe dans une même séance, le rendement devient négligeable.
La règle s'énonçait en durée, « pas de séance longue au-delà de 20 minutes », tant que la durée
était le bouton qu'on tournait et le volume sa conséquence. La v1.13 a inversé les deux : le volume
se choisit, plafonné à 4 séries, donc sous le seuil, et la durée n'est plus qu'une conséquence
annoncée avant de lancer. Le proxy est tombé avec son objet (v1.14). Une séance qui dépasse
20 minutes n'est pas un défaut, c'est un choix de jour long ; le bouton 4 séries sort de la
disponibilité déclarée de 10 à 20 minutes et reste donc exceptionnel.
Le second membre ne dépend pas du premier et reste entier : deux séances de 15 minutes valent
mieux qu'une de 30, et c'est l'objectif en jours actifs qui le porte, pas un plafond de durée.

**Streak de semaines, jamais de streak quotidien.**
Un streak quotidien casse au premier jour manqué et c'est précisément là que les gens abandonnent.
L'objectif est hebdomadaire, tout dépassement est du bonus.

**Ne pas multiplier les variantes d'un même mouvement.**
La rotation pioche dans des viviers : chaque exercice ajouté à un vivier réduit la fréquence des
autres et ralentit la progression mesurable sur chacun. On ajoute un exercice quand il comble un
trou de schéma moteur ou un besoin de sécurité, jamais pour varier.

**Un mode ponctuel n'est pas un réglage (v1.8).** La séance allégée se choisit sur l'accueil avant
de lancer, se signale visuellement pendant toute la séance, et disparaît à la fin comme à
l'abandon ou au rechargement. Un mode qu'on oublie activé serait pire que pas de mode du tout. Ce
n'est pas une entorse au « rien à décider » : la promesse porte sur l'absence de décision pendant
la séance, et l'alternative réelle ce jour-là n'est pas « séance normale ou allégée » mais
« allégée ou rien ». Corollaire retenu : une séance allégée compte pleinement en jour actif,
semaine et XP, sinon elle découragerait exactement ce qu'elle cherche à rendre possible.

**La rotation avance là où l'exercice prévu a travaillé (v1.13, affine la règle v1.9).**
La v1.9 gelait toute la rotation dès qu'une séance était allégée, au motif que rien n'avait
progressé. Trop large : une séance allégée ne remplace pas tous ses exercices, certains sont
seulement allégés de 30 %, et leurs séries sont enregistrées, historisées et comptées pleinement
dans la couverture musculaire. Les compter pour rien dans la rotation contredit la mesure de
l'outil, et fait revenir deux fois de suite les exercices qui n'avaient pas été substitués. La ligne
juste se lit emplacement par emplacement : la rotation avance là où l'exercice prévu a effectivement
travaillé, elle gèle là où il a été remplacé par un repli, celui-là n'ayant rien enregistré. Le gel
suit la substitution, pas le mode. Les quatre compteurs d'emplacement étaient déjà indépendants,
les faire diverger ne coûte rien.

**Échappatoire au gel de rotation (v1.13).** Dès la deuxième séance allégée d'affilée, tout avance.
Le vivier poussé a un repli sur ses trois exercices : sous la seule règle par emplacement, il serait
gelé à chaque séance allégée, donc verrouillé pour toute la durée d'une période douloureuse. Le
compteur repart à zéro dès qu'une séance normale est terminée ; une séance quittée ne l'incrémente
pas. La règle avait un second volet pour le mode ciblé, où le compteur portait un bloc entier et non
des emplacements ; il tombe avec le mode en v1.18. La rotation des étirements, elle, n'a jamais
gelé : ils sont faits tels quels. Un repli
douleur ponctuel dans une séance normale ne fige rien.

**Une mesure hebdomadaire ne se divise que par des semaines vécues (v1.11).**
La règle posée en v1.5 pour la moyenne de jours actifs valait pour toute moyenne, et la couverture
musculaire lui échappait encore : son dénominateur valait 4 en dur, si bien que le travail réel
était divisé par des semaines pendant lesquelles l'outil n'existait pas. Trente-trois séries faites
en une seule semaine s'affichaient 2,3 séries par groupe, quatre curseurs orange sous la bande,
alors que la semaine vécue était dedans. Un chiffre faux comparé à un référentiel juste produit un
signal faux, et il frappe au démarrage, c'est-à-dire au moment le plus fragile, exactement comme le
faisait l'objectif hebdomadaire avant le prorata de la v1.3.
La fenêtre passe donc des vingt-huit derniers jours glissants aux semaines ISO révolues, la semaine
en cours restant dehors, et le libellé annonce le nombre de semaines réellement moyennées. Tant
qu'aucune semaine n'est révolue, les rails, le ratio tiré/poussé et les alertes de bande cèdent la
place à une mention d'attente : il n'y a rien à moyenner, et la projection de configuration suffit,
étant prospective. Conséquence assumée : la mesure ne bouge plus qu'une fois par semaine, et à
court terme elle peut afficher moins qu'avant, ce qui est le prix d'un chiffre vrai.
Écarté, un dénominateur en jours écoulés depuis la première séance : il donnerait un chiffre dès le
premier jour mais transformerait un bilan rétrospectif en débit instantané qui bouge chaque jour.
Écarté aussi, un prorata du volume sur les jours disponibles d'une semaine de démarrage, par
symétrie avec l'objectif hebdomadaire : l'objectif mesure un engagement, qui se proratise, tandis
que la bande 8-16 est un seuil physiologique. Huit séries faites en quatre jours restent huit
séries, et extrapoler inventerait du travail non fait.
Les replis douleur gardent leur fenêtre glissante de quatre semaines, malgré l'alignement affiché
en v1.5 : ce sont des fréquences et non une moyenne, aucun dénominateur ne les fausse, et un signal
de sécurité doit réagir dès la séance du jour plutôt qu'au lundi suivant.

**Le pas de progression appartient à l'exercice, pas au moteur (v1.11).**
La cible suivante vaut la plus petite série réalisée plus 1, ce qui convient aux répétitions mais
faisait monter les tenues chronométrées d'une seconde par passage. La planche demandait 40 passages
pour aller de 20 à 60 secondes, soit environ un an au rythme de rotation réel, là où les autres
exercices franchissent leur fourchette en 8 à 14 passages. Le pas de 5 secondes existait déjà dans
le code, mais servait uniquement à relever la fourchette. Il s'applique désormais à la cible, par
arrondi au multiple supérieur : huit passages au lieu de quarante.
Le « plus 1 » avant l'arrondi n'est pas décoratif, il est ce qui fait avancer : sans lui, tenir
exactement sa cible retomberait sur elle-même et rien ne monterait jamais. Les bornes des trois
exercices tenus sont toutes multiples de 5, l'arrondi ne peut donc pas sortir de la fourchette, et
il rejoint celui que le mode allégé applique déjà aux tenues. Périmètre strict : les étirements et
l'échauffement ne passent pas par ce moteur.
Amendé en v2.14 : la lecture qui entre dans ce calcul n'est plus la plus petite série du seul
dernier passage, mais la plus haute des deux dernières. Le pas et l'arrondi ne changent pas. Voir
« La cible a une mémoire de deux passages ».

**Un Stop est définitif sur une tenue chronométrée (v1.13).**
Le bouton proposait « Reprendre » et le chrono repartait de la valeur atteinte : une planche de
45 secondes pouvait se construire en trois morceaux de 15. Ce n'est pas une question de triche,
l'outil ne peut rien contrôler et n'a pas à essayer, c'est une question de ce que le nombre désigne.
La fourchette 20-60 mesure une tenue continue, et un utilisateur parfaitement honnête pouvait
enregistrer 45 sans savoir que l'outil attendait autre chose. Un arrêt est donc un arrêt ; pour
refaire, on réinitialise et on repart de zéro. Le cas gênant, la coupure subie en milieu de tenue,
relève du principe posé sur les durées : c'est un imprévu, donc la responsabilité de l'utilisateur,
qui refait ou garde la valeur courte.

**Une tenue par côté exige une mesure de chaque côté (v1.13).**
Un exercice bilatéral fait d'un seul côté ne produit pas la moitié du bénéfice, il produit du
déséquilibre, ce que la sélection d'exercices cherche précisément à éviter sur un dos fragile. La
validation reste donc grisée tant que chaque côté prévu n'a pas sa mesure, et ENTRÉE est inerte dans
le même état : l'écran et le clavier disent la même chose. La règle couvre du même geste la tenue
jamais démarrée, un côté prévu et zéro mesure. C'est le côté le plus court qui part au journal, pour
que l'asymétrie soit visible plutôt que masquée par une moyenne. Deux conséquences assumées :
« Passer » reste la sortie si le second côté coince, et jette le premier ; un second côté écourté
valide, et c'est bien lui qui est enregistré.

**ESPACE ne détruit jamais une mesure (v1.13).**
Une touche qu'on presse par réflexe ne doit pas pouvoir effacer une tenue qu'on vient de faire. Une
fois le dernier côté arrêté, ESPACE ne fait plus rien, et la remise à zéro reste un bouton. Corollaire
de périmètre : on ne remet à zéro que ce qui est mesuré. Échauffement, étirements et cardio
n'enregistrent rien et gardent leurs commandes existantes.

**Une pression unique qui inscrit quelque chose mérite un pas en arrière (v1.13).**
Généralisation du motif de la v1.12, où le repli douleur avait gagné un retour permanent. Sur une
série chiffrée, la valeur est préremplie à la cible : une pression sur ENTRÉE au lieu d'ESPACE
n'y saute pas l'exercice, elle enregistre une série non faite, à la cible, qui compte en XP, en
couverture musculaire et dans la double progression. Un bouton « Revenir à [exercice] » sur l'étape
qui suit immédiatement défait le journal, le compteur de séries et les XP, et ramène sur l'exercice.
Le coût est nul : rien n'est persisté en cours de séance, la sauvegarde n'intervient qu'à la fin.
Limites assumées : un seul pas, jamais depuis les étapes ultérieures, et jamais depuis le
récapitulatif, où la progression est appliquée, les XP versés, l'historique écrit et les
célébrations jouées. Le contournement existant, quitter la séance pour en relancer une, coûtait plus
cher que le défaut.

**Les flèches défilent, les signes ajustent (v1.11).**
Les quatre flèches n'étaient capturées que dans un cas, une série chiffrée en pleine séance. C'est
précisément l'écran le plus long, celui qui porte l'illustration entière, et le seul où le pavé de
saisie passe sous le pli : on ajustait une valeur invisible sans pouvoir descendre la voir, alors
que les mêmes touches faisaient défiler partout ailleurs. Elles sont rendues au défilement, et
l'ajustement passe sur `+` et `-`, pris dans leurs deux états de touche pour rester accessibles
sans Maj sur un clavier français, `=` et `+` d'un côté, `6` et `-` de l'autre. Le `6` du pavé
numérique est exclu, il est collé au `-` et un appui à côté ferait baisser la valeur sans raison
visible.
Écartée, la conservation de gauche et droite comme second jeu d'ajustement : une fois les deux
états de touche acceptés, elle n'avait plus d'argument d'accessibilité, et laisser deux flèches
défiler pendant que deux autres modifient une valeur remplace une incohérence franche par une
incohérence sournoise. Écarté aussi, le déplacement du pavé de saisie au-dessus de l'illustration :
l'ordre en place suit le déroulé réel, on lit sa cible, on règle sa charge, on regarde le dessin,
on fait la série, on saisit. Ce qui manquait n'était pas un meilleur ordre mais la possibilité de
descendre.

**Une durée affichée dit laquelle (v1.11).**
La ligne d'historique portait le temps réel mesuré, et retombait silencieusement sur la durée
choisie pour les séances sans mesure : même format, deux grandeurs. Elle porte désormais les deux,
systématiquement, « 18 min pour 15 », et annonce « 15 min prévues » quand la mesure manque.
L'horodatage, lui, était l'heure de fin, posée à l'enregistrement : deux séances enchaînées après
un abandon se lisaient dans le désordre. C'est l'heure de début qui s'affiche, déduite de la durée
réelle, sans donnée nouvelle à stocker. La date de rattachement reste celle de fin, sans cas limite
dans la plage d'entraînement de 8 h à 20 h.

**Un geste de protection doit être réversible (v1.12).**
Le repli douleur n'avait pas de retour : une fois la variante choisie, le bouton disparaissait et
seuls « Passer » et « Quitter » restaient. Ce n'était pas une décision, mais un effet de bord du
rendu conditionnel. Le précédent applicable est le palier tenu, relibérable pour la même raison :
revenir sur un geste posé par mégarde. Le retour est donc offert en permanence, sur les séries
comme sur le cardio, et il ne défait rien de ce qui a été fait. Sans série jouée sur la variante,
aucune clé `origine>repli` n'existe et la séance redevient exactement ce qu'elle était, sans trace
ni pénalité : la fausse manœuvre ne coûte rien. Avec une série jouée, elle reste au journal, reste
comptée dans le capteur de douleur, et la progression reste bloquée sur l'exercice, car le repli a
bien eu lieu. Le garde-fou est là, dans l'inscription, pas dans l'impossibilité de revenir.
Écartée, la confirmation avant bascule : elle ajoute une décision au pire moment et ne protège de
rien si on confirme de travers. Une action réversible vaut mieux qu'un garde-fou. Écartée aussi, la
restriction du retour aux seuls cas sans série jouée : elle suppose de deviner l'intention, alors
que « la gêne est passée, je finis normalement » est un cas réel. La séance allégée n'ouvre pas ce
retour, sa substitution étant volontaire et non une douleur.

**Un décompte doit rythmer l'exercice, pas seulement le mesurer (v1.12).**
Les étirements bilatéraux affichaient un bloc unique valant le total des deux côtés, 60 secondes
pour les fléchisseurs de hanche. Il fallait donc surveiller le chrono pour savoir quand changer de
côté, ce que le décompte est précisément censé éviter. Ils sont découpés en deux blocs enchaînés,
sur le motif du module cardio : temps du côté en cours affiché, bip grave à la bascule, bip aigu à
la fin, libellé du côté à travailler. Les durées en base ne changent pas, elles encodaient déjà le
total. Le premier bloc est arrondi au supérieur pour que la somme reste exacte quelle que soit la
parité. Le marquage passe par un champ `bilat` distinct et non par le champ `side` existant : pour
les répétitions `side` signifie que la cible s'applique par côté, alors que pour un étirement la
durée est un total, sémantiques inverses et piège garanti pour les éditions futures.

**La bande de volume a un plancher mobile et un plafond fixe (v1.10).**
Les deux bornes de la bande 8-16 n'ont pas la même nature. Le plancher est un seuil de
construction : il dépend de l'objectif poursuivi, donc il descend à 4 quand l'objectif devient
l'entretien, maintenir demandant nettement moins que construire à condition de garder l'intensité,
ce que fige précisément le palier tenu. Le plafond est un seuil de récupération et de rendement :
20 séries restent 20 séries que l'on construise ou non, donc il ne bouge pas. Descendre aussi le
plafond, comme envisagé sous la forme d'une bande 4-8, reviendrait à traiter 12 séries en entretien
comme une faute, alors que c'est simplement construire sans le vouloir.
La bascule est **binaire et par groupe** : un groupe passe en entretien quand tous ses exercices
tenables et déverrouillés sont tenus. Un prorata sur le nombre d'exercices tenus a été écarté, il
produirait des planchers fractionnaires illisibles et mélangerait un pourcentage global à une bande
par groupe ; et tant qu'un exercice du vivier progresse encore, le groupe est encore en
construction. Cas limite assumé : sept exercices tenus sur huit gardent le plancher à 8.
Conséquence : tenir un palier ne change pas le volume, les séries sont faites à l'identique. Ce qui
change est l'objectif, donc la référence, et non la mesure.

**L'échelle de la couverture est fixe, la mesure ne la déforme pas (v1.10).**
L'échelle valait auparavant `max(8, plus grande valeur)` : elle bougeait d'une semaine à l'autre et
ne permettait pas de voir où tombaient les bornes de la bande, c'est-à-dire sa seule raison d'être.
Échelle fixe de 0 à 24 : 8 au tiers, 16 aux deux tiers, la bande occupe le tiers central et 4 tombe
au sixième. Aller jusqu'au maximum atteignable (5 tours × 7 jours = 35) écraserait la bande sur un
quart de la largeur. Au-delà de 24, écrêtage hachuré : le chiffre exact est écrit à côté du rail,
et au-dessus de la bande le message compte plus que la valeur, personne n'ayant besoin de
distinguer visuellement 27 de 31.
Codage couleur unique pour le curseur et pour la projection : vert dans la bande, orange en dehors.
Le dégradé continu rouge-orange-vert-orange-rouge a été écarté : répété sur quatre rails il fait
beaucoup de couleur pour quatre chiffres, et son rouge à gauche contredit l'asymétrie retenue.

**Message au-dessus de la bande, rien de plus en dessous (v1.10).**
L'angle mort réel est au-dessus : une barre pleine ressemble à une réussite alors que le rendement
plafonne et que la récupération devient limitante. En dessous, la barre passait déjà en orange, et
ajouter une injonction pousse au surentraînement et fait abandonner les mauvaises semaines. Le
message porte une incise sur les jours de repos, que le volume ne mesure pas : 15 minutes six jours
par semaine donnent 12 séries, milieu de bande, sans un seul jour de repos.

**Projection de la configuration dans Couverture, et nulle part ailleurs (v1.10).**
Trois objets distincts cohabitaient dans la discussion : le référentiel (ce que veut dire 8),
la mesure (ce qui a été fait, rétrospectif sur 4 semaines) et la projection (ce que la
configuration produit, prospectif). La projection va au même endroit que la mesure, l'écart entre
les deux étant lui-même l'information : c'est l'assiduité et les séances quittées. Écartée, la
projection sous Réglages > Durée : elle existait déjà dans la card Structure de séance, la durée se
choisit sur l'accueil et non dans Réglages, et le chiffre dépend de quatre réglages répartis sur
quatre cards, donc le rattacher à une seule est arbitraire. La v1.18 a dû trancher ce dernier point
en supprimant la card Structure : le chiffre vit désormais dans Séries par exercice, le facteur qu'on
manipule, à côté des durées par option qui y étaient déjà. Écarté aussi, un résumé sur l'accueil :
le chiffre ne bouge jamais d'un jour à l'autre, une information constante affichée à chaque
lancement devient du bruit, et l'accueil promet qu'il n'y a rien à décider.
Toute valeur affichée sort de `planFor` via `weeklySets`, jamais d'une table : à 10 minutes le
cardio est toujours sacrifié pour tenir le plancher de deux tours, donc « 10 min avec cardio »
n'existe pas dans les faits et une table figée mentirait.

**Le référentiel se replie, l'état reste dehors (v1.10).**
Dans une card de données, ce qui décrit la semaine vécue reste visible et ce qui explique le
vocabulaire va dans une zone repliable, fermée par défaut. L'état ouvert ou fermé n'étant pas
persisté, une zone ouverte par défaut se rouvrirait à chaque visite de l'onglet et ne ferait jamais
gagner un seul scroll sur le trajet récurrent. Corollaire appliqué en sens inverse au détail de
séance, ouvert par défaut depuis la v1.10 : sa ligne fermée ne portait aucune valeur, donc l'état
fermé n'était pas un résumé utile mais une information cachée.

**L'allègement ne se cumule pas avec lui-même (v1.8).** Un exercice remplacé par sa variante de
repli ne reçoit pas en plus la baisse de cible : la substitution **est** l'allègement. La règle de
baisse, moins 30 % arrondi à l'inférieur avec plancher au bas de fourchette et débordement sur la
charge, ne s'applique qu'aux exercices restés en place. Remonter les répétitions après une descente
de barreau a été écarté : c'est la manœuvre de la double progression pour **conserver** l'effort,
donc exactement ce qu'un jour léger cherche à retirer.

**Un avertissement replié n'avertit personne (v1.8).** Les cards d'un onglet de données se replient
pour la lisibilité, sauf celles qui portent une alerte : le bloc Replis douleur s'ouvre d'office dès
que le seuil est franchi. Et un onglet de données ne se replie pas entièrement : Progrès est une
destination qu'on ouvre exprès, tout fermer transformerait une consultation en fouille.

**La respiration fait partie de l'exécution, pas d'un module (v1.7).** Elle manquait entièrement
jusque-là, ce qui contredisait la promesse « rien à décider » : l'outil tranchait le tempo,
l'amplitude et la charge, et laissait la respiration au hasard. Elle est écrite dans les textes
d'exécution existants, sans champ ni affichage dédié, avec une exception : la consigne anti-apnée
des exercices tenus vit dans la ligne de vigilance, visible sans déplier, parce que le blocage en
isométrie est le seul cas à risque réel et qu'il s'aggrave à mesure que la cible s'allonge. Règle
générale : expiration sur la phase d'effort en dynamique, expiration allongée sur les étirements,
jamais de blocage recommandé nulle part. Toute fiche nouvelle entrant au catalogue porte sa
consigne dès sa rédaction.

**Non-interférence entre emplacements voisins : critère de sélection, pas règle d'exécution (v1.6).**
Dans un circuit alterné, la charge secondaire d'un exercice ne doit pas tomber sur le groupe qui
travaille juste après, sinon l'argument de récupération qui a fait choisir l'alterné contre le PPL
s'érode. Audit des quatre transitions : deux interférences réelles. Tiré vers jambes par la
préhension (six des huit exercices tirés sont limités par les avant-bras, trois des sept exercices
jambes sont chargés en préhension, pire paire tractions puis swings) ; jambes vers gainage par les
érecteurs du rachis (soulevé roumain et swings contre planche et gainage latéral). Les deux autres
transitions sont propres, la planche étant sur les avant-bras. Aucune règle d'exclusion à
l'exécution : elle écarterait le kettlebell des jambes dans la majorité des séances, là où se
trouve la charge, pour un effet de second ordre que les transitions chronométrées amortissent. Le
critère s'applique à la sélection de tout nouvel exercice entrant dans un vivier, sans mécanisme à
maintenir. Premier refus sur ce critère : mollets debout à l'élastique (charge sur mains et
épaules, entre le tiré et le poussé).

**Ordre du circuit : quatre adjacences, pas trois (v2.7).**
L'audit de la v1.6 examinait les transitions comme une file : poussé vers tiré, tiré vers jambes,
jambes vers gainage. Il en manquait une. Le circuit est **circulaire**, les séries s'enchaînent en
tours et le dernier exercice d'un tour précède le premier du tour suivant. Quatre adjacences donc,
et **six ordres distincts** et non vingt-quatre, trois seulement si l'on traite le conflit comme
symétrique, ce qu'il est au premier ordre : deux exercices qui se disputent une ressource se
gênent quel que soit celui qui passe devant.

Modèle retenu pour mesurer, emprunté à un rapport externe audité en septembre 2026. Trois niveaux
de sollicitation : **stabilisation de fond**, à ignorer pour l'organisation du circuit ;
**sollicitation secondaire notable**, à surveiller si l'exercice voisin vise la même ressource ;
**facteur limitant potentiel**, interférence réelle. Le critère n'est pas « ce muscle
participe-t-il », mais « cette sollicitation réduit-elle sensiblement la performance, la technique
ou la sécurité de l'exercice voisin ». Sans ce garde-fou l'analyse dégénère : presque tout exercice
bien exécuté demande du gainage, et aucun circuit alterné ne serait possible.

Quatre ressources d'infrastructure, et quatre seulement : **préhension**, **épaule et ceinture
scapulaire**, **fléchisseurs du coude**, **érecteurs du tronc**. Le « maintien de charge devant »
n'est pas une ressource, c'est la somme des trois premières, et le compter à part compte deux fois
le même fait sur le goblet squat, qui est précisément le cas à décrire.

Mesure sur toutes les combinaisons des viviers, deux états de verrous et deux hypothèses sur
l'enchaînement poussé vers tiré, script `ordre-circuit.js` consigné à l'outillage. L'ordre
d'origine, poussé tiré jambes gainage, sortait **cinquième sur six** dans le modèle de base, et le
restait sur 254 des 256 jeux de marqueurs testés : ce rang ne dépend pas du réglage de la table.
Le classement bascule en revanche sur une seule question, l'enchaînement poussé vers tiré est-il une
interférence ou un couple agoniste-antagoniste. La v1.6 l'a jugé propre. En tenant ce jugement,
**poussé, tiré, gainage, jambes n'est derrière l'ordre d'origine dans aucun des quatre scénarios et
il est premier dans trois**, à 2,83 conflits par séance contre 3,23 à l'état mature.

Ce que l'ordre retenu fait, en clair : il supprime l'adjacence jambes vers gainage, c'est-à-dire
l'une des deux interférences relevées en v1.6, soulevé roumain ou swings avant une planche ; et il
referme le tour par jambes vers poussé, la transition la plus propre du catalogue, quatre des sept
exercices jambes ne chargeant rien du haut du corps.

**Un ordre constant, jamais calculé par séance.** Le gain d'un choix optimal séance par séance sur
la meilleure constante vaut 10 % à l'état de départ et 14 % à l'état mature. Il coûterait une table
de marqueurs sur vingt-neuf positions à tenir à jour à chaque entrée au catalogue, un score, et un
ordre qui change tous les jours dans la séance, le détail de séance et le carrousel. Même
raisonnement qu'en v1.15 pour l'instrument de couverture par muscle : une donnée constante tant que
les viviers ne bougent pas a sa place au carnet ou à l'outillage, pas dans l'outil. Surtout, un
ordre variable a un coût que le rapport ne voyait pas : avec un ordre fixe, chaque emplacement
occupe toujours la même position, donc un exercice est toujours mesuré depuis le même état de
fatigue relative et la double progression compare des passages comparables. Un ordre variable
injecte du bruit dans l'instrument qui décide des montées de charge.

**Ce que le changement ne touche pas.** Ni la sélection, ni la rotation, ni les fréquences, ni les
verrous, ni le modèle de temps : le décompte de remontages de charge vaut 2R-1 pour deux exercices
en conflit quel que soit leur rang dans le tour, chaque tour visitant les deux. L'empreinte de
neutralité le confirme, 180 lignes permutées et rien d'autre.

**Ce qui reste ouvert.** Le verrouillage de phase apparie systématiquement le goblet squat et la
planche, six fois sur six, soit les deux exercices qui, hors du haut du corps, chargent le plus
l'épaule et les bras. Aucun ordre ne sauve ce quatuor. C'est le chantier 1 de la file d'attente, et
cette mesure lui donne un motif de plus.

**Le problème d'origine, à lire avant tout le reste.** Ce n'était pas « l'épaule », c'était une
**paire** : élévations latérales, dans le vivier poussé, puis face pulls, dans le vivier tiré. Deux
exercices d'isolation d'épaule que l'ordre v2.7 rendait adjacents, avec 25 s entre eux. Constaté par
Gabriel, pas déduit. Fréquence mesurée sur le tirage réel : 1 séance sur 3 avant le déphasage v2.8,
**1 sur 9 après**. Les 67 % et 80 % qui suivent sont des chiffres de modèle, calculés sur une table de
jugement ; ce ne sont pas des observations.

**Révision de cette mesure (v2.10).** Deux défauts, trouvés à l'audit du 10 septembre 2026.

*Défaut de rapport.* `conflits(a,b)` étant symétrique, les six ordres forment trois paires miroir
aux jeux d'arêtes identiques. Recompté en traitant les minima, l'ordre v2.7 est meilleur **seul dans
0 cas sur 256**, toujours à égalité avec son miroir. Le « meilleur des six » était un ex æquo parmi
trois structures. La décision restait valable ; ce qu'elle démontrait était plus faible que ce qui
était écrit ci-dessus.

*Prémisse fausse.* Les quatre emplacements ne sont pas indépendants sur l'épaule. Mesuré sur les 450
quatuors de l'état de départ : au moins un poste marqué épaule 3 dans **100 %** des cas, deux ou
plus dans 68 %, trois ou plus dans 23 %, moyenne 1,93 sur 4. La prémisse est vraie pour les jambes,
à peu près vraie pour le coude et la préhension, fausse pour l'épaule.

**Ordre retenu en v2.10, conservé en v2.11 : poussé, jambes, tiré, gainage.** Ce qu'il fait, et
c'est tout le lot : il sépare les deux exercices d'isolation d'épaule. Un poste jambes entre poussé
et tiré dans le tour, un poste gainage entre tiré et poussé au raccord. **Dans les deux sens, à
chaque tour, à chaque séance.** Mesuré sur les durées réelles de série : l'intervalle passe de 25 s à
**52 à 112 s** selon l'exercice intercalé, contre 60 à 90 s de récupération deltoïdienne visée. À
coût nul, avec un ordre constant, donc sans rien coûter à la comparabilité de la double progression.

**Troisième défaut de mesure, trouvé à l'audit externe du 11 septembre (v2.11).** L'instrument
comptait les quatre adjacences du circuit à poids égal. Or une séance à R tours contient **3R
adjacences intra-tour et seulement R-1 raccords**, aucun repos n'étant émis après la dernière série.
Le compte « /4 » n'est exact qu'à la limite R infini. Recompté par séance :

| R | v2.7 | v2.10 | delta ordre |
|---|---|---|---|
| 2 | 2,65 | 2,27 | **-0,39** |
| 3 | 4,08 | 3,80 | **-0,28** |
| 4 | 5,51 | 5,33 | **-0,17** |
| ∞ | 1,43 | 1,53 | +0,10 (l'ancien instrument) |

**L'ordre seul est donc un gain, pas une régression**, à tous les nombres de tours réellement joués.
La phrase « l'ordre seul est une régression mesurée » écrite ici en v2.10 était fausse, et l'entrée
« livrer l'ordre seul, réfuté par la mesure » du tableau des abandons a été retirée : c'est la
solution livrée. C'est le même défaut de rapport que celui corrigé sur la v2.7 trois paragraphes
plus haut, reproduit dans le lot qui le corrigeait. L'instrument de référence est désormais
`seuil-r.js`, pondéré par R.

Toujours inchangé : la sélection, la rotation, les fréquences, les verrous, le modèle de temps.
`SLOT_PHASE` reste déclaré et non dérivé du rang dans `SLOT_ORDER`, ce que `test37.js` vérifie par
une assertion dédiée : c'est ce qui garantit qu'un changement d'ordre ne déplace jamais la rotation
en silence.

**Pause au raccord de tour (v2.10).**
Le circuit est circulaire : le dernier exercice d'un tour précède le premier du tour suivant, et
cette quatrième adjacence est la seule où une longue pause s'insère sans casser la structure. En
poussé, jambes, tiré, gainage, elle porte gainage vers poussé, c'est-à-dire exactement le conflit
résiduel que le changement d'ordre crée.

**Conditionnelle à une liste de paires nommées (v2.11).** La v2.10 la posait à **tous** les raccords.
C'était une erreur, sur trois plans à la fois :

- elle réparait une adjacence, gainage vers poussé, que **personne n'avait signalée**, déduite d'une
  table de marqueurs qui est un jugement, vit hors application, et n'a jamais été confrontée au
  journal. C'est l'exact contraire du principe d'architecture en tête de cette section ;
- son objection à la version conditionnelle, « elle figerait un jugement dans l'outil », s'appliquait
  tout autant à elle-même : `PAUSE_TOUR=60` fige le jugement « le raccord conflictue » dans une
  constante. Ce qui était évité, c'est la table, pas le jugement ;
- elle réinjectait 90 s de temps mort par séance de trois tours dans un format dont la raison d'être,
  écrite plus haut, est de supprimer le temps mort et non de le subir.

Le dilemme posé en v2.10, « table de marqueurs promue au catalogue ou rien », était faux. Une liste
de paires que Gabriel a **constatées** a le même statut que `SLOT_ORDER` : une décision écrite dans le
code, sans table, sans migration, sans donnée persistée. C'est `PAUSE_RACCORD_PAIRS`, et elle est
restée **vide** jusqu'à la v2.18. Elle ne s'alimente pas d'un calcul mais d'un ressenti, qui est la seule source d'information
que l'outil n'a pas et ne peut pas avoir.

**60 s.** La pause remplace la transition au raccord, puis vient l'installation, modélisée à 10 s,
soit environ 70 s d'intervalle réel. Le choix de 60 plutôt que 90 est un choix de **coût**, +1,5 min
contre +2,5 min sur une séance à trois séries, sur une contrainte déjà dépassée. Ce n'est pas un
plafond physiologique : se reposer plus longtemps que nécessaire ne dégrade rien, sauf le temps. La
justification par « au-dessus de la bande » écrite en v2.10 était fausse et a été retirée.

**Constante et non réglable.** La durée n'est pas ce qui se décide séance par séance. Ce qui se
décide, c'est où elle se pose, et c'est la liste.

**Rien après le dernier tour.** Il y a `R-1` raccords dans une séance. Aucun poussé ne succède au
dernier tour, la pause y perdrait son objet.

**La sortie reste ouverte.** « Passer au suivant » subsiste, au même endroit et sous le même nom, et
l'espace le déclenche comme sur toute transition. L'outil ne peut pas observer si l'épaule a
récupéré, principe d'architecture en tête de section. Il déplace seulement l'emphase : sur une pause,
le bouton n'est plus l'action principale, et l'écran n'en a donc plus aucune, ce qui est exactement
ce qu'il prescrit. Le pourquoi est écrit sur l'écran, replié, lisible avant d'appuyer et non après.
Aucune confirmation : il n'y a plus aucun dialogue nulle part.

**Coût mesuré.** Transition à 15 s : +45 s par raccord, soit +1,5 min à trois séries et +2,25 min à
quatre, sur les seules séances où une paire est nommée. Liste vide, coût nul : une séance à trois
séries, échauffement complet et étirements, vaut 15 min, contre 16,2 sous la v2.10 inconditionnelle.

**L'adjacence qui reste.** Après la v2.11, `tiré > gainage` est la seule arête chaude du circuit,
40 % à l'état de départ et 47 % à l'état mature, inchangée depuis la v2.7 et jamais nommée jusqu'ici.
C'est le prochain candidat si un jour Gabriel signale une gêne à cet endroit. Aucune action tant que
rien n'est signalé : c'est exactement l'erreur que la v2.10 a commise.

**Ce que la liste vide coûte si le modèle avait raison.** 1,60 conflit d'épaule par séance à trois
tours, sur l'instrument pondéré. C'est un pari assumé : le modèle n'est pas observé, et le principe
d'architecture dit de ne pas décider sur ce qu'on n'observe pas. Le pari se perd proprement, en
nommant une paire le jour où Gabriel en ressent une.

**Première paire constatée (v2.18).** Le 15 septembre 2026, quatuor développé au sol, goblet squat,
tractions assistées en pronation, gainage latéral. Développé puis squat, aucune gêne. Au raccord,
gainage latéral puis développé : épaules en feu, haltères difficiles à stabiliser, trajectoire
difficile à contrôler. Ce sont les signes d'une coiffe et de fixateurs de l'omoplate fatigués plus
que d'une limite des pectoraux. L'hypothèse est de Gabriel : un enchaînement qui sollicite la coiffe
sur trois postes de suite, la traction bras au-dessus de la tête, le gainage en appui sur
l'avant-bras, bras à 90° du tronc sous le poids du corps, puis le développé aux haltères, qui demande
une stabilisation continue. Au réglage de 5 s de transition, le développé reprenait après plus de
deux minutes de travail d'épaule quasi continu.

- **Entrée nommée : `gainage-lateral>developpe-sol`.** La pause va au raccord et non sur
  tiré > gainage, l'arête que le paragraphe « L'adjacence qui reste » désignait : c'est le
  développé qui a souffert, pas la tenue, et c'est la victime qui dit où la pause se pose.
- **Le successeur est nommé avec lui**, `gainage-lateral-jambe-levee>developpe-sol`, seule entrée
  qui ne vienne pas directement d'un ressenti. Même appui, charge d'épaule au moins égale, et son
  déblocage retire le gainage latéral du tirage. Le déblocage est tombé pendant la séance même du
  constat, 49, 48 et 48 s : sans cette entrée, la liste aurait été morte dès sa livraison, et la
  première occurrence de la paire, à la troisième séance à venir, se serait jouée sans pause. Règle qui en
  découle, dérivée du catalogue et vérifiée par `test45` : **une paire nommée sur un exercice qui a
  un successeur par retrait nomme aussi ce successeur, devant le même poussé.** Validé par Gabriel.
- **Aucune paire par analogie.** Pompes après le gainage latéral, planche ou autre gainage avant le
  développé : même mécanisme plausible, rien de ressenti. Décision de Gabriel : attendre d'y tomber.
  C'est la leçon de la v2.10, appliquée cette fois avant l'erreur.
- **60 s conservées.** Décision de Gabriel : commencer court et allonger si ça ne suffit pas, le
  sens le plus simple. L'issue est incertaine, la fatigue cumulant deux postes. Si la gêne revient
  malgré la pause, le levier suivant n'est pas la durée mais la composition des viviers, voir la
  recomposition du vivier poussé et le cinquième mini-poste en section 5.
- **Fréquence sur le tirage réel**, état exporté le 15 septembre : 10 séances sur 150, soit 1 sur 15
  comme le modèle, développé 1/3 × gainage latéral 1/5. Mais **groupées** : la troisième et la
  sixième séance à venir après le constat, puis la trente-neuvième et la quarante-deuxième. Le déphasage
  ne répartit pas une paire uniformément dans le temps.
- **Coût réel.** La pause remplace la transition du raccord : au réglage de Gabriel, 5 s, elle ajoute
  55 s par raccord et non 45, soit +110 s à trois séries, sur ces séances seulement. Le paragraphe
  « Coût mesuré » raisonnait au défaut de 15 s.
- **Le journal ne tranche pas seul.** Développé à 9 kg ce jour-là : 15, 12, 12, la forme attendue
  d'une chute aux tours 2 et 3. La même forme figure le 21 août à 6 kg derrière un pallof press : une
  première série très au-dessus de la fourchette, en calibration, suffit à la produire. C'est le
  ressenti, stabilité et trajectoire, qui a désigné la paire, conformément à la section 6.
- **La table de marqueurs rencontre un ressenti pour la première fois, et concorde** : gainage
  latéral et développé y valent tous deux épaule 3, somme 6 pour un seuil de 5. Une concordance ne
  valide pas la table, elle ne la contredit pas. « Développé puis squat sans gêne » ne dit rien du
  goblet squat comme agresseur, le squat n'étant pas une victime d'épaule : c'est le défaut de
  direction déjà noté aux points ouverts. Et la table ne connaît pas les tractions en pronation.
- **Deux textes rendus visibles pour la première fois par la liste.** La ligne de Réglages
  vouvoyait, seule occurrence de toute l'application : tutoiement. Le message replié de l'écran de
  pause datait de la v2.10 et disait le raccord « seule adjacence où l'alternance ne repose rien »
  et la minute « ce qu'il faut », deux affirmations retirées de ce carnet en v2.11. Il dit
  désormais que la pause est posée sur un enchaînement signalé, sans chiffrer de besoin.
- **Fiches.** Les deux gainages latéraux portent une ligne « Épaules » : pousser le sol avec
  l'avant-bras, garder l'épaule loin de l'oreille, ne pas s'affaisser dedans ; sur la version au
  sol, la version genoux allège aussi l'épaule. Elle manquait, alors que la table les marque
  épaule 3 et que la contrainte cou et épaules est structurante.

**Déphasage des quatre viviers (v2.8).**
Les quatre compteurs valant toujours le même entier, le tirage était déterminé par un seul nombre :
25 combinaisons distinctes sur les 375 possibles, et des paires rigides, goblet squat toujours avec
planche, élévations latérales toujours avec face pulls, mollets debout toujours avec dead bug. Ce
n'était pas une décision mais une conséquence, jambes et gainage comptant cinq entrées chacun.

**Écarté d'abord : décaler les valeurs de départ des compteurs.** Les indices resteraient la même
fonction affine du numéro de séance, les paires resteraient donc rigides et seule leur identité
changerait. Il faut que les indices cessent d'être cette fonction.

**Retenu :** un décalage supplémentaire au passage de chaque tour de vivier,
`idx = (c + k*floor(c/n)) % n`, appliqué en lecture seule. Le compteur n'est jamais touché, donc
aucune migration, et la garantie de la v2.0 tient, un retour au profil précédent reprend la rotation
où elle en était. Chaque tranche de `n` tirages alignée sur un tour de vivier reste une permutation
du vivier : la fréquence de chaque exercice ne bouge pas d'un iota, mesuré à écart nul sur les quatre
viviers.

Les valeurs de `k` valent 0, 1, 2, 3 sur poussé, tiré, gainage, jambes, et non sur l'ordre du
circuit, qui est autre depuis la v2.10. Elles sont **déclarées dans
`SLOT_PHASE` et non dérivées du rang dans `SLOT_ORDER`** : les deux décisions doivent rester
séparables, un futur changement d'ordre du circuit n'a pas à déplacer silencieusement la rotation.
Mesure sur 900 séances, trois jeux comparés : celui-ci atteint les **375 quatuors possibles, soit le
maximum arithmétique**, les 25 paires jambes plus gainage et les 15 paires poussé plus tiré, et il
est le seul dont aucun vivier ne redonne le même exercice deux séances de suite. `k` nul sur le
poussé laisse intacte la rotation du plus petit vivier, là où l'irrégularité se verrait le plus.

**Correction v2.10 : cette promesse de couverture est exacte et pratiquement vide.** Les périodes
des quatre compteurs valent 3, 49, 25 et 25, soit un PPCM de 3675 séances, c'est-à-dire 23,6 ans à
trois séances par semaine. Ce qui se referme en temps utile est la couverture des **paires**, de
l'ordre de l'année. C'est elle qu'il faut lire dans les mesures de `test35.js`, pas le nombre de
quatuors.

**La garantie échangée : le carrousel promet l'exactitude et non plus l'exhaustivité.** La fenêtre
valait autant de panneaux que le plus gros vivier, et chaque exercice tirable y figurait au moins
une fois quel que soit le point de départ. Cette promesse et le déphasage sont **mathématiquement
exclusifs** : que toute tranche glissante de `n` tirages porte les `n` exercices équivaut à une
suite de période `n`, et deux suites de période 5 sur jambes et gainage redonnent les cinq paires
rigides que l'on cherche à supprimer. Mesuré, tenir les deux aurait demandé onze panneaux au lieu de
six. Choix fait en connaissance : six panneaux exacts valent mieux que onze panneaux exhaustifs,
l'exhaustivité n'ayant jamais été un engagement consommé par l'utilisateur, seulement une
conséquence de la rigidité que l'on supprime. `test23.js` est amendée en conséquence et teste
désormais l'exactitude de chaque panneau, propriété plus forte et réellement promise.

Effet mesuré sur les paires nommées ci-dessus, sur 900 séances : le goblet squat sort avec la
planche 36 fois et avec autre chose 144 fois, les élévations latérales avec les face pulls 100 fois
et avec autre chose 200 fois. Aucune prescription ne change : sur l'empreinte de neutralité, les 26
lignes structurelles sont identiques et **aucun exercice ne voit sa cible, sa bande ou sa charge
bouger**, seul l'appariement des exercices dans la séance est différent.

**Cardio en fin de séance, jamais au début, et lucidité sur sa portée.**
Faire le renforcement avant l'endurance préserve la force. 4 minutes quatre fois par semaine ne
remplacent pas les 150 minutes hebdomadaires d'activité modérée recommandées : le vrai volume
aérobie doit venir de la marche, du vélo, des escaliers, pas de l'outil.

**Repos en mode ciblé : 45, 60 ou 90 secondes, arbitrage assumé par l'utilisateur. Caduc en v1.18.**
Les repos longs donnaient un peu plus de muscle mais rallongeaient la séance, et l'écran de réglages
affichait la durée recalculée pour chaque choix. Ce réglage ne portait que sur les séries d'un même
exercice, ce que la structure alternée ne produit jamais : il disparaît avec le mode ciblé, et
`state.rest` avec lui. Le seul temps réglable entre deux efforts est désormais la transition du
circuit, de 5 à 30 s.

**Objectif hebdomadaire compté en jours actifs, pas en séances.**
Plusieurs séances le même jour comptent pour un seul jour envers l'objectif ; elles gardent leur XP
et alimentent les statistiques de volume. L'objectif mesure la tenue de l'habitude, et sa valeur
vient de la répartition dans la semaine : 4 séances tassées sur 2 jours ne valent pas 4 jours actifs.
Semaine ISO, lundi-dimanche, bascule à minuit (plage d'entraînement 8 h - 20 h, aucun cas limite).

**Semaine tronquée : objectif au prorata des jours disponibles (v1.3).**
Une semaine dont la première séance suit une semaine entièrement vide n'a pas offert sept jours
pour tenir le rythme : la juger sur l'objectif nominal transforme un démarrage ou une reprise en
échec mécanique. Son objectif devient `objectif × jours disponibles ÷ 7`, arrondi au supérieur,
plafonné à l'objectif nominal, minimum 1. Avec un objectif de 4 : dimanche 1, samedi 2, vendredi 2,
jeudi 3, mercredi 3, mardi 4, lundi 4. Le même déclencheur couvre le démarrage et toute reprise
après un arrêt, sans notion supplémentaire.
Écartée, la règle « objectif = jours restants » : elle exige 100 % de présence sur la semaine
tronquée alors que l'engagement est de 4 jours sur 7, et elle punit une donnée retrouvée (une
séance récupérée en amont augmente l'objectif et peut invalider une semaine déjà tenue).
Le calcul se fige sur la première séance de la semaine : tant qu'aucune séance n'a eu lieu,
l'objectif nominal reste affiché, sinon attendre ferait baisser la barre tout seul.
Les semaines d'arrêt restent comptées comme non validées (sinon la statistique d'assiduité
afficherait 100 % en permanence) et le streak repart de 1 à la reprise. Une pause déclarée par
l'utilisateur, qui neutraliserait ces semaines et suspendrait le streak, est écartée tant que le
besoin est hypothétique.
La semaine en cours n'entre dans le ratio semaines validées / écoulées qu'une fois validée : sinon
le compteur afficherait un déficit du lundi au dimanche pour une semaine non encore jouée.

**Une séance quittée en cours de route est enregistrée, pas perdue.**
Les séries validées sont sauvegardées, la séance est marquée incomplète, sans bonus de fin ni
avancement de la rotation (on retrouve les mêmes exercices à la séance suivante). Avant la v1.1,
quitter ne sauvegardait rien : c'est la cause identifiée des « pertes de progression » constatées,
et non le localStorage. Sans ces séances, temps total et couverture mentiraient par omission.

**Lestage : pas de moteur générique, une marche suivante propre à chaque exercice.**
Exploration faite exercice par exercice, elle prime sur le choix d'un outil :
- squat : la charge devant (goblet, kettlebell plus lourde, deux haltères) fait contrepoids et
  réduit le moment lombaire ; un gilet ferait l'inverse. Progression = KB 16 kg, pas de gilet.
- pompes : élastique dans le dos (résistance croissante, zéro charge vertébrale, réglage fin)
  ou pieds surélevés à hauteur modérée. Le gilet vient après ces deux marches.
- lestes de chevilles : mollets debout, step-ups, appoint fin sur tractions. Jamais sur bird-dog
  ni dead bug (allongement du levier, couple direct sur L5), jamais sur le cardio (impact).
- sac à dos / gilet lesté : pertinent quand pompes surélevées et tractions strictes satureront, pas avant.
Conséquence code, appliquée en v1.2 : chaque exercice plafonné porte sa marche suivante réelle
(`next` dans la base), affichée au plafond à la place de l'ancien message générique qui annonçait
une variante parfois inexistante. Correction associée : mollets debout SANS lestes de chevilles
(biomécanique nulle, le lest pend sous le mollet), la marche est une jambe puis haltère en main.

**Bandes élastiques : échelle ordinale, sens propre à chaque exercice (v1.2).**
Les bandes ne sont jamais converties en kilogrammes. Chaque exercice à bande a son échelle du plus
facile au plus dur : en résistance (face pulls, tirage doux, rowing élastique, pallof), progresser
= monter vers la bande plus forte ; en assistance (tractions assistées, départ bande noire),
progresser = descendre vers la bande plus faible. Les pompes ont un barreau zéro « sans bande »
puis l'élastique dans le dos. La double progression s'applique telle quelle : toutes les séries en
haut de fourchette = barreau suivant, cible au bas ; effondrement sous le bas = barreau précédent.
L'ajustement manuel en séance est persistant, comme les répétitions ; le bouton « + » va toujours
vers le plus dur, quel que soit le sens. Barreau courant photographié dans l'historique avant
progression. Pas de combinaisons de bandes pour l'instant : barreaux ajoutés en réaction, pas en
anticipation. Pas de migration de l'historique tractions antérieur (les bandes d'avant sont
inconnues).

**Exercices à charge fixe mécanisés par les lestes (v1.2).**
Goblet, soulevé roumain et swings : KB 10 kg + lestes aux deux poignets, échelle 10/12/14/16 kg.
Rowing kettlebell : chaîne continue 10/11/12/13 (leste au poignet travaillant), bascule sur haltère
seul (échelle mono jusqu'à 17), puis leste par-dessus jusqu'à 20 kg. Sommets honnêtes : goblet =
sac lesté devant ou KB 16 ; soulevé roumain et swings = plafond du matériel actuel ; vigilance
scratchs sur les swings (balistique). Retrait d'un leste ou d'une bande dans les réglages : les
charges retombent sur un barreau existant, le dernier barreau de bande est protégé.

**Déblocages recalibrés sur une série, pas sur un total (v1.2).**
`best` mesure la meilleure série : les anciens seuils (36, 30) étaient inatteignables. Soulevé roumain et swings se
débloquent à une série de 15 (les dips aussi, jusqu'à leur retrait en v1.6). Les tractions strictes exigent 10 répétitions
réalisées avec la bande la plus faible de l'inventaire (`bandGate` : compteur `bandBest` remis à
zéro à chaque changement de barreau, sinon un record obtenu avec une grosse bande suffirait).

**Statistiques : peu de chiffres, dans la vue Progrès, pas de cinquième onglet.**
Assiduité (première séance, jours actifs, semaines validées/écoulées, histogramme 12 semaines),
temps (réel vs choisi, totaux semaine et mois), trajectoire des charges (premier point vs dernier,
avec dates), couverture musculaire (séries/semaine par groupe sur 4 semaines, bande visée
dessinée sur échelle fixe, alerte sur le groupe en retrait et sur le groupe au-dessus de la bande,
ratio tiré/poussé pour les épaules), replis douleur (v1.5). Chaque bloc
s'efface proprement quand l'historique est vide. Écarté : records claironnés, « meilleure semaine »
(streak déguisé).

**Une moyenne ne se calcule que sur des semaines observées et terminées (v1.5).**
Deux règles, une seule raison. La semaine en cours sort du calcul : entamée n'est pas jouée, et
l'inclure fait plonger la moyenne chaque lundi matin, même pour un utilisateur établi. Le
dénominateur est borné aux semaines révolues depuis la première séance : diviser par la fenêtre
nominale revient à moyenner sur des semaines où l'outil n'existait pas (une séance un dimanche
affichait « 0,3/sem sur 4 semaines »). Tant qu'aucune semaine n'est révolue, la ligne disparaît
plutôt que d'afficher un chiffre : il n'y a rien à moyenner. Même principe que `weeksElapsed`, qui
excluait déjà la semaine en cours non validée du ratio de semaines.

**Les replis douleur se lisent par fréquence, pas séance par séance (v1.5).**
Le repli était journalisé depuis la v1.1 mais visible une seule fois, au récapitulatif. Ce qui a
une valeur d'usage n'est pas le repli isolé, qui est un mauvais jour, mais sa répétition sur un
même exercice d'origine. D'où un bloc de statistiques « Pompes sur poignées : 2/7 passages » sur
4 semaines glissantes, aligné sur la fenêtre de la couverture musculaire, et placé juste sous elle
puisque son alerte dit littéralement « vérifie les replis ». Alerte au-delà d'une fois sur deux,
renvoyant vers un avis kiné plutôt que vers un repli supplémentaire. Le drill-down ponctuel passe
par les dernières séances, devenues dépliables.

**Cards repliables : la ligne fermée porte la valeur, pas le titre (v1.5).**
Réglages comptait douze cards toutes ouvertes, dont Matériel à lui seul une quinzaine de lignes.
Les paragraphes de justification sont une qualité à la première lecture et un coût de scroll à
toutes les suivantes. Le motif retenu est `<details class="card">` natif : clavier et
accessibilité gratuits, aucun état JS, fermé par défaut, état non persisté. Le raffinement qui le
rend rentable est que l'en-tête fermé affiche la valeur courante (« Repos entre séries · 60 s ») :
l'état complet de la configuration se lit sans un clic, on n'ouvre que pour modifier. Appliqué
aussi aux Badges, où l'état fermé montre les badges obtenus et le compteur. Non appliqué là où
l'œil veut parcourir : accueil, fiche exercice, listes de la bibliothèque et des repères. Le motif
ne vaut que quand l'état fermé est un résumé utile.

**Ordre des cards par fréquence d'usage (v1.5).**
Réglages : Données (export quotidien), Objectif hebdomadaire, Séries par exercice, puis le bloc qui
façonne le contenu de la séance (Échauffement, Cardio, Étirements), puis Sons, Transition (hors
défaut), Entretien (interrupteur pour dans plusieurs mois), Matériel et Thème en fin. La card
Structure de séance, qui vivait dans ce bloc, disparaît en v1.18 : son argument passe dans la card
du bas, son chiffre dans Séries par exercice. Progrès : Niveau, Dernières séances, Assiduité, Couverture, Replis, Temps, Trajectoire,
Repères, Badges. Date du dernier export affichée dans l'en-tête fermé de Données, écrite après
coup et donc absente du fichier exporté.

**La bibliothèque sert la recherche d'un exercice précis, pas le balayage (v1.5).**
Position initiale révisée : une liste de 36 noms nus est lente dès qu'on cherche un exercice
donné. Lignes denses à vignettes (mêmes miniatures que le détail de séance), verrous intégrés à la
ligne plutôt qu'en ligne supplémentaire décalée, et barre de recherche filtrant nom français, nom
anglais et muscles, sans accents ni casse, groupes vides masqués, remise à zéro à chaque entrée
dans l'onglet. Écartées, les chips de filtrage par groupe : la recherche et les sections couvrent
déjà les deux modes d'accès, une troisième voie serait redondante. Écartée aussi, la grille de
tuiles : les illustrations sont en deux panneaux, une tuile carrée perd le panneau d'arrivée et le
ratio natif rend la grille plus longue que la liste.

**Célébrations : une file, une carte par événement, jamais deux fois le même (v1.3).**
Les badges et déblocages tombaient dans la même pile de tags que « charge montée », donc passaient
inaperçus. Surcouche animée au récap, file dans l'ordre déblocages puis badges puis rang, deux
secondes par carte, toucher, Entrée ou Espace pour avancer, Échap ou « tout passer » au-delà de
trois cartes. Réservée aux événements rares : jamais pour une montée de charge, ni pour chaque
niveau, seulement pour les paliers de rang (niveaux 3, 5, 8, 10, 13, 16). Fusion obligatoire aux
niveaux 5 et 10, où les badges `lvl5` et `lvl10` désignent déjà le rang atteint : on montre le
badge seul. La surcouche consomme la première pression de touche, sinon la même pression
enchaînerait l'animation et le retour à l'accueil. `prefers-reduced-motion` donne une version
statique.

**Un plafond sans marche suivante n'est pas un plafond, c'est une impasse (v1.17).**
Planche et gainage latéral avaient un plafond égal à leur haut de fourchette : leur cible ne montait
jamais au-delà, et rien ne prenait le relais. Deux successeurs isométriques sont construits, planche
sur ballon et gainage latéral jambe levée, chacun derrière un verrou à deux séries au plafond. Le
plafond des tenues au sol descend en même temps de 60 à 45 s. La raison n'est pas de faciliter le
déblocage mais de refuser un levier qui n'en est pas un : au-delà d'une minute, une tenue plus
longue ajoute de la durée de séance et de l'endurance posturale, pas du stimulus, et McGill le dit
depuis longtemps. Le levier de progression devient la variante, comme sur les tractions. Un ballon
gonflé ferme rend la tenue instable sans ajouter de flexion de colonne : c'est le gonflage qui fixe
le cran, un ballon mou rend l'exercice plus facile et non plus dur. La jambe levée retire un appui
sur trois sans rien changer d'autre à la position. *Correction v2.19 : phrase fausse. Jambes
serrées, comme le dit la fiche de base, la position n'a que deux appuis au sol, l'avant-bras et le
pied du dessous ; lever la jambe n'en retire aucun, elle fait de la jambe du dessus une charge
portée par ses abducteurs. La marche était réelle, le mécanisme écrit ne l'était pas. Le successeur
est devenu dynamique, voir « Gainage latéral avec abductions » (v2.19).* Deux conséquences chiffrées : la traversée de la
fourchette de la planche passe de huit à cinq passages, sous la bande de 8 à 14 des autres
exercices, ce qui est assumé parce que c'est l'escalier et non la fourchette qui porte la
progression au-delà ; et le vivier gainage garde cinq entrées dans les quatre états de verrous,
chaque successeur étant placé juste après son prédécesseur qu'il retire, si bien que la substitution
se fait sur place et que l'intervalle entre deux passages de gainage ne bouge jamais.

**Le filet de sécurité juge le passage, pas la série (v1.15).** La montée exige que toutes les
séries atteignent le haut de fourchette ; la descente exige que toutes soient sous le plancher, à
borne stricte, le plancher atteint étant une réussite dans la fourchette et non un échec. Le
critère se déplace donc de la série vers le passage : `[15, 15, 7]` descendait et ne descend plus,
`[9, 9, 9]` ne descendait pas et descend désormais. Ce n'est ni un assouplissement ni un
durcissement. La mesure a tranché : sur les sept premières séances réelles, dix
lectures exploitables avaient leur maximum exactement au plancher, qu'une borne large aurait toutes
rétrogradées chez quelqu'un qui n'a jamais échoué une série ; cinq passages de plus étaient dans ce
cas sur des séances allégées ou quittées, qu'aucune borne n'aurait touchées. Aucun passage n'est
jamais tombé sous le plancher. La constante `bas − 2` disparaît sans remplacement.

**L'information passe toujours, l'action est conditionnée (v1.15).** Trois choses empêchent la
descente sans empêcher le signal : la grâce du premier passage suivant une montée, une lecture
partielle, et l'absence de barreau inférieur. Ce dernier cas est le nominal et non le rare : les
neuf exercices concernés sont aujourd'hui à leur fourchette d'origine. La descente exige une lecture
complète parce que le prédicat porte sur toutes les séries : sur un journal amputé, il affirmerait
de deux séries ce qu'il devait affirmer de trois, et deviendrait d'autant plus sévère que le
journal est court.

**Un état que le programme peut atteindre, il doit pouvoir en sortir (v1.15).** Une fourchette
relevée d'un cran de trop était définitive sur neuf exercices au poids du corps : aucune descente
automatique, aucun levier manuel, le palier tenu figeant la cible sans rendre la fourchette. Elle
redescend d'un pas, plancher à la fourchette d'origine, miroir exact de la montée. Le même examen a
montré que planche et gainage latéral ont un plafond égal à leur haut de fourchette : leur
fourchette ne monte jamais, ils sont hors sujet, mais ils n'avaient pas non plus de marche suivante
outillée. Ce cul-de-sac est fermé en v1.17, les quatre tenues de gainage plafonnent désormais à 45 s
et deux successeurs prennent le relais.

**Un verrou prouve une capacité actuelle, jamais un maximum historique (v1.15).** `best` n'est
corrigé par aucun chemin de l'outil, et une valeur fausse a été constatée en usage. Les déblocages
lisent le dernier passage. Le compte exigé est plafonné par le volume de la séance : à deux séries,
« trois séries de six » était arithmétiquement irréalisable et le verrou ne s'ouvrait jamais. Le
plafond porte sur le volume et non sur le nombre de séries enregistrées, sinon une séance quittée
après une série suffirait à ouvrir. L'énoncé affiché suit par un jeton, il dit ce qui est vérifié.
Et une séance allégée n'ouvre aucun verrou : un mode qui ne fait rien monter ne doit rien
déverrouiller.

**Chaque exercice ajouté à un vivier réduit la fréquence des autres, y compris quand c'est
l'escalier qui l'ajoute (v1.15).** La règle existait pour les ajouts éditoriaux, elle n'avait jamais
été appliquée aux déblocages, qui grossissaient les viviers sans filtre. Un barreau dépassé quitte
le tirage quand son successeur est débloqué, par un champ explicite sur l'exercice qui remplace : il
n'est pas reverrouillé, sa fiche et sa progression restent intactes. Conséquence chiffrée : le
vivier tiré passe de 5, 6, 7, 8 à 5, 6, 6, 6, et l'arrière d'épaule cesse de se raréfier à mesure
que les tractions se débloquent.

**La fréquence est un réglage, pas un reste de division (v1.15).** Face pulls porte une désignation
santé au carnet et se retrouvait tiré une séance sur huit une fois les tractions débloquées, avec un
rapport avant sur arrière d'épaule passant de 0,83 à 1,33 sur des épaules douloureuses. Une seconde
entrée dans le vivier tiré, placée pour donner des écarts de trois à quatre séances dans les quatre
états de verrous, ramène ce rapport à 0,78. Le mécanisme est la duplication d'une entrée et non un
champ de pondération, parce que c'est le placement qui commande l'espacement. Il ne se justifie que
par le mandat santé : sans lui, la porte serait ouverte à pondérer n'importe quoi.

**On corrige après, parce qu'on ne peut pas corriger pendant (v1.15).** La correction porte sur les
valeurs de séries de la dernière séance, tant qu'aucune autre n'a démarré. Ni ajout ni suppression :
le nombre de séries reste invariant, donc les XP, les badges de séance, la rotation, la couverture
et les jours actifs ne bougent pas. Un instantané pris avant la progression est restauré puis
rejoué, avec le volume et le mode de la séance corrigée et non les réglages courants : rien n'est
défait champ par champ, ce qui évite d'oublier une dépendance. L'instantané n'est pas repris après
coup, la correction reste donc corrigeable, toujours depuis le même point de départ. La retouche
manuelle du JSON reste écartée, et l'épisode qui a motivé cette décision en donne la démonstration :
corriger `sets` sans corriger la cible fabrique une incohérence silencieuse.

**Un retrait ne doit jamais orpheliner un verrou (v1.15).** Un barreau retiré du tirage
n'enregistre plus rien, et un verrou qui lit son dernier passage deviendrait définitivement
infranchissable : débloquer la traction stricte supination retirait la variante assistée, dont le
verrou de la pronation lit les séries, et fermait la branche pronation pour toujours. La trajectoire
automatique n'y menait pas, un ajustement manuel de bande suffisait. Le retrait attend donc que plus
aucun verrou fermé ne lise l'exercice, condition dérivée des données et non un jugement. C'est le
cas dégénéré de la règle plus générale : un état que le programme peut atteindre, il doit pouvoir en
sortir.

**Une séance allégée ne prouve rien, et ses séries non plus (v1.15).** Interdire l'évaluation des
verrous pendant la séance allégée ne suffisait pas : `p.sets` était écrit quand même, et la séance
normale suivante lisait ce dernier passage. La provenance est marquée sur la performance, pas
seulement sur la séance. C'est la même distinction que pour le volume, où le plafond lit le nombre
de séries prévues pour l'exercice source et non le réglage courant.

**Le sens d'un changement compte, pas le changement (v1.15).** Le récapitulatif proposait « Tenir ce
palier » après une descente du filet, et l'accepter restaurait la charge d'avant descente tout en
décrémentant le compteur de montées. Un seul message par événement ne suffit pas si un second
mécanisme consomme le même événement sans le lire dans le même sens.

**Une assertion qui épingle une valeur est fausse en même temps que le code (v1.15).** Le livrable
s'est déclaré v1.14 parce que la constante et l'assertion qui la vérifiait devaient être mises à
jour ensemble : elles étaient vertes ensemble. Les assertions portent sur la forme et la cohérence,
jamais sur la valeur courante.

**Un message nomme ce dont il parle (v1.15).** Deux messages de même forme dans un récapitulatif
sont indiscernables, et les signaux sans action n'ont aucun autre point d'ancrage. Tous les messages
de progression commencent par le nom de l'exercice.

**Une série validée à zéro répétition n'est pas une série (v1.15).** Le bouton est inerte à zéro en
séance comme à la correction, « Passer » couvrant déjà le cas. La symétrie est la propriété qui
compte : l'application ne doit pas produire une valeur qu'elle ne sait pas re-saisir.

**Une durée annoncée se compare à un modèle rejoué, jamais au temps réel seul (v1.16).**
La durée annoncée est calculée sur les cibles. La comparer au temps mesuré mélange donc deux
causes : ce que le modèle représente mal, et les répétitions faites au-delà ou en deçà des cibles.
Mesuré sur le catalogue réel, vingt-deux mollets debout au lieu de quatorze coûtent 28 s par série
et 84 s sur trois, alors que l'installation, seul paramètre libre du modèle, pèse 130 s sur une
séance type. Imputer cet écart à l'installation la ferait passer de 10 à 17 s : un seul
débordement de huit répétitions sur un seul exercice suffit à ruiner l'étalonnage. Le modèle est
donc rejoué sur les valeurs saisies, et c'est le résidu qui sert de mesure.
L'implémentation applique la ligne de partage de la v1.14 à l'envers, sans rien reconstituer après
coup : chaque boucle à la seconde incrémente un compteur, donc tout ce que l'outil chronomètre
compte à sa valeur réelle, et seul ce pendant quoi aucun chrono ne tourne s'ajoute à la validation
d'une série. Une pause, un échauffement passé, une tenue refaite, un étirement sauté cessent
simplement de tiquer, sans aucun cas particulier. Propriété vérifiée par test de bout en bout sur
quatre configurations : une séance jouée exactement aux cibles, tous chronos menés à terme, donne
un modèle rigoureusement égal à l'annonce.
Le résidu n'est affiché qu'en moyenne dans Progrès, et en détail dans la séance dépliée. Pas au
récapitulatif : sur une séance isolée il est dominé par les interruptions, dont le carnet dit
depuis la v1.13 qu'elles relèvent de l'utilisateur, et un nombre bruité qui a l'allure d'une mesure
invite à le sur-lire. Écartée aussi, l'incise d'attribution au récapitulatif, « dont +1,4 min de
répétitions en plus » : celui qui vient de faire vingt-deux mollets au lieu de quatorze sait
pourquoi c'est plus long.

**La longueur de la liste dit le volume, aucune phrase ne l'explique (v1.16).**
Deux nombres veulent dire deux séries ce jour-là, quatre en veulent dire quatre. Une mention
« volume changé depuis la dernière fois » a été écartée : elle explique ce que la donnée montre
déjà. Corollaire du même principe : les séries du jour affichent toute la liste et pas seulement
la dernière valeur, parce que le moteur lit le minimum du passage pour la cible suivante et exige
toutes les séries en haut de fourchette pour la montée. La série qui décide n'est pas forcément la
dernière, et la liste est bornée à trois nombres par le plafond de volume.

**La dernière fois est du contexte, le jour est une entrée de décision (v1.16).**
Trois pastilles au maximum sur l'écran de série, donc jamais de casse de ligne dépendant de la
longueur des nombres : cible, fourchette, aujourd'hui. La dernière fois descend en ligne dessous,
parce que la cible l'encode déjà, valant la plus petite série du dernier passage plus un. Amendé en
v2.14 : la cible encode la meilleure des deux dernières lectures, la ligne porte donc une information
propre, elle dit si la dernière fois a été absorbée ; sa place ne change pas, c'est toujours du
contexte. Écartée,
la quatrième pastille : avec quatre pastilles le point de casse dépend des données, et une mise en
page qui change de forme selon son contenu est un piège. Écartée aussi, l'harmonisation des tailles
de police pour obtenir un alignement exact des lignes de base : elle ferait perdre la mise en avant
de la cible et de la fourchette, qui sont les deux valeurs prescriptives.

**Un séparateur sépare par le contraste, pas par la distance (v1.16).**
Les espaces autour du slash coûtaient six caractères sur une liste de quatre valeurs. Le
séparateur est atténué et porte une micro-marge, ce qui rend les nombres autonomes sans consommer
de largeur. Le point médian a été écarté : il sépare déjà des rubriques dans les en-têtes de cards
et le descriptif de séance, lui faire séparer aussi des valeurs d'une même mesure lui ferait porter
deux sens. Le format passe par une fonction unique, sans quoi on ajoute une quatrième variante en
croyant en corriger une : six points d'affichage la produisaient à la main, quatre avec espaces et
deux sans.

**Une migration doit se rejouer sur tous les chemins d'entrée (v1.16).**
Les migrations vivaient dans `loadState`, donc elles ne jouaient que sur le `localStorage` :
`applyImport`, qui construit l'état depuis un fichier, n'en rejouait aucune. Elles sont extraites
dans `migrateState`, appelée par les deux, et vérifiée idempotente. La conséquence pratique est
qu'une correction de donnée se fait à la lecture et jamais par retouche manuelle du JSON, y compris
sur une sauvegarde ancienne réimportée.

**Une version stockée vaut mieux qu'un recoupement de dates (v1.16).**
Le champ `version` des exports était faux depuis quinze versions, et pour une raison instructive :
`payload` assignait l'état par-dessus l'enveloppe, et `applyImport` faisait entrer les clés `app`
et `version` du fichier dans l'état. Un export d'époque v1.0 réimporté avait donc gravé son numéro,
que tous les exports suivants reproduisaient. L'enveloppe appartient au fichier, pas aux données :
les deux clés sont retirées à la migration, l'enveloppe est assignée en dernier, et `appVersion`
est écrite au `save` et non à l'export, pour que le `localStorage` la porte aussi. Limite assumée,
elle ne renseigne que les sauvegardes postérieures à son introduction, les sondes de forme restent
nécessaires pour les anciennes.

**Le matériel supposé présent n'a pas d'interrupteur, et c'est cohérent (v1.16).**
La card Réglages > Matériel n'expose que les disques, la capacité de manchon, les bandes et les
lestes. La kettlebell, la barre de traction, les poignées de pompes et la box sont supposées
présentes, et une dizaine d'exercices en dépendent déjà. Le swiss ball suit la même règle : déclarer
son matériel dans les réglages est la réponse à « je ne l'ai pas », et il n'y a pas lieu d'inventer
une sortie de séance pour un exercice dont le matériel manque. L'inventaire du carnet omettait le
ballon, ce qui a produit une erreur factuelle dans un document de travail : il y est désormais.

**Le cliquet monte sur les montages symétriques, l'ajustement fin reste disponible (v2.0).**
L'échelle de charge est l'union de deux familles : les montages symétriques, mêmes disques des deux
côtés, et le micro-palier d'un disque sur une seule extrémité prévu en v1.2. Le tri de leur union
fabrique des écarts que personne n'a décidés. Mesuré sur l'inventaire réel : 6 kg vaut 2 kg de barre
plus 2 kg de chaque côté, 6,25 kg vaut 5 kg plus un disque de 1,25 sur une seule extrémité, deux
montages sans rapport dont les totaux se croisent à 0,25 kg près. Douze paliers sur trente-cinq sont
dans ce cas.
Ces collisions sont mauvaises parce que le cliquet ramène la cible au bas de fourchette à chaque
montée, quel que soit le saut : le prix en répétitions est fixe, le gain en charge ne l'est pas.
Mesure sur le développé au sol, fourchette 8-12 : un saut de 6 à 6,25 kg gagne 4,2 % de charge et
coûte 30,6 % de tonnage, un saut de 6 à 7 kg gagne 16,7 % et coûte 22,2 %. Le petit palier est donc
strictement dominé, même coût et moins de gain. Cumul mesuré sur le moteur réel, le développé
sortant une séance sur trois : quarante-cinq semaines pour aller de 6 à 10 kg à quatre séances par
semaine, contre trente sur les seuls montages symétriques.
Le critère retenu est physique et non un seuil posé, ce qui respecte la règle d'origine, une échelle
dérivée de l'inventaire et jamais des paliers arbitraires. Il donne un pas de 0,5 kg au-dessus de
4 kg, dont l'écart relatif se resserre de 12,5 % à 3,8 % à mesure que la charge monte, ce qui est la
forme attendue. Un seuil en pourcentage ferait l'inverse et réintroduirait les collisions.
Périmètre : le cliquet automatique, montée comme filet de sécurité, vit sur l'échelle de
progression. L'échelle complète reste en service là où le geste est ponctuel et humain, ajustement
manuel en séance et réduction de 20 % de la séance allégée, ainsi que pour le bornage matériel, qui
doit dire ce qui est montable et non ce qui est visé. Le segment haltère de l'échelle du rowing
kettlebell suit la même règle. Conséquence vérifiée : ni le tirage ni la prescription du jour ne
changent, seules les montées futures.
Écartés, les seuils en kilogrammes et en pourcentage, mesurés eux aussi : un plancher de 1 kg
diviserait le temps par deux mais rendrait l'échelle grossière là où elle doit être fine, sautant de
13 à 14,5 kg ; un seuil de 8 % produirait une suite irrégulière et ramènerait les 0,25 kg.

**Une position est un schéma moteur, pas un exercice (v2.0).**
Le vivier restait une liste d'exercices, et un matériel manquant supprimait purement et simplement
la case. La position devient le porteur de l'intention : quand son exercice de référence n'est pas
servi, elle descend une chaîne ordonnée du plus proche de l'intention au plus dégradé, et s'arrête
au premier substitut réalisable. Une chaîne épuisée laisse la position non résolue et la perte est
nommée, plutôt que d'inventer un équivalent qui n'en est pas un.
La résolution est sans état : elle se recalcule à chaque tirage. Rendre un matériel relève donc la
position toute seule à la séance suivante, sans migration, sans verrou et sans rien à faire. C'est
ce qui interdit de doubler la chaîne par un mécanisme de successeur stocké : ce serait deux chemins
pour la même chose.
Un substitut vit au catalogue hors des viviers, comme les replis douleur. Il ne porte ni verrou, ni
retrait, ni position propre, et hérite de l'éligibilité de la position qu'il résout. Il peut en
revanche être membre d'un vivier au titre d'une autre position : le développé au sol dégrade vers
les pompes, les tractions strictes vers les assistées. Ce qui est interdit, et testé, c'est qu'une
chaîne se referme sur sa propre référence.
Vérifié exhaustivement, le nombre de combinaisons étant dérivé et non posé : 72 états de verrous
atteignables, les dépendances entre verrous éliminant 56 des 128 combinaisons brutes, croisés avec
256 inventaires et deux états d'élastique, soit 36 864 combinaisons. Aucun groupe vide, et rendre
une ressource ne retire jamais une position. Le profil sans rien perd sept schémas et sert les
quatre groupes.
Les ressources déclarables sont neuf, et neuf seulement. Le critère n'est pas le transport mais
l'exigence : le mobilier n'est pas déclaré tant que l'exercice se contente de n'importe quel objet,
chaise, mur, tapis, appui surélevé pour un étirement, et il le devient dès que l'exercice exige une
garantie que le mobilier courant n'offre pas. La marche basse entre à ce titre, le step-up bas
demandant un appui stable sous le poids du corps à vingt centimètres, ce qu'un logement de
plain-pied ou une chambre d'hôtel ne fournissent pas forcément ; l'étirement des ischios, lui, se
contente de tout ce qui est surélevé, même bancal, et garde son mobilier supposé. Le critère du
transport, essayé d'abord, donnait huit ressources et prescrivait une montée sur marche à qui n'a
pas de marche, ce qui contredisait la doctrine du résolveur, chaîne épuisée égale perte affichée. Les poignées de pompes cessent d'être une ressource : elles ne changent pas ce que
l'exercice sollicite, seulement le confort du poignet. La présence des élastiques se dérive des
niveaux déclarés au lieu de porter son propre interrupteur. Les lestes n'y figurent pas : ils
n'ouvrent aucun exercice, ils allongent seulement l'échelle des exercices à kettlebell.

**La rotation filtre la grille, elle ne déplace jamais le compteur (v2.0).**
Le mécanisme des verrous est étendu d'un prédicat : la grille des positions est filtrée par les
verrous, les retraits et la résolution matérielle, et le compteur indexe la grille filtrée.
Écartée, la variante qui aurait laissé le compteur sur la grille de référence en avançant jusqu'à la
première position résoluble. Mesure : les positions non servies donnent alors leur fréquence à la
position servie qui les suit, ce qui n'a rien de proportionnel. Sur la grille tirée à six positions,
verrous fermés, profil haltères seuls, elle donne 20, 30 et 10 sur soixante séances au lieu de 20,
20 et 20, avec la même part jouée jusqu'à trois fois d'affilée. Balayage des cinquante-sept parties
résolubles de taille au moins deux : écart de fréquence jusqu'à 66,7 %, équitable sur six parties
seulement, contre cinquante-sept sur cinquante-sept avec le filtre.
Ce qui garantit qu'un retour au profil précédent reprend la rotation où elle en était n'est pas
l'absence de modulo propre au profil, c'est que la résolution ne déplace jamais le compteur. Vérifié :
après sept séances ailleurs, la position servie au retour est celle qu'on aurait eue sans jamais
partir.
L'équité porte sur les positions et non sur les exercices. Deux positions peuvent se résoudre vers
le même substitut, l'arrière d'épaule étant dédoublé au titre du mandat de santé : c'est le mandat
qui parle alors, pas un défaut de rotation.

**Un niveau est une clé, sa réalisation appartient au profil (v2.0).**
La position d'un niveau dans l'échelle dépend de l'inventaire, son identité non : le niveau porte
donc une clé stable et jamais un rang. Chaque profil déclare la réalisation du niveau, l'objet
concret qui le tient ici, la bande rouge à domicile, la bleue de Marc ailleurs. La réalisation
remplace la carte de présence, une structure au lieu de deux : la présence se lit comme une
réalisation non vide, et les libellés nomment ce que l'utilisateur a sous la main.
Doctrine renversée quant à la correspondance : ce n'est pas à l'outil de deviner quelle bande
étrangère vaut quel niveau, c'est à l'utilisateur de le déclarer. Sa position par rapport à
l'ancrage règle le reste, et neuf fiches portent une consigne commune qui le dit. Elle est portée
par une constante unique et un drapeau, pour que neuf fiches ne soient pas neuf occasions de
divergence.
Le garde-fou « au moins une bande » disparaît. Il n'existait que parce que l'inventaire détruisait
la progression : il empêchait d'atteindre l'état où plus aucun barreau n'existe. Un profil sans
aucun élastique est désormais un cas nommé et servi.

**Un profil est un inventaire nommé, la bascule est manuelle (v2.0).**
Deux à trois profils, dont le domicile qui ne se supprime pas. Aucune expiration automatique : elle
se déclencherait toujours au mauvais moment, et l'outil n'a aucun moyen de savoir qu'on est rentré.
Le retour est à un geste depuis le bandeau d'accueil, parce que l'oubli de revenir est la panne la
plus probable et la plus coûteuse.
Invariant de données : `state.gear` EST l'inventaire du profil actif, unique poignée de lecture et
d'écriture pour tout le reste du code, ce qui laisse intacts les vingt-cinq sites qui le lisent.
`state.profils` conserve les noms et les inventaires inactifs, et celui du profil actif y est
rafraîchi à chaque enregistrement, pour qu'une sauvegarde exportée ne porte jamais deux versions
divergentes du même inventaire.
Rien à l'écran tant qu'on est chez soi : un bandeau permanent annonçant « Domicile » serait du bruit
quotidien pour une information qui ne varie jamais. Une perte se nomme par le schéma qu'elle prive
et non par l'exercice qui ne peut pas se jouer, et deux positions du même schéma ne se comptent
qu'une fois.

**La qualification d'une lecture porte sur le bornage du niveau, pas sur le profil (v2.0).**
Question longtemps ouverte : que devient la progression hors du domicile. Geler tout aurait puni une
séance parfaitement mesurable, écrire normalement aurait fait progresser sur des lectures
incomparables.
La règle est plus fine que le profil. Une performance n'est pas qualifiée quand le matériel déclaré
n'a pas permis de servir le niveau canonique, donc quand la prescription a été bornée. Loin de chez
soi, un exercice dont le barreau est disponible se joue et compte normalement. Un exercice substitué
n'est pas une lecture dégradée : c'est un autre exercice, avec sa propre échelle, qui progresse pour
son propre compte. Seul le même exercice joué plus bas que son niveau canonique produit une lecture
incomparable.
La qualification se relève avant l'écriture et se range dans l'instantané d'annulation : rejouer
doit rejouer le même régime.

**L'inventaire ne modifie jamais la progression, il borne à la lecture (v2.0).**
La v1.18 normalisait `perf` à chaque changement d'inventaire : décocher puis recocher une bande ou
une paire de lestes faisait perdre définitivement son barreau et son meilleur de bande à
l'exercice, la valeur d'avant n'étant stockée nulle part. Mesuré sur la sauvegarde du 22 août :
quatre exercices sur dix perdaient leur état par un simple aller-retour, et sept sur huit sur un
état plus progressé. Le compte n'a pas de valeur en soi, il dépend entièrement de l'état de départ
et de l'inventaire visé ; ce qui compte est que la perte soit définitive et silencieuse. Onze
exercices sont structurellement concernés, sept à bande et quatre à charge fixe.
Le niveau canonique reste donc dans `perf` et l'inventaire ne fait que borner ce qui en est
prescrit aujourd'hui. Deux propriétés en découlent, l'une et l'autre vérifiées par test : un
matériel décoché puis recoché restitue exactement l'état d'avant, et le bornage ne durcit jamais.
Le niveau prescrit est le niveau disponible le plus difficile qui ne dépasse pas le niveau
canonique. Le comparateur porte sur la difficulté et jamais sur la raideur, donc il lit l'ordre de
l'échelle et non la couleur : pour une bande d'assistance, plus difficile signifie plus faible.
Corollaire de structure : l'ordre des niveaux appartient à l'échelle, l'inventaire détermine
seulement lesquels sont réalisables ici. `bandLadder` n'est plus qu'un filtre de `bandOrder`.
Cas limite assumé : quand tout le disponible est plus dur que le niveau canonique, la prescription
retombe sur le plus facile disponible et lève un drapeau. C'est ce que la v1.18 écrivait dans
`perf`, donc la prescription du jour ne change pas ; ce qui change est qu'elle est réversible.
Conséquence délibérée hors bandes : une charge d'haltères devenue irréalisable après un retrait de
disques était prescrite telle quelle, c'est-à-dire annoncée comme montable alors qu'elle ne
l'était plus. Elle est désormais bornée au palier inférieur réalisable.
Corollaire de discipline : `perfFor` est une lecture et jamais une poignée d'écriture, elle rend
toujours une copie bornée. Les seuls ajustements manuels passent par `perfOf`, qui rend l'objet
vivant. Un seul chemin pour prescrire, un seul pour écrire.

**Une information s'enregistre toujours, une action exige les trois feux verts (v2.0).**
Trois régimes de provenance d'une lecture : exploitable, issue d'une séance allégée, non qualifiée
par le matériel. La v1.15 avait déjà déplacé le marqueur d'allégée de la séance vers la
performance, parce que la séance normale suivante lisait le dernier passage sans savoir d'où il
venait. Le défaut restant était de structure et non d'oubli : la garde de provenance vivait dans
une branche de `checkUnlocks`, en `else if`, et la branche `bandGate` placée avant ne la
rencontrait jamais. Mesuré avec témoin : un meilleur de bande à 8, un seuil à 10, une séance
allégée à 10 répétitions aidées puis une séance normale à 7 ouvraient les deux verrous à
`bandGate` ; le témoin privé de la séance allégée les laissait fermés. Le meilleur de bande et le
record étaient écrits au-dessus de la sortie de régime, donc contaminés par une lecture qui ne
prouve rien.
La règle est écrite en un seul endroit et hors des branches : les séries et la date s'enregistrent
dans les trois régimes, tout le reste est conditionné, record, meilleur de bande, cible,
fourchette, niveau, grâce post-montée, compteur de montées et verrous. Aucune branche présente ni
future ne peut oublier la garde. Le marqueur matériel suit le modèle de `lightSets`, et les deux se
lisent ensemble.

**Écarts entre le brief du chantier matériel et ce qui a été livré.**
Trois écarts assumés, relevés à l'audit interne du chantier avant clôture et motivés ici.

- *Le champ de version de l'état reste à 2 là où le brief demandait un passage à 3.* Le numéro
  d'état ne sert à rien dans cette application : aucune migration ne le lit, toutes procèdent par
  sondes de forme, « ce champ est-il absent, vaut-il zéro, a-t-il la mauvaise forme ». C'est ce qui
  les rend idempotentes et rejouables, propriété acquise en v1.16 et testée depuis. L'incrémenter
  aurait ajouté un compteur cérémoniel qu'aucun code n'interroge, et surtout un compteur dont on
  aurait tôt ou tard été tenté de faire dépendre une migration, ce qui casserait la rejouabilité.
- *Les poignées de pompes ne sont pas une ressource déclarable*, contrairement au brief : elles ne
  changent pas ce que l'exercice sollicite, seulement le confort du poignet, et la case coûtait plus
  qu'elle ne rapportait. De même, la présence des élastiques se dérive des niveaux déclarés au lieu
  de porter son propre interrupteur, une structure au lieu de deux.
- *Le modèle d'échelle du brief a été réduit.* Étaient prévues l'insertion de niveaux intercalés, la
  réalisation en liste et une notion de capacité ; rien de tout cela n'est livré. Les combinaisons
  de bandes restent refusées, refus déjà daté au brief et confirmé : elles n'ont pas de sens
  physique, deux bandes montées ensemble ne donnent pas la somme de leurs tensions, et l'échelle n'a
  jamais été métrique. Le besoin réel, atteindre plus haut, est servi par le sixième barreau en
  extension au sommet.

**Le geste de protection ne propose que ce qui est réalisable ici (v2.0).**
Le chemin des replis douleur date de la v1.8, il est antérieur au résolveur et ne consultait pas
l'inventaire. Trois couples étaient dans ce cas indépendamment de la marche basse : les élévations
latérales repliaient vers le tirage doux, le rowing kettlebell et le tirage en suspension vers le
rowing élastique, or ces trois cibles exigent un élastique que la source n'exige pas. Sans
élastique, le bouton de douleur proposait un exercice impossible, au pire moment. Le filtre est
celui du résolveur, appliqué aux deux chemins qui lisent le champ de repli, le bouton de douleur et
la substitution de la séance allégée : la chaîne épuisée ne fabrique pas d'équivalent, elle laisse
la perte visible, et ici la perte est le bouton lui-même, qui n'apparaît pas. « Passer » reste la
sortie. La fiche, elle, continue de nommer le repli : elle décrit l'exercice et non la séance.

**Un verrou lit l'échelle, jamais l'inventaire du jour (v2.0, règle 4 du brief).**
La branche `bandGate` de `checkUnlocks` comparait le barreau joué au dernier barreau de l'échelle
filtrée par l'inventaire actif. Sous un profil ne possédant que la verte, la verte était donc « la
plus faible du kit » et dix répétitions avec l'assistance maximale ouvraient les tractions strictes.
Témoin mesuré sur la build du chantier avant correction, rejoué à chaque build depuis. La règle est
la même que pour le bornage : l'ordre appartient à l'échelle, l'inventaire dit seulement ce qui est
réalisable ici. Le verrou lit donc `bandOrder` et l'énoncé affiché dit ce qui est vérifié, « ton
élastique le plus fin ». Conséquence assumée : qui ne possède le jaune dans aucun profil ne peut pas
ouvrir les strictes, ce qui est le comportement voulu, on ne prouve pas une quasi-traction avec une
grosse bande.

**Une liste vide se remplit, une liste pré-remplie se survole (v2.0).**
L'état neuf part d'un inventaire vide et d'un drapeau d'onboarding, et le bandeau d'accueil, qui
était conditionné à l'historique vide depuis la v1.18, l'est désormais à ce drapeau. Le motif est de
justesse et non d'ergonomie : un inventaire pré-rempli au matériel de Gabriel serait faux pour tout
autre utilisateur et se validerait sans être lu. Le drapeau n'est jamais créé par une migration,
donc un import de sauvegarde n'a pas d'onboarding ; il survit aux enregistrements intermédiaires,
puisqu'on peut régler un thème avant de valider son matériel, et la validation ne verrouille rien.
Valider une carte vide est un acte légitime, « je n'ai rien ici », et le texte le dit : l'exhaustivité
prouvée par le résolveur garantit qu'un inventaire vide sert les quatre groupes, onze schémas sur
dix-huit. Trois usages de l'inventaire par défaut sont distingués, et un seul bascule : l'état neuf
part de l'inventaire vide, la valeur de repli des fonctions et la cible de migration des anciennes
sauvegardes restent sur l'inventaire domicile, faute de quoi toute sauvegarde ancienne verrait ses
prescriptions bornées.

**La colonne de droite est celle des contrôles (v2.0).**
Dans la card Matériel, tout ce qui se touche est aligné à droite et partage la même empreinte,
interrupteur de présence, pastille de réalisation, couple moins-plus. C'est la position qui dit
qu'une chose est actionnable, pas une phrase d'explication, et c'est déjà la grammaire des lignes de
réglages. Écartée, la pastille posée à gauche du libellé : elle aurait été le seul élément
actionnable hors de cette colonne, et une pastille nue de dix-sept pixels est une cible tactile trop
petite. Elle est donc posée dans un cadre de la taille d'un interrupteur, ce qui règle du même coup
le liseré qu'exigent la blanche et la noire. Plus aucun bouton dont l'état est un mot : « Présent »
et « Possédée » disaient l'état par leur texte là où un interrupteur le dit par sa forme.

**Un niveau porte sa tension, la couleur n'est que ce qu'on pose dessus (v2.0).**
La réalisation d'un niveau se choisit sur un nuancier fermé de douze couleurs au lieu de se saisir
au clavier. Cela supprime d'un même geste le nommage libre et le piège de la chaîne vide : on tape
une pastille, on ne saisit rien. Pas de nuances foncées, illisibles en pastille sur mobile, et le
doublon couvre déjà le cas des deux bandes de même couleur ; la réalisation restant une chaîne,
ajouter une teinte plus tard coûte zéro migration. Les cinq clés de couleur sont exactement les
réalisations que la migration pose sur une sauvegarde v1.18, donc un inventaire domicile n'est pas
retouché, et une réalisation hors nuancier se ramène à une couleur, par sa clé, par son libellé,
puis par la couleur d'origine du niveau : le niveau reste tenu dans tous les cas, seule sa teinte
peut changer. Le libellé principal d'un niveau devient sa fourchette de tension, le numéro et la
couleur passant en secondaire : le niveau est un slot de tension, la couleur n'est que son occupant
du moment. Corollaire de nommage, les clés de niveau étant masculines, les libellés disaient « bande
noir » ; le nuancier porte la forme accordée.

**Le doublon de couleur est autorisé, il se lève à l'affichage (v2.0).**
Cas réel d'un jeu étranger à deux bleues de tensions différentes. Interdire le doublon obligerait à
mentir sur ce qu'on a sous la main, ce qui est exactement ce que la réalisation sert à éviter. Il
est donc autorisé, et désambiguïsé seulement quand il est effectif dans le profil actif : « bande
bleue, niveau 4 ». Le rang affiché ne sert qu'à cela, la position d'un niveau dans l'échelle
dépendant de l'inventaire alors que son identité n'en dépend pas.

**Un barreau s'ajoute au sommet, l'échelle ne se réordonne pas (v2.0).**
Sixième niveau, 125 à 170 lbs, clé stable et opaque. Non-couleur à dessein : avec la réalisation par
couleur, nommer la clé « bleu » inviterait la confusion entre la clé du niveau et la teinte qui le
tient. Les cinq clés existantes ne bougent pas, `perf` et `hist` continuent de les référencer, et
l'échelle absorbe le barreau mécaniquement. Effets mesurés : en résistance, un barreau de plus au
sommet, et les messages de plafond deviennent des montées ; en assistance, l'ordre étant inversé,
une entrée plus facile en bas de difficulté ; le verrou des strictes n'est pas touché, le jaune
restant par construction le dernier barreau de l'échelle d'assistance.
Écartés, et pour la même raison : le réordonnancement des niveaux par glisser-déposer, qui changerait
rétroactivement le sens des performances déjà jouées puisque la clé porte l'historique, le besoin
réel étant couvert par l'assignation de couleur ; et les niveaux intercalés, chaque barreau inséré
coûtant une traversée de fourchette pour une granularité que la position par rapport à l'ancrage
module déjà.

**Un compteur dit ce qui manque, pas seulement ce qui marche (v2.0).**
Sous un profil réduit, l'outil savait dire qu'on pouvait jouer, pas qu'on plafonnait. Le compteur de
progressions disponibles compte, parmi les exercices tirables dont l'échelle dépend de l'inventaire,
paliers tenus exclus puisqu'ils ont choisi de ne pas monter, ceux qui ont un barreau au-dessus de
leur niveau canonique et dont la prescription n'est pas bornée : un exercice borné produit une
lecture non qualifiée, donc il ne peut pas progresser du tout ici, et l'annoncer comme ayant une
marche serait faux. Le dénominateur, lui, ne bouge pas avec le bornage : c'est l'écart entre les deux
nombres qui porte l'information. Mesuré : 9 sur 9 à domicile, 6 sur 9 sous un profil à la verte
seule, 0 sur 1 sur un inventaire vide. Lecture pure, aucune écriture, et le bornage s'y recalcule
sur l'inventaire passé en paramètre et non sur le profil actif, sans quoi le compteur annonce
8 sur 9 là où il doit annoncer 6 sur 9, défaut mesuré et corrigé en cours de lot. Il rejoint en pied
de card le compte de schémas servis, qui quitte la card Profil actif : deux compteurs du même
inventaire n'ont pas à vivre dans deux cards.

**Une question se pose dans la page, jamais dans un dialogue du système (v2.0).**
Les trois `prompt()` et les cinq `confirm()` disparaissent. Nommer un profil passe par un champ
inline, dont la valeur n'est lue qu'au clic : le rendu réécrit la vue entière, un rendu déclenché à
chaque frappe mangerait la saisie. Supprimer un profil, tout réinitialiser et quitter une séance
passent par une question à deux temps qui nomme sa conséquence. La remise à zéro posait deux
dialogues enchaînés, elle n'en pose plus qu'un : répéter la question ne protège de rien, c'est la
formulation de la conséquence qui protège.
La sortie de séance méritait l'examen le plus long, parce qu'elle se déclenche aussi par la flèche
arrière du navigateur, là où le dialogue système répondait de façon synchrone. Le routeur remet déjà
l'entrée d'historique en place AVANT d'appeler la sortie depuis la v1.14, donc la flèche seule n'a
jamais rien quitté et la mécanique ne change pas : il suffit que la question s'affiche au lieu de
bloquer le fil. Garder le dialogue natif sur ce seul chemin aurait donné deux visages à la même
décision selon qu'on presse un bouton ou une flèche. Tant que la question est posée, les touches de
séance sont inertes et Échap annule : une touche pressée par réflexe ne décide de rien, règle posée
en v1.13 pour ESPACE et étendue ici.

**Un type de disque se déclare, il n'est pas énuméré d'avance (v2.0).**
La card proposait quatre types en dur, ceux de Gabriel. Chez quelqu'un d'autre, les disques ne sont
pas les siens. Le menu d'ajout est une liste fermée de huit poids de 0,5 à 10 kg, comme le nuancier
est une liste fermée de couleurs : on choisit, on ne saisit pas un nombre, et au-delà de 10 kg un
disque ne tient plus sur un manchon d'haltère. Seuls les types absents sont proposés, un type
retombé à zéro quitte la liste et redevient proposable, ce qui évite un bouton de suppression
séparé. Un type entre à quatre exemplaires et non à deux : mesuré, le stock se divise par le nombre
de barres puis par les deux extrémités, si bien qu'un type à deux exemplaires ne produit aucun
montage symétrique et laisse l'échelle de progression inchangée à 23 paliers, là où quatre la
portent à 30 et font passer le sommet de 14,5 à 17,5 kg. Ajouter un type doit faire quelque chose.
Conséquence d'affichage : la ligne qui énumérait les 35 paliers en compterait 103 avec huit types
déclarés ; elle est remplacée par un résumé stable, nombre de paliers, plancher, sommet, plus petit
écart. Le même contrôle servira aux kettlebells quand leur lot apportera l'échelle correspondante.

**Une troisième paire de lestes, et une échelle qui se dérive (v2.0).**
`cuffSteps` énumérait à la main les trois cas d'un inventaire à deux paires. Elle se généralise aux
sommes de sous-ensembles des paires déclarées, les lestes se superposant sur un même membre : 0 à
3,5 kg par membre à inventaire complet, 0 à 7 kg par pas de 1 sur deux membres. Goblet squat,
soulevé roumain et swings passent de 4 à 8 barreaux et leur sommet de 16 à 17 kg. Conséquence
assumée et consignée : le cliquet devient deux fois plus fin sur ces trois exercices, un barreau y
gagnant 10 % de charge au lieu de 20 % pour un même retour au bas de fourchette. Elle ne contredit
pas la règle des montages symétriques posée plus haut, dont le critère est physique : 0,5 kg à
chaque poignet est symétrique, et l'échelle des lestes est une famille unique, donc sans les
collisions qui avaient motivé cette règle sur les haltères. La liste des paires reste fermée aux
trois déclarées : rien ne bornerait aujourd'hui une paire de 3 kg aux poignets sur un swing, et
c'est le lot kettlebell qui apportera les plafonds par exercice.

**Le bouton « Changer de séance » est retiré (v1.18).**
Il avançait d'un cran les quatre compteurs de vivier, en silence et sans retour possible. Mesuré, il
faisait trois choses. Usage neutre, appuyer sans viser : un déphasage, sans valeur, tous les tirages
portant les mêmes groupes et le même volume. Usage sélectif, appuyer pour éviter un exercice : le
seul qui produise un effet, et l'effet tombe ailleurs que sur la cible. Les quatre compteurs avançant
ensemble, les viviers sont en phase, et jambes comme gainage comptent cinq entrées : éviter
systématiquement les mollets debout fait disparaître le dead bug, 0 % sur 3000 séances simulées.
Éviter les tractions assistées fait tomber les pompes de 33,3 % à 20 % et monter les face pulls à
40 %, le vivier poussé comptant 3 entrées et le tiré 6. Aucun instrument ne le voit, `coverage`
agrégeant par catégorie : quatre groupes verts au-dessus d'un exercice sorti du programme. Troisième
usage, non déclaré : un levier de durée valant jusqu'à 7,6 minutes en un appui, à côté des boutons
de volume dont toute la valeur est d'être exacts et annoncés, soit le défaut de l'ordre de sacrifice
corrigé en v1.13. Gabriel ne s'en était jamais servi. Le trou qu'il bouchait, matériel
momentanément indisponible, relève du chantier matériel et pas d'un saut de tirage.

**Le détail de séance est un carrousel, et il ne promet pas de calendrier (v1.18).**
La rotation est indexée par séances, pas par jours : elle n'avance qu'à la fin d'une séance terminée,
et la disponibilité déclarée va de 3 à 7 séances par semaine. « Les séances de la semaine » n'est
donc pas calculable sans deviner combien de séances seront faites, c'est la promesse intenable du
cadran temporel tombé en v1.13. Ce qui est exact, c'est l'ordre : la prochaine, puis celle d'après.
Aucune date n'est accolée à un tirage, jamais.

La fenêtre compte autant de panneaux que le plus gros vivier. Sur une telle fenêtre, chaque exercice
tirable figure au moins une fois, quel que soit le point de départ, vérifié sur les 210 positions
possibles dans les deux états de verrous. Elle se règle seule quand un verrou s'ouvre : aucune
constante à maintenir. Une seule liste répond ainsi aux deux questions, quelles séances ensuite et
quand revient tel exercice.

L'ordre est conditionnel et le dit : une séance quittée n'avance rien, une allégée gèle les
emplacements substitués, un verrou qui s'ouvre recompose le vivier. Les cibles et charges affichées
ne sont pas des prévisions mais l'état courant lu au rendu, donc jamais faux, ce que la mention en
tête de panneau énonce. Mesure à l'appui : les panneaux +1 et +2 ne contiennent jamais un exercice
joué aujourd'hui, le premier recoupement est au panneau +3, et au pire 4 lignes sur 20 peuvent
bouger le soir même. Les durées, elles, ne figurent pas sur les panneaux à venir : le volume de ces
séances n'est pas encore choisi.

**Un contrôle ne devient pas indisponible en réaction à un état affiché ailleurs (v1.18).**
Griser « Lancer la séance » quand le carrousel montre une séance à venir a été proposé, construit en
maquette, puis écarté par Gabriel. Un contrôle éteint dont la cause n'est pas sous les yeux est
perturbant, et il peut bloquer quelqu'un qui ne comprend pas pourquoi son bouton ne répond plus. Ce
qui lève l'ambiguïté vit là où l'utilisateur se trouve : l'intitulé du panneau, la barre latérale, le
retour au jour, et l'index qui repart à zéro à chaque affichage de l'accueil.

Corollaire, tiré d'une erreur commise pendant ce chantier : la conception ne se dérive pas de la
machine sur laquelle Gabriel travaille au moment de la discussion. Il utilise l'outil sur PC, ce qui
avait été déduit à tort du CSS, mais rien ne dit qu'il n'en changera pas, et l'outil doit rester
tenable dans les deux usages.

**Pas de tooltips, des `aria-label` (v1.18).**
L'application n'a jamais porté un seul attribut `title`, et un survol n'existe pas sur écran
tactile. Ajouter des tooltips sur les trois boutons du carrousel et nulle part ailleurs créerait
une inconsistance de plus. Les sept emplacements de boutons à symbole nu déjà présents, les moins
et les plus de saisie, de charge, de bande, de correction, d'objectif et de disques, se lisent par
le nombre placé entre eux. Ils reçoivent en revanche un `aria-label`, qui ne se voit pas et donne
un nom au bouton pour un lecteur d'écran ou une navigation au clavier.

**La card de pied des réglages présente l'outil avant ses contraintes (v1.18).**
Elle ouvrait sur « PALIER est un outil d'auto-suivi, pas un avis médical », suivi de la liste des
zones ménagées. Deux défauts : une décharge de responsabilité en guise de présentation, alors qu'un
programme de sport n'a jamais été un outil médical, et un outil défini par ce qu'il évite plutôt que
par ce qu'il fait. Trois blocs intitulés à la place, dans cet ordre : ce que fait PALIER, comment
les exercices sont choisis, pourquoi les séances sont alternées. Les contraintes physiques n'y sont
plus un préambule clinique mais un critère de sélection du catalogue, énoncé après la valeur.
La ligne de prudence subsiste, réduite à ce qui est opératoire : consulter en cas de douleur
inhabituelle ou persistante. La recommandation d'un avis kiné pour valider les patterns de mouvement
disparaît de l'interface, elle reste une bonne pratique consignée ici.

---

**Les poignées de pompes ne deviennent pas une ressource (v2.1).** La question s'est reposée après
le test local : l'exercice s'appelait « Pompes sur poignées » et sa fiche exigeait un objet que rien
ne demandait de déclarer. Mesuré : `NEEDS` est vide pour cet exercice, le contrat dit « rien d'autre
que le sol », et « Poignées de pompes » est le **seul libellé de `MAT` de tout le catalogue** qui ne
renvoie ni à une ressource déclarable ni au mobilier supposé présent. L'anomalie était donc dans un
nom et un libellé, pas dans le modèle. La décision de la v2.0 tient, le critère de déclaration
l'exclut : le sol offre tout ce qu'une pompe demande, les poignées changent le confort du poignet et
un peu d'amplitude. Créer la ressource et un exercice « pompes » séparé aurait coûté une dixième
ressource contredisant son propre critère, une fiche recouvrant une existante à plus de 95 %, une
illustration, et surtout **une fourche de progression** : `state.perf` étant indexée par
identifiant, en déplacement on repartirait à 6 répétitions pendant que la version poignées reste où
elle est, sans que les deux fusionnent jamais. L'exercice s'appelle « Pompes », la fiche mentionne
les mains au sol en premier et les poignées en option, l'identifiant et l'illustration ne bougent
pas.

**L'écart entre les deux manchons remplace la procédure (v2.1).** La v1.2 avait tranché le principe
du micro-palier, « un seul disque supplémentaire sur une extrémité, déséquilibre négligeable sur une
charge tenue au centre de la main », mais le code en avait fait une **procédure** — montage
symétrique plus un disque — et non une grandeur. Conséquence mesurée : l'échelle livrait 3,25 kg,
qui demande 1,25 kg d'écart entre les manchons, et refusait 3,5 kg, qui n'en demande que 0,5. Le
critère devient l'écart lui-même, borné au plus petit disque déclaré, donc dérivé de l'inventaire et
non posé. L'échelle complète passe de 35 à 46 barreaux, gagne 3,5 puis 4,75 et la suite, et perd
exactement un barreau, 3,25, le seul dont l'écart dépassait la borne. La littérature ne dit rien de
l'asymétrie entre les deux manchons d'un même haltère : ce qui existe porte sur le chargement
asymétrique entre les deux mains, qui est un autre sujet. C'est donc une décision interne, appuyée
sur la v1.2 et sur une mesure, pas sur une source.

**Le micro-palier est additif, et son seuil a un large plateau (v2.1).** La règle inscrite à la file
d'attente ajoute un barreau là où le saut symétrique dépasse un seuil relatif ; elle ne retire jamais
un barreau existant. Un filtre glouton à pas relatif minimal a été mesuré puis écarté : il
reshapait toute l'échelle, y compris au-dessus de 4 kg où rien ne cloche, et touchait donc ce sur
quoi on s'entraîne déjà. Balayage du seuil de 5 à 45 % : **toute valeur entre 13 et 33 % donne
exactement la même échelle**, la forme lumpy du bas décidant seule. 20 % est retenu comme point
milieu du plateau, il n'y a rien à calibrer finement. Résultat : 2 / 2,5 / 3 / 3,5 / 4 / 4,5, écarts
relatifs décroissants de 25 à 12,5 %, et identité stricte avec la v2.0 au-dessus de 4 kg. La raison
nouvelle qui autorise à rouvrir la décision v2.0 sur les montages symétriques est celle déjà
consignée : la métrique de tonnage est aveugle à la faisabilité du saut par répétition, et un saut
de +50 % en bas d'échelle n'est pas payable.

**Les lestes ne comblent que jusqu'à la kettlebell suivante (v2.1).** Règle des totaux ambigus, pour
une échelle à plusieurs kettlebells. Pour chaque poids possédé, les lestes montent tant que le total
reste sous le poids possédé suivant ; au-dessus du plus lourd, ils prolongent librement. Chaque
total est donc tenu par un seul montage, celui qui emploie la kettlebell la plus lourde disponible :
le moins d'objets, et sur un swing le moins de scratchs sur un segment en mouvement. Mesuré sur
8/10/12/14/16/20 avec les trois paires : l'union brute donnerait 20 totaux dont 14 ambigus, la règle
donne 20 barreaux sans un seul doublon, écarts relatifs décroissants de 12,5 à 3,8 %. Non-régression
vérifiée : avec la seule kettlebell de 10 kg, l'échelle reste 10 à 17.

**Le plafond du swing est dérivé, faute de source (v2.1).** La littérature ne donne pas de nombre :
elle donne une règle de forme, la charge cesse de monter quand la charnière se dégrade en squat, ce
que l'outil ne sait pas mesurer. Un chiffre en kilos aurait été posé et non sourcé. Le plafond des
swings vaut donc le niveau courant du soulevé roumain : même schéma moteur, l'un contrôlé et l'autre
balistique, et c'est déjà le soulevé roumain qui ouvre le verrou des swings. On ne lance pas en
balistique plus lourd qu'on ne tient en contrôlé. Il monte tout seul, sans constante à maintenir.

**Les deux verrous de la charnière passent à deux séries (v2.1).** Le catalogue comptait six
verrous, et ces deux-là étaient les seuls à s'ouvrir sur une série isolée, alors qu'ils commandent
la famille la plus exposée pour une L5 malformée. La v1.17 avait déjà écarté le verrou à une série,
au motif qu'une série isolée au plafond se rattrape par un bon jour là où deux séries dans la même
séance prouvent la capacité courante. La cohérence interne tranche, sans effet sur une progression
déjà ouverte.

**Les fentes lestées outillent une impasse documentée (v2.1).** La marche suivante des fentes
arrière disait depuis la v1.2 « prends un haltère dans chaque main, le long du corps ». Ce n'est
donc pas un exercice de plus au vivier jambes mais un successeur, posé sur le motif de l'escalier de
gainage : le successeur retire son prédécesseur du tirage à son déblocage. Mesuré : le vivier de
référence passe de 7 à 8 entrées et le **vivier tiré reste à cinq dans les deux états de verrou**,
donc aucune fréquence ne bouge et la largeur du carrousel non plus. Verrou à deux séries au plafond
des fentes au poids du corps, comme les deux successeurs de gainage. Ce plafond a été écrit ici
en v2.1 comme valant « déjà 18 répétitions par côté » : ce 18 n'avait été choisi par personne,
c'était le cap fantôme des relèvements de fourchette, hérité et lu comme un fait. Corrigé en
v2.16, le verrou lit 15, le haut de fourchette. Sans haltères déclarés, la position se résout vers
les fentes au poids du corps.

**L'interrupteur de section est un masque, pas une seconde structure (v2.1).** La v2.0 avait dérivé
la présence des élastiques de leurs niveaux déclarés, une structure au lieu de deux. Le besoin qui
s'est présenté ensuite est différent : déclarer d'un geste l'absence d'une famille entière. Un
interrupteur destructeur serait à moitié défini, l'extinction étant claire et l'allumage non. Un
interrupteur **masque** ne l'est pas : il cache sans effacer, donc le relever restitue exactement ce
qui était déclaré et il n'y a rien à mémoriser. C'est déjà ce que `res.hal` est aux disques. Les
quatre sections de la card portent donc le même interrupteur, avec un invariant qui ferme le seul
état menteur : déclarer lève le drapeau, retirer le dernier élément le baisse, et l'interrupteur ne
s'affiche pas sur une section vide, puisqu'il n'y a rien à masquer.

**Un profil neuf part vide (v2.1).** La copie automatique de l'inventaire actif se justifiait par
« il est plus court d'en décocher que de tout cocher ». Mesuré sur l'inventaire réel, ce n'est vrai
que si l'endroit ressemble au domicile : pour déclarer « rien du tout », 22 gestes depuis une copie
contre 0 depuis vide ; pour « un élastique vert plus un ancrage », 19 contre 4 ; la copie ne
l'emporte que sur un profil riche, 9 contre 13. Et l'argument de justesse était déjà écrit, posé
pour le premier lancement : une liste vide se remplit, une liste pré-remplie se survole, et un
inventaire pré-rempli au matériel d'ailleurs se valide sans être lu. La copie reste offerte, comme
un geste explicite, pour le cas où elle gagne.

**Le volume change en cours de séance, entre deux bornes (v2.1).** L'entrée « ajustement du nombre
de séries en cours de séance » figurait aux écartés pour deux raisons mécaniques ; les bornes les
ferment toutes les deux. Le plancher à deux séries rend `prevu` à 1 inatteignable, donc le chemin
« une seule série égale une montée », fermé en v1.4, ne se rouvre pas. Et la série en plus, bornée à
une seule, ne dilue pas une montée acquise : le volume du passage est fixé **avant** que la dernière
série soit jouée, donc le passage est jugé entier, exactement comme s'il avait été lancé à ce
volume. L'entrée écartée visait un ajustement rétroactif, ce n'est pas ce qui est fait. Rien d'autre
n'a été nécessaire : `prevu` se dérive des étapes, donc « séance complète », la couverture et les
verrous suivent d'eux-mêmes. Le volume de référence pour la borne haute est celui **choisi au
lancement**, pas le volume courant.

**La marche suivante peut dépendre de l'inventaire (v2.1).** « Plafond du matériel actuel » était
écrit comme un fait alors que le matériel est déclaré depuis la v2.0. Chez quelqu'un qui n'a pas
encore déclaré le poids suivant, la vraie marche est une déclaration, pas une impasse. Le texte des
quatre exercices à kettlebell se compose donc à l'affichage, et ne redevient l'impasse écrite au
catalogue qu'une fois la liste des poids épuisée. Le reste du catalogue n'est pas touché : pas de
moteur générique, une marche propre à chacun, la décision d'origine tient.

**Un compteur d'avancement ne se déduit pas d'un prédicat (v2.2).** Les badges savaient dire acquis
ou non, jamais où l'on en est. Un test est un booléen : il ne sait pas compter. Le compteur est donc
déclaré à côté de lui, une fonction et un seuil, et le critère d'affichage est mécanique plutôt
qu'une liste tenue à la main : un seuil d'au moins deux. Un seuil de 1, ou un prédicat qui n'est pas
un compteur, ne produirait que « 0/1 », qui ne dit rien de plus que la ligne grisée ; quatre badges
sont dans ce cas, la première séance, la première semaine validée, la première montée de charge et le
premier déblocage. Le compteur est borné au seuil dans les deux sens, sans quoi un badge non encore
posé alors que son compteur l'a dépassé, cas d'une correction de séance qui fait redescendre le
nombre de montées, afficherait 6/5. Il ne s'affiche pas sur un badge acquis, où « 12/5 » n'informe
plus de rien.

**Un badge dont le prédicat ne peut plus être vrai n'est pas un badge (v2.2).** `mob5` lisait
`type==='mobilite'` alors que toute séance s'écrit `type:'alterne'` depuis le retrait du mode ciblé
en v1.18. Il était donc inatteignable, et il pesait quand même dans le dénominateur affiché : la
collection annonçait douze badges dont un impossible. C'est l'affichage de l'avancement qui l'a mis
au jour, un compteur figé à 0/5 étant plus visible qu'une ligne grisée de plus. Le retrait ne
demande aucune migration, un identifiant absent de `BADGES` étant simplement ignoré à la lecture de
`state.badges`, et une assertion interdit désormais qu'un prédicat de badge lise le type d'une
séance. `w12` le remplace au lieu de laisser onze badges : l'échelle des semaines s'arrêtait à un
mois quand celle des séances va jusqu'à quarante, soit une dizaine de semaines, et c'est le même
compteur à un second seuil.

**La projection nomme deux facteurs, la mesure doit nommer les deux (v2.2).** La couverture
hebdomadaire par groupe vaut à peu près le produit des jours actifs par les séries par exercice. Le
premier facteur était mesuré dans Assiduité, le second nulle part : l'écart entre projection et
mesure, dont la v1.10 dit qu'il est lui-même l'information, n'était donc décomposable qu'à moitié.
La ligne vit dans Couverture, la card qui possède le volume, et pas dans Assiduité, qui possède la
régularité. Elle suit la fenêtre des rails, semaines révolues et quatre au plus, donc elle apparaît
et disparaît avec eux. Le dénominateur est le nombre d'emplacements et non celui des exercices
distincts joués : un exercice basculé sur son repli en cours de séance produit deux entrées au
journal pour un seul emplacement. Réserve assumée : chez quelqu'un qui lance toujours au même volume
et termine toujours, le chiffre est constant, donc du bruit au sens de la règle posée pour l'accueil.
Il ne gagne son affichage que parce que le volume se change en cours de séance depuis la v2.1 et
que les séances quittées existent depuis la v1.1.

**L'écran de repos annonce, l'écran de série prescrit (v2.2).** L'exercice suivant était annoncé en
texte seul. La vignette dit d'un coup d'oeil ce que la phrase demande de lire, et c'est déjà le rôle
qu'elle tient dans le détail de séance et dans la bibliothèque, à la même empreinte de 74 par 52.
Elle est inerte : un lien vers la fiche ferait quitter une séance dont le chrono continue de tourner,
et la bibliothèque reste le chemin pour consulter. Écartée, la charge ou la barre de bande à côté du
nom, malgré l'argument réel que la transition est le moment où l'on monte l'haltère : l'écran de
série les porte déjà et arrive quinze secondes plus tard, et deux écrans qui prescrivent la même
valeur finissent par diverger. Écartée aussi, l'illustration entière en `contain`, plus lisible mais
qui pousse « Passer au suivant » sous le pli. Ce que la vignette affiche suit `st.next`, réaffecté
par `relinkRests` à chaque bascule de repli et à chaque retour : elle ne peut pas annoncer un
exercice qui ne viendra pas.

**La ligne tracée en v2.2 se lit dans les deux sens (v2.6).** Ce qui prescrit reste sur l'écran de
série ; ce qui annonce peut vivre sur l'écran de repos. Les séries déjà faites du jour sur
l'exercice qui vient sont une annonce, pas une prescription : le journal est un fait, rien ne s'y
recalcule, et deux écrans ne peuvent donc pas diverger sur une valeur qu'aucun des deux ne produit.
La vignette les porte, à droite du nom, dans le vocabulaire exact de la pastille de l'écran de série,
même vert, même corps, même libellé « Aujourd'hui », même formateur de liste. Mesuré sur le déroulé
réel, à quatre séries : trois transitions nues au premier tour puis douze chargées sur quinze, soit
4R-4 sur 4R-1.

La cible reste écartée. L'argument matériel, la transition est le moment où l'on monte l'haltère, est
du côté de la charge et non des répétitions : porter la moitié faible de la prescription en retenant
la moitié forte apprendrait que l'écran de repos dit ce qu'il faut faire, puis omettrait la seule
chose qu'on ne peut pas rattraper sur place. Deux mesures achèvent de la disqualifier sous cette
forme : sur deux cents tirages, 34 % des emplacements sont unilatéraux, où un nombre nu mentirait
d'un facteur deux sans le qualificatif, et 10 % sont des tenues, où il serait ambigu entre
répétitions et secondes, l'écran de série levant cette ambiguïté par son chrono et pas la vignette.

Arbitrage tranché par Gabriel : la vignette ne porte que les séries du jour, jamais la dernière fois.
Rien n'apparaît donc avant le premier passage du jour. La dernière fois reste sur l'écran de série,
où elle est déjà du contexte au sens de la v1.16.

**L'écran de repos est devenu l'écran de situation (v2.9).** L'heure et le temps écoulé depuis le
lancement rejoignent la vignette et les séries du jour, sur la ligne du tag. Ils passent la règle de
la v2.2 sans effort : ce sont des annonces, aucun autre écran ne les produit, rien ne s'y recalcule,
donc rien ne peut diverger. Le besoin est réel et il vient de la disponibilité déclarée, trois à sept
séances de dix à vingt minutes intercalées dans une journée : savoir qu'il est 18h42 répond à « est-ce
que je vais être en retard » sans sortir le téléphone, et l'écoulé répond à « où j'en suis » sans le
reconstruire de tête.

Trois choses ont été tranchées contre la formulation d'origine.

*La minute, pas la seconde.* `fmtT` rend `18:42` à dix-huit minutes, ce qui, posé à côté de `18h42`,
donne deux nombres identiques pour deux grandeurs : exactement la faute que la v1.11 a corrigée sur la
ligne d'historique. L'argument décisif est venu de Gabriel et il va plus loin que la collision de
format : sur cet écran un seul nombre doit défiler à la seconde, et c'est le décompte de transition.
Dès qu'un second défile à la même cadence, en sens inverse de surcroît, l'œil ne sait plus lequel le
concerne. Tronquée à la minute, la valeur cesse d'être un chrono et redevient un repère. La seconde
n'y est actionnable par rien.

*Troncature et jamais arrondi.* À 12 min 50 s l'écran affiche 12. Un indicateur qui arrondit
revendique du temps qui n'a pas été passé.

*L'écart au modèle reste écarté.* Afficher la durée annoncée à côté de l'écoulé transformerait le
repère en course contre un modèle qui, par construction, ne représente pas les interruptions. Le
carnet refuse déjà le résidu au récapitulatif au motif qu'une séance isolée est dominée par elles et
qu'un nombre bruité ayant l'allure d'une mesure invite à le sur-lire. En pleine séance c'est pire :
cela pousse une décision, bâcler ou sauter, sur le seul écran qui promet qu'il n'y en a aucune à
prendre.

Périmètre strict : les transitions seules. Pas l'écran de série, qui prescrit et dont le pavé passe
déjà sous le pli ; pas l'échauffement, le cardio ni les étirements, qui portent chacun leur propre
chronomètre. Placement retenu sur maquette parmi trois : la ligne du tag, vide à droite jusqu'ici,
donc rien ne descend et ni la vignette ni le bouton ne bougent d'un pixel. Écartée, la ligne sous le
décompte, qui ajoute une bande et invite surtout à lire ensemble deux durées qui ne mesurent pas la
même chose ; écarté aussi le pied de card, hors du champ de lecture pendant les quinze secondes où
l'écran est visible, et mêlé à des commandes alors que la ligne ne commande rien.

**Un temps affiché se recalcule depuis son ancre, il ne s'incrémente pas (v2.9).** L'écoulé dérive de
`cur.t0` à chaque lecture. Un compteur incrémenté à chaque battement aurait paru équivalent et aurait
menti dès la première mise en veille, `setInterval` étant étranglé quand l'écran du téléphone
s'éteint. L'ancre choisie est celle qui existait déjà, `cur.t0`, posée au lancement et lue par `real`
à l'enregistrement : la ligne en séance et la durée réelle de l'historique ne peuvent pas s'écarter
d'une seconde, ce qui satisfait « une durée affichée dit laquelle » par construction plutôt que par
convention. La suite le vérifie en avançant l'horloge sans faire tourner la boucle, puis en faisant
tourner la boucle sans avancer l'horloge : les deux moitiés du contrôle sont nécessaires, la première
seule passerait sur un compteur bien amorcé.

**Un formateur porte le nom de sa grandeur, pas celui de son unité (v2.9).** Le formateur de l'écoulé
avait d'abord été nommé `fmtMin`. Le nom était déjà pris, dans `app5.js`, par la durée **annoncée** au
tilde, c'est-à-dire précisément la valeur écartée de cet écran. Deux déclarations du même nom ne
cohabitent pas, la dernière assemblée gagne, et l'écran affichait `18h42 · ~0 min` : l'écoulé rendait
l'annonce. Aucune erreur, aucun avertissement, un rendu plausible. Le défaut a été pris par la
première exécution de `test36.js`, avant toute relecture. Le formateur s'appelle désormais
`fmtEcoule`, et la suite verrouille la collision par trois assertions, dont l'identité des deux
fonctions et le compte des déclarations dans la source. Le nom d'une fonction dit ce qu'elle mesure ;
`Min` ne disait qu'une unité, partagée par deux grandeurs opposées, une mesure et une prévision.

**Un instant n'a qu'un découpage (v2.9, prolonge la v2.6).** La règle posée pour le jour civil vaut
pour l'heure. `fmtDT` lisait `getHours` et `getMinutes` à la main ; la ligne de transition l'aurait
lu une seconde fois. `fmtHM` découpe désormais seule, `fmtDT` passe par elle, et la suite vérifie que
`getHours` n'apparaît qu'une fois dans toute la source. Deux découpages du même instant finissent par
diverger, c'est la leçon du plafond de liste et celle des clés de jour.

**La clé lue est `nextKey`, jamais l'identifiant (v2.6).** Le journal de séance s'indexe sur
`st.key`, qui vaut « origine>repli » dès qu'un repli douleur est en cours. Lire l'identifiant
afficherait les séries de l'exercice d'origine sous la vignette du repli. Le pas de repos porte donc
`nextKey` à côté de `next`, et les deux sont posés au même endroit : `relinkRests` prend désormais la
liste en paramètre, et la construction de séance comme le changement de volume l'appellent au lieu
d'écrire `next` à la main. Trois écritures dispersées du même champ devenaient trois occasions de
diverger, il n'en reste qu'une.

Le piège que la v2.2 nommait est réel et a été mesuré avant d'être évité. Une lecture qui ne
disposerait que de l'identifiant ne saurait pas si le pas suivant est une substitution, donc
appellerait `perfFor(id,false)` : en séance allégée, cibles poussées en haut de fourchette, elle
annoncerait 14 là où l'écran de série prescrit 20, et 30 là où il prescrit 45. Le remède n'est pas de
renoncer, il est de lire le pas et non son identifiant.

**Un instant se stocke en UTC, un jour civil se lit sur l'horloge locale (v2.6).** Les horodatages
d'export et d'import sont écrits par `toISOString()`, donc des instants absolus, ce qui est juste et
ne change pas. Leur affichage passait déjà par des accesseurs locaux. Mais partout où l'application
réduisait un instant à un jour ou à un mois, elle le faisait par `toISOString().slice()`, c'est-à-dire
en UTC. Deux découpages du même instant cohabitaient, et sur la même ligne : `weekCounts` calculait
la semaine ISO avec les accesseurs locaux et la clé du jour par une coupe UTC.

Trois conséquences, mesurées avant correction. Le nom du fichier téléchargé portait la veille entre
minuit et deux heures du matin l'été, une heure l'hiver, pendant que la card annonçait le jour même.
Une séance de nuit aurait été comptée la veille en jour actif tout en appartenant à la bonne semaine.
Et l'en-tête fermé de la card Données comptait en tranches de 86 400 s et non en jours civils : un
export fait la veille à 20 h se lisait « aujourd'hui » le lendemain matin à 8 h, juste au-dessus
d'une ligne qui affichait bien la veille. Ce dernier point mordait exactement sur l'usage que la card
sert, la sauvegarde vérifiée d'un coup d'oeil.

Trois formateurs, un par grandeur : `dayKey`, `monthKey`, `dayGap`. `today()` disparaît, il faisait
doublon avec `dayKey()`. L'écart en jours passe par `Date.UTC` des composantes locales, ce qui
neutralise les dimanches où une journée ne fait pas 24 h. C'est la règle du plafond de liste et celle
du formateur unique appliquées à une grandeur qui y avait échappé.

Sans effet sur les données de Gabriel, qui s'entraîne entre 8 h et 20 h : à Bruxelles, la date UTC et
la date locale d'une séance coïncident sur toute cette plage. L'export, lui, n'est borné par rien.

**Un plafond de liste se nomme, et une seule constante le porte (v2.2).** La card des dernières
séances en montrait douze sans le dire, ce qui laissait croire à un historique amputé. Le plafond
est juste, quatre séances par semaine en font plus de deux cents par an, mais il doit être annoncé.
Le texte et la coupe lisent la même constante : deux écritures du même nombre finiraient par
diverger, et c'est la même leçon que le format de liste de séries unifié en v1.16.

**Un formateur qui existe doit être le seul chemin (v2.2).** L'application porte deux formateurs de
nombre à virgule, `fmtNum` pour les charges et `fmtDur` pour les durées, et trois points d'affichage
de Progrès les contournaient en rendant le nombre brut, donc un point décimal : les rails de
couverture, la moyenne de jours actifs et le ratio tiré/poussé. Le défaut était invisible tant qu'on
ne posait pas une valeur formatée à côté ; il l'est devenu au moment d'ajouter le volume joué dans
la même card. Corollaire de la règle de v1.16 sur le séparateur de séries : ce qui se formate se
formate en un seul endroit.

**Un drapeau d'état est une valeur, jamais une absence (v2.3).** La validation du matériel retirait
le drapeau d'onboarding par suppression de clé. Le geste était sans effet au-delà de la session :
les deux chemins qui reconstruisent l'état, `loadState` et `applyImport`, partent de `defaultState`
où le drapeau vaut `true`, et `Object.assign` n'écrase que les clés présentes dans la source. Une
clé supprimée étant indiscernable d'une clé jamais écrite, le `true` de l'état neuf gagnait à chaque
lecture et le bandeau de bienvenue revenait à tous les rechargements, matériel validé ou non. Le
même défaut donnait un onboarding à toute sauvegarde antérieure à la v2.0 et à tout import, en
contradiction directe avec la règle écrite ici depuis la v2.0. Le drapeau est désormais abaissé à
`false` par la validation, et une sonde de forme dans `migrateState` l'abaisse quand l'objet brut ne
le porte pas. La règle de la v2.0 tient à la lettre, aucune migration ne crée le drapeau, elle ne
fait que l'abaisser quand rien ne le porte, et une sauvegarde de Gabriel se répare seule au premier
chargement.

Conséquence assumée, décidée avec le correctif : une sauvegarde écrite pendant l'onboarding porte
`true` et le garde à l'import. La règle de la v2.0 disait sans nuance qu'un import n'a pas
d'onboarding ; sa justification est qu'une liste pré-remplie se survole au lieu de se lire, or un
fichier exporté avant validation ne contient aucune liste déclarée. Le drapeau suit donc l'état
partout, ce qui est une règle au lieu de deux, et la sonde unique couvre les deux chemins d'entrée.
Écarté, conditionner le bandeau à un inventaire non vide : valider une carte vide est un acte
légitime déjà tranché, l'inventaire ne peut pas servir de signal.

Leçon de forme, générale et non limitée à ce champ : aucune clé de `defaultState` ne peut être
retirée par l'application. Balayage fait, `onboard` était la seule dans ce cas.

**Une suite qui fabrique son sujet ne teste pas son appelant (v2.3).** Le défaut ci-dessus vivait
sous une suite dédiée qui le manquait de deux façons. Elle vérifiait que la validation retire le
drapeau, mais en mémoire seulement, sans jamais relire l'état après : la seule chose que voit
l'utilisateur, le rechargement, n'était pas jouée. Et son contrôle « jamais créé par une migration »
construisait son sujet à la main, `Object.assign(defaultState(),vieille)` suivi d'un `delete` écrit
dans le test, exactement le geste que `loadState` ne fait pas. Elle mettait `migrateState` à
l'épreuve alors que le défaut vivait chez l'appelant. Règle qui en sort : un contrôle sur une
migration passe par le chemin d'entrée réel, `loadState` ou `applyImport`, et non par un état
reconstitué à la main ; et un état qui doit survivre se vérifie après un aller-retour par le
stockage, pas dans la variable.

**Ce que l'audit externe de la v2.2 n'a pas rouvert, et pourquoi.** Quatre points ont été confrontés
au carnet et au code, trois se referment sur des décisions déjà prises.

- *Saisie de la proximité de l'échec.* Le moteur implémente déjà la cible comme un plancher :
  `monte` exige que toutes les séries atteignent le haut de fourchette, et vingt répétitions sur une
  fourchette 8-12 déclenchent la montée exactement comme douze. Aucune sur-performance n'est perdue,
  et l'ajustement manuel de charge est persistant. Quant au mécanisme de saisie, c'est la forme déjà
  écartée trois fois, triage avant séance, validation qualité en trois boutons, question posée en
  pleine séance : pas de raison nouvelle. Reste vrai et non traité ici : nulle part l'outil n'écrit
  que la cible est un minimum. C'est du texte de présentation, pas un mécanisme.
- *Couverture musculaire trop affirmative.* L'instrument par muscle est écarté depuis la v1.15, avec
  sa raison. Les quatre libellés affichés sont déjà des schémas moteurs et non des muscles ; il ne
  reste qu'un mot de titre, non tranché.
- *Accessoires occupant seuls leur famille.* Le seul point qui apporte du neuf, et il a été mesuré
  sur le cycle complet à domicile, verrous fermés. Une séance sur trois n'a pas de poussée
  horizontale, une sur deux pas de tirage dos, une sur cinq ni quadriceps ni charnière. Surtout,
  les deux premiers coïncident toujours : 10 tirages sur 30 n'ont ni poussée horizontale ni tirage
  dos, là où des compteurs indépendants en donneraient 5. La cause n'est pas la composition des
  viviers, c'est le verrouillage de phase, qui apparie élévations latérales et face pulls, et qui
  est déjà le chantier 1 de la file d'attente. Une fois la traction pronation débloquée le cumul
  tombe à 15 sur 105. L'audit ne crée donc pas de chantier, il remonte la priorité d'un chantier
  existant.
- *Validation technique manuelle de la charnière de hanche.* La v2.1 y a déjà répondu autrement, en
  plafonnant les swings au niveau courant du soulevé roumain : on ne lance pas en balistique plus
  lourd qu'on ne tient en contrôlé. Une déclaration de l'utilisateur serait encore la forme écartée
  ci-dessus, avec en prime l'auto-évaluation que l'audit signale lui-même comme un coût.

**Quand l'illustration contredit le texte, c'est l'illustration qui est lue (v2.4).** L'étape
d'échauffement de nuque partageait son illustration avec l'étirement `etir-nuque`. Les deux gestes
n'ont rien de commun : balayage continu du menton d'une épaule à l'autre d'un côté, inclinaison
latérale tenue 20 s de l'autre. Le titre disait « rotations », la consigne décrivait des
demi-cercles, et le geste a quand même été mal exécuté pendant des semaines. L'étape reçoit donc
une illustration dédiée, `echauf-nuque`, l'ancienne restant à son exercice. Le libellé bouge en même
temps, « Rotations de nuque très douces » devient « Demi-cercles de nuque » : une rotation de nuque
désigne habituellement le fait de tourner la tête pour regarder par-dessus l'épaule, ce qui n'est
pas le geste demandé, et corriger l'image sans corriger le mot aurait laissé la moitié du piège en
place. L'ancienne `etir-nuque` n'illustrait d'ailleurs pas non plus son propre exercice, personnage
debout, tête droite, haltère en main, probablement dérivé du champ `mus:'Cou, trapèzes'` lu comme
des haussements d'épaules ; elle est remplacée sous la même clé. La consigne de l'étirement passe
en version assistée par la même occasion : le texte promettait déjà une « traction très douce », or
une traction suppose une main et le seul poids de la tête ne tire presque rien. L'assistance résout
une incohérence préexistante, elle n'ajoute pas une exigence, et la ligne de vigilance couvrait déjà
le risque.
Arbitrage sur l'arc de mouvement, tranché par Gabriel : l'arc haut, au-dessus du crâne, qui trace le
sommet de la tête, contre l'arc bas collé sous le menton, qui trace le trajet du menton. Les deux
sont géométriquement exacts. L'argument contre l'arc haut était son ambiguïté, une génération issue
du même prompt ayant dessiné la tête renversée visage vers le ciel ; c'est la consigne écrite qui
porte la sécurité, avec « jamais la tête en arrière à fond ».
Cas voisin écarté : « Marche dynamique sur place » emprunte l'image de `marche-continue`, le module
cardio. Les deux gestes sont proches, le seul repère distinctif serait les bras fléchis et actifs.
Pas de quoi lancer une génération.

**Une illustration entre par le pipeline, jamais à côté (v2.4).** Les deux images de nuque avaient
d'abord été traitées à la main, 720 px de large et qualité 88, sans passer par `prep_illus.py`.
Mesuré sur la banque : les 47 illustrations héritées portent toutes la même table de quantification,
somme de luminance 1031, celle que produit `quality=86` optimisé, et toutes font 720 px de large.
Deux images à 884 étaient la seule dérive de la banque. L'objection soulevée contre le repassage
était mesurée elle aussi : `prep_illus.py` recadre au plus juste, et deux personnages debout côte à
côte donnent un format portrait, donc la règle de rembourrage latéral ramène la sortie au carré, ce
qui fait passer les deux images de 720×540 et 720×480 à 720×720 et coûte, en vignette `cover` 74×52,
le passage de 94 et 100 % de hauteur conservée à 70 %, tête coupée. Elle ne tenait pas : la banque
comptait déjà treize images carrées, dont l'image maîtresse `goblet-squat`, qui subissent exactement
le même rognage. Le rognage de vignette est le comportement normal du format carré et non une
régression introduite ici. Décision : le pipeline s'applique sans exception, la banque redevient
homogène sur ses 49 entrées, et le gain de lisibilité sur la fiche est réel, le dessin y gagnant
1,39 et 1,56 fois sa hauteur.

**Une fiche dit où l'exercice en est, d'où il vient et où il va (v2.4).** La fiche disait où en était
l'exercice aujourd'hui, jamais son histoire ni sa suite. Trois blocs repliés par défaut la
complètent, et tout s'y reconstruit par lecture pure : `state.hist` porte déjà, par passage et par
exercice, la charge et le barreau d'avant séance, donc la chronologie est rétroactive sur les
séances déjà jouées, sans nouveau modèle de données.
Écarté d'emblée, une courbe de répétitions dans le temps : à chaque montée la cible retombe au bas
de fourchette, donc la courbe plongerait exactement quand la progression a lieu. L'unité de lecture
monotone est le palier, pas la répétition, qui est un cycle interne au palier.
*Où j'en suis* porte le barreau courant, la position chiffrée, la marche suivante et sa condition de
déclenchement écrite dans les termes exacts d'`applyProgress`. Fenêtre de trois marches de chaque
côté et non l'échelle entière : celle des haltères en compte 26, mesuré, et les afficher toutes
noyait la position qu'elles servaient à montrer.
*Progression* porte deux registres. Le chemin des paliers, entier et jamais tronqué, montées et
descentes distinguées ; il est rare par nature, une dizaine d'entrées par an au plus, et c'est lui
qui porte l'arc. Puis les passages, trois visibles et douze au maximum. Le premier registre est ce
qui autorise à borner le second : sans lui, la troncature effacerait le début de l'histoire, qui est
la partie motivante. Volumes qui ont fondé le cap de douze : viviers de 3 exercices en poussé, 5 en
tiré, 6 à 8 en jambes, 5 à 7 en gainage ; un exercice ressort tous les 3 passages en poussé, tous
les 5 à 8 ailleurs ; à 4 séances par semaine, environ 70 passages par an sur les pompes et 35 à 42
sur le reste, et l'historique n'est jamais purgé. Les passages portent leurs marqueurs, allégée,
quittée, partielle : sans eux, trois lignes récentes peuvent raconter une régression qui n'existe
pas. Les séances où l'exercice a été remplacé par son repli apparaissent en ligne grisée cliquable à
leur date, puisqu'elles sont enregistrées sous l'identifiant du repli ; sans cette seconde lecture,
la fiche laisse un trou qui se lit comme une absence d'entraînement alors que la séance a eu lieu.
*Verrou* porte les deux sens : ce qui bloque l'exercice, avec l'état à la dernière séance et la
variante `bandGate`, et ce qu'il ouvre, avec la mention du remplacement en rotation quand `retire`
est renseigné. **Pas de barre de progression**, décision explicite : la condition se lit sur la
dernière séance et non sur un maximum historique, donc une barre reculerait après un passage moyen
et se lirait comme une perte alors que rien n'est perdu. C'est le même argument qui a chassé `best`
des déblocages en v1.15.
« Repères par exercice », dans Progrès, n'est pas remplacé. Progrès répond à « où en est
l'ensemble » et sert d'index vers les fiches, la fiche répond à « d'où vient celui-là ». Risque à
surveiller : que les deux dérivent vers le même contenu. « Repères » reste donc à une ligne par
exercice, sans historique.

**Ce qui n'est pas rejouable s'écrit au moment où il est vrai (v2.4).** La fourchette des exercices
dont le palier est la fourchette n'était écrite nulle part, et un rejeu a posteriori divergerait dès
le premier palier tenu : la montée dépend de `full`, de la grâce post-montée et du palier tenu, dont
aucun n'est historisé. D'où `it.rng`, seul champ ajouté, écrit sous la garde `!e.bnd && (mode bw ou
time)`, soit dix-huit exercices sur quarante-six. Les autres ont déjà `load` ou `band`, et un
exercice à bande progresse par la bande même si son mode est `bw` : la garde suit l'ordre des
régimes d'`applyProgress`, charge, bande, charge fixe, puis fourchette, ce qui donne exactement un
régime de palier par exercice porteur d'échelle, propriété testée. Un seul point d'écriture suffit,
contrairement à ce qui avait été annoncé en conception : vérification faite dans `corrigerSeance`,
la correction ne réécrit que `sets` sur les items, `load`, `band` et `rng` y survivent intacts.
Conséquence assumée : pour ces dix-huit exercices le chemin des paliers démarre à la première séance
suivant la mise à jour. Aucune reconstitution, une date inventée vaudrait moins que son absence, et
un message le dit sur les fiches concernées.

### Escalier des mollets, et la charge dans un verrou (v2.5)

`mollets-debout` plafonnait à 30 pour une fourchette 12-25, ce qui fabriquait six marches, 12-25
puis 13-26 jusqu'à 17-30. Cinq d'entre elles n'étaient une progression pour personne : c'est le
comportement générique du moteur quand aucune échelle n'est branchée, la fourchette étant le seul
levier qui lui reste. Le plafond vaut désormais le haut de fourchette, comme la planche et le
gainage latéral, et l'exercice ouvre sur un successeur.

**Recensement préalable.** Dix positions tirables atteignaient un plafond sans successeur outillé.
Six sont de vraies impasses, `mollets-debout`, `pont-fessier`, `step-ups`, `rowing-suspension` et les
deux tractions strictes. Quatre sont assumées et déjà justifiées ailleurs dans ce carnet, bird-dog et
dead bug parce qu'on n'y met jamais de lest, planche sur ballon et gainage jambe levée par la dette
sur `mode:'time'` (pour la jambe levée, dette soldée en v2.19 par disparition de sa marche). `pont-fessier` a exactement le même profil que les mollets et la même marche
écrite, « passe sur une jambe » : le mécanisme construit ici s'y transpose tel quel.
Correction v2.16 : ce recensement confondait deux questions. « Jamais de lest » justifie l'absence
de successeur lesté sur bird-dog et dead bug, pas la conservation de leurs relèvements fantômes,
6-12 puis 7-13 puis 8-14, que rien ne justifiait et que personne n'avait examinés. Les deux
n'étaient pas assumés, ils avaient été oubliés, avec neuf autres entrées. Voir « Le plafond vaut le
haut de fourchette ».

**Quatre échelons plutôt que deux.** La conception a d'abord retenu un seul successeur, sur une
jambe, au motif que le passage sur une jambe donne +100 % de charge par mollet gratuitement là où
tout le stock déclaré n'en donne qu'un quart. Cet argument était mauvais et a été retiré : une marche
d'escalier n'a pas à atteindre le palier suivant, sinon ce n'est plus un escalier. Charge par mollet
pour 78 kg de poids de corps, à deux jambes 39 kg puis 44, 49, 54, 59 avec le sac, sur une jambe
78 kg puis 88, 98, 108, 118. Le plus grand saut vaut +32 % au lieu de +100 %. L'escalier répare en
outre un trou signalé pendant la conception : il n'existe aucune descente sous la fourchette de base
d'un exercice au poids du corps, donc un mauvais atterrissage sur une jambe se solderait par une
cible figée sans signal ; arriver sur une jambe depuis 25 répétitions à 49 kg par mollet le rend
improbable.

**Le pas de charge vaut 10 kg, et cinq a été mesuré puis écarté.** Un barreau doit valoir au moins
dix pour cent de ce que porte le mollet, et ce mollet porte le poids du corps : 10 kg est le plus
petit nombre rond qui satisfait la règle de 65 à 90 kg, que le mollet travaille seul ou à deux, la
charge et la base doublant ensemble. Un pas de 5 kg a été proposé au nom de la cohérence en kilos par
mollet, +10 à deux jambes valant +5 par mollet. La méthode qui avait écarté le micro-palier des
haltères en v2.1 tranche dans l'autre sens : le cliquet ramène la cible au bas de fourchette à chaque
montée, donc le prix en répétitions est fixe et le gain en charge ne l'est pas. Sur une jambe,
fourchette 8-15, un saut de 10 à 15 kg gagne 5,7 % de charge et coûte 43,6 % de tonnage, un saut de
10 à 20 kg gagne 11,4 % et coûte 40,6 %. Même verdict qu'au développé au sol, le petit palier coûte
plus et rapporte moitié moins. La cohérence recherchée existe d'ailleurs déjà, en pourcentage plutôt
qu'en kilos : 10 kg valent +11,4 % par mollet dans les deux variantes.

**La chaîne kettlebell ne convenait pas, pour une raison de base de calcul.** Celle du rowing
kettlebell compte quinze barreaux de 10 à 20 kg et elle est bien construite, pour un exercice où
l'engin EST la charge : 10 vers 11 kg y vaut +10 %. Sur un mollet l'engin s'ajoute au poids du
corps, 10 vers 11 kg y vaut +1,3 %. Même échelle, sens dix fois plus petit, donc échelle différente.

**Le sac plutôt qu'un poids tenu, pour l'épaule d'abord.** Quinze répétitions par côté avec vingt
kilos au bout d'un bras tirent sur la gléno-humérale, ce qui est une contrainte structurante et non
une gêne de confort. S'y ajoutent la préhension, qui avait déjà fait refuser les mollets debout à
l'élastique, et les deux mains libres pour l'équilibre sur une jambe au bord d'une marche.

**La fourchette unilatérale est 8-15 et non 12-25.** La règle du carnet veut que les fourchettes
soient choisies par nature d'exercice, et 12-25 y est écrit pour les mollets. Deux mesures
l'emportent ici. Tous les exercices `side:true` comptés en répétitions plafonnent à 15 ou moins, sans
exception ; et un unilatéral vaut deux fois le travail dans le modèle de temps, si bien que 25 par
côté coûterait 9,3 min à trois séries pour une séance annoncée entre 19 et 27 min. La règle n'est pas
contredite mais lue par membre : 15 répétitions sous le poids du corps entier valent mieux que 25
sous la moitié.

**Le sac à dos n'est pas une ressource déclarable.** Le critère posé en v2.0 ne retient une ressource
que si l'exercice exige une garantie que le mobilier courant n'offre pas. Un sac est toujours sous la
main, même registre que la chaise. Ce que l'exercice exige, c'est du poids à mettre dedans, d'où
qu'il vienne : d'où la clé `masse`, entièrement dérivée, sans interrupteur à elle, servie dès que
l'inventaire déclare le premier barreau. Un profil ne déclarant qu'une kettlebell de 10 kg y a donc
accès, ce qu'un `NEEDS` en haltères aurait interdit. `masseMobilisable` somme disques, barres,
kettlebells et lestes, chaque famille restant soumise à son drapeau, et sert à trois choses : décider
si la position est servie, engendrer les barreaux, fixer le plafond. Aucune constante de plafond à
maintenir.

**La marche n'est ni une ressource ni un exercice séparé.** L'amplitude n'est suivie nulle part dans
l'outil, ni la profondeur de squat ni celle des pompes, et la marche suivante du tirage en suspension
est déjà une amplitude non outillée sur un exercice de vivier. En faire une ressource créerait la
seule déclarable qui décrive un angle. Elle vit dans la fiche, avec sa hauteur utile, 7 à 10 cm : le
talon descend du produit de la distance métatarses-talon par le sinus de l'angle de flexion dorsale,
soit 7,6 à 8 cm pour un pied adulte à 25°, l'angle du protocole de référence. Au-delà c'est la
cheville qui limite, pas la marche. Le critère écrit sur la fiche prime sur le calcul : la bonne
hauteur est celle où le talon arrive en fin d'étirement sans toucher le sol. La chaîne `SUBS` n'est
pas concernée non plus, elle résout une position qui ne peut pas être servie et non une exécution
dégradée : sans rebord les mollets se font quand même, sans marchepied un step-up ne se fait pas du
tout.

**Un verrou sait désormais lire une charge.** Il ne comparait que des répétitions, si bien qu'un
successeur posé derrière un exercice à charge s'ouvrait au premier barreau et retirait son
prédécesseur avant qu'il ait servi. Le champ `loadTop` ajoute une conjonction après le compte de
séries, donc sans toucher aux gardes de provenance. La charge exigée est le dernier barreau de
l'échelle **filtrée par l'inventaire**, à l'inverse de `bandGate` juste au-dessus qui lit l'échelle
entière : là-bas la bande la plus dure EST la preuve, ici l'exercice ouvert ne demande aucun matériel
et un seuil absolu enfermerait un inventaire pauvre dans un état dont il ne pourrait plus sortir,
contre la règle de la v1.15.

**Deux erreurs de conception que les tests ont attrapées, et qu'il vaut mieux consigner.** Le repli
de `mollets-une-jambe-leste` visait d'abord `mollets-debout-leste`, exercice verrouillé : `test11`
l'a refusé, et il avait raison, un repli douleur doit être atteignable à tout instant. Les trois
échelons replient donc sur `mollets-debout`, seul maillon sans verrou, ce qui est aussi le motif des
fentes lestées. Et l'écrêtage de fourchette à la migration ne ramenait que le haut, ce qui donnait
13-25 sur un état hérité en 13-26, fourchette que l'échelle ne reconnaît pas davantage puisqu'elle
n'a qu'une marche : un relèvement fait monter les deux bornes ensemble, elles redescendent donc
ensemble.

**Un verrou lit le dernier passage, et le niveau s'ajoute en conjonction (v2.12).**
La v1.15 avait chassé `best` des déblocages : un verrou prouve une capacité actuelle,
jamais un maximum historique. Deux verrous y échappaient encore, ceux des tractions
strictes, qui lisaient `bandBest`, maximum des répétitions au barreau courant. La
branche portait en outre son propre comptage de répétitions, en face de celui de tous
les autres verrous. Elle a fondu dans la lecture commune : un seul comptage, puis deux
conjonctions de niveau, le barreau de bande et la charge, exactement la forme que
`loadTop` avait prise en v2.5.

Ce que `bandBest` protégeait sans le dire, c'est sa **remise à zéro** au changement de
barreau : elle garantissait que les répétitions comptées avaient été faites au barreau
courant. Lire `p.sets` sans plus de précaution rouvrait le trou, `applyProgress`
écrivant les séries **puis** pouvant monter la bande : une séance jouée au barreau
précédent aurait été créditée au barreau le plus fin. D'où `p.setsBand`, le barreau
écrit avec les séries et avant toute progression, sur le modèle d'`it.rng` en v2.4.
Ce qui n'est pas rejouable s'écrit au moment où il est vrai.

Aucune reconstitution pour les états hérités : sans barreau enregistré, le verrou
attend le prochain passage. Une valeur devinée vaudrait moins que son absence, et la
fiche le dit à l'utilisateur au lieu de le taire.

**Une correction défait des conséquences, jamais des décisions (v2.12).**
La correction restaure l'instantané d'avant séance puis rejoue, pour ne pas défaire
champ par champ et n'oublier aucune dépendance. Elle effaçait du même geste ce qui
n'était pas une conséquence de la séance : un palier tenu posé ou libéré **après**,
depuis le récapitulatif, la fiche ou le mode entretien. Ces gestes sont relevés avant
la restauration et reposés après le rejeu. L'ordre compte et il est le seul juste : la
séance s'est jouée sous l'état d'avant, la décision de l'utilisateur lui est
postérieure.

Et ce qu'elle défait vraiment, elle le dit. Les messages de progression recalculés
s'affichaient seuls, si bien qu'une montée ou un déblocage disparaissait sans un mot.
Un bloc distinct les nomme. Distinct et non mêlé : un message d'annulation au milieu
de messages de progression se lit comme une progression.

**Le journal enregistre, il ne décide pas (v2.12).**
Trois champs ajoutés à l'entrée d'historique, et rien qui les lise. `roundsPlan`, les
tours annoncés au lancement, là où `rounds` porte le réalisé, les deux divergeant
depuis le changement de volume en cours de séance. `it.tgt`, la cible visée ce jour-là,
que rien ne permettait de rejouer, la montée dépendant de `full`, de la grâce et du
palier tenu, dont aucun n'est historisé. `it.secs`, la durée de chaque série.

La durée est **brute** : ni plancher, ni écrêtage, ni nettoyage, à la différence de
`real` qui porte un plancher d'une minute parce qu'une séance d'une seconde est un
artefact. Une série de huit secondes, elle, est une information. Nettoyer à l'écriture
enfouirait un jugement dans la donnée, ce qu'un instrument de mesure ne doit jamais
faire.

Ce qu'elle mesure est assumé et borné par l'observable : de l'arrivée sur l'écran de
série à la validation, installation comprise, soit exactement ce que le modèle de temps
représente pour cette série. L'outil ne voit pas le début de l'effort. Une interruption
en pleine série pollue la valeur et l'outil ne le saura pas : c'est le prix, et il est
cohérent avec le marqueur de séance perturbée, écarté au tableau des abandons. Le temps
passé sur un écran de transition, lui, n'entre dans aucune durée de série, ce qui rend
propre par construction l'habitude de prolonger une transition plutôt que de
s'interrompre au milieu d'une série.

Aucun signal n'est câblé dessus dans ce lot, et une suite le vérifie sur le texte des
fonctions du moteur. La cadence, annoncée comme meilleur proxy d'effort disponible, ne
le sera pas telle quelle : une interruption longue se lirait comme une cadence lente,
donc comme « loin de l'échec », soit l'inverse de la vérité. Ce qu'on fera de ces
champs se décidera sur des données, pas sur une intention.

**Une règle d'arrêt a sa ligne, et un texte unique se révèle progressivement (v2.12).**
Le critère de fin de série vit dans un champ `fin` propre, ni dans `desc` qui décrit le
geste, ni dans `vig` qui nomme ce qui est en jeu sur le corps. Sept fiches le portent,
celles où l'échec technique arrive avant l'échec musculaire ; toutes portent la règle
générale et un lien vers le texte complet. Le répéter partout le ferait lire nulle part.

« Comment ça marche » est un seul texte, quatre blocs courts depuis la v2.14, portant chacun son
développement replié sur place. Il s'affiche sur l'accueil tant qu'il n'a pas été lu et
un bouton le retire définitivement, sur le modèle du bandeau de matériel : un texte
constant affiché à chaque lancement devient du bruit, et c'est l'argument qui avait
écarté le résumé de volume sur l'accueil. Réglages le garde en permanence, déplié. Un
seul rendu sert les deux endroits, sans quoi les deux textes divergeraient.

**Propositions définitivement abandonnées (septembre 2026).**
Écrites une fois pour ne pas être rouvertes. Le motif compte autant que le rejet.

| proposition | motif |
|---|---|
| Exiger les tours prévus pour valider une montée de charge | Punit la déclaration honnête : annoncer 2 tours donne la montée, descendre honnêtement de 3 à 2 la refuse. Viole le principe d'architecture en tête de section. Retirée par les auditeurs eux-mêmes après confrontation au principe. |
| Bouton « ne pas prendre en compte cette séance » | Même faille, plus une décision imposée à l'utilisateur sur ses propres données. |
| Champ RIR ou RPE déclaratif | Donnée invérifiable. Si elle décide, incitation à mal déclarer ; si elle ne décide pas, elle ne sera pas saisie. |
| Mode allégé activable en cours de séance | Déclaration a posteriori, même faille. |
| Doublage de poste, séance tiré/tiré puis poussé/poussé | Mécaniquement élégant, la rotation étant préservée à l'identique, c'est du report et non du retrait. Réfuté par la mesure : les paires intra-vivier conflictuent bien plus que les paires inter-vivier, un vivier étant par construction un groupe de fonction partagée. Poussé 0/3 paires propres, tiré 1/10, contre 2/15 pour poussé × tiré. Sur deux séances, 4,53 conflits en normal contre 5,15 avec doublage. |
| Séances à 3 exercices par retrait | Bloque la rotation de l'exercice retiré, qui revient à la séance suivante et recroise le même partenaire. Le report du doublage était meilleur sur ce point précis, et c'est ce mécanisme qu'il faudra si un évitement est un jour retenu. |
| Exclusion de paire au tirage | Possible en deux lignes, contrairement à ce qui avait été affirmé en séance, mais rendue sans objet par la pause au raccord et par la recomposition du vivier poussé. |
| Ordre du circuit recalculé par séance | Corrèle systématiquement la position à la composition, donc crée un biais orienté au lieu d'une variation neutre. Objection affaiblie mais maintenue : avec un ordre fixe, l'exercice précédent varie déjà, donc la comparabilité n'est satisfaite qu'approximativement. |
| Abaisser la fourchette 12-20 des élévations latérales | Refusée par Gabriel. L'argument qui la soutenait, 8 passages minimum et 6 semaines par cran, supposait le régime permanent, dans lequel il n'est pas encore. Voir la phase de calibration en section 1. |
| Transition globale portée de 5 s à 15 s | Mauvais ordre de grandeur : le déficit est de 60 à 90 s de récupération deltoïdienne, pas de 10 s. Réglé par l'ordre du circuit, qui porte l'intervalle à 52-112 s sans rien coûter. |
| Pause de raccord inconditionnelle | Livrée en v2.10, retirée en v2.11. Réparait une adjacence jamais signalée, sur la foi d'une table de jugement, au prix de 90 s de temps mort par séance. Voir l'entrée « Pause au raccord de tour ». |
| Catalogue vidéo par exercice | Trop de curation pour un résultat périssable. Remplacé par des repères écrits dans les champs `desc` et `vig` existants, qui portent déjà l'essentiel. |
| Crans d'assise de 2,5 cm sur le squat sur une jambe (septembre 2026) | Refusé par Gabriel : après 15 répétitions à 50 cm, les muscles sont prêts pour 8 à 40. Cinq crans coûtaient cinq traversées de fourchette pour des marches à peine sensibles. |
| Escalier du squat en trois fiches, 50 cm, 40 cm, lestée | Une seule image pour les deux hauteurs, décision de Gabriel : la hauteur est donc un palier du même exercice, comme la tenue du bird-dog ci-dessous. |
| Séances hybrides box pistol et goblet squat | Idée de Gabriel, saine sur le fond. Deux passages amputés que le moteur lit comme partiels, donc sans progression, et un état de transition à stocker et piloter. L'assise haute dose l'entrée plus simplement. À rouvrir si l'entrée reste trop rude. |
| Pistol complet après l'assise à 40 cm | Flexion lombaire fréquente en bas du mouvement, profondeur non bornée. La cheville n'est pas en cause. |
| Squat bulgare successeur du goblet squat | C'est une fente : il reste la marche des fentes lestées, et y entre déjà lesté. |
| Fente arrière en déficit comme successeur des fentes lestées | L'amplitude n'est suivie nulle part, ce serait une consigne de fiche. |
| Verrou du squat sur une jambe à 22 kg | Neuf points de saut gagnés contre trois barreaux à 2 % et plusieurs mois de montée. |
| Successeur « bird-dog tenu » comme fiche séparée (septembre 2026) | Rien ne change à part la tenue : mêmes positions, même image. Ce serait une variante du même mouvement, interdite par la règle des viviers. La tenue est un palier du même exercice, pas un exercice. |
| Quatre tenues au format McGill, 8-10 s répétées en pyramide | Refusé par Gabriel : dose de rééducation pour dos douloureux, pas dose d'entraînement, qui va de 20 à 60 s continues. Le plafond v1.17 à 45 s tient. Faisait aussi disparaître la latence du Stop par construction ; le rognage y répond à la place. |
| Bip toutes les 5 s comme mesure de tenue | Neutre pour le moteur, mais une tenue lâchée entre deux bips dont le Stop franchit le suivant est créditée du bip : mieux, pas réglé. Le rognage règle. Distinct du repère sonore de la v2.20, qui ne mesure rien. |
| Cohérence cardiaque après les étirements (septembre 2026) | Idée de Gabriel, sur son app `https://cc.s1t3.link`, 55 BPM, 5 temps par phase. Discutée comme module puis comme simple lien au récapitulatif, maquettée, puis abandonnée entièrement par Gabriel le 25 septembre 2026. Arguments sur la table : séances réelles déjà au-dessus de la disponibilité de 10 à 20 minutes, bénéfice modeste après une séance modérée, app dédiée qui reste l'outil des séances hors entraînement. |

### Escalier du pont fessier, et le lest qui monte de l'amplitude entière (v2.13)

Deuxième des six vraies impasses recensées en v2.5, et la dernière à profil identique à celui des
mollets debout : plafond à 25 pour une fourchette 10-20, cinq relèvements fantômes, marche écrite
« passe sur une jambe » qui doublait la charge. Le mécanisme des mollets s'y transpose, et le
plafond vaut désormais le haut de fourchette.

**Le calcul refait, et l'erreur qu'il corrige.** Le premier chiffrage ajoutait le lest au poids du
corps comme s'il en était : 10 kg sur 78 valaient 13 %, et il fallait donc quatre barreaux, 10, 20,
30 et 40, pour combler le trou avant le passage sur une jambe. C'est faux, et Gabriel l'a relevé.
Ce qui monte au poids du corps le fait d'une demi-amplitude, le tronc pivotant sur les épaules et la
cuisse sur le genou ; la charge posée sur le bassin, elle, monte de l'amplitude entière. Elle compte
donc double. Dix kilos sur les hanches valent vingt kilos de poids de corps, soit **+33 % de
résistance**, indépendamment de l'amplitude exacte. Par jambe, le pont lesté à 10 kg ne vaut pas
26,4 kg mais l'équivalent de 31,3.

Conséquence : deux barreaux suffisent là où quatre étaient prévus. Sauts obtenus, en résistance par
jambe, +33 %, +25 %, puis +21 % pour le passage sur une jambe, contre +100 % sans barreau
intermédiaire. Le plus gros saut de la chaîne est ailleurs, +50 % à l'entrée du hip thrust, et il
est absorbé par le cliquet, qui ramène au même moment la cible de 15 à 8, soit 47 % de volume en
moins.

**Le plafond est une constante, seul endroit du catalogue où la masse déclarée ne décide pas seule.**
L'objection posée en v2.5 contre un plafond écrit visait une constante qui *remplace* l'inventaire ;
ici l'inventaire borne toujours par le bas, une kettlebell de 10 kg ne donne qu'un barreau. Ce qui
justifie la constante n'est pas le même motif sur les deux fiches, et c'est pourquoi elle vaudra
peut-être deux valeurs un jour. Sur `pont-fessier-leste` la raison est **structurelle** : à +30 kg
le pont bilatéral vaut déjà le pont sur une jambe et à +40 il passe au-dessus, donc au-delà de 20
l'escalier cesse d'être monotone et la marche suivante devient un doublon puis une régression. Le
dernier barreau est celui qui reste strictement sous la marche suivante. Sur
`hip-thrust-une-jambe-leste`, dernier maillon, aucune marche ne suit et la raison est de **montage**,
documentée par un micro-rapport de Gabriel : une charge improvisée sur le bassin cesse d'être stable
bien avant d'être insuffisante. Seule celle-là pourra bouger.

**Pourquoi pas `fixedCap`.** Le mécanisme existait et ne convenait pas : `checkUnlocks` lit le
dernier barreau sur `fixedLadder` **sans** appliquer le plafond, quand `applyProgress` le respecte
pour monter. Un `fixedCap` à 20 sur une échelle qui en propose 40 aurait produit une charge plafonnée
à 20 et un verrou exigeant 40, c'est-à-dire un exercice jamais débloqué. Le plafond vit donc dans la
branche d'échelle, que le verrou lit.

**Ce qui reste hors de l'escalier.** Le pied surélevé vaut environ +45 %, le même ordre que le hip
thrust et pour la même raison, l'amplitude : un doublon moins stable, il vit dans la fiche comme la
hauteur de marche des mollets. L'objection que `step-ups` et `step-ups-bas` prouveraient le
contraire ne tient pas tout à fait : ce sont deux hauteurs servies comme deux **ressources**, l'une
étant le repli de l'autre, et aucun verrou n'y compare jamais des répétitions faites sur l'une et
sur l'autre. C'est cette comparaison, et elle seule, que l'amplitude interdit.

**`pont-fessier-une-jambe-leste` écarté.** À +10 kg il rendrait +33 %, puis ne laisserait que +12 %
au hip thrust : deux barreaux collés au prix d'une fiche, d'une illustration, de tests et d'une
traversée de fourchette, soit plusieurs mois avant d'atteindre le hip thrust. Il reste l'intermédiaire
à insérer si l'entrée dans le hip thrust se révèle trop raide à l'usage, et c'est un ajout de fiche,
pas un changement de mécanisme.

**Trois impasses restent ouvertes**, `step-ups`, `rowing-suspension` et les deux tractions strictes,
dont les marches écrites sont des lestes ou une amplitude.

### La cible a une mémoire de deux passages (v2.14)

**Le problème d'origine, en une phrase.** La cible suivante valait la plus petite série du dernier
passage plus une : sur une fourchette 12-25, quatre passages à 12, 13, 14, 15 portaient la cible à
16, et une séance hors forme à 12 la recalait à 13, sans un mot. Constaté par Gabriel à la lecture
du texte « Comment ça marche », pas déduit du journal.

**Ce qui était vrai et ce qui ne l'était pas.** Mécaniquement, ce recul ne pénalisait pas la
progression : la montée de charge lit le haut de fourchette (`sets.every(v=>v>=top)`), le filet
lit le plancher, les XP se comptent par série, les verrous lisent le dernier passage, et aucun
d'eux ne lit la cible. La cible n'entre que dans le préremplissage de la saisie, la pastille
Cible, les bips d'approche des tenues, le modèle de temps et la réduction de la séance allégée.
Un 16 au passage suivant rendait la cible à 17 : coût réel d'une mauvaise séance, zéro passage et
trois appuis sur « + ». Ce qui était vrai, c'est l'ancre : une valeur préremplie ancre, et sur les
tenues le bip à la cible est une ancre audible. Et il n'y avait pas d'asymétrie : le « plus un »
n'est pas une vitesse de montée, c'est l'incrément minimal quand on tient exactement la cible, 20
sur une cible à 16 donnait 21. La cible suivait la dernière lecture dans les deux sens.

**Ce que le principe d'architecture impose, et ce qu'il n'impose pas.** Décider sur l'observable
n'oblige pas à oublier l'avant-dernier passage : un horizon d'exactement un passage était un
choix, pas une conséquence. La règle retenue est la fenêtre de deux passages, **cible = plus haute
des deux dernières lectures au palier courant, plus une**, chaque lecture étant la plus petite
série de son passage. Une mauvaise séance est absorbée, deux consécutives font redescendre, au
meilleur des deux et non au dernier. Déterministe, sans déclaration, deux historiques identiques
donnent la même cible. Sur l'exemple : 12, 13, 14, 15 puis 12 laisse la cible à 16 ; un 16 ensuite
donne 17, un 13 donne 14 ; à cible 18, 14 puis 13 donne 15.

**Écarté, le cliquet** qui ne redescend jamais dans la fourchette. Il ment après toute vraie
régression, trois semaines d'arrêt, maladie, charge montée un cran trop vite : la cible resterait
à 24 pendant qu'on fait 14, et rien ne la ramènerait tant qu'on ne s'effondre pas sous le
plancher. C'est le cas « un état atteignable dont on ne peut pas sortir », fermé deux fois dans ce
carnet. Et garder 16 après un 12 exige de savoir que c'était une mauvaise journée et non une
régression, ce que l'outil n'observe pas : c'est le RPE déclaratif du tableau des abandons. La
séance allégée, choisie **avant** de lancer, reste la seule forme de « mauvaise journée »
compatible avec le principe, et elle gèle déjà la cible dans les deux sens.

**Ce que le filet fait déjà, et que la mémoire de Gabriel avait fusionné.** Le filet redescend le
palier quand toutes les séries d'un passage sont strictement sous le plancher, sur un seul
passage, sauf le premier après une montée, gracié depuis la v1.15. Le critère est le plancher et
non la cible, la mémoire est une exception post-montée et non la règle. La fenêtre de cible ne
touche pas au filet.

**La mémoire, `p.prevMin`.** Écrite sur toute lecture exploitable et complète, palier tenu compris,
c'est une observation et non une décision, et à la libération du palier le passage suivant la
lit. Jamais écrite sur une lecture partielle, le minimum d'un passage amputé étant biaisé vers le
haut, motif déjà retenu pour interdire la descente sur journal tronqué ; jamais sur une lecture
allégée ou non qualifiée, qui sortent avant. Remise à zéro à tout changement de palier, montée,
descente du filet, relèvement ou descente de fourchette, et ajustement manuel de charge ou de
bande quand le niveau change réellement : une lecture faite à un autre palier n'est pas
comparable. Sans cette dernière remise à zéro, en calibration, un saut de charge à la main
garderait un passage la cible de l'ancienne charge, inatteignable. Effet assumé : un ajustement
par mégarde suivi d'un retour dans la même séance perd la mémoire, coût un passage ; un
ajustement sans effet, en butée d'échelle, la conserve. Après une descente, la lecture du jour a
été faite à l'ancien palier et la mémoire ne joue pas : la cible retombe au bas de fourchette.
Absente, pas de mémoire. Amendé en v2.15 : la v2.14 ne migrait rien, au motif qu'une valeur
devinée vaut moins que son absence ; l'audit externe a montré que chaque exercice revivait alors
une fois le recul silencieux, sur plusieurs semaines de transition, et que `p.sets` n'est pas une
valeur devinée mais la dernière lecture enregistrée. Voir « La mémoire se sème à la migration ».
« Tenir ce palier » recalcule la mémoire depuis le passage joué au palier
restauré, lu sur `p.sets`, et non depuis l'instantané qui porte la lecture d'avant. La correction
de la dernière séance restaure une copie profonde de `perf` et rejoue : elle la couvre sans
rien ajouter.

**Le recul se dit, quand il est un événement.** La v1.15 avait écarté le signal de recul dans la
fourchette, au motif qu'il arrivait dès qu'un passage était moins bon que le précédent, ce qui
était le moteur qui fonctionne. Sur deux passages, le recul signifie deux passages consécutifs
sous la cible, et il informe : `Exo : cible recalée de 18 à 15, deux passages en dessous`, au
récapitulatif. Amendé en v2.23 : le message porte les deux lectures, `(14 puis 13)`, voir « Le
message de recul dit ses deux lectures ». Un recul sans mémoire derrière lui, premier passage après un ajustement manuel ou
sur une sauvegarde antérieure, reste muet : il n'a qu'un passage derrière lui, la v1.15 tient pour
lui. Un seul message par événement : la clause « cible recalée » s'ajoute aux signaux existants de
lecture partielle et d'échec sans descente, comme elle le faisait déjà pour le partiel, et le
message autonome ne sort que hors de ces deux cas.

**Cas limite assumé.** Un passage entier sous le plancher sans barreau inférieur, planche à sa
base ou exercice au poids du corps à sa fourchette d'origine, n'a pas de descente possible : la
fenêtre s'applique à la cible comme partout, et un 12/12 après un 44/44 laisse la planche à 45,
avec le signal « aucune série au plancher ». C'est le seul endroit où un effondrement est absorbé,
et deux de suite ramènent au bas.

**Biais de tours, reconduit.** Deux passages à volumes différents dans la fenêtre, le max
favorise celui à deux séries. Même famille que le biais du minimum déjà consigné, et que la
comparaison de rang des points ouverts de l'audit, non évaluée, adresserait si elle l'était.

**Non-régression mesurée.** Empreinte de neutralité identique à la v2.13 sur ses 206 lignes :
tirages, prescriptions, échelles et durées ne bougent pas à état égal. Seules les cibles futures
changent, et seulement après un passage.

### Le texte « Comment ça marche » en quatre blocs (v2.14)

Audit demandé par Gabriel, qui trouvait le texte long et pas des plus clairs. Mesuré : 552 mots,
19 mots par phrase, seize paragraphes. Six défauts. La règle de cible, mécanisme permanent, vivait
sous « La calibration, au début », qui est une phase, et rien ne disait ce qu'est une cible : c'est
la cause directe de la lecture qui a ouvert le lot. Le mécanisme était raconté à moitié, la
montée de cible sans le retour au bas de fourchette à la montée de charge, sans le filet, sans la
séance allégée, et « ce qui n'avance que d'un cran par passage, c'est le haut de la fourchette »
n'était vrai que sur les rares exercices au poids du corps dont la fourchette bouge encore.
L'échec technique était énoncé trois fois dans le bloc de fin de série, l'exemple du bassin deux
fois. L'accroche du bloc de fiche et son deuxième paragraphe énuméraient tous deux le contenu de
la fiche. Le contrat d'effort, point 6 de la file d'attente, n'y était nulle part.

**Quatre blocs, la cible en tête.** Un bloc de plus, parce que le contenu manquant est celui qui a
produit le malentendu, et en premier parce que la cible est le nombre qu'on voit à chaque série.
Les trois blocs existants passent de 552 à 380 mots ; le nouveau en ajoute 193 ; total 565
mesurés, 17,9 mots par phrase. Le texte n'est pas plus court, il est complet et chaque chose n'y
est dite qu'une fois. L'accroche du bloc de tête, « la cible est ce que tu vises sur chaque série,
pas là où tu t'arrêtes », solde le point 6 de la file d'attente, qui était réservé à Gabriel et
qu'il a validé. L'exemple des pompes est conservé mot pour mot, il est marqué « à conserver tel
quel » plus bas dans ce carnet. Retouche de Gabriel : « la cible retombe au bas de la fourchette »
plutôt que « au bas » elliptique ; la redite est le prix de la clarté, sur un texte dont le défaut
était la clarté.

**Assertions de forme.** `test39` exigeait trois blocs, `test40` cinq développements sur la
calibration et la chaîne exacte de l'ancienne règle : des valeurs épinglées, fausses en même temps
que le code, contre la règle de la v1.15. Elles passent en assertions de forme, chaque bloc a une
accroche et au moins un développement, plus une assertion de contenu sur la règle nouvelle.

### Ce que l'audit externe de la v2.14 a relevé, et ce qui en est fait (v2.15)

Audit conduit dans une autre conversation, en reproduisant tout depuis les fichiers livrés sans
faire confiance au rapport. Lot jugé conforme, trois réserves.

**La mémoire se sème à la migration.** Réserve acceptée. Sans migration, au déploiement, aucun
exercice n'avait de mémoire : la première séance moyenne après mise à jour recalait la cible sans
un mot, une fois par exercice, sur plusieurs semaines de transition, soit exactement le comportement
que le lot supprimait. Le motif « une valeur devinée vaut moins que son absence », posé pour
`it.rng` et `setsBand`, ne s'applique pas : `p.sets` est la lecture elle-même, avec sa date et ses
marqueurs de provenance, comme la rétroactivité des paliers en v2.4 était une lecture pure. Gardes :
aucune lecture allégée ni non qualifiée ; aucune grâce, qui dit que le dernier passage a fait monter
le palier et que ses séries sont à l'ancien ; sur le poids du corps et les tenues, où un relèvement
de fourchette ne laisse pas de grâce, aucun passage entièrement au haut de fourchette moins un pas,
seul marqueur disponible, au prix d'un passage au plafond qui ne sème pas et d'une mémoire qui
commence au suivant ; jamais par-dessus une mémoire déjà posée, ce qui rend la migration idempotente
et neutre pour un état déjà passé par la v2.14. Sur les deux chemins d'entrée. `test41` §8 et §9,
qui interdisaient toute migration, changent de sens et la vérifient.

**Dents de scie : le prix de la fenêtre, à relier au chantier de stagnation.** Réserve exacte sur
le fond, inexacte sur un détail. Sur 10-20, une alternance 14, 11, 14, 11 fige la cible à 15,
jamais atteinte, sans message : la fenêtre absorbe une mauvaise séance sur deux indéfiniment. Mais
la v2.13 ne « le disait » pas davantage, le recul dans la fourchette y étant muet depuis la v1.15 ;
elle montrait la scie dans la cible elle-même, 12, 15, 12, 15, là où la v2.14 la lisse derrière une
cible stable. La ligne « dernière fois » et la fiche la montrent toujours. C'est l'objet du point 2
de la file d'attente, l'instrument de stagnation, calculable depuis `it.tgt` (v2.12) : une cible non
atteinte depuis n passages est exactement ce cas. Limite consignée, chantier non ouvert.

**Asymétrie cible-filet : délibérée.** La cible a une mémoire de deux passages, le filet qui fait
redescendre la charge n'en a qu'une de un seul, hors grâce post-montée. Les deux erreurs n'ont pas
le même coût. Un filet trop prompt coûte deux passages faciles : la charge redescend, la séance
suivante au haut de fourchette la fait remonter, et la grâce protège. Un filet trop lent laisse un
passage de plus sous une charge qu'on ne tient pas, sur une L5 malformée. L'outil est donc indulgent
sur l'ancre et sévère sur la charge. S'ajoute la mesure v1.15 : sur les séances réelles, aucun
passage n'est jamais tombé sous le plancher, le filet ne joue pratiquement pas. À rouvrir sur une
observation, jamais sur le principe.

### Lot lisibilité (v2.15)

Ouvert par un constat de Gabriel sur la bibliothèque, les verrouillés intercalés dans les
accessibles, étendu en audit UI/UX de toute l'application. Méthode : captures Chromium headless de
la v2.14 sur un état fabriqué de 14 séances, 5 semaines, 4 déblocages, 16 montées, en 390 × 844 et
1280 × 900, thèmes clair et sombre, et lecture du CSS et des fonctions de rendu pour chaque constat.
Vérifier plutôt que juger à l'œil vaut pour l'interface aussi. Le rapport d'audit complet est un
document de travail, `PALIER-audit-uiux.md` ; ce qui a été décidé vit ici.

**Bibliothèque en trois paliers de lecture, sections par groupe conservées.** L'ordre du catalogue,
où chaque successeur d'escalier suit son prédécesseur, intercalait les verrouillés dans les
accessibles : sur jambes à domicile, 18 fiches dont 5 en rotation, 3 hors tirage et 10 verrouillées.
À l'intérieur de chaque groupe : ce qui sort au tirage ; ce qui attend une douleur ou un matériel
manquant, sous un sous-titre, avec l'étiquette `repli` ou `substitut` et son origine ; puis « N
paliers à débloquer » dans un `<details>` fermé par défaut dont la ligne fermée porte le compte,
motif des cards de réglages. L'ordre du catalogue est conservé dans chaque palier, l'escalier se lit
donc dans le bloc des verrouillés, et la fiche porte déjà le verrou dans les deux sens (v2.4). Une
recherche ouvre le bloc, son effacement le referme, sinon une recherche laisserait tous les blocs
ouverts derrière elle. Écartés : un interrupteur « masquer les verrouillés », un état de plus qui
masque là où le bloc résume ; les successeurs accrochés sous leur prédécesseur, plus fidèles à
l'escalier mais les swings dépendent du soulevé roumain et les strictes des assistées, la sous-liste
devient un graphe que la fiche dessine déjà. La décision v1.5 tient : ni chips de filtrage ni grille
de tuiles, ce n'est pas un filtre mais une mise en ordre.

**Un nom ne se tronque jamais.** Mesuré en 390 px sur la v2.14 : dix noms coupés par des points de
suspension, « Goblet… », « Soulevé de terre rou… », et « Tractions assisté… » deux fois de suite,
supination et pronation indiscernables. La colonne de droite portait les séries et le niveau, « KB
10 kg + lestes 2 kg » à lui seul. Sur un écran qui sert à trouver un exercice, le nom est la seule
information de la ligne qui ne doit jamais être coupée : il passe à la ligne, et le niveau descend
en ligne 2 après les muscles, la colonne de droite ne portant plus que les séries. Même règle sur le
détail de séance. Règle générale, posée ici : un nom passe à la ligne, une ligne secondaire se
limite à deux lignes, une valeur d'en-tête fermé passe à la ligne alignée à droite. Cette dernière
corrige les trois onglets, « échauffement complet · card… », « 1 h 7 min c… », « Cible, calibr… » :
une valeur tronquée oblige à ouvrir, ce qui contredit la règle qui justifie ces en-têtes (v1.5).

**Les substituts sont marqués, et « à faire » disparaît des lignes hors tirage.** Le carnet
affirmait depuis la v2.0 que les substituts se présentent comme tels dans la bibliothèque ; c'était
vrai dans la fiche et faux dans la liste, `libRowHtml` ne lisant que `estRepli`. Six fiches
apparaissaient en « à faire » alors qu'à domicile elles ne sortent jamais. Un repli ou un substitut
ne porte des séries que s'il y en a eu ; « à faire » invitait à faire quelque chose qui ne vient
jamais seul.

**« Dernière fois » porte le niveau quand il diffère du jour.** Capturé après une montée : « Cible
8 · Dernière fois 12/12/12 », la charge passée de 6 à 6,5 kg, la cible retombée au bas de
fourchette, et rien sur l'écran ne reliait les deux ; le récapitulatif l'avait dit, mais il était
passé. La ligne porte « à 6 kg » ou « en bande rouge », lu sur le dernier passage propre de
l'historique, `it.load` et `it.band` écrits avant progression depuis la v1.2 : aucun état nouveau.
Rien quand le niveau est le même, la ligne reste du contexte (v1.16). Même famille que la fenêtre :
la cible bouge, l'écran dit d'où.

**« Cette semaine » sous le bouton de lancement.** Mesuré à 1 300 px du haut sur mobile, sous le
détail de séance ouvert par défaut depuis la v1.10 et long de quatre exercices : l'instrument de
l'habitude était le dernier à se lire. L'ordre seul change, lancement, semaine, contenu, détail,
progression ; l'ouverture du détail n'est pas rouverte.

**Deux phrases constantes retirées du détail de séance.** « N séries par exercice, plus le module
cardio qui coûte environ une série… » et « Touche un exercice pour sa fiche complète », affichées
à chaque lancement : une information constante affichée à chaque lancement devient du bruit, motif
qui avait écarté le résumé de volume sur l'accueil. La card de lancement porte déjà le volume et les
options. La ligne des étirements reste, raccourcie, parce qu'elle porte une valeur qui change, les
étirements du jour.

**Le référentiel d'assiduité se replie.** Trois phrases d'explication dépliées en permanence sous
l'histogramme étaient la seule exception à « le référentiel se replie, l'état reste dehors »
(v1.10), que Couverture appliquait déjà. Même motif, « Comment lire ce graphique ».

**Étiquettes à 0,68 rem.** Dix occurrences à 0,6 rem, soit 9,6 px, et les pastilles d'échelle de
la fiche à 0,62 : sous le plancher de lisibilité usuel sur mobile, 11 à 12 px. 0,68 rem, soit
10,9 px, sans changer la casse. Les pastilles reçoivent une classe, `test30` les reconnaissait à
leur taille de police, ce qui faisait d'un style une assertion.

**Texte de fiche.** « La cible monte d'un cran à chaque séance réussie », inexact depuis la v1.0,
ce n'était pas un cran mais la plus petite série plus une, et davantage depuis la fenêtre : « La
cible suit tes séries, puis la charge prend le relais. »

**Desktop : colonne de 600 px, tranché sur maquettes.** `#app` faisait 480 px de large sur un
écran de 1280, deux tiers vides, bibliothèque de 4 400 px de haut comme sur mobile, et Gabriel
utilise l'outil sur PC. Trois variantes maquettées dans une copie de travail et capturées à
1280 × 900 sur accueil, Progrès et bibliothèque : rien ; 600 px ; deux colonnes sur les quatre
onglets, accueil et Progrès tenant alors sans défiler (900 px contre 1597 et 1444). Recommandation
faite pour les deux colonnes ; Gabriel a tranché pour 600 px, à condition que ce soit responsive.
C'est une seule règle sous `@media (min-width:900px)`, le mobile ne change pas et la structure non
plus. Les deux colonnes restent maquettées, pas écartées : elles demandent une grille à placement
fixe (la maquette utilisait `column-count`, qui fait sauter une card de colonne quand une autre
s'ouvre) et leur propre conception.

**Ce que l'audit a vérifié et retiré.** L'indice clavier apparaissait dans les captures : il est
déjà masqué sous `@media (pointer:coarse)`, Chromium headless n'étant pas un écran tactile. Le
bouton douleur sur deux lignes est voulu, le libellé est explicite. Le sélecteur de volume présent
sur chaque écran de série et de repos est correct, option non urgente d'une ligne repliée.

**Non-régression mesurée.** Empreinte de neutralité identique à la v2.14 sur ses 206 lignes.

### Le plafond vaut le haut de fourchette, et une tenue se rogne après le Stop (v2.16)

**Le problème d'origine, en une phrase.** Sur la fiche du bird-dog, « Marche 1 sur 3 » avec 6-12,
7-13 puis 8-14 ; constaté par Gabriel, pas déduit. Mécanisme : `applyProgress`, branche des
exercices sans échelle, quand toutes les séries atteignent le haut et que `top < cap`, fait
`range = [bas+1, haut+1]` et porte la cible au nouveau haut, sans grâce. Du +1 linéaire habillé en
fourchette : le bas qui monte ne sert qu'au filet, chaque relèvement entre au chemin des paliers
par `it.rng`, et sur poussé et tiré compte dans `state.div` comme une montée. Si 14 avait été
voulu, la fourchette aurait été 6-14 ; elle a été choisie 6-12 par nature d'exercice, et 14 n'a été
choisi par personne. Le carnet avait nommé ce comportement deux fois, « cinq relèvements que rien
n'annonçait, c'est le comportement générique du moteur quand aucune échelle n'est branchée » en
v2.5 sur les mollets, rejoué en v2.13 sur le pont fessier, sans le généraliser : le recensement
v2.5 avait confondu « pas de successeur lesté » avec « pas de relèvement », et déclaré assumé ce
qui n'avait pas été examiné.

**Recensement, mesuré sur `CFG`** avec le critère `mode:'bw'` ou `'time'`, pas de bande,
`cap > reps[1]` : onze entrées, 39 marches fantômes.

| exercice | fourchette | cap | relèvements | statut |
|---|---|---|---|---|
| bird-dog, dead-bug | 6-12 par côté | 14 | 2 chacun | vivier gainage |
| fentes-arriere | 8-15 par côté | 18 | 3 | vivier jambes, successeur outillé |
| step-ups, step-ups-bas | 8-15 par côté | 18 | 3 chacun | vivier jambes, repli |
| rowing-suspension | 8-15 | 18 | 3 | vivier tiré, impasse ouverte |
| tractions-strictes ×2 | 3-8 | 12 | 4 chacune | vivier tiré, verrouillées |
| pompes-inclinees | 8-20 | 25 | 5 | substitut |
| box-squat, retraction-scapulaire | 8-15 | 20 | 5 chacun | repli, substitut |

Le cas des fentes est le plus instructif : le verrou des fentes lestées exigeait 18 par côté
« parce que le plafond vaut déjà 18 » (v2.1). Ce 18 n'a jamais été choisi, il a été hérité du cap
fantôme et lu comme un fait, exactement le motif « plafond du matériel actuel écrit comme un fait »
corrigé en v2.1. Le verrou lit 15 : quand on atteint le haut de la fourchette recommandée, le
palier suivant est la fente lestée. Position de Gabriel.

**Une règle, pas onze retouches.** Sur tout exercice au poids du corps ou tenu sans échelle, le
plafond vaut le haut de sa fourchette, et la marche est une variante derrière verrou ou une
consigne écrite dans `NEXT`, jamais une fourchette décalée. Le champ `cap` disparaît : il ne
portait plus qu'une copie de `reps[1]` qui pouvait diverger, et deux écritures du même nombre
finissent par diverger. Assertion de forme au build, jamais de valeur épinglée : aucune entrée ne
porte de `cap`, tout exercice sans échelle a une marche écrite, et le code ne contient plus ni
« fourchette relevée » ni « fourchette redescendue ».

**Le mécanisme est retiré, pas seulement désarmé par les données.** Deux options ont été mises en
face. Garder la branche et changer les données : la branche devenait inatteignable par toute
donnée, et les suites qui l'exerçaient, T7, T8, T11, T12, T16, T22 et T23 de `test18`, la boucle
`capped` de `test5`, `test41` §B, cassaient de toute façon ; il aurait fallu les réécrire sur une
fixture pour tester du code mort. Retirer la branche, son miroir de descente (« cliquet levé »,
v1.15) et la boucle de fourchettes d'`echelleOf` coûtait la même réécriture de tests, pour asserter
l'invariant nouveau au lieu du mécanisme mort, et laissait moins de code. Même raisonnement que le
retrait du mode ciblé en v1.18 et du bouton « Changer de séance ». Tranché par Gabriel.

**La fiche dit une règle, pas un état.** Avec une marche unique, « Marche 1 sur 1 » ne dit rien,
et « Plafond de la fourchette atteint », que la v2.4 affichait sur tout exercice à marche unique dès
la première séance, était faux la plupart du temps. La ligne dit désormais ce qui se passe et à
quelle condition, dans les termes exacts d'`applyProgress` : « Au haut de la fourchette, toutes les
séries à 12 reps sur une séance complète : » suivi de la marche écrite. La position sur l'échelle
vaut -1 seulement quand la fourchette stockée n'est pas celle du catalogue : c'est le témoin qu'une
migration a manqué un état, pas un cas de fonctionnement, et `test43` le vérifie dans les deux sens.

**La migration se dérive et ne touche pas à la mémoire.** La liste en dur `['planche',
'planche-genoux','mollets-debout','pont-fessier']` de l'écrêtage disparaît : toute fourchette
stockée hors du catalogue sur un exercice sans échelle est un reste de relèvement, elle revient
entière à sa base et la cible est bornée. La conception annonçait l'effacement de `prevMin` au
passage, par application formelle de la règle v2.14 « remise à zéro à tout changement de palier ».
C'était faux, et `test43` l'a montré avant la livraison : un relèvement n'a jamais changé le niveau
physique de l'exercice, même poids du corps, même geste, donc une lecture faite sous 7-13 est
exactement comparable à une lecture sous 6-12. La règle v2.14 visait un changement de palier réel,
il n'y en a pas eu, la mémoire survit. Corollaire : la troisième garde de semis de la v2.15, « pas de
semis d'un passage entièrement au haut de fourchette moins un pas sur le poids du corps et les
tenues », supposait qu'un tel passage avait pu relever la fourchette sans laisser de grâce. Elle
tombe, un passage au plafond sème comme les autres. Mesuré sur la sauvegarde du 12 septembre 2026 :
aucune des onze fourchettes n'était relevée, bird-dog et dead bug à 8/8/8 sur cible 9, fentes à
9/9/9, step-ups à 12/12, tirage en suspension à 10/10/10, la migration y est un no-op, aucune
descente datée n'apparaîtra au chemin des paliers.

**Au plafond, la cible vaut le haut.** Trouvé par T8 réécrit : quand toutes les séries atteignent
le haut sans qu'aucun palier ne bouge, sommet d'échelle ou fourchette sans échelle, la cible n'était
pas recalculée, le bloc de recalcul vivant dans la branche du non-plafond. Une cible à 12 restait à
12 après un 15/15/15 et ne se rattrapait qu'au passage suivant, par la mémoire de fenêtre. Elle vaut
désormais le haut, ce que `nextTarget` aurait rendu, borné par la fourchette. Correctif général, une
ligne, ajouté au lot parce qu'un test l'a mis au jour ; il ne change aucune prescription à état
égal, l'empreinte le confirme.

**Une tenue se rogne après le Stop, jamais dans l'autre sens.** Constat de Gabriel : entre la fin
réelle de la tenue et l'appui sur ESPACE, plusieurs secondes passent, jusqu'à huit sur un gainage
latéral, et la valeur enregistrée les porte. Trois réponses ont été mises en face. Rogner après le
Stop : la mesure est une borne haute, l'utilisateur connaît l'écart à quelques secondes près, et la
correction se fait là où l'information est fraîche plutôt qu'au récapitulatif. Le bip qui fait la
mesure, un bip toutes les 5 s et la valeur au dernier bip entendu : neutre pour le moteur puisque le
pas des tenues vaut 5 s et que la cible suivante arrondit au multiple supérieur, mais une tenue
lâchée à 43 dont le Stop tombe à 48 créditerait 45, mieux sans être réglé. Les tenues rythmées
partout, dix secondes répétées comme McGill dose le pont latéral : réglait le problème par
construction, mais tombe avec le refus du format, voir plus bas. Retenu, le rognage. Il ne
contredit ni « Stop définitif », ni « ESPACE ne détruit jamais une mesure » : c'est un bouton et la
touche moins, on rogne, on ne reprend pas, et ESPACE reste inerte. L'objection du carnet aux champs
déclaratifs ne joue pas : une déclaration qui ne peut que baisser la valeur ne crée aucune
incitation. Forme : un bouton « − 1 s » par côté mesuré, à côté de « Réinitialiser » sur une tenue
d'un bloc, dans le récapitulatif des côtés sur une tenue par côté, pour que les deux valeurs se
corrigent sur l'écran de validation avant que le côté le plus court parte au journal. Pas de 1 s,
plancher à 1 puisqu'une série à zéro n'est pas une série, `+` inerte, inerte pendant qu'un chrono
tourne, et `-` sur le clavier. La correction de fin de séance (v1.15) reste, c'est ce que Gabriel
faisait jusqu'ici.

**Ce que la littérature a tranché en cours de lot, et ce qu'elle n'a pas tranché.** Vérifié par
recherche et non de mémoire, sur des sources secondaires reprenant McGill.

- *Le gainage latéral reste en 15-45 s continues.* J'avais présenté le format du Big 3, tenues de
  8 à 10 s répétées en pyramide descendante, comme la norme, et Gabriel l'a refusé : 8-10 s n'est
  rien pour qui tient 44 s, et les recommandations d'entraînement vont de 20 à 60 s. Il avait
  raison. McGill utilise le pont latéral de deux façons, test d'endurance en tenue maximale et
  exercice de rééducation pour dos douloureux en tenues courtes ; le second est un protocole de
  rééducation, pas une norme d'entraînement. Le plafond v1.17 à 45 s s'appuyait sur McGill pour la
  borne haute, pas pour le format, et il tient.
- *Le bird-dog est un exercice à répétitions par nature*, on ne le tient pas 45 s en alternant :
  toutes les prescriptions vont de 8-12 répétitions tenues 2-5 s à 5-10 répétitions tenues 10 s, et
  McGill plafonne la tenue à 10 s puis progresse en répétitions. Ce format n'est pas un import.
- *Le dead bug a sa propre littérature*, la progression abdominale basse de Sahrmann : des
  abaissements de jambe avec le bassin neutre, du glissé de talon à l'extension non soutenue puis aux
  deux jambes ensemble, l'activité abdominale étant plus élevée quand le talon ne touche pas. Sa
  variable canonique est le levier, pas la tenue ; chez Gabriel le levier est au bout, l'extension
  non soutenue étant déjà jouée et la marche suivante, les deux jambes ensemble, étant le plus fort
  couple de fléchisseurs sur une lombaire qui existe au poids du corps. Le temps sous tension est le
  seul axe au poids du corps qui lui reste, et c'est celui de l'échelle de tenues.

**Ce qui n'entre pas dans ce lot, et pourquoi.** Un successeur « bird-dog tenu 10 s » avait été
proposé, puis retiré sur une question de Gabriel : qu'est-ce qui change, à part la tenue ? Rien.
Mêmes positions, même levier, mêmes muscles, même image ; seuls le temps sous tension et le tempo
changent, deux champs. Une fiche séparée serait une variante du même mouvement, ce que la règle des
viviers interdit, et l'escalier des successeurs a été construit pour des changements de position.
La forme juste est un régime de palier sur la tenue, chantier suivant, dont la conception est
arrêtée plus bas. Le tirage en suspension, impasse sur l'amplitude, a sa marche lestée en file
d'attente. Bird-dog et dead bug sont donc, dans cette version, des impasses à 12 avec marche écrite,
comme le tirage en suspension sur l'amplitude ; la marche du bird-dog, « marque une pause de 3 s »,
était déjà la consigne de sa fiche et ne constituait pas une marche, elle dit « allonge chaque tenue
à 6 s », premier palier de l'échelle à venir au-dessus du niveau actuel.

**Non-régression mesurée.** Empreinte de neutralité identique à la v2.15 sur ses 206 lignes.
`falsif43.sh`, quinze mutations, toutes tombent ; deux d'entre elles ont d'abord survécu et ont fait
durcir deux assertions, la mémoire à l'écrêtage, qui se retrouvait resemée à la même valeur depuis
les séries, et le rognage pendant qu'un chrono tourne, qui ne se voyait que sur le côté déjà mesuré
d'une tenue par côté.

### Tenues rythmées : le bird-dog et le dead bug sur une échelle de tenues (v2.17)

**Point de départ.** La conception arrêtée avec la v2.16 (« Chantiers décidés en septembre 2026 »),
livrée telle quelle sur l'échelle, la bascule, les sons, le côté le plus court et la migration
neutre, avec quatre écarts tranchés en séance et consignés ci-dessous. Le lot a été ouvert par une
lecture erronée du changelog v2.16 : son titre parlait du bird-dog, sa section « sans changement de
code » disait que les tenues rythmées attendaient, et le tout se lisait comme « le bird-dog a été
traité ». Défaut de présentation, noté.

**Maquette avant code, comme prescrit.** Un fichier HTML autonome, l'écran seul avec les sons réels,
rythme calé sur l'horloge audio, curseurs de tenue, bascule, cible et fréquences. Sur le tapis,
quatre retours de Gabriel, dans l'ordre où ils ont été faits, et ce qui en est sorti :

- *Pas de rognage.* Conforme à la conception (« Stop seule entrée, plus de saisie numérique »), mais
  la conception avait tort. Le « − 1 s » de la v2.16 existe parce qu'une mesure au Stop est une
  borne haute. Ici le décalage est absorbé tant que le Stop tombe pendant la tenue ratée, qui ne
  compte pas ; mais si l'on lâche à la fermeture de la tenue 7 et que la main atteint le téléphone
  au sol trois secondes plus tard, la 7 est comptée et la 8 entamée. Même borne haute, à la
  granularité de la tenue. Un « − 1 tenue », inerte pendant le rythme ; une déclaration qui ne peut
  que baisser ne crée aucune incitation.
  **Corrigé le 13 septembre, avant déploiement, sur un cas d'usage de Gabriel.** Première écriture :
  le bouton retranchait 1 à la valeur qui part au journal, plancher à 1. Le cas : six par côté, Stop
  tardif, la droite passe à 7. Le journal disait déjà 6, puisqu'il prend le côté le plus court ; un
  appui le faisait tomber à 5, et l'écran affichait 5 sous des compteurs restés à 7 et 6, désaccord
  que la reprise emportait avec elle. La faute est arithmétique et non d'affichage : **quand les deux
  côtés diffèrent d'une tenue, la latence du Stop est déjà absorbée par le côté le plus court**, et
  retrancher à la valeur enlève une tenue qui a été tenue. Le rognage retire donc la dernière tenue
  comptée, du côté où elle a été comptée, et la valeur se recalcule sur les compteurs ; la reprise
  repart sur le côté rendu. Plancher sur les compteurs, qui ne passent pas sous zéro, et non sur la
  valeur : le Stop après une seule tenue produit déjà un zéro, que l'écran sait dire. Le rognage par
  côté des tenues chronométrées (v2.16) n'a pas ce défaut, chaque côté y étant mesuré séparément.
- *Bascule perçue courte.* Elle fait 2,0 s. Gabriel a demandé ce que disent les études : rien. Aucune
  source ne prescrit une durée de transition ; McGill fixe des tenues de 8 à 10 s en pyramide
  descendante, un retour balayé sans repos, et une progression en répétitions plutôt qu'en durée
  pour ne pas provoquer de crampes. Le 2 s n'est ni confirmé ni contredit ; il reste, constante
  d'exercice, sur l'argument corporel du carnet, à 1 s la bascule devient un balancement. Ce que la
  relecture ajoute, plus franchement que la conception de septembre : McGill ne dit pas seulement
  « plafond à 10 s », il dit « progressez en répétitions, pas en durée ». L'échelle 3 → 6 → 10 est
  défendable comme rampe d'entrée vers son format, choisie pour la neutralité de migration ; il faut
  le savoir. Et pour le dead bug, la littérature le traite en exercice dynamique : une étude EMG
  au métronome trouve plus d'activité à 90-120 battements par minute qu'à 60, la tenue en est une
  variante. Il a rejoint l'échelle sur l'analyse du transfert ; si un jour il déçoit, la piste est là.
- *Pas de reprise.* Sur une tenue chronométrée, Gabriel est en phase avec la v1.13 : tenir 45 s en
  trois morceaux de 15 n'a pas de sens. Mais le bird-dog et le dead bug sont des répétitions avec un
  temps de tenue, ce n'est pas la même chose : chaque tenue reste intacte quelle que soit la pause
  avant elle, la série n'est que leur somme. Deux arguments pèsent en plus. Ces exercices étaient en
  saisie numérique, où une interruption ne coûtait rien ; un métronome sans reprise aurait été plus
  strict que l'existant, sur du gainage au poids du corps. Et refaire une série entière de gainage
  après un coup de fil fausse la série suivante. Reprendre rejoue le décompte et repart sur le côté
  qui était en cours, l'écart entre côtés reste d'au plus un. La faille, douze tenues avec une pause
  au milieu, existe un cran plus haut que celle de la v1.13 ; elle n'est pas journalisée, pas
  d'emblée.
- *L'écran ressemblera-t-il à la maquette ?* Non : la maquette isolait le bloc `entry` de la carte
  d'étape. Le reste de la carte est conservé, figure, fiche, vignette, « Tenir ce palier », séries,
  Passer, repli. Le bloc apporte l'en-tête « Tenue » à côté de la fourchette, le côté, le chrono de
  la tenue, deux compteurs et le Stop.

**Ce que le moteur fait, et pourquoi ainsi.**

- *Un drapeau, pas un mode.* `rhythm:{bascule,ladder}` sur les deux entrées de `CFG`, le mode reste
  `bw`. C'est un exercice en répétitions dont chaque répétition est une tenue : la progression se
  lit en répétitions, `it.rng`, la fourchette, l'unité de saisie de correction, tout reste vrai ; et
  l'échelle joue exactement le rôle de la bande, `e.bnd`, drapeau sur un exercice sans charge. Un
  mode nouveau aurait touché seize branchements `mode==='time'` et cinq `mode==='bw'` pour rien.
- *`p.tenue` absent vaut le premier barreau.* C'est ce qui rend la migration neutre sans écriture :
  `rungOf` retombe au premier barreau sur une tenue absente ou inconnue, comme une bande inconnue.
  Sur la sauvegarde du 12 septembre, bird-dog et dead bug à 6-12, cible 9, mémoire 8 : rien ne bouge.
- *Cinquième branche de montée et de descente dans `applyProgress`*, entre l'échelle fixe et le poids
  du corps. Montée : barreau suivant, fourchette du barreau, cible au bas, grâce, `loadUps`, `div`.
  C'est la seule écriture de `p.range` depuis la v2.16, et un vrai changement de palier : la tenue
  cumulée par côté passe de 36 à 24 s puis de 48 à 30 s, un tiers perdu au retour au bas, comme à une
  montée de charge ; la mémoire de fenêtre se remet à zéro par le chemin existant. La dette nommée
  en v2.16, « `p.range` est une copie constante du catalogue », n'est pas remboursée, elle change de
  forme : pour deux exercices, `p.range` est la copie de la fourchette du barreau.
- *Après une descente, la cible se recale au bas du barreau inférieur*, par le `nextTarget` ordinaire
  sur une lecture sans mémoire, exactement comme après une descente de charge. Décision prise seule
  en codant, contre une première idée en séance de la mettre au haut « puisqu'on vient d'au-dessus » :
  la cohérence avec la charge et la doctrine « on consolide avant de repartir » l'ont emporté. À
  contester si l'usage dit autre chose.
- *La migration d'écrêtage lit le barreau.* Sans cela, un 4-8 joué à 6 s aurait été ramené sur le
  6-12 du premier barreau à chaque chargement : `baseReps` rend la fourchette du barreau sur une
  tenue rythmée, celle du catalogue partout ailleurs. Un 7-13 sans tenue reste un reste de
  relèvement et revient au premier barreau.
- *Deux horloges.* L'état, compteurs, phase, côté, se dérive du temps écoulé sur l'horloge murale ;
  rien n'est accumulé par tick, une boucle qui se réveille en retard ne perd rien, et une suite de
  test pilote le temps à la main. Les coups sont programmés 350 ms en avance sur l'horloge audio,
  seule capable de sonner à l'instant voulu quel que soit le réveil du timer ; le décalage entre les
  deux horloges est relevé au départ, une fois. Les chronos existants comptent en secondes entières
  sur `setInterval`, ce qui suffit pour mesurer une tenue et non pour en rythmer vingt-quatre. Le
  modèle de temps de séance reçoit ses ticks par seconde écoulée, une fois chacune.
- *Émetteur simple-coup.* `beep()` joue chaque ton deux fois à 260 ms d'écart : sur une tenue de 3 s
  le second coup tombe au dixième de la tenue et brouille l'ouverture. `tone(freq, at, dur)` joue un
  coup, à un instant précis de l'horloge audio, sans vibration, le motif [90,70,90] durant 250 ms
  pour le même défaut ; `toneCancel` au Stop, rien ne sonne après le geste. Fréquences dans la
  palette existante, 950 ouverture, 700 fermeture, 1200 cible, ce dernier étant déjà le ton de cible
  de l'application ; le rapport 950/700 est à juger à l'oreille, la maquette garde ses curseurs.
- *Le décompte enchaîne.* Son zéro est la première ouverture, le 1150 Hz de fin de `startPrep` n'est
  pas joué : sinon une seconde morte s'installe avant le rythme. Le 950 de l'ouverture joue le rôle
  du 1150, une montée de hauteur par rapport au tick à 700, et 1150 n'est pas repris parce qu'il est
  collé au 1200 du ton de cible, la première tenue sonnerait comme une cible atteinte. Les 0,15 s
  d'avance du départ sont bornées à l'affichage, un décompte de 3 affichait un 4.
- *Le décompte garde le coup double, corrigé après essai.* Première écriture : les coups du décompte
  passaient par le même émetteur simple que le rythme, au motif du double coup. Relevé par Gabriel à
  l'usage, le son de la mise en place ne ressemblait plus à celui de la planche ou du gainage
  latéral. Sur-généralisation : l'argument du double coup ne vaut qu'à l'intérieur du rythme, où
  260 ms tombent au dixième d'une tenue de 3 s ; le décompte est avant, espacé d'une seconde, rien
  ne s'y brouille. La conception disait « décompte de préparation tel quel », elle avait raison.
  Émission doublée, à 0 et 260 ms, identique à `beep(700,.1)`.
- *Pas de vibration, et où passe la ligne de « tel quel ».* `beep()` fait vibrer `[90,70,90]` à
  chaque seconde du décompte. Elle n'est pas reprise : elle est derrière la porte `sndOn()`, donc
  elle ne sert jamais de repli quand le son est coupé, elle ne fait que doubler un son audible ; sur
  ces deux exercices le téléphone est au sol, à quatre pattes ou sur le dos, il n'y a pas de canal
  tactile ; et `navigator.vibrate` part tout de suite, elle ne s'ordonnance pas sur l'horloge audio,
  il faudrait la déclencher depuis la boucle à ±125 ms, soit deux signaux légèrement décalés pour
  l'instant même où l'écran doit être exact. La cohérence de « tel quel » porte sur ce qui est perçu,
  pas sur l'appel de fonction : le coup double est audible et gratuit, la vibration est inaudible
  ici et coûte la justesse. Observation plus large, à traiter ailleurs : une vibration derrière la
  porte des sons ne peut structurellement pas servir de mode dégradé, dans toute l'application.
- *Le ton de cible tombe à la fermeture* de la tenue qui amène un côté à sa cible, pas à son
  ouverture : une tenue ne compte que terminée. Chaque côté le reçoit, à une tenue d'écart, et le
  métronome continue.
- *Le journal porte la tenue* : `it.tenue` écrit avant progression depuis l'instantané, comme
  `it.load`. Les deux instantanés, fin de séance et correction, ne portaient pas `tenue` ; sans cela
  `it.tenue` valait toujours 3 et « Tenir ce palier » ne restaurait pas le barreau. Trouvé par
  `test44` avant livraison. Il y en avait un troisième, trouvé à l'audit du 13 septembre :
  `avantCor`, celui qui dit ce que la correction défait. Sans `tenue`, `estMontee` y comparait deux
  fois le premier barreau et une montée de barreau annulée ne se disait jamais, alors que le
  commentaire d'à côté pose qu'une annulation muette est pire qu'une annulation. La correction de la
  v2.17 visait « les instantanés d'avant progression » et celui-ci est d'avant correction : une
  formule juste qui a servi de filtre. `estMontee` lit la tenue et jamais la fourchette, qui descend à une montée
  et remonte à une descente : la descente aurait été célébrée. `holdClimb` restaure `p.tenue` et
  décrémente `loadUps`. Un passage antérieur au champ a été joué au premier barreau par
  construction, `palierVal` le dit.
- *Une étape quittée sans passer par le Stop désarme le rythme.* `rhythmAbort`, sur `skipSet`,
  `endSession`, la sortie de séance sans rien de journalisé et le repli douleur : sinon les coups
  déjà programmés dans la fenêtre d'avance sonnent après le départ, et le `rt` reste armé avec un
  `t0` qui vieillit. Le repli douleur supprime en outre le `rt` de l'étape, comme le retour d'un pas
  le fait déjà : le rythme appartient au couple étape plus exercice, pas à l'étape seule. Aucun des
  deux exercices rythmés n'a de repli aujourd'hui, donc rien de cela n'est atteignable ; c'est
  exactement pourquoi la garde s'écrit, elle tient par construction et non par l'absence d'un champ
  `fb` que personne ne garantit.
- *Le modèle de durée facture une bascule de trop*, `prep + 2 × reps × (tenue + bascule)` comptant
  une transition après la dernière tenue. Relevé à l'audit du 13 septembre comme défaut, conservé
  après arbitrage : une série ne finit pas à la fermeture de sa dernière tenue, elle finit quand la
  main atteint le téléphone au sol, et c'est le même intervalle que le rognage existe pour
  reconnaître. La conception de septembre affirmait l'inverse, « la latence du Stop est absorbée par
  construction » ; c'est elle qui avait tort, deux fois. Retirer les 2 s rendrait le modèle plus
  juste sur le papier et plus faux en séance.
- *Le côté en jeu est nommé et mis en valeur.* Demande de Gabriel après l'audit. Règle unique :
  **le côté mis en valeur est celui qui est en jeu ou qui vient immédiatement**. Le tag l'annonce
  avant le départ et pendant le décompte, où il donne le côté interrompu sur une reprise ; la ligne
  des comptes porte en accent le côté de la tenue en cours, ou celui qu'annonce la bascule. Une
  série arrêtée n'en met aucun : rien ne vient tant qu'on n'a pas repris, et la reprise rejoue un
  décompte qui le dira. Le décompte devient ainsi le seul endroit où l'on apprend par quel côté
  commencer, ce qui compte d'autant plus qu'il peut être réglé à zéro.
- *Fiche.* `echelleOf` rend un cinquième régime, `quoi:'tenue'`, trois marches « 3 s · 6-12 », etc.,
  position, marche suivante, condition de montée en tenues ; vierge sans performance, comme une
  bande, bien que la position soit connue par construction. `unitOf` rend « tenues ».

**Non-régression mesurée.** 43 suites existantes vertes après retouche de onze d'entre elles sur
deux motifs seulement : le remplissage d'une tenue rythmée arrêtée là où les boucles de séance
remplissaient une tenue chronométrée, et l'exclusion des deux exercices des ensembles « sans
échelle », 21 devient 19 ; le témoin de fiche de `test43` passe aux fentes arrière. `test44`, huit
sections après l'audit du 13 septembre, dont l'écran à horloge pilotée sur les deux horloges.
`falsif44.sh`, 50 mutations, toutes tombent ; six ont d'abord survécu et ont fait durcir six
assertions, deux fois la même leçon à deux jours d'écart : une garde testée par sa moitié redondante
ne se voit pas (`st.rt.on` doublé par `st.done`, indiscernable sans une reprise qui porte encore la
valeur d'avant), l'annulation des coups au Stop testée à vide ne prouve rien (aucun coup programmé
au moment choisi), `it.tenue` lu avant ou après progression est indiscernable sans montée pendant la
séance, et un plancher ne se prouve qu'en insistant au-delà, la suite s'arrêtant pile au compte.
Test de fumée en navigateur réel sur l'écran intégré, comptes et transitions conformes à la
seconde.

**Écarts avec la conception de septembre.** Stop non définitif ; rognage ajouté, puis refait sur les
compteurs ; décompte qui enchaîne au lieu de la fin de préparation à 1150 Hz ; `tempoOf` ne perd
qu'une entrée, le dead bug n'en avait pas ; le mode reste `bw`, l'échelle est un drapeau.

**Audit du 13 septembre 2026, avant déploiement.** Le lot a été relu entier sur demande de Gabriel.
Le contrôle de reconstruction passait, les 44 suites étaient vertes, et trois défauts de fond
tenaient quand même : le rognage qui soustrayait au journal au lieu des compteurs, trouvé par un cas
d'usage et non par le code ; `avantCor` sans la tenue, trouvé en lisant les trois instantanés à la
suite ; un commentaire d'`applyProgress` qui affirmait un invariant que le lot lui-même venait de
rompre. S'y ajoutaient sept compteurs faux dans `PALIER-code.md`, un carnet resté à v2.16 avec une
section 5 titrée v2.15, et trois bancs de falsification qui ne mordaient plus. Deux enseignements :
une suite verte ne dit rien de ce que personne n'a pensé à asserter, et **ce que le contrôle de
reconstruction ne regarde pas dérive sans bruit**, compteurs, titres et instruments compris.

**Hors tenues rythmées, un défaut de mise en page signalé par Gabriel.** La bande du carrousel du
détail de séance est un conteneur flex, donc haute comme son plus grand panneau. Les panneaux à
venir portent un intitulé et un encart de niveau que celui du jour n'a pas : une soixantaine de
pixels de vide s'ouvraient sous la dernière ligne de la séance du jour, jusqu'à la card Progression,
et ce vide grandissait avec le plus grand des tirages à venir. Présent depuis la v1.18, jamais vu en
audit parce qu'aucune suite ne mesure une hauteur et que le défaut ne se voit qu'à l'écran. La
hauteur suit maintenant le panneau affiché : mesurée sur le panneau, jamais calculée, les vignettes
ayant une taille fixe en feuille de style. Deux gardes valent d'être dites, parce qu'une hauteur
posée en JavaScript est une hauteur qui peut devenir fausse. `overflow-y:hidden` : une bande trop
courte capturerait sinon le défilement vertical de la page, ce qui est bien pire qu'un vide. Et une
mesure nulle, card repliée, efface la consigne au lieu d'écraser la bande à zéro, l'ouverture
suivante la remesurant. `carFit` est appelé au rendu de l'accueil, au changement de panneau, après
un balayage, à l'ouverture de la card et au redimensionnement de la fenêtre.

Une troisième garde a manqué au premier passage, et Gabriel a dû signaler deux fois le même vide.
La bande n'avait pas `align-items:flex-start` : l'alignement par défaut d'une bande flex étire
chaque enfant à la hauteur de la ligne, donc interroger un panneau rendait la hauteur du plus grand,
exactement celle qu'il s'agissait de corriger. `carFit` se réécrivait sa propre hauteur et ne
changeait rien. **La suite ne pouvait pas le voir : elle simulait les `offsetHeight` des panneaux
avec des valeurs choisies à la main, donc elle prouvait la plomberie, pas la mesure.** C'est la
quatrième fois dans ce lot qu'une assertion démontre autre chose que son objet, après les trois
survies de `falsif44`. Règle : quand une valeur vient du moteur de rendu et non du code, la simuler
ne prouve rien de ce qu'elle vaudra ; **ce qui se vérifie sans navigateur, c'est la propriété de
feuille de style dont la mesure dépend**, et c'est elle qu'il faut asserter.

**Suites.** L'écran s'éteint sur une série de deux minutes, le son porte le rythme mais le Stop se
cherche à l'aveugle : `navigator.wakeLock`, à examiner dans un lot propre. Les marches du dernier
barreau, carrés et résistance, restent écrites ; successeurs avec illustration le jour venu.

### Escalier du squat, et la porte qui lit le palier joué (v2.18)

**Déclencheur.** Après 15, 15, 15 à 10 kg le 15 septembre, la cible est revenue à 8 à 12 kg.
Gabriel a jugé la marche ridicule : deux kilos valent environ 2 % de ce que portent les cuisses,
78 kg de poids du corps plus la kettlebell, bien sous la règle des 10 % posée sur les mollets en
v2.13. Il garde pourtant, pour le moment, les barreaux 12 et 14 kg sous la kettlebell de 16 kg.
Une réponse de Claude est à retenir comme fausse : pour minimiser le retour au bas de fourchette,
elle invoquait la mémoire de cible de la v2.14, une lecture de 14 à 12 kg remontant la cible à 15.
Le moteur fait bien cela, vérifié, mais la séance suivante affiche 8, et ce carnet compte lui-même ce
retour comme un prix fixe en répétitions. Gabriel avait raison sur la séance qui vient.

**Successeur du goblet squat : le squat sur une jambe vers la chaise.** Avec ce matériel, le squat
bilatéral plafonne : au-dessus de la kettlebell la plus lourde, des lestes de poignets à 2 %, puis
le sac porté devant, qui donne le barreau de 30 kg mais rend la charge aux avant-bras. La seule vraie
suite est de passer sur une jambe. Choix de Gabriel, sur une note de cadrage issue d'une autre
discussion.
- **Le squat bulgare n'est pas ce successeur.** Claude l'y avait placé ; c'est une fente, il reste
  dans la lignée des fentes. Gabriel, que le nom avait induit en erreur, l'a relevé.
- **Verrou à 16 kg et non à 22.** Par jambe, ordres de grandeur non mesurés : 47 kg au goblet squat
  à 16 kg, 50 kg à 22, 66 à 70 kg sur une jambe. Le saut vaut +41 à +49 % depuis 16 et +32 à +40 %
  depuis 22 : neuf points gagnés au prix de trois barreaux à 2 % et de plusieurs mois. Le carnet a
  déjà accepté +50 % à l'entrée du hip thrust. Condition nouvelle, `kbTop` : 2 séries de 15 avec la
  kettlebell la plus lourde déclarée, sans lestes, lue sur l'échelle filtrée comme `loadTop`, pour
  la même raison, ne pas enfermer un inventaire pauvre.
- **La hauteur d'assise est un palier, pas une fiche.** Une seule image pour 50 et 40 cm, décision
  de Gabriel : c'est le cas du bird-dog tenu, déjà tranché. La mécanique des tenues se généralise
  (`rungSpec`) : `p.assise`, absent au premier barreau, `it.assise` écrit avant progression, le
  métronome restant propre aux tenues. Monter d'un barreau fait baisser la chaise : le sens se lit
  sur l'indice, jamais sur la valeur.
- **Deux crans, 50 puis 40 cm.** Essai de Gabriel le 15 septembre sur un fauteuil de bureau : 50 cm
  fait déjà bien travailler, 40 cm pas trois répétitions d'affilée, genoux sans gêne. Les deux
  butées du vérin se retrouvent à l'identique, et la référence vaut pour tout le monde. Des crans de
  2,5 cm, proposés par Claude, ont été refusés. Si l'entrée à 40 cm se révèle trop raide, le filet de
  sécurité remonte la chaise au deuxième passage sous le plancher, la grâce couvrant le premier.
- **Fourchette 8-15 par côté, 2 séries**, comme les autres unilatéraux. Question de Gabriel sur la
  littérature, répondue de mémoire et non vérifiée par recherche : Schoenfeld et al. 2017,
  Schoenfeld, Grgic, Van Every et Plotkin 2021, prise de position de l'ACSM 2009, qui placent
  l'hypertrophie sur une large plage près de l'échec. Un 5-12 proposé pour une chaise fixe est
  devenu sans objet avec une chaise réglable.
- **Standard d'exécution** : départ debout, effleurer l'assise sans s'y poser, remonter sans élan.
  Fin de série au balancement du buste, au genou qui rentre, ou à l'assise sur laquelle on se laisse
  tomber. Question de Gabriel : le départ assis existe comme variante facile, écarté parce qu'il
  supprime la descente freinée et invite à se balancer pour décoller.
- **Chaise.** Un fauteuil à roulettes part au premier contact : la fiche exige un siège qui ne roule
  ni ne pivote, ou calé. Gabriel cale le sien. La chaise reste du mobilier supposé présent, la
  garantie s'écrivant dans la fiche.
- **Après 40 cm, la version lestée**, kettlebell tenue devant, par **kettlebells seules**
  (`kbSeules`) : 10 puis 16 kg, décision de Gabriel, la suite se décidera à 16 kg ou à 20. Le
  contrepoids qui facilite le mouvement de ceux que l'équilibre limite ne fait pas de marche
  descendante ici : après 2 × 15 à 40 cm, la limite est musculaire. Verrou `rungTop` : 2 séries de 15
  par côté à l'assise la plus basse. Au sommet, la kettlebell plus lourde à déclarer (`KB_NEXT`,
  d'où le goblet squat sort), puis le sac porté devant.
- **Pistol complet écarté**, pas pour la cheville, que Gabriel dit bonne : pour la flexion lombaire
  qui l'accompagne souvent en bas du mouvement et la profondeur non bornée.
- **Repli douleur des deux fiches : le box squat.** Annoncé par Claude comme « version sans charge »
  pour la lestée, changé en codant : à 40 cm sans charge le genou reste très chargé, le box squat à
  deux jambes le soulage vraiment. Écart signalé à Gabriel.
- **Séances hybrides écartées**, voir la table des propositions abandonnées.
- **Illustrations** : deux, `squat-une-jambe-chaise` pour les deux crans et
  `squat-une-jambe-chaise-leste`, prompts livrés dans un fichier à part. Le panneau d'arrivée montre
  la figure assise, contrairement à la consigne ; signalé, gardé par Gabriel, le texte porte la
  consigne.
- **Tirage** : les deux fiches s'insèrent juste après le goblet squat, verrouillées, `SUBS.legs`
  décalé de deux, la lestée se repliant sans kettlebell sur la version au poids du corps.
  Empreinte de soixante séances à venir sur l'état exporté le 15 septembre : identique avant et
  après le lot.

**Fentes lestées : le bulgare, déjà lesté.** Question de Gabriel : pas d'étape au poids du corps ?
Par jambe avant, fente à 2 × 14,5 kg environ 75 kg, bulgare au poids du corps 62 à 66 kg, soit un
recul, bulgare à 2 × 5 kg 70 à 76 kg. La note de cadrage estimait l'équivalence à 8-12 kg par main ;
ses propres ratios donnent 5 à 8, la conclusion ne change pas. Marche écrite : « squat bulgare avec
haltères, en repartant vers 5 kg par main ». Non outillé, lointain.

**La porte qui lit le palier joué.** En concevant le verrou à 16 kg, un défaut de la v2.5 est
apparu : `loadTop` lisait `p.load` après la progression de fin de séance. Vérifié sur l'inventaire
réel : deux séries de 25 à 50 kg aux mollets debout lestés montaient la charge à 60 et ouvraient les
mollets sur une jambe, dont la condition exige le dernier cran. Même trou sur le pont fessier sur une
jambe, et le verrou du squat sur une jambe l'aurait eu. Gabriel n'était à aucune de ces portes.
Correction sur le motif de `p.setsBand` (v2.12) : `p.setsLoad` et `p.setsRung` s'écrivent avec les
séries, avant progression, et `gatePalier` ne lit qu'eux. **Absents sur une performance antérieure,
la porte reste fermée** et la preuve repart du prochain passage : un verrou ne s'ouvre pas sur une
supposition. Le bloc Verrou de la fiche dit le palier joué et le palier exigé.

**La fiche disait le niveau du jour.** « Dernière fois : 15/15/15 à KB 10 kg + lestes 2 kg » pour
trois séries faites à 10 kg, et « 15/12/12 à 9,5 kg » pour un développé joué à 9 : relevé par
Gabriel. L'écran de série lisait déjà l'historique, la fiche non. Elle lit maintenant le dernier
passage propre, charge, bande, tenue ou assise, et le niveau courant seulement sans historique.

**`SCHEMA.core` était décalé**, trouvé en insérant les deux positions : la table suivait un ordre de
vivier qui n'est plus le sien, gainage latéral en 2 et bird-dog en 4. Sans effet visible, la seule
position de gainage qui dépend du matériel, la planche sur ballon, étant restée alignée, mais les
libellés de perte auraient été faux. Réaligné ; `test45` vérifie la longueur de chaque ligne et
l'alignement du gainage.

### Gainage latéral avec abductions : répétitions cadencées (v2.19)

**Déclencheur.** Question de Gabriel le 15 septembre 2026 en lisant la fiche du gainage latéral
jambe levée : la jambe reste en l'air, alors qu'il pensait l'exercice dynamique ; que dit la
littérature ? Sa position : le mouvement de la jambe crée des déséquilibres qui demandent un gainage
plus poussé, la jambe tenue n'apporte pas grand-chose.

**Ce que dit la littérature**, vérifié par recherche. L'exercice cité partout comme l'un des plus
sollicitants pour le moyen fessier, Boren et al. 2011 (IJSPT), est dynamique : planche latérale
tenue, jambe du dessus montée puis redescendue au métronome à 60, huit répétitions dont cinq
mesurées ; 103 % de la CVMI sur le moyen fessier de la jambe d'appui, 89 % sur la jambe qui bouge.
Une réplication sud-africaine borne la course à 35° avec une barre-repère, deux temps de montée et
deux de descente. Aucune étude trouvée ne compare jambe tenue et jambe mobile ; la version tenue
existe en pratique clinique, en tenues de 30 à 60 s, sans mesure. Deux réserves : Boren mesure un
pic sur 100 ms, métrique qui avantage la phase concentrique ; et la revue d'Oranchuk 2019 sur
l'isométrie donne plus d'hypertrophie en position longue qu'en position courte, or la jambe tenue
laisse le moyen fessier du dessus à sa longueur la plus courte, extrapolation de Claude. Aucune
mesure du tronc ne compare les deux versions : le mécanisme de Gabriel est plausible, pas mesuré.

**Décision : la jambe monte et descend au son, le tronc reste isométrique.** La contrainte
« gainage en isométrie et anti-mouvement uniquement » vise la colonne ; ici seule la hanche bouge.
La décision de la v1.17, « chaque successeur reste isométrique », était un choix de cohérence avec
`mode:'time'`, pas un choix fondé sur la littérature : raison nouvelle au sens de ce carnet.

- **Un drapeau distinct, `cadence`, et non une échelle de tenues à un barreau.** Sur les 28 lignes
  qui lisaient `rhythm` en v2.18, 18 servaient l'échelle et 10 le moteur sonore ; un barreau unique
  aurait affiché « marche 1 sur 1 », le défaut retiré en v2.16. La progression est celle d'un `bw`
  ordinaire, 8-15 par côté, 2 séries, plafond au haut de fourchette.
- **Déroulé des tenues par côté, pas du bird-dog.** Un côté entier puis l'autre : changer de côté,
  c'est se retourner. Stop définitif par côté comme en v1.13, la planche est continue et la
  reprendre en deux morceaux retirerait le gainage que le mouvement met à l'épreuve ; « Réinitialiser
  ce côté » pour un Stop accidentel, « − 1 rép » par côté mesuré, plancher à zéro, validation sur
  les deux côtés et au moins une répétition chacun, côté le plus court au journal. ESPACE démarre,
  arrête, lance le second côté, puis ne fait plus rien ; « - » rogne le côté courant.
- **Compte en fin de descente**, jambe revenue : la descente freinée est la moitié de l'exercice.
  950 Hz au début de chaque montée, 700 Hz au début de chaque descente, ton de cible à la fin de la
  répétition qui atteint la cible, à la place du 950 qui ouvre la suivante ; la cadence continue
  jusqu'au Stop.
- **Cadence 1,5 s / 1,5 s**, choix de Gabriel sur maquette : la montée en 1 s proposée par Claude
  était violente, la descente en 2 s trop lente. Symétrique comme les tempos étudiés ; le cycle de
  3 s garde 15 répétitions à 45 s de planche, le plafond des tenues au sol. Le 2/2 de la réplication
  aurait porté la série à 60 s.
- **Établissement de la ligne, 3 s**, relevé par Gabriel sur maquette : la première version
  enchaînait la montée sur le zéro du décompte, comme au bird-dog, dont la position de départ est un
  repos. Ici elle exige un mouvement. Au zéro, le double coup à 1150 Hz du gainage latéral classique,
  puisque c'en est un : le bassin se décolle ; 3 s jambes serrées, étiquette verte « Établis la
  ligne », puis la première montée. Le 1150, écarté en v2.17 parce qu'il est collé au ton de cible,
  ne s'y confond pas ici, double coup au départ suivi de silence contre coup simple en fin de série.
  Coût : 48 s de planche par côté à 15 répétitions.
- **Modèle de temps** : `INSTALL + 2 × (prep + étab + cible × cycle)`, le rejeu ne modélisant que
  l'installation, comme les tenues.
- **Fiche.** Nom « Gainage latéral, abductions », « Side plank with hip abduction ». Geste au son,
  course d'environ 35°, souffle en montant, pied dans l'axe, effleurer l'autre jambe sans s'y
  reposer. Critère de fin propre : le bassin qui descend ou part en arrière. Vigilance corrigée,
  « avec un appui en moins » étant faux. Ligne Épaules de la v2.18 conservée ; la paire nommée au
  raccord reste juste, l'appui étant le même. Illustration inchangée : ses deux panneaux sont déjà le
  départ jambes serrées et l'arrivée jambe levée.
- **Pas de lest, et pas de marche suivante décidée.** Claude avait proposé un successeur lesté à la
  cheville. Objection de Gabriel : le lest travaille la jambe et le fessier, pas le gainage.
  Mécanique à l'appui : le lest est à l'aplomb du pied d'appui, une masse posée sur un appui n'ajoute
  presque rien au moment de flexion au milieu de la poutre, au niveau lombaire ; il charge les
  abducteurs du dessus et la hanche d'appui. Aucun conflit direct avec les jambes pour autant, le
  gainage n'étant jamais adjacent au poste jambes dans l'ordre du circuit. Claude a ensuite proposé
  d'arrêter la chaîne en impasse assumée ; Gabriel a refusé de trancher : une discussion dédiée le
  jour où il y sera. Texte de plafond : « pas de marche outillée au-delà ; la suite reste à
  décider ».

**Migration.** L'exercice est débloqué depuis le 15 septembre, pendant la séance du constat, donc une
performance a pu naître en secondes. L'écrêtage existant aurait borné une cible de 15 s à
15 répétitions et gardé une mémoire en secondes : la performance d'un exercice cadencé dont la
fourchette diffère de la base repart de zéro, le déblocage étant conservé. Les passages joués en
secondes restent à l'historique, marqués `it.u = 's'` : la fiche et le détail de séance les lisent en
secondes, le chemin des paliers les ignore. Marqueur écrit plutôt que déduit à la lecture, qui
casserait le jour où la base bougerait. L'instantané de correction qui porterait une performance en
secondes est retiré : cette séance ne se corrige plus. Idempotente, sans effet sur un état neuf.
Aucune sauvegarde réelle n'a été fournie pour ce lot : la migration est testée sur des états
construits, pas sur l'export de Gabriel.

**Repli douleur : une mesure appartient au couple étape plus exercice.** Le repli remettait `st.val`
à zéro, donc la mesure des exercices à répétitions, mais pas `st.sides` ni `st.done`, où vit celle
des tenues depuis la mesure côté par côté. Vérifié : 17 s tenues sur la planche sur ballon
arrivaient mesurées et validables sur la planche au sol, et seraient parties au journal sous elle,
dans sa performance et dans sa mémoire de cible. Deux paires étaient concernées, planche sur ballon
vers planche au sol et planche au sol vers planche sur genoux, dans les deux sens, repli et retour.
La règle retenue est celle déjà appliquée au rythme : la mesure ne suit pas l'étape qui change
d'identité, quel que soit le mode, et le repli l'efface. L'argument contraire, ne pas punir celui
qui signale une douleur, ne tient pas : pour garder une tenue finie, il suffit de la valider avant
de signaler, et une série déjà validée reste acquise. Relevé en codant le nettoyage de la cadence,
corrigé dans le même lot à la demande de Gabriel.

**Maquette avant code**, publiée en artifact, deux révisions : cadence et comptage réglables, sons
réels, deux côtés en blocs ; la seconde ajoute l'établissement et la cadence 1,5/1,5, retenues
telles quelles par Gabriel le 17 septembre.

### Repère sonore des tenues chronométrées (v2.20)

**Déclencheur.** Demande de Gabriel le 18 septembre 2026, sur la planche du jour, déjà pensée sur
la planche et le gainage latéral précédents : psychologiquement, c'est dur de ne pas savoir où on en
est. Sur une tenue chronométrée, `runHold` ne faisait entendre que le décompte de préparation, puis
rien jusqu'à cible − 5, soit 40 s de silence sur une planche à 45, et en appui latéral l'écran ne se
voit pas.

**Ce n'est pas la réouverture de l'abandon « bip toutes les 5 s comme mesure de tenue ».** Celui-là
créditait la valeur au dernier bip entendu. Le repère ne mesure rien : la mesure reste le Stop et le
rognage, le moteur ne voit rien, et l'empreinte de neutralité est identique à la v2.19.

**Toutes les 5 s, pas chaque seconde.** Gabriel proposait l'un ou l'autre. Trois raisons pour 5 s.
Un repère à la seconde rend indiscernables les cinq bips d'approche, qui sonnent déjà à chaque
seconde : garder 1 s aurait imposé de refondre l'approche, deux changements au lieu d'un. Les cibles
de tenue sont des multiples de 5 par l'arrondi de la v1.11, donc le dernier repère tombe pile au
début de l'approche et rien ne se décale entre les deux systèmes. Et neuf tranches se comptent sans
effort, quand quarante-cinq coups font un métronome qui allonge le temps plutôt qu'il ne le
raccourcit. La maquette permettait les deux ; Gabriel a gardé 5 s.

**Règles.** Un coup à chaque multiple de 5 s écoulées. L'approche et la cible gardent leurs sons et
la priorité : à une seconde qui porte déjà un bip, le repère se tait. Il continue après la cible
jusqu'au Stop, la cible étant ce qu'on vise et pas là où l'on s'arrête. Il repart à zéro sur le
second côté, comme le chrono. Coup simple par `tone()`, qui gagne un gain optionnel, et non par
`beep()`, dont le double coup à 260 ms ferait d'un repère un signal. Pas de vibration, qui
doublerait le son derrière la même porte, téléphone au sol.

**Timbre.** 1800 Hz, 40 ms, gain 0,12 contre 0,45 pour tous les autres sons : un clic aigu et bref,
hors de la palette 700, 950, 1150, 1200. Un repère grave à bas volume aurait été plus doux sur le
papier et inaudible en pratique, un haut-parleur de téléphone restituant mal sous 500 Hz. Valeurs
proposées sur maquette HTML publiée, avec curseurs de fréquence, volume et durée, retenues telles
quelles par Gabriel.

**Périmètre : les quatre tenues chronométrées**, planche, planche sur ballon, planche sur genoux et
gainage latéral. Pas les étirements, décision de Gabriel : blocs de 20 à 30 s en décompte, qui ont
déjà un bip de bascule et un de fin. Pas le bird-dog, le dead bug ni les abductions, déjà rythmés
au son. Un seul point d'émission, dans `runHold`, et la suite le vérifie.

**Actif par défaut**, décision de Gabriel, coupable dans la card Sons, derrière l'interrupteur
global. Même forme que `state.sound` : la clé absente vaut vrai, donc ni clé dans `defaultState` ni
migration, et une sauvegarde antérieure l'a d'office.

**Ce que le repère servira en pratique.** Au 18 septembre, le gainage latéral ne sort plus au tirage,
remplacé par les abductions depuis le 15 ; il ne revient qu'en repli douleur. Et la planche du jour,
47, 49 et 48 s, a débloqué la planche sur ballon, qui retire la planche au sol : le repère servira
d'abord à la planche sur ballon.

### Un message de progression nomme le palier, pas le montage (v2.21)

**Déclencheur.** Montée de bande sur les face pulls le 20 septembre 2026, jaune vers rouge. Le
récapitulatif a annoncé « Face pulls à l'élastique : bande rouge dans le dos, retour à 10 reps ».
Le placement était faux : le face pull s'ancre devant, à hauteur de visage. La chaîne « dans le
dos » était concaténée à tous les exercices à bande de résistance, alors qu'elle ne vaut que pour
les pompes aux poignées, seule des douze à passer la bande derrière le corps.

**La règle qui en sort.** Un placement est une consigne de montage : il se lit avant l'exercice, et
la puce de matériel le porte déjà, conditionnée à l'exercice qui le mérite. Le récapitulatif se lit
une fois la séance finie ; il dit ce qui a changé, le barreau et la cible, et rien sur la façon de
monter le matériel. Le sens descendant n'avait jamais porté de placement, les deux sens sont
maintenant symétriques.

**Écartées.** Un `id==='pompes-poignees'` recopié dans le message, qui aurait rendu la duplication
correcte sans la supprimer, et un champ `bndPos` au catalogue, qui aurait porté une seule valeur
utile pour un seul exercice. Le seul endroit qui a une raison de connaître ce placement reste la
puce de matériel d'`app9.js`, et il y est déjà.

**Effet de bord retiré avec.** La branche « bande devenue aucune » du message de montée disparaît :
`bandLabel` rend déjà « sans bande », et cette branche était de toute façon hors d'atteinte, le
barreau `aucune` n'existant qu'au bas de l'échelle des pompes et une montée n'y menant jamais.
Une bande canonique absente de l'inventaire déclaré ne passe pas par là non plus : `nonQualifie`
lève le drapeau matériel et `applyProgress` sort avant le bloc de montée.

### Cadence : l'aigu sur la montée-cible, le pont au son, un décompte au lancement (v2.22)

**Déclencheurs.** Trois retours de Gabriel le 22 septembre 2026, le jour de sa première séance
d'abductions à la cadence et de son dernier pont au sol, 20, 20, 20, qui a débloqué le pont lesté.

**Le problème d'origine, en une phrase.** Sur les abductions, le compteur passait à la répétition
suivante au moment où la jambe repartait, et l'aigu de la cible tombait sur l'élévation d'après.
Constaté par Gabriel, pas déduit.

**Analyse : la spec v2.19, pas le code.** Le code faisait ce qui avait été écrit : une répétition
compte en fin de descente, l'aigu remplace le 950 qui ouvre la suivante. Mais le cycle est continu,
sans pause en bas : la fin de la descente n et le début de la montée n+1 sont le même instant. La
règle avait été transposée du bird-dog sans ce qui la rendait lisible, la bascule de 2 s qui sépare
la fermeture d'une tenue de l'ouverture de la suivante.

- **Le crédit au Stop ne bouge pas**, fin de descente. C'est le plus robuste à la latence : un Stop
  n'importe où dans la répétition suivante, 3 s de fenêtre, enregistre le bon compte ; compter au
  sommet la réduirait à 1,5 s.
- **L'aigu remplace le 950 de la montée de la répétition-cible**, « celle-ci est la bonne », sur
  l'élévation que l'on compte. Le 700 de descente reste intact.
- **Le grand chiffre porte la répétition en cours**, 1 dès la première montée, validé par Gabriel ;
  la ligne des comptes porte les répétitions terminées, ce que le Stop enregistre. Réserve assumée :
  deux nombres qui diffèrent d'une unité pendant le mouvement.

**Le pont fessier et sa lignée au son.** Question de Gabriel : pourquoi pas comme le bird-dog et les
abductions ? Critère retenu, déjà écrit pour bird-dog et dead bug : le son porte les exercices où
**l'écran ne se voit pas**, sur le dos, à quatre pattes, sur le côté. Le pont, sur le dos, et le hip
thrust, les épaules sur un banc, y sont ; les squats et les pompes n'y sont pas. Deux arguments en
plus : la fiche prescrivait déjà trois temps, monter, marquer un temps en haut, redescendre
lentement, que rien n'imposait ; et accélérer un pont, c'est finir en cambrant sur la L5. Mesuré sur
la séance du 22 septembre : 117 à 123 s pour 20 répétitions, environ 5,4 s par répétition
installation déduite, contre 4,5 modélisées.

- **Cinq fiches**, pont au sol, pont lesté, pont sur une jambe, hip thrust sur une jambe et sa
  version lestée. Le pont au sol est retiré du tirage depuis le 22 septembre mais reste le repli
  douleur des quatre autres : il reçoit la même cadence, sinon le repli changerait de régime de
  mesure en pleine séance.
- **Trois temps, 1,5 s de montée, 1 s de tenue en haut, 2 s de descente**, cycle de 4,5 s, 20
  répétitions en 90 s. Valeurs proposées par Claude, **non éprouvées sur maquette** : Gabriel a
  demandé le lot d'un seul tenant. À ajuster à l'usage. La tenue en haut est silencieuse, le 700
  tombe à sa fin.
- **Pas d'établissement**, le décompte enchaîne sur la première montée comme au bird-dog : la
  position de départ est un repos.
- **Reprise, comme le bird-dog**, décision de Gabriel. Rien n'est continu, une pause en bas est un
  repos. Reprendre repart du compte du côté arrêté, décompte rejoué, et l'aigu ne sonne que si la
  cible reste à atteindre. Jamais sur un côté quitté : Second côté ferme le premier. ESPACE ne
  reprend pas, la reprise est un bouton, comme au bird-dog. Les abductions gardent leur Stop
  définitif, la planche y est continue.
- **Un bloc ou deux selon l'exercice.** Le moteur de cadence était câblé à deux côtés ; il lit
  désormais `e.side`. Ponts bilatéraux, un seul compte ; unilatéraux, un côté puis l'autre, en
  changeant de jambe.
- **Modèle de temps** : `INSTALL + côtés × arrondi(décompte + établissement + cible × cycle)`.
  L'arrondi est nouveau : un cycle de 4,5 s tombe sur des demi-secondes et le modèle rejoué compte
  des secondes entières.

**Un défaut trouvé en route.** La migration v2.19 effaçait la performance de tout exercice cadencé
dont la fourchette diffère de la base, au motif que le témoin d'un régime tenu est la fourchette.
Avec le pont en cadence, une fourchette héritée relevée aurait été **effacée** au lieu d'être écrêtée.
Pris par `test40`. La migration est bornée à une liste nommée, `CAD_DEPUIS_SECONDES`, qui ne contient
que les abductions : le motif de la v2.19 portait sur un changement d'unité, pas sur la cadence.

**Décompte de lancement.** Demande de Gabriel : le chrono d'échauffement partait à l'instant du clic
sur « Lancer la séance ».

- **5 s fixes, sans réglage**, décision de Gabriel. Le réglage Décompte existant reste celui des
  tenues, des étirements et des cadences.
- **Mêmes sons que le décompte des tenues**, un bip à 700 Hz chaque seconde, 1150 Hz au départ.
- **Seulement devant l'échauffement** : sans lui, le premier écran est une série sans chrono, ou une
  tenue qui a déjà son propre décompte.
- Affiché sur l'écran d'échauffement, première étape en surbrillance, « Départ dans ». Pause le
  fige, la reprise rejoue le bip de la seconde en cours ; Étape suivante et Passer l'échauffement
  l'annulent.
- **Chronométré, donc compté** : il tique au modèle rejoué et entre au poste échauffement de
  l'annonce, sans quoi l'identité « séance jouée aux cibles égale annonce » (v1.16) casserait.

**Non-régression mesurée.** Empreinte de neutralité : 206 lignes, 132 écarts, tous sur la seule
durée annoncée, aucun tirage, cible, charge ni barreau touché. +5 s sur les 96 tirages avec
échauffement, du fait du décompte ; +5 s par série de pont en plus, 50 s de cadence contre 45 de
tempo modélisé à la cible de 10 et décompte à 5 s.

### Le message de recul dit ses deux lectures (v2.23)

**Le problème d'origine, en une phrase.** Pompes le 25 septembre 2026 : 9, 9, 7 sous une cible à 9,
après 9, 9, 6 au passage précédent, et le récapitulatif annonce « Pompes : cible recalée de 9 à 8,
deux passages en dessous ». Constaté par Gabriel, qui a demandé si c'était juste.

**La règle est juste, le message ne l'était pas.** Lectures successives 8, 6 et 7, la plus petite
série de chaque passage ; la fenêtre de la v2.14 donne max(6, 7) + 1 = 8, le 8/8/8 qui avait fixé
la cible à 9 étant sorti de la fenêtre. 9/9/7 n'est pas « 9 sur chaque série », et le recul ne coûte
rien : aucune décision ne lit la cible, la montée de bande exige 15/15/15, un 9/9/8 au passage
suivant rend 9. Mais le message annonçait un recul là où la seconde lecture était meilleure que la
première, 7 contre 6, 25 répétitions contre 24. La v2.14 le justifiait par « deux passages
consécutifs sous la cible », en pensant à deux mauvaises séances ; ce cas-ci, une mauvaise séance
suivie d'une remontée, n'avait pas été examiné. Raison nouvelle, sur le message seul.

**Retenu, option A : le message porte les deux lectures**, l'ancienne puis celle du jour :
« Pompes : cible recalée de 9 à 8, deux passages en dessous (6 puis 7) ». La direction se lit dans
les deux nombres, et un vrai recul, 10 puis 6 puis 7, reste signalé. Parenthèse sans unité, comme
les signaux de plancher du même récapitulatif. Choix de Gabriel parmi trois options.

**Écartés.** Taire le message quand la dernière lecture dépasse la précédente : le cas 10, 6, 7, qui
fait reculer la cible de 11 à 8, serait réduit au silence. Option B, ne pas recaler quand la
dernière lecture monte : la cible serait restée à 9, sans état bloquant possible puisque des
lectures qui montent dans une fourchette bornée finissent par l'atteindre, mais elle aurait dépendu
implicitement de trois passages, pour une ancre d'une répétition dont la v2.14 a mesuré qu'elle ne
coûte aucun passage. Option C, la comparaison de rang, reste au point ouvert 5, dont c'est la
première observation concrète.

**Non-régression mesurée.** Empreinte de neutralité identique à la v2.22 sur ses 206 lignes : seul
un libellé change. `falsif41`, converti au remplacement exact, 22 mutations, toutes tombent.
