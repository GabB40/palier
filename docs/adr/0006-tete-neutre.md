# ADR-0006 : tête neutre, la position en vigilance et l'arrêt en critère de fin

- **Date** : 2026-09-27
- **Statut** : accepté
- **Remplace** : carnet, section 2, « Une règle d'arrêt a sa ligne, et un texte unique se révèle
  progressivement (v2.12) », quatre premières phrases (texte d'origine en fin de document)

## Contexte

Pendant les exercices qui sollicitent les épaules, Gabriel perçoit une faiblesse de la nuque et une
tête qui part en avant, sur fond de tension occiput-trapèzes et de SCOM tendu ; ces exercices
figurent dans 23 séances sur 23 du journal, à 1,96 poste par séance en moyenne. Il ne sait pas dire
s'ils aggravent, il dit qu'ils rendent le déséquilibre perceptible. Le bouton « Douleur
aujourd'hui » n'a jamais servi : la gêne est diffuse et arrive après coup, l'outil ne la voit pas.

Trois constats sur le catalogue de la v2.25. Plusieurs fiches ne disaient rien de la tête. Les
tractions se contredisaient : la vigilance interdisait de tendre le menton vers la barre, pendant
que la description (« amener le menton au niveau de la barre ») et le critère de fin (« le menton
qui ne passe plus franchement ») récompensaient précisément ce geste, en fin de série, quand la
nuque cède. Et le relevé du 27 septembre proposait d'écrire des règles d'arrêt dans `vig`, ce que
la décision v2.12 interdisait.

Le travail correctif lui-même vit hors de PALIER, dans l'app APLOMB, décision de Gabriel.

## Décision

**La décision v2.12 est maintenue et migre ici.** Le critère de fin de série vit dans le champ
`fin`, ni dans `desc` qui décrit le geste, ni dans `vig` qui nomme ce qui est en jeu sur le corps.
Il n'existe que là où l'échec technique arrive avant l'échec musculaire ; toutes les fiches portent
la règle générale et un lien vers le texte complet. Le répéter partout le ferait lire nulle part.

**Tête neutre.** La tête ne va jamais chercher la charge, les mains, le sol ni la barre : menton
légèrement rentré, nuque longue. Sa position s'écrit en `vig`, sous `<b>Cou :</b>` ou
`<b>Cou/épaules :</b>` ; quand la tête part, la série s'arrête, et cet arrêt s'écrit en `fin`.

- Consigne de cou en vigilance sur dix-sept fiches : face pulls, les deux élévations latérales,
  pompes et pompes inclinées, développé au sol, les quatre tractions, les deux tirages horizontaux
  (suspension, kettlebell), les trois planches et les deux gainages latéraux.
- Critère de fin créé sur cinq fiches : face pulls (la tête qui avance, les coudes qui tombent),
  développé au sol (la tête ou le bas du dos qui décollent), élévations à l'élastique (même critère
  que la version haltères) et les deux tractions strictes. Étendu sur trois : élévations latérales
  (l'épaule qui monte vers l'oreille) et les deux tractions assistées (le menton qui n'atteint plus
  la barre sans tendre le cou). Vingt et une fiches portent un critère propre.
- Tractions : la hauteur de référence est le menton au niveau de la barre, porté par la montée du
  corps et non tendu vers elle. Une traction correcte ne tend pas le cou : le texte ne durcit pas
  la définition d'une répétition, il retire celles qui étaient finies au cou.

Critère du développé au sol : apport de Gabriel. La tête qui décolle signale que d'autres muscles
que pectoraux et triceps viennent finir la répétition, ce qui vaut arrêt par échec technique.

Aucun changement de tirage, de viviers, de progression ni d'état.

## Écartés

Motifs rédigés par Claude, arbitrage délégué par Gabriel le 27 septembre 2026.

- **Règles d'arrêt en `vig`** (« arrête la série dès que… »), proposées par le relevé : une seconde
  règle d'arrêt, lue à côté du critère de fin, contredit la décision v2.12.
- **Réécrire `etir-nuque` vers l'étirement de l'élévateur de la scapula** : change le geste et
  l'illustration, alors qu'APLOMB porte un bloc d'étirements de nuque quotidien. Deux endroits
  pour le même travail finiraient par diverger.
- **Réserver une place du haut du corps parmi les étirements de fin** : même motif. La nuque sort
  aujourd'hui une séance sur trois dans la rotation.
- **Toucher à l'entrée et à la sortie du développé au sol**, qui relèvent la tête depuis le dos
  sous charge : hypothèse non établie, Gabriel n'y ressent rien, et « d'un bloc » répond à la
  contrainte L5.

## Conséquences

- `test39`, section 7 : consigne de cou sur les dix-sept fiches, aucune règle d'arrêt en
  vigilance, contenu des critères nouveaux, hauteur de référence des tractions, rendu. Section 6 :
  compte à 21, témoin de fiche sans critère déplacé des face pulls vers les curls haltères.
  `falsif39` reçoit huit mutations par remplacement exact.
- Les comptes de tractions peuvent baisser d'une répétition après la v2.26 sans qu'il y ait
  régression : ce sont les répétitions finies au cou qui sortent du compte.
- Raison de rouvrir les deux étirements écartés : APLOMB cesse d'être en usage.
- Le bouton douleur ne mesure pas ce problème. Rien à instrumenter : le ressenti décide.

## Carnet : texte d'origine

Section 2, « Une règle d'arrêt a sa ligne, et un texte unique se révèle progressivement (v2.12) »,
premier paragraphe :

> Le critère de fin de série vit dans un champ `fin` propre, ni dans `desc` qui décrit le
> geste, ni dans `vig` qui nomme ce qui est en jeu sur le corps. Sept fiches le portent,
> celles où l'échec technique arrive avant l'échec musculaire ; toutes portent la règle
> générale et un lien vers le texte complet. Le répéter partout le ferait lire nulle part.
