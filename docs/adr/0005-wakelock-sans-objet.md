# ADR-0005 : l'écran qui s'éteint pendant une série longue est sans objet, pas de `wakeLock`

- **Date** : 2026-09-27
- **Statut** : accepté
- **Remplace** : carnet, section 2, « Tenues rythmées », paragraphe « Suites », première phrase
  (texte d'origine en fin de document)

## Contexte

Relevé en v2.17 : sur une série de deux minutes, l'écran s'éteint, le son porte le rythme mais le
Stop se cherche à l'aveugle ; `navigator.wakeLock` restait à examiner dans un lot propre. Le cas
suppose une séance sur téléphone. Fréquence : aucune séance concernée, les séances se faisant sur
PC.

## Décision

Décision de Gabriel, 27 septembre 2026 : sans objet. Les séances se font sur PC, où l'écran ne
s'éteint pas pendant une série. Pas de `wakeLock`, et le point cesse d'être une suite à examiner.

## Écartés

Motif rédigé par Claude à l'appui de la décision, non formulé par Gabriel.

- **`wakeLock` par précaution** : du code et des suites pour un appareil qui ne sert pas aux
  séances.

## Conséquences

- Aucun code ne change.
- Raison nouvelle de rouvrir : une séance sur téléphone. La synchronisation (v2.24) existe pour
  les séances en déplacement ; si l'appareil emporté est un téléphone, le cas revient.
- L'entrée du changelog qui notait « `wakeLock`, à examiner » est de l'historique et reste telle
  quelle.

## Carnet : texte d'origine

Section 2, « Tenues rythmées », paragraphe « Suites », première phrase :

> L'écran s'éteint sur une série de deux minutes, le son porte le rythme mais le Stop se cherche à
> l'aveugle : `navigator.wakeLock`, à examiner dans un lot propre.
