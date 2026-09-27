#!/bin/bash
# Banc de falsification de tools/imgdata.py (ADR-0003). Se lance depuis build/,
# apres ./build.sh : copie ../src/img dans un dossier jetable, verifie que
# l'arbre intact redonne octet pour octet le build/imgdata.js du build, puis
# defait chaque garde du generateur. Chaque mutation doit le faire sortir a 1
# sans rien ecrire, sauf l'ordre, qu'il accepte mais qui doit changer la
# sortie. Chaque mutation verifie sa precondition : une mutation qui ne mord
# pas arrete le banc au lieu de se lire comme une survie.
set -e
cd "$(dirname "$0")"
python3 - << 'PY'
import os, shutil, subprocess, sys, tempfile
SRC = os.path.join('..', 'src', 'img')
REF = open('imgdata.js', 'rb').read()
M = 'ordre.txt'


def lit(d):
    return open(os.path.join(d, M), 'rb').read()


def ecrit(d, b):
    open(os.path.join(d, M), 'wb').write(b)


def exige(cond, quoi):
    if not cond:
        print('MOTIF NE MORD PAS : ' + quoi)
        sys.exit(1)


def gen(d, cible):
    return subprocess.run([sys.executable, 'imgdata.py', d, cible],
                          capture_output=True, text=True)


def m_orpheline(d):
    exige(os.path.isfile(os.path.join(d, 'planche.jpg')), 'planche.jpg')
    shutil.copy(os.path.join(d, 'planche.jpg'), os.path.join(d, 'zz-orpheline.jpg'))


def m_sans_fichier(d):
    exige(os.path.isfile(os.path.join(d, 'planche.jpg')), 'planche.jpg')
    os.remove(os.path.join(d, 'planche.jpg'))


def m_doublon(d):
    b = lit(d)
    exige(b.split(b'\n').count(b'planche') == 1, 'ligne planche unique')
    ecrit(d, b + b'planche\n')


def m_majuscule(d):
    b = lit(d)
    exige(b.split(b'\n').count(b'planche') == 1, 'ligne planche unique')
    ecrit(d, b.replace(b'\nplanche\n', b'\nPlanche\n'))
    os.rename(os.path.join(d, 'planche.jpg'), os.path.join(d, 'Planche.jpg'))


def m_crlf(d):
    b = lit(d)
    exige(b.count(b'\n') == 58 and b'\r' not in b, '58 lignes LF')
    ecrit(d, b.replace(b'\n', b'\r\n'))


def m_ligne_vide(d):
    b = lit(d)
    exige(b.count(b'\nplanche\n') == 1, 'ligne planche unique')
    ecrit(d, b.replace(b'\nplanche\n', b'\nplanche\n\n'))


def m_sans_final(d):
    b = lit(d)
    exige(b.endswith(b'\n'), 'saut de ligne final')
    ecrit(d, b[:-1])


def m_manifeste_absent(d):
    exige(os.path.isfile(os.path.join(d, M)), 'manifeste present')
    os.remove(os.path.join(d, M))


def m_manifeste_vide(d):
    exige(len(lit(d)) > 0, 'manifeste non vide')
    ecrit(d, b'')


def m_extension(d):
    exige(os.path.isfile(os.path.join(d, 'planche.jpg')), 'planche.jpg')
    os.rename(os.path.join(d, 'planche.jpg'), os.path.join(d, 'planche.jpeg'))


def m_etranger(d):
    exige(not os.path.exists(os.path.join(d, 'notes.txt')), 'notes.txt absent')
    open(os.path.join(d, 'notes.txt'), 'w').write('x\n')


def m_sous_dossier(d):
    exige(not os.path.exists(os.path.join(d, 'sources.jpg')), 'sources.jpg absent')
    os.mkdir(os.path.join(d, 'sources.jpg'))


def m_tronque(d):
    p = os.path.join(d, 'planche.jpg'); b = open(p, 'rb').read()
    exige(b[-2:] == b'\xff\xd9', 'fin FFD9')
    open(p, 'wb').write(b[:-2])


def m_png(d):
    p = os.path.join(d, 'planche.jpg'); b = open(p, 'rb').read()
    exige(b[:3] == b'\xff\xd8\xff', 'tete FFD8FF')
    open(p, 'wb').write(b'\x89PNG\r\n\x1a\n' + b[3:])


MUT = [m_orpheline, m_sans_fichier, m_doublon, m_majuscule, m_crlf, m_ligne_vide,
       m_sans_final, m_manifeste_absent, m_manifeste_vide, m_extension, m_etranger,
       m_sous_dossier, m_tronque, m_png]

tmp = tempfile.mkdtemp(prefix='falsifimg-')
surv = 0
try:
    # temoin : l'arbre intact redonne le imgdata.js du build
    d = os.path.join(tmp, 'img'); shutil.copytree(SRC, d); c = os.path.join(tmp, 'out.js')
    r = gen(d, c)
    if r.returncode != 0 or open(c, 'rb').read() != REF:
        print('TEMOIN KO : arbre intact, sortie differente du build ' + r.stdout.strip())
        sys.exit(1)
    print('temoin : arbre intact, sortie identique au build')
    # cible deja presente
    r = gen(d, c)
    ok = r.returncode != 0 and open(c, 'rb').read() == REF
    print(('tombe  ' if ok else 'SURVIT ') + 'cible deja presente')
    surv += not ok
    for m in MUT:
        shutil.rmtree(d); os.remove(c) if os.path.exists(c) else None
        shutil.copytree(SRC, d)
        m(d)
        r = gen(d, c)
        ok = r.returncode != 0 and not os.path.exists(c)
        print(('tombe  ' if ok else 'SURVIT ') + m.__name__[2:] + ' : ' + r.stdout.strip())
        surv += not ok
    # l'ordre vient du manifeste : deux lignes permutees changent la sortie
    shutil.rmtree(d); os.remove(c) if os.path.exists(c) else None
    shutil.copytree(SRC, d)
    b = lit(d)
    exige(b.startswith(b'bird-dog\nbox-squat\n'), 'deux premieres lignes')
    ecrit(d, b'box-squat\nbird-dog\n' + b[len(b'bird-dog\nbox-squat\n'):])
    r = gen(d, c)
    ok = r.returncode == 0 and open(c, 'rb').read() != REF
    print(('tombe  ' if ok else 'SURVIT ') + 'ordre : permutation du manifeste')
    surv += not ok
finally:
    shutil.rmtree(tmp)
print(len(MUT) + 2, 'mutations,', surv, 'survie(s)')
sys.exit(1 if surv else 0)
PY
