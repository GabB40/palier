#!/usr/bin/env python3
"""Post-traitement des illustrations PALIER generees.

- detecte les deux panneaux
- recadre chacun au plus juste, avec une marge constante
- aligne les deux figures sur la meme ligne de sol
- reduit la gouttiere centrale
- efface les artefacts clairs (sparkle) en les remplacant par le fond papier
- sort un JPEG optimise pret a embarquer en base64

Usage: python3 prep_illus.py entree.png sortie.jpg [separateur]

Le troisieme argument, optionnel, force la position du separateur en fraction
de la largeur (0.5 = milieu). Sans lui, rien ne change : find_separator cherche
la colonne la plus encree entre 35 et 65 % de la largeur, ce qui convient aux
images dont les deux panneaux sont separes par un trait. Les images qui portent
un trait de mur a l'interieur du panneau gauche (les quatre mollets, v2.5)
mettent ce mur dans la zone de recherche : il gagnait, le script l'effacait
avec le pouce de la main qui le touche, et la vraie gouttiere, vide, n'etait
pas vue. Mesure sur les quatre sources : mur a 0,395-0,425, gouttiere vide de
0,40-0,43 a 0,55-0,59, milieu dans la gouttiere sur les quatre. Le defaut ne
bouge pas, la banque n'a donc toujours qu'une version du script pour les
images qui n'ont pas besoin de l'argument (v2.15).
"""
import sys
from PIL import Image, ImageDraw

MARGIN = 26        # marge autour des figures, en px de l'image finale
GUTTER = 34        # espace entre les deux panneaux
OUT_W = 720        # largeur de sortie
INK = 190          # seuil de detection du trait


def paper_color(im):
    w, h = im.size
    px = [im.getpixel((x, y)) for x, y in
          [(4, 4), (w - 5, 4), (4, h - 5), (w - 5, h - 5), (w // 2, 4)]]
    return tuple(sum(c[i] for c in px) // len(px) for i in range(3))


def is_ink(p):
    return p[0] < INK or p[1] < INK or p[2] < INK


def scrub_artifacts(im, paper):
    """Remplace les pixels nettement plus clairs que le papier (sparkle Gemini)."""
    w, h = im.size
    px = im.load()
    thr = min(250, paper[0] + 8)
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r > thr and g > thr and b > thr:
                px[x, y] = paper
    return im


def find_separator(im):
    """Trouve la ligne verticale de separation, sinon coupe au milieu."""
    w, h = im.size
    px = im.load()
    best, best_score = None, 0
    for x in range(int(w * 0.35), int(w * 0.65)):
        score = sum(1 for y in range(0, h, 3) if is_ink(px[x, y]))
        if score > best_score:
            best, best_score = x, score
    return best if best_score > (h / 3) / 1.5 else w // 2


def bbox(im, x0, x1):
    px = im.load()
    h = im.size[1]
    xs, ys = [], []
    for x in range(x0, x1):
        for y in range(0, h, 2):
            if is_ink(px[x, y]):
                xs.append(x)
                ys.append(y)
    if not xs:
        return None
    return min(xs), min(ys), max(xs), max(ys)


def main(src, dst, sep_frac=None):
    im = Image.open(src).convert('RGB')
    paper = paper_color(im)
    im = scrub_artifacts(im, paper)
    sep = int(im.size[0] * sep_frac) if sep_frac is not None else find_separator(im)

    # on efface la ligne de separation avant de mesurer les figures
    work = im.copy()
    d = ImageDraw.Draw(work)
    d.rectangle([sep - 4, 0, sep + 4, im.size[1]], fill=paper)

    L = bbox(work, 0, max(1, sep - 6))
    R = bbox(work, min(work.size[0] - 1, sep + 6), work.size[0])
    if not L or not R:
        print('panneaux introuvables, copie brute')
        im.save(dst, 'JPEG', quality=88, optimize=True)
        return

    hL, hR = L[3] - L[1], R[3] - R[1]
    top = max(hL, hR)
    # chaque figure est posee sur une ligne de sol commune
    cropL = work.crop((L[0], L[1], L[2] + 1, L[3] + 1))
    cropR = work.crop((R[0], R[1], R[2] + 1, R[3] + 1))

    W = MARGIN * 2 + cropL.width + GUTTER + cropR.width
    H = MARGIN * 2 + top
    out = Image.new('RGB', (W, H), paper)
    out.paste(cropL, (MARGIN, MARGIN + top - hL))
    out.paste(cropR, (MARGIN + cropL.width + GUTTER, MARGIN + top - hR))

    # deux figures debout cote a cote donnent naturellement un format portrait :
    # on ajoute des marges laterales pour ne jamais descendre sous le carre
    sep_x = MARGIN + cropL.width + GUTTER // 2
    if out.width < out.height:
        pad = (out.height - out.width) // 2
        padded = Image.new('RGB', (out.height, out.height), paper)
        padded.paste(out, (pad, 0))
        out = padded
        sep_x += pad

    # trait de separation discret, pleine hauteur
    d2 = ImageDraw.Draw(out)
    ink = tuple(max(0, c - 95) for c in paper)
    d2.line([(sep_x, int(out.height * .06)), (sep_x, int(out.height * .94))],
            fill=ink, width=2)

    if out.width > OUT_W:
        out = out.resize((OUT_W, int(out.height * OUT_W / out.width)), Image.LANCZOS)
    out.save(dst, 'JPEG', quality=86, optimize=True)
    print(f'{dst} {out.size[0]}x{out.size[1]}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv) > 3 else None)
