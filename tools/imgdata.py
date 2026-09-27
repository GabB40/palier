#!/usr/bin/env python3
"""Fabrique imgdata.js depuis src/img/ (ADR-0003).

Usage: python3 imgdata.py <dossier> <cible>
       build.sh : python3 tools/imgdata.py src/img build/imgdata.js

Le dossier contient <id>.jpg et ordre.txt, un identifiant par ligne, en LF,
saut de ligne final compris. L'ordre des cles de IMG est celui du manifeste :
aucun tri ne reproduit l'ordre historique, et un tri changerait dist/index.html
sans changer VERSION.

Forme de sortie, canonique depuis toujours : const IMG= suivi du JSON compact,
ensure_ascii=False, puis ;\\n\\n. Ecrit en binaire : aucune traduction de fin
de ligne, quel que soit le systeme.

Refuse, sortie 1, sans rien ecrire : manifeste absent, vide, sans saut de ligne
final ou porteur d'une ligne vide ; identifiant hors [a-z0-9-] ; doublon ;
ligne sans fichier ; fichier absent du manifeste ; entree autre qu'un .jpg ou
le manifeste ; JPEG sans FFD8FF en tete ou FFD9 en fin ; cible deja presente.
Ce dernier cas arrive si src/imgdata.js survit a l'extraction d'une archive,
qui ne supprime rien : build.sh le recopierait dans build/.
"""
import base64
import json
import os
import re
import sys

MANIFESTE = 'ordre.txt'
ID = re.compile(r'[a-z0-9]+(-[a-z0-9]+)*')


def refus(msg):
    print('imgdata.py : ' + msg)
    sys.exit(1)


def main(dossier, cible):
    if os.path.lexists(cible):
        refus(cible + ' existe deja : src/imgdata.js non retire ? (git rm)')
    chemin = os.path.join(dossier, MANIFESTE)
    if not os.path.isfile(chemin):
        refus('manifeste absent : ' + chemin)
    brut = open(chemin, 'rb').read()
    if not brut:
        refus('manifeste vide')
    if not brut.endswith(b'\n'):
        refus('manifeste sans saut de ligne final')
    ids = brut[:-1].decode('ascii', 'replace').split('\n')
    vus = set()
    for i, k in enumerate(ids, 1):
        if not ID.fullmatch(k):
            refus('ligne %d : identifiant invalide %r' % (i, k))
        if k in vus:
            refus('ligne %d : doublon %s' % (i, k))
        vus.add(k)
    presents = set()
    for n in os.listdir(dossier):
        if n == MANIFESTE:
            continue
        if not n.endswith('.jpg') or not os.path.isfile(os.path.join(dossier, n)):
            refus('entree etrangere dans ' + dossier + ' : ' + n)
        presents.add(n[:-4])
    for k in ids:
        if k not in presents:
            refus('au manifeste sans fichier : ' + k)
    for k in sorted(presents - vus):
        refus('fichier absent du manifeste : ' + k + '.jpg')
    d = {}
    total = 0
    for k in ids:
        b = open(os.path.join(dossier, k + '.jpg'), 'rb').read()
        if b[:3] != b'\xff\xd8\xff' or b[-2:] != b'\xff\xd9':
            refus('pas un JPEG complet : ' + k + '.jpg')
        total += len(b)
        d[k] = 'data:image/jpeg;base64,' + base64.b64encode(b).decode('ascii')
    s = 'const IMG=' + json.dumps(d, separators=(',', ':'), ensure_ascii=False) + ';\n\n'
    with open(cible, 'xb') as f:
        f.write(s.encode('utf-8'))
    print('imgdata.js : %d images, %d octets de JPEG' % (len(d), total))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        refus('usage : imgdata.py <dossier> <cible>')
    main(sys.argv[1], sys.argv[2])
