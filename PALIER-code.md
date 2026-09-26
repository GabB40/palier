# PALIER — code source complet (hors banque d'images)

Version v2.24. Contenu intégral de `index.html` **sauf** le bloc `imgdata.js`
(3,7 Mo de JPEG en base64, sans intérêt en lecture et régénérable par script).

Pour reconstruire le fichier livrable, insérer `imgdata.js` **juste après** la ligne
marqueur qui termine `head.html`, puis assembler dans l'ordre des sections de ce
document. La ligne marqueur fait partie du fichier livré : elle est conservée telle
quelle dans la section `head.html` ci-dessous, et non remplacée.

Ligne marqueur : `/* IMGDATA — const IMG={...} inséré ici */`

Chaque section correspond à un fichier source. L'ordre des sections EST l'ordre
d'assemblage : noter que `app9.js` puis `app10.js` passent avant `app8.js`,
l'initialisation devant rester en dernier.

Le numéro de version ne vit plus dans `imgdata.js` mais en tête d'`app1.js` : le
script de régénération de la banque réécrit `imgdata.js` en entier et l'aurait
effacé sans bruit à la première régénération.

---

## `head.html`

En-tête, favicon en SVG intégré, feuille de style complète et ligne marqueur d'insertion de la banque d'images.

333 lignes, 26505 octets.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>PALIER</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%2314212B%22/%3E%3Crect x=%2210%22 y=%2242%22 width=%2213%22 height=%2212%22 rx=%222%22 fill=%22%237C8B9C%22/%3E%3Crect x=%2225.5%22 y=%2232%22 width=%2213%22 height=%2222%22 rx=%222%22 fill=%22%23C3CEDA%22/%3E%3Crect x=%2241%22 y=%2220%22 width=%2213%22 height=%2234%22 rx=%222%22 fill=%22%23E8590C%22/%3E%3C/svg%3E">
<link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%2314212B%22/%3E%3Crect x=%2210%22 y=%2242%22 width=%2213%22 height=%2212%22 rx=%222%22 fill=%22%237C8B9C%22/%3E%3Crect x=%2225.5%22 y=%2232%22 width=%2213%22 height=%2222%22 rx=%222%22 fill=%22%23C3CEDA%22/%3E%3Crect x=%2241%22 y=%2220%22 width=%2213%22 height=%2234%22 rx=%222%22 fill=%22%23E8590C%22/%3E%3C/svg%3E">
<meta name="theme-color" content="#14212B">
<style>
:root{
  --bg:#EAEEF2; --ink:#14212B; --muted:#5C6B7A; --card:#FFFFFF;
  --accent:#2350C7; --accent-soft:#E3EAFB; --ok:#1B9E4B; --ok-soft:#E2F3E8;
  --flame:#E8590C; --flame-soft:#FDEBDD; --warn:#B4530A; --line:#D7DEE6;
  --lock:#94A3B2; --soft:#EDF1F4; --band:#C8E6D2; --rail:#A8B9CD;
  --r:14px; --mono:ui-monospace,'SF Mono','Cascadia Mono',Consolas,monospace;
}
[data-theme="dark"]{
  --bg:#0E141B; --ink:#E9EEF4; --muted:#93A3B4; --card:#18212C;
  --accent:#5B8AF5; --accent-soft:#1C2A47; --ok:#41C077; --ok-soft:#15301F;
  --flame:#F5813B; --flame-soft:#38200F; --warn:#F0A35E; --line:#2B3745;
  --lock:#66788A; --soft:#222E3B; --band:#1F4A2E; --rail:#405669;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;min-height:100vh}
#app{max-width:480px;margin:0 auto;padding:14px 14px 92px}
/* v2.15 : sur un ecran de bureau la colonne de telephone laissait les deux
   tiers de la largeur vides. Une colonne un peu plus large au-dessus de 900 px,
   rien d autre : le mobile ne change pas, et la structure non plus. Les deux
   colonnes ont ete maquettees et ecartees par Gabriel au profit de ceci. */
@media (min-width:900px){#app{max-width:600px}}
h1,h2,h3{font-weight:800;text-transform:uppercase;letter-spacing:.03em}
h1{font-size:1.5rem}h2{font-size:1.1rem}h3{font-size:.95rem}
.num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.card{background:var(--card);border-radius:var(--r);padding:16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(20,33,43,.07)}
.row{display:flex;align-items:center;gap:10px}
.spread{display:flex;align-items:center;justify-content:space-between;gap:10px}
.muted{color:var(--muted);font-size:.85rem}
.small{font-size:.8rem}
.tag{display:inline-block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:3px 8px;border-radius:99px;background:var(--accent-soft);color:var(--accent)}
.tag.ok{background:var(--ok-soft);color:var(--ok)}
.tag.flame,.tag.pause{background:var(--flame-soft);color:var(--flame)}
.tag.lock{background:var(--soft);color:var(--lock)}
button{font:inherit;cursor:pointer;border:none;border-radius:12px;background:var(--accent);color:#fff;font-weight:700;padding:12px 18px;transition:transform .06s}
button:active{transform:scale(.97)}
button.big{width:100%;padding:16px;font-size:1.05rem;text-transform:uppercase;letter-spacing:.04em;background:linear-gradient(135deg,var(--accent),#6247E5);box-shadow:0 4px 14px rgba(35,80,199,.28)}
button.ghost{background:transparent;color:var(--accent);border:1.5px solid var(--accent);box-shadow:none}
button.quiet{background:var(--soft);color:var(--ink);font-weight:600;box-shadow:none}
button.danger{background:transparent;color:var(--warn);border:1.5px solid var(--warn);font-weight:600;box-shadow:none}
button.ok{background:var(--ok);box-shadow:none}
button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
button:disabled{opacity:.45;cursor:default}
.bar{height:10px;background:var(--soft);border-radius:99px;overflow:hidden}
.bar>i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),#6247E5);border-radius:99px;transition:width .4s}
/* Couverture : echelle fixe commune aux quatre groupes, la bande visee est
   dessinee derriere le curseur. Le curseur est vert dans la bande, orange en
   dehors, avec un lisere couleur card sans lequel le vert sur vert perd son
   contraste la ou il annonce justement que tout va bien. */
.covgrad{position:relative;height:14px;margin-top:16px;font-size:11px;color:var(--muted);font-family:var(--mono)}
.covgrad span{position:absolute;transform:translateX(-50%)}
.covgrad span.end{right:34px;transform:translateX(50%)}
.cov{display:flex;align-items:center;gap:8px;margin-top:10px}
.cov .cn{font-size:.8rem;width:96px;flex:none;display:flex;align-items:center;gap:5px}
.cov .cv{font-size:.8rem;width:26px;flex:none;text-align:right}
.tenu{font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:2px 6px;border-radius:99px;background:var(--soft);color:var(--muted)}
.rail{flex:1;position:relative;height:10px;border-radius:99px;background:var(--soft)}
.rail .zone{position:absolute;top:0;bottom:0;background:var(--band);border-radius:2px}
.rail .clip{position:absolute;right:0;top:0;bottom:0;width:10px;border-radius:0 99px 99px 0;background:repeating-linear-gradient(115deg,var(--flame) 0 2px,var(--soft) 2px 5px)}
.rail .cur{position:absolute;top:-4px;width:4px;height:18px;margin-left:-2px;border-radius:2px;background:var(--ok);box-shadow:0 0 0 2px var(--card)}
.rail .cur.out{background:var(--flame)}
.dots{display:flex;gap:6px;justify-content:center;margin:10px 0;flex-wrap:wrap}
.dots .grp{display:inline-flex;gap:5px;padding:4px 6px;border:1px solid var(--line);border-radius:99px}
.dots .grp.full{border-color:var(--ok)}
.dots i{width:7px;height:7px;border-radius:99px;background:var(--line)}
.dots i.on{background:var(--accent)}
.dots i.done{background:var(--ok)}
nav{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--line);display:flex;justify-content:center;gap:4px;padding:6px 8px calc(6px + env(safe-area-inset-bottom))}
.navbtn{flex:1;max-width:110px;background:none;color:var(--muted);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:8px 4px;border-radius:10px;display:flex;flex-direction:column;align-items:center;gap:2px;box-shadow:none}
.navbtn.on{color:var(--accent);background:var(--accent-soft)}
.navbtn svg{width:20px;height:20px}
.figbox{background:var(--soft);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.figbox svg{width:100%;max-width:230px;height:auto}
.figbox img{width:100%;height:auto;display:block;border-radius:10px;cursor:zoom-in}
.figbox.illus{background:transparent}
[data-theme="dark"] .figbox img{filter:brightness(.9) contrast(1.05);box-shadow:0 0 0 1px var(--line)}
.fig .st{stroke:var(--ink);stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round;fill:none}
.fig .hd{fill:var(--ink)}
.fig .prop{stroke:var(--accent);stroke-width:4;stroke-linecap:round;fill:none}
.fig .propf{fill:var(--accent)}
.fig .band{stroke:var(--flame);stroke-width:3;stroke-dasharray:5 5;stroke-linecap:round;fill:none}
.fig .gnd{stroke:var(--line);stroke-width:2.5;stroke-linecap:round}
.fig .p1{animation:swp 2s steps(1) infinite}
.fig .p2{animation:swp 2s steps(1) infinite reverse;opacity:0}
@keyframes swp{0%,49%{opacity:1}50%,100%{opacity:0}}
.lightbox{position:fixed;inset:0;background:rgba(8,12,17,.9);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px}
.lightbox img{max-width:100%;max-height:88vh;border-radius:12px}
.stepper{display:flex;align-items:center;gap:14px;justify-content:center}
.stepper button{width:52px;height:52px;border-radius:99px;font-size:1.5rem;padding:0;background:var(--soft);color:var(--ink);box-shadow:none}
.stepper .val{font-family:var(--mono);font-size:2.2rem;font-weight:700;min-width:86px;text-align:center}
.chrono{font-family:var(--mono);font-size:3rem;font-weight:700;text-align:center;margin:8px 0}
.chrono.rest{font-size:3.6rem;color:var(--accent)}
/* Pause au raccord de tour (v2.10). Elle doit se distinguer d une transition
   avant d avoir ete lue : meme ecran, meme place, autre registre de couleur.
   Le liseré porte la distinction, le chrono la confirme. */
.chrono.rest.pause{color:var(--flame)}
.pausecard{border-left:4px solid var(--flame)}
.pausemsg{margin-top:10px;font-size:.95rem}
.vig{background:var(--flame-soft);border-left:4px solid var(--flame);border-radius:8px;padding:10px 12px;font-size:.85rem;margin-top:10px}
.vig b{color:var(--warn)}
.steps-list{margin:10px 0 0 0;padding-left:20px;font-size:.9rem}
.steps-list li{margin-bottom:6px}
.exo-head{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.exo-en{font-size:.75rem;color:var(--muted);font-style:italic}
/* Ligne de performance (v1.16). Trois pastilles au maximum : cible, fourchette,
   et les series deja faites du jour. Le decalage constate venait d une taille de
   police posee en style en ligne sur la seule pastille de liste, sans
   line-height : la boite etait plus courte, donc la valeur et son libelle
   remontaient tous les deux. Il faut les deux corrections, hauteur de boite fixe
   en rem pour egaliser les boites, et calage par le bas pour les libelles. */
.perfline{display:flex;gap:14px;margin:10px 0;justify-content:center;flex-wrap:wrap;align-items:flex-end}
.pv{text-align:center}
.pv b{font-family:var(--mono);font-size:1.35rem;display:block;line-height:1.7rem}
.pv span{font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.pv.cible b{color:var(--accent)}
/* une valeur qui est une liste de nombres est plus petite que les deux valeurs
   prescriptives : la hierarchie cible et fourchette reste intacte */
.pv.list b{font-size:1rem}
.pv.today b{color:var(--ok)}
/* la derniere fois descend en ligne : c est du contexte, pas une entree de
   decision. En v1.16 la cible l encodait exactement, plus petite serie du
   dernier passage plus un ; depuis la fenetre de deux passages (v2.14) elle
   encode la meilleure des deux dernieres, et la ligne porte donc une
   information propre : elle dit si la derniere fois a ete absorbee.
   flex plutot qu un espace, pour que l ecart soit un reglage. */
.lastline{display:flex;justify-content:center;align-items:baseline;gap:10px;font-size:.82rem;color:var(--muted);margin-top:2px}
.lastline b{font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:.95rem;color:var(--ink);font-weight:700}
/* separateur de series : attenue et micro-marge. C est le contraste qui separe,
   pas la distance ; les espaces autour du slash coutaient six caracteres sur
   quatre valeurs sans rien apporter. */
i.sl{font-style:normal;font-weight:400;color:var(--muted);opacity:.75;padding:0 .12em}
.badge{display:flex;gap:12px;align-items:center;padding:10px;border-radius:12px;background:var(--soft);margin-bottom:8px}
.badge.off{opacity:.45}
.badge .ico{font-size:1.5rem}
.badge .pg{margin-left:auto;padding-left:8px;font-size:.82rem;color:var(--muted);flex:none}
details{margin-top:10px}
summary{cursor:pointer;font-weight:600;font-size:.85rem;color:var(--accent)}
/* card repliable : l en-tete ferme porte la valeur courante, pas seulement le titre */
details.card{margin-top:0}
details.card>summary{list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;color:var(--ink);font-weight:700;font-size:1rem;padding:0}
details.card>summary::-webkit-details-marker{display:none}
details.card>summary::after{content:'';order:3;flex:none;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg) translateY(-2px);transition:transform .18s}
details.card[open]>summary::after{transform:rotate(-135deg) translateY(-2px)}
details.card>summary .ttl{flex:none}
/* v2.15 : la valeur d un en-tete ferme ne se coupe plus. Mesure en 390 px :
   « échauffement complet · card… », « 1 h 7 min c… », « Cible, calibr… ». Une
   valeur tronquee oblige a ouvrir, ce qui contredit la regle qui justifie ces
   en-tetes (v1.5 : la ligne fermee porte la valeur). Elle passe a la ligne,
   alignee a droite, le chevron restant a sa place. */
details.card>summary .val{order:2;flex:1;min-width:0;font-weight:600;font-size:.82rem;color:var(--muted);font-family:var(--mono);text-align:right;white-space:normal;overflow-wrap:anywhere;line-height:1.25}
details.card>summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
.badgerow{order:4;width:100%;display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
details.card[open]>summary .badgerow{display:none}
.badgechip{display:flex;align-items:center;gap:5px;font-size:.75rem;font-weight:600;padding:5px 10px;border-radius:99px;background:var(--soft)}
.search{display:flex;align-items:center;gap:8px;background:var(--card);border:1.5px solid var(--line);border-radius:99px;padding:8px 14px;margin-bottom:12px}
.search input{flex:1;min-width:0;font:inherit;font-size:.9rem;border:none;background:none;color:var(--ink);padding:0}
.search input:focus{outline:none}
.search .clr{background:none;color:var(--muted);box-shadow:none;padding:0 2px;font-size:1.1rem;line-height:1}
.histline{display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);font-size:.9rem}
.histline:last-child{border:none}
.flash{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 18px;border-radius:99px;font-weight:600;font-size:.9rem;z-index:110;opacity:0;transition:opacity .3s;pointer-events:none;max-width:90%;text-align:center}
.flash.show{opacity:1}
.week-dots{display:flex;gap:6px;flex-wrap:wrap}
.week-dots i{width:14px;height:14px;border-radius:99px;background:var(--line)}
.week-dots i.on{background:var(--ok)}
.week-dots i.extra{background:var(--flame)}
input[type=number],textarea,select{font:inherit;border:1.5px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink);padding:8px}
.center{text-align:center}
.mt{margin-top:12px}
.recap-xp{font-family:var(--mono);font-size:2.4rem;font-weight:800;color:var(--accent);text-align:center}
.kb{border-top:1px solid var(--line);padding-top:8px;font-size:.72rem;margin-top:12px}
.kb b{font-family:var(--mono);background:var(--soft);padding:1px 5px;border-radius:4px}
@media (pointer:coarse){.kb{display:none}}
/* bouton de bascule du mode allege : etat actif visible d un coup d oeil,
   meme code couleur que les tags de repli deja utilises en seance */
button.flamebtn{background:var(--flame);color:#fff;border-color:var(--flame)}
details.card>summary .val.flameval{color:var(--flame)}
.loadbox.light{justify-content:center}
.seg{display:flex;gap:6px}
.seg button{flex:1;padding:10px 6px;font-size:.85rem}
/* segment de volume : le nombre de series au-dessus, le temps calcule du jour
   en dessous. Les deux informations sont vraies, chacune dans son registre. */
.roundseg button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;line-height:1.15}
.roundseg button b{font-size:.85rem}
.roundseg button .sub{font-size:.72rem;opacity:.75;font-variant-numeric:tabular-nums}
.ver{text-align:center;font-size:.7rem;color:var(--muted);margin-top:6px;font-family:var(--mono);font-weight:700}
/* Intitules de la card de pied des reglages (v1.18) : trois points d entree en
   couleur d encre sur un corps gris, la card etant lue pour y chercher une
   chose parmi trois et non parcourue en entier. */
.lead{display:block;color:var(--ink);font-weight:700;margin-bottom:2px}
.matlist{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
.chip{font-size:.75rem;font-weight:600;padding:4px 10px;border-radius:99px;background:var(--flame-soft);color:var(--warn)}
.chipline{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.chip.off{background:var(--soft);color:var(--muted)}
.chip.prof{background:var(--accent-soft);color:var(--accent)}
/* CARD MATERIEL (v2.0). Trois composants, une seule colonne de controles a
   droite : c est la position qui dit qu une chose se touche, et non une phrase.
   L interrupteur porte la presence, la pastille porte la realisation d un
   niveau, le couple moins-plus porte un nombre. Ils partagent la meme empreinte
   de 42 px de large pour que la colonne reste reguliere du haut en bas. */
button.sw{position:relative;width:42px;height:24px;border-radius:12px;background:var(--line);border:none;padding:0;flex:none;transition:background .15s;box-shadow:none}
button.sw i{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:var(--card);transition:left .15s;display:block}
button.sw.on{background:var(--accent)}
button.sw.on i{left:21px}
button.pastille{width:42px;height:26px;border-radius:13px;border:1px solid var(--line);background:none;padding:0;flex:none;display:flex;align-items:center;justify-content:center;box-shadow:none}
button.pastille i{width:16px;height:16px;border-radius:50%;border:1px solid rgba(128,128,128,.5);display:block}
button.pastille i.vide{border-style:dashed}
.nuancier{padding:2px 0 10px}
button.teinte{width:28px;height:28px;border-radius:50%;border:1px solid rgba(128,128,128,.5);padding:0;margin:0 7px 7px 0;box-shadow:none}
button.teinte:active{transform:scale(.92)}
/* section repliable interne a une card : meme chevron, plus discret */
details.msec{margin-top:0;border-top:1px solid var(--line)}
details.msec>summary{list-style:none;display:flex;align-items:center;gap:10px;padding:11px 0;color:var(--ink);font-weight:400;font-size:.95rem}
details.msec>summary::-webkit-details-marker{display:none}
details.msec>summary::after{content:'';order:3;flex:none;width:7px;height:7px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg) translateY(-2px);transition:transform .18s}
details.msec[open]>summary::after{transform:rotate(-135deg) translateY(-2px)}
details.msec>summary:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:6px}
.msec .mtit{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0}
.msec .mdet{padding:0 0 12px}
.msec.plat{padding-top:2px}
.msec.plat .histline:first-child{border-top:none}
/* Indicateurs temporels de la transition (v2.9). Ils partagent la ligne du tag,
   qui etait vide a droite : rien ne descend, la vignette et le bouton ne bougent
   pas. Le registre est celui du tag, une etiquette de contexte de chaque cote du
   seul chiffre qui prescrit. Chiffres tabulaires par .num, sans quoi la ligne se
   deplacerait a chaque minute franchie. */
.tline{color:var(--muted);font-size:.8rem;white-space:nowrap}
.nextexo{display:flex;align-items:center;gap:10px;text-align:left;margin:10px 0 2px;padding:8px;border-radius:12px;background:var(--soft)}
.nextexo img{width:74px;height:52px;object-fit:cover;object-position:center;border-radius:8px;background:var(--card);flex:none}
[data-theme="dark"] .nextexo img{filter:brightness(.9) contrast(1.05)}
.nextexo .thumbph{width:74px;height:52px;border-radius:8px;background:var(--card);flex:none}
.nextexo .ex{display:flex;flex-direction:column;gap:1px;min-width:0;font-size:.9rem}
.nextexo .ex b{white-space:normal;line-height:1.2}
.nextexo .ex .small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Series deja faites aujourd hui sur l exercice qui vient (v2.6). C est la
   pastille .pv.today de l ecran de serie, deplacee : meme vert, meme corps,
   meme libelle en capitales attenuees. Deux ecrans qui disent la meme chose
   doivent la dire avec le meme vocabulaire. Le calage a droite reprend le
   motif de .badge .pg, deja en service ; flex:none l empeche de se comprimer,
   et c est le nom de l exercice qui s ellipse, lui qui porte deja la regle. */
.nextexo .jour{margin-left:auto;padding-left:10px;flex:none;text-align:right}
.nextexo .jour b{font-family:var(--mono);font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;color:var(--ok);display:block;line-height:1.35rem}
.nextexo .jour span{display:block;font-size:.68rem;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
.exorow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);cursor:pointer}
.exorow:last-of-type{border:none}
.exorow img{width:74px;height:52px;object-fit:cover;object-position:center;border-radius:8px;background:var(--soft);flex:none}
[data-theme="dark"] .exorow img{filter:brightness(.9) contrast(1.05)}
.exorow .thumbph{width:74px;height:52px;border-radius:8px;background:var(--soft);flex:none}
.exorow .ex{display:flex;flex-direction:column;gap:1px;flex:1;min-width:0;font-size:.88rem}
.exorow .ex b{white-space:normal;line-height:1.2}
.exorow .st{text-align:right;flex:none;line-height:1.5;max-width:38%}
.exorow .lvl{color:var(--muted)}
.libtier{margin-top:6px}
.libtier>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;padding:8px 0;color:var(--muted);font-size:.82rem}
.libtier>summary::-webkit-details-marker{display:none}
.libtier>summary::after{content:'';margin-left:auto;width:8px;height:8px;border-right:2px solid var(--muted);border-bottom:2px solid var(--muted);transform:rotate(45deg) translateY(-2px);transition:transform .18s}
.libtier[open]>summary::after{transform:rotate(-135deg) translateY(-2px)}
.libtier>summary b{color:var(--ink);font-family:var(--mono);font-size:.8rem}
.libsub{color:var(--muted);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;margin:10px 0 2px}
.exorow.lockedrow{opacity:.55}
.exorow .lockph{display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.exorow .ex .small{overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.wu-item{display:flex;gap:10px;align-items:center;padding:8px;border-radius:10px;font-size:.9rem}
.wu-item.on{background:var(--accent-soft);font-weight:700}
.wu-item.done{opacity:.45}
.wu-item .t{margin-left:auto;font-family:var(--mono);font-size:.8rem;color:var(--muted)}
.loadbox{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px}
.loadbox .lv{font-family:var(--mono);font-weight:700;font-size:1.3rem;min-width:76px;text-align:center}
.loadbox button{width:44px;height:44px;border-radius:99px;padding:0;font-size:1.2rem;background:var(--soft);color:var(--ink);box-shadow:none}
/* L animation d apparition des cards ne vaut que pour une arrivee sur un ecran.
   Le rendu recreant tout le DOM a chaque bouton presse, elle se rejouait sur
   toutes les cards de la page a chaque clic : opacite nulle et remontee de 8 px,
   350 ms de fondu, ce qui donnait l impression que la page se rafraichissait.
   Elle est desormais portee par une classe posee sur le conteneur par le seul
   rendu qui suit un changement de vue (v1.14). */
@media (prefers-reduced-motion:no-preference){
  .tag.flame{animation:flick 2.4s ease-in-out infinite}
  .recap-xp{animation:pop .55s cubic-bezier(.2,1.6,.4,1)}
  #app.enter .card{animation:rise .35s ease both}
}
@media (prefers-reduced-motion:reduce){.fig .p1{animation:none;opacity:1}.fig .p2{animation:none;opacity:0}}
@keyframes flick{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes pop{0%{transform:scale(.4);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes rise{0%{transform:translateY(8px);opacity:0}100%{transform:translateY(0);opacity:1}}
.pop{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.62);padding:24px}
.pop .card{max-width:340px;width:100%;text-align:center;animation:popin .42s cubic-bezier(.2,1.3,.4,1) both}
.pop .ico{font-size:3.4rem;line-height:1;display:block;animation:popico .9s ease-out .12s both}
.pop .kind{letter-spacing:.14em;text-transform:uppercase;font-size:.66rem;opacity:.7}
.pop .nom{font-weight:800;font-size:1.15rem;margin-top:8px}
.pop .q{margin-top:10px;font-size:.72rem;opacity:.55}
@keyframes popin{from{opacity:0;transform:translateY(18px) scale(.9)}to{opacity:1;transform:none}}
@keyframes popico{0%{transform:scale(.2) rotate(-14deg);opacity:0}55%{transform:scale(1.22) rotate(4deg);opacity:1}100%{transform:scale(1) rotate(0)}}
@media (prefers-reduced-motion:reduce){.pop .card,.pop .ico{animation:none}}
.bdot{display:inline-block;width:.7em;height:.7em;border-radius:50%;margin-right:6px;border:1px solid rgba(128,128,128,.5);vertical-align:-1px}
/* Carrousel du detail de seance (v1.18). Les panneaux font exactement la
   largeur de la bande : pas de debord, le calage se fait sur la position reelle
   de chaque panneau. La barre arrondie a gauche d un panneau a venir reste
   visible quand l en-tete est sorti du champ, ce que l intitule seul ne fait
   pas. --rail sert aussi de filet a l encart de niveau : les deux disent la
   meme chose, ceci concerne une seance a venir. */
.carnav{display:flex;align-items:center;gap:6px;margin-top:12px}
.cbtn{width:38px;flex:0 0 38px;padding:5px 0;font-size:18px;line-height:1.1}
#carfirst{margin-right:4px}
#carfirst.off{opacity:.3;pointer-events:none}
.cdots{flex:1;display:flex;gap:6px;justify-content:center}
.cdots i{width:7px;height:7px;border-radius:50%;background:var(--line);transition:background .15s}
.cdots i.on{background:var(--accent)}
.carstrip{position:relative;display:flex;align-items:flex-start;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;transition:height .18s ease}
.carstrip::-webkit-scrollbar{display:none}
.carpane{flex:0 0 100%;scroll-snap-align:start;min-width:0}
.futbody{position:relative;margin-top:12px;padding-left:14px}
.futbody::before{content:'';position:absolute;left:0;top:3px;bottom:3px;width:3px;border-radius:3px;background:var(--rail)}
.futhead{font-weight:800;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.futnote{margin-top:6px;background:var(--soft);border-left:4px solid var(--rail);border-radius:8px;padding:10px 12px;font-size:.85rem}
</style>
</head>
<body>
<div id="app"></div>
<nav id="nav"></nav>
<div class="flash" id="flash"></div>
<script>
'use strict';
/* IMGDATA — const IMG={...} inséré ici */
```
## `app1.js`

`VERSION`, pictogrammes SVG de repli, `figFor`, échelles de charge, échelle des six niveaux de bande et nuancier fermé, bornage matériel, neuf ressources déclarables plus une dérivée, poids déclarables des disques et des lestes, formateurs de nombre.

530 lignes, 30347 octets.

```javascript
/* ============ PICTOGRAMMES DE REPLI ============ */
/* Numero de version. Il vivait dans imgdata.js, que le script de
   regeneration de la banque reecrit entierement : la premiere regeneration
   l aurait efface sans bruit. Il doit rester APRES le marqueur de section,
   sinon le decoupage des sources le range dans imgdata.js. */
const VERSION='2.24';
function limb(a,b,c){return '<path class="st" d="M'+a[0]+' '+a[1]+' L'+b[0]+' '+b[1]+(c?' L'+c[0]+' '+c[1]:'')+'"/>';}
function propSvg(p){
  const A=p.at;
  if(p.t==='kb') return '<circle class="propf" cx="'+A[0]+'" cy="'+(A[1]+7)+'" r="6"/><path class="prop" d="M'+(A[0]-5)+' '+(A[1]+3)+' Q'+A[0]+' '+(A[1]-4)+' '+(A[0]+5)+' '+(A[1]+3)+'"/>';
  if(p.t==='db') return '<path class="prop" d="M'+(A[0]-6)+' '+A[1]+' L'+(A[0]+6)+' '+A[1]+'"/><circle class="propf" cx="'+(A[0]-6)+'" cy="'+A[1]+'" r="3.5"/><circle class="propf" cx="'+(A[0]+6)+'" cy="'+A[1]+'" r="3.5"/>';
  if(p.t==='band') return '<path class="band" d="M'+A[0]+' '+A[1]+' L'+p.to[0]+' '+p.to[1]+'"/>';
  if(p.t==='bar') return '<path class="prop" d="M'+A[0]+' '+A[1]+' L'+p.to[0]+' '+p.to[1]+'"/>';
  if(p.t==='box') return '<rect class="prop" x="'+A[0]+'" y="'+A[1]+'" width="'+p.w+'" height="'+p.h+'" rx="2"/>';
  return '';
}
function poseSvg(p){
  let s='<circle class="hd" cx="'+p.hd[0]+'" cy="'+p.hd[1]+'" r="6"/>'+limb(p.nk,p.hp);
  if(p.kf)s+=limb(p.hp,p.kf,p.ff);
  if(p.kb)s+=limb(p.hp,p.kb,p.fb);
  if(p.ea)s+=limb(p.nk,p.ea,p.ha);
  if(p.eb)s+=limb(p.nk,p.eb,p.hb);
  (p.props||[]).forEach(pr=>{s+=propSvg(pr);});
  return s;
}
function figSvg(fig){
  if(!fig) return '<svg class="fig" viewBox="0 0 120 100"></svg>';
  const g=fig.gnd!==false?'<path class="gnd" d="M6 93 L114 93"/>':'';
  return '<svg class="fig" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+g+
    '<g class="p1">'+poseSvg(fig.a)+'</g><g class="p2">'+poseSvg(fig.b||fig.a)+'</g></svg>';
}
function figFor(id,fig,label){
  if(typeof IMG!=='undefined'&&IMG[id])
    return '<div class="figbox illus"><img src="'+IMG[id]+'" alt="'+esc(label||id)+'" loading="lazy" onclick="zoomFig(\''+id+'\')"></div>';
  return '<div class="figbox">'+figSvg(fig)+'</div>';
}
function zoomFig(id){
  const d=document.createElement('div');
  d.className='lightbox'; d.innerHTML='<img src="'+IMG[id]+'" alt="">';
  d.onclick=()=>d.remove(); document.body.appendChild(d);
}

/* ============ MATERIEL ET ECHELLE DE CHARGE ============ */
/* inventaire par defaut : 2 barres de 2 kg, disques en nombre total,
   capacite de 5 disques par extremite (securite manchon), bandes et lestes */
/* Ressources declarables (v2.0). Neuf entrees. Le critere n est plus le
   transport mais l exigence : le mobilier n est pas declare tant que l exercice
   se contente de n importe quel objet, chaise, mur, tapis, appui sureleve pour
   un etirement. Il le devient des que l exercice exige une garantie que le
   mobilier courant n offre pas. La marche basse entre a ce titre en v2.0 : le
   step-up bas demande un appui stable sous le poids du corps a vingt
   centimetres, ce qu un logement de plain-pied ou une chambre d hotel ne
   fournissent pas forcement, la ou l etirement des ischios se contente de tout
   ce qui est sureleve et garde donc son mobilier suppose.
   Les poignees de pompes ne sont pas une ressource : elles ne changent pas ce
   que l exercice sollicite, seulement le confort du poignet.
   La presence des elastiques se derive des niveaux declares plutot que de
   porter son propre interrupteur : une structure au lieu de deux. Les lestes
   ne figurent pas ici, ils n ouvrent aucun exercice, ils allongent seulement
   l echelle des exercices a kettlebell. */
const RES_ORDER=['hal','kb','elast','ancrage','barre','sangles','ballon','step','stepbas'];
const RES_LBL={hal:'Haltères réglables',kb:'Kettlebell',elast:'Élastiques',
  ancrage:'Ancrage de porte',barre:'Barre de traction',sangles:'Sangles de suspension',
  ballon:'Swiss ball',step:'Marchepied',stepbas:'Marche basse'};
/* precision affichee sous le libelle, la ou le nom seul ne suffit pas a savoir
   si on possede la chose */
const RES_SUB={step:'hauteur sous le genou',stepbas:'environ 20 cm, stable'};
const DEFAULT_GEAR={bar:2,bars:2,maxPerEnd:5,plates:{'0.5':4,'1':12,'2':4,'1.25':4},
  bands:{jaune:'jaune',rouge:'rouge',noir:'noir',violet:'violet',vert:'vert',n6:''},
  cuffs:{'1':1,'2':1},kbs:{'10':1},
  res:{hal:1,kb:1,elast:1,cuff:1,ancrage:1,barre:1,sangles:1,ballon:1,step:1,stepbas:1}};
/* Inventaire neuf (v2.0). Il ne sert qu au premier lancement : DEFAULT_GEAR
   garde ses deux autres emplois, valeur de repli des fonctions et cible de
   migration des anciennes sauvegardes, qui viennent forcement d un domicile ou
   tout etait suppose present. Vider DEFAULT_GEAR ferait migrer ces sauvegardes
   vers un inventaire vide et bornerait toutes leurs prescriptions.
   La barre, son nombre et la capacite du manchon decrivent la mecanique d un
   haltere et non un inventaire : c est l interrupteur hal qui porte l absence. */
const EMPTY_GEAR={bar:2,bars:2,maxPerEnd:5,plates:{'0.5':0,'1':0,'2':0,'1.25':0},
  bands:{},cuffs:{},kbs:{},res:{}};
function aRes(k,gear){
  const g=gear||state.gear;
  if(k==='elast') return !!(g.res||{}).elast&&ownedBands(g).length>0;
  if(k==='kb') return !!(g.res||{}).kb&&kbOwned(g).length>0;
  /* Cle entierement derivee (v2.5), sans interrupteur a elle. Les deux cles
     ci-dessus croisent un drapeau declare et un inventaire ; celle-ci n a pas
     de drapeau parce qu elle ne decrit aucun objet a posseder. Le sac a dos
     n est pas une ressource : il est toujours sous la main, meme registre que
     la chaise, et l exercice n exige de lui aucune garantie que l ordinaire
     n offre pas. Ce que l exercice exige, c est du POIDS a mettre dedans, d ou
     qu il vienne. Un profil qui ne declare qu une kettlebell de 10 kg tient
     donc le premier barreau : c est le defaut qu un NEEDS en halteres aurait
     eu. */
  if(k==='masse') return masseMobilisable(g)>=PAS_SAC;
  return !!((g.res||DEFAULT_GEAR.res)[k]);
}
/* Poids proposes a la declaration (v2.0). Deux listes fermees : on choisit dans
   un menu, on ne saisit pas un nombre. Les disques couvrent ce qui se trouve
   sur le marche pour des halteres courts ; au-dela de 10 kg le disque ne tient
   plus sur un manchon d haltere. Les paires de lestes restent les trois
   declarees, le lot kettlebell apportera les plafonds par exercice avant
   d ouvrir cette liste. */
const PLATE_W=['0.5','1','1.25','2','2.5','5','7.5','10'];
const CUFF_W=['0.5','1','2'];
/* Poids de kettlebell proposes (v2.1). Liste fermee, meme motif que les
   disques : on choisit, on ne saisit pas. Un poids entre a UN exemplaire,
   contrairement aux disques qui entrent a quatre : une kettlebell est un objet
   entier, un exemplaire de plus ne change rien a l echelle. */
const KB_W=['8','10','12','14','16','20'];
function kbOwned(gear){
  const g=gear||DEFAULT_GEAR, k=g.kbs||{};
  return KB_W.filter(w=>k[w]).map(parseFloat).sort((a,b)=>a-b);
}
/* Seuil du micro-palier (v2.1). La regle est additive : elle intercale un
   barreau la ou le saut symetrique depasse ce seuil, et ne retire jamais un
   barreau existant. Balayage de 5 a 45 % : toute valeur entre 13 et 33 %
   produit exactement la meme echelle, la forme du bas d echelle decidant seule.
   20 % est au milieu de ce plateau, il n y a donc rien a calibrer finement. */
const MICRO_SEUIL=0.20;
function loadLadder(gear){ return ladderBuild(gear).all; }
/* Echelle de progression (v2.0) : les seuls montages symetriques, c est-a-dire
   les memes disques des deux cotes. Motif mesure : l echelle complete est
   l union de deux familles, les montages symetriques et le micro-palier d un
   disque sur une extremite, et le tri de leur union fabrique des ecarts de
   0,25 kg qui ne sont le pas de personne. Exemple releve sur l inventaire
   reel : 6 kg est 2 + 2x2 des deux cotes, 6,25 kg est 5 kg plus un disque de
   1,25 sur une seule extremite. Deux montages sans rapport dont les totaux se
   croisent.
   Le cliquet de la double progression ramene la cible au bas de fourchette a
   chaque montee, quel que soit le saut : le prix en repetitions est fixe et le
   gain en charge ne l est pas. Mesure sur le developpe au sol, fourchette
   8-12 : un saut de 6 a 6,25 kg gagne 4,2 % de charge et coute 30,6 % de
   tonnage, un saut de 6 a 7 kg gagne 16,7 % et coute 22,2 %. Le petit palier
   est donc strictement mauvais, meme cout et moins de gain. Cumul mesure sur
   le moteur reel, developpe tire une seance sur trois : quarante-cinq semaines
   pour aller de 6 a 10 kg contre trente sur les seuls montages symetriques.
   Le critere retenu est physique et non un seuil pose : les memes disques des
   deux cotes. Un seuil en pourcentage ferait l inverse de ce qu il faut, les
   ecarts relatifs devant se resserrer quand la charge monte, et reintroduirait
   les collisions au passage.
   L echelle complete reste en service la ou le geste est ponctuel et humain :
   ajustement manuel en seance, reduction de 20 % de la seance allegee, bornage
   materiel. Le cliquet automatique, montee comme filet de securite, vit sur
   l echelle de progression. */
function loadLadderProg(gear){ return ladderBuild(gear).prog; }
let _ladderMemo={};
function ladderBuild(gear){
  const g=gear||DEFAULT_GEAR, cap=g.maxPerEnd||5;
  const key=JSON.stringify([g.bar,g.bars,cap,g.plates]);
  if(_ladderMemo[key]) return _ladderMemo[key];
  const types=Object.keys(g.plates).map(parseFloat).filter(w=>w>0&&g.plates[w]>0).sort((a,b)=>a-b);
  const perDb={};
  types.forEach(w=>{ perDb[w]=Math.floor(g.plates[w]/g.bars); });
  /* Ecart tolere entre les deux manchons d un meme haltere (v2.1). La v1.2
     avait tranche le principe, « un seul disque supplementaire sur une
     extremite, desequilibre negligeable sur une charge tenue au centre de la
     main » ; ce qui manquait etait la grandeur. Le critere etait une procedure,
     symetrique plus un disque, et non une grandeur physique, si bien que
     l echelle livrait 3,25 kg, qui demande 1,25 kg d ecart, et refusait 3,5 kg,
     qui n en demande que 0,5. Le critere devient l ecart lui-meme, borne au
     plus petit disque declare : il derive de l inventaire et ne se pose pas. */
  const D=types.length?types[0]:0;
  const all=new Map(), sym=new Set();
  (function walk(i,a,b,na,nb){
    if(i===types.length){
      const t=Math.round((g.bar+a+b)*100)/100, d=Math.round(Math.abs(a-b)*100)/100;
      if(d<0.001) sym.add(t);
      if(d<=D+0.001&&(!all.has(t)||all.get(t)>d)) all.set(t,d);
      return;
    }
    const w=types[i], n=perDb[w];
    for(let x=0;x<=n&&na+x<=cap;x++)
      for(let y=0;x+y<=n&&nb+y<=cap;y++) walk(i+1,a+w*x,b+w*y,na+x,nb+y);
  })(0,0,0,0,0);
  const A=[...all.keys()].sort((x,y)=>x-y), S=[...sym].sort((x,y)=>x-y);
  const out={all:A,sym:S,prog:microProg(S,A)};
  _ladderMemo[key]=out;
  return out;
}
/* Micro-palier additif (v2.1). Constat mesure : le probleme ne mord que sur
   2 vers 3, plus 50 %, et 3 vers 4, plus 33 %, les elevations laterales
   demarrant a 2 kg ; au-dela l echelle symetrique est deja a 12,5 % et moins.
   La metrique de tonnage qui a justifie l echelle symetrique en v2.0 est
   aveugle a la faisabilite du saut par repetition, c est la raison nouvelle.
   La regle AJOUTE et ne retire jamais : au-dessus de 4 kg l echelle de
   progression est identique a celle de la v2.0, verifie par comparaison
   stricte. Un seul intercalaire par intervalle, le plus proche du milieu
   geometrique, pour que les deux moities du saut se ressemblent. */
function microProg(S,A){
  const out=[];
  S.forEach((v,i)=>{
    out.push(v);
    const nx=S[i+1];
    if(nx===undefined||nx/v-1<=MICRO_SEUIL) return;
    const mid=A.filter(x=>x>v+0.001&&x<nx-0.001);
    if(!mid.length) return;
    const cible=Math.sqrt(v*nx);
    let best=mid[0];
    mid.forEach(x=>{ if(Math.abs(x-cible)<Math.abs(best-cible)) best=x; });
    out.push(best);
  });
  return out;
}
/* echelle mono-haltere : une seule barre, tout le stock de disques */
function loadLadderMono(gear){
  const g=gear||DEFAULT_GEAR;
  return loadLadder(Object.assign({},g,{bars:1}));
}
function loadLadderMonoProg(gear){
  const g=gear||DEFAULT_GEAR;
  return loadLadderProg(Object.assign({},g,{bars:1}));
}
/* ============ BANDES ELASTIQUES : echelle ordinale ============ */
/* Un niveau porte sa fourchette de tension comme libelle principal (v2.0) : il
   est un cran de tension, la couleur n est que ce qu on pose dessus. Les cinq
   premieres cles restent celles de la v1.2, elles sont ecrites dans perf et
   dans l historique. La sixieme est une extension au sommet, et sa cle est
   opaque a dessein : avec la realisation par couleur, la nommer « bleu »
   inviterait la confusion entre la cle du niveau et la couleur qui le tient. */
const BANDS=[
 {id:'jaune',lbs:'5 à 15 lbs'},
 {id:'rouge',lbs:'15 à 35 lbs'},
 {id:'noir',lbs:'25 à 65 lbs'},
 {id:'violet',lbs:'35 à 85 lbs'},
 {id:'vert',lbs:'50 à 125 lbs'},
 {id:'n6',lbs:'125 à 170 lbs'}
];
/* Nuancier ferme (v2.0). La realisation d un niveau est une couleur choisie
   ici, jamais une chaine saisie : on tape une pastille, on ne saisit rien, ce
   qui supprime du meme geste le nommage libre et le piege de la chaine vide.
   La cle est stockee, le libelle porte l accord, le code sert la pastille.
   Pas de nuances foncees : illisibles en pastille sur mobile, et le doublon
   couvre deja le cas des deux bandes de meme couleur. La realisation restant
   une chaine, ajouter une couleur plus tard coute zero migration.
   Les cinq premieres cles sont exactement les realisations que la migration
   pose par defaut sur une sauvegarde v1.18, donc un inventaire domicile ne
   migre pas deux fois. */
const PAL=[['rose','rose','#E85D8A'],['rouge','rouge','#C0392B'],['orange','orange','#E67E22'],
 ['jaune','jaune','#E2B93B'],['vert','verte','#2E8B57'],['bleu','bleue','#2E6FD8'],
 ['violet','violette','#7D4FB0'],['noir','noire','#3A3A40'],['blanc','blanche','#F5F5F2'],
 ['gris','grise','#8A949E'],['marron','marron','#8B5A2B'],['beige','beige','#D9C7A7']];
function coulOK(c){ return PAL.some(x=>x[0]===c); }
function coulLbl(c){ for(const x of PAL) if(x[0]===c) return x[1]; return c||''; }
function coulHex(c){ for(const x of PAL) if(x[0]===c) return x[2]; return null; }
/* NIVEAUX ET REALISATIONS (v2.0). Un niveau est une cle stable, jamais un rang :
   sa position dans l echelle depend de l inventaire, son identite non. Chaque
   profil declare la REALISATION du niveau, c est-a-dire l objet concret qui le
   tient ici : la bande rouge a domicile, la bleue de Marc ailleurs. Une
   realisation vide signifie que ce profil ne tient pas ce niveau.
   La realisation remplace la carte de presence de la v1.18, une structure au
   lieu de deux : la presence se lit comme une realisation non vide. */
function ownedBands(gear){const g=gear||DEFAULT_GEAR;return BANDS.filter(b=>(g.bands||{})[b.id]).map(b=>b.id);}
function bandReal(id,gear){
  const g=gear||(typeof state!=='undefined'?state.gear:DEFAULT_GEAR);
  const v=(g.bands||{})[id];
  return (typeof v==='string'&&v)?v:(v?id:'');
}
/* Ordre de difficulte d un exercice a bande, du plus facile au plus dur,
   independant de tout inventaire : resistance = jaune -> vert (bnd0 ajoute le
   barreau 'aucune' en bas), assistance = vert -> jaune (moins d aide = plus
   dur). L ordre appartient a l echelle, jamais a l inventaire : c est lui qui
   permet de comparer deux barreaux quand l un des deux n est pas disponible.
   Le pseudo-barreau 'aucune' est structurel, genere selon le drapeau de
   l exercice, jamais membre de l inventaire. */
function bandOrder(e){
  const ids=BANDS.map(b=>b.id);
  if(e.bnd==='ass') return ids.reverse();
  return (e.bnd0?['aucune']:[]).concat(ids);
}
/* echelle realisable ici : l ordre de l exercice, filtre par l inventaire */
function bandLadder(e,gear){
  const own=ownedBands(gear);
  return bandOrder(e).filter(b=>b==='aucune'||own.indexOf(b)>=0);
}
/* Bornage a la lecture. Le niveau prescrit est le niveau disponible le plus
   difficile qui ne depasse pas le niveau canonique : le bornage ne durcit
   jamais. Le comparateur porte sur la difficulte et jamais sur la raideur,
   d ou la lecture de l ordre de l echelle plutot que de la couleur : pour une
   bande d assistance, plus difficile signifie plus faible.
   Cas ou tout le disponible est plus dur : on rend le plus facile disponible et
   on leve le drapeau up. C est exactement ce que la v1.18 ecrivait dans perf,
   qui devient ici une lecture, donc reversible. */
function bandBorne(e,cur,gear){
  const L=bandLadder(e,gear);
  if(!L.length) return {band:null,up:false,cut:false};
  if(L.indexOf(cur)>=0) return {band:cur,up:false,cut:false};
  const O=bandOrder(e), r=O.indexOf(cur);
  if(r<0) return {band:L[0],up:false,cut:true};
  let best=null;
  for(const b of L) if(O.indexOf(b)<=r) best=b;
  if(best!=null) return {band:best,up:false,cut:true};
  return {band:L[0],up:true,cut:false};
}
function bandInfo(id){for(const b of BANDS) if(b.id===id) return b; return null;}
/* Fourchette de tension d un niveau : sa seule identite stable d un profil a
   l autre, puisque la realisation, elle, change de main. */
function bandRange(id){const b=bandInfo(id);return b?b.lbs:'';}
/* Rang affiche d un niveau, 1 pour le plus faible. Il ne sert qu a desambiguer
   un doublon de couleur : la position dans l echelle depend de l inventaire,
   l identite du niveau non. */
function bandRang(id){for(let i=0;i<BANDS.length;i++) if(BANDS[i].id===id) return i+1; return 0;}
/* Deux niveaux tenus par la meme couleur dans le profil actif : cas reel d un
   jeu etranger a deux bleues de tensions differentes. Le doublon est autorise,
   il est seulement leve a l affichage, et seulement quand il est effectif ici. */
function bandDouble(id,gear){
  const r=bandReal(id,gear); if(!r) return false;
  return BANDS.filter(b=>bandReal(b.id,gear)===r).length>1;
}
/* Le libelle nomme la realisation du profil actif et non la cle du niveau :
   c est ce que l utilisateur a sous la main qu il faut lui dire. Sans
   realisation, on retombe sur la fourchette de tension, qui est vraie partout. */
function bandNom(id,gear){
  if(id==='aucune') return '';
  const r=bandReal(id,gear);
  if(!r) return bandRange(id);
  return coulLbl(r)+(bandDouble(id,gear)?', niveau '+bandRang(id):'');
}
function bandLabel(id){
  if(id==='aucune') return 'sans bande';
  return 'bande '+bandNom(id);
}
/* La pastille porte la couleur de la realisation. Le liseré n est pas
   decoratif : sans lui la blanche disparait en theme clair et la noire en
   theme sombre. */
function bandDot(id){
  const h=coulHex(bandReal(id));
  return h?'<i class="bdot" style="background:'+h+'"></i>':'';
}
function nextBandFor(e,cur,gear,dir){
  const L=bandLadder(e,gear); if(!L.length) return null;
  const i=L.indexOf(cur);
  if(i<0) return L[0];
  const j=i+dir; return (j>=0&&j<L.length)?L[j]:null;
}
/* ============ LESTES SCRATCHABLES ============ */
/* Increments possibles en kg selon les paires possedees, 0 inclus, croissants
   (v2.0). Les lestes se superposent sur un meme membre : l echelle est donc
   l ensemble des sommes de sous-ensembles des paires declarees, dedoublonne.
   La v1.2 enumerait les trois cas d un inventaire a deux paires ; la troisieme
   paire de 0,5 kg en produirait sept, et une quatrieme quinze. */
/* Les lestes portent un drapeau de presence depuis la v2.1, sur le modele de
   hal : il masque sans detruire, donc le relever restitue exactement les
   paires declarees et il n y a rien a memoriser. */
function aCuff(gear){
  const g=gear||DEFAULT_GEAR;
  return !!(g.res||{}).cuff&&CUFF_W.some(w=>(g.cuffs||{})[w]);
}
function cuffSteps(gear,limbs){
  const g=gear||DEFAULT_GEAR, c=aCuff(g)?(g.cuffs||{}):{};
  const w=CUFF_W.filter(k=>c[k]).map(parseFloat);
  let S=[0];
  w.forEach(x=>{ S=S.concat(S.map(v=>Math.round((v+x)*100)/100)); });
  return [...new Set(S)].sort((a,b)=>a-b).map(v=>Math.round(v*limbs*100)/100);
}
/* Masse mobilisable dans un sac a dos (v2.5). Somme tout ce que l inventaire
   declare de pesant, sans distinguer la forme : un disque, une barre, une
   kettlebell et une paire de lestes sont du poids une fois dans le sac. Chaque
   famille reste soumise a son propre drapeau de presence, meme discipline
   qu aRes : masquer les halteres masque leurs disques ici aussi.
   Sert a trois choses et une seule fonction les porte : decider si la position
   est servie, engendrer les barreaux, fixer le plafond. Aucune constante de
   plafond a maintenir, il monte tout seul quand du materiel est declare. */
function masseMobilisable(gear){
  const g=gear||DEFAULT_GEAR;
  let m=0;
  if((g.res||{}).hal){
    const P=g.plates||{};
    PLATE_W.forEach(w=>{ if(P[w]) m+=parseFloat(w)*P[w]; });
    m+=(g.bars||0)*(g.bar||0);
  }
  if((g.res||{}).kb){ const K=g.kbs||{}; KB_W.forEach(w=>{ if(K[w]) m+=parseFloat(w)*K[w]; }); }
  if(aCuff(g)){ const C=g.cuffs||{}; CUFF_W.forEach(w=>{ if(C[w]) m+=parseFloat(w)*C[w]*2; }); }
  return Math.round(m*100)/100;
}
/* Pas de l echelle du sac (v2.5). Dix kilos, et le nombre n est pas pose au
   hasard : un barreau doit valoir au moins dix pour cent de ce que porte le
   mollet, et ce mollet porte le poids du corps. Dix kilos est le plus petit
   nombre rond qui satisfait la regle de 65 a 90 kg de poids de corps, que le
   mollet travaille seul ou a deux, la charge et la base doublant ensemble.
   Un pas de cinq a ete mesure par la methode du carnet, celle qui a ecarte le
   micro-palier des halteres en v2.1 : le cliquet ramene la cible au bas de
   fourchette a chaque montee, donc le prix en repetitions est fixe et le gain
   en charge ne l est pas. Sur une jambe, fourchette 8-15, poids de corps 78 kg,
   un saut de 10 a 15 kg gagne 5,7 % de charge et coute 43,6 % de tonnage, un
   saut de 10 a 20 kg gagne 11,4 % et coute 40,6 %. Meme verdict qu au
   developpe au sol : le petit palier coute plus et rapporte moitie moins. */
const PAS_SAC=10;
/* Exercices dont la charge se porte dans le sac plutot qu en main. Le choix du
   sac contre la kettlebell tenue est un choix d epaule avant d etre un choix
   de prehension : quinze repetitions par cote avec vingt kilos au bout d un
   bras tirent sur la gleno-humerale, et les deux mains restent libres pour
   l equilibre sur une jambe au bord d une marche. */
const SAC_EX=['mollets-debout-leste','mollets-une-jambe-leste'];
/* Echelle de la charge posee sur les hanches (v2.13). Meme pas que le sac, dix
   kilos, et pour la meme methode : le cliquet ramene la cible au bas de
   fourchette a chaque montee, donc le prix en repetitions est fixe et le gain
   en charge ne l est pas. Un pas de cinq rendrait +10,6 % de charge pour le
   meme prix la ou dix en rendent +33 %.
   Le plafond est une CONSTANTE, seul endroit du catalogue ou la masse declaree
   ne decide pas seule, et il porte deux raisons distinctes selon la fiche.
   Sur pont-fessier-leste il est structurel : avec la charge posee sur le
   bassin, +30 kg vaut deja le pont sur une jambe et +40 passe au-dessus, donc
   au-dela de 20 l escalier cesserait d etre monotone et la marche suivante
   deviendrait un doublon puis une regression. Le dernier barreau est celui qui
   reste strictement sous la marche suivante.
   Sur hip-thrust-une-jambe-leste, dernier maillon, il n est que montage : une
   charge improvisee sur le bassin cesse d etre stable bien avant d etre
   insuffisante. C est le seul des deux qui pourra bouger un jour.
   Dix kilos sur le bassin ne valent pas dix kilos de poids de corps : ce qui
   monte au poids du corps le fait d une demi-amplitude, le tronc pivotant sur
   les epaules et la cuisse sur le genou, quand la charge posee sur les hanches
   monte de l amplitude entiere. Elle compte donc double, +33 % de resistance
   pour dix kilos, et c est ce calcul qui a ramene l escalier de quatre
   barreaux a deux. */
const HANCHES_EX=['pont-fessier-leste','hip-thrust-une-jambe-leste'];
const PAS_HANCHES=10, CAP_HANCHES=20;
/* Echelle numerique des exercices a charge fixe (v2.1, multi-kettlebells).
   Regle des totaux ambigus : les lestes ne comblent que l intervalle jusqu a
   la kettlebell possedee suivante, et prolongent librement au-dela de la plus
   lourde. Un total est donc toujours tenu par UN montage, celui qui emploie la
   kettlebell la plus lourde disponible : c est le montage le plus simple, le
   moins d objets, et sur un swing le moins de scratchs sur un segment en
   mouvement. Mesure sur 8/10/12/14/16/20 avec les trois paires : l union brute
   donne 20 totaux dont 14 ambigus, la regle donne 20 barreaux sans un seul
   doublon, avec des ecarts relatifs decroissants de 12,5 a 3,8 %. Controle de
   non-regression : avec la seule kettlebell de 10, l echelle reste 10 a 17. */
function fixedLadder(id,gear){
  const g=gear||DEFAULT_GEAR;
  /* Echelle du sac (v2.5) : des multiples du pas, bornes par la masse declaree.
     Elle ne passe pas par les montages kettlebell plus lestes, qui resserrent
     leurs ecarts a mesure que la charge monte parce que l engin y EST la
     charge. Ici l engin s ajoute au poids du corps : dix kilos valent onze pour
     cent sur un mollet, un kilo en vaut un et trois dixiemes. Meme echelle,
     sens dix fois plus petit, donc echelle differente. */
  if(SAC_EX.indexOf(id)>=0){
    const m=masseMobilisable(g), out=[];
    for(let v=PAS_SAC;v<=m+0.001;v+=PAS_SAC) out.push({v:v,lbl:'sac '+fmtNum(v)+' kg'});
    return out;
  }
  /* Echelle des hanches (v2.13), meme forme que celle du sac, bornee en plus
     par une constante. L inventaire continue de borner par le bas : qui ne
     declare que dix kilos n a qu un barreau, et le verrou loadTop lit cette
     echelle-la, donc il exige dix et non vingt. Passer par fixedCap aurait
     produit un verrou inatteignable : checkUnlocks lit le dernier barreau de
     fixedLadder sans appliquer le plafond, quand applyProgress le respecte
     pour monter. */
  if(HANCHES_EX.indexOf(id)>=0){
    const top=Math.min(masseMobilisable(g),CAP_HANCHES), out=[];
    for(let v=PAS_HANCHES;v<=top+0.001;v+=PAS_HANCHES) out.push({v:v,lbl:fmtNum(v)+' kg sur les hanches'});
    return out;
  }
  const limbs=(id==='rowing-kettlebell')?1:2;
  /* v2.18 : kbSeules, l echelle ne garde que les kettlebells declarees, sans
     lestes. Premier usage, le squat sur une jambe leste : deux kilos de lestes
     y valent environ 3 % de la charge sur la jambe, et Gabriel a refuse ces
     barreaux pour cet exercice. La marche suivante est la kettlebell plus
     lourde a declarer, que KB_NEXT compose deja. */
  const seules=typeof DB!=='undefined'&&!!(DB[id]&&DB[id].kbSeules);
  const KB=kbOwned(g), steps=seules?[0]:cuffSteps(g,limbs), out=[];
  const lbl=(k,a)=>a?('KB '+fmtNum(k)+' kg + leste'+(limbs>1?'s':'')+' '+fmtNum(a)+' kg'):('KB '+fmtNum(k)+' kg');
  KB.forEach((k,i)=>{
    const nx=KB[i+1];
    steps.forEach(a=>{
      const v=Math.round((k+a)*100)/100;
      if(nx===undefined||v<nx-0.001) out.push({v:v,lbl:lbl(k,a)});
    });
  });
  if(id==='rowing-kettlebell'){
    /* Le segment haltere ne prend le relais qu au-dessus de tout ce que les
       kettlebells savent faire : tant qu un poids superieur existe, la charge
       reste sur la kettlebell, qui est le geste de l exercice. */
    const top=out.length?out[out.length-1].v:0;
    const mono=loadLadderMonoProg(g).filter(v=>v>top+0.01);
    mono.forEach(v=>out.push({v:v,lbl:'haltère '+fmtNum(v)+' kg'}));
    if(mono.length){
      const m=mono[mono.length-1];
      cuffSteps(g,1).slice(1).forEach(a=>out.push({v:Math.round((m+a)*100)/100,lbl:'haltère '+fmtNum(m)+' kg + leste '+fmtNum(a)+' kg'}));
    }
  }
  return out;
}
/* Plafond de charge par exercice (v2.1). La litterature ne donne pas de
   nombre pour le swing : elle donne une regle de forme, la charge cesse de
   monter quand la charniere se degrade en squat, ce que l outil ne peut pas
   mesurer. Un chiffre en kilos serait pose et non source. Le plafond est donc
   derive : on ne lance pas en balistique plus lourd qu on ne tient en
   controle sur le meme schema moteur, et c est deja le souleve roumain qui
   ouvre le verrou des swings. Il monte tout seul, sans constante a maintenir. */
const FIXED_CAP={'kb-swings':'rdl-kettlebell'};
function fixedCap(id){
  const src=FIXED_CAP[id];
  if(!src||typeof state==='undefined'||!state||!state.perf||!state.perf[src]) return null;
  const v=state.perf[src].load;
  return (typeof v==='number'&&v>0)?v:null;
}
/* Meme bornage que pour les bandes, sur une echelle numerique : la charge
   prescrite est la plus lourde disponible qui ne depasse pas la charge
   canonique. Si tout le disponible est plus lourd, on rend la plus legere et on
   leve up. Vaut pour les deux echelles chargees, halteres et charge fixe. */
function loadBorne(id,cur,gear){
  const e=(typeof DB!=='undefined')?DB[id]:null;
  const L=(e&&e.mode==='fixed')?fixedLadder(id,gear).map(x=>x.v):loadLadder(gear);
  if(!L.length) return {load:cur,up:false,cut:false};
  let best=null;
  for(const v of L) if(v<=cur+0.01) best=v;
  if(best!=null) return {load:best,up:false,cut:Math.abs(best-cur)>0.01};
  return {load:L[0],up:true,cut:false};
}
function loadLabelFor(id,v){
  const e=DB[id];
  if(e&&e.mode==='fixed'){
    const L=fixedLadder(id,typeof state!=='undefined'&&state?state.gear:null);
    for(const x of L) if(Math.abs(x.v-v)<0.01) return x.lbl;
  }
  return fmtKg(v);
}
/* ajustement manuel : echelle complete, le geste est ponctuel et humain */
function nextLoad(cur,gear,dir){ return stepIn(loadLadder(gear),cur,dir); }
/* cliquet automatique, montee comme filet de securite : echelle de progression */
function nextLoadProg(cur,gear,dir){ return stepIn(loadLadderProg(gear),cur,dir); }
function stepIn(L,cur,dir){
  if(dir>0){ for(const v of L) if(v>cur+0.01) return v; return cur; }
  for(let i=L.length-1;i>=0;i--) if(L[i]<cur-0.01) return L[i];
  return cur;
}
/* Un seul formateur de nombre pour toute l application : la virgule est le
   separateur decimal en francais, et six points d affichage la produisaient a
   la main. fmtKg lui ajoute l unite. */
function fmtNum(v){return (Math.round(v*100)/100).toString().replace('.',',');}
function fmtKg(v){return fmtNum(v)+' kg';}
```
## `app2.js`

Catalogue des fiches : nom, muscles, exécution, vigilance, pictogramme.

193 lignes, 37286 octets.

```javascript
/* ============ BASE D EXERCICES ============ */
const DB={
 'pompes-poignees':{nom:'Pompes',en:'Push-ups',mus:'Pectoraux, triceps, épaules',type:'reps',start:20,inc:2,series:'3 séries (ex : 8 / 6 / 6), repos 60 s',
  desc:['Mains au sol largeur épaules, ou sur les poignées si tu en as, corps gainé en planche des épaules aux talons.','Descends en 2 s, poitrine entre les mains, coudes à ~45° du corps (pas collés, pas à 90°).','Remonte en poussant fort et en soufflant, sans casser la ligne du corps.'],
  vig:'<b>Dos :</b> serre abdos et fessiers, ne laisse jamais le bassin s\'affaisser. <b>Cou :</b> regard au sol légèrement devant, nuque neutre.',
  fin:'l\'affaissement du bassin, jamais l\'épuisement des pectoraux. Une pompe de plus la ligne cassée n\'est pas une pompe de plus, c\'est une extension lombaire sous charge.',
  fig:{a:{hd:[22,56],nk:[33,61],hp:[68,66],kf:[85,70],ff:[104,90],ea:[33,75],ha:[31,89],props:[{t:'bar',at:[24,90],to:[40,90]}]},b:{hd:[20,72],nk:[31,76],hp:[67,74],kf:[85,76],ff:[104,90],ea:[42,86],ha:[31,89],props:[{t:'bar',at:[24,90],to:[40,90]}]}},
  fb:'pompes-inclinees'},
 'pompes-inclinees':{nom:'Pompes inclinées',en:'Incline push-ups',mus:'Pectoraux, triceps',type:'reps',start:24,inc:2,series:'3 séries, repos 45 s',
  desc:['Mains sur un support stable (table, plan de travail), corps en planche inclinée.','Même mouvement que la pompe classique, souffle en remontant, charge réduite sur épaules et poignets.'],
  vig:'Version de repli douce pour les épaules. Garde quand même le gainage.',
  fig:{a:{hd:[34,30],nk:[43,37],hp:[72,58],kf:[86,70],ff:[100,89],ea:[42,50],ha:[40,62],props:[{t:'box',at:[28,62],w:18,h:31}]},b:{hd:[27,40],nk:[36,46],hp:[68,62],kf:[84,72],ff:[100,89],ea:[40,56],ha:[40,62],props:[{t:'box',at:[28,62],w:18,h:31}]}}},
 'elevations-laterales':{nom:'Élévations latérales',en:'Lateral raises',mus:'Épaules (deltoïdes)',type:'reps',start:30,inc:2,series:'3 séries de 10, haltères légers (1-2 kg)',
  desc:['Debout, un haltère léger dans chaque main le long du corps, coudes très légèrement fléchis.','Monte les bras sur les côtés en soufflant, jusqu\'à l\'horizontale, pas plus haut, en 2 s.','Redescends lentement en 2-3 s : c\'est la descente qui travaille le plus.'],
  vig:'<b>Cou/épaules :</b> épaules basses, ne hausse pas les trapèzes. Si ça tire dans le cou, réduis l\'amplitude ou le poids.',
  fin:'le balancier. Dès que les jambes ou le dos donnent l\'élan pour monter les bras, ce n\'est plus une élévation latérale.',
  fig:{a:{hd:[60,22],nk:[60,32],hp:[60,58],kf:[54,75],ff:[52,91],kb:[66,75],fb:[68,91],ea:[52,44],ha:[48,54],eb:[68,44],hb:[72,54],props:[{t:'db',at:[48,56]},{t:'db',at:[72,56]}]},b:{hd:[60,22],nk:[60,32],hp:[60,58],kf:[54,75],ff:[52,91],kb:[66,75],fb:[68,91],ea:[46,34],ha:[34,33],eb:[74,34],hb:[86,33],props:[{t:'db',at:[32,33]},{t:'db',at:[88,33]}]}},
  fb:'tirage-doux'},
 'face-pulls':{nom:'Face pulls à l\'élastique',en:'Face pulls',mus:'Arrière d\'épaules, fixateurs d\'omoplates',type:'reps',start:36,inc:3,series:'3 séries de 12, tension modérée',
  desc:['Élastique fixé à hauteur de visage : ancrage de porte en haut de porte, ou barre de traction.','Bras tendus devant toi, tire l\'élastique vers ton visage en écartant les coudes.','Finis coudes hauts, mains de chaque côté de la tête, omoplates serrées. Souffle en tirant, inspire au retour.'],
  vig:'<b>C\'est ton exercice santé n°1</b> pour le cou et les épaules : privilégie la qualité, jamais d\'à-coups.',
  fig:{a:{hd:[46,26],nk:[48,36],hp:[46,60],kf:[42,76],ff:[40,91],kb:[52,76],fb:[54,91],ea:[62,38],ha:[76,36],props:[{t:'band',at:[76,36],to:[104,30]}]},b:{hd:[44,26],nk:[46,36],hp:[45,60],kf:[41,76],ff:[39,91],kb:[51,76],fb:[53,91],ea:[58,28],ha:[54,36],props:[{t:'band',at:[54,36],to:[104,30]}]}},
  fb:'tirage-doux'},
 'tirage-doux':{nom:'Tirage élastique doux',en:'Easy band pull',mus:'Haut du dos',type:'reps',start:30,inc:2,series:'3 séries, tension faible',
  desc:['Élastique de faible tension, tire vers toi coudes le long du corps en soufflant, amplitude confortable.','Objectif du jour : bouger sans douleur, pas performer.'],
  vig:'Version de repli. Reste dans une amplitude 100 % indolore.',
  fig:{a:{hd:[46,26],nk:[48,36],hp:[46,60],kf:[42,76],ff:[40,91],kb:[52,76],fb:[54,91],ea:[60,44],ha:[74,44],props:[{t:'band',at:[74,44],to:[104,40]}]},b:{hd:[46,26],nk:[48,36],hp:[46,60],kf:[42,76],ff:[40,91],kb:[52,76],fb:[54,91],ea:[58,48],ha:[56,52],props:[{t:'band',at:[56,52],to:[104,40]}]}}},
 'developpe-sol':{nom:'Développé haltères au sol',en:'Dumbbell floor press',mus:'Pectoraux, triceps',type:'reps',start:16,inc:2,series:'3 séries de 8, montée verticale',
  desc:['Assis au sol, haltères posés sur les cuisses. Allonge-toi en les accompagnant vers la poitrine (bascule arrière d\'un bloc), genoux pliés, pieds au sol.','Coudes à ~45° du corps, pousse les haltères à la verticale en soufflant, jusqu\'à bras tendus, sans cambrer.','Redescends lentement jusqu\'à ce que les coudes touchent le sol, pause brève, repousse. Pour sortir : ramène les haltères sur les cuisses et redresse-toi d\'un bloc.'],
  vig:'<b>Dos :</b> entre et sors de la position haltères sur les cuisses, jamais bras tendus depuis le sol ; bas du dos plaqué. <b>Épaules :</b> le sol arrête les coudes, l\'humérus ne passe jamais derrière le tronc : c\'est le point sûr de l\'exercice.',
  fig:{a:{hd:[18,84],nk:[28,82],hp:[56,82],kf:[64,66],ff:[76,84],ea:[36,86],ha:[38,70],props:[{t:'db',at:[38,66]}]},b:{hd:[18,84],nk:[28,82],hp:[56,82],kf:[64,66],ff:[76,84],ea:[36,68],ha:[36,54],props:[{t:'db',at:[36,50]}]}},
  fb:'pompes-inclinees'},
 'tractions-assistees':{nom:'Tractions assistées (supination)',en:'Band-assisted chin-ups',mus:'Dos (grand dorsal), biceps',type:'reps',start:12,inc:1,series:'3 séries de 4, élastique sous le pied ou le genou',
  desc:['Élastique passé sur la barre, pied ou genou dedans. Prise en supination (paumes vers toi), largeur épaules.','Tire jusqu\'à amener le menton au niveau de la barre, coudes vers le bas, souffle en tirant.','Descends lentement en 2-3 s, bras presque tendus en bas.'],
  vig:'<b>Épaules :</b> descends contrôlé, ne te laisse jamais tomber en bas du mouvement. <b>Cou :</b> ne tends pas le menton vers la barre.',
  fin:'le menton qui ne passe plus franchement, ou le corps qui se balance pour l\'y amener. Une traction tirée au balancier n\'est plus une traction.',
  fig:{a:{hd:[60,38],nk:[60,47],hp:[60,68],kf:[56,80],ff:[58,90],ea:[50,36],ha:[48,25],eb:[70,36],hb:[72,25],props:[{t:'bar',at:[30,25],to:[90,25]},{t:'band',at:[60,25],to:[58,90]}],gnd:false},b:{hd:[60,50],nk:[60,59],hp:[60,78],kf:[56,86],ff:[58,94],ea:[52,44],ha:[48,25],eb:[68,44],hb:[72,25],props:[{t:'bar',at:[30,25],to:[90,25]},{t:'band',at:[60,25],to:[58,94]}],gnd:false}},
  fb:'rowing-elastique'},
 'tractions-strictes':{nom:'Tractions strictes',en:'Chin-ups',mus:'Dos, biceps',type:'reps',start:6,inc:1,series:'Séries courtes, qualité maximale',lock:{after:'tractions-assistees',cond:'Atteins 24 tractions assistées (3×8) avec ton élastique le plus fin',need:24},
  desc:['Même mouvement que la version assistée, sans élastique.','Chaque rép complète : bras tendus en bas, menton à la barre en haut. Souffle en tirant, inspire pendant la descente.'],
  vig:'Grosse fierté à débloquer. Reste strict : pas de balancier.',
  fig:{a:{hd:[60,38],nk:[60,47],hp:[60,68],kf:[56,80],ff:[58,90],ea:[50,36],ha:[48,25],eb:[70,36],hb:[72,25],props:[{t:'bar',at:[30,25],to:[90,25]}],gnd:false},b:{hd:[60,52],nk:[60,61],hp:[60,80],kf:[56,88],ff:[58,96],ea:[52,46],ha:[48,25],eb:[68,46],hb:[72,25],props:[{t:'bar',at:[30,25],to:[90,25]}],gnd:false}}},
 'rowing-kettlebell':{nom:'Rowing kettlebell unilatéral',en:'One-arm KB row',mus:'Dos (milieu), arrière d\'épaule',type:'repsSide',start:20,inc:2,series:'2 séries de 10 par côté, avec ta kettlebell de 10 kg',
  desc:['Main et genou gauches en appui sur une chaise ou un banc, dos plat comme une table.','Kettlebell dans la main droite, bras tendu vers le sol.','Tire la kettlebell vers ta hanche (pas vers l\'épaule), coude près du corps, souffle en tirant, puis redescends lentement. Change de côté.'],
  vig:'<b>Dos :</b> l\'appui sur la chaise protège tes lombaires : ne fais jamais cet exercice sans appui. Dos neutre, regard vers le sol.',
  fig:{a:{hd:[20,36],nk:[32,42],hp:[64,46],kf:[68,66],ff:[66,91],kb:[76,64],fb:[84,91],ea:[26,52],ha:[22,62],eb:[44,56],hb:[46,70],props:[{t:'box',at:[12,62],w:20,h:31},{t:'kb',at:[46,70]}]},b:{hd:[20,36],nk:[32,42],hp:[64,46],kf:[68,66],ff:[66,91],kb:[76,64],fb:[84,91],ea:[26,52],ha:[22,62],eb:[48,48],hb:[56,46],props:[{t:'box',at:[12,62],w:20,h:31},{t:'kb',at:[56,46]}]}},
  fb:'rowing-elastique'},
 'rowing-elastique':{nom:'Rowing élastique assis',en:'Seated band row',mus:'Dos (milieu)',type:'reps',start:30,inc:2,series:'3 séries, tension au choix',
  desc:['Assis au sol jambes semi-tendues, élastique passé autour des pieds.','Dos droit, tire les poignées vers le ventre en serrant les omoplates, souffle en tirant.','Reviens lentement sans laisser le dos s\'arrondir.'],
  vig:'<b>Dos :</b> si tenir le dos droit assis au sol est inconfortable, assieds-toi sur un coussin.',
  fig:{a:{hd:[38,42],nk:[42,52],hp:[46,74],kf:[66,68],ff:[86,72],ea:[54,60],ha:[64,62],props:[{t:'band',at:[64,62],to:[86,70]}]},b:{hd:[34,40],nk:[38,50],hp:[46,74],kf:[66,68],ff:[86,72],ea:[46,62],ha:[46,66],props:[{t:'band',at:[46,66],to:[86,70]}]}},
 },
 'curls-halteres':{nom:'Curls haltères',en:'Biceps curls',mus:'Biceps',type:'reps',start:30,inc:2,series:'3 séries de 10, charge max dispo',
  desc:['Debout, haltères le long du corps, paumes vers l\'avant.','Plie les coudes pour monter les haltères vers les épaules en soufflant, coudes fixes contre le corps.','Descends lentement en 2-3 s.'],
  vig:'Ne balance pas le buste pour tricher : si tu dois te cambrer, la charge est trop lourde pour la fin de série.',
  fig:{a:{hd:[60,22],nk:[60,32],hp:[60,58],kf:[54,75],ff:[52,91],kb:[66,75],fb:[68,91],ea:[50,44],ha:[48,56],eb:[70,44],hb:[72,56],props:[{t:'db',at:[47,58]},{t:'db',at:[73,58]}]},b:{hd:[60,22],nk:[60,32],hp:[60,58],kf:[54,75],ff:[52,91],kb:[66,75],fb:[68,91],ea:[50,44],ha:[52,32],eb:[70,44],hb:[68,32],props:[{t:'db',at:[52,30]},{t:'db',at:[68,30]}]}}},
 'goblet-squat':{nom:'Goblet squat',en:'Goblet squat',mus:'Cuisses, fessiers, gainage',type:'reps',start:24,inc:2,series:'3 séries de 8, kettlebell contre la poitrine',
  desc:['Debout pieds largeur épaules, pointes légèrement ouvertes, kettlebell tenue à deux mains contre la poitrine.','Descends en poussant les hanches en arrière et en pliant les genoux, buste fier.','Descends seulement tant que le bas du dos reste plat, puis remonte en poussant dans les talons et en soufflant.'],
  vig:'<b>Dos :</b> arrête la descente avant que le bassin bascule (bas du dos qui s\'arrondit). <b>Genoux :</b> alignés avec les pointes de pieds, amplitude indolore uniquement.',
  fig:{a:{hd:[58,22],nk:[58,32],hp:[58,58],kf:[54,74],ff:[52,91],kb:[64,74],fb:[68,91],ea:[52,40],ha:[54,44],props:[{t:'kb',at:[56,38]}]},b:{hd:[52,40],nk:[54,49],hp:[62,68],kf:[50,74],ff:[50,91],kb:[70,76],fb:[70,91],ea:[48,56],ha:[50,58],props:[{t:'kb',at:[52,52]}]}},
  fb:'box-squat'},
 'box-squat':{nom:'Squat sur chaise',en:'Box squat',mus:'Cuisses, fessiers',type:'reps',start:24,inc:2,series:'3 séries, poids du corps',
  desc:['Debout devant une chaise, bras tendus devant toi.','Descends jusqu\'à effleurer l\'assise (sans t\'asseoir complètement), puis remonte en soufflant.','La chaise garantit une profondeur constante et sûre.'],
  vig:'Version de repli genoux/dos. Contrôle la descente, ne te laisse pas tomber.',
  fig:{a:{hd:[50,22],nk:[50,32],hp:[50,58],kf:[46,74],ff:[44,91],kb:[56,74],fb:[60,91],ea:[58,40],ha:[66,42],props:[{t:'box',at:[62,66],w:24,h:27}]},b:{hd:[42,40],nk:[46,49],hp:[56,66],kf:[44,72],ff:[44,91],kb:[64,74],fb:[64,91],ea:[54,54],ha:[64,52],props:[{t:'box',at:[62,66],w:24,h:27}]}}},
 'fentes-arriere':{nom:'Fentes arrière',en:'Reverse lunges',mus:'Cuisses, fessiers, équilibre',type:'repsSide',start:16,inc:2,series:'2 séries de 8 par jambe',
  desc:['Debout, fais un grand pas en arrière et descends le genou arrière vers le sol.','Le genou avant reste au-dessus de la cheville, buste droit.','Pousse sur la jambe avant pour revenir debout en soufflant. Alterne.'],
  vig:'<b>Genoux :</b> la fente arrière est plus douce que la fente avant, mais reste dans une amplitude sans douleur. Tiens-toi à un meuble si l\'équilibre est instable.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[52,75],ff:[50,91],kb:[62,75],fb:[66,91],ea:[62,42],ha:[64,52]},b:{hd:[50,30],nk:[50,40],hp:[52,64],kf:[42,74],ff:[42,91],kb:[68,80],fb:[80,91],ea:[56,50],ha:[58,58]}},
 fb:'step-ups-bas'},
 'fentes-arriere-lestee':{nom:'Fentes arrière lestées',en:'Weighted reverse lunges',mus:'Cuisses, fessiers, équilibre',type:'repsSide',start:16,inc:2,series:'2 séries de 8 par jambe',
  desc:['Un haltère dans chaque main, bras le long du corps, épaules basses et en arrière.','Grand pas en arrière, genou arrière vers le sol, genou avant au-dessus de la cheville, buste droit.','Pousse sur la jambe avant pour revenir debout en soufflant. Alterne.'],
  vig:'<b>Dos :</b> les bras pendent, la charge reste le long du corps : ne la laisse jamais tirer le buste vers l\'avant. <b>Équilibre :</b> les mains étant prises, un déséquilibre ne se rattrape plus. Reste sur un sol dégagé, et si la ligne vacille, repose les haltères plutôt que de finir la série. <b>Genoux :</b> même amplitude sans douleur qu\'au poids du corps.',
  fb:'fentes-arriere'},
 'step-ups':{nom:'Step-ups sur marchepied',en:'Step-ups',mus:'Cuisses, fessiers',
  desc:['Devant un marchepied qui arrive juste sous le genou, pose un pied entier dessus, orteils dans l\'axe.','Monte en poussant uniquement sur la jambe posée dessus, sans élan, en soufflant.','Redescends lentement sur la même jambe jusqu\'à effleurer le sol, puis remonte sans marquer d\'arrêt.'],
  vig:'<b>Genoux :</b> tout le travail vient de la jambe du dessus. Si la pointe du pied resté au sol pousse pour t\'aider, la série ne mesure plus rien : elle doit effleurer à peine, ou ne pas toucher du tout. Garde le genou dans l\'axe du pied, jamais rentré vers l\'intérieur.',
  fig:{a:{hd:[44,20],nk:[44,30],hp:[44,56],kf:[52,60],ff:[62,63],kb:[40,72],fb:[38,91],ea:[50,42],ha:[54,50],props:[{t:'box',at:[54,63],w:26,h:30}]},b:{hd:[60,6],nk:[60,16],hp:[60,42],kf:[56,54],ff:[62,63],kb:[68,54],fb:[70,66],ea:[66,26],ha:[70,34],props:[{t:'box',at:[54,63],w:26,h:30}]}},
  fb:'step-ups-bas'},
 'step-ups-bas':{nom:'Step-ups sur marche basse',en:'Low step-ups',mus:'Cuisses, fessiers',
  desc:['Devant une marche d\'escalier ou un marchepied bas, pose un pied entier dessus, orteils dans l\'axe.','Monte en poussant sur cette jambe en soufflant, sans élan, puis redescends lentement en contrôlant.','Le pied resté au sol ne sert qu\'à l\'équilibre : il effleure, il ne pousse pas.'],
  vig:'<b>Genoux :</b> version qui ménage les genoux, hauteur faible et descente contrôlée. Garde le genou dans l\'axe du pied, jamais rentré vers l\'intérieur, et tiens-toi à un mur si l\'équilibre est instable.',
  fig:{a:{hd:[46,26],nk:[46,36],hp:[46,60],kf:[52,68],ff:[60,74],kb:[42,76],fb:[40,91],ea:[52,46],ha:[56,54],props:[{t:'box',at:[54,74],w:26,h:19}]},b:{hd:[60,12],nk:[60,22],hp:[60,46],kf:[56,60],ff:[60,74],kb:[66,62],fb:[68,74],ea:[66,32],ha:[70,40],props:[{t:'box',at:[54,74],w:26,h:19}]}}},
 'retraction-scapulaire':{nom:'Rétraction d\'omoplates au sol',en:'Prone scapular retraction',mus:'Fixateurs d\'omoplates, arrière d\'épaules',
  desc:['À plat ventre, front posé au sol, bras écartés en croix reposant au sol, épaules relâchées.','Sans décoller la poitrine, plie les coudes en les tirant vers l\'arrière et vers le bas : les mains décollent de quelques centimètres et les omoplates se serrent l\'une vers l\'autre.','Tiens une seconde en serrant, souffle, puis relâche lentement.'],
  vig:'<b>Dos :</b> la poitrine ne quitte jamais le sol. Dès qu\'elle se soulève, ce n\'est plus une rétraction mais une extension lombaire, et l\'exercice sort de ce que le catalogue autorise. L\'amplitude est petite, c\'est normal : tout le travail est dans le serrage des omoplates.',
  fig:{a:{hd:[28,84],nk:[36,86],hp:[68,88],kf:[82,88],ff:[96,90],ea:[44,90],ha:[52,92]},b:{hd:[28,84],nk:[36,86],hp:[68,88],kf:[82,88],ff:[96,90],ea:[46,86],ha:[38,82]}}},
 'ecartement-elastique':{nom:'Écartement à l\'élastique',en:'Band pull-apart',mus:'Arrière d\'épaules, fixateurs d\'omoplates',
  desc:['Debout, une extrémité de l\'élastique dans chaque main, bras tendus devant toi à hauteur de poitrine, mains écartées de la largeur des épaules.','Ouvre les bras vers l\'extérieur et vers l\'arrière jusqu\'à former une croix, en soufflant, sans jamais plier les coudes.','Reviens lentement en 2 à 3 s en retenant l\'élastique.'],
  vig:'<b>Épaules :</b> les coudes restent verrouillés du début à la fin. Dès qu\'ils se plient, ce sont les triceps qui allongent l\'élastique et l\'arrière d\'épaule reçoit moins. Épaules basses, ne hausse pas les trapèzes.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[52,74],ff:[50,91],kb:[60,74],fb:[62,91],ea:[52,42],ha:[50,44],eb:[60,42],hb:[62,44],props:[{t:'band',at:[50,44],to:[62,44]}]},b:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[52,74],ff:[50,91],kb:[60,74],fb:[62,91],ea:[44,40],ha:[30,40],eb:[68,40],hb:[82,40],props:[{t:'band',at:[30,40],to:[82,40]}]}}},
 'tirage-vertical-elastique':{nom:'Tirage vertical à l\'élastique',en:'Band lat pulldown',mus:'Dos (grand dorsal), biceps',
  desc:['À genoux face à la porte, un peu en avant de l\'ancrage placé en haut de porte, bras tendus vers le haut, les deux mains sur l\'élastique.','Tire vers le bas en pliant les coudes et en les ramenant près des côtes, l\'élastique descendant devant ton visage, jusqu\'à ce que les mains arrivent devant la poitrine. Souffle en tirant.','Remonte lentement en retenant l\'élastique, sans laisser les épaules monter aux oreilles.'],
  vig:'<b>Cou :</b> l\'élastique passe devant le visage, jamais derrière la nuque. Buste droit, ne te penche pas en arrière pour tricher.',
  fig:{a:{hd:[56,24],nk:[56,34],hp:[56,60],kf:[50,80],ff:[66,88],ea:[54,22],ha:[52,10],props:[{t:'band',at:[52,10],to:[38,4]}]},b:{hd:[56,24],nk:[56,34],hp:[56,60],kf:[50,80],ff:[66,88],ea:[62,44],ha:[54,40],props:[{t:'band',at:[54,40],to:[38,4]}]}}},
 'elevations-laterales-elastique':{nom:'Élévations latérales à l\'élastique',en:'Band lateral raises',mus:'Épaules (deltoïdes)',
  desc:['Debout, les deux pieds sur le milieu de l\'élastique écartés de la largeur des hanches, une extrémité dans chaque main le long du corps, coudes très légèrement fléchis.','Monte les bras sur les côtés en soufflant, jusqu\'à l\'horizontale, pas plus haut, en 2 s.','Redescends lentement en 2 à 3 s : c\'est la descente qui travaille le plus.'],
  vig:'<b>Épaules :</b> épaules basses, ne hausse pas les trapèzes. Si ça tire dans le cou, réduis l\'amplitude ou prends un niveau plus faible.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[48,74],ff:[46,91],kb:[64,74],fb:[66,91],ea:[48,46],ha:[46,58],eb:[64,46],hb:[66,58],props:[{t:'band',at:[46,58],to:[46,91]},{t:'band',at:[66,58],to:[66,91]}]},b:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[48,74],ff:[46,91],kb:[64,74],fb:[66,91],ea:[42,38],ha:[28,38],eb:[70,38],hb:[84,38],props:[{t:'band',at:[28,38],to:[46,91]},{t:'band',at:[84,38],to:[66,91]}]}}},
 'curls-elastique':{nom:'Curls à l\'élastique',en:'Band curls',mus:'Biceps',
  desc:['Debout, les deux pieds sur le milieu de l\'élastique, une extrémité dans chaque main le long du corps, paumes vers l\'avant.','Plie les coudes pour monter les mains vers les épaules en soufflant, coudes fixes contre le corps.','Descends lentement en 2 à 3 s.'],
  vig:'<b>Dos :</b> ne balance pas le buste pour tricher. Si tu dois te cambrer, le niveau est trop fort pour la fin de série.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[48,74],ff:[46,91],kb:[64,74],fb:[66,91],ea:[48,46],ha:[46,58],eb:[64,46],hb:[66,58],props:[{t:'band',at:[46,58],to:[46,91]},{t:'band',at:[66,58],to:[66,91]}]},b:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[48,74],ff:[46,91],kb:[64,74],fb:[66,91],ea:[48,46],ha:[50,34],eb:[64,46],hb:[62,34],props:[{t:'band',at:[50,34],to:[46,91]},{t:'band',at:[62,34],to:[66,91]}]}}},
 'rdl-elastique':{nom:'Soulevé de terre roumain à l\'élastique',en:'Band Romanian deadlift',mus:'Ischio-jambiers, fessiers',
  desc:['Debout, les deux pieds sur le milieu de l\'élastique, une extrémité dans chaque main devant les cuisses, dos parfaitement plat.','Pousse les hanches en arrière, genoux à peine fléchis, les mains glissent le long des jambes.','Descends jusqu\'à sentir l\'étirement derrière les cuisses, puis remonte en serrant les fessiers et en soufflant.'],
  vig:'<b>Dos :</b> le dos reste plat du bassin à la nuque, le mouvement vient des hanches et jamais de la colonne. Nuque dans le prolongement, ne relève pas le menton.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[54,75],ff:[52,91],ea:[54,44],ha:[54,56],props:[{t:'band',at:[54,56],to:[52,91]}]},b:{hd:[30,44],nk:[38,48],hp:[62,56],kf:[58,74],ff:[54,91],ea:[42,60],ha:[44,72],props:[{t:'band',at:[44,72],to:[54,91]}]}}},
 'mollets-debout':{nom:'Mollets debout',en:'Calf raises',mus:'Mollets',type:'reps',start:40,inc:5,series:'2 séries de 20, tiens-toi à un mur',
  desc:['L\'avant du pied sur l\'arête d\'une marche, talons dans le vide, une main au mur pour l\'équilibre.','Laisse descendre les talons sous le niveau de la marche jusqu\'à la fin de l\'étirement, jambes tendues.','Monte sur la pointe le plus haut possible, marque un temps en haut en soufflant, redescends lentement.'],
  vig:'<b>Amplitude :</b> c\'est la moitié basse qui fait le travail. Sans marche l\'exercice se fait quand même, talons au sol, mais tu perds la descente sous l\'horizontale et l\'essentiel avec. La bonne hauteur est celle où le talon arrive en fin d\'étirement sans toucher le sol, en général 7 à 10 cm : au-delà c\'est la cheville qui limite, pas la marche. <b>Équilibre :</b> les doigts au mur guident, ils ne portent pas.',
  fig:{a:{hd:[56,24],nk:[56,34],hp:[56,60],kf:[52,76],ff:[50,91],kb:[60,76],fb:[62,91],ea:[48,44],ha:[42,40],props:[{t:'bar',at:[36,20],to:[36,90]}]},b:{hd:[56,18],nk:[56,28],hp:[56,54],kf:[52,72],ff:[50,87],kb:[60,72],fb:[62,87],ea:[48,38],ha:[42,36],props:[{t:'bar',at:[36,20],to:[36,90]}]}}},
 'mollets-debout-leste':{nom:'Mollets debout lestés',en:'Weighted calf raises',mus:'Mollets',type:'reps',start:40,inc:5,series:'2 séries de 12, sac sur le dos',
  desc:['Sac à dos chargé, sangles serrées pour que la charge ne balance pas, l\'avant du pied sur l\'arête de la marche.','Talons dans le vide, descente complète jusqu\'à la fin de l\'étirement, jambes tendues.','Monte sur la pointe, temps d\'arrêt en haut en soufflant, redescente lente et contrôlée.'],
  vig:'<b>Dos :</b> la charge est portée en compression sur le rachis. Sangles serrées, buste droit, jamais de rebond en bas ni de balancement du sac. Si le bas du dos parle, repose le sac et finis au poids du corps. <b>Charge :</b> disques, kettlebell, bouteilles pleines, peu importe la forme, seul le total compte.',
  fb:'mollets-debout'},
 'mollets-une-jambe':{nom:'Mollets sur une jambe',en:'Single-leg calf raises',mus:'Mollets',type:'repsSide',start:16,inc:2,series:'2 séries de 8 par jambe',
  desc:['L\'avant d\'un seul pied sur l\'arête de la marche, l\'autre jambe fléchie en arrière, doigts au mur pour l\'équilibre.','Laisse descendre le talon sous le niveau de la marche jusqu\'à la fin de l\'étirement, jambe tendue.','Monte sur la pointe le plus haut possible en soufflant, redescends lentement. Fais toutes les répétitions d\'un côté, puis l\'autre.'],
  vig:'<b>Équilibre :</b> les doigts au mur guident, ils ne portent pas : si la main pousse, la série ne mesure plus rien. <b>Cheville :</b> le mollet porte ici tout le poids du corps, deux fois plus qu\'à deux jambes. Descends progressivement dans l\'étirement les premières séances plutôt que d\'aller au bout d\'emblée.',
  fb:'mollets-debout'},
 'mollets-une-jambe-leste':{nom:'Mollets sur une jambe lestés',en:'Weighted single-leg calf raises',mus:'Mollets',type:'repsSide',start:16,inc:2,series:'2 séries de 8 par jambe, sac sur le dos',
  desc:['Sac à dos chargé et sanglé, l\'avant d\'un seul pied sur l\'arête de la marche, l\'autre jambe fléchie en arrière.','Doigts au mur, descente complète du talon sous la marche, jambe tendue.','Monte sur la pointe en soufflant, redescends lentement. Tout un côté, puis l\'autre.'],
  vig:'<b>Dos :</b> charge en compression sur le rachis, sangles serrées, buste droit, aucun rebond en bas. <b>Équilibre :</b> les deux mains restent libres, c\'est la raison du sac plutôt que d\'un poids tenu. Si la ligne vacille, repose le sac plutôt que de finir la série.',
  fb:'mollets-debout'},
 'rdl-kettlebell':{nom:'Soulevé de terre roumain KB',en:'KB Romanian deadlift',mus:'Ischios, fessiers, bas du dos',type:'reps',start:20,inc:2,series:'3 séries lentes',lock:{after:'goblet-squat',cond:'Fais {n} séries de 15 goblet squats',need:15,minSets:2},
  desc:['Debout, kettlebell tenue à deux mains devant les cuisses.','Pousse les hanches en arrière, dos parfaitement plat, genoux à peine fléchis : la KB glisse le long des jambes.','Descends jusqu\'à sentir l\'étirement derrière les cuisses, puis remonte en serrant les fessiers et en soufflant.'],
  vig:'<b>Dos :</b> exercice débloqué car excellent pour renforcer la chaîne postérieure, MAIS le dos plat est non négociable. Filme-toi de profil les premières fois.',
  fig:{a:{hd:[56,22],nk:[56,32],hp:[56,58],kf:[54,75],ff:[52,91],kb:[60,75],fb:[62,91],ea:[54,44],ha:[54,54],props:[{t:'kb',at:[54,56]}]},b:{hd:[30,44],nk:[38,48],hp:[62,56],kf:[58,74],ff:[54,91],ea:[40,60],ha:[42,70],props:[{t:'kb',at:[42,72]}]}}},
 'bird-dog':{nom:'Bird-dog',en:'Bird-dog',mus:'Gainage profond, bas du dos',type:'repsSide',start:16,inc:2,series:'2 séries de tenues par côté, rythmées au son',
  desc:['À quatre pattes, mains sous les épaules, genoux sous les hanches, dos neutre.','Au bip aigu, tends en même temps le bras droit devant et la jambe gauche derrière, à l\'horizontale.','Tiens jusqu\'au bip grave en respirant, sans bouger le bassin ; reviens, et change de côté au bip suivant. La position de retour est un repos.'],
  vig:'<b>Dos :</b> exercice de référence pour les lombaires fragiles. Le bassin ne doit pas tourner : imagine un verre d\'eau posé sur tes reins.',
  fig:{a:{hd:[24,50],nk:[34,54],hp:[70,54],kf:[70,72],ff:[70,90],ea:[34,72],ha:[34,90]},b:{hd:[18,46],nk:[28,52],hp:[66,52],kf:[66,70],ff:[66,90],ea:[16,50],ha:[6,48],kb:[86,52],fb:[102,50]}},
 },
 'planche':{nom:'Planche',en:'Plank',mus:'Gainage complet',type:'temps',start:25,inc:5,series:'Meilleure tenue du jour, 2 essais possibles',
  desc:['En appui sur les avant-bras et les pointes de pieds, corps aligné des épaules aux talons.','Serre abdos et fessiers.','Le chrono s\'arrête dès que le bassin monte ou descend.'],
  vig:'<b>Dos :</b> un bassin qui s\'affaisse creuse les lombaires : mieux vaut 20 s parfaites que 60 s tordues. <b>Cou :</b> regard au sol, nuque longue. <b>Respiration :</b> ne bloque jamais, c\'est le réflexe naturel en gainage et il fait grimper la tension. Souffle lentement, le chrono continue.',
  fin:'le bassin qui monte ou qui descend. C\'est aussi ce qui arrête le chrono : la mesure et le critère sont le même.',
  fig:{a:{hd:[22,58],nk:[32,62],hp:[66,66],kf:[84,70],ff:[102,90],ea:[34,76],ha:[24,88]},b:{hd:[22,58],nk:[32,62],hp:[66,66],kf:[84,70],ff:[102,90],ea:[34,76],ha:[24,88]}},
  fb:'planche-genoux'},
 'planche-genoux':{nom:'Planche sur genoux',en:'Knee plank',mus:'Gainage',type:'temps',start:30,inc:5,series:'Meilleure tenue du jour',
  desc:['Même position que la planche, mais en appui sur les genoux.','Ligne droite des épaules aux genoux.'],
  vig:'Version de repli : parfaite pour construire le gainage sans surcharger. <b>Respiration :</b> ne bloque jamais, souffle lentement pendant la tenue.',
  fig:{a:{hd:[24,60],nk:[34,64],hp:[66,68],kf:[80,78],ff:[94,74],ea:[36,78],ha:[26,90]},b:{hd:[24,60],nk:[34,64],hp:[66,68],kf:[80,78],ff:[94,74],ea:[36,78],ha:[26,90]}}},
 'dead-bug':{nom:'Dead bug',en:'Dead bug',mus:'Abdos profonds',type:'reps',start:20,inc:2,series:'2 séries de tenues par côté, rythmées au son',
  desc:['Allongé sur le dos, bras tendus vers le plafond, hanches et genoux à 90°.','Au bip aigu, souffle en tendant le bras droit derrière la tête et la jambe gauche vers le sol, sans les poser : c\'est l\'expiration qui garde les côtes basses et le dos plaqué. Tiens jusqu\'au bip grave.','Le bas du dos reste plaqué au sol en permanence. Reviens, alterne au bip suivant : la position de retour reste chargée, toute la série est sous tension.'],
  vig:'<b>Dos :</b> si le bas du dos décolle, réduis l\'amplitude. C\'est l\'anti-crunch : tout le bénéfice, zéro compression lombaire. <b>Souffle :</b> à 3 s, une expiration par tenue ; à 6 et 10 s, inspire par le nez en tenue sans lever les côtes, expire long, ne bloque jamais. Si ce sont les fléchisseurs de hanche qui brûlent et non le ventre, raccourcis le levier ou plie le genou.',
  fin:'le bas du dos qui décolle du sol. Dès que les lombaires se creusent, la série est finie, quel que soit le compte.',
  fig:{a:{hd:[20,84],nk:[30,82],hp:[58,82],kf:[62,64],ff:[76,66],ea:[34,66],ha:[36,54]},b:{hd:[20,84],nk:[30,82],hp:[58,82],kf:[70,74],ff:[86,80],ea:[24,68],ha:[12,66]}},
 },
 'pallof-press':{nom:'Pallof press',en:'Pallof press',mus:'Obliques, anti-rotation',type:'repsSide',start:16,inc:2,series:'2 séries de 8 par côté',
  desc:['Élastique fixé à hauteur de poitrine sur le côté (ancrage de porte), tenu à deux mains contre le sternum.','Tends les bras devant toi : l\'élastique essaie de te faire pivoter, résiste.','Souffle en tendant les bras, respire pendant les 2 s sans bloquer, reviens. Fais l\'autre côté.'],
  vig:'<b>Dos :</b> excellent gainage anti-rotation sans aucune flexion de colonne.',
  fin:'le tronc qui pivote vers l\'ancrage. L\'exercice est un anti-mouvement : dès que tu tournes, il n\'y a plus d\'exercice.',
  fig:{a:{hd:[52,24],nk:[52,34],hp:[52,60],kf:[46,76],ff:[44,91],kb:[58,76],fb:[62,91],ea:[60,44],ha:[56,42],props:[{t:'band',at:[56,42],to:[104,36]}]},b:{hd:[52,24],nk:[52,34],hp:[52,60],kf:[46,76],ff:[44,91],kb:[58,76],fb:[62,91],ea:[64,40],ha:[76,40],props:[{t:'band',at:[76,40],to:[104,36]}]}}},
 'cardio-bas-impact':{nom:'Intervalles bas impact',en:'Low-impact intervals',mus:'Cardio, jambes',type:'circuit',start:8,inc:1,
  phases:[{l:'Montées de genoux (sans saut)',s:30},{l:'Marche rapide sur place',s:30}],
  desc:['Alterne 30 s de montées de genoux dynamiques SANS sauter (un pied toujours au sol) et 30 s de marche rapide de récupération.','Bras actifs, rythme qui essouffle sans mettre dans le rouge.','La cible augmente de 1 round au fil des semaines.'],
  vig:'<b>Genoux :</b> zéro impact tant qu\'ils sont sensibles : ne saute pas, même si l\'envie vient.',
  fig:{a:{hd:[56,20],nk:[56,30],hp:[56,56],kf:[50,64],ff:[54,74],kb:[60,74],fb:[62,91],ea:[62,42],ha:[68,36]},b:{hd:[56,20],nk:[56,30],hp:[56,56],kf:[62,64],ff:[58,74],kb:[52,74],fb:[50,91],ea:[50,42],ha:[44,36]}},
  fb:'marche-continue'},
 'marche-continue':{nom:'Marche rapide continue',en:'Brisk walk-in-place',mus:'Cardio doux',type:'circuit',start:1,inc:0,phases:[{l:'Marche rapide sur place',s:240}],
  desc:['4 minutes de marche rapide sur place, bras actifs, respiration ample.'],
  vig:'Version de repli : garder le corps en mouvement, sans stress articulaire.',
  fig:{a:{hd:[56,20],nk:[56,30],hp:[56,56],kf:[50,68],ff:[50,84],kb:[62,72],fb:[64,91],ea:[62,42],ha:[66,48]},b:{hd:[56,20],nk:[56,30],hp:[56,56],kf:[62,68],ff:[62,84],kb:[50,72],fb:[48,91],ea:[50,42],ha:[46,48]}}},
 'kb-swings':{nom:'Kettlebell swings',en:'KB swings',mus:'Fessiers, ischios, cardio',type:'reps',start:30,inc:5,series:'3 séries de 10, explosif mais propre',lock:{after:'rdl-kettlebell',cond:'Fais {n} séries de 15 soulevés roumains : le swing est le même geste, en dynamique',need:15,minSets:2},
  desc:['Même charnière de hanche que le soulevé roumain : la KB passe entre les jambes, dos plat.','Propulse la KB à hauteur de poitrine par une extension explosive des hanches (pas des bras), souffle sec à chaque projection, inspire pendant la descente.','Laisse-la redescendre en te penchant, hanches en arrière.'],
  vig:'<b>Dos :</b> le swing est excellent pour la chaîne postérieure UNIQUEMENT avec un dos plat verrouillé. Le geste vient des hanches, jamais des lombaires. <b>Lestes :</b> mouvement balistique, vérifie le serrage des scratchs avant chaque série.',
  fig:{a:{hd:[36,40],nk:[42,46],hp:[62,54],kf:[58,72],ff:[54,91],kb:[66,74],fb:[68,91],ea:[46,58],ha:[52,68],props:[{t:'kb',at:[54,70]}]},b:{hd:[54,20],nk:[54,30],hp:[56,56],kf:[52,74],ff:[50,91],kb:[60,74],fb:[62,91],ea:[54,38],ha:[66,36],props:[{t:'kb',at:[70,34]}]}}},
 'etir-nuque':{nom:'Étirement nuque',en:'Neck stretch',mus:'Cou, trapèzes',type:'stretch',dur:40,bilat:true,
  desc:['Assis ou debout, pose la main du côté vers lequel tu penches sur le dessus de la tête, incline doucement l\'oreille vers l\'épaule, main opposée relâchée vers le sol.','20 s par côté, traction très douce, jamais de douleur. Souffle lentement, c\'est l\'expiration qui fait céder le muscle.'],
  vig:'<b>Cou :</b> aucune force, on cherche un étirement confortable, pas un record.',
  fig:{a:{hd:[54,24],nk:[58,34],hp:[58,60],kf:[52,76],ff:[50,91],kb:[64,76],fb:[66,91],ea:[66,46],ha:[70,58]},b:{hd:[64,26],nk:[58,34],hp:[58,60],kf:[52,76],ff:[50,91],kb:[64,76],fb:[66,91],ea:[50,46],ha:[46,58]}}},
 'etir-pecs':{nom:'Ouverture pectoraux',en:'Doorway chest stretch',mus:'Pectoraux, avant d\'épaule',type:'stretch',dur:60,bilat:true,
  desc:['Avant-bras contre le chambranle d\'une porte, coude à hauteur d\'épaule.','Avance doucement le buste jusqu\'à sentir l\'ouverture devant l\'épaule. 30 s par côté, en soufflant lentement.'],
  vig:'Contrepoids direct des heures d\'écran. Étirement franc mais jamais douloureux.',
  fig:{a:{hd:[50,24],nk:[52,34],hp:[54,60],kf:[50,76],ff:[48,91],kb:[60,76],fb:[64,91],ea:[66,32],ha:[70,22],props:[{t:'bar',at:[74,14],to:[74,90]}]},b:{hd:[46,24],nk:[48,34],hp:[52,60],kf:[48,76],ff:[46,91],kb:[58,76],fb:[62,91],ea:[64,32],ha:[70,22],props:[{t:'bar',at:[74,14],to:[74,90]}]}}},
 'chat-vache':{nom:'Chat-vache',en:'Cat-cow',mus:'Mobilité colonne',type:'stretch',dur:45,
  desc:['À quatre pattes, alterne lentement dos rond (menton rentré, expire) et dos creusé (regard devant, inspire).','Mouvement fluide, au rythme de la respiration.'],
  vig:'<b>Dos :</b> reste dans une amplitude confortable, surtout côté dos creusé.',
  fig:{a:{hd:[22,56],nk:[32,54],hp:[70,54],kf:[70,72],ff:[70,90],ea:[32,72],ha:[32,90]},b:{hd:[22,46],nk:[32,52],hp:[70,52],kf:[70,72],ff:[70,90],ea:[32,72],ha:[32,90]}}},
 'etir-hanches':{nom:'Étirement fléchisseurs de hanche',en:'Hip flexor stretch',mus:'Avant de hanche, psoas',type:'stretch',dur:60,bilat:true,
  desc:['En fente, genou arrière posé au sol (coussin dessous).','Avance doucement le bassin en serrant le fessier arrière, buste droit. 30 s par côté, en soufflant lentement.'],
  vig:'<b>Dos :</b> ne creuse pas les lombaires : le mouvement vient du bassin qui avance.',
  fig:{a:{hd:[52,26],nk:[52,36],hp:[52,62],kf:[64,70],ff:[66,90],kb:[38,78],fb:[24,84],ea:[58,48],ha:[60,58]},b:{hd:[56,26],nk:[56,36],hp:[56,62],kf:[68,70],ff:[68,90],kb:[42,80],fb:[26,86],ea:[62,48],ha:[64,58]}}},
 'etir-ischios':{nom:'Étirement ischios doux',en:'Hamstring stretch',mus:'Arrière de cuisse',type:'stretch',dur:60,bilat:true,
  desc:['Talon posé sur une marche basse, jambe presque tendue.','Penche-toi vers l\'avant DEPUIS les hanches, dos plat, jusqu\'à l\'étirement. 30 s par jambe, en soufflant lentement.'],
  vig:'<b>Dos :</b> dos plat obligatoire : c\'est la bascule du bassin qui étire, pas l\'arrondi du dos.',
  fig:{a:{hd:[42,28],nk:[44,38],hp:[48,62],kf:[44,76],ff:[42,91],kb:[62,70],fb:[76,74],ea:[52,50],ha:[56,60],props:[{t:'box',at:[70,74],w:20,h:19}]},b:{hd:[36,36],nk:[40,44],hp:[48,62],kf:[44,76],ff:[42,91],kb:[62,70],fb:[76,74],ea:[48,56],ha:[54,64],props:[{t:'box',at:[70,74],w:20,h:19}]}}},
 'posture-enfant':{nom:'Posture de l\'enfant',en:'Child\'s pose',mus:'Dos, épaules, détente',type:'stretch',dur:45,
  desc:['À genoux, fesses sur les talons, bras tendus loin devant, front vers le sol.','Respire profondément, laisse le dos s\'allonger.'],
  vig:'Clôture parfaite : détente complète de la colonne.',
  fig:{a:{hd:[22,80],nk:[32,76],hp:[64,72],kf:[74,84],ff:[86,88],ea:[20,84],ha:[8,88]},b:{hd:[22,80],nk:[32,76],hp:[64,72],kf:[74,84],ff:[86,88],ea:[20,84],ha:[8,88]}}}
};

```
## `app3.js`

Surcouche de progression, viviers, besoins matériels, table de substitution, schémas moteurs, étapes d'échauffement, XP, rangs, badges et avancement des badges non acquis.

739 lignes, 62501 octets.

```javascript
/* ============ CONFIGURATION PROGRESSION (surcouche) ============
   mode  : 'load'   charge ajustable, double progression reps puis charge
           'fixed'  charge non ajustable (kettlebell 10 kg), progression en reps
           'bw'     poids du corps, progression en reps jusqu'au haut de fourchette
           'time'   tenue chronometree
           'circuit' cardio par rounds
           'stretch' etirement chronometre
   reps  : [bas, haut] de la fourchette de travail. Sur bw et time, le haut EST
           le plafond : au-dela, c est la marche ecrite dans NEXT qui prend le
           relais, successeur verrouille ou consigne manuelle.
   cat   : emplacement dans le circuit alterne
   v2.16 : le champ cap disparait. Il ne portait plus qu une copie du haut de
   fourchette, ou pire un nombre au-dessus, et un cap au-dessus du haut faisait
   « relever » la fourchette d un cran a chaque passage au plafond, 6-12 puis
   7-13 puis 8-14 : du +1 lineaire habille en fourchette, sans nature
   d exercice, que le carnet avait deja nomme relevements fantomes en v2.5 et
   v2.13 sans le generaliser. Onze entrees etaient encore dans ce cas, 39
   marches que personne n avait choisies. Le mecanisme est retire du moteur,
   aucune donnee ne peut plus le declencher, et test43 l interdit.
*/
/* v2.22 : cadence commune a la lignee du pont fessier, voir 'pont-fessier' */
const PONT_CAD={monte:1.5,tenue:1,descente:2,etab:0,reprise:true};
/* exercices cadences qui ont ete des tenues en secondes : la migration v2.19
   ne concerne qu eux (v2.22) */
const CAD_DEPUIS_SECONDES=['gainage-lateral-jambe-levee'];
const CFG={
 'pompes-poignees':{cat:'push',mode:'bw',reps:[6,15],sets:3,bnd:'res',bnd0:true,band0:'aucune'},
 'pompes-inclinees':{cat:'push',mode:'bw',reps:[8,20],sets:3},
 'developpe-sol':{cat:'push',mode:'load',reps:[8,12],sets:3,load0:6},
 'elevations-laterales':{cat:'push',mode:'load',reps:[12,20],sets:3,load0:2},
 'face-pulls':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'jaune'},
 'tirage-doux':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'jaune'},
 'rowing-elastique':{cat:'pull',mode:'band',pos:true,reps:[10,18],sets:3,bnd:'res',band0:'rouge'},
 'rowing-kettlebell':{cat:'pull',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10},
 'rowing-suspension':{cat:'pull',mode:'bw',reps:[8,15],sets:3},
 'curls-halteres':{cat:'pull',mode:'load',reps:[10,20],sets:3,load0:4},
 'goblet-squat':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 'box-squat':{cat:'legs',mode:'bw',reps:[8,15],sets:3},
 'fentes-arriere':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 /* v2.1 : la marche suivante des fentes etait documentee depuis la v1.2, « prends
    un haltere dans chaque main », et n etait pas outillee. Elle l est, sur le
    motif de l escalier de gainage : le successeur retire son predecesseur du
    tirage a son deblocage, si bien que le vivier jambes garde CINQ entrees
    tirables dans les deux etats de verrou et qu aucune frequence ne bouge.
    Verrou a deux series au plafond, comme les deux successeurs de gainage.
    v2.16 : le plafond des fentes vaut le haut de leur fourchette, 15 par cote,
    et non 18. Le 18 ecrit ici en v2.1 « valait deja » n avait ete choisi par
    personne : c etait le cap fantome, herite et lu comme un fait. */
 'fentes-arriere-lestee':{retire:'fentes-arriere',cat:'legs',mode:'load',reps:[8,15],sets:2,side:true,load0:2,
   lock:{after:'fentes-arriere',cond:'Fais {n} séries de 15 fentes arrière par côté',need:15,minSets:2}},
 'step-ups':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 /* Lot catalogue v2.0. Ces sept exercices entrent dans DB et CFG HORS des
    viviers, exactement comme les replis douleur : le tirage ne les voit pas,
    seule la bibliotheque les affiche. Ils sont inertes jusqu a l existence du
    resolveur, qui les convoque par la table SUBS. Un substitut ne porte ni
    verrou, ni retrait, ni position propre : il herite de l eligibilite de la
    position qu il resout. */
 'step-ups-bas':{cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true},
 'retraction-scapulaire':{cat:'pull',mode:'bw',reps:[8,15],sets:3},
 'ecartement-elastique':{cat:'pull',mode:'band',reps:[10,18],sets:3,bnd:'res',band0:'jaune',pos:true},
 'tirage-vertical-elastique':{cat:'pull',mode:'band',reps:[8,15],sets:3,bnd:'res',band0:'rouge',pos:true},
 'elevations-laterales-elastique':{cat:'push',mode:'band',reps:[12,20],sets:3,bnd:'res',band0:'jaune',pos:true},
 'curls-elastique':{cat:'pull',mode:'band',reps:[10,20],sets:3,bnd:'res',band0:'rouge',pos:true},
 'rdl-elastique':{cat:'legs',mode:'band',reps:[8,15],sets:3,bnd:'res',band0:'rouge',pos:true},
 /* Escalier des mollets (v2.5). Le plafond descend de 30 a 25 : a 30 il
    fabriquait cinq relevements de fourchette, 12-25 puis 13-26 jusqu a 17-30,
    qui ne sont pas une progression mais le seul levier qui restait au moteur
    faute d echelle branchee. Plafond egal au haut de fourchette, comme la
    planche et le gainage lateral : la fourchette ne monte jamais, une seule
    marche s affiche, et le successeur prend le relais.
    Quatre echelons, chacun retirant son predecesseur, donc CINQ entrees
    tirables dans le vivier jambes quel que soit l etat des verrous, comme pour
    les fentes et le gainage. Charge par mollet a 78 kg de poids de corps :
    39 kg a deux jambes, 44 / 49 / 54 / 59 avec le sac, 78 sur une jambe, puis
    88 / 98 / 108 / 118. Le plus grand saut vaut +32 %, la ou passer directement
    du poids du corps a une jambe en valait +100 %.
    L amplitude n entre pas dans l escalier : la marche est une instruction de
    fiche et non une ressource, l outil ne suit l amplitude nulle part, ni la
    profondeur de squat ni celle des pompes, et la marche suivante du tirage en
    suspension est deja une amplitude non outillee. */
 'mollets-debout':{cat:'legs',mode:'bw',reps:[12,25],sets:2},
 'mollets-debout-leste':{retire:'mollets-debout',cat:'legs',mode:'fixed',reps:[12,25],sets:2,load0:10,
   lock:{after:'mollets-debout',cond:'Fais {n} séries de 25 mollets debout',need:25,minSets:2}},
 /* Le verrou lit la charge en plus des repetitions, ce qu aucun verrou ne
    savait faire avant la v2.5 : sans cette condition il se serait ouvert des
    25 repetitions au premier barreau, a 10 kg, et les barreaux 20, 30 et 40 de
    la version bilaterale n auraient jamais ete joues.
    La charge exigee est le DERNIER barreau de l echelle disponible, pas un
    nombre pose : 40 kg pour un inventaire complet, 10 kg pour qui ne declare
    qu une kettlebell de dix. Difference assumee avec le verrou des tractions
    strictes, qui lit lui l echelle entiere et non l echelle filtree par
    l inventaire : la-bas la bande la plus dure EST la preuve, ici l exercice
    debloque ne demande aucun materiel et exiger du materiel pour l ouvrir
    enfermerait un inventaire pauvre dans un etat dont il ne pourrait plus
    sortir. */
 'mollets-une-jambe':{retire:'mollets-debout-leste',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,
   lock:{after:'mollets-debout-leste',cond:'Fais {n} séries de 25 mollets debout lestés au dernier cran de charge',need:25,minSets:2,loadTop:true}},
 'mollets-une-jambe-leste':{retire:'mollets-une-jambe',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,
   lock:{after:'mollets-une-jambe',cond:'Fais {n} séries de 15 mollets sur une jambe par côté',need:15,minSets:2}},
 'rdl-kettlebell':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 /* Escalier du pont fessier (v2.13). Deuxieme vraie impasse recensee en v2.5,
    meme profil que les mollets debout : un plafond a 25 pour une fourchette
    10-20 fabriquait cinq relevements fantomes, et la marche ecrite, passer sur
    une jambe, valait +100 % par jambe. Le plafond vaut desormais le haut de
    fourchette et l exercice ouvre sur un successeur.
    Deux barreaux lestes suffisent la ou les mollets en demandaient quatre,
    parce que la charge posee sur le bassin monte de l amplitude entiere quand
    le poids du corps n en monte que la moitie : voir l echelle des hanches.
    Sauts obtenus, en resistance par jambe : +33 %, +25 %, puis +21 % pour le
    passage sur une jambe.
    L amplitude reste hors de l escalier. Le pied sureleve vaut environ +45 %,
    soit le meme ordre que le hip thrust et pour la meme raison, donc un doublon
    moins stable ; il vit dans la fiche, comme la hauteur de marche des mollets.
    Ce que step-ups et step-ups-bas montrent est autre chose : deux hauteurs
    servies comme deux ressources, sans qu aucun verrou ne compare jamais des
    repetitions faites sur l une et sur l autre.
    Pas de pont-fessier-une-jambe-leste : a +10 kg il rendrait +33 % puis
    laisserait +12 % au hip thrust, deux barreaux colles au prix d une fiche et
    d une traversee de fourchette. Il reste l intermediaire a inserer si
    l entree dans le hip thrust se revele trop raide a l usage. */
/* v2.22 : le pont fessier et sa lignee en repetitions cadencees. Sur le dos,
    ou les epaules sur un banc, l ecran ne se voit pas : c est le critere qui a
    mis bird-dog, dead bug et abductions au son. La fiche prescrivait deja trois
    temps, monter, marquer un temps en haut, redescendre lentement, que rien
    n imposait ; accelerer un pont, c est finir en cambrant. Montee 1,5 s, tenue
    1 s, descente 2 s, cycle de 4,5 s : 20 repetitions font 90 s, contre environ
    5,4 s par repetition mesurees le 22 septembre 2026 sans son. Valeurs de
    depart proposees par Claude, a eprouver. Pas d etablissement, le decompte
    enchaine comme au bird-dog. Reprise, decision de Gabriel : rien n est
    continu, une pause en bas est un repos. */
 'pont-fessier':{cat:'legs',mode:'bw',reps:[10,20],sets:3,cadence:PONT_CAD},
 'pont-fessier-leste':{retire:'pont-fessier',cat:'legs',mode:'fixed',reps:[10,20],sets:3,load0:10,cadence:PONT_CAD,
   lock:{after:'pont-fessier',cond:'Fais {n} séries de 20 ponts fessiers',need:20,minSets:2}},
 'pont-fessier-une-jambe':{retire:'pont-fessier-leste',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,cadence:PONT_CAD,
   lock:{after:'pont-fessier-leste',cond:'Fais {n} séries de 20 ponts fessiers lestés au dernier cran de charge',need:20,minSets:2,loadTop:true}},
 'hip-thrust-une-jambe':{retire:'pont-fessier-une-jambe',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,cadence:PONT_CAD,
   lock:{after:'pont-fessier-une-jambe',cond:'Fais {n} séries de 15 ponts fessiers sur une jambe par côté',need:15,minSets:2}},
 'hip-thrust-une-jambe-leste':{retire:'hip-thrust-une-jambe',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,cadence:PONT_CAD,
   lock:{after:'hip-thrust-une-jambe',cond:'Fais {n} séries de 15 hip thrusts sur une jambe par côté',need:15,minSets:2}},
 /* Escalier du squat (v2.18). Le goblet squat plafonnait a la kettlebell la
    plus lourde : au-dessus, des lestes de poignets a deux kilos, soit environ
    2 % de la charge sur les cuisses (78 kg + kettlebell), et une marche
    ecrite, le sac porte devant, qui rendait la charge aux avant-bras. Avec ce
    materiel, la seule vraie suite est de passer sur une jambe.
    Premier barreau, le squat sur une jambe vers une chaise : la chaise borne
    la profondeur, contrainte genoux du carnet appliquee par construction. Par
    jambe, ordres de grandeur non mesures : 47 kg au goblet squat a 16 kg, 66 a
    70 kg ici, soit +41 a +49 %, dans le precedent de l entree du hip thrust
    (+50 %, absorbe par le retour au bas de fourchette). Le verrou lit la
    kettlebell la plus lourde, sans lestes : a 22 kg le saut ne perdait que
    neuf points, au prix de trois barreaux inutiles.
    La hauteur d assise est un palier du meme exercice, pas une fiche : meme
    image, memes positions, comme la tenue du bird-dog (decision tranchee).
    Deux barreaux, 50 puis 40 cm, les deux butees d un fauteuil de bureau,
    retrouvees a l identique ; essai de Gabriel le 15 septembre 2026 : 50 cm
    fait deja travailler, 40 cm pas trois repetitions d affilee. Des crans de
    2,5 cm ont ete proposes et refuses : a 15 repetitions a 50 cm, les muscles
    sont prets pour 8 a 40. Si l entree a 40 est trop raide, le filet de
    securite remonte la chaise.
    Second barreau, la version lestee a 40 cm, kettlebell tenue devant, par
    kettlebells seules : 10 puis 16 kg, la suite se decidera la. Le contrepoids
    qui facilite le mouvement de ceux que l equilibre limite n est pas un
    risque de marche descendante ici : apres 2 x 15 a 40 cm, la limite est
    musculaire.
    Pistol complet ecarte, pour la flexion lombaire qui l accompagne souvent en
    bas du mouvement et la profondeur non bornee, pas pour la cheville. */
 'squat-une-jambe-chaise':{retire:'goblet-squat',cat:'legs',mode:'bw',reps:[8,15],sets:2,side:true,
   assise:{ladder:[[50,8,15],[40,8,15]]},
   lock:{after:'goblet-squat',cond:'Fais {n} séries de 15 goblet squats avec ta kettlebell la plus lourde, sans lestes',need:15,minSets:2,kbTop:true}},
 'squat-une-jambe-chaise-leste':{retire:'squat-une-jambe-chaise',cat:'legs',mode:'fixed',reps:[8,15],sets:2,side:true,load0:10,kbSeules:true,
   lock:{after:'squat-une-jambe-chaise',cond:'Fais {n} séries de 15 squats sur une jambe par côté, assise à 40 cm',need:15,minSets:2,rungTop:true}},
 'kb-swings':{cat:'legs',mode:'fixed',reps:[8,15],sets:3,load0:10},
 /* Tenues rythmees (v2.17). La tenue de chaque repetition est le palier de
    l exercice, et l outil la rythme au son. Trois barreaux [tenue, bas, haut]
    par cote : 3 s sur 6-12, 6 s sur 4-8, 10 s sur 3-6, tenue cumulee par cote
    au haut 36, 48 puis 60 s. Bascule de 2 s entre deux tenues, constante
    d exercice et non reglage : a 1 s la bascule devient un balancement. Le
    premier barreau est la consigne actuelle des fiches, 3 + 2 = 5 s vaut le
    tempo modelise jusqu ici, la migration est donc neutre : fourchette, cible
    et memoire conservees, p.tenue absent vaut 3. Le mode reste bw : c est un
    exercice en repetitions dont chaque repetition est une tenue, la
    progression se lit en repetitions et l echelle joue le role de la bande. */
 'bird-dog':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:2,ladder:[[3,6,12],[6,4,8],[10,3,6]]}},
 'dead-bug':{cat:'core',mode:'bw',reps:[6,12],sets:2,side:true,rhythm:{bascule:2,ladder:[[3,6,12],[6,4,8],[10,3,6]]}},
 'pallof-press':{cat:'core',mode:'band',pos:true,reps:[6,12],sets:2,side:true,bnd:'res',band0:'jaune'},
 'planche':{cat:'core',mode:'time',reps:[20,45],sets:2},
 'planche-ballon':{retire:'planche',cat:'core',mode:'time',reps:[15,45],sets:2,
   lock:{after:'planche',cond:'Tiens {n} séries de 45 s en planche au sol',need:45,minSets:2}},
 'gainage-lateral':{cat:'core',mode:'time',reps:[15,45],sets:2,side:true},
 /* v2.19 : la jambe ne se tient plus, elle monte et descend au son sur une
    planche tenue. C est la forme mesuree par Boren et al. 2011, la jambe
    tenue n ayant ete etudiee nulle part. Repetitions cadencees : montee et
    descente de 1,5 s, cycle de 3 s, 15 repetitions font 45 s de planche, le
    plafond des tenues au sol. etab : secondes de planche jambes serrees entre
    le zero du decompte, ou le bassin se decolle, et la premiere montee. Un
    cote entier puis l autre, jamais d alternance : changer de cote, c est se
    retourner. La progression est celle d un bw ordinaire, sans echelle. */
 'gainage-lateral-jambe-levee':{retire:'gainage-lateral',cat:'core',mode:'bw',reps:[8,15],sets:2,side:true,
   cadence:{monte:1.5,descente:1.5,etab:3},
   lock:{after:'gainage-lateral',cond:'Tiens {n} séries de 45 s en gainage latéral, côté faible compris',need:45,minSets:2}},
 'planche-genoux':{cat:'core',mode:'time',reps:[20,45],sets:2},
 'cardio-bas-impact':{cat:'cardio',mode:'circuit',reps:[4,10],sets:1},
 'marche-continue':{cat:'cardio',mode:'circuit',reps:[1,1],sets:1},
 'etir-nuque':{cat:'mob',mode:'stretch'},'etir-pecs':{cat:'mob',mode:'stretch'},
 'chat-vache':{cat:'mob',mode:'stretch'},'etir-hanches':{cat:'mob',mode:'stretch'},
 'etir-ischios':{cat:'mob',mode:'stretch'},'posture-enfant':{cat:'mob',mode:'stretch'}
};

/* --- trois exercices complementaires : tirage horizontal, gainage lateral, fessiers --- */
DB['rowing-suspension']={
 nom:'Tirage en suspension',en:'Inverted row',mus:'Milieu du dos, arrière d\'épaules, biceps',
 desc:['Sangles accrochées à la barre de traction, poignées tenues bras tendus, corps gainé en ligne droite des épaules aux talons.',
       'Recule les pieds pour amener le corps à environ 30° du sol, comme sur le dessin : c\'est l\'inclinaison de travail.',
       'Tire les poignées vers les côtes, coudes près du corps, omoplates serrées, souffle en tirant, puis redescends lentement.'],
 vig:'<b>Dos :</b> le corps reste une planche, ne laisse pas le bassin s\'affaisser. <b>Inclinaison :</b> vise environ 30° par rapport au sol ; plus tu es horizontal, plus c\'est dur. <b>Progression :</b> au plafond de répétitions, avance les pieds de quelques centimètres plutôt que d\'en faire plus.',
 fb:'rowing-elastique'};
DB['gainage-lateral']={
 nom:'Gainage latéral',en:'Side plank',mus:'Obliques, carré des lombes, stabilité du bassin',
 desc:['Sur le côté, en appui sur l\'avant-bras, coude sous l\'épaule, jambes tendues l\'une sur l\'autre.',
       'Décolle le bassin pour former une ligne droite de la tête aux pieds, et tiens.',
       'Le chrono s\'arrête dès que le bassin descend. Fais l\'autre côté.'],
 fin:'la hanche qui descend. Une tenue finit quand la ligne casse, pas quand le chrono paraît court.',
 vig:'<b>Dos :</b> pièce maîtresse pour les lombaires fragiles, aucune flexion de colonne. Si c\'est trop dur, plie les genoux et prends appui dessus : la version genoux compte pleinement. <b>Épaules :</b> pousse le sol avec l\'avant-bras et garde l\'épaule loin de l\'oreille, sans t\'affaisser dedans. La version genoux allège aussi l\'épaule. <b>Respiration :</b> ne bloque jamais, souffle lentement pendant la tenue.'};
DB['pont-fessier']={
 nom:'Pont fessier',en:'Glute bridge',mus:'Fessiers, ischios, bas du dos',
 desc:['Allongé sur le dos, genoux pliés, pieds à plat au sol écartés de la largeur des hanches, bras le long du corps.',
       'Pousse dans les talons pour décoller le bassin jusqu\'à aligner genoux, hanches et épaules.',
       'Serre fort les fessiers en haut en soufflant, marque un temps, redescends lentement sans poser complètement.'],
 fin:'le haut qui se gagne en cambrant. Dès que le bas du dos prend le relais des fessiers pour monter plus haut, la série est finie.',
 vig:'<b>Dos :</b> la poussée vient des fessiers, pas des lombaires : ne cherche pas à monter plus haut que l\'alignement. Des fessiers forts protègent directement ton bas du dos. <b>Progression :</b> au plafond, le pont fessier lesté prend le relais.'};

/* --- v2.13 : quatre marches de l escalier du pont fessier. Chacune retire son
   predecesseur du tirage a son deblocage, et les quatre replient sur le pont au
   sol, seul maillon sans verrou : un repli douleur doit rester atteignable a
   tout instant, motif impose par test11 aux mollets en v2.5. --- */
DB['pont-fessier-leste']={
 nom:'Pont fessier lesté',en:'Weighted glute bridge',mus:'Fessiers, ischios, bas du dos',
 desc:['Même position qu\'au sol, une charge posée en travers du pli de la hanche, sur le haut des cuisses, une serviette pliée dessous.',
       'Tiens la charge à deux mains pendant toute la série : elle ne doit jamais glisser vers le ventre.',
       'Pousse dans les talons jusqu\'à aligner genoux, hanches et épaules, souffle en montant, redescends lentement sans poser complètement.'],
 fin:'le haut qui se gagne en cambrant, ou la charge qui glisse. Si la charge bouge, c\'est le montage qui est à sa limite, pas les fessiers.',
 vig:'<b>Dos :</b> même règle qu\'au sol, aucune cambrure pour gagner de la hauteur. <b>Charge :</b> jamais sur le ventre ni sur l\'os du pubis à nu ; une kettlebell posée à plat est plus stable qu\'un sac, qui se déplace latéralement. <b>Progression :</b> l\'échelle s\'arrête à 20 kg, le pont sur une jambe prend le relais.',
 fb:'pont-fessier'};
DB['pont-fessier-une-jambe']={
 nom:'Pont fessier sur une jambe',en:'Single-leg glute bridge',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Allongé sur le dos, un pied à plat au sol, l\'autre jambe décollée, genou plié, cuisse dans l\'axe de la cuisse d\'appui.',
       'Pousse dans le talon d\'appui pour aligner genou, hanche et épaules, souffle en montant.',
       'Les deux hanches restent à la même hauteur pendant toute la montée. Fais l\'autre côté.'],
 fin:'le bassin qui tourne, ou le haut qui se gagne en cambrant. Une hanche qui descend d\'un côté finit la série, quel que soit le compte.',
 vig:'<b>Dos :</b> aucune cambrure en haut, la poussée vient du fessier d\'appui. <b>Bassin :</b> ne ramène pas le genou libre sur la poitrine, il ferait travailler la hanche libre et masquerait la bascule du bassin. <b>Amplitude :</b> pied d\'appui sur une marche basse pour aller plus loin ; l\'outil ne suit pas cette variante, elle ne change pas ta cible.',
 fb:'pont-fessier'};
DB['hip-thrust-une-jambe']={
 nom:'Hip thrust sur une jambe',en:'Single-leg hip thrust',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Assis au sol devant une assise stable à hauteur de genou, le haut du dos appuyé contre le bord, sous les omoplates.',
       'Un pied à plat au sol, l\'autre jambe décollée, genou plié. Menton rentré, côtes basses.',
       'Monte le bassin jusqu\'à ce que le tronc soit horizontal, tibia d\'appui vertical, souffle en montant, puis redescends lentement. Fais l\'autre côté.'],
 fin:'le haut qui se gagne en cambrant, ou le bassin qui tourne. La série finit là, pas quand le compte est atteint.',
 vig:'<b>Cou et épaules :</b> l\'appui va sous les omoplates, jamais sur la nuque ni sur une arête vive, et l\'assise doit être calée contre un mur. <b>Dos :</b> l\'amplitude est plus grande qu\'au sol, c\'est elle qui rend l\'exercice plus dur ; en haut on s\'arrête à l\'alignement, on ne cambre pas. <b>Progression :</b> le hip thrust lesté prend le relais.',
 fb:'pont-fessier'};
DB['hip-thrust-une-jambe-leste']={
 nom:'Hip thrust sur une jambe lesté',en:'Weighted single-leg hip thrust',mus:'Fessiers, ischios, stabilité du bassin',
 desc:['Même installation, charge posée en travers du pli de la hanche avec une serviette pliée dessous, posée avant de s\'installer.',
       'Tiens la charge à deux mains pendant toute la série, un pied à plat au sol, l\'autre jambe décollée, genou plié.',
       'Monte jusqu\'à l\'horizontale du tronc en soufflant, redescends lentement. Fais l\'autre côté.'],
 fin:'le haut qui se gagne en cambrant, le bassin qui tourne, ou la charge qui glisse.',
 vig:'<b>Cou et épaules :</b> appui sous les omoplates, assise calée contre un mur. <b>Charge :</b> posée avant de s\'installer, jamais attrapée une fois en position, et tenue à deux mains. <b>Dos :</b> aucune cambrure en haut. <b>Progression :</b> pas de marche outillée au-delà.',
 fb:'pont-fessier'};
DB['squat-une-jambe-chaise']={
 nom:'Squat sur une jambe vers la chaise',en:'Single-leg box squat',mus:'Cuisses, fessiers, stabilité du genou et du bassin',
 desc:['Chaise stable derrière toi, assise à la hauteur indiquée par l\'outil, 50 puis 40 cm. Debout sur une jambe, un petit pas devant, l\'autre jambe tendue devant, talon juste au-dessus du sol, bras tendus devant toi.',
       'Descends lentement en poussant les fesses vers l\'arrière, genou d\'appui dans l\'axe du pied, jusqu\'à effleurer l\'assise sans t\'y poser.',
       'Remonte sans élan en poussant dans le talon, souffle en montant. Enchaîne les répétitions sans t\'asseoir, puis fais l\'autre côté.'],
 fin:'le buste qui balance pour remonter, le genou qui rentre, ou l\'assise sur laquelle tu te laisses tomber. La série finit là, pas quand le compte est atteint.',
 vig:'<b>Genoux :</b> le genou d\'appui suit l\'axe du pied, jamais vers l\'intérieur, et la chaise fixe la profondeur : pas plus bas qu\'elle. <b>Dos :</b> le buste se penche depuis les hanches, dos droit, sans enrouler le bas du dos en bas du mouvement. <b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur ou un meuble ; toujours le même, repéré aux mêmes hauteurs. <b>Respiration :</b> souffle en remontant, ne bloque pas. <b>Progression :</b> 50 cm puis 40 cm, puis la version lestée.',
 fb:'box-squat'};
DB['squat-une-jambe-chaise-leste']={
 nom:'Squat sur une jambe vers la chaise lesté',en:'Weighted single-leg box squat',mus:'Cuisses, fessiers, stabilité du genou et du bassin',
 desc:['Même installation, assise à 40 cm. Tiens la kettlebell à deux mains par les cornes, collée au sternum, coudes vers le bas.',
       'Descends lentement jusqu\'à effleurer l\'assise, genou d\'appui dans l\'axe du pied, la kettlebell toujours contre la poitrine.',
       'Remonte sans élan en soufflant, sans t\'asseoir entre deux répétitions, puis fais l\'autre côté.'],
 fin:'le buste qui balance, le genou qui rentre, la kettlebell qui s\'écarte de la poitrine, ou l\'assise sur laquelle tu te laisses tomber.',
 vig:'<b>Genoux :</b> genou d\'appui dans l\'axe du pied, pas plus bas que la chaise. <b>Dos :</b> dos droit, la charge reste devant, jamais sur les épaules ni dans le dos. <b>Charge :</b> kettlebells seules, sans lestes aux poignets. <b>Chaise :</b> un siège qui ne roule ni ne pivote, ou calé contre un mur. <b>Respiration :</b> souffle en remontant, ne bloque pas.',
 fb:'box-squat'};

/* --- v1.17 : deuxieme marche de l escalier de gainage. Les deux tenues au sol
   plafonnent a 45 s, leur fourchette ne monte jamais, et jusqu ici rien ne
   prenait le relais : c etait le cul-de-sac du carnet. Chaque successeur reste
   isometrique, ne demande aucune flexion de colonne, et retire son predecesseur
   du tirage a son deblocage. --- */
DB['planche-ballon']={
 nom:'Planche sur ballon',en:'Swiss ball plank',mus:'Gainage complet, stabilisateurs profonds',
 desc:['Avant-bras posés sur le dessus du ballon, coudes sous les épaules, mains jointes ou poings côte à côte.',
       'Installe-toi d\'abord à genoux, puis tends les jambes une par une : pointes de pieds au sol, corps aligné des épaules aux talons.',
       'Le ballon bouge en permanence, ton travail est de l\'empêcher de bouger. Le chrono s\'arrête dès que le bassin descend ou que les avant-bras glissent.'],
 vig:'<b>Dos :</b> l\'instabilité remplace le levier, aucune flexion de colonne ajoutée. <b>Ballon :</b> gonflé ferme, c\'est le gonflage qui fixe la difficulté ; un ballon mou rend l\'exercice plus facile, pas plus dur. <b>Respiration :</b> ne bloque jamais, souffle lentement pendant la tenue. <b>Épaules :</b> si l\'appui tire sur l\'épaule, redescends à la planche au sol pour la séance.',
 fb:'planche'};
DB['gainage-lateral-jambe-levee']={
 nom:'Gainage latéral, abductions',en:'Side plank with hip abduction',mus:'Obliques, carré des lombes, moyen fessier',
 desc:['Sur le côté, en appui sur l\'avant-bras, coude sous l\'épaule, jambes tendues l\'une sur l\'autre.',
       'Au double bip, décolle le bassin et établis la ligne de la tête aux pieds. Au bip aigu, monte la jambe du dessus en 1,5 s jusqu\'à environ 35°, pied dans l\'axe du corps, en soufflant ; au bip grave, redescends-la en 1,5 s jusqu\'à effleurer l\'autre jambe, sans t\'y reposer.',
       'Une répétition compte jambe revenue. Arrête dès que la ligne casse, puis fais l\'autre côté.'],
 fin:'le bassin qui descend ou qui part en arrière. Dès que la ligne casse, Stop, quel que soit le compte.',
 vig:'<b>Dos :</b> le tronc reste immobile, seule la hanche bouge ; aucune flexion de colonne. Si le bassin part en arrière, baisse la jambe plutôt que de tourner. <b>Hanche :</b> lève à hauteur confortable, une jambe trop haute fait travailler le tenseur du fascia lata et bascule le bassin. <b>Épaules :</b> même appui que la version au sol, pousse le sol avec l\'avant-bras et garde l\'épaule loin de l\'oreille, sans t\'affaisser dedans. <b>Respiration :</b> ne bloque jamais, souffle régulièrement pendant la série.',
 fb:'gainage-lateral'};

/* --- quatre variantes de tractions a partir des deux entrees d origine --- */
(function buildPullups(){
  const A=DB['tractions-assistees'], S=DB['tractions-strictes'];
  DB['tractions-assistees-supination']=Object.assign({},A,{
    nom:'Tractions assistées, supination',en:'Band-assisted chin-ups',
    desc:['Élastique passé sur la barre, pied ou genou dedans. Prise en supination, paumes vers toi, largeur épaules.',
          'Tire jusqu\'à amener le menton au niveau de la barre, coudes vers le bas, souffle en tirant.',
          'Descends lentement en 2-3 s, bras presque tendus en bas.']});
  DB['tractions-assistees-pronation']=Object.assign({},A,{
    nom:'Tractions assistées, pronation',en:'Band-assisted pull-ups',
    mus:'Grand dorsal, haut du dos',
    desc:['Même montage élastique, mais prise en pronation, paumes vers l\'avant, un peu plus large que les épaules.',
          'Tire en amenant la poitrine vers la barre, coudes vers le bas et légèrement écartés, souffle en tirant.',
          'Descends lentement, bras presque tendus en bas.'],
    vig:'<b>Épaules :</b> la pronation sollicite davantage le dos mais tire plus sur les épaules. Amplitude confortable uniquement, et arrête au moindre pincement.'});
  DB['tractions-strictes-supination']=Object.assign({},S,{
    nom:'Tractions strictes, supination',en:'Chin-ups',
    lock:{after:'tractions-assistees-supination',cond:'Atteins 10 tractions assistées supination sur une série avec ton élastique le plus fin',need:10,bandGate:true}});
  DB['tractions-strictes-pronation']=Object.assign({},S,{
    nom:'Tractions strictes, pronation',en:'Pull-ups',mus:'Grand dorsal, haut du dos',
    lock:{after:'tractions-assistees-pronation',cond:'Atteins 10 tractions assistées pronation sur une série avec ton élastique le plus fin',need:10,bandGate:true},
    vig:'<b>Épaules :</b> l\'exercice le plus exigeant du programme. Reste strict, pas de balancier, et descends contrôlé.'});
  delete DB['tractions-assistees']; delete DB['tractions-strictes'];
  Object.assign(CFG,{
    'tractions-assistees-supination':{cat:'pull',mode:'bw',reps:[4,10],sets:3,bnd:'ass',band0:'noir'},
    'tractions-assistees-pronation':{cat:'pull',mode:'bw',reps:[4,10],sets:3,bnd:'ass',band0:'noir',
      lock:{after:'tractions-assistees-supination',cond:'Fais {n} séries de 6 en supination avant d\'attaquer la pronation',need:6,minSets:3}},
    'tractions-strictes-supination':{retire:'tractions-assistees-supination',cat:'pull',mode:'bw',reps:[3,8],sets:3},
    'tractions-strictes-pronation':{retire:'tractions-assistees-pronation',cat:'pull',mode:'bw',reps:[3,8],sets:3}
  });
  DB['tractions-assistees-pronation'].lock=CFG['tractions-assistees-pronation'].lock;
})();
Object.keys(CFG).forEach(id=>{ if(DB[id]) Object.assign(DB[id],CFG[id]); });
/* marche suivante reelle de chaque exercice plafonne (decision carnet :
   pas de moteur generique, une marche propre a chacun) */
const NEXT={
 'pompes-inclinees':'passe aux pompes au sol',
 'box-squat':'passe au goblet squat',
 'planche-genoux':'passe à la planche complète',
 'rowing-suspension':'avance les pieds de quelques centimètres, corps plus proche de l\'horizontale',
 'fentes-arriere':'prends un haltère dans chaque main, le long du corps',
 'step-ups':'ajoute les lestes de chevilles, puis des haltères en mains',
 'step-ups-bas':'passe aux step-ups sur marchepied',
 'retraction-scapulaire':'marque une pause de 3 s omoplates serrées ; avec un élastique, l\'écartement prend le relais de lui-même',
 'mollets-debout':'les mollets debout lestés prennent le relais',
 'mollets-debout-leste':'les mollets sur une jambe prennent le relais',
 'mollets-une-jambe':'les mollets sur une jambe lestés prennent le relais',
 'mollets-une-jambe-leste':'pas de marche outillée au-delà',
 'pont-fessier':'le pont fessier lesté prend le relais',
 'pont-fessier-leste':'le pont fessier sur une jambe prend le relais',
 'pont-fessier-une-jambe':'le hip thrust sur une jambe prend le relais',
 'hip-thrust-une-jambe':'le hip thrust sur une jambe lesté prend le relais',
 'hip-thrust-une-jambe-leste':'pas de marche outillée au-delà',
 /* v2.17 : l allongement des tenues est devenu l echelle elle-meme, la marche
    ecrite est celle du dernier barreau, 10 s, que McGill n allonge pas. */
 'bird-dog':'au bout des tenues de 10 s, trace des carrés d\'au plus trente centimètres avec la main et le pied tendus, le bassin immobile ; jamais de lest ici',
 'dead-bug':'au bout des tenues de 10 s, tiens une résistance à deux mains, élastique ancré au sol derrière la tête ou haltère léger au-dessus de la poitrine, jambes seules en mouvement ; jamais de lest sur un membre',
 'planche':'la planche sur ballon prend le relais',
 'planche-ballon':'fais tourner lentement le ballon en petits cercles pendant la tenue ; l\'outil ne suit pas encore cette variante',
 'gainage-lateral':'le gainage latéral avec abductions prend le relais',
 /* v2.19 : plus de lest promis. A la cheville, le lest charge la hanche et
    presque pas le tronc ; la suite se decidera a part. */
 'gainage-lateral-jambe-levee':'pas de marche outillée au-delà ; la suite reste à décider',
 'tractions-strictes-supination':'lestes de chevilles en appoint fin ; sac ou gilet plus tard',
 'tractions-strictes-pronation':'lestes de chevilles en appoint fin ; sac ou gilet plus tard',
 'tractions-assistees-supination':'les tractions strictes prennent le relais',
 'tractions-assistees-pronation':'les tractions strictes prennent le relais',
 'pompes-poignees':'pieds surélevés à hauteur modérée, puis gilet lesté',
 'goblet-squat':'le squat sur une jambe vers la chaise prend le relais',
 'squat-une-jambe-chaise':'la version lestée prend le relais',
 'squat-une-jambe-chaise-leste':'sac lesté porté devant, jamais dans le dos',
 'rowing-kettlebell':'passe sur l\'haltère seul, tout le stock de disques sur une barre',
 'rdl-kettlebell':'pas de marche outillée au-delà',
 'kb-swings':'pas de marche outillée au-delà',
 'fentes-arriere-lestee':'squat bulgare avec haltères, en repartant vers 5 kg par main ; l\'outil ne le suit pas encore'
};
Object.keys(NEXT).forEach(id=>{ if(DB[id]) DB[id].next=NEXT[id]; });
/* Marche suivante des exercices a kettlebell (v2.1). Elle etait ecrite comme un
   fait, « plafond du materiel actuel », alors que le materiel est declare depuis
   la v2.0 : chez quelqu un qui n a pas encore declare la kettlebell suivante,
   la vraie marche est un achat ou une declaration, pas une impasse. Le texte se
   compose donc a l affichage, depuis l inventaire, et ne devient une impasse
   que lorsque la liste des poids est epuisee. */
/* v2.18 : le goblet squat sort de la liste, sa suite est desormais le squat
   sur une jambe, qui s ouvre a la kettlebell la plus lourde ; la version
   lestee y entre, son echelle n etant faite que de kettlebells. */
const KB_NEXT=['squat-une-jambe-chaise-leste','rdl-kettlebell','kb-swings','rowing-kettlebell'];
function nextFor(id,gear){
  const e=DB[id];
  if(!e) return '';
  if(KB_NEXT.indexOf(id)<0) return e.next||'';
  const g=gear||(typeof state!=='undefined'&&state?state.gear:null);
  const owned=kbOwned(g), top=owned.length?owned[owned.length-1]:0;
  const sup=KB_W.map(parseFloat).filter(w=>w>top);
  if(sup.length) return 'déclare une kettlebell de '+fmtNum(sup[0])+' kg quand tu l\'auras, l\'échelle la prendra toute seule';
  return e.next||'';
}
/* fallbacks mis a jour */
DB['tractions-assistees-supination'].fb='rowing-elastique';
DB['tractions-assistees-pronation'].fb='rowing-elastique';

/* ============ STRUCTURE DES SEANCES ============ */
/* mode alterne : 4 emplacements non concurrents, chacun avance dans son propre vivier */
const SLOTS={
 push:{label:'Poussé',pool:['pompes-poignees','elevations-laterales','developpe-sol']},
 pull:{label:'Tiré',pool:['tractions-assistees-supination','face-pulls','rowing-suspension','rowing-kettlebell','face-pulls','curls-halteres','tractions-assistees-pronation','tractions-strictes-supination','tractions-strictes-pronation']},
 legs:{label:'Jambes',pool:['goblet-squat','squat-une-jambe-chaise','squat-une-jambe-chaise-leste','fentes-arriere','fentes-arriere-lestee','pont-fessier','pont-fessier-leste','pont-fessier-une-jambe','hip-thrust-une-jambe','hip-thrust-une-jambe-leste','mollets-debout','mollets-debout-leste','mollets-une-jambe','mollets-une-jambe-leste','step-ups','rdl-kettlebell','kb-swings']},
 /* v1.17 : chaque successeur est place juste apres son predecesseur, qu il
    retire a son deblocage. Le vivier filtre vaut donc cinq entrees dans les
    quatre etats de verrous, dans le meme ordre : la substitution se fait sur
    place et n allonge jamais l intervalle entre deux passages. */
 core:{label:'Gainage',pool:['planche','planche-ballon','bird-dog','gainage-lateral','gainage-lateral-jambe-levee','dead-bug','pallof-press']}
};
/* v2.7 : l ordre du circuit passe de poussé, tiré, jambes, gainage a poussé,
   tiré, gainage, jambes. Le circuit est CIRCULAIRE, le dernier exercice d un
   tour precede le premier du tour suivant : quatre adjacences, six ordres
   distincts et non vingt-quatre. Mesure sur toutes les combinaisons des
   viviers, deux etats de verrous et deux hypotheses sur l enchainement pousse
   vers tire, script ordre-circuit.js : l ordre d origine sortait cinquieme sur
   six dans le modele de base, et le restait sur 254 des 256 jeux de marqueurs
   testes. Celui-ci n est derriere lui dans aucun des quatre scenarios et il est
   premier dans trois. Il supprime l adjacence jambes vers gainage, soit
   l interference par les erecteurs relevee a l audit v1.6, et il referme le
   tour par jambes vers pousse, quatre des sept exercices jambes ne chargeant
   rien du haut du corps. Il ne touche ni la selection, ni la rotation, ni les
   frequences, ni les verrous : le tirage est inchange, seule la sequence
   bouge.
   v2.10 : pousse, jambes, tire, gainage. Deux corrections a la mesure v2.7.
   D abord un defaut de rapport : les six ordres forment trois paires miroir,
   conflits(a,b) etant symetrique, donc l ordre v2.7 n etait jamais meilleur
   SEUL, toujours ex aequo avec son miroir. Ensuite la premisse d independance
   des quatre emplacements, fausse sur l epaule : au moins un poste marque
   epaule=3 dans 100 % des 450 quatuors de l etat de depart, deux ou plus dans
   68 %, moyenne 1,93 sur 4.
   Ce que l ordre fait : il protege le face pull, dont le predecesseur
   conflictuait dans 67 % des quatuors en P,U,C,L et dans 13 % ici. Ce qu il
   coute : il cree une adjacence gainage vers pousse a 80 %, et le total passe
   de 1,43 a 1,53 conflit par seance. L ordre SEUL est donc une regression
   mesuree, et il n est jamais livre seul : la pause au raccord de tour ramene
   le total a 0,73. Les deux sont indissociables, voir PAUSE_TOUR.
   Inchange : selection, rotation, frequences, verrous, modele de temps. */
/* ============ COMMENT CA MARCHE (v2.12, reecrit en v2.14) ============
   Un seul texte, revele progressivement. Quatre blocs courts, chacun portant
   son developpement replie sur place : pas de deuxieme version longue avec un
   selecteur, qui demanderait de choisir avant de savoir ce qu il y a dans
   l autre et imposerait de tenir deux textes qui divergeraient.
   Le meme tableau sert l accueil et la section de Reglages : un seul chemin,
   donc aucun risque que les deux se mettent a dire autre chose.
   La v2.12 comblait trois trous recenses au carnet : la phase de calibration,
   le critere de fin de serie et la regle d or « renseigne-toi sur l exercice
   avant de le faire ». La v2.14 en comble un quatrieme, mis au jour par une
   lecture de Gabriel : la regle de cible, mecanisme permanent, vivait sous la
   calibration, qui est une phase, et rien ne disait ce qu est une cible. Un
   lecteur en deduisait que la cible etait la courbe de progression. Le bloc
   de tete le dit, et solde au passage le point « contrat d effort » de la
   file d attente : la cible est ce qu on vise, pas la ou on s arrete.
   Audit de forme du meme lot : les trois blocs de la v2.12 passaient de 552 a
   380 mots, l echec technique y etait enonce trois fois, l exemple du bassin
   deux fois, et le mecanisme n etait raconte qu a moitie, la montee de cible
   sans le retour au bas de fourchette, sans le filet et sans l allegee.
   L exemple des pompes est conserve mot pour mot, le carnet le marque « a
   conserver tel quel ». */
const COMMENT=[
 {t:'Cible, fourchette, charge',
  c:'La cible est ce que tu vises sur chaque série, pas là où tu t\'arrêtes. Elle suit ce que tu fais ; la charge, elle, ne monte que quand toutes tes séries atteignent le haut de la fourchette.',
  l:['À chaque passage, l\'outil retient ta plus petite série. La cible suivante vaut la plus haute des deux derniers passages, plus une : trois séries de 12 pompes pour une cible à 6 donnent 13, tu ne refais pas le chemin. Une mauvaise séance ne fait pas reculer la cible ; deux de suite, si, et le récap le dit.',
     'Quand toutes tes séries atteignent le haut de la fourchette, la charge ou la bande monte d\'un cran et la cible retombe au bas de la fourchette. Ta progression se lit sur la charge, pas sur la cible. Sans charge à monter, une variante plus dure prend le relais, derrière un verrou.',
     'Si toutes les séries d\'un passage tombent sous le bas de la fourchette, la charge redescend d\'un cran, sauf au premier passage après une montée. Pas en forme ? La séance allégée, choisie avant de lancer, ne touche ni à la cible ni à la charge.']},
 {t:'La calibration, au début',
  c:'Les premières semaines servent à trouver ta plage de travail. Les sauts y sont grands, en charge comme en répétitions, et c\'est normal.',
  l:['En répétitions, la cible te rattrape d\'elle-même. En charge, c\'est toi qui montes, à la main, de plusieurs crans d\'un coup s\'il le faut : tu cherches la charge où tu sens travailler le muscle visé, pas la progression la plus régulière.',
     'Ce que tu gagnes pendant cette phase ne prédit pas la suite : une montée par séance ne devient jamais une montée par séance sur l\'année, et aucun chiffre de l\'outil n\'est une promesse.',
     'Elle se termine d\'elle-même : quand tu tiens le volume lancé, que chaque exercice reste dans sa fourchette et que rien ne se fait alléger, tu es en régime normal.']},
 {t:'Quand arrêter une série',
  c:'Une série se termine quand la répétition suivante ne serait plus le même exercice.',
  l:['Deux signaux. Le muscle visé fatigue : arrête-toi une à trois répétitions avant qu\'il lâche. La technique se dégrade avant lui : c\'est elle qui commande, et sur ces exercices la fiche porte une ligne Fin de série qui nomme le signal.',
     'Exemple : sur les pompes, la limite n\'est pas l\'épuisement des pectoraux, c\'est l\'affaissement du bassin. Passer cette limite ne produit pas une pompe de plus, elle produit une extension lombaire sous charge, que le programme interdit partout ailleurs.',
     'L\'outil ne te demandera jamais de noter cet arrêt : il ne peut pas l\'observer, donc il ne décide rien dessus. C\'est à toi de le tenir.']},
 {t:'Renseigne-toi avant un exercice',
  c:'Avant un exercice que tu n\'as jamais fait, ouvre sa fiche : exécution, respiration, ligne de vigilance.',
  l:['L\'outil décide quoi faire, combien et quand. Il ne voit pas comment tu le fais : ni l\'amplitude, ni la position du dos, ni la vitesse. La ligne de vigilance nomme ce qui est en jeu, dos, cou, épaules ou genoux.',
     'Un texte rend mal l\'amplitude et le rythme : pour un geste que tu n\'as jamais vu faire, une vidéo d\'un site d\'entraînement sérieux complète la fiche.',
     'Une répétition mal placée sur une zone sensible coûte plus qu\'une séance n\'apporte. En cas de doute, la variante de repli en bas de la fiche fait le même travail en moins exigeant.']}
];
const SLOT_ORDER=['push','legs','pull','core'];
/* v2.8 : dephasage des quatre viviers. Les quatre compteurs valant toujours le
   meme entier, le tirage etait determine par un seul nombre : 25 combinaisons
   distinctes sur 375 possibles, et des paires rigides, goblet squat toujours
   avec planche, elevations laterales toujours avec face pulls.
   Ecarte : decaler les valeurs de depart des compteurs. Les indices resteraient
   la meme fonction affine du numero de seance, les paires resteraient donc
   rigides et seule leur identite changerait. Il faut que les indices cessent
   d etre cette fonction.
   Retenu : un decalage supplementaire au passage de chaque tour de vivier,
   idx = (c + k*floor(c/n)) % n, applique en LECTURE seule. Le compteur n est
   jamais touche, donc aucune migration, et la garantie de la v2.0 tient, un
   retour au profil precedent reprend la rotation ou elle en etait.
   Chaque tranche de n tirages consecutifs reste une permutation du vivier :
   la frequence de chaque exercice ne bouge pas d un iota, mesure a ecart nul
   sur les quatre viviers.
   Les valeurs de k sont choisies par mesure et ecrites ici, et non derivees du
   rang dans SLOT_ORDER : les deux decisions doivent rester separables, un futur
   changement d ordre du circuit n a pas a deplacer silencieusement la rotation.
   Mesure sur 900 seances, trois jeux de k compares : celui-ci atteint les 375
   quatuors possibles, soit le maximum arithmetique, les 25 paires jambes plus
   gainage et les 15 paires pousse plus tire, et il est le seul dont aucun
   vivier ne redonne le meme exercice deux seances de suite. k=0 sur le pousse
   laisse intacte la rotation du plus petit vivier, ou l irregularite se verrait
   le plus. */
const SLOT_PHASE={push:0,pull:1,core:2,legs:3};
/* Consigne commune aux exercices a bande (v2.0). Elle vaut pour les neuf
   exercices dont la tension depend d un montage : les cinq substituts a
   elastique et les quatre exercices existants. Elle n est ni une description
   d execution ni une vigilance de securite, elle porte son propre bloc et une
   constante unique, pour que neuf fiches ne soient pas neuf occasions de
   divergence. Hors liste a dessein : les tractions assistees, ou le barreau
   EST l assistance et ou la bande est bouclee sur la barre, et les pompes,
   ou il n y a pas d ancrage. */
const BAND_POS='Ta position modifie la tension autant que le choix du niveau : distance à l\'ancrage, hauteur du point d\'attache, angles. Si la série est trop dure ou trop facile, ajuste ta position avant de changer de niveau. À niveau identique, garde d\'une séance à l\'autre le même point d\'ancrage, la même longueur prise en main et la même position de départ.';
/* Table de substitution materielle (v2.0), declaree avec le catalogue et
   consommee par le resolveur. Elle est indexee par POSITION du vivier et non
   par identifiant : les face pulls occupent deux positions, et l ordre encode
   l espacement. Chaque chaine est ordonnee du plus proche de l intention au
   plus degrade ; une position absente n est jamais substituee, une chaine
   epuisee laisse la position non resolue et la perte est affichee.
   La retraction d omoplates ne resout que les positions d arriere d epaule et
   jamais le tirage horizontal : elle n offre ni extension d epaule chargee, ni
   flexion de coude, ni sollicitation des dorsaux. */
/* Besoins materiels par exercice. Seuls les exercices qui exigent quelque
   chose figurent ici : une absence signifie « rien d autre que le sol et le
   mobilier ». C est cette table, et non les libelles de MAT, qui decide de la
   resolution : MAT est un texte pour l utilisateur, NEEDS est un contrat. */
const NEEDS={
 'developpe-sol':['hal'],'elevations-laterales':['hal'],'curls-halteres':['hal'],
 'elevations-laterales-elastique':['elast'],'curls-elastique':['elast'],
 'ecartement-elastique':['elast'],'rowing-elastique':['elast'],'rdl-elastique':['elast'],
 'face-pulls':['elast','ancrage'],'tirage-doux':['elast','ancrage'],
 'tirage-vertical-elastique':['elast','ancrage'],'pallof-press':['elast','ancrage'],
 'tractions-assistees-supination':['barre','elast'],'tractions-assistees-pronation':['barre','elast'],
 'tractions-strictes-supination':['barre'],'tractions-strictes-pronation':['barre'],
 'rowing-suspension':['barre','sangles'],
 'rowing-kettlebell':['kb'],'goblet-squat':['kb'],'squat-une-jambe-chaise-leste':['kb'],'rdl-kettlebell':['kb'],'kb-swings':['kb'],
 'planche-ballon':['ballon'],'step-ups':['step'],'step-ups-bas':['stepbas'],
 'fentes-arriere-lestee':['hal'],
 'mollets-debout-leste':['masse'],'mollets-une-jambe-leste':['masse'],
 'pont-fessier-leste':['masse'],'hip-thrust-une-jambe-leste':['masse']
};
/* Nom du schema moteur porte par chaque position. Une perte se nomme par ce
   qu elle prive, pas par l exercice qui ne peut pas se jouer : l utilisateur
   n a pas perdu les face pulls, il a perdu son arriere d epaule. */
/* v2.18 : la ligne core suivait un ordre de vivier qui n est plus le sien
   (gainage lateral en 2, bird-dog en 4) : les libelles de perte et de
   couverture etaient decales. Realignee, et test45 verifie desormais que
   chaque ligne a la longueur de son vivier. */
const SCHEMA={
 push:['poussée horizontale','abduction d\'épaule','poussée horizontale chargée'],
 pull:['traction verticale','arrière d\'épaule','tirage horizontal','tirage horizontal chargé',
       'arrière d\'épaule','flexion de coude','traction verticale','traction verticale','traction verticale'],
 legs:['squat','squat unilatéral','squat unilatéral chargé','fente','fente chargée','extension de hanche','extension de hanche chargée','extension de hanche unilatérale','extension de hanche unilatérale surélevée','extension de hanche unilatérale surélevée chargée','mollets','mollets chargés','mollets unilatéraux','mollets unilatéraux chargés','montée sur marche','charnière de hanche','charnière balistique'],
 core:['gainage antérieur','gainage antérieur instable','coordination croisée','gainage latéral',
       'gainage latéral chargé','anti-extension','anti-rotation']
};
const SUBS={
 push:{1:['elevations-laterales-elastique'],2:['pompes-poignees']},
 pull:{0:['tirage-vertical-elastique'],
       1:['ecartement-elastique','retraction-scapulaire'],
       2:['rowing-elastique'],
       3:['rowing-elastique'],
       4:['ecartement-elastique','retraction-scapulaire'],
       5:['curls-elastique'],
       6:['tirage-vertical-elastique'],
       7:['tractions-assistees-supination','tirage-vertical-elastique'],
       8:['tractions-assistees-pronation','tirage-vertical-elastique']},
 /* v2.18 : deux positions inserees apres le goblet squat, les cles suivantes
    decalees de deux. La version lestee du squat sur une jambe se replie sans
    kettlebell sur la version au poids du corps. */
 legs:{0:['box-squat'],2:['squat-une-jambe-chaise'],4:['fentes-arriere'],6:['pont-fessier'],9:['hip-thrust-une-jambe'],11:['mollets-debout'],13:['mollets-une-jambe'],14:['step-ups-bas'],15:['rdl-elastique']},
 core:{1:['planche']}
};

/* v1.18 : le mode cible est retire. Il livrait trois series par groupe et par
   semaine la ou l alterne en livre rounds x objectif, sur une table figee de
   douze exercices qui ignorait tout ce que le catalogue a gagne depuis, et sans
   filtre de retrait. Le decoupage par groupe n existe plus nulle part. */

const WARMUP=[
 {l:'Demi-cercles de nuque',s:25,img:'echauf-nuque',d:'Demi-cercles lents, menton vers poitrine puis oreille vers épaule. Jamais la tête en arrière à fond. Respire calmement, sans bloquer.'},
 {l:'Cercles de bras',s:25,img:'cercles-de-bras',d:'Grands cercles lents vers l\'avant puis l\'arrière, amplitude progressive. Inspire en montant, souffle en descendant.'},
 {l:'Chat-vache',s:30,img:'chat-vache',d:'À quatre pattes, dos rond puis dos creusé : souffle en arrondissant, inspire en creusant.'},
 {l:'Squats à vide lents',s:30,img:'squats-a-vide',d:'5-6 squats sans charge, lents, souffle en remontant, pour réveiller genoux et hanches.'},
 {l:'Marche dynamique sur place',s:40,img:'marche-continue',d:'Rythme croissant, bras actifs, respiration ample et par la bouche si besoin : fais monter légèrement le cœur.'}
];
const WARM_SHORT=[2,4];   /* indices retenus en echauffement court */
const CARDIO_ID='cardio-bas-impact';
const TRANSITION=15, CARDIO_SEC=240;
const TRANS_CHOICES=[5,10,15,20,30];
/* Pause au raccord de tour. Le circuit est circulaire : le dernier exercice
   d un tour precede le premier du tour suivant, et cette quatrieme adjacence
   est la seule ou une longue pause s insere sans casser la structure.
   60 s : la pause REMPLACE la transition au raccord, puis vient l installation,
   modelisee a 10 s, soit environ 70 s d intervalle reel. Le choix de 60 plutot
   que 90 est un choix de cout, +1,5 min contre +2,5 min sur une seance a trois
   series, sur une contrainte de 10 a 20 min deja depassee. Ce n est PAS un
   plafond physiologique : se reposer plus longtemps que necessaire ne degrade
   rien, sauf le temps. Le carnet disait le contraire en v2.10, c etait faux.
   Constante et non reglable : la duree n est pas ce qui se decide seance par
   seance. Ce qui se decide, c est OU elle se pose, et c est la liste ci-dessous. */
const PAUSE_TOUR=60;
/* v2.11 : la pause ne se pose QUE sur les raccords nommes ici.
   Une entree vaut 'id-du-gainage>id-du-pousse'.

   Pourquoi une liste et pas une regle. La v2.10 posait la pause a TOUS les
   raccords, sur la foi d une table de marqueurs par exercice, table qui est un
   jugement et non une mesure et qui vit hors application. Elle reparait ainsi
   une adjacence, gainage vers pousse, que personne n avait signalee, au prix
   de 90 s par seance de trois tours, dans un format dont la raison d etre est
   justement de supprimer le temps mort. Elle contredisait le principe
   d architecture du carnet : l outil decide sur ce qu il observe.

   Le probleme reellement vecu etait une paire, elevations laterales puis face
   pulls, deux exercices d isolation d epaule que l ancien ordre rendait
   adjacents avec 25 s entre eux. L ordre P,L,U,C le resout seul et a cout nul :
   un poste jambes separe pousse et tire dans le tour, un poste gainage les
   separe au raccord, ce qui donne 52 a 112 s selon l exercice intercale au lieu
   de 25. La paire n est plus adjacente dans aucun sens.

   La liste n est pas alimentee par un calcul : elle l est par ce que Gabriel
   constate. Une entree = un enchainement qu il a ressenti comme genant, pas
   un enchainement qu un tableau a deduit.

   v2.18, premiere paire constatee, le 15 septembre 2026. Quatuor developpe au
   sol, goblet squat, tractions assistees en pronation, gainage lateral. Au
   raccord, gainage lateral puis developpe : epaules en feu, halteres difficiles
   a stabiliser, trajectoire difficile a controler. Le developpe arrive au bout
   de trois postes d epaule enchaines, traction, gainage sur avant-bras puis
   lui-meme. La pause porte sur le raccord et non sur tire > gainage : c est le
   developpe qui a souffert, pas la tenue.

   Le successeur est nomme avec lui, et c est la seule entree qui ne vienne pas
   directement d un ressenti. Motif : meme appui sur l avant-bras, donc meme
   charge d epaule au moins, et son deblocage retire le gainage lateral du
   tirage. Sans lui, la pause disparaitrait en silence le jour du deblocage,
   qui est justement tombe pendant la seance du constat. Regle qui en decoule,
   verifiee par test45 : une paire nommee sur un exercice qui a un successeur
   par retrait nomme aussi ce successeur.

   Pas d autre paire par analogie, pompes ou planche au raccord : decision de
   Gabriel, on attend d y tomber. */
const PAUSE_RACCORD_PAIRS=['gainage-lateral>developpe-sol','gainage-lateral-jambe-levee>developpe-sol'];
/* Modele de temps (v1.14). Tout ce que l outil chronometre est deja exact et
   ne se modelise pas : echauffement, decomptes de preparation, tenues,
   etirements, transitions, cardio. Seuls trois postes se calculent, parce que
   aucun chrono ne tourne pendant.
   TEMPO : tempo controle d une repetition, phase concentrique plus rapide que
   l excentrique plus la pause, conforme aux consignes des fiches (« monte en
   2 s », « descends lentement en 2-3 s »). TEMPO_EX porte les exercices qui
   s en ecartent nettement.
   INSTALL : arriver sur l ecran, se placer, saisir la valeur et valider.
   C est le seul parametre libre du modele, celui qui absorbe ce qui n est
   represente nulle part ; il se recalera sur des seances mesurees.
   INSTALL_STRETCH : un etirement ne demande ni saisie ni materiel, et le
   decompte de preparation couvre deja la fin de la mise en place.
   SWITCH_EX : bascule de cote, seulement la ou l outil n en compte aucune.
   Les tenues par cote rejouent un decompte de preparation a chaque cote, deja
   compte ; les etirements bilateraux enchainent seuls au bip ; fentes,
   bird-dog et dead bug alternent a chaque repetition d apres leurs fiches.
   Restent le pallof press, qui pivote autour d un ancrage fixe, et le rowing
   kettlebell, qui repose la charge et deplace ses deux appuis.
   REMOUNT : le montage se prepare avant la seance, c est la fonction du detail
   de seance. Il ne coute du temps que la ou deux exercices se disputent la
   meme ressource physique a des charges differentes, et alors a chaque
   passage de l un a l autre. */
const TEMPO=4.5, INSTALL=10, INSTALL_STRETCH=5, REMOUNT=25;
const TEMPO_EX={
 'tractions-assistees-supination':5,'tractions-assistees-pronation':5,
 'tractions-strictes-supination':5,'tractions-strictes-pronation':5,
 'pallof-press':5,'mollets-debout':3.5,'mollets-debout-leste':3.5,'mollets-une-jambe':3.5,'mollets-une-jambe-leste':3.5,'kb-swings':1.5
};
const SWITCH_EX={'pallof-press':5,'rowing-kettlebell':10};
const ROUNDS_CHOICES=[2,3,4];
/* etirements de fin de seance : deux par seance, en rotation, comptes dans le
   temps annonce depuis la v1.13. La liste etait derivee de la seance mobilite
   du mode cible ; elle est posee en clair depuis le retrait de ce mode. */
const STRETCH_POOL=['etir-nuque','etir-pecs','chat-vache','etir-hanches','etir-ischios','posture-enfant'];
const STRETCH_PER_SESSION=2;

/* ============ XP, RANGS, BADGES ============ */
const XP_SET=4, XP_SESSION=15, XP_WEEK=40;
function lvlThreshold(n){return 50*n*(n+1);}
const RANKS=[[16,'Inoxydable'],[13,'Acier'],[10,'Forgé'],[8,'Trempé'],[5,'Solide'],[3,'Régulier'],[1,'Mise en route']];
function rankOf(l){ for(const r of RANKS) if(l>=r[0]) return r[1]; return 'Mise en route'; }
/* niveau seuil du rang atteint : sert a detecter un changement de rang
   et a fusionner l animation quand un badge designe deja ce palier */
function rankLevel(l){ for(const r of RANKS) if(l>=r[0]) return r[0]; return 1; }
function lvlInfo(xp){
  let n=0; while(xp>=lvlThreshold(n+1)) n++;
  const base=n>0?lvlThreshold(n):0, next=lvlThreshold(n+1);
  return {lvl:n+1,pct:Math.min(100,Math.round((xp-base)/(next-base)*100)),next:next-xp};
}
/* Avancement d un badge non acquis (v2.2). Deux champs facultatifs a cote du
   predicat, un compteur et son seuil. Le compteur ne se deduit pas du test :
   un predicat est un booleen, il ne sait pas dire ou l on en est.
   Il n est porte que la ou il informe. Un seuil de 1, ou un predicat qui n est
   pas un compteur, ne produirait que « 0/1 », qui ne dit rien de plus que la
   ligne grisee : les quatre badges dans ce cas, s1, w1, load et unlock1, n en
   portent pas, et badgeProg refuse tout seuil inferieur a deux.
   Le badge mob5 « Souplesse assumee » disparait ici : son predicat lisait
   type==='mobilite', or toute seance s ecrit type:'alterne' depuis le retrait
   du mode cible en v1.18. Il etait inatteignable et pesait quand meme dans le
   denominateur affiche. w12 le remplace et prolonge l echelle des semaines,
   qui s arretait a un mois quand celle des seances va jusqu a quarante. */
const BADGES=[
 {id:'s1',ico:'🔥',nom:'Première étincelle',d:'Première séance terminée',test:st=>st.hist.length>=1},
 {id:'s5',ico:'🧱',nom:'Fondations',d:'5 séances terminées',test:st=>st.hist.length>=5,prog:st=>st.hist.length,seuil:5},
 {id:'s15',ico:'⚙️',nom:'Machine lancée',d:'15 séances terminées',test:st=>st.hist.length>=15,prog:st=>st.hist.length,seuil:15},
 {id:'s40',ico:'🏗️',nom:'Charpente',d:'40 séances terminées',test:st=>st.hist.length>=40,prog:st=>st.hist.length,seuil:40},
 {id:'w1',ico:'📅',nom:'Semaine validée',d:'Objectif hebdo atteint une première fois',test:st=>{const wc=weekCounts(st);return Object.keys(wc).some(k=>wc[k]>=goalForWeek(st,k));}},
 {id:'w4',ico:'🛡️',nom:'Un mois solide',d:'4 semaines validées d\'affilée',test:st=>weekStreak(st)>=4,prog:st=>weekStreak(st),seuil:4},
 {id:'w12',ico:'🏰',nom:'Trimestre tenu',d:'12 semaines validées d\'affilée',test:st=>weekStreak(st)>=12,prog:st=>weekStreak(st),seuil:12},
 {id:'load',ico:'⚖️',nom:'Première montée de charge',d:'Une charge augmentée grâce à la double progression',test:st=>st.loadUps>=1},
 {id:'load5',ico:'🏋️',nom:'Cinq paliers',d:'Cinq montées de charge cumulées',test:st=>st.loadUps>=5,prog:st=>st.loadUps,seuil:5},
 {id:'unlock1',ico:'🔓',nom:'Palier franchi',d:'Premier exercice débloqué',test:st=>Object.keys(st.unlocked).length>=1},
 {id:'lvl5',ico:'⭐',nom:'Palier 5',d:'Niveau 5 atteint, rang Solide',rank:5,test:st=>lvlInfo(st.xp).lvl>=5,prog:st=>lvlInfo(st.xp).lvl,seuil:5},
 {id:'lvl10',ico:'🌟',nom:'Palier 10',d:'Niveau 10 atteint, rang Forgé',rank:10,test:st=>lvlInfo(st.xp).lvl>=10,prog:st=>lvlInfo(st.xp).lvl,seuil:10}
];
/* Le compteur est borne au seuil : un badge dont le compteur a depasse le
   seuil sans que le badge soit pose, cas d une correction de seance qui
   fait redescendre loadUps, afficherait sinon 6/5. Rend null la ou
   l avancement ne doit pas s afficher, jamais une chaine vide. */
function badgeProg(b,st){
  if(typeof b.prog!=='function'||!(b.seuil>=2)) return null;
  return Math.max(0,Math.min(b.prog(st),b.seuil));
}

```
## `app4.js`

État, persistance, migrations, profils, résolution de position et repli réalisable, double progression, déblocages, compteurs de schémas et de progressions disponibles.

1251 lignes, 71805 octets.

```javascript
/* ============ ETAT ============ */
const SKEY='palier-state-v2';
let state=null, storageOK=true;
/* Etat neuf (v2.0). L inventaire part vide et le drapeau d onboarding est pose
   ici, et ici seulement : migrateState ne le cree jamais, donc un import de
   sauvegarde n a pas d onboarding, ce qui est le comportement voulu. Une liste
   pre-remplie se survole, une liste vide se remplit, et le resultat colle a la
   realite de l utilisateur.
   Le profil domicile est declare des l etat neuf : sans lui, la chip de profil
   et la liste de bascule restent vides jusqu au premier enregistrement, c est-
   a-dire pendant tout l onboarding. */
function defaultState(){return {
  v:2, xp:0, goal:4, theme:'auto', rounds:3,
  trans:15, warm:'complet', cardio:true, stretch:true, loadUps:0,
  gear:JSON.parse(JSON.stringify(EMPTY_GEAR)), onboard:true, intro:true,
  profil:'domicile', profils:{domicile:{nom:'Domicile'}},
  slotIdx:{push:0,pull:0,legs:0,core:0}, stretchIdx:0, sessionCount:0, lightRun:0,
  div:{push:0,pull:0},
  hist:[], perf:{}, unlocked:{}, badges:[]
};}
const store={
  async get(k){
    if(typeof window!=='undefined'&&window.storage){ try{const r=await window.storage.get(k); if(r&&r.value!=null) return r.value;}catch(e){} }
    try{ const v=localStorage.getItem(k); if(v!=null) return v; }catch(e){}
    return null;
  },
  async set(k,v){
    let ok=false;
    if(typeof window!=='undefined'&&window.storage){ try{ await window.storage.set(k,v); ok=true; }catch(e){} }
    try{ localStorage.setItem(k,v); ok=true; }catch(e){}
    return ok;
  }
};
/* Migrations (v1.16). Elles vivaient dans loadState, donc elles ne jouaient que
   sur le localStorage : applyImport, qui construit l etat depuis un fichier,
   n en rejouait aucune. Une sauvegarde ancienne reimportee revenait donc avec
   ses valeurs d origine, sans que rien ne le dise. Elles sont ici, et les deux
   chemins d entree les appellent.
   Le parametre p est l objet brut lu, s l etat en construction : certaines
   migrations doivent distinguer « champ absent » de « champ a zero ». */
/* Migration v2.0. Deux gestes seulement, tous deux idempotents.
   Les ressources declarables apparaissent au complet : une sauvegarde
   anterieure vient forcement d un inventaire domicile ou tout etait suppose
   present, et rien ne permettrait de deviner une absence.
   Chaque niveau de bande declare recoit sa realisation par defaut, sa propre
   couleur, ce qui transforme la carte de presence en carte de realisation sans
   rien perdre. Un niveau absent le reste, sa realisation etant vide.
   Le profil domicile enveloppe l inventaire existant, sans le copier : il en
   devient le porteur nomme. */
function migrateV2(s){
  if(!s.gear) return;
  if(!s.gear.res) s.gear.res=JSON.parse(JSON.stringify(DEFAULT_GEAR.res));
  s.gear.bands=s.gear.bands||{};
  BANDS.forEach(b=>{ const v=s.gear.bands[b.id];
    if(v===1||v===true) s.gear.bands[b.id]=b.id;
    else if(!v) s.gear.bands[b.id]=''; });
  if(!s.profil) s.profil='domicile';
  if(!s.profils) s.profils={};
  if(!s.profils.domicile) s.profils.domicile={nom:'Domicile'};
  s.profils[s.profil]=s.profils[s.profil]||{nom:'Domicile'};
  s.profils[s.profil].gear=s.gear;
}
/* Second temps de la migration v2.0, pose apres migrateV2 dont il lit
   l inventaire deja etabli. Trois sondes de forme, toutes idempotentes, aucune
   ne cree le drapeau d onboarding.
   La marche basse est presente par defaut sur toute sauvegarde existante, meme
   doctrine que le reste des ressources : elles viennent d un domicile ou tout
   etait suppose la, et rien ne permettrait de deviner une absence. La sonde
   distingue le champ absent du champ a zero, sinon elle rallumerait a chaque
   lecture une marche basse volontairement decochee.
   Le sixieme niveau de bande n existait pas : il est absent, pas decoche.
   Une realisation hors nuancier ne peut venir que d une sauvegarde bricolee ou
   d un jeu de test, le nommage libre n ayant jamais ete deploye : on la ramene
   a une couleur, par sa cle, par son libelle, puis par la couleur d origine du
   niveau. Le niveau reste tenu dans tous les
   cas, seule sa teinte peut changer. */
function migrateV2b(s){
  if(!s.gear) return;
  s.gear.res=s.gear.res||{};
  if(s.gear.res.stepbas==null) s.gear.res.stepbas=1;
  s.gear.bands=s.gear.bands||{};
  BANDS.forEach(b=>{
    const v=s.gear.bands[b.id];
    if(v==null){ s.gear.bands[b.id]=''; return; }
    if(typeof v!=='string'){ s.gear.bands[b.id]=v?(coulOK(b.id)?b.id:'gris'):''; return; }
    if(!v||coulOK(v)) return;
    const t=v.trim().toLowerCase();
    const parLbl=PAL.filter(x=>x[1]===t)[0];
    s.gear.bands[b.id]=parLbl?parLbl[0]:(coulOK(b.id)?b.id:'gris');
  });
}
/* Migration v2.1, par sondes de forme comme toutes les autres. Les
   kettlebells deviennent une carte de poids possedes : une sauvegarde
   anterieure qui declarait la ressource possede la kettlebell de 10 kg, seule
   du carnet. Les elastiques et les lestes recoivent leur drapeau de presence,
   masque non destructif sur le modele de hal : il vaut 1 des lors que quelque
   chose est declare, sinon 0, ce qui est exactement l invariant que la card
   maintient ensuite. */
function migrateV21(s){
  if(!s.gear) return;
  /* Une sauvegarde ancienne sans table de ressources vient forcement d une
     epoque ou tout etait suppose present : la cible de migration est le
     domicile, comme partout ailleurs. La sonde porte sur l absence de la
     table, jamais sur un numero de version. */
  if(!s.gear.res) s.gear.res=JSON.parse(JSON.stringify(DEFAULT_GEAR.res));
  if(!s.gear.kbs) s.gear.kbs=s.gear.res.kb?{'10':1}:{};
  if(s.gear.res.elast==null) s.gear.res.elast=ownedBands(s.gear).length?1:0;
  if(s.gear.res.cuff==null) s.gear.res.cuff=CUFF_W.some(w=>(s.gear.cuffs||{})[w])?1:0;
}
function migrateState(s,p){
  p=p||s;
  if(!p.v||p.v<2){ s.perf={}; s.unlocked={}; s.v=2; s.slotIdx={push:0,pull:0,legs:0,core:0}; }
  if(!s.gear) s.gear=JSON.parse(JSON.stringify(DEFAULT_GEAR));
  if(!s.slotIdx) s.slotIdx={push:0,pull:0,legs:0,core:0};
  /* v1.2 : capacite manchon, bandes, lestes, et remise a plat des fourchettes
     des exercices qui passent sur une echelle (leur fourchette ne monte plus) */
  if(!s.gear.maxPerEnd) s.gear.maxPerEnd=5;
  if(!s.gear.bands) s.gear.bands=JSON.parse(JSON.stringify(DEFAULT_GEAR.bands));
  if(!s.gear.cuffs) s.gear.cuffs=JSON.parse(JSON.stringify(DEFAULT_GEAR.cuffs));
  if(s.gear.plates&&s.gear.plates['1.25']==null) s.gear.plates['1.25']=0;
  migrateV21(s);
  if(s.profils) Object.keys(s.profils).forEach(k=>{ if(s.profils[k]&&s.profils[k].gear) migrateV21({gear:s.profils[k].gear}); });
  /* v1.4 : etirements de fin de seance, rotation, compteur d ecart */
  if(s.stretch==null) s.stretch=true;
  if(s.stretchIdx==null) s.stretchIdx=0;
  if(!s.div) s.div={push:0,pull:0};
  /* v1.13 : la duree choisie devient un nombre de series. La correspondance
     reprend exactement ce que l ancien calcul produisait sans cardio, donc
     personne ne voit son volume changer a la mise a jour. */
  if(p.rounds==null&&p.duration!=null) s.rounds={10:2,15:3,20:4}[p.duration]||3;
  if(ROUNDS_CHOICES.indexOf(s.rounds)<0) s.rounds=3;
  delete s.duration;
  if(s.lightRun==null) s.lightRun=0;
  /* v1.16 : app et version appartiennent a l enveloppe du fichier exporte, pas
     aux donnees. applyImport les faisait entrer dans l etat, ou elles ecrasaient
     ensuite la vraie version a chaque export, payload assignant state par-dessus.
     Un « version 1.0 » fossile survivait ainsi a quinze versions. */
  delete s.app; delete s.version;
  /* v1.18 : le mode cible est retire. Trois champs deviennent orphelins dans
     l etat, mode, cibleIdx et rest, ce dernier n ayant jamais servi qu au repos
     chronometre de ce mode. Meme traitement que le « version 1.0 » ci-dessus :
     on ne garde pas un reglage que plus rien ne lit. Les entrees d historique
     gardent en revanche leur mode, qui dit sous quel regime elles ont ete
     jouees et sert encore au libelle des anciennes. */
  delete s.mode; delete s.cibleIdx; delete s.rest;
  /* v1.17 : le plafond des deux tenues au sol descend de 60 a 45 s. La copie
     stockee dans perf ne se corrige pas seule, elle est ecrite une fois pour
     toutes a la creation de l exercice ; sans cette migration une planche deja
     jouee garderait une fourchette 20-60 que le catalogue ne connait plus, et
     une cible a 60 s que rien n aurait plus le droit de faire redescendre.
     Ecretage seulement : une fourchette deja conforme n est pas touchee, la
     migration est donc idempotente et sans effet sur un etat neuf.
     v2.5 : meme cas sur les mollets debout, dont le plafond descend de 30 a 25.
     Une progression deja engagee dans les relevements porte par exemple 13-26,
     au-dessus du nouveau haut : sans ecretage echelleOf ne retrouve plus la
     position courante dans l echelle et la carte affiche « pas encore de niveau
     enregistre » sur un exercice joue depuis des mois. Mesure avant correction,
     rejouee en test.
     C est aussi ce cas qui a montre qu ecreter le seul haut ne suffit pas. Un
     relevement fait monter les DEUX bornes ensemble, si bien qu une fourchette
     hors bornes a toujours un bas hors bornes lui aussi : 13-26 ecrete au seul
     haut donne 13-25, que l echelle ne reconnait pas davantage que 13-26
     puisqu elle n a qu une marche, 12-25. La fourchette revient donc entiere a
     sa base. Sans effet sur les deux planches, dont la base commence a 20 la ou
     l ancien ecretage les ramenait deja.
     v2.16 : la liste en dur disparait, l ecretage est derive. Le plafond de
     tout exercice au poids du corps ou tenu vaut desormais le haut de sa
     fourchette et le relevement n existe plus, donc toute fourchette stockee
     au-dessus de la base est un reste d un relevement fantome, sur les onze
     entrees qui en portaient encore un. Elle revient entiere a sa base et la
     cible est bornee. La memoire de fenetre n est pas touchee : un relevement
     n a jamais change le niveau physique de l exercice, meme poids du corps,
     meme geste, donc une lecture faite sous 7-13 est exactement comparable a
     une lecture sous 6-12. La remise a zero de la v2.14 visait un changement
     de palier reel ; il n y en a pas eu. Idempotente et sans effet sur une
     fourchette conforme. Mesure sur la sauvegarde du 12 septembre 2026 :
     aucune des onze n etait relevee, la migration y est un no-op. */
  /* v2.19 : le gainage lateral jambe levee passe des secondes aux repetitions
     cadencees. Il est debloque depuis le 15 septembre 2026, donc une
     performance a pu etre creee en secondes : fourchette 15-45, cible, series
     et memoire de fenetre dans une unite que l exercice n a plus. L ecretage
     qui suit ne suffirait pas, il bornerait une cible de 15 s a 15
     repetitions et garderait une memoire en secondes. La performance repart
     donc de zero, comme un exercice neuf, et perfOf la recree a la premiere
     lecture. Le temoin est la fourchette : celle d un exercice au poids du
     corps ne bouge plus depuis la v2.16, une fourchette differente de la base
     ne peut venir que du regime tenu. Les passages de ce regime restent a
     l historique, marques it.u = 's' : leurs series sont des secondes, et la
     fiche doit le dire. Le marqueur est une valeur ecrite, pas une deduction
     a la lecture, qui casserait le jour ou la base bougerait. Idempotente,
     sans effet sur un etat neuf ni sur un exercice non cadence. */
  /* v2.22 : portee nommee. Le pont fessier et sa lignee passent eux aussi en
     cadence, mais ils etaient deja en repetitions : une fourchette heritee y
     est un reste de relevement, que l ecretage qui suit ramene a la base.
     Sans la liste, elle aurait efface leur performance. */
  const exSecondes=id=>CAD_DEPUIS_SECONDES.indexOf(id)>=0;
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!e.cadence||!exSecondes(id)||!q||!q.range) return;
    if(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]) delete s.perf[id];
  });
  (s.hist||[]).forEach(h=>(h.items||[]).forEach(it=>{
    const e=it&&DB[it.id];
    if(!e||!e.cadence||!exSecondes(it.id)||!it.rng||it.u!=null) return;
    if(it.rng[0]!==e.reps[0]||it.rng[1]!==e.reps[1]) it.u='s';
  }));
  /* L instantane de correction de la derniere seance restaurerait une
     performance en secondes : la seance jouee sous l ancien regime ne se
     corrige plus. */
  if(s.undo&&s.undo.perf&&Object.keys(s.undo.perf).some(id=>{
    const e=DB[id], q=s.undo.perf[id];
    return e&&e.cadence&&exSecondes(id)&&q&&q.range&&(q.range[0]!==e.reps[0]||q.range[1]!==e.reps[1]);
  })) delete s.undo;
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!q||!e.reps||e.bnd||!(e.mode==='bw'||e.mode==='time')) return;
    /* v2.17 : sur une echelle de tenues la base est celle du barreau, pas la
       premiere fourchette du catalogue, sinon la migration ramenait un 4-8
       joue a 6 s sur le 6-12 du barreau de depart. p.tenue absent vaut le
       premier barreau : la migration des deux exercices est un no-op. */
    const base=baseReps(e,q);
    if(q.range&&(q.range[0]!==base[0]||q.range[1]!==base[1])) q.range=base.slice();
    if(q.target!=null&&q.target>base[1]) q.target=base[1];
  });
  Object.keys(s.perf||{}).forEach(id=>{
    const e=DB[id], q=s.perf[id];
    if(!e||!q) return;
    if((e.bnd||e.mode==='fixed'||e.mode==='band')&&e.reps){
      q.range=e.reps.slice();
      if(q.target==null||q.target>e.reps[1]) q.target=e.reps[1];
      if(q.target<e.reps[0]) q.target=e.reps[0];
    }
    if(e.bnd&&!q.band){ const L=bandLadder(e,s.gear); q.band=(e.band0&&L.indexOf(e.band0)>=0)?e.band0:L[0]; }
    /* v2.12 : bandBest ne veut plus rien dire, la cle est retiree des etats
       herites. Rien ne la remplace a la migration : le barreau joue s ecrit au
       moment ou il est vrai, donc la preuve du verrou repart de la prochaine
       seance jouee sur l exercice source. Une valeur reconstituee ici vaudrait
       moins que son absence, meme motif qu it.rng en v2.4. */
    delete q.bandBest;
    /* v2.15 : la memoire de la fenetre de cible se seme depuis la derniere
       lecture enregistree. Ce n est pas une valeur reconstituee, p.sets est la
       lecture elle-meme, avec ses marqueurs de provenance : une lecture pure,
       comme la retroactivite des paliers en v2.4. Sans elle, chaque exercice
       revivait une fois le recul silencieux que la v2.14 supprime, sur
       plusieurs semaines de transition (releve d audit externe). Gardes : pas
       de lecture allegee ni non qualifiee ; pas de grace, qui dit que le
       dernier passage a fait monter le palier et que ses series sont a l
       ancien. La v2.15 portait une troisieme garde, sur le poids du corps et
       les tenues : pas de semis quand tout le passage etait au haut de
       fourchette moins un pas, parce qu un tel passage pouvait avoir releve
       la fourchette sans laisser de grace. Le relevement n existe plus
       (v2.16), un passage au plafond ne change plus de palier, et l ecretage
       ci-dessus a deja ramene toute fourchette relevee a sa base : la garde
       n a plus d objet et tombe. Idempotente : ne touche jamais une memoire
       deja posee, absente comprise apres un premier passage v2.14. */
    if(q.prevMin==null&&q.sets&&q.sets.length&&q.range&&!q.lightSets&&!q.unqualSets&&!q.grace)
      q.prevMin=Math.min.apply(null,q.sets);
  });
  /* v2.3 : sonde de forme sur le drapeau d onboarding. Elle ne le cree jamais,
     elle l abaisse quand rien ne le porte. Le drapeau n existe que dans l etat
     neuf, ou defaultState le pose a true, et les deux chemins d entree partent
     de la, Object.assign n ecrasant que les cles presentes dans la source. Sans
     cette sonde, un objet lu sans la cle repart avec le true de l etat neuf :
     c est ce qui faisait revenir le bandeau a chaque rechargement apres
     validation, et ce qui donnait un onboarding a toute sauvegarde anterieure a
     la v2.0. La sonde lit l objet brut et non l etat en construction, seul
     moyen de distinguer un champ absent d un champ deja abaisse. Une sauvegarde
     ecrite pendant l onboarding porte true et le garde, ce qui est voulu : son
     inventaire n a pas ete declare. */
  if(p.onboard==null) s.onboard=false;
  /* en dernier : la v2.0 lit un inventaire de bandes deja etabli par les
     migrations qui la precedent, elle ne peut donc pas s executer avant elles */
  migrateV2(s);
  migrateV2b(s);
  return s;
}
async function loadState(){
  let raw=null;
  try{ raw=await store.get(SKEY); }catch(e){}
  if(!raw){ try{ raw=await store.get('palier-state-v1'); }catch(e){} }
  let s=defaultState();
  if(raw){ try{
    const p=JSON.parse(raw);
    s=Object.assign(s,p);
    migrateState(s,p);
  }catch(e){} }
  state=s;
  /* l invariant « state.gear EST l inventaire du profil actif » doit tenir des
     l entree, sur les deux chemins : migrateV2 le pose pour une sauvegarde
     lue, syncProfil le pose pour un etat neuf, sans rien ecrire sur le disque */
  syncProfil();
  storageOK=await store.set(SKEY+'-ping','1');
}
async function save(){
  /* Version qui a ecrit cette sauvegarde (v1.16). Ecrite au save et non a
     l export, pour que le localStorage la porte aussi : les migrations futures
     se lisent alors sur un numero au lieu de se deviner a la forme des donnees.
     Limite assumee, elle ne renseigne que les sauvegardes posterieures a son
     introduction, les sondes de forme restent necessaires pour les anciennes. */
  syncProfil();
  state.appVersion=VERSION;
  const ok=await store.set(SKEY,JSON.stringify(state));
  if(!ok&&storageOK){ storageOK=false; flash('Sauvegarde indisponible : données en mémoire seulement'); }
  /* v2.24 : marque l etat comme modifie et programme l envoi ; inerte sans cle */
  if(typeof syncTouch==='function') syncTouch();
}
function applyTheme(){
  const pref=(state&&state.theme)||'auto';
  const dark=pref==='dark'||(pref==='auto'&&typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme=dark?'dark':'light';
}

/* ============ OUTILS ============ */
const $=s=>document.querySelector(s);
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function flash(msg,ms){
  const f=$('#flash'); if(!f) return;
  f.textContent=msg; f.classList.add('show');
  clearTimeout(f._t); f._t=setTimeout(()=>f.classList.remove('show'),ms||2800);
}
/* interrupteur global des sons (v1.6) : la porte est ici, dans l unique
   fonction d emission, donc elle coupe tout d un coup : echauffement, repos,
   cible, decompte de preparation, phases et fin du cardio, celebration */
function sndOn(){ return !state||state.sound!==false; }
function prepSec(){ const v=state&&state.prep; return v==null?5:v; }
/* repere des tenues chronometrees (v2.20) : un clic discret toutes les
   REPERE.pas secondes pendant planche et gainage lateral, pour savoir ou l on
   en est sans voir l ecran. Actif par defaut, comme les sons : la cle absente
   vaut vrai. Le pas vaut celui des tenues, et les cibles de tenue etant des
   multiples de 5, le dernier repere tombe sur le debut de l approche. Repere
   pur, il ne mesure rien : la mesure reste le Stop et le rognage. */
const REPERE={pas:5,freq:1800,gain:.12,dur:.04};
function repereOn(){ return !state||state.repere!==false; }
function beep(freq,dur){
  if(!sndOn()) return;
  try{
    const ctx=beep.ctx||(beep.ctx=new (window.AudioContext||window.webkitAudioContext)());
    const d=dur||.2;
    [0,.26].forEach(off=>{
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=freq||950; o.connect(g); g.connect(ctx.destination);
      const t=ctx.currentTime+off;
      g.gain.setValueAtTime(.001,t);
      g.gain.exponentialRampToValueAtTime(.5,t+.02);
      g.gain.exponentialRampToValueAtTime(.001,t+d);
      o.start(t); o.stop(t+d+.02);
    });
  }catch(e){}
  try{ if(navigator.vibrate) navigator.vibrate([90,70,90]); }catch(e){}
}
/* Emetteur simple-coup (v2.17), pour le metronome des tenues rythmees. beep()
   joue chaque ton deux fois a 260 ms d ecart : sur une tenue de 3 s le second
   coup tombe au dixieme de la tenue et brouille l ouverture. Ici un coup par
   evenement, ordonnance a un instant precis de l horloge audio et non « tout
   de suite », ce qui permet de programmer les bips en avance et de ne pas
   dependre du moment ou le timer JS se reveille. Meme porte sonore que beep,
   meme contexte, pas de vibration : le motif [90,70,90] dure 250 ms, meme
   defaut que le double coup. Retourne le contexte pour que l appelant lise
   l horloge ; null quand le son est coupe ou indisponible. Gain optionnel
   (v2.20), 0,45 par defaut comme les autres sons : le repere des tenues joue
   plus bas. */
function audioCtx(){
  try{ return beep.ctx||(beep.ctx=new (window.AudioContext||window.webkitAudioContext)()); }catch(e){ return null; }
}
function tone(freq,at,dur,gain){
  if(!sndOn()) return;
  const ctx=audioCtx(); if(!ctx) return;
  try{
    if(ctx.state==='suspended'&&ctx.resume) ctx.resume();
    const d=dur||.12, t=Math.max(at||0,ctx.currentTime+.001);
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.frequency.value=freq||950; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain||.45,t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.start(t); o.stop(t+d+.02);
    tone.live=(tone.live||[]).filter(x=>x.t>ctx.currentTime-1);
    tone.live.push({o:o,t:t});
  }catch(e){}
}
/* Annule les coups deja programmes et non encore joues : au Stop, rien ne doit
   sonner apres le geste. */
function toneCancel(){
  const ctx=beep.ctx, L=tone.live||[]; tone.live=[];
  if(!ctx) return;
  L.forEach(x=>{ if(x.t>ctx.currentTime-.01){ try{ x.o.stop(ctx.currentTime); }catch(e){} } });
}
function fmtT(s){return Math.floor(s/60)+':'+String(Math.max(0,s%60)).padStart(2,'0');}
/* duree lisible : secondes sous la minute, minutes au dixieme au-dela, la
   decimale disparaissant quand elle vaut zero. Le dixieme n est pas un luxe :
   sans lui, les postes de la decomposition ne retombent pas sur leur total. */
function fmtDur(sec){
  if(sec<60) return Math.round(sec)+' s';
  const m=Math.round(sec/6)/10;
  return String(m).replace('.',',')+' min';
}
/* Liste de series, formatee au meme endroit pour tout le monde (v1.16). Six
   points d affichage la produisaient a la main, dont quatre avec des espaces
   autour du slash et deux sans : l application etait deja incoherente avec
   elle-meme. Le separateur est attenue et porte une micro-marge, ce qui separe
   les nombres par le contraste au lieu de la distance et rend six caracteres
   sur une liste de quatre valeurs. */
function setsHtml(a){ return (a||[]).join('<i class="sl">/</i>'); }
/* Cle de jour et cle de mois, dans le fuseau de l appareil (v2.6). Elles
   etaient decoupees par toISOString().slice(), qui rend une date UTC : entre
   minuit et deux heures du matin a Bruxelles, le fichier telecharge portait la
   veille pendant que la card annoncait le jour meme, et une seance de nuit se
   serait comptee la veille alors que la semaine ISO qui la contient, elle, se
   calcule deja sur les getters locaux. Deux decoupages du meme instant sur la
   meme ligne finissent par diverger, c est la lecon du plafond de liste.
   Un instant se stocke en UTC, un jour civil se lit sur l horloge de celui qui
   regarde : le decoupage est desormais fait au meme endroit pour tout le monde. */
function dayKey(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());}
function monthKey(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1);}
/* Ecart en jours civils, et non en tranches de 24 h : un export fait hier a
   20 h se lisait « aujourd hui » ce matin a 8 h, juste au-dessus d une ligne
   qui affichait la veille. Le passage par Date.UTC des composantes locales
   neutralise les changements d heure, ou une journee ne fait pas 24 h. */
function dayGap(iso){
  const a=new Date(iso), b=new Date();
  return Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())
                    -Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);
}
/* Heure de l horloge locale (v2.9). Un seul endroit decoupe l heure d un
   instant, comme dayKey decoupe son jour : fmtDT la lisait a la main, et deux
   decoupages du meme instant sur la meme ligne finissent par diverger. */
function fmtHM(x){const d=x?new Date(x):new Date(),p=n=>String(n).padStart(2,'0');return p(d.getHours())+'h'+p(d.getMinutes());}
/* Duree ecoulee en minutes entieres (v2.9). Tronquee et jamais arrondie : a
   12 min 50 s l ecran annonce 12, sans quoi l indicateur revendiquerait du temps
   qui n a pas ete passe. La seconde est volontairement absente : l ecran de
   transition porte deja un decompte a la seconde, et deux nombres qui defilent a
   la meme cadence, l un vers le haut l autre vers le bas, ne se distinguent
   plus.
   Le nom fmtMin etait deja pris, dans app5.js, par la duree ANNONCEE au tilde.
   Deux declarations du meme nom ne cohabitent pas, la derniere assemblee gagne,
   et le rendu portait « ~0 min » : l ecoule affichait la duree annoncee. Le
   formateur porte donc le nom de sa grandeur et non celui de son unite. */
function fmtEcoule(sec){return Math.max(0,Math.floor(sec/60))+' min';}
function fmtDT(iso){const d=new Date(iso),p=n=>String(n).padStart(2,'0');return fmtHM(iso)+' '+p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+String(d.getFullYear()).slice(2);}
function isoWeek(d){
  const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=dt.getUTCDay()||7; dt.setUTCDate(dt.getUTCDate()+4-day);
  const y=dt.getUTCFullYear();
  return y+'-S'+String(Math.ceil((((dt-Date.UTC(y,0,1))/864e5)+1)/7)).padStart(2,'0');
}
/* jours actifs par semaine : plusieurs seances le meme jour comptent pour un */
function weekCounts(st){
  const m={};
  st.hist.forEach(h=>{const k=isoWeek(new Date(h.date));(m[k]=m[k]||{})[dayKey(h.date)]=1;});
  const o={}; Object.keys(m).forEach(k=>o[k]=Object.keys(m[k]).length);
  return o;
}
function prevWeekKey(o){const d=new Date();d.setDate(d.getDate()-7*o);return isoWeek(d);}
/* date de la premiere seance de chaque semaine, en ISO */
function weekFirsts(st){
  const m={};
  st.hist.forEach(h=>{ const k=isoWeek(new Date(h.date)); if(!m[k]||h.date<m[k]) m[k]=h.date; });
  return m;
}
/* Objectif applicable a une semaine donnee.
   Une semaine dont la premiere seance suit une semaine entierement vide est une
   semaine tronquee (demarrage ou reprise) : on n a pas eu sept jours pour tenir
   le rythme, l objectif est mis au prorata des jours reellement disponibles,
   arrondi au superieur, jamais au-dessus de l objectif nominal ni sous 1.
   Le calcul se fige sur la premiere seance de la semaine : tant qu aucune seance
   n a eu lieu, l objectif nominal reste affiche, sinon attendre ferait baisser
   la barre tout seul. */
function goalForWeek(st,key){
  const g=st.goal, m=weekFirsts(st), f=m[key];
  if(!f) return g;
  const d=new Date(f);
  const prev=isoWeek(new Date(d.getTime()-7*864e5));
  if(m[prev]) return g;
  const rem=8-(d.getDay()||7);
  return Math.max(1,Math.min(g,Math.ceil(g*rem/7)));
}
function weekStreak(st){
  const m=weekCounts(st); let s=0,i=1;
  const ok=k=>(m[k]||0)>=goalForWeek(st,k);
  if(ok(prevWeekKey(0))) s=1;
  while(ok(prevWeekKey(i))){s++;i++;}
  return s;
}
function thisWeekCount(st){return weekCounts(st)[prevWeekKey(0)]||0;}

/* ============ PROGRESSION ============ */
function perfOf(id){
  const e=DB[id];
  if(!state.perf[id]) state.perf[id]={load:e.load0||0,range:e.reps?e.reps.slice():null,target:e.reps?e.reps[0]:0,best:0,sets:[],date:null};
  const p=state.perf[id];
  if(!p.range&&e.reps) p.range=e.reps.slice();
  if(p.target==null&&p.range) p.target=p.range[0];
  if(e.bnd&&!p.band){ const L=bandLadder(e,state.gear); p.band=(e.band0&&L.indexOf(e.band0)>=0)?e.band0:L[0]; }
  return p;
}
/* Fourchette courante d un exercice : celle de la performance, qui bouge avec
   le cliquet, et non celle du catalogue qui est seulement son plancher. */
function rangeOf(p,e){ return (p&&p.range)||(e&&e.reps)||[0,0]; }
/* Echelle de tenues (v2.17). Un barreau est [tenue, bas, haut] par cote ; la
   position vaut p.tenue, absente au premier barreau : c est ce qui rend la
   migration neutre, aucune ecriture n est necessaire pour etre au depart.
   Une tenue stockee qui n est pas sur l echelle retombe au premier barreau,
   comme une bande inconnue retombe au bas de la sienne. */
/* v2.18 : l echelle de consigne se generalise a la hauteur d assise. Meme
   forme, [valeur, bas, haut], meme regle de position absente au premier
   barreau ; seule la cle stockee change, p.tenue ou p.assise, pour qu aucun
   etat existant ne soit relu autrement. Le metronome reste propre aux tenues :
   tout ce qui chronometre continue de tester e.rhythm. Sur l assise, monter
   d un barreau veut dire DESCENDRE la chaise : le sens se lit sur l indice,
   jamais sur la valeur. */
function rungSpec(e){
  if(e&&e.rhythm&&e.rhythm.ladder) return {k:'tenue',L:e.rhythm.ladder};
  if(e&&e.assise&&e.assise.ladder) return {k:'assise',L:e.assise.ladder};
  return null;
}
function rungVal(e,p){ const s=rungSpec(e); return (s&&p)?p[s.k]:undefined; }
function rungOf(e,v){
  const s=rungSpec(e), L=s&&s.L; if(!L||!L.length) return null;
  let i=0;
  if(v!=null) L.forEach((r,k)=>{ if(r[0]===v) i=k; });
  return {i:i,v:L[i][0],tenue:L[i][0],reps:[L[i][1],L[i][2]],n:L.length,k:s.k};
}
/* Etiquette d un barreau : « 6 s » sur une tenue, « assise 50 cm » sur une
   chaise. */
function rungLbl(e,v){ const s=rungSpec(e); if(!s||v==null) return ''; return s.k==='assise'?'assise '+v+' cm':v+' s'; }
function tenueOf(id,p){ const e=DB[id]; if(!e||!e.rhythm) return null; const r=rungOf(e,p&&p.tenue); return r?r.tenue:null; }
function assiseOf(id,p){ const e=DB[id]; if(!e||!e.assise) return null; const r=rungOf(e,p&&p.assise); return r?r.v:null; }
/* Fourchette de base d un exercice : celle du barreau sur une echelle de
   tenues, celle du catalogue partout ailleurs. */
function baseReps(e,p){ const r=rungOf(e,rungVal(e,p)); return r?r.reps:(e&&e.reps?e.reps:null); }
/* Palier exige par un verrou, et palier sous lequel le dernier passage de
   l exercice source a ete joue (v2.18). Trois portes :
   - loadTop (v2.5) : dernier barreau de l echelle filtree par l inventaire ;
   - kbTop : la kettlebell la plus lourde declaree, seule, sans lestes. Le
     goblet squat ouvre ainsi le squat sur une jambe a 16 kg chez Gabriel et
     non a 22 : les trois barreaux a lestes au-dessus valent chacun environ
     2 % de la charge sur les cuisses ;
   - rungTop : dernier barreau d une echelle de consigne, l assise la plus
     basse.
   Le palier joue se lit sur p.setsLoad ou p.setsRung, ecrits avec les
   series. Absents, sur une performance anterieure au champ, la porte reste
   fermee et la preuve repart du prochain passage, comme la porte de bande en
   v2.12 : un verrou ne s ouvre pas sur une supposition. */
function gatePalier(e){
  const lk=e&&e.lock; if(!lk) return null;
  const src=DB[lk.after], p=state.perf[lk.after]||{};
  if(lk.loadTop||lk.kbTop){
    const L=(src&&src.mode==='fixed')?fixedLadder(lk.after,state.gear):[];
    let x=null;
    if(lk.loadTop) x=L.length?L[L.length-1]:null;
    else { const kb=kbOwned(state.gear); if(kb.length){ const k=kb[kb.length-1]; x=L.find(r=>Math.abs(r.v-k)<0.001)||null; } }
    const j=p.setsLoad;
    return {ok:!!x&&j!=null&&j>=x.v-0.001,exige:x?x.lbl:null,joue:j!=null?loadLabelFor(lk.after,j):null};
  }
  if(lk.rungTop){
    const s=rungSpec(src), top=(s&&s.L.length)?s.L[s.L.length-1][0]:null, j=p.setsRung;
    return {ok:top!=null&&j===top,exige:top!=null?rungLbl(src,top):null,joue:j!=null?rungLbl(src,j):null};
  }
  return null;
}
function isLocked(id){const e=DB[id];return !!(e&&e.lock&&!state.unlocked[id]);}
/* Un barreau depasse quitte son vivier au deblocage de son successeur (v1.15).
   Le mecanisme est explicite, un champ sur l exercice qui remplace, comme
   lock.after et next : pas de moteur generique. Motif : chaque exercice ajoute
   a un vivier reduit la frequence des autres, et l escalier de progression
   ajoutait sans jamais retirer, jusqu a quatre variantes du meme mouvement
   vertical dans le vivier tire. Le retrait ne touche ni l historique, ni la
   fiche, ni la progression de l exercice retire : il ne sort que du tirage. */
/* Un exercice de repli ne sort jamais au tirage : il n apparait qu en cas de
   douleur ou de seance allegee. La bibliotheque les affichait comme les
   autres, avec le meme « a faire », alors qu ils ne viendront jamais d
   eux-memes. Le lien existait dans un sens, la fiche d origine nomme son
   repli ; il manquait en sens inverse. */
function replieDe(id){
  return Object.keys(DB).filter(x=>DB[x].fb===id&&x!==id);
}
/* Lien inverse de la table de substitution, pour la bibliotheque et la fiche.
   La v1.16 avait donne ce sens inverse aux replis douleur, qui apparaissaient
   comme des exercices ordinaires alors qu ils ne viennent jamais d eux-memes.
   Les substituts materiels ont le meme besoin, avec un motif different a
   nommer : ils remplacent une position quand le materiel manque. */
/* Un exercice est servi quand toutes ses ressources sont declarees. */
/* PROFILS (v2.0). Deux a trois profils nommes, dont le domicile qui ne se
   supprime pas. La bascule est manuelle et ne s eteint jamais toute seule :
   une expiration automatique se declencherait toujours au mauvais moment, et
   l outil n a aucun moyen de savoir qu on est rentre.
   Invariant : state.gear EST l inventaire du profil actif, unique poignee de
   lecture et d ecriture pour tout le reste du code. state.profils ne conserve
   que le nom et l inventaire des profils inactifs ; celui du profil actif y est
   rafraichi a chaque enregistrement, pour qu une sauvegarde exportee ne porte
   jamais deux versions divergentes du meme inventaire. */
const PROFIL_MAX=3;
function profilId(){ return state.profil||'domicile'; }
function profilNom(id){ const p=(state.profils||{})[id||profilId()]; return p?p.nom:'Domicile'; }
function horsDomicile(){ return profilId()!=='domicile'; }
function syncProfil(){
  if(!state.profils) state.profils={};
  if(!state.profils[profilId()]) state.profils[profilId()]={nom:'Domicile'};
  state.profils[profilId()].gear=state.gear;
}
function switchProfil(id){
  if(!state.profils||!state.profils[id]||id===profilId()) return;
  syncProfil();
  state.profil=id;
  state.gear=JSON.parse(JSON.stringify(state.profils[id].gear||DEFAULT_GEAR));
  save(); render();
}
/* Un profil neuf part VIDE (v2.1), et la copie devient un geste explicite.
   La justification d origine, « il est plus court d en decocher que de tout
   cocher », n est vraie que si le profil de destination ressemble au domicile.
   Mesure sur l inventaire reel : pour declarer « rien du tout », 22 gestes
   depuis une copie contre 0 depuis vide ; pour « un elastique vert plus un
   ancrage », 19 contre 4 ; la copie ne l emporte que sur un profil riche,
   9 contre 13. Et l argument de justesse est deja au carnet, pose pour le
   premier lancement : une liste vide se remplit, une liste pre-remplie se
   survole, un inventaire pre-rempli au materiel d ailleurs se valide sans
   etre lu. La copie reste offerte pour le cas ou elle gagne. */
function addProfil(nom,src){
  if(Object.keys(state.profils||{}).length>=PROFIL_MAX){ flash('Trois profils au maximum'); return; }
  const n=(nom||'').trim(); if(!n) return;
  let id='p'+Date.now().toString(36);
  syncProfil();
  const base=(src&&state.profils[src])?state.profils[src].gear:EMPTY_GEAR;
  state.profils[id]={nom:n,gear:JSON.parse(JSON.stringify(base))};
  state.profil=id;
  state.gear=JSON.parse(JSON.stringify(state.profils[id].gear));
  save(); render();
}
function renameProfil(id,nom){
  const n=(nom||'').trim();
  if(!n||!state.profils||!state.profils[id]) return;
  state.profils[id].nom=n; save(); render();
}
/* La confirmation vit dans l interface en v2.0, en deux temps, et non
   dans un dialogue systeme : cette fonction ne s appelle qu une fois la
   decision prise. */
function delProfil(id){
  if(id==='domicile'||!state.profils||!state.profils[id]) return;
  delete state.profils[id];
  if(profilId()===id){ state.profil='domicile'; state.gear=JSON.parse(JSON.stringify(state.profils.domicile.gear||DEFAULT_GEAR)); }
  save(); render();
}
/* Qualification materielle d une lecture. Une performance n est pas qualifiee
   quand le materiel declare n a pas permis de servir le niveau canonique, donc
   quand la prescription a ete bornee. Ce n est PAS une propriete du profil :
   loin de chez soi, un exercice dont le barreau est disponible se joue et
   compte normalement, et un exercice substitue progresse pour son propre
   compte, avec sa propre echelle. Seul le meme exercice joue plus bas que son
   niveau canonique produit une lecture incomparable. */
function nonQualifie(id){
  const g=gearPerf(id);
  return !!g.gearCut;
}
function servi(id,gear){
  return (NEEDS[id]||[]).every(k=>aRes(k,gear));
}
/* Variante de repli REALISABLE ici (v2.0). Le chemin des replis date de la
   v1.8, il est anterieur au resolveur et ne consultait pas l inventaire : trois
   couples etaient deja dans ce cas avant la marche basse, les elevations laterales repliant
   sur le tirage doux, le rowing kettlebell et le tirage en suspension repliant
   sur le rowing elastique. Sans elastique, le geste de protection proposait un
   exercice impossible. La marche basse en aurait ajoute un quatrieme.
   Meme doctrine que le resolveur : une chaine epuisee ne fabrique pas un
   equivalent, elle laisse la perte visible. Ici la perte est le bouton lui-meme,
   qui n apparait pas ; « Passer » reste la sortie.
   La fiche, elle, continue de nommer le repli : elle decrit l exercice et non
   la seance. */
function fbOf(id,gear){
  const f=DB[id]&&DB[id].fb;
  if(!f||!DB[f]) return null;
  return servi(f,gear||state.gear)?f:null;
}
/* Resolution d une position (v2.0). L intention d une position est un schema
   moteur, pas un exercice : quand le materiel manque, la position descend sa
   chaine jusqu au premier substitut servi. La chaine est ordonnee du plus
   proche de l intention au plus degrade, et une chaine epuisee laisse la
   position non resolue plutot que d inventer un equivalent qui n en est pas
   un. Sans etat : la resolution se recalcule a chaque tirage, donc rendre un
   materiel releve la position toute seule, sans migration ni verrou. */
function resolvePos(slot,i,gear){
  const ref=SLOTS[slot].pool[i];
  if(!ref) return null;
  if(servi(ref,gear)) return ref;
  const ch=(SUBS[slot]||{})[i]||[];
  for(const x of ch) if(servi(x,gear)) return x;
  return null;
}
/* positions tirables : ni verrouillees, ni retirees, ni non resolues */
function posTirables(slot,gear){
  const out=[];
  SLOTS[slot].pool.forEach((id,i)=>{
    if(isLocked(id)||estRetire(id)) return;
    if(resolvePos(slot,i,gear)) out.push(i);
  });
  return out;
}
/* schemas non servis, pour le bandeau et l editeur d inventaire */
function posPerdues(gear){
  const out=[];
  SLOT_ORDER.forEach(s=>SLOTS[s].pool.forEach((id,i)=>{
    if(isLocked(id)||estRetire(id)) return;
    if(!resolvePos(s,i,gear)) out.push({slot:s,i:i,ref:id});
  }));
  return out;
}
/* libelles des schemas non servis, dedoublonnes : deux positions du meme
   schema ne se comptent qu une fois, sinon le bandeau annoncerait deux pertes
   la ou l utilisateur n en ressent qu une */
function schemasPerdus(gear){
  const out=[];
  posPerdues(gear).forEach(x=>{
    const n=(SCHEMA[x.slot]||[])[x.i]||DB[x.ref].nom;
    if(out.indexOf(n)<0) out.push(n);
  });
  return out;
}
/* Progressions disponibles dans ce profil (v2.0).
   Denominateur : les exercices tirables dont l echelle depend de l inventaire,
   modes charge et fixe, plus tout exercice a bande. Les exercices en
   repetitions pures en sont dehors, leur marge ne depend pas du materiel, et
   les paliers tenus aussi, ils ont choisi de ne pas monter.
   Numerateur : ceux qui ont un barreau disponible ici strictement au-dessus de
   leur niveau canonique, ET dont la prescription du jour n est pas bornee. Un
   exercice borne produit une lecture non qualifiee, donc il ne peut pas
   progresser du tout ici : l annoncer comme ayant une marche serait faux.
   Le denominateur, lui, ne bouge pas avec le bornage : c est l ecart entre les
   deux nombres qui porte l information sous un profil reduit.
   Lecture pure, aucune ecriture : perfOf cree l entree manquante avec les
   valeurs du catalogue, exactement comme le fait le rendu d une fiche. */
/* Le bornage se recalcule sur l inventaire passe en parametre et non par
   gearPerf, qui lit state.gear : le compteur doit pouvoir juger un profil qui
   n est pas le profil actif, ne serait-ce que pour se laisser mesurer. */
function aUneMarche(id,gear){
  const e=DB[id], p=perfOf(id);
  if(e.bnd){
    const b=bandBorne(e,p.band,gear);
    if(b.cut||b.up) return false;
    const O=bandOrder(e), r=O.indexOf(p.band);
    return bandLadder(e,gear).some(x=>O.indexOf(x)>r);
  }
  if(e.mode==='fixed'||e.mode==='load'){
    const l=loadBorne(id,p.load,gear);
    if(l.cut||l.up) return false;
    const fc=(e.mode==='fixed')?fixedCap(id):null;
    const L=(e.mode==='fixed')?fixedLadder(id,gear).map(x=>x.v):loadLadderProg(gear);
    return L.some(v=>v>p.load+0.01&&(fc==null||v<=fc+0.01));
  }
  return false;
}
function progDispo(gear){
  const g=gear||state.gear, ids=[];
  SLOT_ORDER.forEach(s=>posTirables(s,g).forEach(i=>{
    const x=resolvePos(s,i,g); if(x&&ids.indexOf(x)<0) ids.push(x);
  }));
  const dep=ids.filter(id=>{
    const e=DB[id];
    return (e.mode==='load'||e.mode==='fixed'||e.bnd)&&!perfOf(id).hold;
  });
  return {marche:dep.filter(id=>aUneMarche(id,g)).length,total:dep.length};
}
function schemasServis(gear){
  const tot=SLOT_ORDER.reduce((a,s)=>a.concat((SCHEMA[s]||[]).filter((n,i)=>!isLocked(SLOTS[s].pool[i])&&!estRetire(SLOTS[s].pool[i]))),[]);
  const uniq=[]; tot.forEach(n=>{ if(uniq.indexOf(n)<0) uniq.push(n); });
  return {servis:uniq.length-schemasPerdus(gear).length,total:uniq.length};
}
function substitutDe(id){
  const out=[];
  SLOT_ORDER.forEach(s=>{
    const t=SUBS[s]||{};
    Object.keys(t).forEach(i=>{
      if(t[i].indexOf(id)>=0){
        const ref=SLOTS[s].pool[i];
        if(ref&&ref!==id&&out.indexOf(ref)<0) out.push(ref);
      }
    });
  });
  return out;
}
function estSubstitut(id){
  if(SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0)) return false;
  return substitutDe(id).length>0;
}
function estRepli(id){
  if(SLOT_ORDER.some(s=>SLOTS[s].pool.indexOf(id)>=0)) return false;
  return replieDe(id).length>0;
}
function estRetire(id){
  const u=state.unlocked||{};
  if(!Object.keys(u).some(x=>u[x]&&DB[x]&&DB[x].retire===id)) return false;
  /* Un retrait ne doit pas orpheliner un verrou. Un exercice retire n enregistre
     plus rien, et un verrou qui lit son dernier passage deviendrait
     definitivement infranchissable : le retrait attend que plus aucun verrou
     ferme ne lise cet exercice. La condition se derive des donnees, ce n est pas
     un jugement. */
  const lu=Object.keys(DB).some(x=>DB[x].lock&&DB[x].lock.after===id&&!u[x]);
  return !lu;
}
function unitOf(e){return e.mode==='time'?'s':(e.mode==='circuit'?'rounds':(e.rhythm?'tenues':'reps'));}
/* Un palier tenu fige le niveau d un exercice : la cible cesse de monter, la
   charge et la bande cessent d evoluer vers le haut. Le filet de securite
   reste actif. Toute montee manuelle de charge libere le palier, une descente
   le conserve : baisser n a jamais valeur de « je repars en avant ». */
function isHeld(id){ const p=state.perf[id]; return !!(p&&p.hold); }
function setHold(id,v){
  const p=perfOf(id);
  if(v){ p.hold=true; p.holdAt=new Date().toISOString(); }
  else { delete p.hold; delete p.holdAt; }
  /* l ecart tire/pousse se mesure depuis le dernier changement de paliers */
  state.div={push:0,pull:0};
}
/* ============ SEANCE ALLEGEE (v1.8) ============ */
/* Mode ponctuel, choisi sur l accueil avant de lancer : le jour ou on est
   courbature partout, faire une seance amoindrie plutot que rien.
   Trois effets, decides ensemble :
   - substitution par la variante de repli la ou elle existe (12 exercices sur 36) ;
   - allegement de la cible ailleurs : -30 % arrondi a l inferieur, jamais sous le
     bas de fourchette ; quand le calcul passerait dessous, le debordement est
     encaisse par la charge (au moins -20 % sur l echelle continue des halteres,
     un barreau sur les echelles ordinales que sont les bandes et le kettlebell) ;
   - gel de la progression dans les deux sens sur toute la seance.
   Remonter les repetitions apres une descente de barreau a ete ecarte : ce serait
   reconstituer l effort qu on cherche a retirer. */
let lightMode=false;
function lightOn(){
  if(typeof cur!=='undefined'&&cur&&!cur.recap) return !!cur.light;
  return lightMode;
}
/* ============ BORNAGE MATERIEL A LA LECTURE (v2.0) ============
   Regle : l inventaire ne modifie jamais perf, il borne a la lecture. Le niveau
   canonique reste ce que la progression a ecrit, et la prescription du jour est
   ce que le materiel declare permet d en realiser. Consequence directe : un
   materiel decoche puis recoche restitue exactement l etat d avant, ce que la
   v1.18 detruisait definitivement en ecrivant dans perf depuis les reglages.
   L ordre des niveaux appartient a l echelle, jamais a l inventaire : celui-ci
   determine seulement lesquels sont realisables ici. */
function gearPerf(id){
  const e=DB[id], p=perfOf(id);
  const out={band:p.band,load:p.load,gearCut:false,gearUp:false};
  if(e.bnd&&p.band!=null){
    const b=bandBorne(e,p.band,state.gear);
    out.band=b.band; if(b.up) out.gearUp=true; if(b.cut||b.up) out.gearCut=true;
  }
  if(e.mode==='fixed'||e.mode==='load'){
    const l=loadBorne(id,p.load,state.gear);
    out.load=l.load; if(l.up) out.gearUp=true; if(l.cut||l.up) out.gearCut=true;
  }
  return out;
}
/* charge a monter reellement, pour le materiel a sortir et le comptage des
   remontages : la charge bornee et non la charge canonique */
function prescLoad(id){ return gearPerf(id).load; }
function lightPerf(id,vue){
  const e=DB[id], p=vue||perfOf(id);
  const out={target:p.target,load:p.load,band:p.band,repsCut:false,loadCut:false};
  if(!p.range||e.mode==='stretch'||e.cat==='cardio'||e.mode==='circuit') return out;
  const low=p.range[0], base=p.target||low;
  let t=Math.floor(base*0.7);
  if(e.mode==='time') t=Math.floor(t/5)*5;
  if(t>=low){ out.target=t; out.repsCut=t<base; return out; }
  out.target=low; out.repsCut=low<base;
  /* debordement sur la charge : le seul levier restant en bas de fourchette */
  if(e.mode==='load'){
    const L=loadLadder(state.gear), goal=p.load*0.8;
    for(let i=L.length-1;i>=0;i--) if(L[i]<=goal+1e-9){ if(L[i]<p.load-1e-9){out.load=L[i];out.loadCut=true;} break; }
  } else if(e.mode==='fixed'){
    const L=fixedLadder(id,state.gear);
    let i=-1; for(let k=0;k<L.length;k++) if(Math.abs(L[k].v-p.load)<0.01){i=k;break;}
    if(i>0){ out.load=L[i-1].v; out.loadCut=true; }
  } else if(e.bnd){
    const nb=nextBandFor(e,p.band,state.gear,-1);
    if(nb&&nb!==p.band){ out.band=nb; out.loadCut=true; }
  }
  return out;
}
/* Lecture des cibles a afficher : identique a perfOf hors mode allege, copie
   allegee sinon. Toujours une copie en allege : rien ne doit toucher l etat.
   sub=true signale un exercice deja remplace par sa variante de repli : il ne
   recoit pas la baisse de cible en plus, sinon l allegement compterait double.
   La copie garde quand meme la marque light, qui gele l interface. */
/* perfFor est une lecture, jamais une poignee d ecriture : elle rend toujours
   une copie bornee, meme hors mode allege. Les seuls ajustements manuels en
   seance passent par perfOf, qui rend l objet vivant. Un seul chemin pour
   prescrire, un seul pour ecrire. L allegement se calcule sur la vue bornee et
   non sur le niveau canonique, sinon il pourrait descendre vers un barreau que
   le materiel declare ne realise pas. */
function perfFor(id,sub){
  const p=perfOf(id), g=gearPerf(id);
  const vue=Object.assign({},p,{band:g.band,load:g.load,gearCut:g.gearCut,gearUp:g.gearUp});
  if(!lightOn()) return vue;
  if(sub) return Object.assign(vue,{light:true,repsCut:false,loadCut:false});
  const l=lightPerf(id,vue);
  return Object.assign(vue,{target:l.target,load:l.load,band:l.band,light:true,repsCut:l.repsCut,loadCut:l.loadCut});
}
function heldCount(){ return Object.keys(state.perf).filter(id=>DB[id]&&state.perf[id].hold).length; }
/* fin de serie : on enregistre, et on evalue la double progression en fin d exercice.
   full=false quand la lecture n est pas exploitable (serie sautee, repli douleur,
   seance quittee) : on enregistre, le filet de securite joue, mais rien ne monte. */
function applyProgress(id,sets,full,light,unqual){
  const e=DB[id], p=perfOf(id), msgs=[];
  if(full===undefined) full=true;
  /* PROVENANCE D UNE LECTURE, trois regimes : exploitable, issue d une seance
     allegee, non qualifiee par le materiel. Une information s enregistre
     toujours, une action exige les trois feux verts.
     Les deux marqueurs sont poses sur la performance et non sur la seance : la
     v1.15 avait deja fait ce deplacement pour l allegee, parce que la seance
     normale suivante lisait le dernier passage sans savoir d ou il venait. Le
     marqueur materiel suit le meme modele.
     La sortie de regime est placee AVANT toute ecriture d action, y compris le
     record et le meilleur de bande : en v1.18 ces deux-la etaient ecrits
     au-dessus de la sortie, et la branche bandGate de checkUnlocks lisait le
     meilleur de bande sans garde de provenance. Ecrit ainsi, aucun chemin ne
     peut diverger a nouveau. */
  p.sets=sets.slice(); p.date=new Date().toISOString();
  /* v2.12 : le barreau sous lequel les series ont ete jouees s ecrit ici, avec
     elles et avant toute progression, donc p.band vaut encore la valeur d avant
     seance. Il decrit p.sets, comme p.date : sa place est cette ligne et non
     plus bas, pour que le couple reste coherent y compris en seance allegee ou
     sous materiel non conforme, ou les provenances suffisent a bloquer l action.
     Ce qui n est pas rejouable s ecrit au moment ou il est vrai (v2.4). */
  if(e.bnd) p.setsBand=p.band||null;
  /* v2.18 : meme regle pour la charge et pour le barreau de consigne. Le
     verrou « au dernier cran » lisait p.load APRES la progression de fin de
     seance : deux series de 25 jouees a l avant-dernier cran des mollets
     lestes montaient la charge au dernier, et le successeur s ouvrait sur
     des series qui n y avaient pas ete faites. Il lit desormais ceci. */
  if(e.mode==='load'||e.mode==='fixed') p.setsLoad=p.load||0;
  if(rungSpec(e)) p.setsRung=rungOf(e,rungVal(e,p)).v;
  if(light) p.lightSets=true; else delete p.lightSets;
  if(unqual) p.unqualSets=true; else delete p.unqualSets;
  if(light||unqual) return msgs;
  const best=Math.max.apply(null,sets.concat([0]));
  if(best>p.best) p.best=best;
  /* le module cardio est un bloc de duree fixe : rien a faire progresser */
  if(e.cat==='cardio'||e.mode==='circuit') return msgs;
  if(!p.range||!sets.length) return msgs;
  /* Regle des bornes (v1.15) : les predicats d evenement se lisent sur la
     fourchette d entree, les recalibrages sur la fourchette courante. La v2.16
     avait retire toute ecriture de p.range ; la v2.17 en reintroduit deux, les
     deux sens de l echelle de tenues, ou la fourchette EST celle du barreau.
     La reaffectation avant nextTarget n est donc plus vraie par construction :
     elle est ce qui fait suivre les bornes au barreau qui vient de changer. */
  let low=p.range[0], top=p.range[1];
  const step=(e.mode==='time')?5:1;
  /* Cible suivante = plus haute des deux dernieres lectures + 1, arrondie au
     multiple du pas de l exercice, bornee a la fourchette (v1.11, fenetre en
     v2.14). Chaque lecture est la plus petite serie du passage. Le pas vaut 1
     en repetitions et 5 sur les tenues chronometrees : monter une planche
     d une seconde par passage demandait 40 passages pour aller de 20 a 60 s,
     soit environ un an au rythme de rotation reel, la ou les autres exercices
     franchissent leur fourchette en 8 a 14 passages. Le « + 1 » avant
     l arrondi est indispensable : sans lui, tenir exactement sa cible ne
     ferait jamais rien monter. Les bornes des exercices tenus sont deja
     toutes multiples de 5, l arrondi ne peut donc pas sortir de la
     fourchette. Les etirements et l echauffement ne passent pas ici.
     FENETRE DE DEUX PASSAGES (v2.14). Avec un horizon d un seul passage, une
     mauvaise seance a 12 sur une cible a 16 recalait la cible a 13, sans un
     mot : un seul jour hors forme effacait l ancre. Le principe d architecture
     dit de decider sur l observable, il n oblige pas a oublier l avant-dernier
     passage. p.prevMin porte la plus petite serie du passage exploitable
     precedent au palier courant ; la cible vaut max(prevMin, minSet) + 1. Une
     mauvaise seance est absorbee, deux consecutives font redescendre, et le
     recul devient un evenement qui se dit au recapitulatif. La memoire se
     remet a zero a tout changement de palier, montee, descente et ajustement
     manuel de charge ou de bande (le relevement de fourchette, qui en faisait
     partie, n existe plus depuis la v2.16) : une lecture
     faite a un autre palier n est pas comparable. Elle ne s ecrit que sur une
     lecture exploitable et complete, le minimum d un passage ampute etant
     biaise vers le haut, motif deja retenu pour interdire la descente sur
     journal tronque. Un palier tenu l ecrit sans la lire : c est une
     observation, pas une decision. Absente, pas de memoire, aucune migration.
     Ecarte, le cliquet qui ne redescend jamais dans la fourchette : il ment
     apres toute vraie regression, et garder 16 apres un 12 exige de savoir
     que c etait une mauvaise journee, ce que l outil n observe pas. */
  const nextTarget=v=>Math.max(low,Math.min(top,Math.ceil((v+1)/step)*step));
  const plafond=()=>msgs.push('Plafond atteint sur '+e.nom+' : '+(nextFor(id,state.gear)||'pas de marche outillée au-delà pour l\'instant'));
  /* Grace post-montee (v1.15) : le premier passage suivant une montee de
     barreau ne peut pas declencher de descente, le temps de s adapter. Elle
     est consommee par tout passage complet, palier tenu compris : elle est
     liee au passage, pas au regime. Une seance allegee est deja sortie plus
     haut, une lecture partielle ne consomme pas. Elle est lue puis effacee
     avant la montee, sinon une nouvelle pose serait aussitot annulee. */
  const grace=!!p.grace;
  if(full) delete p.grace;
  const monte=!p.hold&&full&&sets.every(v=>v>=top);
  const minSet=Math.min.apply(null,sets), maxSet=Math.max.apply(null,sets);
  let montee=false, descendu=false;
  if(monte){
    if(e.mode==='load'){
      const nl=nextLoadProg(p.load,state.gear,1);
      if(nl>p.load){ p.load=nl; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : charge montée à '+fmtKg(nl)+', retour à '+low+' reps'); }
      else msgs.push(e.nom+' : charge maximale disponible avec ton matériel, ajoute des disques pour continuer');
    } else if(e.bnd){
      /* echelle ordinale de bandes : barreau suivant vers le plus dur.
         Le message nomme le barreau et rien d autre (v2.21). Il portait « dans
         le dos », vrai des seules pompes aux poignees et concatene a tous les
         exercices a bande de resistance : les face pulls, ancres a hauteur de
         visage, annoncaient une bande dans le dos. Un placement est une
         consigne de montage, elle se lit avant l exercice et la puce de
         materiel la porte deja, conditionnee a l exercice ; ce recapitulatif se
         lit une fois la seance finie. La branche « aucune » disparait avec :
         bandLabel la traite. Le sens descendant, lui, n a jamais porte de
         placement, les deux sens sont desormais symetriques. */
      const nb=nextBandFor(e,p.band,state.gear,1);
      if(nb){ p.band=nb; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : '+(e.bnd==='ass'?'moins d\'aide, ':'')+bandLabel(nb)+', retour à '+low+' reps'); }
      else plafond();
    } else if(e.mode==='fixed'){
      /* echelle numerique kettlebell + lestes (+ haltere pour le rowing) */
      const L=fixedLadder(id,state.gear), fc=fixedCap(id);
      let nl=null; for(const x of L) if(x.v>p.load+0.01&&(fc==null||x.v<=fc+0.01)){ nl=x; break; }
      if(nl){ p.load=nl.v; p.target=low; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : charge montée à '+nl.lbl+', retour à '+low+' reps'); }
      else plafond();
    } else if(e.rhythm){
      /* Echelle de tenues (v2.17) : barreau suivant, fourchette du barreau,
         cible au bas, grace, comme une bande. C est la seule ecriture de
         p.range depuis la v2.16, et c est un vrai changement de palier : la
         tenue cumulee par cote passe de 36 a 24 s puis de 48 a 30 s, un
         tiers perdu au retour au bas, comme a une montee de charge. */
      const r=rungOf(e,p.tenue);
      if(r.i<r.n-1){
        const nr=e.rhythm.ladder[r.i+1];
        p.tenue=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : tenues de '+nr[0]+' s, retour à '+nr[1]+' par côté'); }
      else plafond();
    } else if(e.assise){
      /* Echelle d assise (v2.18), meme geste que les tenues : barreau
         suivant, chaise plus basse, fourchette du barreau, cible au bas,
         grace. */
      const r=rungOf(e,p.assise);
      if(r.i<r.n-1){
        const nr=e.assise.ladder[r.i+1];
        p.assise=nr[0]; p.range=[nr[1],nr[2]]; p.target=nr[1]; state.loadUps++; montee=true; p.grace=true;
        msgs.push('⚖️ '+e.nom+' : assise à '+nr[0]+' cm, retour à '+nr[1]+' par côté'); }
      else plafond();
    } else {
      /* Poids du corps et tenues : aucune echelle. Jusqu en v2.15 le moteur
         « relevait » ici la fourchette d un pas, bas+1 et haut+1, tant qu un
         champ cap le permettait, cible portee au nouveau haut et sans grace :
         du +1 lineaire habille en fourchette, qui affichait « Marche 1 sur 3 »
         pour un escalier que personne n avait dessine. Retire en v2.16 : le
         haut de fourchette est le plafond, et ce qui suit est la marche
         ecrite, un successeur derriere verrou ou une consigne manuelle. */
      plafond();
    }
  }
  /* Au plafond, la cible vaut le haut (v2.16). Quand toutes les series
     atteignent le haut sans qu aucun palier ne bouge, sommet d echelle ou
     fourchette sans echelle, la cible n etait pas recalculee : une cible a 12
     restait a 12 apres un 15/15/15, et ne se rattrapait qu au passage suivant
     par la memoire de fenetre. Elle vaut desormais le haut, qui est ce que
     nextTarget aurait rendu, borne par la fourchette. */
  if(monte&&!montee) p.target=top;
  if(!monte){
    /* Filet de securite (v1.15). Le critere se deplace de la serie vers le
       passage : [15,15,7] descendait, ne descend plus et devient un signal ;
       [9,9,9] ne descendait pas, descend desormais. Ni assouplissement ni
       durcissement. La borne est stricte : le plancher atteint est une
       reussite dans la fourchette, pas un echec. Mesure sur les sept
       premieres seances reelles : quatorze passages a max = bas, que la borne
       large aurait tous retrogrades, zero passage sous le plancher. La
       constante « bas - 2 » disparait sans remplacement. */
    const echec=maxSet<low, partiel=minSet<low&&maxSet>=low;
    /* La descente exige une lecture complete : « toutes les series » n est pas
       evaluable sur un journal ampute, ou l affirmation devient d autant plus
       facile que le journal est court. L information, elle, passe toujours. */
    if(echec&&full&&!grace){
      if(e.mode==='load'){
        if(p.load>0){
          const dl=nextLoadProg(p.load,state.gear,-1);
          if(dl<p.load){ p.load=dl; descendu=true; msgs.push(e.nom+' : charge redescendue à '+fmtKg(dl)+', on consolide avant de repartir'); }
        }
      } else if(e.bnd){
        const pb=nextBandFor(e,p.band,state.gear,-1);
        if(pb){ p.band=pb; descendu=true;
          msgs.push(e.nom+' : '+(e.bnd==='ass'?'un peu plus d\'aide, '+bandLabel(pb):(pb==='aucune'?'retour sans bande':'retour à la '+bandLabel(pb)))+', on consolide avant de repartir'); }
      } else if(e.mode==='fixed'){
        const L=fixedLadder(id,state.gear);
        let dl=null; for(let i=L.length-1;i>=0;i--) if(L[i].v<p.load-0.01){ dl=L[i]; break; }
        if(dl){ p.load=dl.v; descendu=true; msgs.push(e.nom+' : charge redescendue à '+dl.lbl+', on consolide avant de repartir'); }
      }
      else if(e.rhythm){
        /* Barreau inferieur de l echelle de tenues (v2.17). Au premier
           barreau, comme au poids du corps : seul le signal passe. La cible se
           recale ensuite par nextTarget sur la fourchette du barreau, donc au
           bas, comme apres une descente de charge : on consolide. */
        const r=rungOf(e,p.tenue);
        if(r.i>0){ const pr=e.rhythm.ladder[r.i-1]; p.tenue=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;
          msgs.push(e.nom+' : retour aux tenues de '+pr[0]+' s, on consolide avant de repartir'); }
      }
      else if(e.assise){
        /* Barreau d assise inferieur (v2.18) : la chaise remonte. C est le
           filet qui couvre une entree a 40 cm trop raide, deux passages de
           suite sous le plancher, la grace protegeant le premier. */
        const r=rungOf(e,p.assise);
        if(r.i>0){ const pr=e.assise.ladder[r.i-1]; p.assise=pr[0]; p.range=[pr[1],pr[2]]; descendu=true;
          msgs.push(e.nom+' : retour à l\'assise de '+pr[0]+' cm, on consolide avant de repartir'); }
      }
      /* Poids du corps et tenues : pas de barreau inferieur. Le miroir du
         relevement, la fourchette qui redescendait d un pas (v1.15), est parti
         avec lui en v2.16 : la fourchette ne bouge plus dans aucun sens, seul
         le signal passe. */
    }
    /* Un seul message par evenement : la descente quand elle a lieu, le signal
       sinon. La grace, la lecture partielle et l absence de barreau inferieur
       empechent le geste, jamais l information. */
    /* Le nom de l exercice ouvre le message : ces deux signaux n entrainent
       aucune action, donc rien dans le recapitulatif ne dit de quel exercice
       ils parlent. « Aucune série au plancher » est exact que la lecture soit
       complete ou ampute, la ou « toutes les séries » aurait ete faux sur un
       journal tronque. */
    const low0=low;
    low=p.range[0]; top=p.range[1];
    const prev=p.target;
    /* Fenetre de deux passages (v2.14) : la reference est la plus haute des
       deux dernieres lectures. Apres une descente, le passage a ete joue a
       l ancien palier et la memoire ne vaut plus : la reference retombe sur
       la seule lecture du jour, ce qui donne le bas de fourchette. */
    const fen=full&&!descendu&&p.prevMin!=null;
    const ref=fen?Math.max(p.prevMin,minSet):minSet;
    /* la cible ne monte ni sur un palier tenu, ni sur une lecture partielle */
    if(!p.hold&&full) p.target=nextTarget(ref);
    else if(p.target>top) p.target=top;
    /* Le recul de cible se dit au recapitulatif (v2.14). La v1.15 le taisait
       dans la fourchette, au motif qu il etait le moteur qui fonctionne et non
       un evenement : sur un horizon d un passage, il arrivait des qu un
       passage etait moins bon que le precedent. Sur deux passages, il signifie
       deux passages consecutifs sous la cible, ce qui informe. Un recul sans
       memoire, premier passage apres un ajustement manuel ou sur une
       sauvegarde anterieure, reste muet : il n a qu un passage derriere lui,
       la v1.15 tient pour lui. Un seul message par evenement : l echec sans
       descente et la lecture partielle portent deja le leur, la clause
       « cible recalee » s y ajoute quand elle a lieu, et le message autonome
       ne sort que hors de ces deux cas. Le bas cite par l echec est celui de
       la fourchette d entree. v2.23 : le message autonome porte les deux
       lectures, l ancienne puis celle du jour. Sans elles, un recul qui suit
       une remontee (6 puis 7 sous une cible a 9) se lisait comme une
       regression, alors que la direction est visible dans les deux nombres.
       p.prevMin porte encore ici l ancienne lecture, il n est reecrit que
       plus bas. */
    const recul=prev>p.target?', cible recalée de '+prev+' à '+p.target:'';
    if(echec&&!descendu) msgs.push(e.nom+' : aucune série au plancher ('+maxSet+' pour un bas à '+low0+')'+recul);
    else if(partiel) msgs.push(e.nom+' : des séries sous le plancher ('+minSet+' pour un bas à '+low+')'+recul);
    else if(recul&&fen&&!p.hold) msgs.push(e.nom+' :'+recul.slice(1)+', deux passages en dessous ('+p.prevMin+' puis '+minSet+')');
  }
  /* La memoire de la fenetre s ecrit sur toute lecture exploitable et
     complete, palier tenu compris, et se remet a zero quand le palier a
     change pendant ce passage : la lecture du jour a ete faite a l ancien
     palier, elle ne dit rien du nouveau. */
  if(full){ if(montee||descendu) delete p.prevMin; else p.prevMin=minSet; }
  /* div compte les montees reussies, pas les passages au plafond : un exercice
     bloque au dernier barreau gonflait le compteur a chaque passage */
  if(montee&&e.cat){ state.div=state.div||{push:0,pull:0}; if(state.div[e.cat]!=null) state.div[e.cat]++; }
  return msgs;
}
/* Ecart tire/pousse cree par les paliers tenus. Un seul sens est signale :
   le pousse qui prend de l avance sur un tire tenu, defavorable aux epaules.
   L inverse est benin et ne declenche rien. */
const DIV_SEUIL=3;
function divergence(){
  const d=state.div||{push:0,pull:0};
  const tireTenu=Object.keys(state.perf).some(id=>DB[id]&&DB[id].cat==='pull'&&state.perf[id].hold);
  const ecart=(d.push||0)-(d.pull||0);
  return (tireTenu&&ecart>=DIV_SEUIL)?ecart:0;
}
/* Deblocages. Le volume de la seance est passe en parametre plutot que lu dans
   un global : la fonction doit pouvoir etre rejouee sur une seance corrigee
   avec le volume de cette seance, et non avec le reglage courant. Une seance
   allegee n ouvre aucun verrou : un mode qui ne fait rien monter ne doit rien
   deverrouiller non plus. Quatre des cinq sources de verrou ont une variante de
   repli et sont remplacees en allege, donc n enregistrent rien ; le souleve
   roumain n en a pas, il est joue a charge reduite, et son compte de
   repetitions alimentait le verrou du swing, le mouvement le plus dynamique du
   catalogue pour le rachis. Aucun verrou ne lit plus best : c est un maximum
   historique que l outil ne sait pas corriger. */
/* Enonce d un verrou : le compte exige depend du volume, il se calcule a
   l affichage plutot que d etre fige dans la donnee. */
function lockCond(e){
  if(!e||!e.lock) return '';
  const n=Math.min(e.lock.minSets||1,effRounds());
  return String(e.lock.cond).replace('{n}',n);
}
function checkUnlocks(vol,light,prevu){
  const msgs=[];
  if(light) return msgs;
  Object.keys(DB).forEach(id=>{
    const e=DB[id];
    if(e.lock&&!state.unlocked[id]){
      const src=DB[e.lock.after], p=state.perf[e.lock.after];
      if(!p) return;
      /* Une seule lecture de repetitions pour tous les verrous (v2.12). Elle
         porte sur des series de la meme seance, pas sur un maximum historique :
         on lit la derniere seance enregistree. Le compte exige est plafonne par
         le volume joue, sinon « 3 series de 6 » etait arithmetiquement
         irrealisable au volume de 2 et le verrou ne s ouvrait jamais. Le
         plafond porte sur le volume et non sur le nombre de series
         enregistrees : sinon une seance quittee apres une seule serie suffirait
         a ouvrir.
         Le volume qui compte est celui reellement prevu pour l exercice source.
         Les deux conditions de niveau, barreau de bande et charge, s ajoutent
         ensuite en conjonction : aucune ne remplace la lecture des repetitions,
         et aucune branche ne peut donc en avoir une version a elle. */
      const v=(prevu&&prevu[e.lock.after])||vol||roundsOf(state);
      const k=Math.min(e.lock.minSets||1,v);
      let ok=(p.sets||[]).filter(x=>x>=e.lock.need).length>=k;
      /* Porte de bande (v2.0, alignee en v2.12). Le barreau exige est le plus
         dur de l ECHELLE, et non de l echelle filtree par l inventaire actif :
         une premiere ecriture du chantier lisait bandLadder, si bien que sous
         un profil ne possedant que la verte, dix repetitions avec l assistance
         maximale ouvraient les tractions strictes, la verte etant alors le
         dernier barreau disponible. Temoin mesure avant correction, et rejoue a
         chaque build. Consequence assumee : qui ne possede le jaune dans aucun
         profil ne peut pas ouvrir les strictes, on ne prouve pas une
         quasi-traction avec une grosse bande.
         Le barreau lu est celui ECRIT AVEC LES SERIES, jamais le barreau
         courant : une seance jouee au barreau precedent peut faire monter la
         bande en fin de seance, auquel cas le barreau courant serait le bon et
         les repetitions auraient ete faites sous un autre. C est exactement le
         trou que la remise a zero de bandBest fermait par effet de bord. */
      if(ok&&e.lock.bandGate&&src&&src.bnd){
        const L=bandOrder(src);
        ok=L.length>0&&!!p.setsBand&&p.setsBand===L[L.length-1];
      }
      /* Condition de charge (v2.5) : un verrou ne savait lire qu un compte de
         repetitions, si bien qu un successeur pose derriere un exercice a charge
         s ouvrait au premier barreau et retirait son predecesseur avant qu il
         ait servi.
         Le dernier barreau se lit ici sur l echelle FILTREE par l inventaire, a
         l inverse de la porte de bande ci-dessus : voir le commentaire de
         mollets-une-jambe dans CFG, l exercice ouvert ne demande aucun materiel
         et un seuil absolu y enfermerait un inventaire pauvre. */
      if(ok&&(e.lock.loadTop||e.lock.kbTop||e.lock.rungTop)) ok=gatePalier(e).ok;
      /* Les trois feux verts, appliques APRES les branches et non dans l une
         d elles. En v1.18 la garde de provenance vivait dans la branche
         normale, en else if : la branche bandGate, placee avant, ne la
         rencontrait jamais et un maximum de bande obtenu en seance allegee
         ouvrait le verrou des tractions strictes. Ecrite ici, aucune branche
         presente ni future ne peut l oublier. */
      if(p.lightSets||p.unqualSets) ok=false;
      if(ok){ state.unlocked[id]=true; msgs.push('🔓 Débloqué : '+e.nom); }
    }
  });
  return msgs;
}
function checkBadges(){
  const msgs=[];
  BADGES.forEach(b=>{ if(!state.badges.includes(b.id)&&b.test(state)){ state.badges.push(b.id); msgs.push(b.ico+' Badge : '+b.nom); } });
  return msgs;
}

```
## `app5.js`

Construction de la séance, rotation, accueil.

491 lignes, 29502 octets.

```javascript
/* ============ CONSTRUCTION DE LA SEANCE ============ */
function warmupList(w){
  const mode=w||(cur&&cur.warmMode)||state.warm;
  if(mode==='aucun') return [];
  if(mode==='court') return WARM_SHORT.map(i=>WARMUP[i]);
  return WARMUP;
}
/* v2.22 : le decompte de lancement fait partie du poste echauffement. Il est
   chronometre, donc il tique dans le modele rejoue, et l annonce doit le
   compter pour qu une seance jouee aux cibles reste egale a son annonce. */
const START_PREP=5;
function warmupSec(w){ const L=warmupList(w); return L.length?START_PREP+L.reduce((a,x)=>a+x.s,0):0; }
/* ROTATION SOUS PROFIL REDUIT (v2.0). La grille des positions est filtree par
   les verrous, les retraits et desormais la resolution materielle, et le
   compteur indexe la grille filtree. C est le mecanisme deja en place pour les
   verrous, etendu d un predicat.
   Mesure qui a fait ecarter la variante du balayage circulaire, qui aurait
   laisse le compteur sur la grille de reference et avance jusqu a la premiere
   position resoluble : les positions non servies donnent alors leur frequence
   a la position servie qui les suit, ce qui n a rien de proportionnel. Sur la
   grille tiree a six positions, verrous fermes, profil halteres seuls, elle
   donne face pulls 20, face pulls seconde part 30 et curls 10 sur soixante
   seances, avec la meme part jouee jusqu a trois fois d affilee. Balayage des
   cinquante-sept parties resolubles de taille au moins deux : ecart de
   frequence jusqu a 66,7 %, equitable sur six parties seulement, contre
   cinquante-sept sur cinquante-sept ici.
   Le compteur, lui, n est jamais deplace par la resolution : il avance d un
   cran par seance quel que soit le profil. C est cela, et non l absence de
   modulo propre au profil, qui garantit qu un retour au profil precedent
   reprend la rotation ou elle en etait. Verifie : apres sept seances ailleurs,
   la position servie au retour est celle qu on aurait eue sans jamais partir. */
/* v2.8 : position lue dans le vivier, dephasage compris. Un cran de plus par
   tour de vivier accompli, propre a l emplacement. Lecture pure : elle ne
   touche pas le compteur, ne connait pas l etat, et pickAt la traverse comme
   pickFromPool, sans quoi le carrousel annoncerait un autre tirage que celui
   qui sortira. */
function phaseIdx(slot,c,n){
  if(n<=0) return 0;
  const k=SLOT_PHASE[slot]||0;
  return (c + k*Math.floor(c/n)) % n;
}
function pickFromPool(slot){
  const pos=posTirables(slot,state.gear);
  if(!pos.length) return SLOTS[slot].pool[0];
  const i=pos[phaseIdx(slot,state.slotIdx[slot]||0,pos.length)];
  return resolvePos(slot,i,state.gear)||SLOTS[slot].pool[i];
}
/* v1.18 : le tirage a n seances d ici, pour les panneaux a venir du detail de
   seance. Lecture seule, sans repli ni ajustement du jour : une seance allegee
   ou une variante de douleur est une bascule du jour, elle n a pas a colorer
   ce qui vient. L ordre n est exact qu a jeu normal : une seance quittee
   n avance rien, une allegee gele les emplacements substitues, un verrou qui
   s ouvre recompose le vivier. */
function drawAhead(k){ return SLOT_ORDER.map(s=>pickAt(s,k)); }
function pickAt(slot,k){
  const pos=posTirables(slot,state.gear);
  if(!pos.length) return SLOTS[slot].pool[0];
  const i=pos[phaseIdx(slot,(state.slotIdx[slot]||0)+k,pos.length)];
  return resolvePos(slot,i,state.gear)||SLOTS[slot].pool[i];
}
/* autant de panneaux que le plus gros vivier. v2.8 : la fenetre ne promet plus
   l exhaustivite, elle promet l exactitude. Que toute tranche de n tirages
   porte les n exercices equivaut a une suite de periode n, et deux suites de
   periode 5 sur jambes et gainage redonnent les cinq paires rigides que le
   dephasage supprime. Les deux garanties sont exclusives, mesure a l appui :
   les tenir ensemble aurait demande onze panneaux. Six panneaux exacts valent
   mieux que onze panneaux exhaustifs, l exhaustivite n ayant jamais ete un
   engagement consomme, seulement une consequence de la rigidite. */
function aheadCount(){
  return SLOT_ORDER.reduce((m,s)=>{
    const n=posTirables(s,state.gear).length;
    return Math.max(m,n||1);
  },1);
}
/* Ajustements du jour (v1.13). Reglages porte les defauts, l accueil les ajuste
   pour la seance qui vient. Meme cycle de vie que le mode allege : un mode
   ponctuel n est pas un reglage, il ne survit jamais a une seance. */
let dayWarm=null, dayCardio=null, dayStretch=null, dayRounds=null;
function effWarm(){ return dayWarm==null?state.warm:dayWarm; }
function effCardio(){ return dayCardio==null?!!state.cardio:dayCardio; }
function effStretch(){ return dayStretch==null?(state.stretch!==false):dayStretch; }
function effRounds(){ return dayRounds==null?roundsOf(state):dayRounds; }
function roundsOf(s){ const r=s&&s.rounds; return ROUNDS_CHOICES.indexOf(r)<0?3:r; }
function dayTouched(){ return dayWarm!=null||dayCardio!=null||dayStretch!=null||dayRounds!=null; }
function clearDay(){ dayWarm=dayCardio=dayStretch=dayRounds=null; }
/* v1.13 : plus d ordre de sacrifice. Le nombre de series est choisi, les
   options s ajoutent au lieu de rogner le volume, et le total est annonce. */
function planFor(){ return {rounds:effRounds(),cardio:effCardio(),warm:effWarm()}; }
function roundsFor(){ return planFor().rounds; }
function workSteps(steps){ return steps.filter(s=>s.k==='set'&&!s.cool); }
/* repos inerte du mode alterne : reglable depuis la v1.14, la transition de
   15 s n etait qu un defaut. Une sauvegarde anterieure n a pas le champ. */
function transSec(){ const t=state&&state.trans; return TRANS_CHOICES.indexOf(t)<0?TRANSITION:t; }
/* Constructeur unique des etapes de repos. Deux sites emettent des repos, la
   construction de seance et le changement de volume en cours de seance : la
   regle vit ici et nulle part ailleurs, sinon les deux divergeront comme
   l avaient fait les trois ecritures de next avant la v2.6.
   Le drapeau pause est porte par l etape et jamais rededuit de sa duree :
   l ecran, la decomposition et les tests lisent tous le meme fait.
   v2.11 : etre au raccord ne suffit plus. Il faut en plus que la paire y soit
   nommee dans PAUSE_RACCORD_PAIRS. Liste vide = aucune pause, l outil n ajoute
   pas de temps mort pour un probleme qu il n a pas observe. */
function pauseAu(a,b){ return PAUSE_RACCORD_PAIRS.indexOf(a+'>'+b)>=0; }
function restStep(raccord,avant,apres){
  return (raccord&&pauseAu(avant,apres))
    ? {k:'rest',sec:PAUSE_TOUR,pause:true}
    : {k:'rest',sec:transSec()};
}
function tempoOf(id){ const t=TEMPO_EX[id]; return t==null?TEMPO:t; }
function switchSec(id){ return SWITCH_EX[id]||0; }
/* cout reel d une serie, exercice par exercice : un unilateral coute deux fois
   le travail, une tenue coute sa cible plus le decompte de preparation. */
function serieSec(id,light){
  const e=DB[id]; if(!e) return INSTALL;
  const p=perfFor(id,!!light);
  /* un etirement bilateral enchaine ses deux phases apres un seul decompte,
     leur somme faisant la duree de base : il coute sa duree, une fois. Une
     tenue par cote est deux tenues completes, decompte compris (v1.13). */
  if(e.mode==='stretch') return INSTALL_STRETCH+prepSec()+(e.dur||45);
  if(e.mode==='time'){
    const c=p.target||(e.reps?e.reps[0]:30);
    return INSTALL+(e.side?2:1)*(prepSec()+c);
  }
  /* Tenues rythmees (v2.17) : chronometrees et non plus modelisees. Un
     decompte, puis deux cotes en alternance, chaque tenue suivie de sa
     bascule. Au premier barreau, 3 + 2 = 5 s vaut exactement l ancien tempo
     du bird-dog : le modele ne bouge pas a la migration. */
  if(e.rhythm){
    const r=p.target||baseReps(e,p)[0];
    return INSTALL+prepSec()+2*r*(tenueOf(id,p)+e.rhythm.bascule);
  }
  /* Repetitions cadencees (v2.19) : chronometrees comme les tenues par cote.
     Pour chaque cote, un decompte, l etablissement de la ligne, puis la cible
     en cycles de montee et de descente. Le retournement entre les deux cotes
     n est pas modelise, pas plus que sur une tenue par cote. v2.22 : un cote
     ou deux selon e.side, et la tenue en haut du pont dans le cycle. Le cycle
     de 4,5 s donne des demi-secondes : le cote est arrondi, le modele rejoue
     comptant des secondes entieres. Une reprise rejoue un decompte,
     interruption non modelisee. */
  if(e.cadence){
    const r=p.target||e.reps[0], c=e.cadence;
    return INSTALL+(e.side?2:1)*Math.round(prepSec()+(c.etab||0)+r*(c.monte+(c.tenue||0)+c.descente));
  }
  const r=p.target||(e.reps?e.reps[0]:10);
  return INSTALL+(e.side?switchSec(id):0)+Math.round(r*tempoOf(id)*(e.side?2:1));
}
/* Part non chronometree d une serie (v1.16). Le modele rejoue applique la ligne
   de partage de la v1.14 a l envers : tout ce que l outil chronometre est compte
   tick par tick a sa valeur reelle, et seul ce pendant quoi aucun chrono ne
   tourne se calcule ici. D ou les trois cas. Un etirement n a que son
   installation, sa preparation et sa duree ayant defile. Une tenue n a que son
   installation, pour la meme raison, decompte de preparation compris et deux
   fois s il y a deux cotes. Une serie chiffree porte en plus son tempo, calcule
   sur la valeur reellement saisie et non sur la cible : c est toute la raison
   d etre du rejeu. */
function serieModelAdd(id,val){
  const e=DB[id]; if(!e) return INSTALL;
  if(e.mode==='stretch') return INSTALL_STRETCH;
  if(e.mode==='time'||e.rhythm||e.cadence) return INSTALL;   /* rythme et cadence : tout a defile au tick */
  const r=val||0;
  return INSTALL+(e.side?switchSec(id):0)+Math.round(r*tempoOf(id)*(e.side?2:1));
}
/* Ressource physique qu un exercice mobilise : les deux barres d halteres, ou
   la kettlebell et ses lestes. Une bande se change de barreau sans montage. */
function gearKey(id){
  const e=DB[id]; if(!e) return null;
  if(e.mode==='load') return 'halteres';
  if(e.mode==='fixed') return 'kb';
  return null;
}
/* Remontages imposes par la sequence reelle des series : le premier montage se
   fait avant la seance, il ne compte pas. Vaut zero dans la grande majorite
   des tirages, et jusqu a cinq fois quand deux exercices se disputent les
   halteres a des charges differentes dans un circuit alterne. */
function remounts(plan){
  const last={}, pairs=[]; let n=0;
  (plan.steps||[]).forEach(st=>{
    if(st.k!=='set'||st.cool) return;
    const k=gearKey(st.id); if(!k) return;
    const c=prescLoad(st.id);
    if(last[k]!=null&&Math.abs(last[k]-c)>0.01){
      n++;
      if(pairs.indexOf(k)<0) pairs.push(k);
    }
    last[k]=c;
  });
  return {n:n,sec:n*REMOUNT,gear:pairs};
}
/* les deux montages a alterner sur une ressource, pour l avertissement du
   detail de seance : le materiel a sortir ne suffit pas a preparer une seance
   qui change de charge en cours de route */
function remountPairs(plan){
  const seen={}, out=[];
  (plan.exos||[]).forEach(id=>{
    const k=gearKey(id); if(!k) return;
    if(!seen[k]) seen[k]=[];
    const c=prescLoad(id);
    if(!seen[k].some(x=>Math.abs(x.load-c)<0.01)) seen[k].push({id:id,load:c});
  });
  Object.keys(seen).forEach(k=>{ if(seen[k].length>1) out.push({gear:k,items:seen[k]}); });
  return out;
}
/* decomposition de la duree annoncee : ce que la card Contenu affiche poste
   par poste, et dont le total etiquette le bouton de volume. */
function planParts(plan){
  const w=warmupSec(plan.warm);
  let exos=0, trans=0, cool=0, cardio=0, pause=0, nPause=0;
  plan.steps.forEach(st=>{
    if(st.k==='set') { if(st.cool) cool+=serieSec(st.id,false); else exos+=serieSec(st.id,plan.light); }
    /* v2.10 : la pause de raccord est un poste a part. Elle entrait deja dans
       le total, tous les repos y etant sommes, mais la ligne Transitions
       l aurait annoncee au tarif de la transition. */
    else if(st.k==='rest'){ if(st.pause){ pause+=st.sec; nPause++; } else trans+=st.sec; }
    else if(st.k==='cardio') cardio+=CARDIO_SEC;
  });
  const rm=remounts(plan);
  return {warm:w,exos:exos,trans:trans,pause:pause,nPause:nPause,remount:rm.sec,nRemount:rm.n,cardio:cardio,cool:cool,
          total:w+exos+trans+pause+rm.sec+cardio+cool};
}
function estimateSec(plan){ return planParts(plan).total; }
/* La substitution du mode allege se fait ici, a la construction, et nulle part
   ailleurs : le materiel a sortir, le resume de l accueil, l estimation de duree
   et les etapes en decoulent sans que rien d autre ait a connaitre le mode. */
function buildSession(){
  const adj=planFor();
  const steps=[];
  const light=lightOn();
  /* le repli doit etre realisable ici : meme filtre que le geste de douleur */
  const sub=id=>(light&&fbOf(id))?fbOf(id):id;
  const mark=(st,orig)=>{ if(st.id!==orig){ st.from=orig; st.key=orig+'>'+st.id; st.swapped=true; st.light=true; } return st; };
  const orig=SLOT_ORDER.map(pickFromPool);
  const exos=orig.map(sub);
  const R=adj.rounds;
  for(let r=0;r<R;r++){
    exos.forEach((id,i)=>{
      steps.push(mark({k:'set',id:id,key:id,set:r+1,of:R,round:r+1},orig[i]));
      const last=(r===R-1&&i===exos.length-1);
      /* raccord = repos qui suit le dernier exercice d un tour. Aucun repos n
         est emis apres la derniere serie de la seance, donc rien n est ajoute
         apres le dernier tour : le raccord y perdrait son objet, aucun pousse
         ne suit. */
      if(!last) steps.push(restStep(i===exos.length-1,id,exos[0]));
    });
  }
  if(adj.cardio) steps.push(mark({k:'cardio',id:sub(CARDIO_ID)},CARDIO_ID));
  /* etirements de fin de seance : deux par seance en rotation sur les six.
     Comptes dans la duree annoncee depuis la v1.13 : ce nombre est un total,
     tout compris. */
  if(effStretch()){
    stretchesFor().forEach(id=>steps.push({k:'set',id:id,key:id,cool:true,set:1,of:1}));
  }
  /* emplacements dont l exercice prevu a ete remplace par un repli : ce sont
     eux, et eux seuls, dont la rotation gele apres une seance allegee (v1.13) */
  const subs={};
  SLOT_ORDER.forEach((s,i)=>{ if(exos[i]!==orig[i]) subs[s]=true; });
  /* next et nextKey sont poses ici et nulle part ailleurs, sur la liste
     complete : un repos annonce le pas de travail qui le suit reellement */
  relinkRests(steps);
  return {type:'alterne',exos:exos,orig:orig,light:light,steps:steps,subs:subs,
          warm:adj.warm,cardio:adj.cardio};
}
/* deux etirements par seance, la rotation couvre les six en trois seances */
function stretchesFor(){
  const n=STRETCH_PER_SESSION, i=(state.stretchIdx||0)%STRETCH_POOL.length, out=[];
  for(let k=0;k<n;k++) out.push(STRETCH_POOL[(i+k)%STRETCH_POOL.length]);
  return out;
}

/* ============ NAVIGATION ============ */
let view='home', cur=null, timers={};
/* Etat d ouverture des cards repliables (v1.14), releve juste avant chaque
   rendu et lu par les cards au moment ou elles s ecrivent. Memoire vive du
   rendu uniquement : les cles de l ancienne page ne correspondent a rien dans
   la nouvelle, donc l etat ne traverse pas un changement de vue, et rien n est
   ecrit dans la sauvegarde. Ferme reste le defaut a chaque arrivee sur un
   ecran, et la ligne fermee garde son role de resume. */
let openCards={};
/* Animation d apparition des cards : elle vaut pour une arrivee sur un ecran,
   pas pour un rafraichissement du meme ecran. Le rendu recreant tout le DOM a
   chaque bouton presse, l animation se rejouait sur toutes les cards a chaque
   clic, ce qui donnait l impression que la page se rafraichissait (v1.14).
   Chaque ecran annonce sa cle en entrant : identique a la precedente, on retire
   la classe et rien ne bouge ; differente, on la pose et l arrivee s anime. La
   classe vit sur le conteneur, qui n est jamais recree. En seance la cle porte
   le numero d etape : passer d une serie a la suivante est une arrivee, ajuster
   une charge sur la meme serie n en est pas une. */
let lastScreen=null;
function screenEnter(key){
  const el=$('#app');
  if(!el||!el.classList) return;
  if(key===lastScreen){ el.classList.remove('enter'); return; }
  lastScreen=key;
  el.classList.add('enter');
}
function clearTimers(){Object.values(timers).forEach(t=>clearInterval(t));timers={};}
/* historique navigateur : chaque vue pousse son hash, les fleches
   avant/arriere de la souris ou du navigateur pilotent le routeur */
function hashOK(){return typeof window!=='undefined'&&window.location&&typeof window.addEventListener==='function';}
let navLock=false;
function setHash(h){
  if(!hashOK()) return;
  if(window.location.hash==='#'+h) return;
  navLock=true;
  window.location.hash=h;
}
function go(v){clearTimers();if(v==='lib')libQ='';view=v;render();try{window.scrollTo(0,0);}catch(e){} setHash(v);}
const NAVI={
 home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
 lib:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
 prog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
 set:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>'
};
function renderNav(){
  if(view==='session'||view==='recap'){$('#nav').innerHTML='';return;}
  const items=[['home','Accueil'],['lib','Exercices'],['prog','Progrès'],['set','Réglages']];
  $('#nav').innerHTML=items.map(([v,l])=>'<button class="navbtn'+(view===v?' on':'')+'" onclick="go(\''+v+'\')">'+NAVI[v]+l+'</button>').join('');
}
function kbHint(){return '<div class="kb muted">Clavier : <b>Entrée</b> valider · <b>Espace</b> pause / départ · <b>+ −</b> ajuster · <b>↑ ↓</b> défiler · <b>Échap</b> quitter</div>';}

/* ============ ACCUEIL ============ */
/* Bandeau de profil (v2.0). Rien a l ecran tant qu on est chez soi : un
   bandeau permanent qui dirait « Domicile » serait du bruit quotidien pour une
   information qui ne varie jamais. Des qu on n y est plus, une ligne permanente
   porte le nom du profil et le bouton de retour, et une seconde ligne repliee
   nomme les schemas non servis. Le retour est a un geste, parce que l oubli de
   revenir est la panne la plus probable et la plus couteuse. */
function profilBanner(){
  if(!horsDomicile()) return '';
  const perdus=schemasPerdus(state.gear);
  return '<div class="card" style="background:var(--flame-soft);border-left:4px solid var(--flame)">'+
    '<div class="spread"><b>'+esc(profilNom())+'</b>'+
    '<button class="quiet" style="padding:6px 14px;font-size:.8rem" onclick="switchProfil(\'domicile\')">Retour domicile</button></div>'+
    (perdus.length
      ? '<details data-k="ban-perd"'+cardOpen('ban-perd',false)+'><summary class="muted small">'+
        perdus.length+' schéma'+(perdus.length>1?'s':'')+' non servi'+(perdus.length>1?'s':'')+'</summary>'+
        '<div class="chipline">'+perdus.map(n=>'<span class="chip off">'+esc(n)+'</span>').join('')+'</div></details>'
      : '<div class="muted small mt">Tous les schémas sont servis ici.</div>')+
  '</div>';
}
/* Bandeau d accueil (v2.0). Il etait conditionne a l historique vide depuis la
   v1.18 ; il l est desormais au drapeau d onboarding, pose par l etat neuf et
   retire par la validation de l inventaire. Deux consequences voulues : il ne
   revient pas si l historique est vide pour une autre raison, et un import de
   sauvegarde n a pas d onboarding, le drapeau n etant jamais cree par une
   migration.
   Il ne bloque rien : un inventaire vide sert deja les quatre groupes, la
   seance du jour est composee et lançable derriere le bandeau. */
function onboardBanner(){
  if(!state.onboard) return '';
  return '<div class="card" style="background:var(--accent-soft)"><b>Bienvenue.</b>'+
    '<div class="small" style="margin-top:6px">Choisis ton volume, l\'outil compose la séance et annonce le temps qu\'elle prendra. Tu saisis ce que tu fais réellement, il gère la progression en répétitions puis en charge. Rien à décider.</div>'+
    '<div class="small" style="margin-top:8px">Commence par dire ce que tu as sous la main : l\'outil ne prescrit que des exercices réalisables avec ton matériel.</div>'+
    '<button class="big mt" onclick="goMateriel()">Déclarer mon matériel</button></div>';
}
/* Rendu de « Comment ça marche ». Le meme texte a deux endroits, un seul
   rendu. ouvert=true deplie les trois developpements d office, c est la forme
   de Reglages ou l on vient expres lire ; sur l accueil ils sont replies, la
   promesse de cet ecran etant qu il n y a rien a lire pour lancer une seance.
   Les details portent une cle data-k, donc leur ouverture survit au re-rendu
   comme toutes les autres (v1.14). */
function commentHtml(ouvert){
  return COMMENT.map((b,i)=>
    '<span class="lead'+(i?' mt':'')+'">'+esc(b.t)+'</span>'+
    '<div>'+b.c+'</div>'+
    '<details data-k="cmt'+i+'"'+cardOpen('cmt'+i,!!ouvert)+'><summary>En savoir plus</summary>'+
    b.l.map(p=>'<div class="mt">'+p+'</div>').join('')+'</details>').join('');
}
/* Bloc d introduction de l accueil. Il se retire definitivement d un bouton,
   comme le bandeau de materiel : un texte constant affiche a chaque lancement
   devient du bruit, et l accueil promet qu il n y a rien a decider. Le drapeau
   est une valeur et non une absence (v2.3), pose a true par defaultState : une
   sauvegarde anterieure le recoit donc, et c est voulu, le texte est nouveau
   pour elle aussi. Reglages le garde en permanence pour le relire. */
function introCard(){
  if(state.intro===false) return '';
  return '<div class="card muted small">'+
    '<div class="spread"><b class="small">Comment ça marche</b></div>'+
    commentHtml(false)+
    '<button class="quiet mt" style="padding:8px 14px;font-size:.8rem" onclick="closeIntro()">J\'ai lu, retirer ce bloc</button>'+
    '<div class="muted small" style="margin-top:6px">Tu le retrouveras dans Réglages, en bas.</div></div>';
}
function closeIntro(){ state.intro=false; save(); render(); }
function renderHome(){
  screenEnter('home');
  carIdx=0;
  const li=lvlInfo(state.xp), wc=thisWeekCount(state), ws=weekStreak(state);
  const wk=prevWeekKey(0), wg=goalForWeek(state,wk), adj=wg<state.goal;
  const plan=buildSession();
  const parts=planParts(plan);
  const est=Math.round(parts.total/60);
  let dots='';for(let i=0;i<Math.max(wg,wc);i++)dots+='<i class="'+(i<wc?(i<wg?'on':'extra'):'')+'"></i>';
  const desc=plan.exos.map(id=>DB[id].nom).join(' · ');
  $('#app').innerHTML=
  '<div class="spread" style="margin-bottom:14px"><h1>Palier</h1><span class="tag">Niv. <span class="num">'+li.lvl+'</span> · '+rankOf(li.lvl)+'</span></div>'+
  onboardBanner()+
  introCard()+
  (!storageOK?'<div class="card vig">Sauvegarde indisponible dans cet environnement : la progression ne sera pas conservée.</div>':'')+
  profilBanner()+
  '<div class="card">'+
    '<div class="spread"><span class="tag">Séance alternée</span><span class="muted small">~'+est+' min</span></div>'+
    (lightMode?'<div class="tag flame mt">Séance allégée : variantes de repli et cibles réduites</div>':'')+
    '<div style="margin:10px 0 2px;font-weight:700">'+esc(desc)+'</div>'+
    '<div class="muted small">'+(workSteps(plan.steps).length/SLOT_ORDER.length)+' séries par exercice'+(plan.cardio?' + cardio':'')+(plan.steps.some(s=>s.cool)?' + étirements':'')+'</div>'+
    roundsSeg()+
    /* v2.24 : attente de la synchronisation, conflit ou version plus recente
       en ligne prennent la place du bouton */
    (syncLancement()||'<button class="big mt" onclick="startSession()">Lancer la séance</button>')+
    '<div class="seg mt">'+
    '<button class="'+(lightMode?'flamebtn':'quiet')+'" onclick="toggleLight()">Séance allégée'+(lightMode?' ✓':'')+'</button></div>'+
  '</div>'+
  /* v2.15 : l objectif hebdomadaire sous le lancement et avant le detail de
     seance, ouvert par defaut depuis la v1.10 et long de quatre exercices :
     mesure a 1 300 px du haut sur mobile, l instrument de l habitude etait le
     dernier a se lire. L ordre seul change, pas l ouverture du detail. */
  '<div class="card">'+
    '<div class="spread"><h3>Cette semaine</h3>'+(ws>0?'<span class="tag flame">🔥 '+ws+' sem.</span>':'')+'</div>'+
    '<div class="spread mt"><div class="week-dots">'+dots+'</div><span class="num" style="font-weight:700">'+wc+' / '+wg+'</span></div>'+
    '<div class="muted small" style="margin-top:8px">'+(wc>=wg?'Semaine validée. Le reste est du bonus.':'Encore '+(wg-wc)+' jour'+(wg-wc>1?'s':'')+' actif'+(wg-wc>1?'s':'')+' pour valider la semaine.')+'</div>'+
    (adj?'<div class="muted small" style="margin-top:4px">Semaine '+(state.hist.length&&isoWeek(new Date(state.hist[0].date))===wk?'de démarrage':'de reprise')+' : objectif ramené à '+wg+' au prorata des jours disponibles, au lieu de '+state.goal+'.</div>':'')+
  '</div>'+
  contentCard(plan,parts)+
  sessionDetailHtml(plan)+
  '<div class="card">'+
    '<div class="spread"><h3>Progression</h3><span class="muted small num">'+state.xp+' XP</span></div>'+
    '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
    '<div class="muted small" style="margin-top:6px">Encore <span class="num">'+li.next+'</span> XP pour le niveau '+(li.lvl+1)+'</div>'+
  '</div>';
  renderNav();
  carFit();
  syncReprise();
}
/* Le bouton porte ce qu on controle : le nombre de series. Le temps calcule du
   jour se lit dessous, et il est vrai par construction (v1.13). */
function roundsSeg(){
  const cur0=effRounds();
  return '<div class="muted small mt">Volume de la séance</div>'+
    '<div class="seg roundseg" style="margin-top:6px">'+ROUNDS_CHOICES.map(r=>{
      const t=Math.round(estimateSec(planWith(r))/60);
      return '<button class="'+(cur0===r?'':'quiet')+'" onclick="setRounds('+r+')">'+
             '<b>'+r+' séries</b><span class="sub">~'+t+' min</span></button>';
    }).join('')+'</div>';
}
/* meme plan, autre nombre de series : sert a etiqueter les boutons sans
   toucher a l etat ni aux ajustements du jour */
function planWith(r){
  const keep=dayRounds; dayRounds=r;
  const p=buildSession();
  dayRounds=keep;
  return p;
}
/* La decomposition affiche chaque poste au dixieme de minute, et le total avec
   eux : arrondis a la minute, six lignes ne retombaient pas sur leur somme, et
   un total qui ne se retrouve pas est le defaut qui a fait tomber l ancien
   modele. L en-tete de seance et les boutons de volume gardent l arrondi. */
function fmtMin(sec){ return '~'+Math.round(sec/60)+' min'; }
/* v2.10 : les pauses de raccord sont exclues, elles ont leur propre ligne et
   leur propre duree. Ce compteur n a jamais servi qu au libelle n x t s. */
function nRest(plan){ return (plan.steps||[]).filter(s=>s.k==='rest'&&!s.pause).length; }
/* Contenu de la seance : ferme, l en-tete resume les options du jour ; ouvert,
   il donne la decomposition chiffree et les trois ajustements ponctuels.
   L accueil promet qu il n y a rien a decider pendant la seance : ces choix se
   font avant, comme la duree et la seance allegee. */
function contentCard(plan,parts){
  const WL={complet:'échauffement complet',court:'échauffement court',aucun:'sans échauffement'};
  const resume=[WL[plan.warm]||plan.warm,plan.cardio?'cardio':'sans cardio',effStretch()?'étirements':'sans étirements']
    .join(' · ');
  const row=(l,s,d)=>'<div class="spread" style="margin-top:4px"><span class="muted small">'+l+
    (d?' <span style="opacity:.7">'+d+'</span>':'')+'</span><span class="num small">'+(s?fmtDur(s):'—')+'</span></div>';
  const seg=(lbl,opts,f,val)=>'<div class="muted small mt">'+lbl+'</div><div class="seg" style="margin-top:4px">'+
    opts.map(o=>'<button class="'+(val===o[0]?'':'quiet')+'" onclick="'+f+'('+(typeof o[0]==='string'?"'"+o[0]+"'":o[0])+')">'+o[1]+'</button>').join('')+'</div>';
  return '<details class="card" data-k="home-contenu"'+cardOpen('home-contenu',false)+'><summary><span class="ttl">Contenu</span><span class="val">'+esc(resume)+'</span></summary>'+
    row('Exercices',parts.exos,plan.exos.length+' × '+effRounds()+' séries')+
    row('Transitions',parts.trans,nRest(plan)+' × '+transSec()+' s')+
    (parts.pause?row('Pause de tour',parts.pause,parts.nPause+' × '+PAUSE_TOUR+' s'):'')+
    (parts.remount?row('Remontage de charge',parts.remount,parts.nRemount+' × '+REMOUNT+' s'):'')+
    row('Échauffement',parts.warm)+
    row('Cardio',parts.cardio)+
    row('Étirements',parts.cool)+
    '<div class="spread" style="margin-top:8px;border-top:1px solid var(--line);padding-top:8px"><b>Total</b><b class="num">'+fmtDur(parts.total)+'</b></div>'+
    seg('Échauffement',[['complet','Complet'],['court','Court'],['aucun','Aucun']],'setDayWarm',plan.warm)+
    seg('Cardio',[[1,'Oui'],[0,'Non']],'setDayCardio',plan.cardio?1:0)+
    seg('Étirements',[[1,'Oui'],[0,'Non']],'setDayStretch',effStretch()?1:0)+
    '<div class="muted small mt">Ajustements pour aujourd\'hui seulement. Les valeurs par défaut se règlent dans Réglages.'+
    (dayTouched()?' <b>Modifié pour cette séance.</b>':'')+'</div>'+
  '</details>';
}
function setRounds(r){ dayRounds=(r===roundsOf(state))?null:r; render(); }
function setDayWarm(w){ dayWarm=(w===state.warm)?null:w; render(); }
function setDayCardio(v){ const b=!!v; dayCardio=(b===!!state.cardio)?null:b; render(); }
function setDayStretch(v){ const b=!!v; dayStretch=(b===(state.stretch!==false))?null:b; render(); }

```
## `app6.js`

Déroulé de la séance, chronomètre, tenues rythmées et répétitions cadencées, saisie, ajustements manuels, vignette de l'exercice suivant sur l'écran de repos, séries déjà faites du jour, heure et temps écoulé sur la ligne du tag de la transition.

1341 lignes, 76717 octets.

```javascript
/* ============ SEANCE ============ */
function startSession(){
  /* v2.24 : le clavier passe aussi par ici, la garde ne vit pas sur le bouton */
  if(syncBloque()) return;
  /* la fenetre de correction se ferme au demarrage de la seance suivante :
     c est ce qui implemente « on corrige la derniere seance, pas les autres » */
  delete state.undo;
  const plan=buildSession();
  /* Modele rejoue (v1.16). planSec est l annonce, a la seconde : elle etait
     stockee arrondie a la minute, soit trente secondes de bruit sur un
     parametre d installation qui en pese cent trente. model part du remontage
     de charge, seul poste modelise qu aucun evenement de seance ne produira, et
     s incremente ensuite : d un tick a chaque seconde chronometree, et de la
     part non chronometree a chaque serie validee. */
  const parts=planParts(plan);
  cur={type:plan.type,exos:plan.exos,steps:plan.steps,i:0,phase:'warm',warmI:0,warmT:null,warmPaused:false,startLeft:START_PREP,
       warmMode:plan.warm,light:plan.light,subs:plan.subs,rounds:effRounds(),rounds0:effRounds(),
       plan:Math.round(parts.total/60),planSec:parts.total,model:parts.remount,
       log:{},secs:{},xp:0,msgs:[],ending:false,t0:Date.now()};
  if(!warmupList(plan.warm).length){ cur.phase='work'; cur.startLeft=0; }
  go('session');
}
/* Une seconde chronometree, quelle qu elle soit : echauffement, decompte de
   preparation, tenue, etirement, transition, cardio. Appelee dans les six
   boucles a la seconde, elle donne au modele rejoue la valeur exacte de tout ce
   que l outil mesure, sans rien reconstituer et sans cas particulier : une
   pause ne tique pas, un chrono arrete non plus, un etirement saute pas
   davantage. Ce qui reste hors du compte est exactement ce que la v1.14 avait
   isole comme modelisable. */
function tick(){ if(cur) cur.model=(cur.model||0)+1; }
/* Sortie de seance en deux temps (v2.0). Le dialogue systeme disparait comme
   les autres : la question est posee dans la page, elle nomme sa consequence,
   et elle s annule.
   Elle sert aussi le retour arriere du navigateur : applyHash remet deja
   l entree d historique en place AVANT d appeler cette fonction, donc la
   fleche seule ne quitte jamais rien, et rien ne change a cette mecanique du
   fait que la question ne bloque plus le fil.
   Le drapeau est ponctuel et ne va pas dans l etat. Tant qu il est leve, les
   touches de seance sont inertes et Echap annule : une touche pressee par
   reflexe ne decide de rien (v1.13). */
let askQuit=false;
function quitSession(){
  if(!cur) return;
  askQuit=true; renderSession();
  try{ window.scrollTo(0,0); }catch(e){}
}
function quitCancel(){ askQuit=false; renderSession(); }
function quitConfirm(){
  askQuit=false;
  const logged=cur&&cur.log&&Object.keys(cur.log).length;
  if(!logged){ rhythmAbort(); cur=null; lightMode=false; clearDay(); go('home'); return; }
  cur.ending=true; endSession(true);
}
function quitAskHtml(){
  if(!askQuit) return '';
  const logged=cur&&cur.log&&Object.keys(cur.log).length;
  return '<div class="card" style="border-left:4px solid var(--flame)"><b>Quitter la séance ?</b>'+
    '<div class="muted small mt">'+(logged
      ?'Les séries déjà validées seront enregistrées, la séance sera marquée incomplète et la rotation n\'avancera pas.'
      :'Rien ne sera compté : aucune série n\'a encore été validée.')+'</div>'+
    '<div class="seg mt"><button class="danger" onclick="quitConfirm()">Quitter</button>'+
    '<button class="quiet" onclick="quitCancel()">Continuer la séance</button></div></div>';
}
/* pastilles regroupees selon la logique du mode : un bloc par tour en
   alterne (chaque serie porte round), un bloc par exercice en cible. Le
   contour du bloc passe au vert quand toutes ses series sont faites. */
function dotsHtml(steps,done){
  const ws=workSteps(steps);
  let h='',buf='',key=null,full=true;
  const flush=()=>{ if(buf) h+='<span class="grp'+(full?' full':'')+'">'+buf+'</span>'; buf=''; full=true; };
  ws.forEach((s,i)=>{
    const k=(s.round!=null)?('r'+s.round):('e'+s.id);
    if(k!==key){ flush(); key=k; }
    buf+='<i class="'+(i<done?'done':(i===done?'on':''))+'"></i>';
    if(i>=done) full=false;
  });
  flush();
  return h;
}
function renderSession(){
  screenEnter('session/'+(cur?cur.i:0));
  if(cur.phase==='warm') return renderWarm();
  const st=cur.steps[cur.i];
  if(!st) return;
  /* Duree par serie (v2.12). L horodatage se pose ici, a l arrivee sur l etape,
     parce que c est le seul point que tous les chemins traversent : etape
     suivante, serie passee, retour d un pas, changement de volume. La garde sur
     l absence rend le rendu idempotent, un re-rendu de la meme etape ne
     redemarrant pas le compte : ajuster une charge ou ouvrir une card ne doit
     pas raccourcir la serie. Ce que l intervalle mesure est assume : de
     l arrivee sur l ecran a la validation, installation comprise, soit
     exactement ce que le modele de temps represente pour cette serie. */
  if(st.k==='set'&&st.t0==null) st.t0=Date.now();
  const done=workSteps(cur.steps.slice(0,cur.i)).length;
  const dots=dotsHtml(cur.steps,done);
  let body;
  if(st.k==='rest') body=restHtml(st);
  else if(st.k==='cardio') body=cardioHtml(st);
  else body=setHtml(st);
  $('#app').innerHTML=
    '<div class="spread" style="margin-bottom:10px"><h2>Séance alternée</h2>'+
    '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="quitSession()">Quitter</button></div>'+
    quitAskHtml()+
    '<div class="dots">'+dots+'</div>'+body;
  renderNav();
  if(st.k==='rest') startRest(st);
  if(st.k==='cardio') initCardio(st);
}

/* --- echauffement sur un seul ecran --- */
function renderWarm(){
  const L=warmupList();
  const w=L[cur.warmI];
  if(cur.warmT==null) cur.warmT=w.s;
  const dep=cur.startLeft>0;
  $('#app').innerHTML='<div class="spread" style="margin-bottom:10px"><h2>Échauffement</h2>'+
    '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="quitSession()">Quitter</button></div>'+
    quitAskHtml()+
    '<div class="card">'+
      L.map((it,i)=>'<div class="wu-item '+(i<cur.warmI?'done':(i===cur.warmI?'on':''))+'">'+
        (i<cur.warmI?'✓':(i===cur.warmI?'▸':'·'))+' '+esc(it.l)+'<span class="t">'+it.s+'s</span></div>').join('')+
      (w.img&&typeof IMG!=='undefined'&&IMG[w.img]?'<div class="figbox illus mt"><img src="'+IMG[w.img]+'" alt="'+esc(w.l)+'" loading="lazy" onclick="zoomFig(\''+w.img+'\')"></div>':'')+
      '<div class="muted small mt">'+esc(w.d)+'</div>'+
      (dep?'<div class="center mt"><span class="tag" id="wdep">Départ dans</span></div>':'')+
      '<div class="chrono num" id="wt">'+(dep?String(cur.startLeft):fmtT(cur.warmT))+'</div>'+
      '<div class="seg"><button class="quiet" onclick="toggleWarm()" id="wpause">'+(cur.warmPaused?'Reprendre':'Pause')+'</button>'+
      '<button class="quiet" onclick="nextWarm()">Étape suivante</button></div>'+
      '<button class="ghost big mt" onclick="skipWarm()">Passer l\'échauffement</button>'+
      kbHint()+
    '</div>';
  renderNav(); startWarmTimer();
}
/* v2.22 : decompte de lancement. Le chrono de l echauffement partait a
   l instant du clic sur « Lancer la seance ». Cinq secondes fixes, sans
   reglage, decision de Gabriel ; les sons sont ceux de startPrep, un bip a
   700 Hz a chaque seconde puis 1150 Hz au depart. Seulement devant
   l echauffement : sans lui, le premier ecran est une serie sans chrono ou
   une tenue qui a son propre decompte. Pause le fige, la reprise rejoue le bip
   de la seconde en cours ; Etape suivante et Passer l echauffement l annulent. */
function startWarmTimer(){
  clearInterval(timers.w);
  if(cur.warmPaused) return;
  if(cur.startLeft>0){
    beep(700,.1);
    timers.w=setInterval(()=>{
      tick(); cur.startLeft--;
      const el=$('#wt'); if(!el){clearInterval(timers.w);return;}
      if(cur.startLeft>0){ el.textContent=String(cur.startLeft); beep(700,.1); return; }
      clearInterval(timers.w); beep(1150,.16);
      const d=$('#wdep'); if(d&&d.parentNode) d.parentNode.remove();
      el.textContent=fmtT(cur.warmT);
      startWarmTimer();
    },1000);
    return;
  }
  timers.w=setInterval(()=>{
    tick(); cur.warmT--;
    const el=$('#wt'); if(!el){clearInterval(timers.w);return;}
    el.textContent=fmtT(cur.warmT);
    if(cur.warmT<=0){clearInterval(timers.w);beep(880,.18);nextWarm();}
  },1000);
}
function toggleWarm(){cur.warmPaused=!cur.warmPaused;const b=$('#wpause');if(b)b.textContent=cur.warmPaused?'Reprendre':'Pause';if(cur.warmPaused)clearInterval(timers.w);else startWarmTimer();}
function nextWarm(){
  clearInterval(timers.w);
  cur.warmI++; cur.warmT=null; cur.warmPaused=false; cur.startLeft=0;
  if(cur.warmI>=warmupList().length) skipWarm(); else renderWarm();
}
function skipWarm(){ clearInterval(timers.w); cur.startLeft=0; cur.phase='work'; renderSession(); }

/* v2.15 : la ligne « Derniere fois » porte le niveau quand il differe de
   celui du jour. Apres une montee, l ecran disait « Cible 8 · Derniere fois
   12/12/12 » sans dire pourquoi : la charge avait monte, la cible etait
   retombee au bas de fourchette, et rien ne reliait les deux. Le niveau joue
   se lit sur le dernier passage propre de l historique, it.load et it.band,
   ecrits avant progression depuis la v1.2 : aucun etat nouveau, meme famille
   que la fenetre de cible, la cible bouge, l ecran dit d ou. Rien quand le
   niveau est le meme, la ligne reste du contexte (v1.16). */
function lastLevel(id,p){
  const e=DB[id]; if(!e) return '';
  const pass=exoPassages(id).filter(x=>!x.repl);
  const it=pass.length?pass[pass.length-1].it:null; if(!it) return '';
  if(e.bnd){ if(it.band&&p.band&&it.band!==p.band) return ' <span class="muted">en '+esc(bandLabel(it.band))+'</span>'; return ''; }
  if((e.mode==='load'||e.mode==='fixed')&&it.load!=null&&p.load!=null&&Math.abs(it.load-p.load)>0.01) return ' <span class="muted">à '+esc(loadLabelFor(id,it.load))+'</span>';
  /* v2.17 : la tenue jouee, quand elle differe du barreau du jour. Un passage
     anterieur a it.tenue a ete joue au premier barreau par construction. */
  if(e.rhythm){ const t=it.tenue!=null?it.tenue:e.rhythm.ladder[0][0]; if(t!==tenueOf(id,p)) return ' <span class="muted">à '+t+' s</span>'; }
  /* v2.18 : l assise jouee, quand elle differe du barreau du jour */
  if(e.assise){ const a=it.assise!=null?it.assise:e.assise.ladder[0][0]; if(a!==assiseOf(id,p)) return ' <span class="muted">assise '+a+' cm</span>'; }
  return '';
}
/* Niveau sous lequel le dernier passage a ete joue, en texte, toujours dit
   (v2.18) : la fiche l accolait au niveau du jour. Meme source que
   lastLevel ; sans passage dans l historique, le niveau courant, comme
   avant. */
function playedLabel(id,p){
  const e=DB[id]; if(!e) return '';
  const pass=exoPassages(id).filter(x=>!x.repl);
  const it=pass.length?pass[pass.length-1].it:null;
  const src=it||{load:p.load,band:p.band,tenue:tenueOf(id,p),assise:assiseOf(id,p)};
  if(e.bnd) return src.band?', '+bandLabel(src.band):'';
  if(e.mode==='load'||e.mode==='fixed') return src.load?' à '+loadLabelFor(id,src.load):'';
  if(e.rhythm){ const t=src.tenue!=null?src.tenue:e.rhythm.ladder[0][0]; return ' à '+t+' s'; }
  if(e.assise){ const a=src.assise!=null?src.assise:e.assise.ladder[0][0]; return ', assise '+a+' cm'; }
  return '';
}
/* --- une serie --- */
function setHtml(st){
  const id=st.id, e=DB[id], p=perfFor(id,!!st.light);
  const prev=(p.sets&&p.sets.length)?p.sets:null;
  /* Series deja faites aujourd hui sur cet exercice (v1.16). En mode alterne
     elles sont separees par trois autres exercices, donc personne ne s en
     souvient a la serie suivante. Toute la liste et pas seulement la derniere :
     le moteur lit le minimum du passage pour la cible suivante et exige toutes
     les series en haut de fourchette pour la montee, la serie qui decide n est
     donc pas forcement la derniere. Le journal est lu sous la cle courante,
     donc un repli douleur en cours d exercice repart d une liste vide, ce qui
     est exact : ce ne sont plus les memes series. */
  const jour=(cur&&cur.log&&cur.log[st.key||st.id])||null;
  /* un etirement n a ni fourchette ni cible : son chrono part de sa duree de
     base, pas du repli generique de fin de ligne (v1.12) */
  if(st.val==null) st.val=((e.mode==='time'||e.rhythm||e.cadence)?0:(e.mode==='stretch'?stretchPhases(e)[0]:(p.target||(e.reps?e.reps[0]:10))));
  if(e.mode==='stretch'&&st.side==null) st.side=0;
  let entry='';
  if(e.mode==='stretch'){
    entry=(e.bilat?'<div class="center"><span class="tag" id="phlabel">'+stretchSideLabel(st.side)+'</span></div>':'')+
      '<div class="chrono num" id="cc">'+fmtT(st.val)+'</div>'+
      '<button class="big" id="ct" onclick="toggleStretch()">'+(st.lbl||'Démarrer')+'</button>'+
      '<div class="mt"></div><button class="big ok" onclick="validateSet()">Fait</button>';
  } else if(e.rhythm){
    /* Tenue rythmee (v2.17) : cote, chrono de la tenue, deux compteurs, Stop.
       Le Stop est la seule entree pendant le rythme, l ecran se regarde de
       biais depuis le sol. Apres le Stop, plus rien n est chronometre et on a
       le temps de choisir : reprendre, rogner, valider, recommencer. */
    const rt=rhythmInit(st), sp=rhythmSpec(st), v=st.val||0, ready=!!st.done&&!rt.on&&v>=1;
    const petit='class="quiet" style="padding:6px 12px;font-size:.8rem"';
    entry='<div class="center"><span class="tag" id="phlabel">'+(rt.on?'…':(rt.stopped?'Série arrêtée':'Prêt · '+rhythmSide(rt.s0)))+'</span></div>'+
      '<div class="chrono num" id="cc">'+(rt.on?'':(rt.stopped?String(v):'—'))+'</div>'+
      '<div class="muted small center" id="rcount">'+rhythmCountsHtml(rt.d,rt.g,sp.cible,rt.stopped?null:rt.s0)+'</div>'+
      (rt.on?'<div class="mt"></div><button class="big" id="ct" onclick="toggleRhythm()">Stop</button>'
        :rt.stopped?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
            '<button '+petit+' onclick="resumeRhythm()">Reprendre</button>'+
            '<button '+petit+' onclick="trimRhythm()"'+(rt.d+rt.g<1?' disabled':'')+' aria-label="Retirer une tenue">− 1 tenue</button>'+
            '<button '+petit+' onclick="resetRhythm()">Réinitialiser</button></div>'
        :'<div class="mt"></div><button class="big" id="ct" onclick="toggleRhythm()">Démarrer</button>')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" style="margin-top:6px">'+
        (ready?'Au journal : <b class="num">'+v+'</b> tenue'+(v>1?'s':'')+' de '+sp.tenue+' s par côté'+(rt.d!==rt.g?', le côté le plus court fait foi':'')+'.'
          :rt.on?'Le Stop arrête la série ; la tenue en cours ne compte pas.'
          :rt.stopped?'Aucune tenue complète : reprends, ou passe la série.'
          :'Tenues de <b class="num">'+sp.tenue+' s</b> par côté, bascule de '+sp.bascule+' s, au son.')+'</div>';
  } else if(e.cadence){
    /* Repetitions cadencees (v2.19) : le deroule des tenues par cote, pas
       celui du bird-dog. Un cote entier puis l autre, rognage et remise a zero
       par cote, validation sur chaque cote. Stop definitif par cote sur les
       abductions, reprise sur le pont (v2.22). Le grand chiffre est la
       repetition en cours pendant la cadence, le compte du cote apres le Stop. */
    const ct=cadInit(st), sp=cadSpec(st), on=ct.on, over=cadOver(st), ready=cadReady(st), N=sp.n;
    const m=st.sides, mn=ready?Math.min.apply(null,m):0;
    const actif=(on||!st.done)?st.side:(st.side<N-1?st.side+1:null);
    const petit='class="quiet" style="padding:6px 12px;font-size:.8rem"';
    const mesure=N>1?(st.side?'Côté gauche':'Côté droit')+' mesuré':'Série arrêtée';
    const repr=sp.reprise&&st.done&&!on&&m[st.side]!=null;
    entry='<div class="center"><span class="tag" id="phlabel">'+(on?'…':(st.done?mesure:'Prêt'+(N>1?' · '+rhythmSide(st.side):'')))+'</span></div>'+
      '<div class="chrono num" id="cc">'+(on?'':(st.done?String(m[st.side]):'0'))+'</div>'+
      '<div class="center" id="phase" style="min-height:1.6rem"></div>'+
      '<div class="muted small center" id="rcount">'+cadCountsHtml(m,sp.cible,actif,null)+'</div>'+
      '<div class="mt"></div><button class="big'+(over?' quiet':'')+'" id="ct"'+(over?' disabled':'')+' onclick="toggleCadence()">'+cadLbl(st)+'</button>'+
      (m.some(v=>v!=null)&&!on?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
        (repr?'<button '+petit+' onclick="resumeCad()">Reprendre</button>':'')+
        m.map((v,i)=>'<button '+petit+' onclick="trimCad('+i+')"'+(v==null||v<=0?' disabled':'')+' aria-label="Retirer une répétition'+(N>1?' côté '+rhythmSide(i).toLowerCase():'')+'">− 1 rép'+(N>1?' '+rhythmSide(i).toLowerCase():'')+'</button>').join('')+
        '<button '+petit+' onclick="resetCad()"'+(st.done?'':' disabled')+'>Réinitialiser'+(N>1?' ce côté':'')+'</button></div>':'')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" id="aide" style="margin-top:6px">'+
        (on?''
          :ready?'Au journal : <b class="num">'+mn+'</b> répétition'+(mn>1?'s':'')+(N>1?' par côté'+(m[0]!==m[1]?', le côté le plus court fait foi':''):'')+'.'
          :over?(N>1?'Un côté sans répétition complète : ':'Aucune répétition complète : ')+(sp.reprise?'reprends, réinitialise, ':'réinitialise'+(N>1?' ce côté':'')+', ')+'ou passe la série.'
          :st.done&&m[st.side]<1?'Aucune répétition complète : '+(sp.reprise?'reprends, ou ':'')+'réinitialise ce côté avant de passer au suivant.'
          :st.done?cadChange(e)+(sp.reprise?' Reprendre continue ce côté.':' Le Stop est définitif pour ce côté : pour le refaire, réinitialise-le.')
          :'Montée <b class="num">'+fmtNum(sp.monte)+'</b> s'+(sp.tenue?', tenue en haut <b class="num">'+fmtNum(sp.tenue)+'</b> s':'')+', descente <b class="num">'+fmtNum(sp.descente)+'</b> s, au son.'+(N>1?' Un côté entier, puis l\'autre.':''))+'</div>';
  } else if(e.mode==='time'){
    holdInit(st,e);
    const n=st.sides.length, ready=holdReady(st);
    entry=(n>1?'<div class="center"><span class="tag" id="phlabel">'+stretchSideLabel(st.side)+'</span></div>':'')+
      '<div class="chrono num" id="cc">'+fmtT(st.val)+'</div>'+
      '<button class="big'+(holdOver(st)?' quiet':'')+'" id="ct"'+(holdOver(st)?' disabled':'')+' onclick="toggleChrono()">'+holdLbl(st)+'</button>'+
      (n>1?'<div class="muted small center" style="margin-top:6px">'+holdRecap(st)+'</div>':'')+
      (st.done?'<div class="center" style="margin-top:8px;display:flex;gap:8px;justify-content:center">'+
        (n>1?'':trimBtn(st,0))+
        '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="resetHold()">Réinitialiser '+(n>1?'ce côté':'')+'</button></div>':'')+
      '<div class="mt"></div><button class="big '+(ready?'ok':'quiet')+'"'+(ready?'':' disabled')+' onclick="validateSet()">Valider la tenue</button>'+
      (ready?'':'<div class="muted small center" style="margin-top:6px">'+(n>1?'Les deux côtés doivent être mesurés : travailler d\'un seul côté renforcerait un déséquilibre.':'Lance le chrono avant de valider.')+'</div>');
  } else {
    /* v1.15 : une serie validee a zero repetition n est pas une serie, et
       « Passer » couvre deja le cas. Le bouton est inerte a zero, comme il
       l est deja sur une tenue non mesuree, et la correction d une seance
       refuse la meme valeur : ce que l application ne produit pas, elle n a
       pas a savoir le re-saisir. */
    entry='<div class="stepper mt"><button onclick="bump(-1)" aria-label="Retirer un">−</button><div class="val num" id="vv">'+st.val+'</div><button onclick="bump(1)" aria-label="Ajouter un">+</button></div>'+
      (e.side?'<div class="muted small center" style="margin-top:6px">Répétitions par côté</div>':'')+
      '<button class="big ok mt'+(st.val<1?' quiet':'')+'" id="vb"'+(st.val<1?' disabled':'')+' onclick="validateSet()">Valider la série</button>'+
      '<div class="muted small center" id="vz" style="margin-top:6px'+(st.val<1?'':';display:none')+'">Une série à zéro n\'est pas une série : utilise Passer.</div>';
  }
  let loadLine='';
  /* en seance allegee la charge est imposee et gelee : pas de reglage, sinon
     le + repartirait de la charge reelle et non de la charge allegee */
  if(p.light&&(e.mode==='load'||e.mode==='fixed'||e.bnd))
    loadLine='<div class="loadbox light"><div class="lv" style="font-size:.92rem">'+
      (e.bnd?bandDot(p.band)+esc(bandLabel(p.band))+(e.bnd==='ass'?' (aide)':''):esc(loadLabelFor(id,p.load)))+'</div></div>'+
      '<div class="center muted small" style="margin-top:4px">Charge allégée, figée pour cette séance</div>';
  else if(e.mode==='load')
    loadLine='<div class="loadbox"><button onclick="adjLoad(-1)" aria-label="Charge inférieure">−</button><div class="lv">'+fmtKg(p.load)+'</div><button onclick="adjLoad(1)" aria-label="Charge supérieure">+</button></div>';
  else if(e.mode==='fixed')
    loadLine='<div class="loadbox"><button onclick="adjLoad(-1)" aria-label="Charge inférieure">−</button><div class="lv" style="font-size:.92rem">'+esc(loadLabelFor(id,p.load))+'</div><button onclick="adjLoad(1)" aria-label="Charge supérieure">+</button></div>';
  else if(e.bnd)
    loadLine='<div class="loadbox"><button onclick="adjBand(-1)" aria-label="Barreau précédent">−</button><div class="lv" style="font-size:.92rem">'+bandDot(p.band)+esc(bandLabel(p.band))+(e.bnd==='ass'?' (aide)':'')+'</div><button onclick="adjBand(1)" aria-label="Barreau suivant">+</button></div>'+
      '<div class="center muted small" style="margin-top:4px">'+(e.bnd==='ass'?'+ = moins d\'aide, plus dur · − = plus d\'aide':'+ = bande plus forte · − = plus faible')+'</div>';
  const held=!!p.hold;
  const holdLine=(e.reps&&!st.cool&&!p.light)
    ? '<div class="spread" style="margin-top:8px"><span class="muted small">'+(held?'Palier tenu : la cible ne monte plus':'Progression active')+'</span>'+
      '<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="toggleHold(\''+id+'\')">'+(held?'Reprendre la progression':'Tenir ce palier')+'</button></div>'
    : '';
  if(st.cool) return '<div class="card">'+
    '<span class="tag">Étirement de fin de séance</span>'+
    '<div class="exo-head" style="margin-top:8px"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    entry+
    backLine()+
    '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="skipCool()">Passer les étirements</button></div>'+
    kbHint()+
  '</div>';
  /* ordre v1.6 : on lit sa cible, on regle sa charge, puis l illustration,
     entiere a toutes les series. La serie en clair remplace les pips. */
  return '<div class="card">'+
    '<div class="exo-head"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    (st.swapped?'<div class="tag flame" style="margin-top:8px">'+(st.light?'Séance allégée : variante de repli':'Variante de repli')+'</div>'
      :(p.light&&(p.repsCut||p.loadCut)?'<div class="tag flame" style="margin-top:8px">Séance allégée : cible réduite</div>':''))+
    '<div class="muted small center" style="margin-top:6px">Série <b class="num">'+st.set+'</b> sur <b class="num">'+st.of+'</b></div>'+
    /* la fourchette affichee est celle de l exercice, p.range, lue par
       rangeOf comme partout (v1.16). Elle ne bouge plus depuis la v2.16, le
       relevement de fourchette ayant disparu, mais le moteur la lit toujours
       la et non au catalogue : un seul chemin. */
    '<div class="perfline">'+
      (e.reps?'<div class="pv cible"><b class="num">'+(p.target||rangeOf(p,e)[0])+'</b><span>Cible</span></div>':'')+
      (e.reps?'<div class="pv"><b class="num">'+rangeOf(p,e)[0]+'-'+rangeOf(p,e)[1]+'</b><span>Fourchette</span></div>':'')+
      /* v2.17 : le barreau de l echelle de tenues, a cote de la fourchette qui
         en depend, la ou la charge et la bande ont leur ligne plus bas */
      (e.rhythm?'<div class="pv"><b class="num">'+tenueOf(id,p)+' s</b><span>Tenue</span></div>':'')+
      /* v2.18 : la hauteur d assise a regler, au meme endroit */
      (e.assise?'<div class="pv"><b class="num">'+assiseOf(id,p)+' cm</b><span>Assise</span></div>':'')+
      ((jour&&jour.length)?'<div class="pv list today"><b class="num">'+setsHtml(jour)+'</b><span>Aujourd\'hui</span></div>':'')+
    '</div>'+
    (prev?'<div class="lastline">Dernière fois <b class="num">'+setsHtml(prev)+'</b>'+lastLevel(id,p)+'</div>':'')+
    loadLine+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    holdLine+
    entry+
    ((!st.swapped&&fbOf(id))?'<button class="danger big mt" onclick="swapPain()">Douleur aujourd\'hui → variante de repli</button>':'')+
    revertLine(st)+
    volSegHtml()+
    '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="skipSet()">Passer</button></div>'+
    kbHint()+
  '</div>';
}
function bump(d){
  const st=cur.steps[cur.i];
  st.val=Math.max(0,(st.val||0)+d);
  const el=$('#vv'); if(el) el.textContent=st.val;
  /* le compteur se rafraichit sans re-rendre la carte : le bouton et son
     explication doivent donc etre bascules a la main, ils ne repassent pas
     par setHtml */
  const b=$('#vb'); if(b){ b.disabled=st.val<1; if(st.val<1) b.classList.add('quiet'); else b.classList.remove('quiet'); }
  const z=$('#vz'); if(z&&z.style) z.style.display=st.val<1?'':'none';
}
function adjLoad(d){
  const st=cur.steps[cur.i], e=DB[st.id], p=perfOf(st.id);
  let nl=p.load;
  if(e.mode==='fixed'){
    const L=fixedLadder(st.id,state.gear);
    if(d>0){ for(const x of L) if(x.v>p.load+0.01){ nl=x.v; break; } }
    else { for(let i=L.length-1;i>=0;i--) if(L[i].v<p.load-0.01){ nl=L[i].v; break; } }
  } else nl=nextLoad(p.load,state.gear,d);
  if(nl!==p.load){p.load=nl;delete p.prevMin;releaseOnManualUp(st.id,d);save();renderSession();}
  else flash(d>0?'Charge maximale disponible avec ton matériel':'Charge minimale');
}
/* Un ajustement manuel change le palier : la memoire de la fenetre de cible
   (v2.14) est faite a l ancien, elle tombe dans les deux sens. Effet assume :
   un ajustement par megarde suivi d un retour dans la meme seance la perd,
   cout un passage. */
/* monter la charge ou la bande a la main vaut « je repars en avant » et libere
   le palier tenu. Descendre le conserve : baisser n est jamais un signal de reprise. */
function releaseOnManualUp(id,d){
  if(d>0&&state.perf[id]&&state.perf[id].hold){ setHold(id,false); flash('Palier libéré : la progression reprend'); }
}
function toggleHold(id){
  const held=isHeld(id);
  setHold(id,!held);
  save();
  flash(held?'Progression reprise sur cet exercice':'Palier tenu : la cible ne montera plus');
  if(view==='session') renderSession(); else render();
}
/* ajustement manuel de la bande, meme logique que les reps : le choix persiste.
   + va toujours vers le plus dur, quel que soit le sens de l exercice */
function adjBand(d){
  const st=cur.steps[cur.i], e=DB[st.id], p=perfOf(st.id);
  const nb=nextBandFor(e,p.band,state.gear,d);
  if(nb){ p.band=nb; delete p.prevMin; releaseOnManualUp(st.id,d); save(); renderSession(); }
  else flash(d>0?'Barreau le plus dur de ton échelle':'Barreau le plus facile');
}
/* Repli douleur : toutes les series restantes de l exercice basculent sur la
   variante protectrice. Les series deja validees ne bougent pas : elles ont
   ete faites sur l exercice d origine, et le journal les a deja inscrites sous
   sa cle. Les series du repli sont journalisees sous une cle propre
   « origine>repli » : deux exercices repliant vers la meme variante ne
   melangent pas leurs series, et l historique garde d ou vient le repli. */
function swapPain(){
  const st=cur.steps[cur.i], fb=fbOf(st.id);
  if(!fb) return;
  const old=st.id, key=old+'>'+fb;
  rhythmAbort();   /* avant la boucle : elle supprime le rt que toneCancel suppose encore la */
  cur.steps.forEach((s,i)=>{
    /* delete s.rt comme dans stepBack : le rythme appartient au couple etape
       plus exercice, il ne suit pas l etape qui change d identite. Aucun des
       deux exercices rythmes n a de repli aujourd hui, la garde est donc sans
       objet et c est exactement pourquoi elle s ecrit : elle tient par
       construction plutot que par l absence de champ fb. */
    /* v2.19 : la mesure non plus. Elle vivait dans st.val pour les repetitions,
       remis a null ici depuis toujours, et dans st.sides et st.done pour les
       tenues, que personne ne remettait a zero : une tenue de 17 s faite sur la
       planche sur ballon arrivait mesuree et validable sur la planche au sol,
       et partait au journal sous elle. Une mesure appartient au couple etape
       plus exercice, au meme titre que le rythme : elle ne suit pas l etape qui
       change d identite, dans aucun mode. Pour garder une tenue finie, il faut
       la valider avant de signaler la douleur. */
    if(i>=cur.i&&s.k==='set'&&s.id===old&&!s.cool){s.id=fb;s.key=key;s.swapped=true;s.from=old;s.val=null;delete s.rt;
      delete s.ct; delete s.sides; delete s.side; delete s.done;}
  });
  relinkRests();
  clearTimers(); flash('On protège, on ne renonce pas.'); renderSession();
}
/* Retour a l exercice d origine (v1.12). Il existe pour la fausse manoeuvre,
   non pour renegocier la douleur : discret, il ne defait rien de ce qui a ete
   fait. Si aucune serie n a ete validee sur le repli, aucune cle « origine>repli »
   n existe et la seance redevient exactement ce qu elle etait. Si une serie y a
   ete faite, elle reste au journal, le repli reste compte dans le capteur de
   douleur, et la progression reste bloquee sur l exercice : le repli a bien eu
   lieu. Le mode allege n est pas un repli douleur et n offre pas ce retour. */
function revertSwap(){
  const st=cur.steps[cur.i], old=st.from;
  if(!st.swapped||st.light||!old||!DB[old]) return;
  cur.steps.forEach((s,i)=>{
    /* v2.19 : meme regle au retour, voir swapPain */
    if(i>=cur.i&&s.k==='set'&&s.from===old&&!s.cool){s.id=old;s.key=old;delete s.swapped;delete s.from;s.val=null;
      delete s.sides; delete s.side; delete s.done; delete s.ct;}
  });
  relinkRests();
  clearTimers(); flash('Retour à '+DB[old].nom); renderSession();
}
/* Premiere etape de travail apres l index i. Extraite de relinkRests en v2.6 :
   l ecran de repos a besoin du pas lui-meme et pas seulement de son
   identifiant, la cle du journal etant st.key des qu un repli est en cours. */
function nextWork(steps,i){
  for(let j=i+1;j<steps.length;j++){
    const s=steps[j];
    if(s.k==='set'||s.k==='cardio') return s;
  }
  return null;
}
/* Apres toute bascule ou tout retour, chaque ecran de repos annonce l exercice
   qui le suit reellement : on relit la sequence plutot que de substituer un
   identifiant, ce qui reste juste quel que soit le sens du changement.
   Elle prend la liste en parametre depuis la v2.6, pour que la construction de
   seance et le changement de volume l appellent au lieu de poser next a la
   main : trois ecritures dispersees du meme champ devenaient trois occasions
   de diverger, il n en reste qu une. */
function relinkRests(steps){
  const L=steps||cur.steps;
  for(let i=0;i<L.length;i++){
    if(L[i].k!=='rest') continue;
    const n=nextWork(L,i);
    L[i].next=n?n.id:null;
    L[i].nextKey=n?(n.key||n.id):null;
  }
}
/* ligne de retour commune aux series et au module cardio */
function revertLine(st){
  if(!st.swapped||st.light||!st.from||!DB[st.from]) return '';
  const fn=(st.k==='cardio')?'revertCardio()':'revertSwap()';
  return '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="'+fn+'">Revenir à '+esc(DB[st.from].nom)+'</button></div>';
}
/* meme geste pendant le module cardio : la marche continue remplace le bas impact */
function swapCardio(){
  const st=cur.steps[cur.i], fb=fbOf(st.id);
  if(!fb||st.swapped) return;
  clearTimers();
  st.id=fb; st.swapped=true; st.from=CARDIO_ID;
  flash('On protège, on ne renonce pas.'); renderSession();
}
/* retour du module cardio, aligne sur celui des series (v1.12) */
function revertCardio(){
  const st=cur.steps[cur.i], old=st.from;
  if(!st.swapped||st.light||!old||!DB[old]) return;
  clearTimers();
  st.id=old; delete st.swapped; delete st.from;
  flash('Retour à '+DB[old].nom); renderSession();
}
function skipSet(){ rhythmAbort(); clearTimers(); nextStep(); }
function validateSet(){
  const st=cur.steps[cur.i], e=DB[st.id];
  /* les etirements de fin ne comptent ni en XP, ni en series, ni en progression */
  if(st.cool){ clearInterval(timers.c); timers.c=null; cur.model=(cur.model||0)+serieModelAdd(st.id,null); nextStep(); return; }
  /* une tenue ne se valide pas sur une mesure absente ou a moitie faite :
     l ecran grise le bouton, ENTREE dit la meme chose (v1.13) */
  if(e.mode==='time'){ holdInit(st,e); if(!holdReady(st)) return; }
  /* une tenue rythmee ne se valide qu arretee et avec au moins une tenue
     complete des deux cotes : l ecran grise le bouton, ENTREE dit la meme
     chose (v2.17) */
  if(e.rhythm){ if(!st.rt||st.rt.on||!st.done) return; }
  /* une serie cadencee, sur ses deux cotes mesures et au moins une
     repetition de chaque (v2.19) */
  if(e.cadence){ cadInit(st); if(!cadReady(st)) return; }
  clearInterval(timers.c); timers.c=null;
  const v=(e.mode==='stretch')?1
        :((e.mode==='time'||e.cadence)?Math.min.apply(null,st.sides):(st.val||0));
  if(e.mode!=='stretch'&&v<1) return;   /* v1.15 : pas de serie a zero, tenues comprises */
  (cur.log[st.key||st.id]=cur.log[st.key||st.id]||[]).push(v);
  /* La duree se range sous la meme cle et au meme instant que la serie : la
     parite des deux tableaux est vraie par construction, et une serie passee
     n ecrivant rien dans le journal n ecrit rien ici non plus. */
  const dur=st.t0?Math.max(0,Math.round((Date.now()-st.t0)/1000)):null;
  (cur.secs[st.key||st.id]=cur.secs[st.key||st.id]||[]).push(dur);
  cur.done=(cur.done||0)+1;
  cur.xp+=XP_SET;
  const ma=serieModelAdd(st.id,v);
  cur.model=(cur.model||0)+ma;
  /* un pas en arriere reste ouvert depuis l etape qui suit immediatement :
     une pression unique qui inscrit quelque chose merite un retour (v1.13) */
  cur.back={i:cur.i,from:cur.i+1,key:st.key||st.id,val:v,model:ma};
  nextStep();
}
/* Retour d un pas. Rien n est persiste en cours de seance, le journal, le
   compteur de series et les XP se defont donc entierement. Un seul pas, et
   seulement depuis l etape qui suit la serie validee. */
/* ============ CHANGEMENT DE VOLUME EN COURS DE SEANCE (v2.1) ============
   L entree « ajustement du nombre de series en cours de seance » etait ecartee
   au carnet pour deux raisons mecaniques, et les bornes posees ici les ferment
   toutes les deux. Le plancher a 2 rend inatteignable prevu=1, donc le chemin
   « une seule serie = montee » ferme en v1.4 ne se rouvre pas. Et la serie en
   plus, bornee a une seule, ne dilue pas une montee acquise : le volume du
   passage est fixe AVANT que la derniere serie soit jouee, donc le passage est
   juge entier, exactement comme s il avait ete lance a ce volume. L entree
   ecartee visait un ajustement retroactif, ce n est pas ce qui est fait ici.
   Rien de plus n est necessaire : prevu se derive des etapes, donc « seance
   complete », la couverture et les verrous suivent d eux-memes. */
function volAllowed(){
  if(!cur||cur.phase!=='work') return [];
  const st=cur.steps[cur.i];
  if(!st||(st.k!=='set'&&st.k!=='rest')||st.cool) return [];
  const en=roundOf(cur.i);      /* round entame : on ne descend jamais dessous */
  return ROUNDS_CHOICES.filter(r=>r>=Math.max(2,en)&&r<=Math.min(4,cur.rounds0+1));
}
/* round auquel appartient l etape courante, transitions comprises */
function roundOf(i){
  for(let k=i;k>=0;k--){ const s=cur.steps[k]; if(s.k==='set'&&!s.cool) return s.round||1; }
  return 1;
}
function volSegHtml(){
  const L=volAllowed();
  if(L.length<2) return '';
  return '<div class="center" style="margin-top:10px"><div class="muted small">Séries par exercice</div>'+
    '<div class="seg roundseg" style="margin-top:6px">'+L.map(r=>
      '<button class="'+(r===cur.rounds?'':'quiet')+'" onclick="setSessionRounds('+r+')">'+r+'</button>').join('')+'</div></div>';
}
function setSessionRounds(R){
  if(!cur||volAllowed().indexOf(R)<0||R===cur.rounds) return;
  const st=cur.steps[cur.i];
  /* coupe : tout ce qui suit le circuit, cardio et etirements, ne bouge pas */
  let cut=cur.steps.length;
  for(let k=0;k<cur.steps.length;k++){ const s=cur.steps[k]; if(s.k==='cardio'||(s.k==='set'&&s.cool)){ cut=k; break; } }
  const queue=cur.steps.slice(cut);
  const byRound=[];
  cur.steps.slice(0,cut).forEach(s=>{ if(s.k==='set'&&!s.cool){ const r=(s.round||1)-1; (byRound[r]=byRound[r]||[]).push(s); } });
  const modele=byRound[byRound.length-1]||[];
  while(byRound.length<R){
    /* un round ajoute reprend les memes exercices, valeurs remises a zero :
       une serie non jouee ne porte rien */
    byRound.push(modele.map(s=>Object.assign({},s,{val:null,t0:null,set:byRound.length+1})));
  }
  byRound.length=R;
  const out=[];
  byRound.forEach((round,r)=>round.forEach((s,i)=>{
    s.set=r+1; s.of=R; s.round=r+1;
    out.push(s);
    const last=(r===R-1&&i===round.length-1);
    /* v2.10 : meme constructeur qu a la construction de seance. Un tour retire
       ou ajoute deplace le raccord, qui se rederive donc de la position et
       n est jamais recopie de l ancienne liste. */
    if(!last) out.push(restStep(i===round.length-1,s.id,round[0].id));
  }));
  cur.steps=out.concat(queue);
  relinkRests();
  cur.rounds=R;
  const j=cur.steps.indexOf(st);
  cur.i=(j>=0)?j:Math.min(cur.i,cur.steps.length-1);
  cur.back=null;      /* le pas en arriere designait une etape d une autre liste */
  /* la duree annoncee suit le volume, sans quoi le recapitulatif comparerait
     le reel a une annonce perimee */
  const parts=planParts({steps:cur.steps,warm:cur.warmMode,light:cur.light,exos:cur.exos});
  cur.plan=Math.round(parts.total/60); cur.planSec=parts.total; cur.model=parts.remount;
  flash(R+' séries par exercice');
  render();
}
function backLine(){
  if(!cur||!cur.back||cur.back.from!==cur.i) return '';
  const st=cur.steps[cur.back.i]; if(!st) return '';
  const nom=DB[st.id]?DB[st.id].nom:'l\'exercice';
  return '<div class="center" style="margin-top:8px"><button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="stepBack()">Revenir à '+esc(nom)+'</button></div>';
}
function stepBack(){
  if(!cur||!cur.back||cur.back.from!==cur.i) return;
  const b=cur.back, st=cur.steps[b.i];
  const arr=cur.log[b.key];
  if(arr&&arr.length) arr.pop();
  if(arr&&!arr.length) delete cur.log[b.key];
  const dar=cur.secs[b.key];
  if(dar&&dar.length) dar.pop();
  if(dar&&!dar.length) delete cur.secs[b.key];
  cur.done=Math.max(0,(cur.done||0)-1);
  cur.xp=Math.max(0,cur.xp-XP_SET);
  /* la part modelisee se defait avec la serie : les secondes deja comptees au
     tick, elles, restent, puisqu elles ont bien ete passees */
  cur.model=Math.max(0,(cur.model||0)-(b.model||0));
  clearTimers();
  st.val=null; delete st.sides; delete st.side; delete st.done; delete st.lbl; delete st.prepLeft;
  delete st.t0; delete st.rt; delete st.ct;
  cur.i=b.i; cur.back=null;
  flash('Série annulée : '+(DB[st.id]?DB[st.id].nom:''));
  renderSession();
}
function skipCool(){
  clearTimers();
  while(cur.i<cur.steps.length&&cur.steps[cur.i].cool) cur.i++;
  if(cur.i>=cur.steps.length){ if(!cur.ending){cur.ending=true;endSession();} }
  else renderSession();
}
/* bips des cinq secondes precedant la cible d un exercice tenu : le chrono
   compte vers le haut. 0 = rien, 1 = bip grave d approche, 2 = bip d arrivee
   (inchange). Le garde target>5 ne concerne que l approche. */
function preBipKind(val,target){
  if(!target) return 0;
  if(val===target) return 2;
  if(target>5&&val>=target-5&&val<target) return 1;
  return 0;
}
/* decompte de preparation avant tout chrono (exercices tenus et etirements),
   rejoue a chaque pression de Demarrer ou Reprendre : reprendre, c est se
   remettre en position. Bip a chaque seconde, plus aigu au depart. 0 = direct. */
function startPrep(runLbl,then){
  const n=prepSec();
  if(n<=0){ then(); return; }
  let left=n;
  cur.steps[cur.i].prepLeft=left;
  const bt=$('#ct'); if(bt) bt.textContent=runLbl;
  const el=$('#cc'); if(el) el.textContent=String(left);
  beep(700,.1);
  timers.c=setInterval(()=>{
    tick(); left--;
    cur.steps[cur.i].prepLeft=left;
    const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
    if(left>0){ e2.textContent=String(left); beep(700,.1); }
    else { clearInterval(timers.c); timers.c=null; delete cur.steps[cur.i].prepLeft; beep(1150,.16); then(); }
  },1000);
}
/* Tenues chronometrees (v1.13). « Reprendre » disparait : un Stop est definitif.
   Il permettait d atteindre 45 s en trois morceaux de 15, alors que la
   fourchette mesure une tenue continue ; l outil ne disait pas quelle lecture
   il attendait. Pour refaire, on reinitialise et on repart de zero.
   Un exercice par cote est deux tenues completes : la validation exige une
   mesure de chaque cote, et c est le cote le plus court qui part au journal,
   pour que l asymetrie soit visible plutot que masquee.
   ESPACE ne detruit jamais une mesure : une fois le dernier cote arrete, il
   est inerte, et la remise a zero est un bouton, jamais une touche. */
function holdInit(st,e){
  if(!st.sides) st.sides=new Array((e||DB[st.id]).side?2:1).fill(null);
  if(st.side==null) st.side=0;
  if(st.val==null) st.val=0;
}
function holdOver(st){ return !!st.done&&st.side>=st.sides.length-1; }
function holdReady(st){ return st.sides&&st.sides.every(v=>v!=null); }
function holdLbl(st){
  if(timers.c) return 'Stop';
  if(!st.done) return st.side>0?'Second côté':'Démarrer';
  return st.side<st.sides.length-1?'Second côté':'Tenue mesurée';
}
function holdRecap(st){
  return st.sides.map((v,i)=>(i?'2e':'1er')+' côté : '+(v==null?'—':fmtT(v))+(v!=null&&!timers.c?' '+trimBtn(st,i):'')).join(' · ');
}
/* Rogner une tenue mesuree (v2.16). Le chrono tourne jusqu a ESPACE, et entre
   la fin reelle de la tenue et l appui il se passe couramment plusieurs
   secondes, jusqu a huit constatees sur un gainage lateral : la mesure est une
   borne haute. Le bouton retire les secondes qu on n a pas tenues, une par
   appui, jamais il n en ajoute, et jamais sous 1 puisqu une serie a zero n est
   pas une serie. Une declaration qui ne peut que baisser la valeur ne cree
   aucune incitation, c est ce qui la distingue des champs declaratifs ecartes
   au carnet. Le Stop reste definitif, on rogne, on ne reprend pas ; ESPACE ne
   touche pas a la mesure, le rognage est un bouton et la touche moins. Sur
   une tenue par cote chaque cote mesure porte son bouton, la correction se
   fait sur l ecran de validation, avant que le cote le plus court parte au
   journal. Inerte pendant qu un chrono tourne : on ne rogne pas une mesure
   qui n est pas finie. */
function trimBtn(st,i){
  const v=st.sides&&st.sides[i];
  return '<button class="quiet" style="padding:6px 12px;font-size:.8rem" onclick="trimHold('+i+')"'+(v==null||v<=1||timers.c?' disabled':'')+' aria-label="Retirer une seconde">− 1 s</button>';
}
function trimHold(i){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||timers.c) return;
  if(st.sides[i]==null||st.sides[i]<=1) return;
  st.sides[i]--;
  if(i===st.side) st.val=st.sides[i];
  renderSession();
}
function toggleChrono(){
  const st=cur.steps[cur.i], e=DB[st.id];
  holdInit(st,e);
  if(timers.c){                       /* Stop : la mesure du cote est figee */
    clearInterval(timers.c); timers.c=null; delete st.prepLeft;
    st.sides[st.side]=st.val||0; st.done=true;
    renderSession(); return;
  }
  if(st.done){                        /* passage au cote suivant */
    if(st.side>=st.sides.length-1) return;
    st.side++; st.done=false; st.val=0;
    beep(700,.22);
    renderSession();
    runHold(st); return;
  }
  runHold(st);
}
function runHold(st){
  startPrep('Stop',()=>{
    const b=$('#ct'); if(b) b.textContent='Stop';
    const el=$('#cc'); if(el) el.textContent=fmtT(st.val||0);
    timers.c=setInterval(()=>{
      tick(); st.val=(st.val||0)+1;
      const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
      e2.textContent=fmtT(st.val);
      const p=perfFor(st.id,!!st.light), k=preBipKind(st.val,p.target||0);
      if(k===2) beep(1200,.22); else if(k===1) beep(700,.12);
      else if(repereOn()&&st.val%REPERE.pas===0) tone(REPERE.freq,0,REPERE.dur,REPERE.gain);
    },1000);
  });
}
function resetHold(){
  const st=cur.steps[cur.i];
  if(!st||!st.sides||timers.c||!st.done) return;
  st.sides[st.side]=null; st.val=0; st.done=false;
  renderSession();
}
/* ============ TENUES RYTHMEES (v2.17) ============
   Bird-dog et dead bug. Une serie est une suite de tenues alternees, droite
   puis gauche, chacune de la duree du barreau courant et suivie d une bascule
   de 2 s. L outil rythme la serie au son : un coup a l ouverture de chaque
   tenue, un coup grave a sa fermeture, le ton de cible sur la fermeture qui
   amene un cote a sa cible, et le metronome continue jusqu au Stop, la cible
   est ce qu on vise, pas la ou l on s arrete. Le decompte de preparation
   enchaine directement sur la premiere ouverture : son zero EST le premier
   coup, sinon une seconde morte s installe avant le rythme.
   DEUX HORLOGES. L etat (compteurs, phase, cote) se derive du temps ecoule sur
   l horloge murale, rien n est accumule par tick : une boucle qui se reveille
   en retard ne perd rien, et une suite de test pilote le temps a la main. Les
   coups, eux, sont programmes en avance sur l horloge audio, seule capable de
   sonner a l instant voulu quel que soit le reveil du timer ; le decalage
   entre les deux horloges est releve au depart, une fois. Sans son, mode
   degrade assume : le rythme se lit a l ecran.
   STOP, REPRENDRE, ROGNER. Le Stop est la seule entree pendant le rythme, et
   la tenue en cours ne compte pas. Il n est pas definitif comme sur une tenue
   chronometree : la-bas la continuite EST la mesure et 45 s en trois morceaux
   de 15 ne mesurent rien (v1.13) ; ici la mesure est chaque tenue, intacte
   quelle que soit la pause avant elle, et la serie n est que leur somme. Une
   interruption ne detruit donc pas la serie : Reprendre rejoue le decompte et
   repart sur le cote qui etait en cours, l ecart entre cotes reste d au plus
   un. Le rognage « - 1 tenue » est l analogue du « - 1 s » (v2.16) : entre la
   fermeture reelle et la main qui atteint le telephone au sol il se passe des
   secondes, qui a 3 s de tenue valent une tenue comptee de trop ; une
   declaration qui ne peut que baisser ne cree aucune incitation. Le cote le
   plus court part au journal (v1.13). */
const RHYTHM_TICK=250, RHYTHM_AHEAD=.35;
const RHYTHM_OPEN=950, RHYTHM_CLOSE=700, RHYTHM_CIBLE=1200;
const RHYTHM_PREP_OFF=[0,.26];        /* coup double du decompte, comme beep() */
function rhythmNow(){ return (typeof performance!=='undefined'&&performance.now)?performance.now()/1000:Date.now()/1000; }
function rhythmInit(st){
  if(!st.rt) st.rt={d:0,g:0,s0:0,on:false,stopped:false,t0:null};
  return st.rt;
}
function rhythmSpec(st){
  const e=DB[st.id], p=perfFor(st.id,!!st.light), r=rungOf(e,p.tenue);
  return {tenue:r.tenue,bascule:e.rhythm.bascule,cycle:r.tenue+e.rhythm.bascule,cible:p.target||r.reps[0]};
}
/* Repartition de n tenues fermees entre droite et gauche quand la premiere a
   ete jouee du cote s0 (0 droite, 1 gauche) : [droite, gauche]. */
function rhythmSplit(n,s0){ const a=Math.ceil(n/2), b=Math.floor(n/2); return s0===0?[a,b]:[b,a]; }
/* Tenues fermees a l instant e (secondes depuis la premiere ouverture). */
function rhythmClosed(sp,e){ return e>=sp.tenue?Math.floor((e-sp.tenue)/sp.cycle)+1:0; }
function rhythmSide(s){ return s?'Gauche':'Droite'; }
/* Le cote mis en valeur est celui qui est en jeu ou qui vient immediatement :
   celui qui demarre avant le depart et pendant le decompte, celui de la tenue
   en cours, celui qu annonce la bascule. Une serie arretee n en met aucun, rien
   ne vient tant qu on n a pas repris. La ligne est en muted, l accent suffit
   donc a la lecture de biais depuis le sol, sans ajouter de classe. */
function rhythmCountsHtml(d,g,cible,actif){
  const cote=(s,v)=>{ const t=rhythmSide(s)+' <b class="num">'+v+'</b>';
    return actif===s?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t; };
  return cote(0,d)+' · '+cote(1,g)+' · cible <b class="num">'+cible+'</b> par côté';
}
function rhythmStart(st){
  const rt=rhythmInit(st), sp=rhythmSpec(st), n=prepSec(), now=rhythmNow();
  rt.on=true; rt.stopped=false; rt.start=now; rt.ticked=0; rt.t0=now+n+.15; rt.sched=0;
  st.done=false;
  const ctx=sndOn()?audioCtx():null;
  rt.off=ctx?(ctx.currentTime-now):null;
  if(ctx&&ctx.state==='suspended'&&ctx.resume){ try{ ctx.resume(); }catch(e){} }
  /* Le decompte sonne comme partout ailleurs : coup double a 260 ms, le meme
     que beep(700,.1). L emission simple ne vaut que dans le rythme, ou le
     second coup tomberait au dixieme d une tenue de 3 s ; le decompte, lui,
     est avant le rythme et espace d une seconde, rien ne s y brouille. Le zero
     du decompte est l ouverture de la premiere tenue, a 950 : la montee de
     hauteur par rapport au tick est conservee, et 1150 n est pas repris parce
     qu il est colle au 1200 du ton de cible, la premiere tenue sonnerait comme
     une cible atteinte. Pas de vibration : derriere la porte des sons elle ne
     sert jamais de repli, le telephone est au sol sur ces deux exercices, et
     elle ne s ordonnance pas sur l horloge audio. */
  if(rt.off!=null) for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,rt.t0-k+d+rt.off,.1));
  clearInterval(timers.c);
  timers.c=setInterval(rhythmLoop,RHYTHM_TICK);
  renderSession();
  rhythmLoop();
}
function rhythmLoop(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.rt||!st.rt.on){ if(timers.c){ clearInterval(timers.c); timers.c=null; } return; }
  const rt=st.rt, sp=rhythmSpec(st), now=rhythmNow();
  /* le modele compte les secondes ecoulees, une fois chacune */
  const sec=Math.floor(now-rt.start); while(rt.ticked<sec){ tick(); rt.ticked++; }
  /* coups a venir dans la fenetre d avance */
  if(rt.off!=null){
    let garde=0;
    while(rt.t0+rt.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50){
      const i=rt.sched, side=(rt.s0+i)%2, sp2=rhythmSplit(i+1,rt.s0);
      const apres=side===0?rt.d+sp2[0]:rt.g+sp2[1], cible=apres===sp.cible;
      tone(RHYTHM_OPEN,rt.t0+i*sp.cycle+rt.off,.12);
      tone(cible?RHYTHM_CIBLE:RHYTHM_CLOSE,rt.t0+i*sp.cycle+sp.tenue+rt.off,cible?.22:.12);
      rt.sched++;
    }
  }
  rhythmPaint(st,sp,now-rt.t0);
}
function rhythmPaint(st,sp,e){
  const rt=st.rt, lbl=$('#phlabel'), cc=$('#cc'), cnt=$('#rcount');
  if(!cc) return;
  if(e<0){
    if(lbl) lbl.textContent='En position · '+rhythmSide(rt.s0);
    /* borne au decompte regle : les 0,15 s d avance du depart afficheraient
       un 4 sur un decompte de 3 */
    cc.textContent=String(Math.max(1,Math.min(prepSec()||1,Math.ceil(-e)))); cc.className='chrono num';
    return;
  }
  const i=Math.floor(e/sp.cycle), ph=e-i*sp.cycle, hold=ph<sp.tenue, side=(rt.s0+i)%2;
  const c=rhythmSplit(rhythmClosed(sp,e),rt.s0);
  const suivant=(rt.s0+i+1)%2;
  if(hold){ if(lbl) lbl.textContent=rhythmSide(side); cc.textContent=String(Math.max(1,Math.ceil(sp.tenue-ph))); cc.className='chrono num'; }
  else { if(lbl) lbl.textContent='Passe à '+(suivant?'gauche':'droite'); cc.textContent='·'; cc.className='chrono num rest pause'; }
  if(cnt) cnt.innerHTML=rhythmCountsHtml(rt.d+c[0],rt.g+c[1],sp.cible,hold?side:suivant);
}
function rhythmStop(st){
  const rt=st.rt; if(!rt||!rt.on) return;
  const sp=rhythmSpec(st), e=rhythmNow()-rt.t0, n=rhythmClosed(sp,e), c=rhythmSplit(n,rt.s0);
  rt.d+=c[0]; rt.g+=c[1]; rt.s0=(rt.s0+n)%2;
  rt.on=false; rt.stopped=true; rt.t0=null;
  clearInterval(timers.c); timers.c=null;
  toneCancel();
  st.val=Math.min(rt.d,rt.g); st.done=true;
  renderSession();
}
function toggleRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].rhythm) return;
  const rt=rhythmInit(st);
  if(rt.on) rhythmStop(st); else if(!rt.stopped) rhythmStart(st);
}
/* Etape quittee pendant le rythme, sans passer par le Stop : la serie est
   abandonnee et rien ne part au journal, mais les coups deja programmes sur
   l horloge audio sonneraient apres le depart et le rt resterait arme, avec un
   t0 qui vieillit. Appele partout ou l on quitte une etape en cours. */
function rhythmAbort(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st) return;
  /* v2.19 : meme abandon pour une serie cadencee en cours */
  if(st.ct&&st.ct.on){ st.ct.on=false; toneCancel(); }
  if(!st.rt||!st.rt.on) return;
  st.rt.on=false; toneCancel();
}
function resumeRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on||!st.rt.stopped) return;
  rhythmStart(st);
}
/* Le rognage retire la DERNIERE tenue comptee, du cote ou elle a ete comptee,
   et la valeur au journal se recalcule sur les compteurs. Il ne se soustrait
   pas a la valeur : quand les deux cotes different d une tenue, la latence du
   Stop est deja absorbee par le cote le plus court, et retrancher au journal
   enlevait une tenue qui avait ete tenue. Cas releve par Gabriel : six par
   cote, Stop tardif, droite a sept ; le journal disait deja six et « - 1 tenue »
   le faisait tomber a cinq, en laissant les compteurs a 7 et 6. Retiree la ou
   elle a ete comptee, la tenue laisse compteurs et journal d accord, et la
   reprise repart sur le cote rendu. Plancher : les compteurs, qui ne passent
   pas sous zero ; la valeur au journal peut donc revenir a zero, etat que le
   Stop apres une seule tenue produit deja et que l ecran sait dire. */
function trimRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on||!st.done) return;
  const rt=st.rt, s=(rt.s0+1)%2;        /* cote de la derniere tenue fermee */
  if(s===0?rt.d<=0:rt.g<=0) return;
  if(s===0) rt.d--; else rt.g--;
  rt.s0=s;                              /* elle est a refaire : la reprise y repart */
  st.val=Math.min(rt.d,rt.g);
  renderSession();
}
function resetRhythm(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!st.rt||st.rt.on) return;
  delete st.rt; st.val=0; delete st.done;
  renderSession();
}
/* ============ REPETITIONS CADENCEES (v2.19) ============
   Gainage lateral avec abductions. Une serie est une planche tenue sur un
   cote pendant laquelle la jambe du dessus monte et descend au son, puis la
   meme chose de l autre cote. Moteur a part du rythme des tenues : celui-ci
   alterne les cotes a chaque repetition, ce qui est impossible ici, changer
   de cote c est se retourner. Il en partage les briques, les deux horloges,
   l emetteur simple-coup, les frequences et le decompte a coup double.
   DEROULE. Decompte allonge sur le cote, avant-bras pose ; a son zero, le
   double coup a 1150 Hz du gainage lateral classique, puisque c en est un :
   le bassin se decolle. Suivent etab secondes de planche jambes serrees, la
   ligne a stabiliser avant de charger la jambe, puis la cadence. Au bird-dog
   le decompte enchaine directement parce que la position de depart est un
   repos ; ici elle exige un mouvement. Le 1150, ecarte en v2.17 parce qu il
   est colle au ton de cible, ne s y confond pas ici : double coup, au depart,
   suivi de secondes de silence, quand la cible est un coup simple en fin de
   serie.
   COMPTE. Une repetition compte a la fin de sa descente, jambe revenue : la
   descente freinee est la moitie de l exercice, une jambe qui retombe ne doit
   pas compter. Coup a 950 au debut de chaque montee, coup a 700 au debut de
   chaque descente. Le ton de cible sonne donc a la fin de la repetition qui
   amene le cote a sa cible, a la place du 950 qui ouvre la suivante, et la
   cadence continue jusqu au Stop. Valeurs retenues par Gabriel sur maquette,
   15 et 17 septembre 2026 : 1,5 s de montee et 1,5 s de descente, la montee
   en 1 s etant jugee violente, 3 s d etablissement.
   STOP. Definitif pour le cote, comme sur une tenue (v1.13) : la planche est
   continue et la reprendre en deux morceaux retirerait le gainage que le
   mouvement de la jambe met a l epreuve. Un Stop accidentel se corrige par
   « Reinitialiser ce cote ». Chaque cote mesure porte son « - 1 rep », pour la
   latence du Stop ; plancher a zero, la validation exigeant une repetition
   de chaque cote. Le cote le plus court part au journal. */
const CAD_GO=1150;
/* v2.22, trois changements, un par retour de Gabriel.
   AIGU. Il sonnait a la place du 950 de la montee qui suit la repetition-
   cible : le cycle est continu, la fin d une descente et le debut de la
   montee suivante sont le meme instant, donc l aigu tombait sur l elevation
   d apres. Au bird-dog la bascule separe les deux evenements, ici rien. Il
   remplace desormais le 950 de la montee de la repetition-cible : « celle-ci
   est la bonne ». Le credit au Stop ne change pas, fin de descente, le plus
   robuste a la latence : un Stop n importe ou dans la repetition suivante
   enregistre le bon compte.
   CHIFFRE. Le grand chiffre porte la repetition en cours, 1 des la premiere
   montee ; la ligne des comptes porte les repetitions terminees, ce que le
   Stop enregistre.
   GENERALISATION. Le pont fessier et sa lignee passent au son : sur le dos,
   l ecran ne se voit pas, critere deja ecrit pour bird-dog et dead bug. D ou
   un cote ou deux selon e.side, une tenue en haut (tenue, silence entre le
   sommet et le 700), un etablissement optionnel, et la reprise du bird-dog
   (reprise) : un pont n a rien de continu, une pause en bas est un repos.
   Sur les abductions le Stop reste definitif, la planche est continue. */
function cadN(e){ return e&&e.side?2:1; }
function cadInit(st){
  const n=cadN(DB[st.id]);
  if(!st.sides||st.sides.length!==n) st.sides=new Array(n).fill(null);
  if(st.side==null) st.side=0;
  if(!st.ct) st.ct={on:false,t0:null};
  return st.ct;
}
function cadSpec(st){
  const e=DB[st.id], p=perfFor(st.id,!!st.light), c=e.cadence, tenue=c.tenue||0;
  return {monte:c.monte,tenue:tenue,descente:c.descente,etab:c.etab||0,cycle:c.monte+tenue+c.descente,
          reprise:!!c.reprise,n:cadN(e),cible:p.target||rangeOf(p,e)[0]};
}
/* Repetitions completes a l instant e, en secondes depuis la premiere montee. */
function cadClosed(sp,e){ return e>0?Math.floor(e/sp.cycle):0; }
/* Pas de garde sur la cadence en cours : un cote ne demarre que non mesure,
   frais, remis a zero, second ou repris, donc une serie qui tourne a toujours
   un cote a null. */
function cadReady(st){ return !!st.sides&&st.sides.every(v=>v!=null)&&Math.min.apply(null,st.sides)>=1; }
function cadOver(st){ return !!st.done&&st.side>=st.sides.length-1; }
function cadLbl(st){
  if(st.ct&&st.ct.on) return 'Stop';
  if(!st.done) return st.side>0?'Second côté':'Démarrer';
  return st.side<st.sides.length-1?'Second côté':'Série mesurée';
}
/* Ce qui se lit pendant le decompte, et ce qui se fait entre deux cotes,
   depend du geste : se retourner sur le flanc, ou changer de jambe. */
function cadPose(e,side){
  if(e.cadence.etab) return 'Allonge-toi sur le côté '+(side?'gauche':'droit')+', avant-bras posé. Au double bip, décolle le bassin.';
  return (cadN(e)>1?'Pied '+(side?'gauche':'droit')+' au sol, l\'autre jambe tendue. ':'')+'La première montée vient au bip.';
}
function cadChange(e){ return e.cadence.etab?'Retourne-toi, puis Second côté.':'Change de jambe, puis Second côté.'; }
/* Ligne des comptes : un cote non mesure est « a faire », pas zero. Le cote
   mis en valeur est celui qui tourne ou qui vient. Sans cotes, le compte seul. */
function cadCountsHtml(m,cible,actif,live){
  const val=s=>{ const v=(live!=null&&s===actif)?live:m[s]; return v==null?'à faire':'<b class="num">'+v+'</b>'; };
  if(m.length<2){
    const t='Faites '+val(0);
    return (actif===0?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t)+' · cible <b class="num">'+cible+'</b>';
  }
  const cote=s=>{
    const t=rhythmSide(s)+' '+val(s);
    return actif===s?'<span style="color:var(--accent);font-weight:700">'+t+'</span>':t;
  };
  return cote(0)+' · '+cote(1)+' · cible <b class="num">'+cible+'</b> par côté';
}
function cadStart(st){
  const ct=cadInit(st), sp=cadSpec(st), n=prepSec(), now=rhythmNow();
  /* base : les repetitions deja comptees sur ce cote, non nulles seulement sur
     une reprise. La cadence repart d elles, et l aigu ne sonne que si la cible
     n est pas deja atteinte. */
  ct.base=(sp.reprise&&st.sides[st.side]!=null)?st.sides[st.side]:0;
  st.sides[st.side]=null;
  ct.on=true; ct.start=now; ct.ticked=0; ct.t0=now+n+.15+sp.etab; ct.sched=0;
  st.done=false; st.val=0;
  const ctx=sndOn()?audioCtx():null;
  ct.off=ctx?(ctx.currentTime-now):null;
  if(ctx&&ctx.state==='suspended'&&ctx.resume){ try{ ctx.resume(); }catch(e){} }
  const zero=ct.t0-sp.etab;
  if(ct.off!=null){
    for(let k=n;k>=1;k--) RHYTHM_PREP_OFF.forEach(d=>tone(RHYTHM_CLOSE,zero-k+d+ct.off,.1));
    if(sp.etab>0) RHYTHM_PREP_OFF.forEach(d=>tone(CAD_GO,zero+d+ct.off,.16));
  }
  clearInterval(timers.c);
  timers.c=setInterval(cadLoop,RHYTHM_TICK);
  renderSession();
  cadLoop();
}
function cadLoop(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.ct||!st.ct.on){ if(timers.c){ clearInterval(timers.c); timers.c=null; } return; }
  const ct=st.ct, sp=cadSpec(st), now=rhythmNow();
  const sec=Math.floor(now-ct.start); while(ct.ticked<sec){ tick(); ct.ticked++; }
  if(ct.off!=null){
    let garde=0;
    while(ct.t0+ct.sched*sp.cycle<now+RHYTHM_AHEAD&&garde++<50){
      /* la montee i ouvre la repetition base+i+1 : l aigu sur celle qui vaut
         la cible, a la place de son 950 */
      const i=ct.sched, t=ct.t0+i*sp.cycle+ct.off, cible=(ct.base||0)+i+1===sp.cible;
      tone(cible?RHYTHM_CIBLE:RHYTHM_OPEN,t,cible?.22:.12);
      tone(RHYTHM_CLOSE,t+sp.monte+sp.tenue,.12);
      ct.sched++;
    }
  }
  cadPaint(st,sp,now-ct.t0);
}
function cadPaint(st,sp,e){
  const lbl=$('#phlabel'), cc=$('#cc'), ph=$('#phase'), cnt=$('#rcount'), aide=$('#aide');
  if(!cc) return;
  const E=DB[st.id], base=(st.ct&&st.ct.base)||0, cote=sp.n>1?rhythmSide(st.side):'';
  cc.className='chrono num';
  if(e<-sp.etab){
    if(lbl) lbl.textContent='En position'+(cote?' · '+cote:'');
    cc.textContent=String(Math.max(1,Math.min(prepSec()||1,Math.ceil(-e-sp.etab))));
    if(ph) ph.innerHTML='';
    if(aide) aide.textContent=cadPose(E,st.side);
    if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base||null);
    return;
  }
  if(lbl) lbl.textContent=cote||'En cours';
  if(e<0){
    cc.textContent='0';
    if(ph) ph.innerHTML='<span class="tag ok">Établis la ligne</span>';
    if(aide) aide.textContent='Bassin décollé, jambes serrées. La première montée vient au bip aigu.';
    if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base);
    return;
  }
  const n=cadClosed(sp,e), t=e-n*sp.cycle;
  cc.textContent=String(base+n+1);
  const tag=t<sp.monte?'<span class="tag">Monte</span>'
    :t<sp.monte+sp.tenue?'<span class="tag ok">Tiens</span>'
    :'<span class="tag pause">Descends</span>';
  if(ph) ph.innerHTML=tag;
  if(aide) aide.textContent=sp.reprise?'Le Stop arrête ce côté ; la répétition en cours ne compte pas, tu pourras reprendre.'
    :'Le Stop fige ce côté ; la répétition en cours ne compte pas.';
  if(cnt) cnt.innerHTML=cadCountsHtml(st.sides,sp.cible,st.side,base+n);
}
function cadStop(st){
  const ct=st.ct; if(!ct||!ct.on) return;
  const n=cadClosed(cadSpec(st),rhythmNow()-ct.t0)+(ct.base||0);
  st.sides[st.side]=n; st.val=n; st.done=true;
  ct.on=false; ct.t0=null; ct.base=0;
  clearInterval(timers.c); timers.c=null;
  toneCancel();
  renderSession();
}
function toggleCadence(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].cadence) return;
  const ct=cadInit(st);
  if(ct.on){ cadStop(st); return; }
  if(st.done){ if(st.side>=st.sides.length-1) return; st.side++; st.done=false; }
  cadStart(st);
}
/* Reprise (v2.22), sur le seul exercice qui la declare : le cote arrete
   repart de son compte, decompte rejoue, comme le bird-dog. Jamais sur un cote
   deja quitte : Second côté ferme le premier. */
function resumeCad(){
  const st=cur&&cur.steps&&cur.steps[cur.i]; if(!st||!DB[st.id]||!DB[st.id].cadence) return;
  const ct=cadInit(st);
  if(ct.on||!st.done||!DB[st.id].cadence.reprise||st.sides[st.side]==null) return;
  st.done=false;
  cadStart(st);
}
function trimCad(i){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||(st.ct&&st.ct.on)) return;
  if(st.sides[i]==null||st.sides[i]<=0) return;
  st.sides[i]--;
  if(i===st.side) st.val=st.sides[i];
  renderSession();
}
function resetCad(){
  const st=cur&&cur.steps&&cur.steps[cur.i];
  if(!st||!st.sides||(st.ct&&st.ct.on)||!st.done) return;
  st.sides[st.side]=null; st.val=0; st.done=false;
  renderSession();
}
/* Etirements bilateraux : deux blocs enchaines plutot qu un seul, sur le motif
   du module cardio. Le chrono affiche le temps du cote en cours, un bip grave
   annonce la bascule, un bip aigu la fin. Le premier bloc est arrondi au
   superieur pour que la somme fasse exactement la duree de base, quelle que
   soit sa parite. Les etirements non bilateraux gardent un bloc unique. */
function stretchPhases(e){
  const d=e.dur||45;
  if(!e.bilat) return [d];
  const a=Math.ceil(d/2);
  return [a,d-a];
}
function stretchSideLabel(i){ return i?'Second côté':'Premier côté'; }
function setStretchLbl(st,v){ st.lbl=v; const b=$('#ct'); if(b) b.textContent=v; }
function toggleStretch(){
  const st=cur.steps[cur.i], e=DB[st.id], ph=stretchPhases(e);
  if(timers.c){clearInterval(timers.c);timers.c=null;delete st.prepLeft;setStretchLbl(st,'Reprendre');const el=$('#cc');if(el)el.textContent=fmtT(st.val||0);return;}
  /* chrono expire : on repart du premier cote pour la duree pleine */
  if(!st.val||st.val<=0){
    if(st.side>=ph.length-1){ st.side=0; const l=$('#phlabel'); if(l&&e.bilat) l.textContent=stretchSideLabel(0); }
    st.val=ph[st.side];
  }
  startPrep('Pause',()=>{
    setStretchLbl(st,'Pause');
    const el=$('#cc'); if(el) el.textContent=fmtT(st.val);
    timers.c=setInterval(()=>{
      tick(); st.val--;
      const e2=$('#cc'); if(!e2){clearInterval(timers.c);return;}
      e2.textContent=fmtT(st.val);
      if(st.val<=0&&st.side<ph.length-1){
        st.side++; st.val=ph[st.side];
        beep(700,.2);
        const l=$('#phlabel'); if(l) l.textContent=stretchSideLabel(st.side);
        e2.textContent=fmtT(st.val);
      }
      else if(st.val<=0){clearInterval(timers.c);timers.c=null;beep(880,.22);setStretchLbl(st,'Recommencer');}
    },1000);
  });
}

/* --- repos --- */
/* L exercice suivant etait annonce en texte seul. La vignette dit en un coup
   d oeil ce que la phrase demande de lire, et c est deja le role qu elle tient
   dans le detail de seance et dans la bibliotheque, avec la meme empreinte de
   74 par 52 (v2.2). Elle est inerte : un lien vers la fiche ferait quitter la
   seance depuis un ecran dont le chrono continue de tourner.
   Elle ne porte ni cible ni charge. L ecran de repos annonce ce qui vient,
   l ecran de serie prescrit, et il arrive quinze secondes plus tard ; deux
   ecrans qui prescrivent la meme chose finiraient par diverger.
   Elle porte en revanche les series deja faites aujourd hui sur cet exercice
   (v2.6). Ce sont une annonce et non une prescription, donc du bon cote de la
   ligne tracee ici meme, et rien ne s y recalcule : le journal est un fait.
   La cle lue est nextKey et jamais l identifiant, car des qu un repli douleur
   est en cours le journal s ecrit sous « origine>repli » ; lire l identifiant
   afficherait les series de l exercice d origine sous la vignette du repli.
   Rien avant le premier passage du jour : la derniere fois est un contexte
   d une autre nature, elle reste sur l ecran de serie. Meme vocabulaire que
   la pastille de cet ecran, jusqu au libelle et au formateur de liste. */
function nextExoHtml(id,key){
  const e=id?DB[id]:null;
  if(!e) return '';
  const jour=(key&&cur&&cur.log&&cur.log[key])||null;
  return '<div class="nextexo">'+
    (typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>')+
    '<span class="ex"><span class="muted small">Ensuite</span><b>'+esc(e.nom)+'</b>'+
    '<span class="muted small">'+esc(e.mus)+'</span></span>'+
    ((jour&&jour.length)?'<span class="jour"><b class="num">'+setsHtml(jour)+'</b><span>Aujourd\'hui</span></span>':'')+
    '</div>';
}
/* Temps ecoule depuis le lancement de la seance (v2.9). Recalcule depuis
   cur.t0 a chaque lecture, et jamais incremente : setInterval est etrangle
   quand l ecran du telephone s eteint, et un compteur incremente mentirait
   apres une poche. C est aussi l ancre de « real » dans l historique, donc les
   deux nombres ne peuvent pas s ecarter d une seconde. */
function sessionElapsed(){ return (cur&&cur.t0)?Math.max(0,Math.floor((Date.now()-cur.t0)/1000)):null; }
/* Heure et temps ecoule, dans cet ordre. Le h et le min font l etiquette :
   deux nombres nus se seraient confondus. */
function sessionTime(){ const s=sessionElapsed(); return s==null?'':fmtHM()+' · '+fmtEcoule(s); }
/* La ligne du tag n existait qu au singulier. Elle ne passe en spread que
   lorsqu elle a deux occupants : sans t0, un spread a un seul element chasserait
   le tag a gauche alors que la card le centre. */
/* v2.10 : le tag se lit sur le drapeau de l etape et non plus sur sa duree.
   L heuristique sec<=20 appelait « Repos » une transition reglee a 30 s, et
   elle aurait appele « Repos » la pause de raccord : deux choses differentes
   sous un meme mot, faute d un fait a lire. Il y en a un maintenant. */
function restTagHtml(st){
  const tag='<span class="tag'+(st.pause?' pause':'')+'">'+(st.pause?'Pause de tour':'Transition')+'</span>';
  const t=sessionTime();
  return t?'<div class="spread">'+tag+'<span class="tline num" id="tl">'+t+'</span></div>':tag;
}
/* v2.18 : le texte date de la pause inconditionnelle de la v2.10. Il disait le
   raccord « seule adjacence ou l alternance ne repose rien », et une minute
   « ce qu il faut » : le carnet a retire les deux affirmations en v2.11, la
   duree etant un choix de cout et non un seuil. La pause etant desormais posee
   sur des paires constatees, le texte le dit, sans chiffrer un besoin.
   Le pourquoi de la pause, replie. Il se lit avant d appuyer sur Passer et non
   apres : une confirmation en deux temps est exclue, il n y a plus aucun
   dialogue nulle part, et l outil ne peut pas observer si l epaule a recupere.
   L ouverture passe par cardOpen, donc elle survit a un changement de volume
   pendant la pause. */
function pauseWhyHtml(){
  return '<div class="pausemsg"><b>Le tour recommence.</b></div>'+
    '<details class="msec plat" data-k="rest-why"'+cardOpen('rest-why',false)+'>'+
    '<summary>Pourquoi cette pause est plus longue</summary>'+
    '<div class="mdet muted small">Le circuit boucle : le dernier exercice d\'un tour précède le premier du tour suivant. '+
    'Tu as signalé une gêne d\'épaule sur cet enchaînement, et la pause est posée sur lui seul. '+
    'Sans elle, la première série du tour suivant se fait sur une épaule déjà fatiguée, et la comparaison qui décide des montées de charge se fait entre deux états différents. '+
    'Passer reste possible, le chrono n\'est pas un ordre.</div></details>';
}
/* Sur une transition, partir tot est normal et le bouton est l action
   principale. Sur une pause, partir tot la defait : l ecran n a plus d action
   principale, ce qui est exactement ce qu il prescrit. Le bouton reste, au
   meme endroit et sous le meme nom, degrade en secondaire. */
function restHtml(st){
  const n=st.next?DB[st.next]:null;
  return '<div class="card center'+(st.pause?' pausecard':'')+'">'+
    restTagHtml(st)+
    '<div class="chrono rest num'+(st.pause?' pause':'')+'" id="rt">'+fmtT(st.sec)+'</div>'+
    (st.pause?pauseWhyHtml():'')+
    (n?nextExoHtml(st.next,st.nextKey):'')+
    '<button class="'+(st.pause?'quiet':'big')+' mt" style="width:100%" onclick="nextStep()">Passer au suivant</button>'+
    '<div class="mt"></div><button class="quiet" style="width:100%" onclick="addRest(15)">+15 s</button>'+
    volSegHtml()+
    backLine()+
    kbHint()+
  '</div>';
}
function startRest(st){
  clearInterval(timers.r);
  if(st.left==null) st.left=st.sec;
  timers.r=setInterval(()=>{
    tick(); st.left--;
    const el=$('#rt'); if(!el){clearInterval(timers.r);return;}
    el.textContent=fmtT(st.left);
    const tl=$('#tl'); if(tl) tl.textContent=sessionTime();
    if(st.left<=0){clearInterval(timers.r);beep(950,.2);nextStep();}
  },1000);
}
function addRest(s){const st=cur.steps[cur.i];st.left=(st.left||st.sec)+s;const el=$('#rt');if(el)el.textContent=fmtT(st.left);}

/* --- module cardio --- */
function cardioHtml(st){
  const e=DB[st.id];
  return '<div class="card center">'+
    '<span class="tag flame">Module cardio</span>'+
    '<h3 style="margin-top:10px">'+esc(e.nom)+'</h3>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    '<div class="mt">'+figFor(st.id,e.fig,e.nom)+'</div>'+
    '<div class="center"><span class="tag" id="phlabel"></span></div>'+
    '<div class="chrono num" id="cc">--</div>'+
    '<div class="center muted small num" id="rnd"></div>'+
    '<button class="big" id="ct" onclick="toggleCardio()">Démarrer</button>'+
    '<div class="mt"></div><button class="big ok" onclick="validateCardio()">Terminer</button>'+
    ((!st.swapped&&fbOf(st.id))?'<button class="danger big mt" onclick="swapCardio()">Douleur aujourd\'hui → variante de repli</button>':'')+
    (st.swapped?'<div class="tag flame mt">Variante de repli</div>':'')+
    revertLine(st)+
    backLine()+
    '<div class="vig">⚠ '+e.vig+'</div>'+kbHint()+
  '</div>';
}
function initCardio(st){
  const e=DB[st.id];
  st.rounds=0;st.ph=0;st.pt=e.phases[0].s;st.elapsed=0;
  const L=$('#phlabel'),C=$('#cc'),R=$('#rnd');
  if(L)L.textContent=e.phases[0].l; if(C)C.textContent=fmtT(st.pt); if(R)R.textContent='Round 1';
}
function toggleCardio(){
  const st=cur.steps[cur.i], e=DB[st.id];
  if(timers.c){clearInterval(timers.c);timers.c=null;$('#ct').textContent='Reprendre';return;}
  $('#ct').textContent='Pause';
  timers.c=setInterval(()=>{
    tick(); st.pt--; st.elapsed++;
    const C=$('#cc'); if(!C){clearInterval(timers.c);return;}
    if(st.pt<=0){
      beep(st.ph===e.phases.length-1?1200:700,.2);
      st.ph++;
      if(st.ph>=e.phases.length){st.ph=0;st.rounds++;}
      st.pt=e.phases[st.ph].s;
      $('#phlabel').textContent=e.phases[st.ph].l;
      $('#rnd').textContent='Round '+(st.rounds+1);
    }
    C.textContent=fmtT(st.pt);
    if(st.elapsed>=CARDIO_SEC){clearInterval(timers.c);timers.c=null;beep(1200,.25);validateCardio();}
  },1000);
}
function validateCardio(){
  const st=cur.steps[cur.i];
  clearInterval(timers.c);timers.c=null;
  const key=st.swapped?(st.from+'>'+st.id):st.id;
  (cur.log[key]=cur.log[key]||[]).push(st.rounds||0);
  cur.xp+=XP_SET;
  nextStep();
}
function nextStep(){
  clearTimers();
  cur.i++;
  if(cur.i>=cur.steps.length){ if(!cur.ending){cur.ending=true;endSession();} }
  else renderSession();
}

```
## `app7.js`

Fin de séance, journal, progression par exercice sur les fiches, fiches, statistiques.

1362 lignes, 88307 octets.

```javascript
/* ============ FIN DE SEANCE ============ */
/* une cle de journal est soit un identifiant d exercice, soit « origine>repli » */
function splitKey(k){ const i=k.indexOf('>'); return i<0?{id:k,from:null}:{id:k.slice(i+1),from:k.slice(0,i)}; }
async function endSession(inc){
  rhythmAbort(); clearTimers();
  const msgs=[];
  /* v1.15 : la liste des cles debloquees, pas leur nombre. La correction de la
     derniere seance peut retirer un deblocage, un compteur croissant ne sait
     pas le voir : un echange d un deblocage contre un autre laissait le compte
     inchange et le nouveau n etait jamais fete. Aligne sur le chemin badges,
     deja identitaire. */
  const unlockedBefore=Object.keys(state.unlocked).slice(), badgesBefore=state.badges.slice(), lvlBefore=lvlInfo(state.xp).lvl;
  /* series prevues par exercice : une lecture n est exploitable que si l exercice
     a ete mene a son terme, sans serie sautee et sans repli douleur */
  const prevu={};
  cur.steps.forEach(s=>{ if(s.k==='set'&&!s.cool) prevu[s.from||s.id]=(prevu[s.from||s.id]||0)+1; });
  /* photographie des charges et bandes reellement utilisees, avant que la progression ne les fasse evoluer */
  const pre={}, keys=Object.keys(cur.log);
  /* sets et lightSets s ajoutent en v1.16 : le recapitulatif compare les valeurs
     du jour a celles du passage precedent, et applyProgress ecrase p.sets juste
     apres. La marque d allege est indispensable, une comparaison a un passage
     dont les cibles etaient reduites de 30 % mentirait sans le dire. */
  keys.forEach(k=>{ const id=splitKey(k).id, p=state.perf[id]||{}; pre[k]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,target:p.target,range:p.range?p.range.slice():null,hold:!!p.hold,sets:(p.sets||[]).slice(),lightSets:!!p.lightSets}; });
  /* Instantané de correction (v1.15). Le motif « photographier avant,
     restaurer depuis le récapitulatif » existait déjà pour défaire une montée
     seule (holdClimb) : ici il couvre la séance entière. On ne peut pas
     reconstituer après coup ce que cur porte encore, cur.steps et cur.log
     disparaissant avec le récapitulatif : full par clé et volume de séance
     sont donc mémorisés, pas recalculés. Portée : valeurs de séries
     uniquement, donc XP, badges, rotation, couverture et jours actifs sont
     invariants et n'entrent pas dans l'instantané. */
  const undo={keys:keys.slice(),full:{},prevu:JSON.parse(JSON.stringify(prevu)),
              light:!!cur.light,rounds:cur.rounds,perf:{},badges:state.badges.slice(),
              div:JSON.parse(JSON.stringify(state.div||{push:0,pull:0})),
              loadUps:state.loadUps||0,
              unlocked:JSON.parse(JSON.stringify(state.unlocked||{}))};
  keys.forEach(k=>{ const id=splitKey(k).id; undo.perf[id]=JSON.parse(JSON.stringify(state.perf[id]||{})); });
  const climbs=[];
  keys.forEach(k=>{
    const {id,from}=splitKey(k);
    const full=!inc&&!from&&cur.log[k].length>=(prevu[id]||0);
    undo.full[k]=full;
    /* la qualification se releve AVANT l ecriture, et se range dans
       l instantane d annulation : rejouer doit rejouer le meme regime */
    const nq=nonQualifie(id);
    undo.unqual=undo.unqual||{}; undo.unqual[k]=nq;
    const m=applyProgress(id,cur.log[k],full,!!cur.light,nq);
    m.forEach(x=>msgs.push(x));
    const p=state.perf[id];
    const monte=estMontee(p,pre[k],DB[id]);
    if(monte) climbs.push({id:id,msg:m[0],prev:pre[k]});
  });
  const items=keys.map(k=>{
    const {id,from}=splitKey(k);
    const it={id:id,sets:cur.log[k],load:pre[k].load};
    if(DB[id]&&DB[id].bnd&&pre[k].band) it.band=pre[k].band;
    /* v2.4 : la fourchette n est pas rejouable a posteriori, elle s ecrit ici.
       Les autres modes ont deja load ou band, rien a doubler. */
    if(DB[id]&&!DB[id].bnd&&(DB[id].mode==='bw'||DB[id].mode==='time')&&pre[k].range) it.rng=pre[k].range.slice();
    /* v2.17 : la tenue sous laquelle les series ont ete jouees, ecrite avant
       progression comme it.load, depuis l instantane d avant seance. */
    if(DB[id]&&DB[id].rhythm) it.tenue=tenueOf(id,pre[k]);
    /* v2.18 : l assise sous laquelle les series ont ete jouees, meme regle. */
    if(DB[id]&&DB[id].assise) it.assise=assiseOf(id,pre[k]);
    /* v2.12, journal enrichi. Deux champs de plus, pour la meme raison que
       it.rng : ce qui n est pas rejouable s ecrit au moment ou il est vrai.
       it.tgt, la cible visee ce jour-la. Elle n etait nulle part : l historique
       portait les series faites sans le nombre qu elles visaient, si bien qu on
       ne pouvait pas dire d une cible qu elle n a pas bouge depuis n passages.
       Un rejeu a posteriori divergerait, la montee dependant de full, de la
       grace et du palier tenu, dont aucun n est historise.
       it.secs, la duree de chaque serie en secondes, de l arrivee sur l ecran a
       la validation. Brute : ni plancher, ni ecretage, ni nettoyage. Une serie
       de huit secondes est une information, pas un artefact, et nettoyer a
       l ecriture enfouirait un jugement dans la donnee.
       Aucun signal ne les lit aujourd hui : ils s accumulent, ce qu on en fera
       se decidera sur des donnees et non sur une intention. */
    if(pre[k].target!=null) it.tgt=pre[k].target;
    if(cur.secs&&cur.secs[k]) it.secs=cur.secs[k].slice();
    if(from){ it.sw=true; it.from=from; }
    return it;
  });
  /* seance complete = toutes les series prevues validees. Le module cardio ne
     comble plus une serie sautee : il n est pas une serie. */
  const complete=!inc&&(cur.done||0)>=workSteps(cur.steps).length;
  let xp=cur.xp+(complete?XP_SESSION:0);
  const wkNow=prevWeekKey(0), goalNow=goalForWeek(state,wkNow);
  const wasValid=thisWeekCount(state)>=goalNow;
  /* rounds porte le nombre de tours REALISE, roundsPlan celui annonce au
     lancement. Les deux divergent depuis que le volume se change en cours de
     seance (v2.1), et c est cet ecart qui est informatif : l un dit ce qui a
     ete fait, l autre ce qui avait ete vise. cur.rounds0 existait deja, il
     bornait le selecteur de volume ; il n y avait qu a l ecrire. */
  const entry={date:new Date().toISOString(),type:'alterne',mode:'alterne',rounds:cur.rounds,roundsPlan:cur.rounds0!=null?cur.rounds0:cur.rounds,plan:cur.plan,items:items,xp:xp,
               planSec:cur.planSec!=null?Math.round(cur.planSec):null,
               model:cur.model!=null?Math.round(cur.model):null,
               real:cur.t0?Math.max(60,Math.round((Date.now()-cur.t0)/1000)):null};
  if(inc) entry.inc=true;
  /* marque de seance allegee : elle sert au recapitulatif, a l historique, et
     surtout a exclure ces replis volontaires du capteur de douleur */
  if(cur.light) entry.light=true;
  state.hist.push(entry);
  undo.date=entry.date; state.undo=undo;   /* purgé au démarrage de la séance suivante */
  const weekJust=!wasValid&&thisWeekCount(state)>=goalForWeek(state,wkNow);
  if(weekJust) xp+=XP_WEEK;
  state.xp+=xp;
  state.sessionCount++;
  if(!inc){
    /* Rotation (v1.13). La regle v1.9 gelait toute la rotation des qu une
       seance etait allegee. Elle est trop large : la couverture musculaire
       compte deja pleinement les series d une seance allegee, les compter
       pour rien dans la rotation contredit la mesure de l outil. La ligne
       juste se lit exercice par exercice : la rotation avance la ou l exercice
       prevu a effectivement travaille, elle gele la ou il a ete remplace par
       un repli, car celui-la n a rien enregistre. Le gel suit la substitution,
       pas le mode. Sur le vivier pousse, dont les trois exercices ont un repli,
       cela reviendrait a un gel permanent en periode douloureuse : des la
       deuxieme seance allegee d affilee, tout avance. Le compteur repart a zero
       des qu une seance normale est terminee ; une seance quittee ne compte
       pas, ce bloc etant deja sous !inc. Les etirements, eux, ont ete faits
       tels quels : leur rotation n a jamais gele. */
    const run=state.lightRun||0, libre=!cur.light||run>=1;
    SLOT_ORDER.forEach(s=>{
      const gele=!libre&&cur.subs&&cur.subs[s];
      if(!gele) state.slotIdx[s]=(state.slotIdx[s]||0)+1;
    });
    state.lightRun=cur.light?run+1:0;
    state.stretchIdx=((state.stretchIdx||0)+STRETCH_PER_SESSION)%STRETCH_POOL.length;
  }
  /* Exercice entierement passe (v1.15). Sans cette ligne, « je n ai pas reussi
     une seule repetition » ne laisse aucune trace : le zero n est plus
     saisissable et un exercice sans serie validee n a pas de cle dans le
     journal, donc applyProgress n est jamais appele pour lui. Signal sans
     action, comme sur les lectures partielles. Le curseur final distingue le
     passe du jamais atteint : un exercice passe a toutes ses etapes derriere
     lui, un exercice d une seance quittee en a au moins une devant. Un
     exercice remplace par son repli est realise, pas non realise. */
  const vus={}; keys.forEach(k=>{ const sk=splitKey(k); vus[sk.id]=1; if(sk.from) vus[sk.from]=1; });
  const derniere={};
  cur.steps.forEach((s,i)=>{ if(s.k==='set'&&!s.cool){ const oid=s.from||s.id; derniere[oid]=Math.max(derniere[oid]==null?-1:derniere[oid],i); } });
  Object.keys(derniere).forEach(oid=>{
    if(vus[oid]||derniere[oid]>=cur.i||!DB[oid]) return;
    msgs.push('Exercice non réalisé : '+DB[oid].nom);
  });
  checkUnlocks(cur.rounds,!!cur.light,prevu).forEach(m=>msgs.push(m));
  checkBadges().forEach(m=>msgs.push(m));
  await save();
  syncFinSeance();   /* v2.24 : envoi immediat, sans regroupement */
  const pop=celebrations(unlockedBefore,badgesBefore,lvlBefore);
  /* items du recapitulatif : meme tableau que l historique, augmente du passage
     precedent. La copie evite de grossir la sauvegarde d une donnee que
     l historique porte deja dans l entree d avant. */
  const vue=items.map((it,i)=>Object.assign({},it,{prev:pre[keys[i]].sets,prevLight:pre[keys[i]].lightSets}));
  cur={recap:true,xp:xp,msgs:msgs,items:vue,type:cur.type,weekJust:weekJust,inc:!!inc,light:!!entry.light,pop:pop,popI:0,climbs:climbs,
       done:cur.done||0,total:workSteps(cur.steps).length,
       planSec:entry.planSec,model:entry.model,real:entry.real};
  lightMode=false;   /* le mode ne survit jamais a une seance */
  clearDay();        /* ni les ajustements de contenu du jour (v1.13) */
  go('recap');
}
/* « Tenir ce palier » au recapitulatif : annule la montee qui vient d etre
   decidee, remet l exercice au niveau ou il etait pendant la seance, et fige.
   Rien n a encore ete travaille au nouveau niveau, il n y a donc rien a perdre. */
function holdClimb(i){
  const c=cur&&cur.climbs&&cur.climbs[i];
  if(!c||c.done) return;
  const p=perfOf(c.id);
  p.load=c.prev.load;
  if(c.prev.band) p.band=c.prev.band;
  if(DB[c.id].rhythm){ if(c.prev.tenue!=null) p.tenue=c.prev.tenue; else delete p.tenue; }
  if(DB[c.id].assise){ if(c.prev.assise!=null) p.assise=c.prev.assise; else delete p.assise; }
  if(c.prev.range) p.range=c.prev.range.slice();
  if(c.prev.target!=null) p.target=c.prev.target;
  /* La montee annulee avait remis la memoire de la fenetre a zero (v2.14). Le
     passage a ete joue au palier que l on restaure, sa lecture y vaut donc :
     elle se relit sur p.sets, que applyProgress vient d ecrire, et non sur
     l instantane, qui porte la lecture d avant. */
  if(p.sets&&p.sets.length) p.prevMin=Math.min.apply(null,p.sets); else delete p.prevMin;
  if(state.loadUps>0&&(DB[c.id].mode==='load'||DB[c.id].mode==='fixed'||DB[c.id].bnd||DB[c.id].rhythm||DB[c.id].assise)) state.loadUps--;
  setHold(c.id,true);
  c.done=true;
  save();
  flash('Palier tenu sur '+DB[c.id].nom);
  renderRecap();
}
/* file d evenements celebres : deblocages, badges, puis passage de rang.
   Fusion : aux niveaux 5 et 10 un badge designe deja le rang, on ne montre
   que le badge pour ne pas feter deux fois le meme evenement. */
function celebrations(unlockedBefore,badgesBefore,lvlBefore){
  const q=[];
  Object.keys(state.unlocked).filter(id=>unlockedBefore.indexOf(id)<0).forEach(id=>{
    if(DB[id]) q.push({ico:'🔓',kind:'Exercice débloqué',nom:DB[id].nom,d:DB[id].mus});
  });
  const nouveaux=state.badges.filter(b=>badgesBefore.indexOf(b)<0)
    .map(id=>BADGES.filter(b=>b.id===id)[0]).filter(Boolean);
  nouveaux.forEach(b=>q.push({ico:b.ico,kind:'Badge obtenu',nom:b.nom,d:b.d}));
  const lvl=lvlInfo(state.xp).lvl, r0=rankLevel(lvlBefore), r1=rankLevel(lvl);
  if(r1>r0&&!nouveaux.some(b=>b.rank===r1)) q.push({ico:'🏅',kind:'Nouveau rang',nom:rankOf(lvl),d:'Niveau '+lvl+' atteint'});
  return q;
}
/* revenir sur un palier tenu par megarde : on relibere, sans restaurer la
   montee annulee. La progression reprendra normalement a la prochaine seance. */
function releaseClimb(i){
  const c=cur&&cur.climbs&&cur.climbs[i];
  if(!c||!c.done) return;
  setHold(c.id,false);
  c.done=false;
  save();
  flash('Progression reprise sur '+DB[c.id].nom);
  renderRecap();
}
function popHtml(){
  if(!cur||!cur.pop||cur.popI>=cur.pop.length) return '';
  const e=cur.pop[cur.popI], n=cur.pop.length;
  return '<div class="pop" onclick="popNext()"><div class="card">'+
    '<span class="ico">'+e.ico+'</span>'+
    '<div class="kind mt">'+esc(e.kind)+'</div>'+
    '<div class="nom">'+esc(e.nom)+'</div>'+
    '<div class="muted small" style="margin-top:6px">'+esc(e.d)+'</div>'+
    (n>1?'<div class="q">'+(cur.popI+1)+' / '+n+'</div>':'')+
    (n>3?'<button class="quiet mt" style="padding:6px 14px;font-size:.8rem" onclick="event.stopPropagation();popSkip()">Tout passer</button>':'')+
  '</div></div>';
}
function popNext(){
  if(!cur||!cur.pop) return;
  clearTimeout(timers.pop);
  cur.popI++;
  renderRecap();
}
function popSkip(){ if(!cur||!cur.pop) return; clearTimeout(timers.pop); cur.popI=cur.pop.length; renderRecap(); }
/* Une descente changeait la charge, la bande ou la fourchette comme une montee :
   le recapitulatif proposait donc « Tenir ce palier » sur un repli du filet, et
   l accepter restaurait la charge d avant descente, annulant le filet, tout en
   decrementant loadUps sans qu aucune montee ait eu lieu. Le sens compte, pas le
   changement. Le cliquet leve de la v1.15 a elargi le probleme a la fourchette. */
function estMontee(p,pre,e){
  if(!pre) return false;
  if((p.load||0)>(pre.load||0)) return true;
  if(p.band!==pre.band&&e&&e.bnd){
    const L=bandLadder(e,state.gear), a=L.indexOf(pre.band), b=L.indexOf(p.band);
    if(a>=0&&b>a) return true;
  }
  /* Echelle de tenues (v2.17) : le sens se lit sur la tenue, jamais sur la
     fourchette, qui descend a une montee et remonte a une descente. */
  /* v2.18 : meme lecture sur l echelle d assise, ou monter fait baisser la
     valeur. L indice seul porte le sens. */
  const rs=rungSpec(e);
  if(rs) return rungOf(e,p[rs.k]).i>rungOf(e,pre[rs.k]).i;
  if(pre.range&&p.range&&p.range[1]>pre.range[1]) return true;
  return false;
}
/* ============ CORRECTION DE LA DERNIERE SEANCE ============ */
/* On corrige apres, parce qu on ne peut pas corriger pendant. Portee : valeurs
   de series uniquement, ni ajout ni suppression, donc le nombre de series est
   invariant et les XP, badges de seance, rotation et couverture ne bougent
   pas. La correction restaure l instantane pris avant la progression puis
   rejoue : rien n est defait champ par champ, ce qui evite d oublier une
   dependance. L instantane n est pas repris apres coup, la correction reste
   donc corrigeable autant de fois que voulu, toujours depuis le meme point. */
function corrigible(){
  const u=state.undo, h=state.hist[state.hist.length-1];
  return !!(u&&h&&u.date===h.date);
}
function corrigerSeance(vals){
  if(!corrigible()) return null;
  const u=state.undo, h=state.hist[state.hist.length-1];
  /* v2.12. Deux releves pris AVANT la restauration, donc sur l etat tel qu il
     est au moment ou l on corrige, seance et gestes manuels compris.
     avantCor sert a dire ce que la correction defait : un niveau qui recule
     n est annonce nulle part aujourd hui, seuls les messages recalcules
     s affichent, et une annulation muette est pire qu une annulation.
     holdApres sert a ne pas detruire ce qui n est pas une consequence de la
     seance : un palier tenu pose ou libere apres coup, depuis le recapitulatif,
     la fiche ou le mode entretien, est une decision de l utilisateur. La
     restauration l effacait sans un mot. Il se repose APRES le rejeu, jamais
     avant : la seance s est bien jouee sous l etat d avant. */
  const avantCor={}, holdApres={};
  Object.keys(u.perf).forEach(id=>{
    const p=state.perf[id]; if(!p) return;
    avantCor[id]={load:p.load||0,band:p.band||null,tenue:p.tenue,assise:p.assise,range:p.range?p.range.slice():null,target:p.target};
    const av=!!(u.perf[id]&&u.perf[id].hold), ap=!!p.hold;
    if(av!==ap) holdApres[id]={v:ap,at:p.holdAt||null};
  });
  const avantUnlCor=Object.keys(state.unlocked||{});
  /* 1. restauration de l etat d avant seance */
  Object.keys(u.perf).forEach(id=>{ state.perf[id]=JSON.parse(JSON.stringify(u.perf[id])); });
  state.div=JSON.parse(JSON.stringify(u.div));
  state.loadUps=u.loadUps;
  /* loadUps et unlocked sont restaures, or ce sont exactement ce que testent les
     badges load, load5 et unlock1 : sans eux, Progres affichait « 0 montees de
     charge » a cote du badge qui les celebre. */
  if(u.badges) state.badges=u.badges.slice();
  const avantUnl=Object.keys(state.unlocked).slice();
  const avantBadges=state.badges.slice(), avantLvl=lvlInfo(state.xp).lvl;
  state.unlocked=JSON.parse(JSON.stringify(u.unlocked));
  /* 2. ecriture des valeurs corrigees dans l historique */
  u.keys.forEach((k,i)=>{
    const v=vals&&vals[k];
    if(!v||!h.items[i]) return;
    if(v.length!==h.items[i].sets.length) return;      /* ni ajout ni suppression */
    if(v.some(x=>!(x>=1)||x!==Math.round(x))) return;  /* entiers superieurs a zero */
    h.items[i].sets=v.slice();
  });
  /* 3. rejeu, avec le volume et le mode de la seance corrigee */
  const msgs=[], climbs=[];
  u.keys.forEach((k,i)=>{
    const id=splitKey(k).id, it=h.items[i];
    if(!it) return;
    const p0=state.perf[id]||{};
    const pre={load:p0.load||0,band:p0.band||null,tenue:p0.tenue,assise:p0.assise,target:p0.target,range:p0.range?p0.range.slice():null,hold:!!p0.hold};
    const m=applyProgress(id,it.sets,u.full[k],u.light,u.unqual&&u.unqual[k]);
    m.forEach(x=>msgs.push(x));
    const p=state.perf[id];
    const monte=estMontee(p,pre,DB[id]);
    if(monte) climbs.push({id:id,msg:m[0],prev:pre});
  });
  /* les gestes manuels posterieurs a la seance reviennent ici, entre le rejeu
     et les verrous : un palier tenu repose fige de nouveau la cible, et
     checkUnlocks doit voir l etat definitif et non un etat intermediaire */
  Object.keys(holdApres).forEach(id=>{
    const p=state.perf[id]; if(!p) return;
    if(holdApres[id].v){ p.hold=true; p.holdAt=holdApres[id].at||new Date().toISOString(); }
    else { delete p.hold; delete p.holdAt; }
  });
  checkUnlocks(u.rounds,u.light,u.prevu).forEach(m=>msgs.push(m));
  checkBadges().forEach(m=>msgs.push(m));
  /* Ce que la correction defait, dit a part. Un message d annulation melange a
     des messages de progression se lit comme une progression : le recapitulatif
     et l onglet Progres le portent donc dans un bloc a eux. estMontee compare
     l etat d avant correction a celui d apres, dans ce sens : vrai signifie que
     le niveau etait plus haut avant, donc que la correction l a ramene. */
  const undone=[];
  Object.keys(avantCor).forEach(id=>{
    const p=state.perf[id], e=DB[id];
    if(!p||!e) return;
    if(estMontee(avantCor[id],p,e)) undone.push('Montée annulée sur '+e.nom);
  });
  avantUnlCor.forEach(id=>{ if(!state.unlocked[id]&&DB[id]) undone.push('Déblocage annulé : '+DB[id].nom); });
  const pop=celebrations(avantUnl,avantBadges,avantLvl);
  cur={recap:true,xp:h.xp,msgs:msgs,items:h.items,type:h.type,weekJust:false,inc:!!h.inc,light:!!h.light,
       pop:pop,popI:0,climbs:climbs,corrige:true,undone:undone};
  save(); return cur;
}
/* Ecran de correction : les series de la derniere seance en steppers, le meme
   geste qu en seance. Zero refuse, comme a la saisie. */
let fixVals=null, fixFrom='recap', fixNote=null;
function openFix(from){
  if(!corrigible()) return;
  const h=state.hist[state.hist.length-1];
  fixFrom=from||'recap';
  fixVals={}; state.undo.keys.forEach((k,i)=>{ if(h.items[i]) fixVals[k]=h.items[i].sets.slice(); });
  go('fix');
}
function fixBump(ki,si,d){
  const k=state.undo.keys[ki];
  fixVals[k][si]=Math.max(0,(fixVals[k][si]||0)+d);
  renderFix();
}
function fixClose(){ fixVals=null; if(fixFrom==='prog'){ cur=null; go('prog'); } else go('recap'); }
function fixApply(){
  if(Object.keys(fixVals).some(k=>fixVals[k].some(v=>!(v>=1)))) return;
  const r=corrigerSeance(fixVals);
  fixVals=null;
  if(fixFrom==='prog'){
    /* on revient d ou l on vient : la correction depuis l historique ne doit
       pas rejeter sur un recapitulatif dont on n avait pas le fil. Les
       messages de progression recalcules seraient perdus, ils sont donc
       repris une fois en tete de l onglet. */
    fixNote={msgs:(r&&r.msgs)?r.msgs.slice():[],undone:(r&&r.undone)?r.undone.slice():[]};
    cur=null; go('prog');
  } else go('recap');
}
function renderFix(){
  screenEnter('fix');
  const h=state.hist[state.hist.length-1], u=state.undo;
  const invalide=Object.keys(fixVals||{}).some(k=>fixVals[k].some(v=>!(v>=1)));
  $('#app').innerHTML='<div class="card">'+
    '<h2>Corriger la séance</h2>'+
    '<div class="muted small">'+fmtDT(h.date)+'</div>'+
    '<div class="muted small mt">Seules les valeurs se corrigent : on ne peut ni ajouter ni retirer une série. La progression, les paliers et les déblocages sont recalculés à partir de l\'état d\'avant séance.</div>'+
    u.keys.map((k,ki)=>{
      const it=h.items[ki]; if(!it) return '';
      const e=DB[it.id], vals=fixVals[k]||[], un=unitOf(e);
      return '<div class="mt"><div class="spread"><b>'+esc(e.nom)+'</b>'+
        (it.band?'<span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>'
                :(it.load?'<span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+'</div>'+
        vals.map((v,si)=>{
          const orig=it.sets[si], chg=(v!==orig);
          return '<div class="histline"><span>Série '+(si+1)+
            (chg?' <span class="muted small">était '+orig+'</span>':'')+'</span>'+
            '<span class="row"><button class="quiet" style="padding:4px 12px" onclick="fixBump('+ki+','+si+',-1)" aria-label="Retirer un">−</button>'+
            '<b class="num"'+(v<1?' style="color:var(--warn)"':(chg?' style="color:var(--accent)"':''))+'>'+v+'</b>'+
            '<span class="muted small">'+esc(un)+'</span>'+
            '<button class="quiet" style="padding:4px 12px" onclick="fixBump('+ki+','+si+',1)" aria-label="Ajouter un">+</button></span></div>';
        }).join('')+'</div>';
    }).join('')+
    (invalide?'<div class="muted small mt">Une série à zéro n\'est pas une série : remonte-la avant de valider.</div>':'')+
    '<button class="big ok mt'+(invalide?' quiet':'')+'"'+(invalide?' disabled':'')+' onclick="fixApply()">Valider la correction</button>'+
    '<button class="clr mt" style="width:100%" onclick="fixClose()">Annuler</button>'+
  '</div>';
  renderNav();
}
function popActive(){ return view==='recap'&&cur&&cur.pop&&cur.popI<cur.pop.length; }
/* Duree et volume au recapitulatif. L ecart au modele n est pas ici : sur une
   seance isolee il contient surtout les interruptions, dont le carnet dit
   depuis la v1.13 qu elles relevent de l utilisateur et non du modele. Un
   nombre bruite avec l allure d une mesure invite a le sur-lire. Il est donc
   dans le detail de la seance et en moyenne dans Progres > Temps. */
function recapTimeHtml(){
  const r=cur.real, a=cur.plan!=null?cur.plan:(cur.planSec!=null?Math.round(cur.planSec/60):null);
  const t=[];
  if(r) t.push('<span class="num">'+Math.round(r/60)+'</span> min'+(a?' pour <span class="num">'+a+'</span> annoncées':''));
  else if(a) t.push('<span class="num">'+a+'</span> min annoncées');
  if(cur.total) t.push('<span class="num">'+cur.done+'</span> série'+(cur.done>1?'s':'')+' sur <span class="num">'+cur.total+'</span>');
  return t.length?'<div class="muted small" style="margin-top:4px">'+t.join(' · ')+'</div>':'';
}
/* Bloc de ce qu une correction defait. Meme texte au recapitulatif et dans
   l onglet Progres, un seul chemin pour ne pas les laisser diverger. */
function undoneHtml(L,align){
  if(!L||!L.length) return '';
  return '<div class="mt" style="text-align:'+(align||'center')+'">'+
    L.map(m=>'<div class="tag flame" style="display:block;margin:6px '+(align==='left'?'0':'auto')+';max-width:fit-content">'+esc(m)+'</div>').join('')+
    '<div class="muted small" style="margin-top:6px">Les valeurs corrigées ne justifient plus ces montées : l\'état repart de celui d\'avant séance. Un palier tenu posé après la séance, lui, est conservé.</div></div>';
}
function renderRecap(){
  screenEnter('recap');
  const li=lvlInfo(state.xp);
  $('#app').innerHTML='<div class="card center">'+
    (cur.inc?'<span class="tag flame">Séance incomplète, enregistrée quand même</span>':'<span class="tag ok">Séance terminée</span>')+
    (cur.light?'<div class="tag flame mt">Séance allégée : elle compte pour la semaine, aucune cible ne bouge</div>':'')+
    '<div class="recap-xp mt">+'+cur.xp+' XP</div>'+
    (cur.weekJust?'<div class="tag flame mt">🎉 Semaine validée : +'+XP_WEEK+' XP inclus</div>':'')+
    '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
    '<div class="muted small" style="margin-top:6px">Niveau '+li.lvl+' · '+rankOf(li.lvl)+'</div>'+
    /* Une duree affichee dit laquelle (v1.11), et le recapitulatif est le seul
       endroit ou la promesse se confronte a chaud. Le volume joue l accompagne :
       le tag « incomplete » disait qu il manquait quelque chose sans dire
       combien, alors que c est ce qui explique une seance courte. */
    recapTimeHtml()+
    (cur.msgs.length?'<div class="mt">'+cur.msgs.map(m=>'<div class="tag ok" style="display:block;margin:6px auto;max-width:fit-content">'+esc(m)+'</div>').join('')+'</div>':'')+
    undoneHtml(cur.undone)+
    ((cur.climbs&&cur.climbs.length)?'<div class="mt" style="text-align:left">'+cur.climbs.map((c,i)=>
      '<div class="spread" style="margin-top:8px"><span class="muted small">'+esc(DB[c.id].nom)+(c.done?' · palier tenu':'')+'</span>'+
      (c.done?'<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="releaseClimb('+i+')">Annuler</button>'
             :'<button class="quiet" style="padding:4px 12px;font-size:.75rem" onclick="holdClimb('+i+')">Tenir ce palier</button>')+'</div>').join('')+
      '<div class="muted small" style="margin-top:6px">Tenir un palier annule la montée et fige le niveau. Tu peux le libérer à tout moment depuis la fiche de l\'exercice.</div></div>':'')+
    '<div class="mt" style="text-align:left">'+cur.items.map(it=>{
      const e=DB[it.id];
      /* le passage precedent sous les valeurs du jour : c est la comparaison
         que le recapitulatif ne donnait pas, alors qu il est le seul ecran ou
         les deux nombres existent au meme instant. Une comparaison a un
         passage allege est annoncee comme telle, ses cibles ayant ete reduites. */
      const cmp=(e.mode!=='stretch'&&it.prev&&it.prev.length)
        ? '<div class="muted small" style="text-align:right;margin-top:-6px;padding-bottom:8px;border-bottom:1px solid var(--line)">avant : '+setsHtml(it.prev)+(it.prevLight?' <span class="tag flame" style="font-size:.68rem">allégée</span>':'')+'</div>'
        : '';
      return '<div class="histline"'+(cmp?' style="border-bottom:none;padding-bottom:2px"':'')+'><span>'+esc(e.nom)+
        (it.sw?' <span class="tag flame" style="font-size:.68rem">repli'+(it.from&&DB[it.from]?' de '+esc(DB[it.from].nom):'')+'</span>':'')+
        (it.band?' <span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>':(it.load?' <span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+'</span><span class="num">'+
        (e.mode==='stretch'?'✓':setsHtml(it.sets)+' '+unitOf(e))+'</span></div>'+cmp;
    }).join('')+'</div>'+
    '<button class="big mt" onclick="cur=null;go(\'home\')">Retour à l\'accueil</button>'+
    /* la correction est une sortie de route, pas le scenario nominal : elle
       reste discrete sous le bouton principal */
    (corrigible()?'<button class="clr mt" style="width:100%" onclick="openFix(\'recap\')">Une valeur est fausse ? Corriger</button>':'')+
  '</div>'+popHtml();
  renderNav();
  if(popActive()){
    beep(1180,.14);
    clearTimeout(timers.pop);
    timers.pop=setTimeout(popNext,2200);
  }
}

/* ============ BIBLIOTHEQUE ============ */
/* comparaison insensible aux accents et a la casse : trois lettres suffisent
   presque toujours sur 36 exercices */
function noAcc(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
let libQ='';
function libFilter(v){ libQ=v||''; renderLib(true); }
function libClear(){
  libQ=''; renderLib();
  const i=$('#libq'); if(i) i.focus();
}
/* v2.15 : trois paliers de lecture par groupe et plus aucun nom tronque.
   Mesure sur l etat reel en 390 px : dix noms coupes par des points de
   suspension, dont « Tractions assisté… » deux fois de suite, supination et
   pronation indiscernables, parce que la colonne de droite portait les series
   ET le niveau (« KB 10 kg + lestes 2 kg », vingt-deux caracteres). Sur un
   ecran qui sert a trouver un exercice (v1.5), le nom est la seule information
   qui ne doit jamais etre coupee : il passe a la ligne, et le niveau descend
   en ligne 2 apres les muscles. Les substituts materiels n etaient pas marques
   dans la liste, contrairement a ce que le carnet affirmait depuis la v2.0 ;
   ils le sont, comme les replis, et ni les uns ni les autres ne portent
   « a faire », qui invitait a faire quelque chose qui ne vient jamais seul. */
function libRowHtml(id){
  const e=DB[id],locked=isLocked(id),p=state.perf[id];
  const repli=estRepli(id), subst=estSubstitut(id), hors=!locked&&(repli||subst);
  const joue=p&&p.sets&&p.sets.length;
  const stat=locked?'':(joue?setsHtml(p.sets):(hors||e.mode==='stretch'?'':'à faire'));
  const lvl=(!locked&&e.bnd&&p&&p.band)?bandLabel(p.band):(!locked&&p&&p.load?loadLabelFor(id,p.load):'');
  const origine=repli?replieDe(id):(subst?substitutDe(id):[]);
  const sub=locked?'↳ '+esc(lockCond(e))
    :(hors?'↳ '+(repli?'repli':'substitut')+' de '+esc(origine.map(x=>DB[x].nom).join(', ')):esc(e.mus)+(lvl?' <span class="lvl">· '+lvl+'</span>':''));
  /* le palier tenu est un statut : il va a droite, sinon il tronque le nom */
  const tag=(p&&p.hold)?'<span class="tag" style="font-size:.68rem">palier tenu</span><br>'
    :(hors?'<span class="tag" style="font-size:.68rem">'+(repli?'repli':'substitut')+'</span>'+(stat?'<br>':''):'');
  return '<div class="exorow'+(locked?' lockedrow':'')+'" onclick="showFiche(\''+id+'\',\'lib\')">'+
    (locked?'<span class="thumbph lockph">🔒</span>'
           :(typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>'))+
    '<span class="ex"><b>'+esc(e.nom)+'</b>'+
    '<span class="muted small">'+sub+'</span></span>'+
    '<span class="num small st">'+tag+stat+'</span></div>';
}
let libQPrev='';
function renderLib(keepFocus){
  screenEnter('lib');
  /* v2.7 : les quatre emplacements sont listes dans l ordre du circuit et leurs
     libelles viennent de SLOTS. Ils etaient recopies ici et une troisieme fois
     dans statsHtml : trois tables a tenir accordees, dont deux figeaient un
     ordre que SLOT_ORDER ne commande plus. Cardio et mobilite ne sont pas des
     emplacements, ils restent en queue. */
  const groups=SLOT_ORDER.map(s=>[s,SLOTS[s].label]).concat([['cardio','Cardio'],['mob','Mobilité']]);
  const q=noAcc(libQ.trim());
  const match=id=>{
    if(!q) return true;
    const e=DB[id];
    return noAcc(e.nom).includes(q)||noAcc(e.en).includes(q)||noAcc(e.mus).includes(q);
  };
  let html='<h2 style="margin-bottom:10px">Exercices</h2>'+
    '<div class="search"><span class="muted">🔎</span>'+
    '<input id="libq" type="text" inputmode="search" placeholder="Rechercher : nom, muscle…" value="'+esc(libQ)+'" oninput="libFilter(this.value)">'+
    (libQ?'<button class="clr" onclick="libClear()" aria-label="Effacer">✕</button>':'')+'</div>';
  let n=0;
  groups.forEach(([cat,label])=>{
    const ids=Object.keys(DB).filter(id=>DB[id].cat===cat&&match(id));
    if(!ids.length) return;
    n+=ids.length;
    /* Trois paliers de lecture (v2.15) : ce qui sort au tirage, ce qui attend
       une douleur ou un materiel manquant, ce qui attend un deblocage. L ordre
       du catalogue est conserve a l interieur de chacun, donc l escalier se lit
       dans le bloc des verrouilles, ferme par defaut et dont la ligne fermee
       porte le compte, sur le motif des cards de reglages. Une recherche
       l ouvre ; quand la recherche s efface, il se referme, sinon une recherche
       laisserait tous les blocs ouverts derriere elle. */
    const rot=ids.filter(id=>!isLocked(id)&&!estRepli(id)&&!estSubstitut(id));
    const hors=ids.filter(id=>!isLocked(id)&&(estRepli(id)||estSubstitut(id)));
    const lock=ids.filter(id=>isLocked(id));
    const k='lib-lock-'+cat;
    const ouvert=q?' open':(libQPrev?'':cardOpen(k,false));
    html+='<div class="card"><h3>'+label+'</h3>'+rot.map(libRowHtml).join('')+
      (hors.length?'<div class="libsub">Hors tirage · douleur ou matériel</div>'+hors.map(libRowHtml).join(''):'')+
      (lock.length?'<details class="libtier" data-k="'+k+'"'+ouvert+'><summary><b>'+lock.length+'</b> '+(lock.length>1?'paliers':'palier')+' à débloquer</summary>'+lock.map(libRowHtml).join('')+'</details>':'')+
      '</div>';
  });
  libQPrev=q;
  if(!n) html+='<div class="card muted small">Aucun exercice ne correspond à « '+esc(libQ)+' ».</div>';
  else if(!q) html+='<div class="muted small center" style="margin-bottom:12px">Toute la banque. Touche un exercice pour sa fiche.</div>';
  $('#app').innerHTML=html; renderNav();
  if(keepFocus){
    const i=$('#libq');
    if(i&&i.focus){ i.focus(); if(i.setSelectionRange) try{ i.setSelectionRange(libQ.length,libQ.length); }catch(x){} }
  }
}
let ficheFrom='lib';
/* ============ PROGRESSION PAR EXERCICE (v2.4) ============ */
/* La fiche disait ou en etait l exercice aujourd hui, jamais d ou il venait ni
   ou il allait. Trois lectures manquaient : sa position sur son echelle, les
   paliers deja franchis et leur date, l etat de son verrou dans les deux sens.
   Tout se reconstruit depuis state.hist, qui porte deja par passage la charge
   et le barreau d avant seance : c est une lecture, retroactive sur les
   seances deja jouees, sans nouveau modele de donnees.
   Une seule exception, assumee : la fourchette des exercices au poids du corps
   et des tenues n etait ecrite nulle part, et n est pas rejouable a posteriori
   puisque la montee depend de full, de la grace et du palier tenu, qui ne sont
   pas historises. D ou it.rng, ecrit a partir de la v2.4 pour ces deux modes
   seulement, les autres ayant deja load ou band. Leur chemin des paliers
   demarre donc a la premiere seance suivant la mise a jour : rien n est
   reconstitue, une date inventee vaudrait moins que son absence. */

/* Passages d un exercice, du plus ancien au plus recent. Deux natures : le
   passage propre, et le passage ou l exercice a ete remplace par son repli, qui
   est enregistre sous l identifiant du repli. Sans cette seconde lecture la
   fiche laisse un trou aux dates concernees et se lit comme une absence
   d entrainement, alors que la seance a eu lieu. */
function exoPassages(id){
  const out=[];
  (state.hist||[]).forEach(h=>{
    (h.items||[]).forEach(it=>{
      if(it.id===id) out.push({h:h,it:it,repl:false});
      else if(it.from===id) out.push({h:h,it:it,repl:true});
    });
  });
  return out;
}
/* Valeur de palier d un passage, dans l unite propre au mode. Renvoie null
   quand le passage ne la porte pas : les passages anterieurs a it.rng, et les
   modes qui n ont pas d echelle. */
function palierVal(id,it){
  const e=DB[id]; if(!e||!it) return null;
  /* v2.19 : un passage joue sous un autre regime n est pas un palier de
     l echelle actuelle */
  if(it.u&&it.u!==unitOf(e)) return null;
  if(e.bnd) return it.band||null;
  if(e.mode==='load'||e.mode==='fixed') return (it.load||0);
  /* v2.17 : sur une echelle de tenues le palier est la tenue ; un passage
     anterieur au champ a ete joue au premier barreau par construction. */
  if(e.rhythm) return it.tenue!=null?it.tenue:(it.rng?e.rhythm.ladder[0][0]:null);
  if(e.assise) return it.assise!=null?it.assise:(it.rng?e.assise.ladder[0][0]:null);
  if(e.mode==='bw'||e.mode==='time') return it.rng?it.rng.join('-'):null;
  return null;
}
/* Unite d un passage (v2.19) : celle de l exercice, sauf quand le passage a
   ete joue sous un autre regime et le dit, it.u, pose par la migration. */
function unitAt(e,it){ return (it&&it.u)||unitOf(e); }
/* Etiquette de tenue d un passage, la ou charge et bande ont la leur (v2.17). */
function tenueTag(it){
  if(it&&it.tenue!=null) return ' <span class="muted small num">'+it.tenue+' s</span>';
  if(it&&it.assise!=null) return ' <span class="muted small num">assise '+it.assise+' cm</span>';
  return '';
}
function palierLbl(id,v){
  const e=DB[id];
  if(v==null||!e) return '';
  if(e.bnd) return bandLabel(v);
  if(e.mode==='load'||e.mode==='fixed') return v>0?loadLabelFor(id,v):'poids du corps';
  if(e.rhythm) return 'tenues de '+v+' s';
  if(e.assise) return 'assise à '+v+' cm';
  return String(v)+' '+unitOf(e);
}
/* Sens d un changement de palier. Sur les bandes il se lit dans l ordre de
   l echelle et non dans la couleur : bandOrder porte deja l inversion des
   bandes d assistance, ou progresser signifie moins d aide. */
function palierUp(id,a,b){
  const e=DB[id];
  if(e.bnd){ const O=bandOrder(e); return O.indexOf(b)>O.indexOf(a); }
  if(e.rhythm) return b>a;
  if(e.assise) return b<a;
  if(e.mode==='bw'||e.mode==='time') return parseInt(String(b).split('-')[1],10)>parseInt(String(a).split('-')[1],10);
  return b>a;
}
/* Chemin des paliers : uniquement les changements, dates. Jamais tronque, il
   est rare par nature, une dizaine d entrees par an au plus. C est lui qui
   porte l arc de progression, ce qui autorise a borner les passages. */
function paliersOf(id){
  const out=[]; let prev=null;
  exoPassages(id).forEach(x=>{
    if(x.repl) return;
    const v=palierVal(id,x.it);
    if(v==null) return;
    if(prev===null){ out.push({v:v,date:x.h.date,first:true}); prev=v; return; }
    if(v!==prev){ out.push({v:v,date:x.h.date,up:palierUp(id,prev,v)}); prev=v; }
  });
  return out;
}
/* Echelle de l exercice et position courante, une forme unique pour les quatre
   regimes. Depuis la v2.16 le regime de la fourchette n a qu une marche : le
   haut de fourchette est le plafond, et la suite est la marche ecrite dans
   NEXT. L echelle de fourchettes decalees, 6-12 puis 7-13 puis 8-14, qui
   affichait « Marche 1 sur 3 » pour un escalier que personne n avait dessine,
   est partie avec le relevement. La position vaut -1 quand la fourchette
   stockee n est pas celle du catalogue : c est le temoin que la migration
   d ecretage a manque un etat, pas un cas de fonctionnement. */
/* Position sur une echelle numerique : la marche exacte, ou a defaut la plus
   haute marche atteinte. Le repli couvre le reglage manuel, qui se fait sur
   l echelle complete quand l echelle de progression est plus lache. Renvoie -1
   quand rien n a encore ete regle : c est un depart, pas une anomalie. */
function rangIn(L,cur){
  let i=-1;
  L.forEach((v,k)=>{ if(Math.abs(v-cur)<0.01) i=k; });
  if(i<0) for(let k=0;k<L.length;k++) if(L[k]<=cur+0.01) i=k;
  return i;
}
function echelleOf(id){
  const e=DB[id], p=state.perf[id];
  if(!e||!e.reps||e.cat==='cardio'||e.mode==='circuit'||e.mode==='stretch') return null;
  const g=state.gear;
  if(e.mode==='load'){
    const L=loadLadderProg(g), cur=(p&&p.load)||0;
    return {lbl:L.map(v=>loadLabelFor(id,v)),i:rangIn(L,cur),quoi:'charge'};
  }
  if(e.bnd){
    const L=bandLadder(e,g);
    return {lbl:L.map(b=>bandLabel(b)),i:L.indexOf(p&&p.band),quoi:'barreau'};
  }
  if(e.mode==='fixed'){
    const fc=fixedCap(id), L=fixedLadder(id,g).filter(x=>fc==null||x.v<=fc+0.01), cur=(p&&p.load)||0;
    return {lbl:L.map(x=>x.lbl),i:rangIn(L.map(x=>x.v),cur),quoi:'charge',cap:fc!=null};
  }
  /* Echelle de tenues (v2.17) : trois marches, chacune avec sa fourchette.
     Sans performance enregistree l exercice est vierge, comme sur une bande,
     bien que sa position soit connue par construction. */
  if(e.rhythm){
    const L=e.rhythm.ladder, r=rungOf(e,p&&p.tenue);
    return {lbl:L.map(x=>x[0]+' s · '+x[1]+'-'+x[2]),i:p?r.i:-1,quoi:'tenue'};
  }
  if(e.assise){
    const L=e.assise.ladder, r=rungOf(e,p&&p.assise);
    return {lbl:L.map(x=>'assise '+x[0]+' cm · '+x[1]+'-'+x[2]),i:p?r.i:-1,quoi:'assise'};
  }
  const base=e.reps, rg=rangeOf(p,e);
  return {lbl:[base[0]+'-'+base[1]+' '+unitOf(e)],i:(rg[0]===base[0]&&rg[1]===base[1])?0:-1,quoi:'fourchette'};
}
/* Bloc 1 : ou j en suis. Position, marche suivante, et la condition qui la
   declenche, ecrite dans les termes exacts de applyProgress. */
function echelleHtml(id){
  const e=DB[id], p=state.perf[id], E=echelleOf(id);
  if(!E) return '';
  const rg=rangeOf(p,e), top=rg[1], held=!!(p&&p.hold);
  const suiv=(E.i>=0&&E.i<E.lbl.length-1)?E.lbl[E.i+1]:null;
  const vierge=E.i<0;   /* depart : la position dit deja ou commence l echelle */
  /* Une fourchette n a qu une marche (v2.16) : « Marche 1 sur 1 » ne dirait
     rien, la ligne de position est reservee aux echelles. */
  const pos=E.i<0?'<div class="muted small">Pas encore de niveau enregistré : l\'échelle commence à <b>'+esc(E.lbl[0]||'')+'</b>.</div>'
    :(E.quoi==='fourchette'?'':'<div class="muted small">Marche <b class="num">'+(E.i+1)+'</b> sur <b class="num">'+E.lbl.length+'</b>'+(E.cap?', plafond dérivé du soulevé roumain':'')+'</div>');
  /* Fenetre autour de la marche courante. Sur l echelle des halteres, vingt-six
     marches en pastilles noient la position qu elles sont censees montrer : on
     en garde trois de chaque cote, les extremites restant lisibles par le
     compteur au-dessus. */
  const W=3, deb=Math.max(0,E.i-W), fin=Math.min(E.lbl.length,E.i+W+1);
  const echelle=(E.i<0||E.lbl.length<2)?'':'<div class="mt" style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">'+
    (deb>0?'<span class="muted small">…</span>':'')+
    E.lbl.slice(deb,fin).map((l,k)=>'<span class="tag ech'+(deb+k===E.i?' ok':'')+'" style="font-size:.68rem;'+(deb+k>E.i?'opacity:.45':'')+'">'+esc(l)+'</span>').join('')+
    (fin<E.lbl.length?'<span class="muted small">…</span>':'')+'</div>';
  /* Sur une fourchette, le plafond n est pas un etat atteint mais une regle :
     la ligne dit ce qui se passe au haut de fourchette, et a quelle condition,
     dans les termes exacts d applyProgress. */
  const plafond=E.quoi==='fourchette'?'Au haut de la fourchette, toutes les séries à <b class="num">'+top+'</b> '+unitOf(e)+' sur une séance complète :':'Dernière marche outillée.';
  return '<details class="mt" data-k="fiche-echelle"'+cardOpen('fiche-echelle',false)+'>'+
    '<summary>Où j\'en suis</summary>'+
    '<div class="mt"><span class="tag ok">'+esc(E.i>=0?E.lbl[E.i]:palierLbl(id,e.bnd?(p&&p.band):(p&&p.load)))+'</span></div>'+
    pos+echelle+
    (vierge?'':(suiv?'<div class="muted small mt">Marche suivante : <b>'+esc(suiv)+'</b></div>':
          '<div class="muted small mt">'+plafond+(nextFor(id,state.gear)?' '+esc(nextFor(id,state.gear)):'')+'</div>'))+
    (vierge?'':held?'<div class="muted small mt">Palier tenu : la progression est figée, la marche suivante ne se déclenchera pas tant que tu ne l\'auras pas relâchée.</div>'
         :(suiv?'<div class="muted small mt">Elle se déclenche quand toutes les séries atteignent <b class="num">'+top+'</b> '+unitOf(e)+' sur une séance complète.</div>':''))+
  '</details>';
}
/* Bloc 2 : deux registres. Le chemin des paliers, entier, porte l arc ; les
   passages, bornes a douze dont trois visibles, portent le detail recent. Sans
   le premier, borner le second effacerait le debut de l histoire. */
function passagesHtml(id){
  const e=DB[id], P=exoPassages(id), PAL=paliersOf(id);
  if(!P.length) return '';
  const rec=P.slice().reverse(), plus=(ficheMoreId===id), vus=rec.slice(0,plus?12:3);
  const ligne=x=>{
    const h=x.h, it=x.it;
    if(x.repl) return '<div class="histline" style="opacity:.5;cursor:pointer" onclick="showFiche(\''+it.id+'\')">'+
      '<span class="muted small">'+esc(fmtDT(h.date))+' · remplacé par '+esc((DB[it.id]||{}).nom||it.id)+'</span><span class="muted">›</span></div>';
    const tags=[];
    if(h.light) tags.push('allégée');
    if(h.inc) tags.push('quittée');
    else if(h.rounds&&it.sets&&it.sets.length<h.rounds) tags.push('partielle');
    const charge=e.bnd&&it.band?bandDot(it.band)+esc(bandLabel(it.band)):(it.load?esc(loadLabelFor(id,it.load)):((it.tenue!=null?it.tenue+' s'+(it.rng?' · ':''):'')+(it.assise!=null?'assise '+it.assise+' cm'+(it.rng?' · ':''):'')+(it.rng?esc(it.rng.join('-')):'')));
    return '<div class="histline"><span class="muted small">'+esc(fmtDT(h.date))+
      (charge?' · <span class="num">'+charge+'</span>':'')+
      tags.map(t=>' <span class="tag flame" style="font-size:.68rem">'+t+'</span>').join('')+
      '</span><span class="num small">'+(e.mode==='stretch'?'✓':setsHtml(it.sets||[])+' '+unitAt(e,it))+'</span></div>';
  };
  const chemin=PAL.length>1?'<div class="muted small mt">Chemin des paliers</div>'+
    PAL.map(x=>'<div class="histline"><span>'+(x.first?'<span class="muted small">départ</span>':(x.up?'⚖️':'↓'))+
      ' <b>'+esc(palierLbl(id,x.v))+'</b></span><span class="muted small">'+esc(fmtDT(x.date).slice(6))+'</span></div>').join('')
    :'';
  const manque=!e.bnd&&(e.mode==='bw'||e.mode==='time')&&PAL.length<=1&&P.length>1
    ? '<div class="muted small mt">Le chemin des paliers de cet exercice se remplit à partir des séances jouées depuis la mise à jour : les fourchettes des passages antérieurs n\'ont pas été enregistrées.</div>' : '';
  return '<details class="mt" data-k="fiche-passages"'+cardOpen('fiche-passages',false)+'>'+
    '<summary>Progression</summary>'+
    chemin+manque+
    '<div class="muted small mt">'+(plus?'Douze derniers passages':'Trois derniers passages')+'</div>'+
    vus.map(ligne).join('')+
    (rec.length>3?'<button class="quiet" style="margin-top:8px;padding:6px 14px;font-size:.8rem" onclick="ficheMore(\''+id+'\')">'+
      (plus?'Voir moins':'Voir plus')+'</button>':'')+
  '</details>';
}
/* Bloc 3 : le verrou, dans les deux sens. L etat affiche est celui de la
   derniere seance et non un maximum historique, parce que c est ce que lit
   checkUnlocks : une barre de progression reculerait apres un passage moyen et
   se lirait comme une perte alors que rien n est perdu. */
function verrouHtml(id){
  const e=DB[id], parts=[];
  if(e.lock&&!state.unlocked[id]){
    const src=DB[e.lock.after], p=state.perf[e.lock.after];
    let etat;
    if(!p||!p.sets||!p.sets.length) etat='Aucun passage enregistré sur '+esc(src?src.nom:e.lock.after)+' pour l\'instant.';
    else if(p.lightSets||p.unqualSets) etat='Le dernier passage sur '+esc(src.nom)+' était en séance allégée ou avec un matériel non conforme : il ne compte pas pour le verrou.';
    else if(e.lock.bandGate&&src&&src.bnd){
      const L=bandOrder(src), dernier=L[L.length-1];
      /* v2.12 : les deux nombres sortent du dernier passage, barreau compris.
         Le texte disait deja « à la dernière séance » alors que le meilleur lu
         etait un maximum historique au barreau : il est vrai maintenant. */
      const meilleure=Math.max.apply(null,(p.sets||[]).concat([0]));
      etat='À la dernière séance : barreau '+esc(bandLabel(p.setsBand||p.band))+' (il faut '+esc(bandLabel(dernier))+')'+
           ', meilleure série <b class="num">'+meilleure+'</b> (il faut <b class="num">'+e.lock.need+'</b>).'+
           (p.setsBand?'':' Le barreau de ce passage n\'a pas été enregistré : il le sera à la prochaine séance.');
    } else {
      const k=Math.min(e.lock.minSets||1,effRounds()), n=(p.sets||[]).filter(v=>v>=e.lock.need).length;
      etat='À la dernière séance : <b class="num">'+n+'</b> série'+(n>1?'s':'')+' à '+e.lock.need+'+ sur les <b class="num">'+k+'</b> demandées ('+setsHtml(p.sets)+').';
      /* v2.18 : une porte de palier se dit avec le palier joue et le palier
         exige, que la seule ligne de series ne montrait pas */
      const gp=gatePalier(e);
      if(gp) etat+=gp.joue?' Palier joué : <b>'+esc(gp.joue)+'</b> (il faut <b>'+esc(gp.exige||'?')+'</b>).'
                          :' Le palier de ce passage n\'a pas été enregistré : il le sera à la prochaine séance.';
    }
    parts.push('<div class="muted small">Verrouillé par <b>'+esc(src?src.nom:e.lock.after)+'</b></div>'+
      '<div class="mt"><span class="tag lock">🔒 '+esc(lockCond(e))+'</span></div>'+
      '<div class="muted small mt">'+etat+'</div>'+
      '<div class="muted small mt">La condition se relit à chaque séance : elle porte sur le dernier passage, pas sur un record.</div>');
  }
  const ouvre=Object.keys(DB).filter(x=>DB[x].lock&&DB[x].lock.after===id);
  if(ouvre.length) parts.push('<div class="'+(parts.length?'mt':'')+'" style="'+(parts.length?'border-top:1px solid var(--line);padding-top:10px':'')+'">'+
    '<div class="muted small">Cet exercice ouvre</div>'+
    ouvre.map(x=>{
      const ouvert=!!state.unlocked[x];
      return '<div class="histline" style="cursor:pointer;border:none;padding:6px 0" onclick="showFiche(\''+x+'\')">'+
      '<span><b>'+esc(DB[x].nom)+'</b>'+(ouvert?' <span class="tag ok" style="font-size:.68rem">ouvert</span>':'')+
      '<div class="muted small">'+esc(lockCond(DB[x]))+'</div>'+
      (DB[x].retire===id?'<div class="muted small">'+(ouvert?'Il a pris la place de cet exercice dans la rotation.':'Il prendra la place de cet exercice dans la rotation.')+'</div>':'')+
      '</span><span class="muted">›</span></div>';
    }).join('')+'</div>');
  if(!parts.length) return '';
  return '<details class="mt" data-k="fiche-verrou"'+cardOpen('fiche-verrou',false)+'>'+
    '<summary>Verrou</summary>'+parts.join('')+'</details>';
}
let ficheMoreId=null;
function ficheMore(id){ openCards=cardsOpen(); ficheMoreId=(ficheMoreId===id)?null:id; showFiche(id); }
function showFiche(id,from){
  screenEnter('fiche/'+id);
  if(from) ficheFrom=from;
  setHash('fiche/'+id);
  const e=DB[id],p=state.perf[id],locked=isLocked(id);
  if(ficheMoreId&&ficheMoreId!==id) ficheMoreId=null;
  const back={home:'← Retour à la séance',lib:'← Retour aux exercices',prog:'← Retour aux progrès'}[ficheFrom]||'← Retour';
  $('#app').innerHTML='<button class="quiet" style="margin-bottom:10px;padding:8px 14px" onclick="go(\''+ficheFrom+'\')">'+back+'</button>'+
  '<div class="card">'+
    '<div class="exo-head"><h3>'+esc(e.nom)+'</h3><span class="exo-en">'+esc(e.en)+'</span></div>'+
    '<div class="muted small">'+esc(e.mus)+'</div>'+
    (locked?'<div class="tag lock" style="margin-top:8px">🔒 '+esc(lockCond(e))+'</div>':'')+
    /* sens inverse du bloc « Variante de repli » ci-dessous, qui nomme le repli
       d un exercice : celui-ci dit de qui l exercice courant est le repli */
    (estRepli(id)?'<div class="muted small mt">Exercice de repli : il ne sort pas au tirage. Il remplace '+esc(replieDe(id).map(x=>DB[x].nom).join(', '))+' en cas de douleur ou de séance allégée.</div>':'')+
    (estSubstitut(id)?'<div class="muted small mt">Substitut de '+esc(substitutDe(id).map(x=>DB[x].nom).join(', '))+' : il ne sort pas au tirage, il prend la place quand le matériel manque.</div>':'')+
    '<div class="mt">'+figFor(id,e.fig,e.nom)+'</div>'+
    '<details data-k="fiche-exec"'+cardOpen('fiche-exec',true)+'><summary>Exécution</summary><ol class="steps-list">'+e.desc.map(d=>'<li>'+d+'</li>').join('')+'</ol></details>'+
    '<div class="vig">⚠ '+e.vig+'</div>'+
    (e.pos?'<div class="muted small mt" style="border-left:3px solid var(--rail);padding-left:10px">'+esc(BAND_POS)+'</div>':'')+
    /* v2.17 : sur une echelle de tenues la fourchette est celle du barreau, et
       le barreau se dit ; ailleurs celle du catalogue, comme avant */
    (e.reps?'<div class="muted small mt">Fourchette de travail : '+baseReps(e,state.perf[id])[0]+'-'+baseReps(e,state.perf[id])[1]+' '+unitOf(e)+(e.rhythm?' de '+tenueOf(id,state.perf[id])+' s':'')+(e.assise?', assise à '+assiseOf(id,state.perf[id])+' cm':'')+' × '+(e.sets||3)+' séries'+(e.side?', par côté':'')+'</div>':'')+
    (e.bnd&&p&&p.band?'<div class="muted small">Barreau actuel : '+bandDot(p.band)+bandLabel(p.band)+(e.bnd==='ass'?' (assistance : progresser = descendre l\'échelle)':' (résistance : progresser = monter l\'échelle)')+'</div>':'')+
    /* v2.18 : le niveau est celui sous lequel ces series ont ete jouees, lu
       comme sur l ecran de serie. La fiche accolait le niveau du jour, deja
       monte en fin de seance : « 15/15/15 à KB 10 kg + lestes 2 kg » pour
       trois series faites a 10 kg. */
    (p&&p.sets&&p.sets.length?'<div class="mt"><span class="tag ok">Dernière fois : '+setsHtml(p.sets)+esc(playedLabel(id,p))+'</span></div>':'')+
    (finLineHtml(id))+
    (fbLineHtml(id))+
    (holdBoxHtml(id))+
    (echelleHtml(id))+
    (passagesHtml(id))+
    (verrouHtml(id))+
  '</div>';
  renderNav();
}
/* Critere de fin de serie sur la fiche (v2.12). Il ne vit pas dans vig, qui
   nomme ce qui est en jeu sur le corps, ni dans desc, qui decrit le geste :
   c est une regle d arret, et elle merite sa ligne. Le champ n existe que la ou
   l echec technique arrive avant l echec musculaire, sept fiches ; ailleurs la
   regle generale de la section de Reglages suffit, et la repeter partout la
   ferait lire nulle part. Le lien mene au texte complet, une seule source. */
function finLineHtml(id){
  const f=DB[id]&&DB[id].fin;
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    (f?'<div class="muted small"><b>Fin de série</b> · '+f+'</div>':'')+
    '<div class="muted small'+(f?' mt':'')+'">Une série se termine quand la répétition suivante ne serait plus le même exercice. '+
    '<a href="#set" onclick="goComment();return false;">Comment ça marche</a></div></div>';
}
/* La variante de repli n existait qu au moment de la douleur, sur un bouton qui
   ne la nommait pas : impossible de savoir a l avance vers quoi on bascule ni
   quel materiel il faudrait. La fiche la nomme et y mene, materiel compris. */
function fbLineHtml(id){
  const fb=DB[id]&&DB[id].fb;
  if(!fb||!DB[fb]) return '';
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    '<div class="muted small">Variante de repli, en cas de douleur ou de séance allégée</div>'+
    '<div class="histline" style="cursor:pointer;border:none;padding:6px 0" onclick="showFiche(\''+fb+'\',\''+ficheFrom+'\')">'+
    '<span><b>'+esc(DB[fb].nom)+'</b><div class="muted small">'+esc((DB[fb].mat||['Poids du corps']).join(' · '))+'</div></span>'+
    '<span class="muted">›</span></div></div>';
}
/* interrupteur de palier tenu, disponible a froid depuis la fiche */
function holdBoxHtml(id){
  const e=DB[id];
  if(!e.reps||isLocked(id)||e.cat==='cardio'||e.mode==='stretch') return '';
  const p=state.perf[id], held=!!(p&&p.hold);
  return '<div class="mt" style="border-top:1px solid var(--line);padding-top:10px">'+
    '<div class="spread"><b class="small">'+(held?'Palier tenu':'Progression active')+'</b>'+
    '<button class="quiet" style="padding:6px 14px;font-size:.8rem" onclick="toggleHold(\''+id+'\')">'+(held?'Reprendre la progression':'Tenir ce palier')+'</button></div>'+
    '<div class="muted small" style="margin-top:6px">'+(held
      ? 'Niveau figé'+(p&&p.holdAt?' depuis le '+fmtDT(p.holdAt).slice(6):'')+'. La cible ne monte plus, la charge non plus. Si tu redescends nettement, l\'outil allège quand même : le filet de sécurité reste actif. Monter la charge à la main libère le palier.'
      : 'La cible suit tes séries, puis la charge prend le relais. Tenir le palier fige le niveau atteint, sans rien changer au volume de travail.')+'</div>'+
  '</div>';
}

/* ============ STATISTIQUES ============ */
function activeDays(st){
  const d={}; st.hist.forEach(h=>d[dayKey(h.date)]=1);
  return Object.keys(d).sort();
}
/* Moyenne de jours actifs par semaine.
   Deux regles, pour la meme raison : ne moyenner que sur des semaines
   reellement observees et reellement terminees.
   - la semaine en cours est exclue (elle est entamee, pas jouee : l inclure
     ferait plonger la moyenne chaque lundi matin) ;
   - le denominateur est borne au nombre de semaines revolues depuis la
     premiere seance, sinon on divise par des semaines ou l outil n existait
     pas (1 jour actif la premiere semaine donnait 0,3/sem sur 4).
   Renvoie null tant qu aucune semaine revolue n existe : il n y a alors rien
   a moyenner et la ligne n est pas affichee. */
function weeksObserved(st){
  if(!st.hist.length) return 0;
  const first=isoWeek(new Date(st.hist[0].date));
  if(first===prevWeekKey(0)) return 0;
  for(let i=1;i<=520;i++) if(prevWeekKey(i)===first) return i;
  return 52;
}
function avgActiveDays(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  let n=0; const wc=weekCounts(st);
  for(let i=1;i<=obs;i++) n+=wc[prevWeekKey(i)]||0;
  return {avg:Math.round(n/obs*10)/10,weeks:obs};
}
/* replis douleur par exercice d origine sur une fenetre glissante :
   c est la repetition qui est un signal, pas un repli isole */
function painSwaps(st,weeks){
  const cutoff=Date.now()-weeks*7*864e5, m={};
  st.hist.forEach(h=>{
    if(new Date(h.date).getTime()<cutoff) return;
    /* les substitutions d une seance allegee sont volontaires : les compter
       ici noierait le signal de douleur et declencherait l alerte a tort */
    if(h.light) return;
    (h.items||[]).forEach(it=>{
      const org=it.sw&&it.from?it.from:it.id;
      if(!DB[org]) return;
      const e=m[org]||(m[org]={n:0,sw:0,to:{}});
      e.n++;
      if(it.sw&&it.from){ e.sw++; e.to[it.id]=(e.to[it.id]||0)+1; }
    });
  });
  return Object.keys(m).filter(id=>m[id].sw>0)
    .map(id=>({id:id,sw:m[id].sw,n:m[id].n,to:m[id].to}))
    .sort((a,b)=>b.sw-a.sw||b.n-a.n);
}
/* semaines terminees depuis la premiere seance : la semaine en cours n est
   comptee que si elle est deja validee, sinon elle serait affichee comme un
   deficit du lundi au dimanche alors qu elle n est pas jouee */
function weeksElapsed(st){
  if(!st.hist.length) return 0;
  const first=new Date(st.hist[0].date);
  const n=Math.max(1,Math.floor((Date.now()-first.getTime())/(7*864e5))+1);
  const cur=prevWeekKey(0);
  const done=(weekCounts(st)[cur]||0)>=goalForWeek(st,cur);
  return Math.max(0,n-(done?0:1));
}
function weeksValidated(st){
  const wc=weekCounts(st); let n=0;
  Object.keys(wc).forEach(k=>{ if(wc[k]>=goalForWeek(st,k)) n++; });
  return n;
}
function timeStats(st){
  const now=Date.now(), week=prevWeekKey(0), month=monthKey();
  let wSec=0,mSec=0,sumReal=0,sumPlan=0,nReal=0,sumGap=0,nModel=0;
  st.hist.forEach(h=>{
    if(!h.real) return;
    if(isoWeek(new Date(h.date))===week) wSec+=h.real;
    if(monthKey(h.date)===month) mSec+=h.real;
    sumReal+=h.real; sumPlan+=(h.plan!=null?h.plan:(h.dur||0))*60; nReal++;
    /* Ecart au modele rejoue (v1.16) : le seul chiffre sur lequel la constante
       d installation se recale. Il n a de sens qu en moyenne, une seance isolee
       etant dominee par ses interruptions, et seules les seances menees a leur
       terme comptent : sur une seance quittee, le temps reel s arrete au milieu
       d une etape que le modele, lui, ne compte pas du tout. */
    if(h.model&&!h.inc){ sumGap+=h.real-h.model; nModel++; }
  });
  return {week:wSec,month:mSec,avgReal:nReal?Math.round(sumReal/nReal/60):0,
          avgPlan:nReal?Math.round(sumPlan/nReal/60):0,n:nReal,
          gap:nModel?Math.round(sumGap/nModel):0,nModel:nModel};
}
function bandJourney(st){
  const first={}, last={};
  st.hist.forEach(h=>(h.items||[]).forEach(it=>{
    const e=DB[it.id]; if(!e||!e.bnd||!it.band) return;
    if(!first[it.id]) first[it.id]={band:it.band,date:h.date};
    last[it.id]={band:it.band,date:h.date};
  }));
  return Object.keys(first).filter(id=>first[id].band!==last[id].band).map(id=>({id:id,a:first[id],b:last[id]}));
}
function loadJourney(st){
  const first={},last={};
  st.hist.forEach(h=>(h.items||[]).forEach(it=>{
    const e=DB[it.id]; if(!e||(e.mode!=='load'&&e.mode!=='fixed')||!it.load) return;
    if(!first[it.id]) first[it.id]={load:it.load,date:h.date};
    last[it.id]={load:it.load,date:h.date};
  }));
  return Object.keys(first).map(id=>({id:id,a:first[id],b:last[id]}));
}
/* Couverture musculaire : series par semaine et par groupe.
   Meme regle que la moyenne de jours actifs, appliquee ici en v1.11 : on ne
   moyenne que sur des semaines observees et terminees. Le denominateur fixe a
   4 divisait le travail reel par des semaines ou l outil n existait pas encore
   (33 series faites en une semaine s affichaient 2,3 series par groupe, sous
   la bande sur les quatre rails, alors que la semaine vecue etait dans la
   bande). La fenetre passe donc des 28 derniers jours glissants aux semaines
   ISO revolues, la semaine en cours restant dehors : entamee n est pas jouee,
   et l inclure ferait plonger la mesure chaque lundi matin.
   Renvoie null tant qu aucune semaine n est revolue : il n y a alors rien a
   moyenner, et la card affiche sa projection sans rails.
   Les replis douleur gardent leur fenetre glissante de 4 semaines : ce sont
   des frequences, pas une moyenne, et un signal de securite doit reagir des la
   seance du jour. */
function coverage(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  const keep={}; for(let i=1;i<=obs;i++) keep[prevWeekKey(i)]=1;
  const cats={push:0,pull:0,legs:0,core:0};
  st.hist.forEach(h=>{
    if(!keep[isoWeek(new Date(h.date))]) return;
    (h.items||[]).forEach(it=>{
      const e=DB[it.id];
      if(e&&cats[e.cat]!=null) cats[e.cat]+=it.sets.length;
    });
  });
  const o={}; Object.keys(cats).forEach(k=>o[k]=Math.round(cats[k]/obs*10)/10);
  return o;
}
/* nombre de semaines reellement moyennees, pour le libelle de la card */
function coverageWeeks(st,weeks){ return Math.min(weeks,weeksObserved(st)); }
/* Volume reellement joue par exercice (v2.2). La projection de la card nomme
   deux facteurs, les series par exercice et les jours actifs ; la couverture
   mesuree est a peu pres leur produit. Le second facteur est mesure dans
   Assiduite, le premier ne l etait nulle part, alors que c est lui qui bouge
   depuis que le volume se change en cours de seance et que les seances
   quittees existent. Meme fenetre que coverage, meme regle des semaines
   revolues : la ligne apparait et disparait avec les rails.
   Le denominateur est le nombre d emplacements et non le nombre d exercices
   distincts joues : un exercice bascule sur son repli en cours de seance
   produit deux entrees au journal pour un seul emplacement, et la somme des
   series reste juste. Les etirements n entrent jamais au journal et le module
   cardio n a pas de categorie de vivier : ni l un ni l autre n est compte. */
function playedVolume(st,weeks){
  const obs=Math.min(weeks,weeksObserved(st));
  if(!obs) return null;
  const keep={}; for(let i=1;i<=obs;i++) keep[prevWeekKey(i)]=1;
  let sets=0,n=0;
  st.hist.forEach(h=>{
    if(!keep[isoWeek(new Date(h.date))]) return;
    n++;
    (h.items||[]).forEach(it=>{
      const e=DB[it.id];
      if(e&&SLOT_ORDER.indexOf(e.cat)>=0) sets+=it.sets.length;
    });
  });
  if(!n) return null;
  return {v:Math.round(sets/n/SLOT_ORDER.length*10)/10,n:n,sets:sets};
}
function fmtMoisAn(iso){
  const M=['janv','févr','mars','avril','mai','juin','juil','août','sept','oct','nov','déc'];
  const d=new Date(iso); return M[d.getMonth()]+' '+d.getFullYear();
}
function fmtH(sec){
  const h=Math.floor(sec/3600), m=Math.round(sec%3600/60);
  return h?h+' h '+(m?m+' min':''):m+' min';
}
function histoWeeksSvg(st){
  const wc=weekCounts(st), N=12, bw=18, gap=6, H=56;
  let bars='';
  for(let i=N-1;i>=0;i--){
    const k=prevWeekKey(i), v=wc[k]||0, x=(N-1-i)*(bw+gap);
    const g=goalForWeek(st,k);
    const h=Math.round(Math.min(1,v/Math.max(g,v||1))* (H-14));
    const ok=v>=g;
    bars+='<rect x="'+x+'" y="'+(H-12-h)+'" width="'+bw+'" height="'+Math.max(2,h)+'" rx="3" fill="'+(ok?'var(--ok)':(v>0?'var(--accent)':'var(--line)'))+'"/>'+
      '<text x="'+(x+bw/2)+'" y="'+(H-2)+'" text-anchor="middle" font-size="9" fill="var(--muted)" font-family="var(--mono)">'+(v||'')+'</text>';
  }
  return '<svg viewBox="0 0 '+(N*(bw+gap)-gap)+' '+H+'" style="width:100%;height:auto" aria-hidden="true">'+bars+'</svg>';
}
/* ============ COUVERTURE : BANDE ET ECHELLE (v1.10) ============
   Le plancher depend de l objectif poursuivi, le plafond n en depend pas :
   au-dela de 16 series par semaine la fatigue est la meme qu on construise ou
   non, donc seule la borne basse bouge. Un groupe dont tous les exercices
   tenables et deverrouilles sont tenus n est plus en construction, son
   plancher tombe a 4. Regle binaire par groupe et non au prorata : un prorata
   produirait un plancher fractionnaire illisible, et un exercice qui progresse
   encore construit encore son groupe.
   Echelle fixe a 24 : 8 tombe au tiers, 16 aux deux tiers, la bande occupe le
   tiers central. Une echelle adaptative deformerait la bande d une semaine a
   l autre, ce qui est precisement ce qu on vient corriger. Au-dela, ecretage :
   le chiffre exact reste ecrit a cote du rail. */
const COV_MIN=8, COV_MIN_HOLD=4, COV_MAX=16, COV_SCALE=24;
function groupHeld(cat){
  const ids=holdableIds().filter(id=>DB[id].cat===cat&&!isLocked(id));
  return ids.length>0&&ids.every(id=>isHeld(id));
}
function covFloor(cat){ return groupHeld(cat)?COV_MIN_HOLD:COV_MIN; }
function covPct(v){ return Math.round(Math.max(0,Math.min(1,v/COV_SCALE))*1000)/10; }
/* graduation alignee sur le rail : 96 px de nom + 8 de gouttiere a gauche,
   26 px de valeur + 8 de gouttiere a droite */
function covGrad(v){ return 'calc(104px + (100% - 138px) * '+(Math.round(v/COV_SCALE*1000)/1000)+')'; }
/* Projection : ce que la configuration produit, par opposition aux barres qui
   disent ce qui a ete fait. Toujours calculee par planFor via weeklySets,
   jamais depuis une table. */
function covProjection(){
  /* v1.13 : la projection part du volume choisi, pas d une duree dont on
     deduisait le nombre de tours. Le cardio ne rogne plus rien. */
  const r=roundsOf(state);
  const W={complet:'échauffement complet',court:'échauffement court',aucun:'sans échauffement'};
  return {n:weeklySets(),
    det:r+' série'+(r>1?'s':'')+' par exercice, '+W[state.warm]+', '+(state.cardio?'avec cardio':'sans cardio')+', objectif '+state.goal+' jour'+(state.goal>1?'s':'')};
}
function statsHtml(){
  const days=activeDays(state);
  if(!days.length) return '';
  const ts=timeStats(state), cov=coverage(state,4), lj=loadJourney(state);
  const wEl=weeksElapsed(state), wOk=weeksValidated(state);
  /* v2.7 : libelles derives de SLOTS et ordre pris sur SLOT_ORDER, comme dans
     la bibliotheque. La table recopiee ici figeait l ancien ordre du circuit. */
  const CAT_LABEL={}; SLOT_ORDER.forEach(s=>CAT_LABEL[s]=SLOTS[s].label);
  /* les quatre groupes existent independamment de la mesure : tant qu aucune
     semaine n est revolue, cov vaut null et seule la projection s affiche */
  const CATS=SLOT_ORDER.slice(), covW=coverageWeeks(state,4);
  const held={}; CATS.forEach(k=>held[k]=groupHeld(k));
  const heldGrp=CATS.filter(k=>held[k]);
  const covTop=cov?Math.max.apply(null,CATS.map(k=>cov[k])):0;
  const weak=cov?CATS.filter(k=>cov[k]<covFloor(k)&&cov[k]<covTop*0.6):[];
  const over=cov?CATS.filter(k=>cov[k]>COV_MAX):[];
  const proj=covProjection(), projFloor=heldGrp.length===CATS.length?COV_MIN_HOLD:COV_MIN;
  const projOk=proj.n>=projFloor&&proj.n<=COV_MAX;
  const a4=avgActiveDays(state,4), a12=avgActiveDays(state,12), pv=playedVolume(state,4);
  let h='<div class="card"><h3>Assiduité</h3>'+
    '<div class="muted small mt">Première séance le <b>'+fmtDT(state.hist[0].date).slice(6)+'</b> · <span class="num">'+days.length+'</span> jour'+(days.length>1?'s':'')+' actif'+(days.length>1?'s':'')+
    (wEl>0?' · <span class="num">'+wOk+'</span>/<span class="num">'+wEl+'</span> semaine'+(wEl>1?'s':'')+' validée'+(wEl>1?'s':''):' · première semaine en cours')+'</div>'+
    (a4?'<div class="muted small mt">Moyenne de jours actifs : <span class="num">'+fmtNum(a4.avg)+'</span>/sem sur '+a4.weeks+' semaine'+(a4.weeks>1?'s':'')+' révolue'+(a4.weeks>1?'s':'')+
        (a12&&a12.weeks>a4.weeks?' · <span class="num">'+fmtNum(a12.avg)+'</span>/sem sur '+a12.weeks:'')+'</div>':'')+
    '<div class="mt">'+histoWeeksSvg(state)+'</div>'+
    /* v2.15 : le referentiel se replie, l etat reste dehors (v1.10), comme sur
       la card Couverture. Trois phrases d explication depliees en permanence
       sous l histogramme etaient la seule exception. */
    '<details data-k="prog-assid"'+cardOpen('prog-assid',false)+' style="margin-top:8px"><summary class="muted small">Comment lire ce graphique</summary>'+
    '<div class="muted small mt">12 dernières semaines, jours actifs. Vert : objectif de la semaine atteint. Une semaine de démarrage ou de reprise a un objectif réduit au prorata des jours disponibles.</div></details></div>';
  h+='<div class="card"><h3>Couverture musculaire</h3>'+
    '<div class="muted small mt">'+(cov
      ?'Séries par semaine et par groupe, moyenne sur '+covW+' semaine'+(covW>1?'s':'')+' révolue'+(covW>1?'s':'')+'.'
      :'Séries par semaine et par groupe.')+'</div>'+
    '<div class="muted small mt">Configuration actuelle ('+proj.det+') : <b class="num" style="color:var('+(projOk?'--ok':'--flame')+')">'+proj.n+'</b> séries par groupe et par semaine.</div>'+
    (pv?'<div class="muted small mt">Réellement joué : <b class="num">'+fmtNum(pv.v)+'</b> série'+(pv.v>1?'s':'')+' par exercice, sur '+pv.n+' séance'+(pv.n>1?'s':'')+'.</div>':'');
  if(!cov) h+='<div class="muted small mt">Mesure à venir : elle démarre à la fin de ta première semaine complète.</div>';
  if(cov){
  h+='<div class="covgrad">'+(heldGrp.length?'<span style="left:'+covGrad(COV_MIN_HOLD)+'">'+COV_MIN_HOLD+'</span>':'')+
      '<span style="left:'+covGrad(COV_MIN)+'">'+COV_MIN+'</span>'+
      '<span style="left:'+covGrad(COV_MAX)+'">'+COV_MAX+'</span>'+
      '<span class="end">'+COV_SCALE+'</span></div>';
  CATS.forEach(k=>{
    const v=cov[k], fl=covFloor(k), out=v<fl||v>COV_MAX;
    h+='<div class="cov"><span class="cn"><span>'+CAT_LABEL[k]+'</span>'+(held[k]?'<span class="tenu">tenu</span>':'')+'</span>'+
       '<div class="rail"><span class="zone" style="left:'+covPct(fl)+'%;width:'+(Math.round((covPct(COV_MAX)-covPct(fl))*10)/10)+'%"></span>'+
       (v>COV_SCALE?'<span class="clip"></span>':'')+
       '<span class="cur'+(out?' out':'')+'" style="left:'+covPct(v)+'%"></span></div>'+
       '<span class="num cv">'+fmtNum(v)+'</span></div>';
  });
  if(weak.length) h+='<div class="vig">⚠ '+weak.map(k=>CAT_LABEL[k]).join(' et ')+' en retrait par rapport au reste : vérifie les replis et les séries passées.</div>';
  if(over.length) h+='<div class="vig">⚠ '+over.map(k=>CAT_LABEL[k]).join(' et ')+' au-dessus de la bande. Au-delà de '+COV_MAX+' séries par semaine, le rendement plafonne et la récupération devient le facteur limitant. Regarde aussi tes jours de repos : le volume ne les mesure pas.</div>';
  if(heldGrp.length) h+='<div class="muted small mt"><b>'+heldGrp.map(k=>CAT_LABEL[k]).join(' et ')+'</b> : tous les exercices du groupe sont en palier tenu, donc en entretien. Plancher ramené de '+COV_MIN+' à '+COV_MIN_HOLD+', maintenir demande bien moins que construire.</div>';
  const ratio=cov.pull&&cov.push?Math.round(cov.pull/cov.push*10)/10:null;
  if(ratio!=null) h+='<div class="muted small mt">Équilibre tiré/poussé : <span class="num">'+fmtNum(ratio)+'</span>'+(ratio<0.9?' · le tiré devrait au moins égaler le poussé pour tes épaules':'')+'</div>';
  }
  const div=divergence();
  if(div) h+='<div class="vig">⚠ Le poussé a pris <span class="num">'+div+'</span> montées d\'avance sur un tiré que tu tiens. Pour tes épaules, le tiré doit au moins suivre : libère le palier du tiré, ou tiens aussi le poussé le temps que l\'écart se referme.</div>';
  const nTenus=heldCount();
  if(nTenus) h+='<div class="muted small mt"><span class="num">'+nTenus+'</span> exercice'+(nTenus>1?'s':'')+' sur '+holdableIds().length+' en palier tenu. Le volume ne bouge pas, seule l\'intensité cesse de monter.</div>';
  /* Le referentiel se replie, l etat reste dehors : ce qui explique le
     vocabulaire n a besoin d etre lu qu une fois, ce qui decrit la semaine
     doit rester sous les yeux. Ferme par defaut, l etat des cards n etant
     pas persiste, une zone ouverte par defaut se rouvrirait a chaque visite
     et ne ferait jamais gagner un scroll. */
  h+='<details data-k="prog-lecture"'+cardOpen('prog-lecture',false)+' style="margin-top:12px;border-top:1px solid var(--line);padding-top:8px"><summary>Comment lire ces chiffres</summary>'+
    '<div class="muted small mt" style="display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center">'+
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:18px;height:8px;background:var(--band);border-radius:2px"></span>bande visée</span>'+
      '<span style="display:flex;align-items:center;gap:6px"><span style="width:3px;height:13px;background:var(--flame);border-radius:2px"></span>hors bande</span>'+
    '</div>'+
    '<div class="muted small mt">De '+COV_MIN+' à '+COV_MAX+' séries par semaine et par groupe : c\'est la bande où le volume construit. En dessous, la progression ralentit sans disparaître. Au-dessus, le rendement plafonne et la récupération devient le facteur limitant.</div>'+
    '<div class="muted small mt">Un groupe dont tous les exercices sont en palier tenu passe en entretien : son plancher tombe à '+COV_MIN_HOLD+', parce que maintenir demande bien moins que construire, à condition de garder l\'intensité. C\'est exactement ce que fige le palier tenu. Le plafond de '+COV_MAX+' ne bouge pas : au-delà, la fatigue est la même que l\'on construise ou non.</div>'+
    '<div class="muted small mt">Le volume ne mesure pas la récupération. Six séances courtes et trois séances espacées peuvent donner le même total pour un effet très différent.</div>'+
    '<div class="muted small mt">L\'échelle s\'arrête à '+COV_SCALE+'. Au-delà, le rail est écrêté en hachures, le chiffre affiché reste exact.</div>'+
    '</details>';
  h+='</div>';
  const ps=painSwaps(state,4);
  if(ps.length){
    /* seule card de l onglet qui porte un avertissement : fermee par defaut,
       mais ouverte d office des que le seuil d alerte est franchi, un
       avertissement replie n avertissant personne */
    const alerte=ps.filter(p=>p.sw>=2&&p.sw*2>=p.n);
    const nSw=ps.reduce((a,p)=>a+p.sw,0);
    h+='<details class="card" data-k="prog-replis"'+cardOpen('prog-replis',alerte.length>0)+'><summary><span class="ttl">Replis douleur</span>'+
      '<span class="val'+(alerte.length?' flameval':'')+'">'+nSw+' sur 4 sem.</span></summary>'+
      '<div class="muted small mt">Sur les 4 dernières semaines, par exercice d\'origine. Un repli isolé est un mauvais jour, une répétition est un signal. Les séances allégées volontaires ne comptent pas ici.</div>';
    ps.forEach(p=>{
      const vers=Object.keys(p.to).sort((a,b)=>p.to[b]-p.to[a]).map(id=>DB[id]?DB[id].nom:id);
      h+='<div class="histline" style="cursor:pointer" onclick="showFiche(\''+p.id+'\',\'prog\')">'+
        '<span>'+esc(DB[p.id].nom)+'<div class="muted small">→ '+esc(vers.join(', '))+'</div></span>'+
        '<span class="num small" style="text-align:right"><b>'+p.sw+'</b>/'+p.n+' passage'+(p.n>1?'s':'')+'</span></div>';
    });
    if(alerte.length) h+='<div class="vig">⚠ '+esc(alerte.map(p=>DB[p.id].nom).join(', '))+' : la douleur revient plus d\'une fois sur deux. Un avis kiné sur ce mouvement vaut mieux qu\'un repli de plus.</div>';
    h+='</details>';
  }
  h+='<details class="card" data-k="prog-temps"'+cardOpen('prog-temps',false)+'><summary><span class="ttl">Temps d\'entraînement</span><span class="val">'+(ts.n?fmtH(ts.month)+' ce mois':'à mesurer')+'</span></summary>';
  if(ts.n){
    h+='<div class="muted small mt">Cette semaine : <b class="num">'+fmtH(ts.week)+'</b> · ce mois : <b class="num">'+fmtH(ts.month)+'</b></div>'+
       '<div class="muted small mt">Durée moyenne réelle : <span class="num">'+ts.avgReal+' min</span> pour <span class="num">'+ts.avgPlan+' min</span> annoncées, sur '+ts.n+' séance'+(ts.n>1?'s':'')+' mesurée'+(ts.n>1?'s':'')+'</div>'+
       /* La duree annoncee est calculee sur les cibles. Comparer le reel a
          l annonce melange donc deux causes : ce que le modele represente mal,
          et les repetitions faites au-dela ou en deca de la cible. Le modele
          rejoue reprend le meme calcul sur les valeurs saisies : l ecart qui
          reste ne contient plus que la premiere cause et les interruptions.
          C est le seul chiffre sur lequel la constante d installation se recale,
          et il ne vaut qu en moyenne. */
       (ts.nModel?'<div class="muted small mt">Écart au modèle : <span class="num">'+(ts.gap<0?'−':'+')+fmtDur(Math.abs(ts.gap))+'</span> par séance, sur '+ts.nModel+' séance'+(ts.nModel>1?'s':'')+' complète'+(ts.nModel>1?'s':'')+'. Le modèle est rejoué sur les répétitions réellement faites, donc cet écart ne contient plus les séries plus longues ou plus courtes que prévu.</div>':'');
  } else h+='<div class="muted small mt">Mesuré à partir de maintenant : les séances antérieures à la v1.1 n\'ont pas de durée réelle.</div>';
  h+='</details>';
  const bj=bandJourney(state);
  if(lj.length||bj.length){
    h+='<details class="card" data-k="prog-charges"'+cardOpen('prog-charges',false)+'><summary><span class="ttl">Trajectoire des charges</span><span class="val">'+(lj.length+bj.length)+' exercice'+(lj.length+bj.length>1?'s':'')+'</span></summary>';
    lj.forEach(j=>{
      h+='<div class="histline"><span>'+esc(DB[j.id].nom)+'</span><span class="num small">'+
        (j.a.load===j.b.load?fmtKg(j.a.load)+' depuis '+fmtMoisAn(j.a.date)
         :fmtKg(j.a.load)+' en '+fmtMoisAn(j.a.date)+' → '+fmtKg(j.b.load)+' en '+fmtMoisAn(j.b.date))+'</span></div>';
    });
    bj.forEach(j=>{
      h+='<div class="histline"><span>'+esc(DB[j.id].nom)+'</span><span class="num small">'+
        bandDot(j.a.band)+esc(bandRange(j.a.band)||j.a.band)+' en '+fmtMoisAn(j.a.date)+' → '+bandDot(j.b.band)+esc(bandRange(j.b.band)||j.b.band)+' en '+fmtMoisAn(j.b.date)+'</span></div>';
    });
    h+='</details>';
  }
  return h;
}

/* ============ PROGRES ============ */
/* Nombre de seances listees. Le plafond est juste, quatre seances par semaine
   en font plus de deux cents par an, mais rien ne le disait : la ligne
   d introduction le porte desormais, et les deux lisent la meme constante,
   sans quoi le texte et la coupe divergeraient un jour (v2.2). */
const HIST_SHOWN=12;
function renderProg(){
  screenEnter('prog');
  const li=lvlInfo(state.xp),ws=weekStreak(state);
  const ids=Object.keys(state.perf).filter(id=>DB[id]&&state.perf[id].sets&&state.perf[id].sets.length);
  /* retour d une correction faite depuis l historique : les messages de
     progression recalcules sont montres une fois, puis oublies */
  const note=fixNote; fixNote=null;
  let html='<h2 style="margin-bottom:12px">Progrès</h2>'+
  (note?'<div class="card"><div class="spread"><b>Séance corrigée</b></div>'+
     undoneHtml(note.undone,'left')+
     (note.msgs.length?note.msgs.map(m=>'<div class="tag ok" style="display:block;margin:6px 0;max-width:fit-content">'+esc(m)+'</div>').join('')
                 :(note.undone.length?'':'<div class="muted small mt">Progression recalculée, rien ne change de palier.</div>'))+'</div>':'')+
  '<div class="card"><div class="spread"><h3>Niveau <span class="num">'+li.lvl+'</span> · '+rankOf(li.lvl)+'</h3><span class="muted small num">'+state.xp+' XP</span></div>'+
  '<div class="bar mt"><i style="width:'+li.pct+'%"></i></div>'+
  '<div class="spread mt"><span class="muted small">'+state.hist.length+' séances · '+state.loadUps+' montées de charge</span>'+(ws>0?'<span class="tag flame">🔥 '+ws+' sem.</span>':'')+'</div></div>';
  if(state.hist.length){
    const der=state.hist[state.hist.length-1];
    const derLab=[histLab(der),fmtDT(der.date).slice(6)].filter(Boolean).join(' · ');
    html+='<details class="card" data-k="prog-seances"'+cardOpen('prog-seances',false)+'><summary><span class="ttl">Dernières séances</span>'+
      '<span class="val">'+esc(derLab)+'</span></summary>'+
      '<div class="muted small mt">Les '+HIST_SHOWN+' dernières. Touche une séance pour voir son contenu.</div>';
    [...state.hist].reverse().slice(0,HIST_SHOWN).forEach(h=>{
      const lab=histLab(h);
      /* Deux ambiguites levees en v1.11. La duree affichee etait le temps reel
         mesure, mais retombait silencieusement sur la duree choisie pour les
         seances sans mesure : meme format, deux grandeurs. Elle porte
         desormais les deux, systematiquement. Et l horodatage etait l heure de
         fin, posee a l enregistrement : on affiche l heure de debut, deduite
         de la duree reelle, c est celle qu on cherche en relisant son
         historique. La date de rattachement reste celle de fin, sans cas
         limite dans la plage d entrainement de 8 h a 20 h. */
      const ann=(h.plan!=null?h.plan:h.dur);
      const dmin=h.real?(Math.round(h.real/60)+' min'+(ann?' pour '+ann:''))
                       :(ann?ann+' min annoncées':'');
      const debut=h.real?new Date(new Date(h.date).getTime()-h.real*1000).toISOString():h.date;
      html+='<details><summary style="color:var(--ink);font-weight:400"><span class="histline" style="border:none;padding:6px 0;display:inline-flex;width:calc(100% - 20px);vertical-align:middle">'+
        '<span>'+(lab?esc(lab)+' ':'')+(h.inc?'<span class="tag flame" style="font-size:.68rem">incomplète</span> ':'')+'<span class="muted small">'+dmin+'</span></span>'+
        '<span class="muted small num">'+fmtDT(debut)+' · +'+h.xp+' XP</span></span></summary>'+
        histTimeHtml(h)+
        histItemsHtml(h)+
        /* la correction ne s offre que sur la derniere seance, tant qu aucune
           autre n a demarre : c est la fenetre que l instantane materialise */
        (corrigible()&&h.date===state.hist[state.hist.length-1].date
          ?'<button class="quiet mt" style="padding:6px 14px;font-size:.8rem" onclick="openFix(\'prog\')">Corriger cette séance</button>':'')+
        '</details>';
    });
    html+='</details>';
  }
  html+=statsHtml();
  html+='<details class="card" data-k="prog-reperes"'+cardOpen('prog-reperes',false)+'><summary><span class="ttl">Repères par exercice</span><span class="val">'+ids.length+' exercice'+(ids.length>1?'s':'')+'</span></summary>';
  if(!ids.length) html+='<div class="muted small mt">Tes repères apparaîtront ici après ta première séance.</div>';
  ids.forEach(id=>{
    const e=DB[id],p=state.perf[id];
    html+='<div class="histline" style="cursor:pointer" onclick="showFiche(\''+id+'\',\'prog\')"><span>'+esc(e.nom)+'</span><span class="num small">'+setsHtml(p.sets)+' '+unitOf(e)+(e.bnd&&p.band?' · '+bandLabel(p.band):(p.load?' · '+loadLabelFor(id,p.load):''))+'</span></div>';
  });
  html+='</details>';
  html+=badgesCardHtml();
  $('#app').innerHTML=html; renderNav();
}
/* Decomposition des durees d une seance, dans le detail deplie seulement (v1.16).
   La ligne fermee garde « 21 min pour 19 », qui tient en largeur. Ici il y a la
   place de dire de quoi l ecart est fait, et c est le seul endroit ou le detail
   se justifie : on y vient expres, apres coup, quand une seance a surpris.
   L identite est exacte : reel moins annonce vaut ce que les repetitions ont
   ajoute plus ce que le modele ne represente pas. */
/* v1.18 : le mode etant unique, ecrire « Alternee » sur chaque ligne serait un
   mot constant, donc du bruit. Le libelle ne porte plus que ce qui distingue :
   une seance allegee, et « Ciblee » pour une entree ancienne relue depuis un
   fichier importe, cas ou le mot dit encore quelque chose. */
function histLab(h){
  const p=[];
  if(h.mode&&h.mode!=='alterne') p.push('Ciblée');
  if(h.light) p.push('allégée');
  return p.join(' · ');
}
function histTimeHtml(h){
  if(!h.real||h.planSec==null||h.model==null) return '';
  const dR=h.real-h.planSec, dReps=h.model-h.planSec, dMod=h.real-h.model;
  const sg=v=>(v<0?'−':'+')+fmtDur(Math.abs(v));
  return '<div class="muted small mt" style="border-left:3px solid var(--line);padding-left:10px">'+
    'Annoncé <b class="num">'+fmtDur(h.planSec)+'</b>, réel <b class="num">'+fmtDur(h.real)+'</b> · écart <b class="num">'+sg(dR)+'</b>'+
    '<div style="margin-top:4px">dont répétitions faites au-delà ou en deçà des cibles : <b class="num">'+sg(dReps)+'</b></div>'+
    '<div>dont écart au modèle'+(h.inc?' (séance quittée, non exploitable)':'')+' : <b class="num">'+sg(dMod)+'</b></div>'+
  '</div>';
}
/* contenu d une seance : meme rendu qu au recapitulatif, tags de repli compris */
function histItemsHtml(h){
  if(!h.items||!h.items.length) return '<div class="muted small mt">Aucune série enregistrée.</div>';
  return '<div class="mt">'+h.items.map(it=>{
    const e=DB[it.id]; if(!e) return '';
    return '<div class="histline"><span>'+esc(e.nom)+
      (it.sw?' <span class="tag flame" style="font-size:.68rem">repli'+(it.from&&DB[it.from]?' de '+esc(DB[it.from].nom):'')+'</span>':'')+
      (it.band?' <span class="muted small">'+bandDot(it.band)+esc(bandLabel(it.band))+'</span>':(it.load?' <span class="muted small num">'+esc(loadLabelFor(it.id,it.load))+'</span>':tenueTag(it)))+
      '</span><span class="num small">'+(e.mode==='stretch'?'✓':setsHtml(it.sets)+' '+unitAt(e,it))+'</span></div>';
  }).join('')+'</div>';
}
/* fermee : les badges obtenus en rangee ; ouverte : toute la collection */
function badgesCardHtml(){
  const on=BADGES.filter(b=>state.badges.includes(b.id));
  return '<details class="card" data-k="prog-badges"'+cardOpen('prog-badges',false)+'><summary><span class="ttl">Badges</span><span class="val">'+on.length+'/'+BADGES.length+'</span>'+
    (on.length?'<span class="badgerow">'+on.map(b=>'<span class="badgechip">'+b.ico+' '+esc(b.nom)+'</span>').join('')+'</span>'
              :'<span class="badgerow"><span class="muted small">Le premier badge tombe à la fin de ta première séance.</span></span>')+
    '</summary>'+
    '<div class="mt">'+BADGES.map(b=>{
      const got=state.badges.includes(b.id);
      /* l avancement ne s affiche que sur un badge non acquis : une fois pose,
         « 12/5 » n informe plus de rien */
      const n=got?null:badgeProg(b,state);
      return '<div class="badge'+(got?'':' off')+'"><span class="ico">'+b.ico+'</span><div><b>'+esc(b.nom)+'</b><div class="small muted">'+esc(b.d)+'</div></div>'+
        (n==null?'':'<span class="pg num">'+n+'/'+b.seuil+'</span>')+'</div>';
    }).join('')+'</div></details>';
}

```
## `app9.js`

Matériel par exercice et sortie de matériel.

269 lignes, 15603 octets.

```javascript
/* ============ MATERIEL PAR EXERCICE ============ */
const MAT={
 'pompes-poignees':['Poignées de pompes si tu en as','Tapis'],
 'pompes-inclinees':['Support stable (table, plan de travail)'],
 'developpe-sol':['2 haltères'],
 'elevations-laterales':['2 haltères'],
 'face-pulls':['Élastique','Ancrage de porte à hauteur de visage'],
 'tirage-doux':['Élastique','Ancrage de porte'],
 'rowing-elastique':['Élastique','Tapis'],
 'rowing-kettlebell':['Kettlebell','Chaise ou banc'],
 'rowing-suspension':['Barre de traction','Sangles de suspension'],
 'gainage-lateral':['Tapis'],
 'pont-fessier':['Tapis'],
 'pont-fessier-leste':['Tapis','Kettlebell, sac à dos chargé ou disques','Serviette pliée'],
 'pont-fessier-une-jambe':['Tapis'],
 'hip-thrust-une-jambe':['Assise stable à hauteur de genou (canapé, lit, banc), calée contre un mur'],
 'hip-thrust-une-jambe-leste':['Assise stable à hauteur de genou (canapé, lit, banc), calée contre un mur','Kettlebell, sac à dos chargé ou disques','Serviette pliée'],
 'curls-halteres':['2 haltères'],
 'goblet-squat':['Kettlebell'],
 'box-squat':['Chaise'],
 'squat-une-jambe-chaise':['Chaise stable, réglable ou à deux hauteurs repérées (50 et 40 cm), qui ne roule ni ne pivote ou calée contre un mur'],
 'squat-une-jambe-chaise-leste':['Chaise stable à 40 cm, qui ne roule ni ne pivote ou calée contre un mur','Kettlebell'],
 'fentes-arriere':[],
 'fentes-arriere-lestee':['2 haltères'],
 'step-ups':['Marchepied (hauteur sous le genou)'],
 'step-ups-bas':['Marche basse ou première marche d\'escalier'],
 'retraction-scapulaire':['Tapis'],
 'ecartement-elastique':['Élastique'],
 'tirage-vertical-elastique':['Élastique','Ancrage de porte en hauteur'],
 'elevations-laterales-elastique':['Élastique'],
 'curls-elastique':['Élastique'],
 'rdl-elastique':['Élastique'],
 'mollets-debout':['Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-debout-leste':['Sac à dos','De quoi le charger : disques, kettlebell, bouteilles','Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-une-jambe':['Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'mollets-une-jambe-leste':['Sac à dos','De quoi le charger : disques, kettlebell, bouteilles','Marche ou rebord stable de 7 à 10 cm','Mur (appui)'],
 'rdl-kettlebell':['Kettlebell'],
 'kb-swings':['Kettlebell'],
 'bird-dog':['Tapis'],
 'dead-bug':['Tapis'],
 'pallof-press':['Élastique','Ancrage de porte à hauteur de poitrine'],
 'planche':['Tapis'],
 'planche-ballon':['Swiss ball','Tapis'],
 'gainage-lateral-jambe-levee':['Tapis'],
 'planche-genoux':['Tapis'],
 'cardio-bas-impact':[],
 'marche-continue':[],
 'tractions-assistees-supination':['Barre de traction','Élastique (assistance)'],
 'tractions-assistees-pronation':['Barre de traction','Élastique (assistance)'],
 'tractions-strictes-supination':['Barre de traction'],
 'tractions-strictes-pronation':['Barre de traction'],
 'etir-nuque':[],'etir-pecs':['Chambranle de porte'],'chat-vache':['Tapis'],
 'etir-hanches':['Tapis ou coussin'],'etir-ischios':['Marche basse'],'posture-enfant':['Tapis']
};
Object.keys(MAT).forEach(id=>{ if(DB[id]) DB[id].mat=MAT[id]; });

function sessionGear(plan){
  const out=[];
  const add=x=>{ if(x&&out.indexOf(x)<0) out.push(x); };
  plan.exos.forEach((id,i)=>{
    (DB[id].mat||[]).forEach(add);
    const e=DB[id], p=perfFor(id,plan.orig?plan.orig[i]!==id:false);
    if(e.mode==='load') out[out.indexOf('2 haltères')]='2 haltères chargés à '+fmtKg(p.load);
    if(e.mode==='fixed'&&p.load>10.01){
      const i=out.indexOf('Kettlebell'), lbl=loadLabelFor(id,p.load);
      if(i>=0) out[i]=lbl.charAt(0).toUpperCase()+lbl.slice(1);
    }
    /* la chip nomme ce qu il faut aller chercher, donc la realisation du profil
       et jamais la cle du niveau : « Bande bleue » et non « Bande n6 ».
       v2.10, accord de genre : PAL stocke le libelle de couleur au feminin,
       « elastique » est masculin. Les cinq concatenations disent « bande ».
       Les litteraux de MAT ne bougent pas : ils nomment l objet a aller
       chercher quand aucun barreau n est prescrit. L objet est un elastique,
       le barreau est une bande. */
    if(e.bnd&&p.band){
      const n=bandNom(p.band);
      if(e.bnd==='ass'){ const i=out.indexOf('Élastique (assistance)'); if(i>=0) out[i]='Bande '+n+' (assistance)'; }
      else if(p.band!=='aucune'){
        const i=out.indexOf('Élastique');
        if(i>=0) out[i]='Bande '+n;
        else add('Bande '+n+(id==='pompes-poignees'?' (dans le dos)':''));
      }
    }
  });
  if(plan.cardio) (DB[CARDIO_ID].mat||[]).forEach(add);
  return out;
}
/* Ligne d exercice, commune au panneau du jour et aux panneaux a venir. Le
   barreau de bande figure desormais sur la ligne : il etait dans les chips de
   materiel seulement, donc absent la ou on lit l exercice. */
/* v2.12 : la charge affichee est la charge COURANTE, sur tous les modes. Le
   mode fixe lisait e.load0, la charge de depart du catalogue : un goblet squat
   monte a 14 kg s affichait a 10 sur l accueil et sur tous les panneaux du
   carrousel, c est-a-dire exactement la card qui sert a preparer le materiel.
   Le libelle vient de l echelle, qui nomme le montage, kettlebell et lestes :
   la liste du materiel a sortir ne suffit pas a monter la charge. */
function exoLoadLabel(id,p){
  const e=DB[id];
  if(e.mode==='load') return fmtKg(p.load);
  if(e.mode==='fixed') return loadLabelFor(id,(p&&p.load)||e.load0);
  if(e.bnd==='ass'&&p.band) return 'bande '+bandNom(p.band);
  if(e.bnd==='res'&&p.band&&p.band!=='aucune') return 'bande '+bandNom(p.band);
  return '';
}
function exoRowHtml(id,opt){
  const o=opt||{}, e=DB[id], p=o.perf||perfFor(id,false);
  const cible=e.mode==='stretch'?'':(p.target||(p.range?p.range[0]:''))+' '+unitOf(e)+(e.side?' / côté':'');
  const bas=exoLoadLabel(id,p);
  const sous=esc(e.mus)+(o.dur?' · '+o.dur:'');
  return '<div class="exorow" onclick="showFiche(\''+id+'\',\'home\')">'+
    (typeof IMG!=='undefined'&&IMG[id]?'<img src="'+IMG[id]+'" alt="" loading="lazy">':'<span class="thumbph"></span>')+
    '<span class="ex"><b>'+esc(e.nom)+'</b>'+(o.tag||'')+'<span class="muted small">'+sous+'</span></span>'+
    '<span class="num small" style="text-align:right">'+cible+(bas?'<br>'+bas:'')+'</span></div>';
}
function gearListHtml(gear){
  return '<div class="muted small mt"><b>Matériel à sortir</b></div>'+
    '<div class="matlist">'+(gear.length?gear.map(g=>'<span class="chip">'+esc(g)+'</span>').join(''):'<span class="chip">Rien, poids du corps seul</span>')+'</div>';
}
/* Le materiel a sortir ne suffit pas quand deux exercices se disputent la meme
   ressource : il faudra changer le montage en cours de seance. Sur un panneau a
   venir, le nombre de changements n est pas dit, il depend du volume qui sera
   choisi ce jour-la. */
function remountHtml(exos,n){
  const rm=remountPairs({exos:exos});
  if(!rm.length) return '';
  return '<div class="vig" style="margin-top:10px">'+rm.map(g=>
    (g.gear==='halteres'?'Les haltères passent de ':'La kettlebell passe de ')+
    g.items.map(x=>fmtKg(x.load)+' ('+esc(DB[x.id].nom)+')').join(' à ')).join('. ')+
    (n?'. À changer '+n+' fois pendant la séance, compté dans le temps annoncé.':'.')+'</div>';
}
/* v1.18 : le detail de seance devient un carrousel. Premier panneau, la seance
   du jour, inchange. Suivants, les tirages a venir : les exercices, le materiel
   et le niveau actuel, sans duree, le volume de ces seances n etant pas encore
   choisi. Le nom du panneau courant occupe la ligne fermee de la card, ou la
   marque « allegee » figurait : celle-ci est deja dite deux fois, dans le
   bandeau de l accueil et dans l encart en tete du panneau du jour. */
function sessionDetailHtml(plan){
  const nSets=workSteps(plan.steps).length/SLOT_ORDER.length;
  const cool=plan.steps.filter(s=>s.cool);
  let jour=
    (plan.light?'<div class="vig" style="margin-top:10px">Séance allégée : les exercices qui ont une variante de repli sont remplacés, les autres voient leur cible réduite de 30 % sans descendre sous le bas de fourchette. Rien ne montera ni ne descendra à l\'issue de cette séance.</div>':'')+
    gearListHtml(sessionGear(plan));
  plan.exos.forEach((id,i)=>{
    const org=plan.orig?plan.orig[i]:id, p=perfFor(id,org!==id);
    const tag=!plan.light?'':(org!==id
      ? '<span class="tag flame" style="font-size:.68rem">repli de '+esc(DB[org].nom)+'</span>'
      : (p.repsCut||p.loadCut?'<span class="tag flame" style="font-size:.68rem">cible allégée</span>':''));
    jour+=exoRowHtml(id,{perf:p,tag:tag,dur:fmtDur(nSets*serieSec(id,plan.light))});
  });
  /* v2.15 : deux phrases constantes retirees d ici, « N series par exercice,
     plus le module cardio... » et « Touche un exercice pour sa fiche
     complete » : une information constante affichee a chaque lancement
     devient du bruit, motif qui a deja ecarte le resume de volume sur
     l accueil. La card de lancement porte deja le volume et les options. La
     ligne des etirements reste, raccourcie : elle porte une valeur qui change,
     les etirements du jour. */
  if(cool.length) jour+='<div class="muted small" style="margin-top:6px">Puis '+cool.map(s=>esc(DB[s.id].nom)).join(' et ')+' · '+fmtDur(cool.reduce((a,s)=>a+serieSec(s.id,false),0))+'</div>';
  jour+=remountHtml(plan.exos,remounts(plan).n);

  const N=aheadCount(), lbl=k=>k===0?'Aujourd\'hui':(k===1?'Séance suivante':'Dans '+k+' séances');
  let panes='<section class="carpane" data-i="0">'+jour+'</section>';
  for(let k=1;k<N;k++){
    const exos=drawAhead(k);
    panes+='<section class="carpane" data-i="'+k+'"><div class="futbody">'+
      '<div class="futhead">'+lbl(k)+'</div>'+
      '<div class="futnote">Cibles et charges à ton niveau actuel, avant séance du jour</div>'+
      gearListHtml(sessionGear({exos:exos,orig:exos,cardio:false}))+
      exos.map(id=>exoRowHtml(id)).join('')+
      remountHtml(exos,0)+
      '</div></section>';
  }
  /* ontoggle apres l attribut d ouverture : trois suites lisent la sequence
     `data-k="home-detail" open` pour dire si la card sort ouverte ou fermee. */
  return '<details class="card" data-k="home-detail"'+cardOpen('home-detail',true)+' ontoggle="carFit()">'+
    '<summary><span class="ttl">Détail de la séance</span><span class="val" id="carlbl">'+lbl(0)+'</span></summary>'+
    '<div class="carnav">'+
      '<button class="quiet cbtn off" id="carfirst" aria-label="Revenir à la séance du jour" onclick="carGo(0)">&laquo;</button>'+
      '<button class="quiet cbtn" id="carprev" aria-label="Séance précédente" onclick="carGo(carIdx-1)">&lsaquo;</button>'+
      '<div class="cdots" id="cardots">'+Array.from({length:N},(x,k)=>'<i class="'+(k?'':'on')+'"></i>').join('')+'</div>'+
      '<button class="quiet cbtn" id="carnext" aria-label="Séance suivante" onclick="carGo(carIdx+1)">&rsaquo;</button>'+
    '</div>'+
    '<div class="carstrip" id="carstrip" onscroll="carScroll()">'+panes+'</div>'+
  '</details>';
}
/* L index du carrousel ne va pas dans l etat : il repart a zero a chaque
   affichage de l accueil, sinon on y revient parque sur une seance a venir. */
let carIdx=0, carT=null, carAnim=0;
/* Duree du glissement d un panneau a l autre. Le defilement lisse natif, qui
   servait jusqu ici, ne se regle pas : le navigateur calcule sa duree depuis la
   distance, et un panneau fait toute la largeur du conteneur. Il en resultait
   pres d une demi-seconde pendant laquelle deux panneaux etaient visibles cote
   a cote, ce qui se lisait comme un remplacement lent et non comme une page
   tournee. Le mouvement est donc pilote ici, court et en deceleration. */
const CAR_MS=200;
function carGlide(st,to,ms){
  const from=st.scrollLeft, dx=to-from;
  if(!dx) return;
  const id=++carAnim;
  let t0=null;
  /* l accroche se bat avec une position ecrite image par image : on la coupe
     le temps du mouvement et on la remet a l arrivee */
  st.style.scrollSnapType='none';
  const step=t=>{
    if(id!==carAnim) return;
    if(t0===null) t0=t;
    const k=Math.min(1,(t-t0)/ms);
    st.scrollLeft=from+dx*(1-Math.pow(1-k,3));
    if(k<1) requestAnimationFrame(step);
    else st.style.scrollSnapType='';
  };
  requestAnimationFrame(step);
}
function carPanes(){ const st=$('#carstrip'); return st&&st.querySelectorAll?st.querySelectorAll('.carpane'):[]; }
/* Hauteur de la bande (defaut v1.18 corrige le 13 septembre 2026). Une bande
   flex prend la hauteur de son plus grand enfant, et les panneaux a venir sont
   systematiquement plus hauts que celui du jour : intitule, encart de niveau et
   marge de la barre valent une soixantaine de pixels que le panneau du jour n a
   pas. Le vide s ouvrait donc sous la derniere ligne de la seance du jour,
   jusqu a la card suivante, et il grandissait avec le plus grand des tirages a
   venir. La hauteur suit desormais le panneau affiche. Elle se mesure, elle ne
   se calcule pas : les vignettes ont une taille fixe en CSS, la mesure est
   stable avant meme leur decodage. Elle depend en revanche de
   `align-items:flex-start` sur la bande : sans lui, l alignement par defaut
   etire chaque panneau a la hauteur de la ligne, et un panneau interroge rend
   la hauteur du plus grand, celle-la meme qu on cherche a corriger. La premiere
   ecriture de carFit n avait pas cette propriete et se reecrivait sa propre
   hauteur, sans rien changer a l ecran. Une mesure nulle, card repliee, efface la
   consigne plutot que d ecraser la bande a zero, et `overflow-y:hidden` garantit
   qu une hauteur fausse ne capture jamais le defilement vertical de la page. */
function carFit(){
  const st=$('#carstrip'), p=carPanes();
  if(!st||!st.style||!p.length) return;
  const el=p[Math.max(0,Math.min(p.length-1,carIdx))];
  const h=el&&el.offsetHeight;
  st.style.height=h>0?h+'px':'';
}
function carSync(){
  const p=carPanes(), n=p.length; if(!n) return;
  carIdx=Math.max(0,Math.min(n-1,carIdx));
  const lab=$('#carlbl'); if(lab) lab.textContent=carIdx===0?'Aujourd\'hui':(carIdx===1?'Séance suivante':'Dans '+carIdx+' séances');
  const d=$('#cardots'); if(d&&d.children) for(let i=0;i<d.children.length;i++) d.children[i].className=(i===carIdx?'on':'');
  const f=$('#carfirst'); if(f) f.className='quiet cbtn'+(carIdx?'':' off');
}
function carGo(i){
  const p=carPanes(), n=p.length; if(!n) return;
  carIdx=Math.max(0,Math.min(n-1,i));
  const st=$('#carstrip'), to=p[carIdx].offsetLeft;
  if(st&&st.style&&typeof requestAnimationFrame==='function') carGlide(st,to,CAR_MS);
  else if(st&&typeof st.scrollLeft==='number') st.scrollLeft=to;
  carSync(); carFit();   /* la hauteur glisse avec le panneau, meme duree */
}
function carScroll(){
  const st=$('#carstrip'), p=carPanes(); if(!st||!p.length) return;
  clearTimeout(carT);
  carT=setTimeout(()=>{
    let best=0, d=Infinity;
    for(let i=0;i<p.length;i++){ const v=Math.abs(p[i].offsetLeft-st.scrollLeft); if(v<d){ d=v; best=i; } }
    if(best!==carIdx){ carIdx=best; carSync(); carFit(); }
  },60);
}
/* Ouvert par defaut depuis la v1.10 : la ligne fermee ne porte aucune valeur,
   contrairement a la regle des cards repliables, donc l etat ferme n etait pas
   un resume utile mais une information cachee. Son ouverture survit au rendu
   par le mecanisme commun des cards repliables (v1.14), qui a remplace le
   drapeau dedie. */
/* Bascule ponctuelle du mode allege : jamais un reglage, jamais persiste,
   remis a zero en fin de seance comme a l abandon. */
function toggleLight(){ lightMode=!lightMode; render(); }

```
## `app10.js`

Synchronisation entre appareils (v2.24) : métadonnées hors de l'état, envoi regroupé et en fin de séance, `keepalive` au passage en arrière-plan, reconnaissance de son propre envoi, récupération, conflit, attente plafonnée du lancement, card Synchronisation. Inerte sans clé ou hors `https`.

441 lignes, 22686 octets.

```javascript
/* ============ SYNCHRONISATION (v2.24) ============
   Hybride, local d abord. Sans cle, rien ici ne touche au reseau et l app se
   comporte exactement comme avant, export et import compris. Avec une cle,
   l etat entier part vers /api/state apres chaque enregistrement et revient a
   l ouverture quand l etat en ligne a change. Contrat de l API : carnet,
   section 5, et PALIER-backend.md.
   Pas de fusion : perf, slotIdx, unlocked et prevMin sont le produit sequentiel
   du moteur. Deux etats qui ont avance chacun de leur cote se departagent par
   une question, jamais par un melange.
   Les metadonnees vivent sous leur propre cle, hors de l etat : ni la cle ni
   l ETag ne passent dans un export ou dans l objet en ligne. Elles sont ecrites
   a chaque changement et lues une seule fois, au demarrage : les relire avant
   chaque echange ferait qu un second onglet reprenne la base du premier et
   ecrase son envoi sans conflit, alors qu avec sa propre base il recoit un 412
   et pose la question, ce qui est juste. */
const SYNC_KEY='palier-sync-v1', SYNC_URL='/api/state';
const SYNC_CALME=4000;      /* envoi regroupe : 4 s sans nouvel enregistrement */
const SYNC_ATTENTE=5000;    /* le lancement attend la synchronisation 5 s au plus */
const SYNC_DELAI=10000;     /* abandon d une requete */
const SYNC_REVOIR=5000;     /* retour au premier plan : pas deux verifications en 5 s */
const SYNC_FOCUS=30000;     /* focus de fenetre, sur ordinateur : une par 30 s */
const KEEPALIVE_MAX=65536;  /* plafond des requetes keepalive du navigateur */
const CLE_RE=/^[0-9A-HJKMNP-TV-Z]{20}$/;
/* sm : {cle, lie, base, baseVer, sale, gen, envoi:{id,gen}, derniere}
   base, baseVer : ETag et version de l etat en ligne dont le local descend
   sale          : modifie localement depuis base
   gen           : compteur d enregistrements, pour savoir si un envoi est a jour
   envoi         : dernier PUT tente ; son identifiant voyage dans le corps, ce
                   qui permet de reconnaitre son propre envoi quand la reponse
                   s est perdue (telephone verrouille juste apres la seance)
   lie           : la cle a ete acceptee une fois ; avant, rien n est ecrit */
let sm=null;
let syncEtat='', syncMsg='';     /* '', hors, indispo, refus, version, erreur */
let syncConflit=null;            /* {etat,etag,ver} : jamais persiste, recalcule */
let syncAttente=false;           /* le bouton de lancement attend */
let syncApres=false;             /* une verification est due au retour a l accueil */
let syncCorps=null, syncPrep=null, syncEnvoi=null, syncRelance=false, syncVerif=null;
let syncMin=null, syncMinAttente=null, syncVu=0, syncEcoute=false;

function syncDispo(){
  return typeof window!=='undefined'&&!!window.location&&window.location.protocol==='https:'&&
    typeof fetch==='function'&&typeof CompressionStream==='function'&&typeof Blob==='function'&&
    typeof Response==='function'&&typeof crypto!=='undefined'&&!!crypto&&!!crypto.subtle;
}
function syncOn(){ return !!(sm&&sm.cle&&sm.lie)&&syncDispo(); }
/* Saisie tolerante, forme canonique seule vers le serveur : casse, tirets,
   espaces, et les confusions I, L vers 1, O vers 0 du base32 de Crockford. */
function cleNorm(s){
  const c=String(s||'').toUpperCase().replace(/[\s-]+/g,'').replace(/[IL]/g,'1').replace(/O/g,'0');
  return CLE_RE.test(c)?c:null;
}
function verCmp(a,b){
  const x=String(a||'0').split('.').map(Number), y=String(b||'0').split('.').map(Number);
  for(let i=0;i<Math.max(x.length,y.length);i++){ const d=(x[i]||0)-(y[i]||0); if(d) return d>0?1:-1; }
  return 0;
}
async function smLire(){
  try{ const v=await store.get(SYNC_KEY); const o=v?JSON.parse(v):null; sm=(o&&o.cle&&o.lie)?o:null; }
  catch(e){ sm=null; }
}
function smEcrire(){ return store.set(SYNC_KEY,JSON.stringify(sm&&sm.lie?sm:null)); }

/* ---------- corps : l export, plus la version et l identifiant d envoi ----------
   L objet en ligne reste un fichier importable. Le corps se prepare des
   l enregistrement : au passage en arriere-plan, le navigateur peut geler la
   page avant la fin d une compression lancee a ce moment-la. */
function syncHex(b){ return Array.from(b,x=>x.toString(16).padStart(2,'0')).join(''); }
function syncId(){ const a=new Uint8Array(8); crypto.getRandomValues(a); return syncHex(a); }
async function syncCorpsDe(json){
  const flux=new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  const octets=new Uint8Array(await new Response(flux).arrayBuffer());
  return {octets,sha:syncHex(new Uint8Array(await crypto.subtle.digest('SHA-256',octets)))};
}
function syncPreparer(){
  const gen=sm.gen, id=syncId(), env={app:'palier',version:VERSION};
  /* appVersion explicite : un etat neuf jamais enregistre ne le porte pas, et
     le serveur refuse un etat sans version */
  const json=JSON.stringify(Object.assign({},env,state,{appVersion:VERSION},env,{envoi:id}));
  const p=syncCorpsDe(json).then(c=>{
    const r={gen,id,octets:c.octets,sha:c.sha};
    if(sm&&sm.gen===gen) syncCorps=r;
    return r;
  });
  syncPrep={gen,p};
  return p;
}
function syncCorpsCourant(){
  if(syncCorps&&syncCorps.gen===sm.gen) return Promise.resolve(syncCorps);
  if(syncPrep&&syncPrep.gen===sm.gen) return syncPrep.p;
  return syncPreparer();
}

/* ---------- appel ---------- */
async function syncAppel(m,h,corps,keep){
  const ac=typeof AbortController==='function'?new AbortController():null;
  const t=ac?setTimeout(()=>ac.abort(),SYNC_DELAI):null;
  try{
    const o={method:m,headers:Object.assign({'x-palier-key':sm.cle},h||{}),cache:'no-store'};
    if(corps) o.body=corps;
    if(keep) o.keepalive=true;
    if(ac) o.signal=ac.signal;
    return await fetch(SYNC_URL,o);
  }catch(e){ syncEtat='hors'; syncMsg=''; return null; }
  finally{ if(t) clearTimeout(t); }
}
function syncStatut(s){
  if(s===401){ syncEtat='refus'; syncMsg=''; }
  else if(s===429||s>=500){ syncEtat='indispo'; syncMsg=''; }
  else { syncEtat='erreur'; syncMsg=s===413?'état trop grand pour la synchronisation':'réponse '+s; }
  syncVue(true);
}
function syncOk(){ syncEtat=''; syncMsg=''; sm.derniere=new Date().toISOString(); smEcrire(); }

/* ---------- enregistrement local : marquer, preparer, regrouper ---------- */
function syncTouch(){
  if(!syncOn()) return;
  sm.gen=(sm.gen||0)+1; sm.sale=true; smEcrire();
  syncPreparer().catch(()=>{});
  clearTimeout(syncMin);
  syncMin=setTimeout(()=>{ syncMin=null; syncEnvoyer(); },SYNC_CALME);
  syncEntete();
}
/* fin de seance : envoi immediat, sans attendre le regroupement */
function syncFinSeance(){ if(syncOn()&&sm.sale) syncEnvoyer(); }

/* ---------- envoi ----------
   If-Match sur la base : l envoi ne remplace que l etat dont le local descend.
   Refuse vers une version en ligne superieure : l If-Match garantit qu on a vu
   l etat qu on remplace, donc sa version est baseVer. */
function syncEnvoyer(keep){
  if(!syncOn()||!sm.sale||syncConflit||syncEtat==='version'||syncEtat==='refus') return Promise.resolve();
  if(syncEnvoi){ syncRelance=true; return syncEnvoi; }
  if(sm.base&&verCmp(sm.baseVer,VERSION)>0){ syncEtat='version'; syncMsg=sm.baseVer; syncVue(true); return Promise.resolve(); }
  clearTimeout(syncMin); syncMin=null;
  syncEnvoi=(async()=>{
    let c;
    try{ c=await syncCorpsCourant(); }catch(e){ syncEtat='erreur'; syncMsg='compression impossible'; return; }
    if(!syncOn()) return;
    sm.envoi={id:c.id,gen:c.gen}; smEcrire();
    const h={'content-type':'application/octet-stream','x-amz-content-sha256':c.sha};
    if(sm.base) h['if-match']=sm.base; else h['if-none-match']='*';
    /* au-dela du plafond, un keepalive serait refuse d emblee : envoi normal,
       et si la page meurt avant, sale est persiste et l ouverture suivante
       rattrape l envoi */
    const r=await syncAppel('PUT',h,c.octets,!!keep&&c.octets.length<=KEEPALIVE_MAX);
    if(!r||!sm) return;
    if(r.status===200){
      let etag=r.headers.get('etag');
      if(!etag){ try{ etag=(await r.json()).etag; }catch(e){} }
      sm.base=etag; sm.baseVer=VERSION; sm.sale=sm.gen!==c.gen; sm.envoi=null;
      syncOk();
    } else if(r.status===412){
      sm.envoi=null; smEcrire();
      if(cur) syncApres=true; else setTimeout(()=>syncVerifier(),0);
    } else syncStatut(r.status);
  })().finally(()=>{
    syncEnvoi=null; syncEntete();
    if(syncRelance){ syncRelance=false; if(syncOn()&&sm.sale) syncEnvoyer(); }
  });
  return syncEnvoi;
}

/* ---------- verification ----------
   Jugee sur l ETag, jamais sur l horloge. La lecture peut se faire en seance ;
   l adoption jamais : une reponse qui arrive seance lancee est oubliee, et une
   verification neuve part au retour a l accueil. */
function syncVerifier(){
  if(!(sm&&sm.cle)||!syncDispo()) return Promise.resolve();
  if(syncVerif) return syncVerif;
  syncVerif=(async()=>{
    if(syncEnvoi) await syncEnvoi;
    if(!sm) return;
    const liaison=!sm.lie;
    const h={}; if(sm.base) h['if-none-match']=sm.base;
    const r=await syncAppel('GET',h);
    syncVu=Date.now();
    if(!sm) return;
    if(liaison){
      /* la cle n est enregistree qu une fois acceptee */
      if(!r){ sm=null; flash('Pas de réseau : clé non enregistrée, réessaie'); syncVue(true); return; }
      if(r.status===401){ sm=null; syncEtat=''; flash('Clé inconnue'); syncVue(true); return; }
      if(r.status===429||r.status>=500){ sm=null; syncEtat=''; flash('Service indisponible : réessaie dans un moment'); syncVue(true); return; }
      sm.lie=true; smEcrire(); flash('Synchronisation activée');
    }
    if(!r) { syncVue(false); return; }
    if(r.status===304){ syncOk(); syncVue(false); if(sm.sale) syncEnvoyer(); return; }
    if(r.status===404){
      if(sm.base){ syncDesactiver('Données en ligne supprimées : synchronisation désactivée sur cet appareil'); return; }
      /* rien en ligne : premier envoi, quel que soit l etat local */
      sm.sale=true; smEcrire(); syncVue(true); syncEnvoyer(); return;
    }
    if(r.status!==200){ syncStatut(r.status); return; }
    let v;
    try{ v=await r.json(); }catch(e){ syncEtat='erreur'; syncMsg='état en ligne illisible'; syncVue(true); return; }
    const etag=r.headers.get('etag');
    const ver=(v&&typeof v.appVersion==='string'&&v.appVersion)||r.headers.get('x-palier-version')||'';
    await syncRecu(v,etag,ver);
  })().finally(()=>{ syncVerif=null; syncFinAttente(); syncEntete(); });
  return syncVerif;
}
async function syncRecu(v,etag,ver){
  /* un client ancien ne connait pas les migrations d un etat plus recent :
     ni envoi, ni recuperation, rechargement demande */
  if(verCmp(ver,VERSION)>0){ syncEtat='version'; syncMsg=ver; syncVue(true); return; }
  /* son propre envoi, dont la reponse s est perdue */
  if(sm.envoi&&v&&v.envoi===sm.envoi.id){
    sm.base=etag; sm.baseVer=ver; sm.sale=sm.gen!==sm.envoi.gen; sm.envoi=null;
    syncOk(); syncVue(false);
    if(sm.sale) syncEnvoyer();
    return;
  }
  if(cur){ syncApres=true; return; }
  if(!sm.sale){ await syncAdopter(v,etag,ver); return; }
  syncConflit={etat:v,etag,ver}; syncVue(true);
}
/* Recuperation : memes gardes et memes migrations qu un import, sans toucher a
   lastImport. L enregistrement local passe par save(), qui marque l etat comme
   modifie ; sale retombe juste apres, et l envoi programme ne part donc pas. */
async function syncAdopter(v,etag,ver){
  if(!v||v.app!=='palier'||typeof v.xp!=='number'||!Array.isArray(v.hist)){
    syncEtat='erreur'; syncMsg='état en ligne invalide'; syncVue(true); return;
  }
  const s=Object.assign(defaultState(),v);
  delete s.envoi;
  migrateState(s,v);
  state=s;
  syncProfil();
  await save();
  sm.base=etag; sm.baseVer=ver; sm.sale=false; sm.envoi=null; syncConflit=null;
  syncOk();
  applyTheme();
  if(!cur) render();
  const h=state.hist, d=h.length?h[h.length-1].date:null;
  flash(d?'Progression récupérée : dernière séance le '+fmtDT(d).slice(6)+' à '+fmtHM(d):'Progression récupérée');
}

/* ---------- conflit : la question dans la page ---------- */
function syncGarder(){
  const c=syncConflit; if(!c||!syncOn()) return;
  /* on remplace exactement l etat qu on a vu ; hors ligne, l envoi attend */
  sm.base=c.etag; sm.baseVer=c.ver; sm.sale=true; syncConflit=null; smEcrire();
  syncVue(true);
  syncEnvoyer();
}
async function syncPrendre(){
  const c=syncConflit; if(!c||!syncOn()) return;
  syncConflit=null;
  await syncAdopter(c.etat,c.etag,c.ver);
}

/* ---------- lancement de seance ----------
   Il attend la verification 5 s au plus, puis part sans elle : la seance ne
   depend jamais du reseau au-dela. Un conflit ou une version plus recente
   remplacent le bouton, parce que lancer creerait une divergence de plus. */
function syncBloque(){ return syncOn()&&(syncAttente||!!syncConflit||syncEtat==='version'); }
function syncDebutAttente(){
  if(typeof navigator!=='undefined'&&navigator&&navigator.onLine===false){ syncEtat='hors'; syncEntete(); return false; }
  syncAttente=true;
  clearTimeout(syncMinAttente);
  syncMinAttente=setTimeout(()=>{ syncMinAttente=null; syncFinAttente(); },SYNC_ATTENTE);
  syncVue(true);
  return true;
}
function syncFinAttente(){
  if(!syncAttente) return;
  syncAttente=false; clearTimeout(syncMinAttente); syncMinAttente=null;
  syncVue(true);
}
function syncControle(delai){
  if(!syncOn()) return;
  if(cur){ if(sm.sale) syncEnvoyer(); return; }
  if(delai&&Date.now()-syncVu<delai) return;
  if(syncVerif) return;
  if(!syncDebutAttente()) return;
  syncVerifier();
}
/* appele au rendu de l accueil : une reponse ecartee pendant la seance */
function syncReprise(){
  if(!syncApres||cur||!syncOn()) return;
  syncApres=false;
  setTimeout(()=>syncControle(0),0);
}
function syncCache(){ if(syncOn()&&sm.sale) syncEnvoyer(true); }

/* ---------- affichage ---------- */
const SYNC_BLOC='<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px">';
function syncCote(s){
  const h=(s&&Array.isArray(s.hist))?s.hist:[], d=h.length?h[h.length-1].date:null;
  return h.length+' séance'+(h.length>1?'s':'')+(d?', dernière le '+fmtDT(d).slice(6)+' à '+fmtHM(d):'');
}
function syncConflitHtml(){
  return SYNC_BLOC+'<b class="small">Deux versions ont avancé chacune de leur côté</b>'+
    '<div class="muted small mt">Pas de fusion possible : choisis celle qui continue, l\'autre est remplacée.</div>'+
    '<div class="small mt"><b>Cet appareil</b> : '+syncCote(state)+'</div>'+
    '<div class="small"><b>En ligne</b> : '+syncCote(syncConflit.etat)+'</div>'+
    '<div class="seg mt"><button onclick="syncGarder()">Garder cet appareil</button>'+
    '<button class="ghost" onclick="syncPrendre()">Prendre la version en ligne</button></div></div>';
}
function syncVersionHtml(){
  return SYNC_BLOC+'<b class="small">Version plus récente en ligne</b>'+
    '<div class="muted small mt">Ta progression a été enregistrée par PALIER v'+esc(syncMsg)+', cette page est en v'+VERSION+
    '. Recharge la page pour passer à la nouvelle version : rien n\'est perdu.</div>'+
    '<button class="mt" onclick="syncRecharger()">Recharger</button></div>';
}
function syncRecharger(){ try{ window.location.reload(); }catch(e){} }
/* ce qui remplace le bouton de lancement, ou rien */
function syncLancement(){
  if(!syncOn()) return '';
  if(syncEtat==='version') return syncVersionHtml();
  if(syncConflit) return syncConflitHtml();
  if(syncAttente) return '<button class="big mt" disabled>Synchronisation…</button>';
  return '';
}
function syncIlya(iso){
  const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);
  if(m<1) return 'à l\'instant';
  if(m<60) return 'il y a '+m+' min';
  if(m<24*60) return 'il y a '+Math.floor(m/60)+' h';
  const j=dayGap(iso);
  return j<=1?'hier':'il y a '+j+' j';
}
function syncLibelle(){
  if(!syncDispo()) return 'Indisponible ici';
  if(!sm||!sm.cle) return 'Désactivée';
  if(!sm.lie) return 'Vérification…';
  if(syncEtat==='refus') return 'Clé refusée';
  if(syncEtat==='version') return 'Mise à jour requise';
  if(syncConflit) return 'Conflit';
  if(syncEtat==='hors') return 'Hors ligne';
  if(syncEtat==='indispo') return 'Service indisponible';
  if(syncEtat==='erreur') return 'Erreur';
  if(sm.sale) return 'Envoi en attente';
  return sm.derniere?syncIlya(sm.derniere):'Activée';
}
function syncPhrase(){
  const d=sm.derniere?'Dernière synchronisation le '+fmtDT(sm.derniere).slice(6)+' à '+fmtHM(sm.derniere)+'.':'Pas encore synchronisé.';
  const x={hors:'Pas de réseau : les modifications partiront au retour de la connexion.',
    indispo:'Service momentanément indisponible : nouvel essai au prochain enregistrement ou au retour sur la page.',
    erreur:'Échec de la synchronisation'+(syncMsg?' : '+esc(syncMsg):'')+'.'}[syncEtat];
  return d+(x?' '+x:(sm.sale?' Modifications en attente d\'envoi.':''));
}
function syncSaisie(bouton){
  return '<div class="mt"><input id="synccle" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40" '+
    'placeholder="XXXXX-XXXXX-XXXXX-XXXXX" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-family:var(--mono)">'+
    '<button class="mt" onclick="syncActiver()">'+bouton+'</button></div>';
}
function syncCard(){
  const info='<div class="muted small mt">Garde la même progression sur plusieurs appareils. Tes données, signalements de douleur compris, '+
    'sont stockées chez AWS à Paris, chiffrées au repos et transmises en HTTPS. Ta clé y donne accès, et Gabriel, qui administre le service, peut les lire.</div>';
  let b;
  if(!syncDispo()) b='<div class="muted small mt">Disponible seulement sur palier.s1t3.link, dans un navigateur récent.</div>';
  else if(!sm||!sm.cle) b=syncSaisie('Activer')+
    '<div class="muted small mt">Saisis la clé avant la première séance sur un nouvel appareil : une séance jouée sans elle part d\'un état vide et ne se rattache pas.</div>';
  else if(!sm.lie) b='<div class="muted small mt">Vérification de la clé…</div>';
  else if(syncEtat==='refus') b='<div class="muted small mt">Clé refusée : elle a été révoquée ou remplacée. Saisis la nouvelle, tes modifications en attente partiront avec elle.</div>'+
    syncSaisie('Remplacer la clé')+syncBoutons();
  else b='<div id="syncetat" class="muted small mt">'+syncPhrase()+'</div>'+
    (syncEtat==='version'?syncVersionHtml():'')+(syncConflit?syncConflitHtml():'')+syncBoutons();
  return setCard('Synchronisation',syncLibelle(),info+b);
}
function syncBoutons(){
  if(uiAsk==='syncoff') return SYNC_BLOC+'<b class="small">Désactiver sur cet appareil ?</b>'+
    '<div class="muted small mt">Ta progression reste ici et en ligne. Garde ta clé : elle sera redemandée pour réactiver.'+
    (sm.sale?' Les modifications pas encore envoyées resteront sur cet appareil seulement.':'')+'</div>'+
    '<div class="seg mt"><button onclick="syncDesactiverOK()">Désactiver</button><button class="quiet" onclick="uiAskSet(\'syncoff\')">Annuler</button></div></div>';
  if(uiAsk==='syncdel') return SYNC_BLOC+'<b class="small">Supprimer tes données en ligne ?</b>'+
    '<div class="muted small mt">Toutes les versions sont effacées, définitivement. Cet appareil garde sa progression et la synchronisation s\'y désactive ; les autres appareils la désactiveront à leur prochaine connexion.</div>'+
    '<div class="seg mt"><button class="danger" onclick="syncSupprimerOK()">Supprimer</button><button class="quiet" onclick="uiAskSet(\'syncdel\')">Annuler</button></div></div>';
  return '<div class="seg mt"><button class="ghost" onclick="uiAskSet(\'syncoff\')">Désactiver</button>'+
    '<button class="danger" onclick="uiAskSet(\'syncdel\')">Supprimer mes données en ligne</button></div>';
}
/* Un changement de structure redessine l accueil ou les reglages ; un simple
   changement d etat ne touche que l en-tete et la phrase de la card, pour ne
   pas vider un champ en cours de saisie. */
function syncVue(structure){
  if(typeof document==='undefined') return;
  if(structure&&!cur&&(view==='home'||view==='set')){ render(); return; }
  syncEntete();
}
function syncEntete(){
  if(typeof document==='undefined'||view!=='set') return;
  try{
    const e=document.querySelector('details[data-k="set-synchronisation"] .val'); if(e) e.textContent=syncLibelle();
    const p=document.querySelector('#syncetat'); if(p&&sm&&sm.lie) p.innerHTML=syncPhrase();
  }catch(e){}
}

/* ---------- actions de la card ---------- */
async function syncActiver(){
  if(!syncDispo()) return;
  const el=document.querySelector('#synccle'), c=cleNorm(el&&el.value);
  if(!c){ flash('Clé invalide : 20 caractères attendus'); return; }
  if(sm&&sm.lie){
    /* cle remplacee, meme identifiant : la base et les modifications en
       attente restent valables */
    sm.cle=c; syncEtat=''; smEcrire(); syncVue(true);
    await syncVerifier(); return;
  }
  /* premiere liaison : rien en ligne, envoi ; rien en local, recuperation ;
     les deux, la question. sale porte « quelque chose en local ». */
  sm={cle:c,lie:false,gen:0,sale:state.hist.length>0};
  syncEtat=''; syncConflit=null; syncVue(true);
  await syncVerifier();
}
function syncDesactiver(msg){
  sm=null; smEcrire();
  syncEtat=''; syncMsg=''; syncConflit=null; syncApres=false; syncCorps=null; syncPrep=null;
  clearTimeout(syncMin); syncMin=null;
  syncAttente=false; clearTimeout(syncMinAttente); syncMinAttente=null;
  syncVue(true);
  if(msg) flash(msg);
}
function syncDesactiverOK(){ uiAsk=null; syncDesactiver('Synchronisation désactivée sur cet appareil'); }
async function syncSupprimerOK(){
  uiAsk=null;
  if(!syncOn()) return;
  const r=await syncAppel('DELETE');
  if(r&&r.status===204){ syncDesactiver('Données en ligne supprimées'); return; }
  if(r) syncStatut(r.status); else syncVue(true);
  flash('Suppression impossible : '+(r?'réponse '+r.status:'pas de réseau'));
}

/* ---------- demarrage et evenements ---------- */
function syncDemarrer(){
  if(!syncDispo()) return;
  if(!syncEcoute){
    syncEcoute=true;
    try{
      document.addEventListener('visibilitychange',()=>{
        if(document.visibilityState==='hidden') syncCache(); else syncControle(SYNC_REVOIR);
      });
      window.addEventListener('pagehide',syncCache);
      window.addEventListener('focus',()=>syncControle(SYNC_FOCUS));
      window.addEventListener('online',()=>syncControle(0));
    }catch(e){}
  }
  return smLire().then(()=>{ syncEntete(); syncControle(0); });
}
if(typeof window!=='undefined'){
  Object.assign(window,{syncActiver,syncGarder,syncPrendre,syncDesactiverOK,syncSupprimerOK,syncRecharger});
}
```
## `app8.js`

Réglages, card Matériel et ses contrôles, questions posées dans la page, clavier, routeur, initialisation.

762 lignes, 50968 octets.

```javascript
/* ============ REGLAGES ============ */
/* Fourchette de duree d une option (v1.14). Reglages annonçait une moyenne sur
   tous les exercices des viviers, verrouilles compris, alors qu ils ne peuvent
   pas etre tires : le chiffre etait systematiquement bas et ne retombait pas
   sur celui de l accueil. Et une moyenne ne dit rien quand le cout d une serie
   va de 31 a 70 s selon l exercice. On balaie donc les tirages reellement
   possibles, remontages compris, et on annonce les deux bornes. Le cout de
   chaque exercice ne depend pas de la combinaison : on le calcule une fois. */
function poolsFor(){
  return SLOT_ORDER.map(s=>{
    const p=SLOTS[s].pool.filter(id=>!isLocked(id)&&!estRetire(id));   /* meme filtre que pickFromPool */
    return p.length?p:[SLOTS[s].pool[0]];
  });
}
function warmSecOf(warm){
  return warm==='aucun'?0:(warm==='court'?WARM_SHORT.reduce((a,i)=>a+WARMUP[i].s,0)
                                          :WARMUP.reduce((a,x)=>a+x.s,0));
}
function comboRemounts(pick,rounds){
  const last={}; let n=0;
  for(let r=0;r<rounds;r++) for(let i=0;i<pick.length;i++){
    const id=pick[i], k=gearKey(id); if(!k) continue;
    const c=prescLoad(id);
    if(last[k]!=null&&Math.abs(last[k]-c)>0.01) n++;
    last[k]=c;
  }
  return n;
}
function sessionSpan(rounds,cardio,warm,trans){
  const w=warmSecOf(warm), tr=(trans==null?transSec():trans);
  const pools=poolsFor(), n=pools.length;
  const cool=(state.stretch!==false)?stretchesFor().reduce((a,id)=>a+serieSec(id,false),0):0;
  /* Les rounds*n-1 repos d une seance ne sont pas tous au meme tarif :
     rounds-1 d entre eux sont des raccords de tour, le dernier n etant pas
     emis, et les rounds*(n-1) autres des transitions. Sans cette separation,
     la fourchette annoncee ici s ecarterait de l estimation de l accueil.
     v2.11 : le tarif du raccord depend de la paire, donc il se calcule dans
     l enumeration et non dans la base. Liste vide, les deux bornes retombent
     sur la formule d avant la v2.10, ce qui est le comportement voulu. */
  const base=w+rounds*(n-1)*tr+(cardio?CARDIO_SEC:0)+cool;
  const cost={};
  pools.forEach(p=>p.forEach(id=>{ if(cost[id]==null) cost[id]=serieSec(id,false); }));
  let lo=Infinity, hi=0;
  const pick=new Array(n);
  (function walk(i,sum){
    if(i===n){
      const rac=(rounds-1)*(pauseAu(pick[n-1],pick[0])?PAUSE_TOUR:tr);
      const sec=base+rac+rounds*sum+comboRemounts(pick,rounds)*REMOUNT;
      if(sec<lo) lo=sec;
      if(sec>hi) hi=sec;
      return;
    }
    pools[i].forEach(id=>{ pick[i]=id; walk(i+1,sum+cost[id]); });
  })(0,0);
  if(lo===Infinity) lo=hi=base;
  return {min:Math.round(lo/60),max:Math.round(hi/60),rounds:rounds};
}
/* libelle des postes reellement inclus dans le chiffre annonce : il suivait
   les options dans le calcul mais pas dans la phrase, qui parlait toujours
   d echauffement et d etirements compris (v1.14) */
function partsLabel(warm,cardio,stretch){
  const inc=[];
  if(warm==='complet') inc.push('échauffement complet');
  else if(warm==='court') inc.push('échauffement court');
  if(cardio) inc.push('cardio');
  if(stretch) inc.push('étirements');
  if(!inc.length) return 'exercices seuls';
  const s=inc.length>1?inc.slice(0,-1).join(', ')+' et '+inc[inc.length-1]:inc[0];
  return (warm==='aucun'?'sans échauffement, ':'')+s+' compris';
}
function spanLbl(s){ return s.min===s.max?s.min+' min':s.min+' à '+s.max+' min'; }
function weeklySets(){
  /* series hebdomadaires par groupe musculaire, a l objectif hebdo courant.
     La structure alternee garantit un exercice de chaque groupe a chaque
     seance : le volume par groupe est donc le volume par exercice. */
  return roundsOf(state)*state.goal;
}
/* Card de reglage repliable. Fermee, la ligne porte la valeur courante :
   l etat complet de la configuration se lit sans un seul clic, on n ouvre
   que pour modifier ou relire la justification. */
function setCard(titre,valeur,contenu){
  const k='set-'+titre.replace(/[^0-9A-Za-zÀ-ÿ]+/g,'-').toLowerCase();
  return '<details class="card" data-k="'+k+'"'+cardOpen(k,false)+'><summary><span class="ttl">'+titre+'</span><span class="val">'+valeur+'</span></summary>'+contenu+'</details>';
}
/* ============ CONTROLES DE LA CARD MATERIEL (v2.0) ============
   Plus aucun dialogue systeme et plus aucun bouton dont l etat est un mot.
   Un interrupteur porte la presence, une pastille porte la realisation d un
   niveau, un couple moins-plus porte un nombre. Tous vivent dans la meme
   colonne de droite, celle des controles : c est la position qui dit qu une
   chose se touche, pas une phrase d explication.
   Les questions ouvertes, nommer un profil, en supprimer un, tout remettre a
   zero, quitter une seance, passent par un etat ponctuel qui n entre jamais
   dans state : il ne survit ni au changement de vue ni au rechargement. */
let uiAsk=null;          /* question en cours : 'newprofil', 'delprofil', 'reset', 'syncoff', 'syncdel' */
function uiAskSet(k){ uiAsk=(uiAsk===k)?null:k; pfSrc=''; pfNom=''; render(); }
function uiVal(id){ const el=$('#'+id); return el?String(el.value||'').trim():''; }
function toggleRes(k){
  state.gear.res=state.gear.res||{};
  state.gear.res[k]=state.gear.res[k]?0:1;
  save(); render();
}
/* Un niveau tenu, c est une realisation non vide : choisir une couleur declare
   la presence, choisir « je n ai pas cette bande ici » la retire. Une seule
   donnee, donc aucun etat a memoriser pour un niveau absent. */
function setBandReal(id,c){
  state.gear.bands=state.gear.bands||{};
  state.gear.bands[id]=c||'';
  syncPresence('elast');
  bandPick=null;
  save(); render();
}
/* Invariant des sections a presence derivee (v2.1). L interrupteur de section
   est un masque non destructif, comme celui des halteres sur les disques : il
   cache sans effacer, donc le relever restitue exactement ce qui etait
   declare. Reste un etat qui mentirait, « leve et vide » : declarer quelque
   chose leve le drapeau, retirer le dernier element le baisse, et
   l interrupteur ne s affiche pas tant que la section est vide, puisqu il n y
   a rien a masquer. */
function syncPresence(k){
  state.gear.res=state.gear.res||{};
  const plein=k==='elast'?ownedBands(state.gear).length>0
    :k==='cuff'?CUFF_W.some(w=>(state.gear.cuffs||{})[w])
    :kbOwned(state.gear).length>0;
  state.gear.res[k]=plein?1:0;
}
let bandPick=null;
function toggleBandPick(id){ bandPick=(bandPick===id)?null:id; render(); }
/* Un type de disque entre a QUATRE exemplaires et non a deux. Mesure : le stock
   se divise par le nombre de barres puis par les deux extremites, si bien qu un
   type a deux exemplaires ne produit aucun montage symetrique et laisse
   l echelle de progression inchangee, 23 paliers. A quatre, elle passe a 30 et
   le sommet de 14,5 a 17,5 kg. Ajouter un type doit faire quelque chose. */
function addPlate(w){
  state.gear.plates=state.gear.plates||{};
  state.gear.plates[w]=(state.gear.plates[w]||0)+4;
  save(); render();
}
let pfSrc='';        /* source d inventaire choisie, ephemere comme uiAsk */
let pfNom='';        /* saisie reportee : choisir une source declenche un rendu */
/* Choisir une source est un clic, donc un rendu, donc la saisie serait perdue :
   on la releve avant et le champ se reecrit avec. Meme raison que la lecture
   au clic, jamais a la frappe. */
function pfPick(id){
  pfNom=uiVal('pfnom');
  pfSrc=(pfSrc===id)?'':id;
  render();
}
function newProfilOK(){
  const v=uiVal('pfnom')||pfNom;
  if(!v){ flash('Donne un nom à ce profil'); return; }
  const src=pfSrc; uiAsk=null; pfSrc=''; pfNom='';
  addProfil(v,src);
}
function renameProfilOK(){
  const v=uiVal('pfren');
  if(!v){ flash('Donne un nom à ce profil'); return; }
  uiAsk=null; renameProfil(profilId(),v);
}
function delProfilOK(){ const id=profilId(); uiAsk=null; delProfil(id); }
/* Ouvrir la card Materiel et s y rendre. L ouverture s ecrit dans le HTML au
   moment ou la card s ecrit (v1.14), donc on la pose avant le rendu ; le
   defilement, lui, ne peut avoir lieu qu apres, la card n existant pas encore. */
function goMateriel(){
  pendingCard='set-matériel';
  go('set');            /* rend la vue, PUIS remonte en haut */
  scrollToCard();       /* le trajet vers la card doit donc venir apres go() */
}
/* meme mecanique pour le lien que porte chaque fiche (v2.12) */
function goComment(){
  pendingCard='set-comment-ça-marche';
  go('set');
  scrollToCard();
}
let pendingCard=null;
function scrollToCard(){
  if(!pendingCard) return;
  const k=pendingCard; pendingCard=null;
  try{
    const el=document.querySelector('details[data-k="'+k+'"]');
    if(el&&el.scrollIntoView) el.scrollIntoView({block:'start'});
  }catch(e){}
}
/* ============ CARD MATERIEL (v2.0) ============
   Une section par ressource. Le switch porte la presence, le depliage porte le
   detail, le chevron est celui des autres cards de Reglages. La chip du profil
   est en tete : elle ferme le piege « je modifie l inventaire de chez Marc en
   croyant etre chez moi ». Les deux compteurs sont en pied, schemas servis et
   progressions disponibles.
   Le switch vit dans le summary et arrete la propagation : sans cela il
   deplierait la section qu il eteint. */
function swHtml(on,fn,lbl){
  return '<button class="sw'+(on?' on':'')+'" role="switch" aria-checked="'+(on?'true':'false')+'" aria-label="'+esc(lbl)+'"'+
    ' onclick="event.preventDefault();event.stopPropagation();'+fn+'"><i></i></button>';
}
function stepHtml(fn,val,lblM,lblP){
  return '<span class="row"><button class="quiet" style="padding:4px 10px" onclick="'+fn+'(-1)" aria-label="'+esc(lblM)+'">−</button>'+
    '<b class="num">'+val+'</b><button class="quiet" style="padding:4px 10px" onclick="'+fn+'(1)" aria-label="'+esc(lblP)+'">+</button></span>';
}
/* section repliable interne a la card : meme chevron, cle d ouverture propre */
function matSec(k,titre,sous,ctl,detail){
  return '<details class="msec" data-k="mat-'+k+'"'+cardOpen('mat-'+k,false)+'>'+
    '<summary><span class="mtit"><b>'+esc(titre)+'</b>'+(sous?'<span class="muted small">'+sous+'</span>':'')+'</span>'+
    (ctl||'')+'</summary>'+
    '<div class="mdet">'+detail+'</div></details>';
}
function resRow(k){
  return '<div class="histline"><span class="mtit"><b style="font-weight:400">'+esc(RES_LBL[k])+'</b>'+
    (RES_SUB[k]?'<span class="muted small">'+esc(RES_SUB[k])+'</span>':'')+'</span>'+
    swHtml(aRes(k),'toggleRes(\''+k+'\')',RES_LBL[k])+'</div>';
}
function halDetail(){
  const L=loadLadderProg(state.gear), A=loadLadder(state.gear);
  const rest=PLATE_W.filter(w=>!(state.gear.plates||{})[w]);
  let ecart=null;
  for(let i=1;i<L.length;i++){ const d=Math.round((L[i]-L[i-1])*100)/100; if(ecart==null||d<ecart) ecart=d; }
  return '<div class="histline"><span>Barres de '+fmtKg(state.gear.bar)+'</span><span class="num">× '+state.gear.bars+'</span></div>'+
    PLATE_W.filter(w=>(state.gear.plates||{})[w]).map(w=>
      '<div class="histline"><span>Disques de '+fmtNum(parseFloat(w))+' kg</span><span class="row">'+
      '<button class="quiet" style="padding:4px 10px" onclick="adjPlate(\''+w+'\',-2)" aria-label="Deux disques de moins">−</button>'+
      '<b class="num">'+state.gear.plates[w]+'</b>'+
      '<button class="quiet" style="padding:4px 10px" onclick="adjPlate(\''+w+'\',2)" aria-label="Deux disques de plus">+</button>'+
      '</span></div>').join('')+
    '<div class="histline"><span>Disques max par extrémité <span class="muted small">sécurité manchon</span></span>'+
    stepHtml('adjMaxEnd',(state.gear.maxPerEnd||5),'Un disque de moins par extrémité','Un disque de plus par extrémité')+'</div>'+
    (rest.length?'<div class="histline"><span class="muted small">Ajouter un type de disque</span><span class="chipline" style="justify-content:flex-end">'+
      rest.map(w=>'<button class="ghost" style="padding:4px 10px;font-size:.78rem" onclick="addPlate(\''+w+'\')">'+fmtNum(parseFloat(w))+' kg</button>').join('')+'</span></div>':'')+
    (L.length>1
      ? '<div class="muted small mt"><b>'+L.length+' paliers de progression</b>, de '+fmtKg(L[0])+' à '+fmtKg(L[L.length-1])+
        ', plus petit écart '+fmtKg(ecart)+'. Haltère seul, tout le stock : jusqu\'à '+fmtKg(loadLadderMono(state.gear).slice(-1)[0]||0)+'.</div>'+
        '<div class="muted small">L\'échelle complète, ajustement à la main et séance allégée, compte '+A.length+' paliers : elle admet un disque sur une seule extrémité, que le cliquet automatique n\'emprunte pas.</div>'
      : '<div class="muted small mt">Aucun disque déclaré : les barres seules donnent '+fmtKg(A[0]||0)+'.</div>');
}
function bandDetail(){
  return '<div class="muted small">Un niveau est un cran de tension. Tape la pastille pour dire quelle bande le tient ici.</div>'+
    BANDS.map(b=>{
      const r=bandReal(b.id), h=coulHex(r);
      return '<div class="histline"'+(r?'':' style="opacity:.55"')+'><span class="mtit"><b style="font-weight:400">'+esc(b.lbs)+'</b>'+
        '<span class="muted small">Niveau '+bandRang(b.id)+(r?' · bande '+esc(coulLbl(r)):' · non tenu ici')+'</span></span>'+
        '<button class="pastille" onclick="toggleBandPick(\''+b.id+'\')" aria-label="Bande du niveau '+bandRang(b.id)+'">'+
        '<i'+(h?' style="background:'+h+'"':' class="vide"')+'></i></button></div>'+
        (bandPick===b.id
          ? '<div class="nuancier">'+PAL.map(c=>'<button class="teinte" style="background:'+c[2]+'" onclick="setBandReal(\''+b.id+'\',\''+c[0]+'\')" aria-label="'+c[1]+'"></button>').join('')+
            '<div><button class="ghost" style="padding:5px 12px;font-size:.78rem;border-style:dashed" onclick="setBandReal(\''+b.id+'\',\'\')">Je n\'ai pas cette bande ici</button></div></div>'
          : '');
    }).join('')+
    (function(){
      const d=[];
      BANDS.forEach(b=>{ const r=bandReal(b.id); if(r&&bandDouble(b.id,state.gear)&&d.indexOf(r)<0) d.push(r); });
      return d.length?'<div class="muted small mt">Deux niveaux partagent la couleur '+esc(coulLbl(d[0]))+' : les prescriptions préciseront lequel, « bande '+esc(coulLbl(d[0]))+', niveau 4 ».</div>':'';
    })()+
    '<div class="muted small mt">En résistance, progresser monte l\'échelle ; en assistance aux tractions, progresser la descend. Chez quelqu\'un d\'autre, déclare sa bande sur le niveau dont la tension se rapproche le plus : c\'est ton jugement qui fait la correspondance, ta position par rapport à l\'ancrage règle le reste.</div>'+
    '<div class="muted small mt">Avant chaque séance de tractions : inspecter la bande tendue (micro-fissures, zones blanchies ou mates), jamais au-delà de 2,5 fois la longueur de repos, jamais d\'ancrage sur arête vive.</div>';
}
function kbDetail(){
  const owned=kbOwned(state.gear), rest=KB_W.filter(w=>!(state.gear.kbs||{})[w]);
  return owned.map(k=>'<div class="histline"><span>Kettlebell de '+fmtNum(k)+' kg</span>'+
      swHtml(true,'toggleKb(\''+k+'\')','Kettlebell de '+fmtNum(k)+' kg')+'</div>').join('')+
    (rest.length?'<div class="histline"><span class="muted small">Ajouter une kettlebell</span><span class="chipline" style="justify-content:flex-end">'+
      rest.map(w=>'<button class="ghost" style="padding:4px 10px;font-size:.78rem" onclick="addKb(\''+w+'\')">'+fmtNum(parseFloat(w))+' kg</button>').join('')+'</span></div>':'')+
    (owned.length
      ? '<div class="muted small mt">Goblet squat, soulevé roumain et swings : '+fixedLadder('goblet-squat',state.gear).length+' barreaux, de '+
        fmtKg(fixedLadder('goblet-squat',state.gear)[0].v)+' à '+fmtKg(fixedLadder('goblet-squat',state.gear).slice(-1)[0].v)+
        '. Les lestes ne comblent que l\'intervalle jusqu\'à la kettlebell suivante : à total égal, c\'est toujours la kettlebell la plus lourde qui est prescrite.</div>'
      : '<div class="muted small mt">Aucune kettlebell déclarée : les exercices qui en dépendent passent sur leur substitut.</div>');
}
function addKb(w){
  state.gear.kbs=state.gear.kbs||{};
  state.gear.kbs[w]=1;
  syncPresence('kb');
  save(); render();
}
function cuffDetail(){
  const s2=cuffSteps(state.gear,2).filter(v=>v>0);
  return CUFF_W.map(w=>'<div class="histline"><span>Paire de '+fmtNum(parseFloat(w))+' kg</span>'+
      swHtml(!!(state.gear.cuffs||{})[w],'toggleCuff(\''+w+'\')','Paire de '+w+' kg')+'</div>').join('')+
    (s2.length
      ? '<div class="muted small mt">Superposables sur un même membre : ils ajoutent '+s2.map(v=>fmtNum(v)).join(' · ')+' kg aux exercices à kettlebell, deux poignets comptés.</div>'
      : '<div class="muted small mt">Aucun leste déclaré : les exercices à kettlebell restent à 10 kg.</div>');
}
function matCardHtml(){
  const c=schemasServis(state.gear), pr=progDispo(state.gear), perdus=schemasPerdus(state.gear);
  const nb=BANDS.filter(b=>bandReal(b.id)).length;
  return '<div class="chipline" style="margin:2px 0 8px"><span class="chip prof">'+esc(profilNom())+'</span></div>'+
    '<div class="muted small">Ce que tu as ici. Le mobilier n\'est pas déclaré : chaise, mur et tapis sont supposés présents partout.</div>'+

    matSec('hal','Haltères réglables',
      aRes('hal')?(loadLadderProg(state.gear).length+' paliers · jusqu\'à '+fmtKg(loadLadderProg(state.gear).slice(-1)[0]||0)):'Absents',
      swHtml(aRes('hal'),'toggleRes(\'hal\')','Haltères réglables'), halDetail())+

    matSec('elast','Élastiques',
      nb?(aRes('elast')?nb+' niveau'+(nb>1?'x':'')+' tenu'+(nb>1?'s':'')+' sur '+BANDS.length:'Absents'):'Aucun niveau tenu ici',
      nb?swHtml(aRes('elast'),'toggleRes(\'elast\')','Élastiques'):'', bandDetail())+

    matSec('kb','Kettlebells',
      kbOwned(state.gear).length?(aRes('kb')?kbOwned(state.gear).map(k=>fmtNum(k)).join(' · ')+' kg':'Absentes'):'Aucune',
      kbOwned(state.gear).length?swHtml(aRes('kb'),'toggleRes(\'kb\')','Kettlebells'):'', kbDetail())+

    matSec('cuff','Lestes scratchables',
      (function(){const n=CUFF_W.filter(w=>(state.gear.cuffs||{})[w]).length;
        return n?(aCuff(state.gear)?n+' paire'+(n>1?'s':''):'Absents'):'Aucune';})(),
      CUFF_W.some(w=>(state.gear.cuffs||{})[w])?swHtml(aCuff(state.gear),'toggleRes(\'cuff\')','Lestes scratchables'):'', cuffDetail())+

    '<div class="msec plat">'+
    RES_ORDER.filter(k=>['hal','kb','elast'].indexOf(k)<0).map(resRow).join('')+
    '</div>'+

    (perdus.length
      ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><div class="small"><b>'+perdus.length+' schéma'+(perdus.length>1?'s':'')+' non servi'+(perdus.length>1?'s':'')+' avec cet inventaire.</b></div><div class="chipline">'+perdus.map(n=>'<span class="chip off">'+esc(n)+'</span>').join('')+'</div></div>'
      : '')+
    '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px">'+
      '<div class="small"><b>'+c.servis+' schémas moteurs servis sur '+c.total+'.</b></div>'+
      '<div class="small" style="margin-top:4px"><b>'+pr.marche+' exercice'+(pr.marche>1?'s':'')+' sur '+pr.total+' '+(pr.marche>1?'ont':'a')+' encore une marche ici.</b></div>'+
      '<div class="muted small" style="margin-top:2px">Parmi les exercices dont l\'échelle dépend du matériel, ceux qui ont un barreau au-dessus de leur niveau actuel.</div>'+
    '</div>'+
    (state.onboard
      ? '<button class="big mt" onclick="validGear()">Valider mon matériel</button>'+
        '<div class="muted small mt">Tu peux valider une carte vide : sans aucun matériel, l\'outil sert encore les quatre groupes musculaires à chaque séance, au poids du corps. Cette card reste modifiable à tout moment.</div>'
      : '');
}
/* La validation abaisse le drapeau d onboarding et rien d autre : elle ne
   verrouille pas la card, qui reste editable a l identique.
   Elle ecrit false au lieu de supprimer la cle (v2.3). La suppression etait
   sans effet au dela de la session : les deux chemins qui reconstruisent l etat
   partent de defaultState, ou le drapeau vaut true, et Object.assign n ecrase
   que les cles presentes dans la source. Une cle supprimee etant indiscernable
   d une cle jamais ecrite, le bandeau revenait a chaque rechargement. Le
   drapeau est desormais une valeur, jamais une absence. */
function validGear(){
  state.onboard=false;
  save(); render();
  flash('Matériel enregistré');
}

function renderSettings(){
  screenEnter('set');
  if(pendingCard) openCards[pendingCard]=true;
  const eA=sessionSpan(roundsOf(state),state.cardio,state.warm);
  const incl=partsLabel(state.warm,state.cardio,state.stretch!==false);
  const THEME={auto:'Auto',light:'Clair',dark:'Sombre'};
  const WARMLBL={complet:'Complet',court:'Court',aucun:'Aucun'};
  $('#app').innerHTML='<h2 style="margin-bottom:12px">Réglages</h2>'+

  setCard('Données',lastExportLabel(),
   '<div class="muted small mt">Sauvegarde automatique dans le navigateur, liée à ce fichier et ce navigateur. Télécharge une sauvegarde avant de changer de version, d\'emplacement ou d\'appareil.</div>'+
   (state.lastExport?'<div class="muted small mt">Dernier téléchargement le <b>'+fmtDT(state.lastExport).slice(6)+'</b>.</div>'
                    :'<div class="muted small mt">Aucun téléchargement enregistré.</div>')+
   (state.lastImport?'<div class="muted small">Dernier import le <b>'+fmtDT(state.lastImport).slice(6)+'</b>.</div>':'')+
   '<div class="seg mt"><button onclick="downloadData()">Télécharger</button><button class="ghost" onclick="importFile()">Importer un fichier</button></div>'+
   '<details data-k="set-io"'+cardOpen('set-io',false)+'><summary>Copier-coller (repli)</summary>'+
   '<textarea id="io" style="width:100%;margin-top:10px;font-family:var(--mono);font-size:.72rem;height:88px" placeholder="Exporter remplit ce champ · colle une sauvegarde ici puis Importer"></textarea>'+
   '<div class="seg mt"><button class="ghost" onclick="exportData()">Exporter</button><button class="ghost" onclick="importData()">Importer</button></div></details>'+
   (uiAsk==='reset'
     ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><b class="small">Tout effacer ?</b>'+
       '<div class="muted small mt">Séances, séries, charges, badges, inventaire et profils : tout repart à zéro, et c\'est définitif'+(syncOn()?', sur tous tes appareils synchronisés':'')+'. Télécharge une sauvegarde d\'abord si tu hésites.</div>'+
       '<div class="seg mt"><button class="danger" onclick="resetAll()">Tout effacer</button><button class="quiet" onclick="uiAskSet(\'reset\')">Annuler</button></div></div>'
     : '<button class="danger big mt" onclick="uiAskSet(\'reset\')">Tout réinitialiser</button>'))+

  syncCard()+

  setCard('Objectif hebdomadaire',state.goal+' jours',
   '<div class="stepper mt"><button onclick="setGoal(-1)" aria-label="Un jour de moins">−</button><div class="val num">'+state.goal+'</div><button onclick="setGoal(1)" aria-label="Un jour de plus">+</button></div>'+
   '<div class="muted small mt">Compté en jours actifs, du lundi au dimanche : deux séances le même jour comptent pour un. Mets le chiffre que tu tiendras une mauvaise semaine, pas une bonne.</div>'+
   '<div class="muted small mt">Une semaine de démarrage, ou de reprise après une semaine entièrement vide, ne laisse pas sept jours pour tenir le rythme : son objectif est ramené au prorata des jours disponibles, arrondi au supérieur. Une première séance le vendredi donne '+Math.max(1,Math.min(state.goal,Math.ceil(state.goal*3/7)))+' au lieu de '+state.goal+'.</div>')+

  setCard('Séries par exercice',roundsOf(state)+' séries',
   '<div class="seg mt">'+ROUNDS_CHOICES.map(r=>'<button class="'+(roundsOf(state)===r?'':'quiet')+'" onclick="setDefRounds('+r+')">'+r+' séries</button>').join('')+'</div>'+
   '<div class="muted small mt">'+ROUNDS_CHOICES.map(r=>r+' → '+spanLbl(sessionSpan(r,state.cardio,state.warm))).join(' · ')+', selon le tirage du jour, '+incl+'. L\'accueil connaît les exercices du jour et donne le chiffre exact.</div>'+
   '<div class="muted small mt">À '+roundsOf(state)+' série'+(roundsOf(state)>1?'s':'')+' et '+state.goal+' séance'+(state.goal>1?'s':'')+' par semaine, cela fait environ <span class="num">'+weeklySets()+'</span> séries par groupe musculaire et par semaine : la séance alternée contient un exercice de chaque groupe, donc le volume par exercice est le volume par groupe.</div>'+
   '<div class="muted small mt">Une séance courte compte autant qu\'une longue pour l\'objectif hebdomadaire. Mieux vaut 2 séries que rien.</div>')+

  setCard('Échauffement',WARMLBL[state.warm]||state.warm,
   '<div class="seg mt">'+[['complet','Complet'],['court','Court'],['aucun','Aucun']].map(w=>'<button class="'+(state.warm===w[0]?'':'quiet')+'" onclick="setWarm(\''+w[0]+'\')">'+w[1]+'</button>').join('')+'</div>'+
   '<div class="muted small mt">Vu ton cou et ton dos, le mode court reste préférable à aucun. Un bouton permet aussi de le passer ponctuellement en séance.</div>')+

  setCard('Module cardio',state.cardio?'Activé':'Désactivé',
   '<div class="seg mt"><button class="'+(state.cardio?'':'quiet')+'" onclick="setCardio(true)">Activé</button><button class="'+(state.cardio?'quiet':'')+'" onclick="setCardio(false)">Désactivé</button></div>'+
   '<div class="muted small mt">4 minutes en fin de séance alternée, jamais au début : faire le cardio après le renforcement préserve les gains de force. Sois lucide, 4 minutes quatre fois par semaine ne remplacent pas les 150 minutes hebdomadaires d\'activité modérée recommandées. Le vrai volume viendra de la marche, du vélo, des escaliers.</div>')+

  setCard('Étirements de fin de séance',state.stretch!==false?'Activés':'Désactivés',
   '<div class="seg mt"><button class="'+(state.stretch!==false?'':'quiet')+'" onclick="setStretch(true)">Activés</button><button class="'+(state.stretch!==false?'quiet':'')+'" onclick="setStretch(false)">Désactivés</button></div>'+
   '<div class="muted small mt">'+STRETCH_PER_SESSION+' étirements après la dernière série d\'une séance alternée, en rotation sur les '+STRETCH_POOL.length+' : tu les couvres tous en '+Math.ceil(STRETCH_POOL.length/STRETCH_PER_SESSION)+' séances. Environ 2 minutes, comptées dans le temps de séance annoncé, sans XP ni effet sur la progression, et un bouton pour passer le bloc. Ils compensent les heures assises sur les zones que le programme ménage : nuque, épaules, hanches.</div>'+
   (state.stretch!==false?'<div class="muted small mt">Prochaine séance : '+stretchesFor().map(id=>esc(DB[id].nom)).join(' · ')+'.</div>':''))+

  setCard('Sons',sndOn()?('Activés · décompte '+(prepSec()?prepSec()+' s':'sans')+(repereOn()?' · repère '+REPERE.pas+' s':'')):'Coupés',
   '<div class="seg mt"><button class="'+(sndOn()?'':'quiet')+'" onclick="setSound(true)">Activés</button><button class="'+(sndOn()?'quiet':'')+'" onclick="setSound(false)">Coupés</button></div>'+
   '<div class="muted small mt">Coupe tous les bips d\'un coup : échauffement, repos, repères, approche et arrivée de la cible, décompte de préparation, phases du cardio et célébrations.</div>'+
   '<div class="seg mt">'+[0,3,5,10].map(v=>'<button class="'+(prepSec()===v?'':'quiet')+'" onclick="setPrep('+v+')">'+(v?v+' s':'0')+'</button>').join('')+'</div>'+
   '<div class="muted small mt">Décompte de préparation avant chaque chrono d\'exercice tenu ou d\'étirement : le temps de se mettre en position avant que ça compte. Rejoué à chaque Reprendre. Un bip par seconde, plus aigu au départ. Les cinq dernières secondes avant la cible d\'une tenue bipent aussi, pour finir sans regarder l\'écran.</div>'+
   '<div class="seg mt"><button class="'+(repereOn()?'':'quiet')+'" onclick="setRepere(true)">Repère activé</button><button class="'+(repereOn()?'quiet':'')+'" onclick="setRepere(false)">Repère coupé</button></div>'+
   '<div class="muted small mt">Pendant les planches et le gainage latéral, un clic discret toutes les '+REPERE.pas+' s pour savoir où tu en es sans voir l\'écran. Il se tait quand l\'approche de la cible prend le relais.</div>')+

  setCard('Transition',transSec()+' s',
   '<div class="muted small mt">Temps inerte entre deux exercices du circuit. L\'alternance fait déjà office de repos, cette transition ne sert qu\'à souffler et à rejoindre l\'exercice suivant, que l\'écran annonce.</div>'+
   '<div class="seg mt">'+TRANS_CHOICES.map(t=>'<button class="'+(transSec()===t?'':'quiet')+'" onclick="setTrans('+t+')">'+t+' s</button>').join('')+'</div>'+
   (PAUSE_RACCORD_PAIRS.length?'<div class="muted small mt">Sur certains enchaînements que tu as signalés, le raccord de tour porte une pause fixe de '+PAUSE_TOUR+' s, hors de ce réglage.</div>':'')+
   '<div class="muted small mt">Sur une séance à '+roundsOf(state)+' séries, chaque palier de 5 s pèse environ '+
   fmtDur(roundsOf(state)*(SLOT_ORDER.length-1)*5)+' : '+
   [TRANS_CHOICES[0],TRANS_CHOICES[TRANS_CHOICES.length-1]].map(t=>t+' s → '+spanLbl(sessionSpan(roundsOf(state),state.cardio,state.warm,t))).join(' · ')+'.</div>'+
   '')+

  setCard('Entretien',heldCount()?heldCount()+'/'+holdableIds().length+' tenus':'Progression active',
   '<div class="seg mt"><button class="'+(heldCount()>=holdableIds().length&&holdableIds().length?'':'quiet')+'" onclick="setEntretien(true)">Tout tenir</button><button class="'+(heldCount()?'quiet':'')+'" onclick="setEntretien(false)">Tout laisser progresser</button></div>'+
   '<div class="muted small mt">Le jour où tu es satisfait de ton physique, tenir tous les paliers d\'un coup : les cibles et les charges se figent au niveau atteint, le volume de travail ne change pas, et maintenir demande bien moins que construire. Le filet de sécurité continue d\'alléger si tu décroches. Réversible à tout moment, exercice par exercice depuis les fiches.</div>'+
   (heldCount()?'<div class="muted small mt"><span class="num">'+heldCount()+'</span> exercice'+(heldCount()>1?'s':'')+' sur '+holdableIds().length+' en palier tenu.</div>':''))+

  setCard('Profil actif',profilNom(),
   '<div class="muted small mt">Un profil est un inventaire nommé. Le domicile ne se supprime pas. La bascule est manuelle et ne s\'éteint jamais toute seule : l\'outil n\'a aucun moyen de savoir que tu es rentré.</div>'+
   '<div class="seg mt">'+Object.keys(state.profils||{}).map(k=>
     '<button class="'+(k===profilId()?'':'quiet')+'" onclick="switchProfil(\''+k+'\')">'+esc(profilNom(k))+'</button>').join('')+
     (Object.keys(state.profils||{}).length<PROFIL_MAX?'<button class="quiet" onclick="uiAskSet(\'newprofil\')" aria-label="Nouveau profil">+</button>':'')+'</div>'+
   /* Champ inline plutot qu un dialogue systeme. La valeur n est lue qu au clic
      sur le bouton : le rendu reecrit la vue entiere, un rendu declenche a
      chaque frappe mangerait la saisie. */
   (uiAsk==='newprofil'
     ? '<div class="mt"><input id="pfnom" type="text" maxlength="24" placeholder="chez Marc, hôtel, salle" value="'+esc(pfNom)+'" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+
       '<div class="chipline mt"><span class="muted small">Matériel de départ</span>'+
       '<button class="chip'+(pfSrc?' off':' prof')+'" onclick="pfPick(\'\')">Vide</button>'+
       Object.keys(state.profils||{}).map(k=>'<button class="chip'+(pfSrc===k?' prof':' off')+'" onclick="pfPick(\''+k+'\')">Copier '+esc(state.profils[k].nom)+'</button>').join('')+'</div>'+
       '<div class="seg mt"><button onclick="newProfilOK()">Créer le profil</button><button class="quiet" onclick="uiAskSet(\'newprofil\')">Annuler</button></div>'+
       '<div class="muted small mt">Un profil neuf part vide : on déclare ce qu\'on a sous la main, plutôt que de relire une liste venue d\'ailleurs. La copie reste là si l\'endroit ressemble à celui-ci.</div></div>'
     : '')+
   (horsDomicile()
     ? '<div class="row mt"><button class="ghost" style="padding:6px 14px;font-size:.8rem" onclick="uiAskSet(\'renprofil\')">Renommer</button>'+
       '<button class="danger" style="padding:6px 14px;font-size:.8rem" onclick="uiAskSet(\'delprofil\')">Supprimer</button></div>'+
       (uiAsk==='renprofil'
         ? '<div class="mt"><input id="pfren" type="text" maxlength="24" value="'+esc(profilNom())+'" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+
           '<div class="seg mt"><button onclick="renameProfilOK()">Renommer</button><button class="quiet" onclick="uiAskSet(\'renprofil\')">Annuler</button></div></div>'
         : '')+
       (uiAsk==='delprofil'
         ? '<div class="mt" style="background:var(--soft);border-radius:10px;padding:10px"><b class="small">Supprimer « '+esc(profilNom())+' » ?</b>'+
           '<div class="muted small mt">L\'inventaire de ce profil est perdu. Ta progression, elle, n\'est pas touchée : elle n\'appartient à aucun profil.</div>'+
           '<div class="seg mt"><button class="danger" onclick="delProfilOK()">Supprimer</button><button class="quiet" onclick="uiAskSet(\'delprofil\')">Annuler</button></div></div>'
         : '')
     : ''))+

  setCard('Matériel',profilNom()+' · '+(function(){const c=schemasServis(state.gear);return c.servis+'/'+c.total+' schémas';})(),
   matCardHtml())+

  setCard('Thème',THEME[state.theme]||state.theme,
   '<div class="seg mt">'+[['auto','Auto'],['light','Clair'],['dark','Sombre']].map(t=>'<button class="'+(state.theme===t[0]?'':'quiet')+'" onclick="setTheme(\''+t[0]+'\')">'+t[1]+'</button>').join('')+'</div>')+

  setCard('Comment ça marche','Cible, calibration, fin de série, fiches',
   '<div class="muted small mt">'+commentHtml(true)+'</div>')+

  '<div class="card muted small">'+
  '<span class="lead">Ce que fait PALIER</span>'+
  '<div>Il compose la séance, annonce sa durée, la déroule chrono en main, fait monter les répétitions puis la charge, et ouvre la variante suivante quand la marche est acquise. Rien à décider avant de commencer, sinon le volume du jour.</div>'+
  '<span class="lead mt">Comment les exercices sont choisis</span>'+
  '<div>Chaque exercice est retenu pour ce qu\'il apporte et pour ce qu\'il ne met pas en cause : dos, cou, épaules, genoux. Pas de flexion lombaire chargée, gainage en isométrie, rien au-dessus de la tête, pas d\'impact. Une variante plus douce attend derrière la plupart d\'entre eux.</div>'+
  '<span class="lead mt">Pourquoi les séances sont alternées</span>'+
  '<div>Quatre exercices non concurrents, un par groupe musculaire, enchaînés série après série : chaque muscle récupère pendant que les autres travaillent, les quatre groupes sont vus à chaque séance, et c\'est ce qui donne sur la semaine le volume qui fait progresser, sans allonger la séance.</div>'+
  '<div class="mt">En cas de douleur inhabituelle ou persistante, consulte un professionnel de santé.</div>'+
  '<div class="ver">v'+VERSION+'</div></div>';
  renderNav();
}
function setTrans(t){state.trans=t;save();render();}
function setDefRounds(r){state.rounds=r;save();render();}
function setWarm(w){state.warm=w;save();render();}
function setCardio(v){state.cardio=v;save();render();}
function setStretch(v){state.stretch=v;save();render();}
function setSound(v){state.sound=v;save();render();}
function setPrep(v){state.prep=v;save();render();}
function setRepere(v){state.repere=v;save();render();}
/* exercices susceptibles de tenir un palier : ceux qui ont une fourchette */
function holdableIds(){ return Object.keys(DB).filter(id=>DB[id].reps&&DB[id].cat!=='cardio'&&DB[id].mode!=='stretch'); }
function setEntretien(v){
  holdableIds().forEach(id=>{ const p=perfOf(id); if(v){p.hold=true;p.holdAt=p.holdAt||new Date().toISOString();} else {delete p.hold;delete p.holdAt;} });
  state.div={push:0,pull:0};
  save(); render();
  flash(v?'Tous les paliers sont tenus':'Progression reprise partout');
}
function setGoal(d){state.goal=Math.min(7,Math.max(2,state.goal+d));save();render();}
function setTheme(t){state.theme=t;save();applyTheme();render();}
function adjPlate(w,d){
  state.gear.plates[w]=Math.max(0,(state.gear.plates[w]||0)+d);
  save();render();
}
function adjMaxEnd(d){
  state.gear.maxPerEnd=Math.max(1,Math.min(8,(state.gear.maxPerEnd||5)+d));
  save();render();
}
/* L INVENTAIRE NE MODIFIE JAMAIS LA PROGRESSION, IL BORNE A LA LECTURE (v2.0).
   La v1.18 normalisait perf a chaque changement d inventaire : decocher puis
   recocher une bande ou une paire de lestes faisait perdre definitivement son
   barreau et son meilleur de bande a l exercice, sans aucun moyen de revenir
   en arriere, la valeur d avant n etant stockee nulle part. Mesure sur la
   sauvegarde du 22 aout : quatre exercices sur dix perdaient leur etat par un
   simple aller-retour. Les deux boucles d ecriture sont supprimees ; le niveau
   canonique reste dans perf et gearPerf le borne a chaque lecture. */
/* Le garde-fou « au moins une bande » disparait ici (v2.0). Il n existait que
   parce que l inventaire detruisait la progression : il empechait d atteindre
   l etat ou plus aucun barreau n existe. Depuis que le bornage se fait a la
   lecture et que la resolution materielle substitue les positions, un profil
   sans aucun elastique est un cas nomme et servi, verifie par le test
   exhaustif : aucun groupe n y est vide. */
/* La bascule de presence d un niveau disparait en v2.0 : la realisation EST la
   presence, et setBandReal est le seul point d ecriture, cote nuancier comme
   cote « je n ai pas cette bande ici ». */
function toggleCuff(id){
  state.gear.cuffs=state.gear.cuffs||{};
  state.gear.cuffs[id]=state.gear.cuffs[id]?0:1;
  syncPresence('cuff');
  save(); render();
}
/* Une kettlebell entre a un exemplaire et sort par le meme interrupteur : le
   poids retire quitte la liste et redevient proposable au menu, exactement
   comme un type de disque retombe a zero. */
function toggleKb(w){
  state.gear.kbs=state.gear.kbs||{};
  if(state.gear.kbs[w]) delete state.gear.kbs[w]; else state.gear.kbs[w]=1;
  syncPresence('kb');
  save(); render();
}
/* L enveloppe est posee DEUX FOIS depuis la v1.17, avant l etat et apres lui.
   Object.assign copie les cles dans l ordre d insertion : la poser avant place
   app et version en tete du fichier, ce sont les deux champs qu on veut lire en
   premier en ouvrant un export. La reposer apres garde la protection de la
   v1.16 : dans l autre sens seul, une cle version presente dans l etat ecrasait
   la vraie, et c est ce qui gravait un « version 1.0 » fossile dans les exports
   pendant quinze versions. Les migrations retirent app et version de l etat a
   chaque entree, mais si une sauvegarde bricolee en rapportait, c est la valeur
   de l enveloppe qui doit gagner, pas celle du fichier lu. */
function payload(){
  const env={app:'palier',version:VERSION};
  return JSON.stringify(Object.assign({},env,state,env));
}
function applyImport(v){
  if(!v||v.app!=='palier'||typeof v.xp!=='number'||!Array.isArray(v.hist)) throw 0;
  state=Object.assign(defaultState(),v);
  /* Les migrations se rejouent ici depuis la v1.16. Elles ne vivaient que dans
     loadState, donc une sauvegarde ancienne reimportee revenait avec ses valeurs
     d origine sans que rien ne le dise : une sauvegarde anterieure a la v1.13
     aurait perdu definitivement la conversion des durees en series. Le second
     argument est l objet brut du fichier, certaines migrations devant distinguer
     un champ absent d un champ a zero. */
  migrateState(state,v);
  /* Date du dernier import, symetrique de markExport. Les quatre chemins
     d entree-sortie convergent ici, un seul point suffit. Le fichier importe
     porte le lastImport de l appareil qui l a exporte : il est ecrase juste
     apres, ce qui est le comportement voulu. */
  state.lastImport=new Date().toISOString();
}
function downloadData(){
  try{
    const blob=new Blob([payload()],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='palier-'+dayKey()+'.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>{try{URL.revokeObjectURL(a.href);}catch(e){}},3000);
    markExport();
    flash('Sauvegarde téléchargée');
  }catch(e){flash('Téléchargement bloqué ici : utilise le repli copier-coller');}
}
function importFile(){
  const i=document.createElement('input');
  i.type='file'; i.accept='.json,application/json';
  i.onchange=()=>{
    const f=i.files&&i.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=async()=>{
      try{ applyImport(JSON.parse(r.result)); await save(); applyTheme(); flash('Progression importée'); go('home'); }
      catch(e){ flash('Import impossible : fichier invalide'); }
    };
    r.readAsText(f);
  };
  i.click();
}
/* date du dernier export : la sauvegarde quotidienne se verifie d un coup d oeil,
   sans ouvrir la carte. Ecrite apres coup, donc absente du fichier exporte lui-meme. */
function markExport(){ state.lastExport=new Date().toISOString(); save(); if(view==='set') render(); }
function lastExportLabel(){
  if(!state.lastExport) return 'jamais exportée';
  const j=dayGap(state.lastExport);
  return j<=0?'aujourd\'hui':(j===1?'hier':'il y a '+j+' j');
}
function exportData(){
  const t=$('#io'); t.value=payload();
  t.select();
  try{document.execCommand('copy');flash('Sauvegarde copiée');}catch(e){flash('Copie le contenu du champ');}
  markExport();
}
async function importData(){
  try{
    applyImport(JSON.parse($('#io').value));
    await save();applyTheme();flash('Progression importée');go('home');
  }catch(e){flash('Import impossible : contenu invalide');}
}
/* Une seule question au lieu de deux dialogues enchaines (v2.0) : repeter la
   question ne protege de rien, c est la formulation de la consequence qui
   protege, et la reponse se donne dans la page. */
async function resetAll(){
  uiAsk=null;
  state=defaultState();
  await save();flash('Remise à zéro faite.');go('home');
}

/* ============ CLAVIER ============ */
function primaryAction(){
  if(view==='home'){ startSession(); return; }
  if(view==='recap'){ cur=null; go('home'); return; }
  if(view!=='session'||!cur) return;
  if(cur.phase==='warm'){ nextWarm(); return; }
  const st=cur.steps[cur.i]; if(!st) return;
  if(st.k==='rest') nextStep();
  else if(st.k==='cardio') validateCardio();
  else validateSet();   /* inerte sur une tenue incomplete : l ecran et la
                           touche disent la meme chose (v1.13) */
}
function spaceAction(){
  if(view!=='session'||!cur) return;
  if(cur.phase==='warm'){ toggleWarm(); return; }
  const st=cur.steps[cur.i]; if(!st) return;
  if(st.k==='rest'){ addRest(15); return; }
  if(st.k==='cardio'){ toggleCardio(); return; }
  const e=DB[st.id];
  /* ESPACE ne detruit jamais une mesure : une fois le dernier cote arrete, il
     ne fait plus rien, et la remise a zero reste un bouton (v1.13) */
  if(e.mode==='time'){ if(!holdOver(st)) toggleChrono(); }
  else if(e.rhythm) toggleRhythm();   /* Demarrer ou Stop ; inerte une fois arretee (v2.17) */
  else if(e.cadence){ if(!cadOver(st)) toggleCadence(); }   /* comme une tenue par cote (v2.19) */
  else if(e.mode==='stretch') toggleStretch();
  else validateSet();
}
document.addEventListener('keydown',ev=>{
  if(ev.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
  const lb=document.querySelector('.lightbox');
  if(lb&&(ev.key==='Escape'||ev.key===' '||ev.key==='Enter')){ev.preventDefault();lb.remove();return;}
  /* une celebration en cours consomme la touche : sans ca, la meme pression
     enchainerait l animation et le retour a l accueil */
  if(popActive()&&(ev.key==='Enter'||ev.key===' '||ev.code==='Space'||ev.key==='Escape')){
    ev.preventDefault(); if(ev.key==='Escape') popSkip(); else popNext(); return;
  }
  /* une question posee dans la page consomme les touches : Entree et Espace
     n y repondent pas, seul Echap annule. Une touche pressee par reflexe ne
     doit jamais decider d une sortie de seance (v1.13). */
  if(askQuit){
    if(ev.key==='Escape'||ev.key==='Enter'||ev.key===' '||ev.code==='Space'){ ev.preventDefault(); if(ev.key==='Escape') quitCancel(); }
    return;
  }
  if(ev.key==='Enter'){ev.preventDefault();primaryAction();return;}
  if(ev.key===' '||ev.code==='Space'){ev.preventDefault();spaceAction();return;}
  if(view!=='session'||!cur) return;
  if(ev.key==='Escape'){ev.preventDefault();quitSession();return;}
  if(cur.phase==='warm') return;
  const st=cur.steps[cur.i];
  if(!st||st.k!=='set') return;
  const e=DB[st.id];
  if(e.mode==='stretch') return;
  if(e.mode==='time'){
    /* v2.16 : sur une tenue arretee, « - » rogne la mesure du cote courant,
       comme le bouton. « + » reste inerte : on ne rajoute pas des secondes
       qu on n a pas tenues. ESPACE n est pas concerne, il ne touche jamais a
       une mesure (v1.13). */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimHold(st.side); }
    return;
  }
  if(e.cadence){
    /* v2.19 : « - » rogne une repetition du cote courant, comme sur une tenue
       par cote. Inerte pendant la cadence. */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimCad(st.side||0); }
    return;
  }
  if(e.rhythm){
    /* v2.17 : « - » rogne une tenue sur une serie arretee, comme le bouton.
       « + » et les autres touches restent inertes : rien ne s ajoute. */
    if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ ev.preventDefault(); trimRhythm(); }
    return;
  }
  /* v1.11 : les quatre fleches sont rendues au defilement de la page. Elles
     n etaient capturees que dans un cas, une serie chiffree en pleine seance,
     c est-a-dire exactement l ecran le plus long (illustration entiere) et le
     seul ou le pave de saisie passe sous le pli : on modifiait une valeur
     invisible sans pouvoir descendre la voir. Ajuster passe sur + et -, pris
     dans leurs deux etats de touche pour rester accessibles sans Maj sur un
     clavier francais : « = » et « + » montent, « 6 » et « - » descendent.
     Le pave numerique produit deja « + » et « - ». Son « 6 » est exclu, il est
     colle au « - » : un appui a cote ferait baisser la valeur sans raison
     visible, d ou le test sur le code de touche physique. */
  if(ev.key==='+'||ev.key==='='){ev.preventDefault();bump(1);}
  if((ev.key==='-'||ev.key==='6')&&ev.code!=='Numpad6'){ev.preventDefault();bump(-1);}
});

/* ============ ROUTEUR ============ */
/* Etat des cards repliables au re-rendu (v1.14). Chaque bouton de reglage ou
   d ajustement appelle render(), qui reecrit toute la page : sans cela une
   card se refermait au moment precis ou on manipulait ce qu elle contient.
   On releve les cards ouvertes avant, on retablit apres, dans les deux sens
   pour que le detail de seance, ouvert par defaut, reste refermable.
   Rien n est stocke : l etat ne survit ni au changement de vue, puisque les
   cles de l ancienne page ne correspondent a rien dans la nouvelle, ni au
   rechargement. Ferme reste donc le defaut a chaque arrivee sur un ecran, et
   la ligne fermee garde son role de resume. */
function cardsOpen(){
  const out={};
  if(typeof document==='undefined'||!document.querySelectorAll) return out;
  try{ document.querySelectorAll('details[data-k]').forEach(d=>{ out[d.getAttribute('data-k')]=d.open; }); }catch(e){}
  return out;
}
/* Attribut d ouverture d une card, a ecrire dans le HTML au moment ou la card
   s ecrit. Corriger l ouverture apres coup fonctionnait, mais faisait sortir
   le document trop court le temps d une image : le navigateur ramenait aussitot
   le defilement dans les nouvelles limites, et rouvrir la card ensuite lui
   rendait sa hauteur sans lui rendre sa position. D ou le petit saut visible a
   chaque clic sur une option. Ecrit directement, le document sort a la bonne
   hauteur du premier coup et rien ne bouge. */
function cardOpen(k,parDefaut){
  const v=openCards[k];
  return (v===undefined?!!parDefaut:v)?' open':'';
}
function render(){
  openCards=cardsOpen();
  const y=(typeof window!=='undefined'&&typeof window.scrollY==='number')?window.scrollY:null;
  ({home:renderHome,session:renderSession,recap:renderRecap,lib:renderLib,prog:renderProg,set:renderSettings,fix:renderFix}[view]||renderHome)();
  /* filet pour les rendus qui changent quand meme la hauteur : go() remonte en
     haut apres son propre rendu, ce comportement n est pas touche */
  if(y!==null&&y>0){ try{ window.scrollTo(0,y); }catch(e){} }
}
/* navigation par hash : #home #lib #prog #set #fiche/<id>, plus #session et
   #recap comme jalons. Le retour arriere en pleine seance declenche la
   confirmation de sortie existante ; refus = on reste en seance */
function applyHash(){
  const h=(hashOK()?window.location.hash:'').slice(1);
  if(view==='session'&&cur&&!cur.recap){
    if(h!=='session'){ setHash('session'); quitSession(); }
    return;
  }
  if(view==='recap'&&cur&&cur.recap&&h!=='recap'){ cur=null; go('home'); return; }
  if(h.indexOf('fiche/')===0){
    const id=h.slice(6);
    if(DB[id]){ showFiche(id); return; }
  }
  go(['home','lib','prog','set'].indexOf(h)>=0?h:'home');
}
function onHash(){
  if(navLock){ navLock=false; return; }
  applyHash();
}
function initView(){
  syncDemarrer();   /* v2.24 : inerte sans cle ou hors https */
  if(hashOK()){
    window.addEventListener('hashchange',onHash);
    /* une rotation change la hauteur des panneaux du carrousel, et la bande
       porte une hauteur mesuree : elle se remesure au lieu de rester fausse */
    window.addEventListener('resize',()=>{ if(view==='home') carFit(); });
    const h=(window.location.hash||'').slice(1);
    if(['lib','prog','set'].indexOf(h)>=0) view=h;
    else if(h.indexOf('fiche/')===0&&DB[h.slice(6)]){ view='lib'; render(); showFiche(h.slice(6),'lib'); return; }
  }
  render();
  setHash(view);
}
if(typeof window!=='undefined'){
  Object.assign(window,{go,startSession,quitSession,quitCancel,quitConfirm,goMateriel,validGear,
    uiAskSet,pfPick,newProfilOK,renameProfilOK,delProfilOK,setBandReal,toggleBandPick,addPlate,
    setDefRounds,setTrans,setWarm,setCardio,
    setGoal,setTheme,adjPlate,adjMaxEnd,toggleRes,toggleCuff,toggleKb,addKb,exportData,importData,downloadData,importFile,resetAll,showFiche,zoomFig,bump,adjLoad,adjBand,swapPain,skipSet,
    validateSet,toggleChrono,toggleStretch,toggleWarm,nextWarm,skipWarm,nextStep,addRest,toggleCardio,validateCardio,
    toggleLight,setSound,setPrep,toggleHold,skipCool,swapCardio,popNext,popSkip,
    revertSwap,revertCardio,setRounds,setSessionRounds,setDayWarm,setDayCardio,setDayStretch,resetHold,trimHold,stepBack,carGo,carScroll});
}
(async function(){ await loadState(); applyTheme(); initView(); })();
```
## `tail.html`

Fermeture du script et du document.

4 lignes, 27 octets.

```html
</script>
</body>
</html>

```
