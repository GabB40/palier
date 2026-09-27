# ADR-0004 : la faille des douze tenues avec une pause au milieu n'est ni traitée ni journalisée

- **Date** : 2026-09-27
- **Statut** : accepté
- **Remplace** : carnet, section 2, « Tenues rythmées », point « Pas de reprise », dernière phrase ;
  section 5, restes ouverts des tenues rythmées (v2.17) et de la v2.22 (texte d'origine en fin de
  document)

## Contexte

Sur les tenues rythmées (bird-dog, dead bug, v2.17) et le pont cadencé (v2.22), « Reprendre »
après une pause rejoue le décompte et repart sur le côté en cours : une série de douze tenues
coupée au milieu s'enregistre comme une série continue, et rien ne le dit au journal. Fréquence :
aucun cas relevé depuis la v2.17.

## Décision

Décision de Gabriel, 27 septembre 2026 : la faille n'est ni traitée ni journalisée, trop
spécifique pour un cas qui peut ne jamais se produire. Elle cesse d'être un reste ouvert.

La reprise elle-même, décidée en v2.17 (carnet, section 2), ne change pas.

## Écartés

Motifs rédigés par Claude à l'appui de la décision, non formulés par Gabriel.

- **Journaliser la pause** : un champ de plus dans l'historique, donc une migration et des
  suites, pour une information que personne ne lit tant que le cas ne se produit pas.
- **Refuser la reprise sur ces exercices** : c'est revenir sur la décision de la v2.17, qui a ses
  motifs propres, une série n'y étant que la somme de tenues intactes.

## Conséquences

- Aucun code ne change.
- Raison nouvelle de rouvrir : une série coupée constatée à l'usage, dont l'enregistrement a
  faussé une progression.

## Carnet : texte d'origine

Section 2, « Tenues rythmées », point « Pas de reprise », dernière phrase :

> La faille, douze tenues avec une pause au milieu, existe un cran plus haut que celle de la
> v1.13 ; elle n'est pas journalisée, pas d'emblée.

Section 5, restes ouverts des tenues rythmées :

> Restent ouverts : les successeurs de plafond, carrés et résistance, encore des marches écrites,
> et la faille des douze tenues avec une pause au milieu, non journalisée.

Section 5, reste ouvert après la v2.22, dernière phrase :

> La faille des douze tenues avec une pause au milieu, nommée en v2.17 pour le bird-dog, vaut
> désormais aussi pour le pont, non journalisée de la même façon.
