// logement.tsx
import { useGeomantie, type CaseTable, type ResultatTable } from '@/components/useGeomantie';
import { theme } from '@/constants/theme';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

/** Même ordre d'affichage que TableEnCouleur (site) : cases 1 à 9. */
const GRILLE_LUO_SHU: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const FLECHE_SECTEUR: Record<number, string> = {
  1: 'Nord',
  2: 'Nord-Est',
  3: 'Est',
  4: 'Sud-Est',
  5: 'Sud',
  6: 'Sud-Ouest',
  7: 'Ouest',
  8: 'Nord-Ouest',
};

const FLECHE_CASE: Record<number, number> = {
  1: 2, // Nord
  2: 3, // Nord-Est
  3: 6, // Est
  4: 9, // Sud-Est
  5: 8, // Sud
  6: 7, // Sud-Ouest
  7: 4, // Ouest
  8: 1, // Nord-Ouest
};

const FLECHE_SYMBOLE: Record<number, string> = {
  1: '↑',
  2: '↗',
  3: '→',
  4: '↘',
  5: '↓',
  6: '↙',
  7: '←',
  8: '↖',
};

function caseParNumero(data: ResultatTable, numero: number) {
  return data.cases.find((c) => c.numero === numero);
}

function stylesCelluleSelonResultat(c: CaseTable) {
  switch (c.resultat) {
    case 1:
      return { fond: '#e8f5e9', bordure: '#81c784' };
    case 2:
      return { fond: '#ffebee', bordure: '#e57373' };
    default:
      return { fond: '#f5f5f5', bordure: '#bdbdbd' };
  }
}

function stylesTexteSelonResultat(c: CaseTable) {
  switch (c.resultat) {
    case 1:
      return { couleur: theme.favorable };
    case 2:
      return { couleur: theme.defavorable };
    default:
      return { couleur: theme.neutre };
  }
}

function CelluleGeomantique({ c, estFacade, fleche }: { c: CaseTable; estFacade: boolean; fleche: number }) {
  const coul = stylesCelluleSelonResultat(c);
  return (
    <View
      style={[
        styles.cellule,
        { backgroundColor: coul.fond, borderColor: coul.bordure },
      ]}
    >
      {estFacade && (
        <View style={styles.marqueFacade}>
          <Text style={styles.marqueFacadeTexte}>{FLECHE_SYMBOLE[fleche] ?? '▲'}</Text>
        </View>
      )}
      <View style={styles.celluleBandeau}>
        <Text style={styles.celluleCoinG}>M{c.montagne}</Text>
        <Text style={styles.celluleCoinD}>F{c.facade}</Text>
      </View>
      <View style={styles.celluleCentre}>
        <Text style={styles.celluleChiffreL}>{c.local}</Text>
      </View>
    </View>
  );
}

function GrilleGeomantique({ data }: { data: ResultatTable }) {
  const caseFacade = FLECHE_CASE[data.fleche] ?? -1;
  return (
    <View style={styles.grilleWrap}>
      <Text style={styles.grilleLegende}>
        M = montagne (haut gauche), F = façade (haut droite), au centre le chiffre du local (millésime).
      </Text>
      {GRILLE_LUO_SHU.map((ligne, i) => (
        <View key={i} style={styles.grilleLigne}>
          {ligne.map((numero) => {
            const c = caseParNumero(data, numero);
            if (!c) return null;
            return <CelluleGeomantique key={numero} c={c} estFacade={numero === caseFacade} fleche={data.fleche} />;
          })}
        </View>
      ))}
    </View>
  );
}

function TableGeomantique({ data }: { data: ResultatTable }) {
  const flecheLibelle = FLECHE_SECTEUR[data.fleche] ?? String(data.fleche);

  return (
    <View style={styles.resultat}>
      <Text style={styles.sectionTitre}>9 palais</Text>
      <GrilleGeomantique data={data} />
      <Text style={styles.flecheLigne}>Case marquée {FLECHE_SYMBOLE[data.fleche] ?? '▲'} : orientation façade ({flecheLibelle}).</Text>

      <Text style={styles.sectionTitre}>Légendes et interprétations</Text>
      <Text style={styles.sousTitre}>{data.siamSam.titre}</Text>
      <Text style={styles.paragraphe}>{data.siamSam.texte}</Text>

      {data.cases.map((c) => (
        <View key={c.numero} style={styles.caseLigne}>
          <Text style={[styles.caseTitre, { color: stylesTexteSelonResultat(c).couleur }]}>
            Palais {c.numero} — M/L/F : {c.montagne} / {c.local} / {c.facade}
          </Text>
          {!!c.texte && (
            <Text style={[styles.caseTexte, { color: stylesTexteSelonResultat(c).couleur }]}>
              {c.texte}
            </Text>
          )}
        </View>
      ))}

      {(data.sousJacentes?.length ?? 0) > 0 && (
        <>
          <Text style={styles.sectionTitre}>Interactions sous-jacentes</Text>
          <Text style={styles.sousJacentesIntro}>
            Dans le cas où il y a des interactions sous-jacentes cachées par les interactions dominantes :
          </Text>
          {(data.sousJacentes ?? []).map((t, idx) => (
            <Text key={idx} style={styles.sousJacentesLigne}>
              {t}
            </Text>
          ))}
        </>
      )}

      <Text style={styles.noteFinale}>{data.noteFinale}</Text>
    </View>
  );
}

export default function LogementScreen() {
  const [anneeConstruction, setAnneeConstruction] = useState('');
  const [orientationFacade, setOrientationFacade] = useState('');
  const [orientationMontagne, setOrientationMontagne] = useState('');
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null);
  const { etat, resultat, infos, erreur, calculer } = useGeomantie();

  const soumettre = () => {
    setErreurFormulaire(null);

    if (!anneeConstruction || !orientationFacade || !orientationMontagne) {
      setErreurFormulaire('Tous les champs sont obligatoires.');
      return;
    }

    const annee = Number.parseInt(anneeConstruction, 10);
    const facadeDegres = Number.parseInt(orientationFacade, 10);
    const montagneDegres = Number.parseInt(orientationMontagne, 10);

    if (!Number.isInteger(annee) || annee < 1000 || annee > 9999) {
      setErreurFormulaire('Entrez une annee de construction valide (4 chiffres).');
      return;
    }

    if (!Number.isInteger(facadeDegres) || facadeDegres < 0 || facadeDegres > 359) {
      setErreurFormulaire('L orientation de la facade doit etre entre 0 et 359.');
      return;
    }

    if (!Number.isInteger(montagneDegres) || montagneDegres < 0 || montagneDegres > 359) {
      setErreurFormulaire('L orientation de la montagne doit etre entre 0 et 359.');
      return;
    }

    calculer({
      annee,
      degresFacade: facadeDegres,
      degresMontagne: montagneDegres,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Table Géomantique</Text>

        <Text style={styles.label}>Annee de construction</Text>
        <TextInput
          value={anneeConstruction}
          onChangeText={setAnneeConstruction}
          placeholder="Ex: 1998"
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />

        <Text style={styles.label}>Orientation de la facade principale (0 a 359)</Text>
        <TextInput
          value={orientationFacade}
          onChangeText={setOrientationFacade}
          placeholder="Ex: 120"
          keyboardType="number-pad"
          maxLength={3}
          style={styles.input}
        />

        <Text style={styles.label}>Orientation de la facade arriere / montagne (0 a 359)</Text>
        <TextInput
          value={orientationMontagne}
          onChangeText={setOrientationMontagne}
          placeholder="Ex: 300"
          keyboardType="number-pad"
          maxLength={3}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.bouton}
          onPress={soumettre}
          disabled={etat === 'chargement'}
        >
          {etat === 'chargement'
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.boutonTexte}>Calculer</Text>}
        </TouchableOpacity>

        {erreurFormulaire && <Text style={styles.erreur}>{erreurFormulaire}</Text>}
        {erreur && <Text style={styles.erreur}>{erreur}</Text>}
        {infos && (
          <View style={styles.infosBox}>
            <Text style={styles.infosTitre}>Cycle {infos.cycle}</Text>
            <Text style={styles.infosTexte}>
              Façade : {infos.facade.cardinal} = {infos.facade.boussole} ({infos.facade.degres}°)
            </Text>
            <Text style={styles.infosTexte}>
              Montagne : {infos.montagne.cardinal} = {infos.montagne.boussole} ({infos.montagne.degres}°)
            </Text>
          </View>
        )}
        {resultat && <TableGeomantique data={resultat} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  scroll:    { padding: 16, paddingTop: 60, gap: 12 },
  titre:     { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 8 },
  label:     { color: theme.titrePrinc, fontSize: 13, marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  bouton:    { backgroundColor: theme.titreSecond, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  boutonTexte: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  erreur:    { color: '#842029', textAlign: 'center', marginTop: 8 },
  infosBox:  { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 8 },
  infosTitre: { fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 4 },
  infosTexte: { fontSize: 13, color: '#444' },
  resultat: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginTop: 12, gap: 8 },
  sectionTitre: { fontSize: theme.typo.h3, fontWeight: '700', color: theme.titrePrinc, marginTop: 4 },
  grilleWrap: { marginTop: 6, gap: 6 },
  grilleLegende: { fontSize: 11, color: '#555', marginBottom: 4 },
  grilleLigne: { flexDirection: 'row', gap: 6 },
  cellule: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 96,
    justifyContent: 'space-between',
    position: 'relative',
  },
  marqueFacade: {
    position: 'absolute',
    top: 3,
    left: '50%',
    marginLeft: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#c9a84c',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  marqueFacadeTexte: { color: '#fff', fontSize: 11, fontWeight: '700' },
  celluleBandeau: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  celluleCoinG: { fontSize: 12, fontWeight: '700', color: '#37474f' },
  celluleCoinD: { fontSize: 12, fontWeight: '700', color: '#37474f' },
  celluleCentre: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 44 },
  celluleChiffreL: { fontSize: 26, fontWeight: '800', color: theme.titrePrinc },
  sousJacentesIntro: { fontSize: 12, color: '#555', fontStyle: 'italic', marginBottom: 6 },
  sousJacentesLigne: { fontSize: 12, color: '#333', marginBottom: 6 },
  flecheLigne: { fontSize: 12, color: '#444', marginTop: 8, fontStyle: 'italic' },
  sousTitre: { fontSize: theme.typo.h3, fontWeight: '600', color: theme.titreSecond },
  paragraphe: { fontSize: 13, color: '#333' },
  caseLigne: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  caseTitre: { fontSize: 13, fontWeight: '600', color: theme.titrePrinc },
  caseTexte: { fontSize: 12, color: '#444', marginTop: 2 },
  noteFinale: { marginTop: 8, fontSize: 12, color: '#666', fontStyle: 'italic' },
});