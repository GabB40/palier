/* seuil-r.js : instrument de mesure des conflits d adjacence, PONDERE PAR LE
   NOMBRE DE TOURS.  node seuil-r.js   (aucune dependance)

   Pourquoi cet outil existe. La v2.10 a ete justifiee sur un instrument qui
   comptait les quatre adjacences du circuit a poids egal. C est faux : une
   seance a R tours contient 3R adjacences intra-tour et seulement R-1
   raccords, puisque aucun repos n est emis apres la derniere serie. Le compte
   « /4 » n est exact qu a la limite R infini, et il a produit une conclusion
   inversee, « l ordre seul est une regression », reprise telle quelle au
   carnet et au changelog. Recompte a 2, 3 et 4 tours, l ordre seul est un
   gain. La ponderation est donc l instrument de reference, et le « /4 » ne
   survit ici que comme limite asymptotique, nommee comme telle.

   Ce que l instrument ne dit pas, et qu il faut garder en tete a chaque
   lecture : la table M est un JUGEMENT, pas une mesure. Elle vit hors
   application et n a jamais ete confrontee au journal. Aucun chiffre produit
   ici ne doit entrer dans l outil ni decider quoi que ce soit a lui seul. */

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
const ORDRES = {
  'P,U,C,L (v2.7)':  ['push', 'pull', 'core', 'legs'],
  'P,L,U,C (v2.10)': ['push', 'legs', 'pull', 'core'],
  'P,U,L,C (v1.6)':  ['push', 'pull', 'legs', 'core'],
  'P,L,C,U':         ['push', 'legs', 'core', 'pull'],
  'P,C,U,L':         ['push', 'core', 'pull', 'legs'],
  'P,C,L,U':         ['push', 'core', 'legs', 'pull']
};

function tous(P) {
  const o = [];
  P.push.forEach(a => P.pull.forEach(b => P.legs.forEach(c => P.core.forEach(d =>
    o.push({ push: a, pull: b, legs: c, core: d })))));
  return o;
}
const conflit = (a, b) => ((M[a].epaule || 0) + (M[b].epaule || 0)) >= 5;

/* R tours : les trois adjacences intra-tour R fois chacune, le raccord R-1
   fois. pause = le raccord est neutralise (liste de paires nommee, v2.11). */
function parSeance(t, o, R, pause) {
  let n = 0;
  for (let k = 0; k < 3; k++) n += R * (conflit(t[o[k]], t[o[k + 1]]) ? 1 : 0);
  if (!pause) n += (R - 1) * (conflit(t[o[3]], t[o[0]]) ? 1 : 0);
  return n;
}
function moy(lot, o, R, pause) {
  return lot.reduce((a, t) => a + parSeance(t, o, R, pause), 0) / lot.length;
}

['depart', 'mature'].forEach(e => {
  const lot = tous(ETATS[e]);
  console.log('\n=== ' + e + ' (' + lot.length + ' quatuors) ===');
  console.log('    conflits d epaule PAR SEANCE, 3R adjacences intra-tour + (R-1) raccords');
  console.log('    ordre                 R=2     R=3     R=4    R->inf (ancien « /4 »)');
  Object.keys(ORDRES).forEach(n => {
    const o = ORDRES[n];
    const asympt = [0, 1, 2, 3].reduce((a, k) => a + (conflit_moy(lot, o, k) ), 0);
    console.log('    ' + n.padEnd(18) +
      [2, 3, 4].map(R => moy(lot, o, R, false).toFixed(2).padStart(6)).join('  ') +
      '  ' + asympt.toFixed(2).padStart(6));
  });
  const o = ORDRES['P,L,U,C (v2.10)'];
  console.log('\n    effet d une pause au raccord (v2.10 inconditionnelle, v2.11 sur paire nommee)');
  [2, 3, 4].forEach(R => console.log('      R=' + R + '   sans pause ' + moy(lot, o, R, false).toFixed(2) +
    '   avec pause ' + moy(lot, o, R, true).toFixed(2) +
    '   gain ' + (moy(lot, o, R, false) - moy(lot, o, R, true)).toFixed(2)));
});
function conflit_moy(lot, o, k) {
  const a = o[k], b = o[(k + 1) % 4];
  return lot.filter(t => conflit(t[a], t[b])).length / lot.length;
}
console.log('\nRappel : la table M est un jugement. Aucun chiffre ci-dessus ne decide seul.');
