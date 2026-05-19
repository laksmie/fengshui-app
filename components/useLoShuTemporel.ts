// Calcul Lo Shu temporel 100% local (grilles / règles + interprétation).
import { useCallback, useState } from 'react';

type EtatChargement = 'idle' | 'chargement' | 'ok' | 'erreur';

export type LoShuCellClass = 'fav' | 'def' | 'neu';

export type LoShuSector = 'NO' | 'N' | 'NE' | 'O' | 'C' | 'E' | 'SO' | 'S' | 'SE';

export type LoShuGrid = Record<LoShuSector, number>;

export type LoShuMixCell = {
  annual: number;
  monthly: number;
  class: LoShuCellClass;
};

export type LoShuMixGrid = Record<LoShuSector, LoShuMixCell>;

export type LoShuRule = {
  id: string;
  classe: LoShuCellClass;
  priorite: number;
  texte: string;
  secteurs: string[];
};

export type LoShuSameStar = {
  secteur: string;
  etoile: number;
  classe: LoShuCellClass;
};

export type LoShuTemporelMeta = {
  year: number;
  periodId: number;
  animal: string;
  yearCenter: number;
  monthCenter: number;
  cycle: number;
};

export type LoShuTemporelResponse = {
  meta: LoShuTemporelMeta;
  yearGrid: LoShuGrid;
  monthGrid: LoShuGrid;
  mixGrid: LoShuMixGrid;
  rules: LoShuRule[];
  sameStars: LoShuSameStar[];
};

export type LoShuPeriod = {
  id: number;
  nom: string;
  debut: string;
};

export type LoShuMetaResponse = {
  periods: LoShuPeriod[];
};

export type ParamsLoShuTemporel = {
  year: number;
  periodId: number;
  animal?: string;
};

const ANIMALS = ['Rat', 'Buffle', 'Tigre', 'Lapin', 'Dragon', 'Serpent', 'Cheval', 'Chèvre', 'Singe', 'Coq', 'Chien', 'Cochon'] as const;
const GROUP_B = new Set(['Tigre', 'Serpent', 'Singe', 'Cochon']);
const GROUP_C = new Set(['Buffle', 'Dragon', 'Chèvre', 'Chien']);
const ORDER: LoShuSector[] = ['C', 'NO', 'O', 'NE', 'S', 'N', 'SO', 'E', 'SE'];
const SECTOR_KEYS: LoShuSector[] = ['NO', 'N', 'NE', 'O', 'C', 'E', 'SO', 'S', 'SE'];
const YEAR_REF = 2025;
const STAR_REF = 2;

/** Même pivot que lo-shu.js (geo-dir) : lecture boussole sous la grille (Sud en haut, Nord en bas, Est à gauche, Ouest à droite). */
const LABEL_VIEW: Record<LoShuSector, string> = {
  NO: 'SE',
  N: 'S',
  NE: 'SO',
  O: 'E',
  C: 'C',
  E: 'O',
  SO: 'NE',
  S: 'N',
  SE: 'NO',
};

const CODE_ORIENTATION_FR: Record<string, string> = {
  NO: 'Nord-Ouest',
  N: 'Nord',
  NE: 'Nord-Est',
  O: 'Ouest',
  C: 'Centre',
  E: 'Est',
  SO: 'Sud-Ouest',
  S: 'Sud',
  SE: 'Sud-Est',
};

/** Libellé sous la case : orientation vue sur le plan (identique au site après LABEL_VIEW). */
export function etiquetteOrientationSousCase(secteurPalace: LoShuSector): string {
  const code = LABEL_VIEW[secteurPalace];
  return CODE_ORIENTATION_FR[code] ?? code;
}

/** Pour les textes qui utilisent déjà le code court (ex. sameStars.secteur = « SE », « N »). */
export function etiquetteOrientationDepuisCodeCourt(code: string): string {
  return CODE_ORIENTATION_FR[code] ?? code;
}

const REGLES_INTERACTION: Record<string, { classe: LoShuCellClass; texte: string }> = {
  '1,6': { classe: 'fav', texte: '1 + 6 : carrière, soutien (intelligence, mouvement).' },
  '2,2': { classe: 'def', texte: 'Double 2 : risque de maladie accru pour les occupants de cette pièce.' },
  '2,5': { classe: 'def', texte: '2 + 5 : maladie grave.' },
  '2,7': { classe: 'def', texte: "2 + 7 : passion, mais risque d'incendie ou conflit." },
  '3,7': { classe: 'def', texte: '3 + 7 : conflits et pertes.' },
  '3,8': { classe: 'fav', texte: '3 + 8 : croissance et éducation.' },
  '3,2': { classe: 'def', texte: '3 + 2 : maladies et conflits.' },
  '4,9': { classe: 'fav', texte: '4 + 9 : intelligence, réussite (affaires, autorité).' },
  '4,3': { classe: 'def', texte: '4 + 3 : mésentente dans la vie amoureuse ou conjugale.' },
  '5,5': { classe: 'def', texte: "Double 5 : danger majeur. On conseille généralement l'inaction totale dans ce secteur ce mois-là." },
  '5,9': { classe: 'def', texte: '5 + 9 : instabilité dangereuse.' },
  '9,9': { classe: 'fav', texte: 'Double 9 : célébrations extrêmes, succès fulgurant.' },
  '8,9': { classe: 'fav', texte: '8 + 9 : richesse rapide.' },
};

const PERIODS: LoShuPeriod[] = [
  { id: 1, nom: 'Février — Li Chun', debut: '4 fév' },
  { id: 2, nom: 'Mars — Jing Zhe', debut: '6 mar' },
  { id: 3, nom: 'Avril — Qing Ming', debut: '5 avr' },
  { id: 4, nom: "Mai — Li Xia", debut: '6 mai' },
  { id: 5, nom: 'Juin — Mang Zhong', debut: '6 jui' },
  { id: 6, nom: 'Juillet — Xiao Shu', debut: '7 jul' },
  { id: 7, nom: "Août — Li Qiu", debut: '7 aoû' },
  { id: 8, nom: 'Septembre — Bai Lu', debut: '8 sep' },
  { id: 9, nom: 'Octobre — Han Lu', debut: '8 oct' },
  { id: 10, nom: "Novembre — Li Dong", debut: '7 nov' },
  { id: 11, nom: 'Décembre — Da Xue', debut: '7 déc' },
  { id: 12, nom: 'Janvier — Xiao Han', debut: '6 jan' },
];

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function pairKey(a: number, b: number): string {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

function labelForSector(dir: LoShuSector): string {
  return LABEL_VIEW[dir] ?? dir;
}

function yearStar(year: number): number {
  return mod((STAR_REF - (year - YEAR_REF)) - 1, 9) + 1;
}

function animalByGregorianYear(year: number): string {
  return ANIMALS[mod(year - 2020, 12)];
}

function monthlyCenter(periodId: number, animal: string): number {
  let start = 8;
  if (GROUP_B.has(animal)) start = 2;
  else if (GROUP_C.has(animal)) start = 5;
  return mod((start - 1) - (periodId - 1), 9) + 1;
}

function calculCycle(annee: number): number {
  let cycleInter = annee % 180;
  if (cycleInter === 0) return 6;
  if (cycleInter >= 64) {
    cycleInter -= 63;
    return Math.ceil(cycleInter / 20);
  }
  cycleInter += 17;
  return Math.ceil(cycleInter / 20) + 5;
}

function buildGrid(center: number): LoShuGrid {
  const out = { C: center } as LoShuGrid;
  for (let i = 1; i < ORDER.length; i += 1) {
    out[ORDER[i]] = mod((center - 1) - i, 9) + 1;
  }
  return out;
}

export function loShuCellClassForStar(chiffre: number): LoShuCellClass {
  if ([1, 6, 8, 9].includes(chiffre)) return 'fav';
  if ([2, 3, 5, 7].includes(chiffre)) return 'def';
  return 'neu';
}

function couleurInteraction(ca: number, cm: number): LoShuCellClass {
  if (ca === 5 && cm === 5) return 'def';
  if ((ca + cm) === 10) return 'fav';
  if (ca === cm) return loShuCellClassForStar(ca);
  return REGLES_INTERACTION[pairKey(ca, cm)]?.classe ?? 'neu';
}

function detectInteractionRules(ca: number, cm: number): Array<Omit<LoShuRule, 'secteurs'>> {
  const out: Array<Omit<LoShuRule, 'secteurs'>> = [];
  if (cm === 5 && (ca === 5 || ca === 2)) {
    out.push({
      id: 'yellow5_priority',
      classe: 'def',
      priorite: 1,
      texte: '5 Jaune : très nuisible (étoile mensuelle 5 sur annuelle 5 ou 2).',
    });
  }
  if ((ca + cm) === 10 && !(ca === 5 && cm === 5)) {
    out.push({
      id: 'sum10',
      classe: 'fav',
      priorite: 2,
      texte: "Somme 10 : flux d'énergie fluide et propice à la prospérité (même si les chiffres sont individuellement défavorables).",
    });
  }
  const key = pairKey(ca, cm);
  const regle = REGLES_INTERACTION[key];
  if (regle) {
    out.push({
      id: `comb_${key.replace(',', '_')}`,
      classe: regle.classe,
      priorite: 3,
      texte: regle.texte,
    });
  }
  return out;
}

function resolveAnimal(year: number, animal?: string): string {
  if (!animal || animal.trim() === '') return animalByGregorianYear(year);
  return animal.trim();
}

function computeTemporalLoShu(params: ParamsLoShuTemporel): LoShuTemporelResponse {
  const year = Number(params.year);
  const periodId = Number(params.periodId);
  if (!Number.isInteger(year) || year < 1000 || year > 9999) {
    throw new Error('Année invalide.');
  }
  if (!Number.isInteger(periodId) || periodId < 1 || periodId > 12) {
    throw new Error('Mois solaire invalide.');
  }

  const animal = resolveAnimal(year, params.animal);
  const yCenter = yearStar(year);
  const mCenter = monthlyCenter(periodId, animal);
  const cycle = calculCycle(year);
  const yearGrid = buildGrid(yCenter);
  const monthGrid = buildGrid(mCenter);

  const mixGrid = {} as LoShuMixGrid;
  const sameStars: LoShuSameStar[] = [];
  const rulesMap = new Map<string, LoShuRule>();

  SECTOR_KEYS.forEach((dir) => {
    const ca = yearGrid[dir];
    const cm = monthGrid[dir];

    mixGrid[dir] = { annual: ca, monthly: cm, class: couleurInteraction(ca, cm) };

    if (ca === cm) {
      sameStars.push({
        secteur: labelForSector(dir),
        etoile: ca,
        classe: loShuCellClassForStar(ca),
      });
    }

    detectInteractionRules(ca, cm).forEach((rule) => {
      if (!rulesMap.has(rule.id)) {
        rulesMap.set(rule.id, { ...rule, secteurs: [] });
      }
      rulesMap.get(rule.id)?.secteurs.push(labelForSector(dir));
    });
  });

  const rules = Array.from(rulesMap.values()).sort((a, b) => a.priorite - b.priorite);

  return {
    meta: {
      year,
      periodId,
      animal,
      yearCenter: yCenter,
      monthCenter: mCenter,
      cycle,
    },
    yearGrid,
    monthGrid,
    mixGrid,
    rules,
    sameStars,
  };
}

export type LoShuEtoileNature = {
  numero: number;
  nom: string;
  caractere: string;
  nature: string;
};

export type LoShuInterpretationContenu = {
  titre: string;
  intro: string;
  etoiles: LoShuEtoileNature[];
  generation_titre: string;
  generation: string[];
  elements_titre: string;
  elements_colonnes: string[];
  elements_lignes: Array<{ libelle: string; cellules: string[] }>;
};

export const LO_SHU_INTERPRETATION_CONTENU: LoShuInterpretationContenu = {
  titre: 'Interprétation',
  intro: "L'étoile mensuelle active la nature de l'annuelle.",
  etoiles: [
    { numero: 1, nom: 'Étoile de la Noblesse', caractere: 'Fluide', nature: 'Sagesse, mouvement, nouveaux départs (opportunités, réseau, sexualité)' },
    { numero: 2, nom: 'Étoile de la Maladie', caractere: 'Lourde', nature: 'Maladie, lenteur, mais aussi immobilier (fatigue)' },
    { numero: 3, nom: 'Étoile des Querelles', caractere: 'Agressif', nature: 'Colère, procès, impulsivité, compétition (conflits)' },
    { numero: 4, nom: 'Étoile Académique', caractere: 'Doux', nature: 'Études, romantisme, art, séduction (relations, créativité)' },
    { numero: 5, nom: 'Le 5 Jaune', caractere: 'Instable', nature: 'Obstacles, accidents, malchance radicale (chaos, blocage)' },
    { numero: 6, nom: 'Étoile Céleste', caractere: 'Rigide', nature: 'Autorité, aide des mentors, discipline (pouvoir, structure)' },
    { numero: 7, nom: 'Étoile de la Violence', caractere: 'Tranchant', nature: 'Vols, trahisons, communication agressive (perte, manipulation)' },
    { numero: 8, nom: 'Étoile de Fortune', caractere: 'Stable', nature: 'Richesse par le travail, stabilité (construction)' },
    { numero: 9, nom: 'Étoile de Feu', caractere: 'Expansif', nature: 'Célébrité, joie, expansion, futur (visibilité, succès)' },
  ],
  generation_titre: 'B. Génération (cycle des 5 éléments)',
  generation: [
    'Si la mensuelle génère l’annuelle : effet positif amplifié.',
    'Si la mensuelle draine l’annuelle : effet affaibli.',
    'Si la mensuelle détruit l’annuelle : tensions, événements négatifs.',
  ],
  elements_titre: 'Correspondances des 5 éléments',
  elements_colonnes: ['Bois', 'Eau', 'Feu', 'Métal', 'Terre'],
  elements_lignes: [
    { libelle: 'Saison', cellules: ['Printemps', 'Hiver', 'Été', 'Automne', 'Intersaison'] },
    { libelle: 'Direction', cellules: ['Est / Sud-Est', 'Nord', 'Sud', 'Ouest / Nord-Ouest', 'Centre'] },
    { libelle: 'Nombre', cellules: ['3, 4', '1', '9', '6, 7', '2, 5, 8'] },
    { libelle: 'Corps', cellules: ['Foie / Vésicule biliaire', 'Reins / Vessie', 'Yeux / Cœur / Intestin grêle', 'Poumons / Gros intestin', 'Rate / Estomac'] },
  ],
};

export function useLoShuTemporel() {
  const [etat, setEtat] = useState<EtatChargement>('idle');
  const [meta] = useState<LoShuMetaResponse>({ periods: PERIODS });
  const [resultat, setResultat] = useState<LoShuTemporelResponse | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const calculer = useCallback((params: ParamsLoShuTemporel) => {
    setEtat('chargement');
    setErreur(null);
    setResultat(null);

    try {
      setResultat(computeTemporalLoShu(params));
      setEtat('ok');
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
      setEtat('erreur');
    }
  }, []);

  return {
    etat,
    meta,
    resultat,
    erreur,
    calculer,
  };
}
