/* ordre-circuit.js — mesure de l ordre du circuit alterne (audit, hors build)
   Node, sans dependance : node ordre-circuit.js

   Ce script ne teste pas l application, il mesure une propriete combinatoire des
   viviers. Il n a donc pas sa place dans build.sh. Ses entrees sont declarees ici
   et non extraites du code : les viviers sont recopies de SLOTS, la table de
   marqueurs est une PROPOSITION a valider, pas une donnee de l outil.

   Trois questions :
   1. quelles combinaisons le tirage produit reellement, compteurs en phase
   2. combien de conflits d infrastructure porte chacun des six ordres de circuit
   3. le classement resiste-t-il au dephasage des viviers, a l etat de verrous
      mature, et a la contre-hypothese agoniste-antagoniste
*/

/* ---------- viviers, recopies de SLOTS, filtres des verrous ---------- */
const ETATS = {
  depart: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-assistees-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere', 'pont-fessier', 'mollets-debout', 'step-ups'],
    core: ['planche', 'bird-dog', 'gainage-lateral', 'dead-bug', 'pallof-press']
  },
  mature: {
    push: ['pompes-poignees', 'elevations-laterales', 'developpe-sol'],
    pull: ['tractions-strictes-supination', 'face-pulls', 'rowing-suspension',
           'rowing-kettlebell', 'face-pulls', 'curls-halteres'],
    legs: ['goblet-squat', 'fentes-arriere-lestee', 'pont-fessier', 'mollets-une-jambe-leste',
           'step-ups', 'rdl-kettlebell', 'kb-swings'],
    core: ['planche-ballon', 'bird-dog', 'gainage-lateral-jambe-levee', 'dead-bug', 'pallof-press']
  }
};

/* ---------- marqueurs d infrastructure partagee : PROPOSITION ----------
   Quatre ressources seulement. 3 = peut devenir limitant, 2 = notable, absent = fond.
   Le « maintien de charge devant » du rapport n est pas une ressource : c est la
   somme d epaule, coude et prehension, et le compter separement double le meme fait. */
const M = {
  'pompes-poignees':                 { epaule: 3, coude: 3 },
  'elevations-laterales':            { epaule: 3 },
  'developpe-sol':                   { epaule: 3, coude: 3, prehension: 2 },
  'tractions-assistees-supination':  { prehension: 3, coude: 3, epaule: 2 },
  'tractions-strictes-supination':   { prehension: 3, coude: 3, epaule: 3 },
  'face-pulls':                      { epaule: 3, prehension: 2 },
  'rowing-suspension':               { prehension: 3, coude: 2, epaule: 2 },
  'rowing-kettlebell':               { prehension: 3, coude: 2, erecteurs: 2 },
  'curls-halteres':                  { coude: 3, prehension: 2 },
  'goblet-squat':                    { epaule: 3, coude: 2, prehension: 2 },
  'fentes-arriere':                  {},
  'fentes-arriere-lestee':           { prehension: 3 },
  'pont-fessier':                    {},
  'mollets-debout':                  {},
  'mollets-une-jambe-leste':         { epaule: 2 },
  'step-ups':                        {},
  'rdl-kettlebell':                  { prehension: 3, erecteurs: 3 },
  'kb-swings':                       { prehension: 3, erecteurs: 3, epaule: 2 },
  'planche':                         { epaule: 3 },
  'planche-ballon':                  { epaule: 3 },
  'bird-dog':                        { epaule: 2 },
  'gainage-lateral':                 { epaule: 3 },
  'gainage-lateral-jambe-levee':     { epaule: 3 },
  'dead-bug':                        {},
  'pallof-press':                    { epaule: 2, prehension: 2 }
};

/* Conflit sur une adjacence : 3+3 ou 3+2 sur la meme ressource. 2+2 ne compte pas.
   Le circuit est CIRCULAIRE : quatre adjacences, la fermeture du tour comprise. */
function conflits(a, b) {
  const out = [];
  Object.keys(M[a]).forEach(r => { if (M[a][r] + (M[b][r] || 0) >= 5) out.push(r); });
  return out;
}

const ORDRES = {
  'P,U,L,C (actuel)': ['push', 'pull', 'legs', 'core'],
  'P,U,C,L':          ['push', 'pull', 'core', 'legs'],
  'P,L,U,C':          ['push', 'legs', 'pull', 'core'],
  'P,L,C,U':          ['push', 'legs', 'core', 'pull'],
  'P,C,U,L':          ['push', 'core', 'pull', 'legs'],
  'P,C,L,U':          ['push', 'core', 'legs', 'pull']
};

function nb(t, o, neutrePU) {
  let n = 0;
  for (let k = 0; k < 4; k++) {
    const sa = o[k], sb = o[(k + 1) % 4];
    if (neutrePU && ((sa === 'push' && sb === 'pull') || (sa === 'pull' && sb === 'push'))) continue;
    n += conflits(t[sa], t[sb]).length;
  }
  return n;
}

function cycle(P) {   /* tirages reels : les quatre compteurs valent le meme entier */
  const n = [P.push, P.pull, P.legs, P.core].map(p => p.length)
    .reduce((a, b) => { const g = (x, y) => y ? g(y, x % y) : x; return a * b / g(a, b); });
  const out = [];
  for (let i = 0; i < n; i++) out.push({ push: P.push[i % P.push.length], pull: P.pull[i % P.pull.length],
                                          legs: P.legs[i % P.legs.length], core: P.core[i % P.core.length] });
  return out;
}
function toutes(P) {  /* tirages possibles si les compteurs se dephasaient */
  const out = [];
  P.push.forEach(a => P.pull.forEach(b => P.legs.forEach(c => P.core.forEach(d =>
    out.push({ push: a, pull: b, legs: c, core: d })))));
  return out;
}

function classement(lot, neutrePU) {
  return Object.keys(ORDRES).map(n => ({
    n: n,
    moy: lot.reduce((a, t) => a + nb(t, ORDRES[n], neutrePU), 0) / lot.length,
    zero: lot.filter(t => nb(t, ORDRES[n], neutrePU) === 0).length / lot.length
  })).sort((a, b) => a.moy - b.moy);
}
function affiche(titre, lot, neutrePU) {
  console.log('\n' + titre + '  (' + lot.length + ' combinaisons)');
  classement(lot, neutrePU).forEach((x, k) => console.log(
    '  ' + (k + 1) + '. ' + x.n.padEnd(18) + ' conflits/seance ' + x.moy.toFixed(2) +
    '   seances propres ' + (100 * x.zero).toFixed(0) + ' %'));
}

/* ---------- 1. ce que le tirage produit reellement ---------- */
const cyc = cycle(ETATS.depart);
const distinctes = new Set(cyc.map(t => [t.push, t.pull, t.legs, t.core].join('|')));
console.log('=== Tirage reel, etat de depart, compteurs en phase ===');
console.log('Cycle                       :', cyc.length, 'tirages');
console.log('Combinaisons distinctes     :', distinctes.size, 'sur',
  toutes(ETATS.depart).length, 'arithmetiquement possibles');
console.log('Paires jambes+gainage       :', new Set(cyc.map(t => t.legs + ' + ' + t.core)).size, 'seulement');
console.log('Paires pousse+tire          :', new Set(cyc.map(t => t.push + ' + ' + t.pull)).size, 'seulement');
const g = cyc.filter(t => t.legs === 'goblet-squat');
console.log('Goblet squat                :', g.length + '/' + cyc.length,
  ', dont avec planche ' + g.filter(t => t.core === 'planche').length + '/' + g.length);
console.log('Cas-test du rapport         :',
  cyc.filter(t => t.push === 'elevations-laterales' && t.pull === 'face-pulls' &&
                  t.legs === 'goblet-squat' && t.core === 'planche').length + '/' + cyc.length);
console.log('Seance vecue le 4 septembre :',
  cyc.filter(t => t.push === 'developpe-sol' && t.pull === 'rowing-suspension' &&
                  t.legs === 'goblet-squat').length + '/' + cyc.length);

/* ---------- 2. les six ordres, quatre scenarios ---------- */
console.log('\n=== Conflits par ordre de circuit ===');
affiche('Depart, modele de base', toutes(ETATS.depart), false);
affiche('Depart, pousse/tire declare neutre (hypothese agoniste-antagoniste, jugement v1.6)',
  toutes(ETATS.depart), true);
affiche('Mature, modele de base', toutes(ETATS.mature), false);
affiche('Mature, pousse/tire declare neutre', toutes(ETATS.mature), true);

/* ---------- 3. gain marginal d un choix d ordre par seance ---------- */
console.log('\n=== Un moteur par seance vaut-il mieux qu une constante ? ===');
[['depart', ETATS.depart], ['mature', ETATS.mature]].forEach(([nom, P]) => {
  const lot = toutes(P);
  const meilleure = classement(lot, false)[0].n;
  const cte = lot.reduce((a, t) => a + nb(t, ORDRES[meilleure], false), 0);
  const opt = lot.reduce((a, t) => a + Math.min.apply(null,
    Object.keys(ORDRES).map(n => nb(t, ORDRES[n], false))), 0);
  console.log('  ' + nom.padEnd(8) + ' meilleure constante ' + meilleure +
    ' : ' + cte + ' conflits   choix optimal par seance : ' + opt +
    '   gain marginal ' + (100 * (cte - opt) / cte).toFixed(0) + ' %');
});

/* ---------- 4. sensibilite du classement aux marqueurs contestables ---------- */
const VAR = [['planche', 'epaule', 2], ['gainage-lateral', 'epaule', 2], ['face-pulls', 'epaule', 2],
             ['goblet-squat', 'epaule', 2], ['rowing-suspension', 'epaule', 3], ['bird-dog', 'epaule', 3],
             ['pallof-press', 'epaule', 3], ['pompes-poignees', 'epaule', 2]];
console.log('\n=== Sensibilite : ' + (1 << VAR.length) + ' jeux de marqueurs, etat de depart, modele de base ===');
const lot = toutes(ETATS.depart), sauv = JSON.parse(JSON.stringify(M)), rangs = {}, gagn = {};
for (let m = 0; m < (1 << VAR.length); m++) {
  Object.keys(sauv).forEach(k => M[k] = JSON.parse(JSON.stringify(sauv[k])));
  VAR.forEach((v, k) => { if (m & (1 << k)) M[v[0]][v[1]] = v[2]; });
  const r = classement(lot, false);
  gagn[r[0].n] = (gagn[r[0].n] || 0) + 1;
  const p = r.findIndex(x => x.n === 'P,U,L,C (actuel)') + 1;
  rangs[p] = (rangs[p] || 0) + 1;
}
Object.keys(sauv).forEach(k => M[k] = sauv[k]);
console.log('  ordre gagnant :');
Object.keys(gagn).forEach(k => console.log('    ' + String(gagn[k]).padStart(3) + '/' + (1 << VAR.length) + '  ' + k));
console.log('  rang de l ordre actuel :');
Object.keys(rangs).sort().forEach(k => console.log('    rang ' + k + ' : ' + rangs[k] + '/' + (1 << VAR.length)));
