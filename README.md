# PALIER

Outil personnel d'entraînement de Gabriel, servi sur `https://palier.s1t3.link`. Un fichier HTML
autonome, `dist/index.html`, assemblé depuis `src/`. Dépôt privé : `tests/test49.js` embarque un
export réel, signalements de douleur compris.

## Arborescence

| Chemin | Contenu |
|---|---|
| `src/` | `head.html`, `imgdata.js` (banque d'images), `app1.js` à `app10.js`, `tail.html` |
| `build.sh` | assemblage, cinquante suites, écriture de `dist/index.html` |
| `dist/index.html` | livrable déployé, commité, jamais édité à la main, reproduit par la CI avant tout dépôt |
| `tests/` | `test.js` à `test49.js`, `testapi.js` ; `README.md` décrit chaque suite |
| `tests/falsif/` | quinze bancs de falsification, lancés à la main, décrits dans `tests/README.md` |
| `tools/` | `neutre.js`, `seuil-r.js`, `ordre-circuit.js`, `prep_illus.py` ; `README.md` pour l'usage |
| `infra/` | `palier-edge.yaml`, `palier-backend.yaml`, `palier-ci.yaml`, `deploy.sh`, `cle.sh`, `testedge.sh` |
| `.github/workflows/` | `deploiement.yml`, sur tag `v*` ; `bancs.yml`, sur push vers `main` et à la demande |
| `docs/` | carnet, ADR, changelog, backend, how-to |

## Construire et tester

Prérequis : bash, Python 3, Node 22.

```bash
./build.sh
```

Le script recopie `src/`, `infra/`, `tests/`, `tests/falsif/` et `tools/` à plat dans `build/`
(ignoré par Git) : suites et bancs lisent leurs fichiers dans le répertoire courant. Il assemble
dans l'ordre `head imgdata app1 app2 app3 app4 app5 app6 app7 app9 app10 app8 tail`, lance les
cinquante suites une par une, et n'écrit `dist/index.html` que si toutes passent.

Bancs de falsification : lancement et lecture des journaux dans `tests/README.md`. Tout banc dont
le code visé a changé se relance dans le lot.

## Déployer

Un tag `v` suivi de la `VERSION`, poussé avec `main` : `git push --atomic origin main vX.Y`.
GitHub Actions construit, passe les cinquante suites, vérifie que le build reproduit
`dist/index.html`, que le tag correspond à la version et que le commit est dans `main`, puis lance
`infra/deploy.sh` avec un rôle OIDC aux droits minimaux (ADR-0002). En secours et pour le retour
arrière : CloudShell `us-east-1`, `./infra/deploy.sh`. Détail dans `docs/howto/deploiement.md`.

## Documentation

- `docs/carnet/` : source de vérité, décisions tranchées, contraintes physiques, architecture.
  **`06-methode.md` se lit avant toute intervention.**
- `docs/adr/` : toute nouvelle décision, une par fichier sur le modèle `0000-modele.md` ; une
  décision ancienne du carnet y passe quand un lot la touche.
- `docs/changelog.md` : ce qui a changé et quand.
- `docs/backend.md` : hébergement et synchronisation.
- `docs/howto/` : `git.md`, `cloudshell.md`, `deploiement.md`, `cles.md`.
- Avant la migration : les cinq .md du projet Claude et `index.html` v2.24, premier commit du
  dépôt (`docs/adr/0001-depot-git.md`).

## Lots prévus

- Banque d'images en JPEG séparés, `imgdata.js` généré au build, après preuve octet pour octet.
