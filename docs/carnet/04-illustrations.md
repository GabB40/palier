## 4. Illustrations

**Style** : croquis crayon, trait graphite franc, hachures légères, fond papier crème, personnage
athlétique sans traits de visage, débardeur et short, pieds nus, matériel en orange, deux panneaux
côte à côte séparés d'un trait vertical.

**Méthode de génération** (Gemini) : toujours joindre l'image maîtresse `goblet-squat` comme référence,
jamais la dernière générée, pour éviter la dérive sur une longue série. Les quatre illustrations du
lot v2.5 ont été produites hors de cette méthode, sans prompt structuré, et acceptées telles quelles :
elles tiennent le style et montrent ce qu'aucune image de la banque ne montrait, l'avant-pied sur
l'arête et le talon abaissé sous le niveau de la marche.

Elles portent en revanche un trait vertical de mur à l'intérieur de chaque panneau, dans la bande où
`find_separator` cherche le séparateur. Le script prend donc ce mur pour la séparation, l'efface et
redessine le sien au même endroit, ce qui laisse un fragment d'encre dans la gouttière. Mesuré, 25,
24, 18 et 8 px sur les quatre, contre **23 px sur l'ancienne `mollets-debout` déjà en banque** : le
niveau est celui que le pipeline produit depuis toujours, ce n'est pas une régression, et
`prep_illus.py` n'a pas été touché. Il ne devait pas l'être : les PNG d'origine des 45 autres images
ne sont plus disponibles, donc toute modification du script produirait une banque où quatre images
seraient passées par une version et les autres par une autre, ce que la règle du pipeline sans
exception vise précisément à empêcher.

**Corrigé en v2.15, sans changer le défaut du script.** Le fragment n'était pas le seul dégât :
en effaçant le mur pris pour séparateur, le script effaçait le pouce de la main qui le touche, et
les quatre panneaux gauches montraient une main coupée. Constaté par Gabriel, qui a fourni les
quatre PNG d'origine, intacts. Mesuré sur les sources : mur à 0,395-0,425 de la largeur, dans la
bande de recherche de 0,35 à 0,65, et vraie gouttière vide de 0,40-0,43 à 0,55-0,59, le milieu
tombant dans la gouttière sur les quatre. `prep_illus.py` reçoit un **troisième argument optionnel**,
la position du séparateur en fraction de la largeur ; sans lui, le script ne change pas d'une ligne,
`find_separator` reste le défaut, et la banque n'a donc toujours qu'une version du script pour toute
image qui n'a pas besoin de l'argument. Les quatre images sont repassées avec `0.5` : main
intacte contre le mur, mur du panneau gauche conservé puis séparateur du pipeline dans la
gouttière, deux traits à 17 px l'un de l'autre, prix de la fidélité au dessin. Table de
quantification identique aux 52 autres, somme de luminance 1031, 720 px de large ; les quatre
passent au format carré, comme les treize qui l'étaient déjà, parce que le panneau gauche gagne
son mur et sa main. Pas d'incrément de version : le lot v2.15 n'était pas déployé.

```
Using the attached image as a strict style and character reference — same character,
same tank top and shorts, barefoot, same graphite pencil style, same paper background,
same two-panel layout with a thin vertical separator, same orange equipment color,
same tight framing — generate this exercise instead:

LEFT PANEL: [position de départ]
RIGHT PANEL: [position d'arrivée]

IMPORTANT: the two panels must show two DIFFERENT positions. The right panel is NOT a
mirror or a flipped copy of the left. Both figures face the same direction.
The figure has NO facial features, blank face.

Forbidden: no notebook frame, no book spine, no page edges, no text, no numbers,
no labels, no arrows, no shoes, no background objects, no watermark, no sparkle.
Output: PNG, 1024 px wide, 4:3.
```

**Évolution de style** : `rowing-suspension` est passée à un rendu plus réaliste (anatomie ombrée),
jugé cohérent avec la banque par Gabriel. Format natif conservé (720×356, ratio 2:1) : la vignette
`cover` rogne les extrémités mais la sangle orange, signature de l'exercice, reste au centre.

**Pièges rencontrés** :
- Les exercices symétriques (dead bug, cardio, mollets) déclenchent le raccourci du miroir. Vérifier
  systématiquement que le panneau droit n'est pas le gauche retourné. En cas d'échec répété, générer
  les deux positions en images séparées et les assembler au post-traitement.
- Les objets filaires (élastiques, cordes) partent souvent de l'épaule au lieu de la main. Décrire le
  trajet point par point.
- Le débardeur et le visage neutre disparaissent régulièrement. Contrôler à la réception.
- Ne jamais donner un angle de plan transverse à une vue de profil. « Coudes à 45° du tronc » est la
  bonne consigne technique mais elle est invisible de côté : le modèle la satisfait dans le plan
  sagittal en inclinant l'avant-bras, ce qui contredit la consigne de position (développé au sol,
  premier jet, coude en l'air au lieu du sol). Décrire la position, pas l'angle.
- Les deux bras parfaitement alignés en profil ne lisent qu'un seul objet. Demander explicitement le
  décalage du bras éloigné quand l'exercice porte une charge dans chaque main.
- Le cadrage large n'est pas un problème : `prep_illus.py` recadre en lot.
- Les exercices en suspension : le modèle redresse spontanément la figure vers la verticale.
  Imposer dans le prompt `body at roughly 30 degrees from the floor, closer to horizontal than
  to standing`, puis mesurer l'angle sur l'image reçue (deux passes ont été nécessaires).

**Exception de style, les illustrations de mouvement portent des flèches (v2.4).** Le prompt
canonique ci-dessus les interdit. Les illustrations qui doivent montrer une trajectoire y dérogent :
`cercles-de-bras` porte des arcs pointillés orange à pointes de flèche, et `echauf-nuque` suit la
même convention. Sans cette note, la prochaine génération de mouvement suivra le prompt canonique et
perdra l'information de trajectoire. Les deux images de nuque viennent par ailleurs de ChatGPT et
non de Gemini, à partir de prompts calés sur `cercles-de-bras` comme référence de style : trait
légèrement plus fin et fond légèrement plus clair que le reste de la banque, écart jugé acceptable
sur deux fiches.

**Une seconde image de référence, de pose et jamais de style (v2.13).** La règle « toujours
`goblet-squat`, jamais la dernière générée » vise la dérive en série, la copie de copie. Une image
stable de la banque n'entre pas dans ce cas, mais elle ne remplace pas la maîtresse pour autant :
`pont-fessier` est torse nu, sans matériel et sans orange, elle ne porte donc ni le débardeur ni
l'ancre de couleur. Les quatre illustrations du lot ont été générées avec les deux images jointes et
leurs rôles nommés dans le prompt, `goblet-squat` en référence stricte de style et de personnage,
`pont-fessier` en référence de pose et de cadrage seulement, avec l'instruction explicite de ne pas
copier son torse nu. Résultat exploitable du premier coup sur les quatre.

Deux observations de ce lot. Le prompt doit décrire le **point de contact** d'une charge et la liste
des placements interdits, pas l'objet : sans cela la kettlebell se posait n'importe où. Et la jambe
libre d'un exercice unilatéral doit être demandée cuisse dans l'axe de la cuisse d'appui, jamais
ramenée vers la poitrine : ramenée, elle croise le torse en vue de profil et efface la ligne
épaules-hanches-genou que l'image doit montrer. La consigne écrite de la fiche dit la même chose que
le dessin, sinon les deux se contrediraient.

La banque reste mixte sur le vêtement, et c'est assumé : les deux fiches au sol du lot sont torse nu
comme `pont-fessier`, `dead-bug` et `planche`, les deux fiches sur banc portent le débardeur comme
`gainage-lateral`. La cohérence avec la fiche voisine vaut mieux que l'uniformité de la banque.

