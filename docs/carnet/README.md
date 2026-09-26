# PALIER — carnet de bord

Outil personnel d'entraînement de Gabriel. Fichier HTML autonome unique, hébergé sur
`https://palier.s1t3.link` (stack CloudFormation `palier-edge` en us-east-1, forfait CloudFront
gratuit ; détail dans `docs/backend.md`).
Version courante : **v2.24**. Ce document est la source de vérité pour toute évolution.

Documents du dépôt, sous `docs/` : ce carnet, découpé par section dans `docs/carnet/`
(décisions, contraintes, architecture, conventions) ; `docs/adr/`, une décision par fichier depuis
la migration vers le dépôt, les anciennes y passant quand un lot les touche ; `docs/changelog.md`
(ce qui a changé et quand) ; `docs/backend.md` (hébergement et synchronisation) ; `docs/howto/`
(Git, CloudShell, déploiement, clés). Code, suites, bancs et outils : `README.md` à la racine.

Sections : `01-contexte.md` contexte utilisateur, `02-decisions.md` décisions structurantes et leur
justification, `03-architecture.md` architecture technique, `04-illustrations.md` illustrations,
`05-etat-courant.md` état courant, `06-methode.md` manière de travailler. Découpé le 26 septembre
2026 sans réécriture : seuls des chemins et les règles de livraison ont changé, liste dans
`docs/adr/0001-depot-git.md`.

