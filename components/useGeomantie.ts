// API géomantique WordPress (mobile/v1/geomantie/calcul). Types + hook.
import { useCallback, useState } from 'react';

const API_URL = 'https://laksmie.fr/wp-json/mobile/v1/geomantie/calcul';

type EtatChargement = 'idle' | 'chargement' | 'ok' | 'erreur';

// Types renvoyés par Laksmie_Geomantie_Tableau_API_Donnees (clé `table`).
// Toute la logique métier vit côté PHP (RequeteFS.php).

export type SiamSamResult = {
  titre: string;
  texte: string;
};

export type CaseTable = {
  numero: number;
  montagne: number;
  local: number;
  facade: number;
  resultat: 0 | 1 | 2;
  texte: string;
};

export type ResultatTable = {
  cases: CaseTable[];
  siamSam: SiamSamResult;
  fleche: number;
  sousJacentes: string[];
  noteFinale: string;
};

export type ParamsGeomantie = {
  annee: number;
  degresFacade: number;
  degresMontagne: number;
};

export type InfosOrientations = {
  cycle: number;
  facade: { degres: number; cardinal: string; boussole: string };
  montagne: { degres: number; cardinal: string; boussole: string };
};

export function useGeomantie() {
  const [etat, setEtat] = useState<EtatChargement>('idle');
  const [resultat, setResultat] = useState<ResultatTable | null>(null);
  const [infos, setInfos] = useState<InfosOrientations | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const calculer = useCallback(async (params: ParamsGeomantie) => {
    setEtat('chargement');
    setErreur(null);
    setResultat(null);
    setInfos(null);

    try {
      const reponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!reponse.ok) {
        const err = await reponse.json().catch(() => ({}));
        throw new Error(err?.message ?? `Erreur serveur (${reponse.status}).`);
      }

      const data = await reponse.json();

      if (!data.table || !Array.isArray(data.table.cases)) {
        throw new Error('Réponse API invalide : tableau géomantique manquant.');
      }

      const table = {
        ...data.table,
        sousJacentes: Array.isArray(data.table?.sousJacentes) ? data.table.sousJacentes : [],
      } as ResultatTable;

      setInfos({
        cycle: data.cycle,
        facade: {
          degres: data.facade.degres,
          cardinal: data.facade.cardinal,
          boussole: data.facade.boussole,
        },
        montagne: {
          degres: data.montagne.degres,
          cardinal: data.montagne.cardinal,
          boussole: data.montagne.boussole,
        },
      });
      setResultat(table);
      setEtat('ok');
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue');
      setEtat('erreur');
    }
  }, []);

  return { etat, resultat, infos, erreur, calculer };
}
