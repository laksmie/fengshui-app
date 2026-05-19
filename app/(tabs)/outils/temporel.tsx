import {
  LO_SHU_INTERPRETATION_CONTENU,
  etiquetteOrientationDepuisCodeCourt,
  etiquetteOrientationSousCase,
  loShuCellClassForStar,
  useLoShuTemporel,
  type LoShuCellClass,
  type LoShuGrid,
  type LoShuMixGrid,
  type LoShuSector,
} from '@/components/useLoShuTemporel';
import { theme } from '@/constants/theme';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** Même ordre spatial que le site (loShuCore GRID_POS → 3×3). */
const GRILLE_SECTEURS: LoShuSector[][] = [
  ['NO', 'N', 'NE'],
  ['O', 'C', 'E'],
  ['SO', 'S', 'SE'],
];

const STYLES_CLASSE: Record<
  LoShuCellClass,
  { fond: string; bordure: string; texte: string; mini: string }
> = {
  fav: { fond: '#e8f5e9', bordure: '#81c784', texte: theme.favorable, mini: theme.favorable },
  def: { fond: '#ffebee', bordure: '#e57373', texte: theme.defavorable, mini: theme.defavorable },
  neu: { fond: '#f5f5f5', bordure: '#bdbdbd', texte: theme.neutre, mini: theme.favorable },
};

function GrilleSimple({ titre, detail, grid }: { titre: string; detail?: string; grid: LoShuGrid }) {
  return (
    <View style={styles.blocGrille}>
      <View style={styles.titreLigne}>
        <Text style={styles.sousTitre}>{titre}</Text>
        {detail ? <Text style={styles.titreDetail}>{detail}</Text> : null}
      </View>
      {GRILLE_SECTEURS.map((ligne, i) => (
        <View key={i} style={styles.ligneGrille}>
          {ligne.map((secteur) => {
            const n = grid[secteur];
            const cls = loShuCellClassForStar(n);
            const st = STYLES_CLASSE[cls];
            return (
              <View
                key={secteur}
                style={[styles.case, { backgroundColor: st.fond, borderColor: st.bordure }]}
              >
                <Text style={[styles.caseChiffre, { color: st.texte }]}>{n}</Text>
                <Text style={styles.caseSecteur}>{etiquetteOrientationSousCase(secteur)}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function GrilleMix({ titre, mixGrid }: { titre: string; mixGrid: LoShuMixGrid }) {
  return (
    <View style={styles.blocGrille}>
      <Text style={styles.sousTitre}>{titre}</Text>
      <Text style={styles.legendeMix}>Petit chiffre : étoile mensuelle. Centre : annuelle.</Text>
      {GRILLE_SECTEURS.map((ligne, i) => (
        <View key={i} style={styles.ligneGrille}>
          {ligne.map((secteur) => {
            const cell = mixGrid[secteur];
            const st = STYLES_CLASSE[cell.class];
            return (
              <View
                key={secteur}
                style={[styles.case, { backgroundColor: st.fond, borderColor: st.bordure }]}
              >
                <Text style={[styles.caseMini, { color: st.mini }]}>{cell.monthly}</Text>
                <Text style={[styles.caseChiffre, { color: st.texte }]}>{cell.annual}</Text>
                <Text style={styles.caseSecteur}>{etiquetteOrientationSousCase(secteur)}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function TemporelScreen() {
  const now = useMemo(() => new Date(), []);
  const defautAnnee = now.getFullYear();
  const defautMois = now.getMonth() + 1 === 1 ? 12 : now.getMonth();

  const [annee, setAnnee] = useState(String(defautAnnee));
  const [periodId, setPeriodId] = useState(defautMois);
  const [erreurFormulaire, setErreurFormulaire] = useState<string | null>(null);

  const { etat, meta, resultat, erreur, calculer } = useLoShuTemporel();

  useEffect(() => {
    calculer({ year: defautAnnee, periodId: defautMois });
  }, [calculer, defautAnnee, defautMois]);

  const soumettre = () => {
    setErreurFormulaire(null);
    if (!annee.trim()) {
      setErreurFormulaire("L'année est obligatoire.");
      return;
    }
    const y = Number.parseInt(annee, 10);
    if (!Number.isInteger(y) || y < 1000 || y > 9999) {
      setErreurFormulaire('Année invalide (4 chiffres).');
      return;
    }
    if (!Number.isInteger(periodId) || periodId < 1 || periodId > 12) {
      setErreurFormulaire('Mois solaire invalide.');
      return;
    }
    void calculer({ year: y, periodId });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titre}>Carrés Lo Shu temporels</Text>

        <Text style={styles.label}>Année</Text>
        <TextInput
          value={annee}
          onChangeText={setAnnee}
          placeholder="Ex : 2026"
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />

        <Text style={styles.label}>Mois solaire (jieqi)</Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={periodId}
            onValueChange={(v) => setPeriodId(Number(v))}
            enabled={!!meta}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {(meta?.periods ?? []).map((p) => (
              <Picker.Item
                key={p.id}
                label={`${p.id}. ${p.nom} (${p.debut})`}
                value={p.id}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.bouton}
          onPress={soumettre}
          disabled={etat === 'chargement'}
        >
          {etat === 'chargement' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.boutonTexte}>Recalculer</Text>
          )}
        </TouchableOpacity>

        {erreurFormulaire && <Text style={styles.erreur}>{erreurFormulaire}</Text>}
        {erreur && <Text style={styles.erreur}>{erreur}</Text>}

        {resultat && (
          <View style={styles.resultat}>
            <Text style={styles.metaLigne}>
              Cycle <Text style={styles.metaStrong}>{resultat.meta.cycle}</Text>
            </Text>

            <GrilleSimple
              titre="1. Carré de l'année"
              detail={` ${resultat.meta.year} (${resultat.meta.animal})`}
              grid={resultat.yearGrid}
            />
            <GrilleSimple
              titre="2. Carré du mois"
              detail={`${meta?.periods.find((p) => p.id === periodId)?.nom ?? `#${periodId}`}`}
              grid={resultat.monthGrid}
            />
            <GrilleMix titre="3. Intégration année + mois" mixGrid={resultat.mixGrid} />

            <View style={styles.interpretationBloc}>
              <Text style={styles.sectionTitre}>{LO_SHU_INTERPRETATION_CONTENU.titre}</Text>
              <Text style={styles.paragraphe}>{LO_SHU_INTERPRETATION_CONTENU.intro}</Text>

              <Text style={styles.sectionTitre}>A. Combinaisons spéciales</Text>
              {resultat.sameStars.length === 0 && resultat.rules.length === 0 ? (
                <Text style={styles.paragraphe}>• Aucune règle particulière pour cette grille.</Text>
              ) : (
                <>
                  {resultat.sameStars.map((s, idx) => (
                    <Text
                      key={`same-${idx}`}
                      style={[styles.paragraphe, { color: STYLES_CLASSE[s.classe].texte }]}
                    >
                      • Même étoile — secteur {etiquetteOrientationDepuisCodeCourt(s.secteur)} :
                      étoile {s.etoile}
                    </Text>
                  ))}
                  {resultat.rules.map((r) => (
                    <Text
                      key={r.id}
                      style={[styles.paragraphe, { color: STYLES_CLASSE[r.classe].texte }]}
                    >
                      • <Text style={styles.gras}>{r.texte}</Text> (secteurs :{' '}
                      {r.secteurs.map((c) => etiquetteOrientationDepuisCodeCourt(c)).join(', ')})
                    </Text>
                  ))}
                </>
              )}

              <Text style={styles.sousSectionTitre}>Nature intrinsèque des étoiles</Text>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCell, styles.colNumero, styles.tableHeaderText]}>N°</Text>
                  <Text style={[styles.tableCell, styles.colNom, styles.tableHeaderText]}>Nom</Text>
                  <Text style={[styles.tableCell, styles.colCaractere, styles.tableHeaderText]}>
                    Caractère
                  </Text>
                  <Text style={[styles.tableCell, styles.colNature, styles.tableHeaderText]}>Nature</Text>
                </View>
                {LO_SHU_INTERPRETATION_CONTENU.etoiles.map((e) => (
                  <View key={e.numero} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colNumero]}>{e.numero}</Text>
                    <Text style={[styles.tableCell, styles.colNom]}>{e.nom}</Text>
                    <Text style={[styles.tableCell, styles.colCaractere]}>{e.caractere}</Text>
                    <Text style={[styles.tableCell, styles.colNature]}>{e.nature}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitre}>{LO_SHU_INTERPRETATION_CONTENU.generation_titre}</Text>
              {LO_SHU_INTERPRETATION_CONTENU.generation.map((l, i) => (
                <Text key={i} style={styles.paragraphe}>
                  • {l}
                </Text>
              ))}
              <Text style={styles.sousSectionTitre}>{LO_SHU_INTERPRETATION_CONTENU.elements_titre}</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeaderRow]}>
                  <Text style={[styles.tableCell, styles.colElementsLabel, styles.tableHeaderText]} />
                  {LO_SHU_INTERPRETATION_CONTENU.elements_colonnes.map((col) => (
                    <Text key={col} style={[styles.tableCell, styles.colElement, styles.tableHeaderText]}>
                      {col}
                    </Text>
                  ))}
                </View>
                {LO_SHU_INTERPRETATION_CONTENU.elements_lignes.map((row) => (
                  <View key={row.libelle} style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colElementsLabel]}>{row.libelle}</Text>
                    {row.cellules.map((cell, idx) => (
                      <Text key={`${row.libelle}-${idx}`} style={[styles.tableCell, styles.colElement]}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
              <Image
                source={require('@/assets/images/Cycle-des-elements.png')}
                style={styles.schemaElements}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  scroll: { padding: 16, paddingTop: 60, gap: 10 },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 4 },
  intro: { fontSize: 12, color: '#555', marginBottom: 6 },
  legendeOrientation: { fontSize: 11, color: '#666', fontStyle: 'italic', marginBottom: 8 },
  label: { color: theme.titrePrinc, fontSize: 13, marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  pickerWrap: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: { width: '100%' },
  pickerItem: { fontSize: 14 },
  bouton: {
    backgroundColor: theme.titreSecond,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  boutonTexte: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  erreur: { color: '#842029', marginTop: 8 },
  resultat: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e8dcc4',
  },
  metaLigne: { fontSize: 13, color: '#444', marginBottom: 8 },
  metaStrong: { fontWeight: '700', color: theme.titrePrinc },
  titreLigne: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  titreDetail: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  sousTitre: { fontSize: theme.typo.h3, fontWeight: '700', color: theme.titrePrinc, marginBottom: 6 },
  sectionTitre: { fontSize: theme.typo.h3, fontWeight: '700', color: theme.titrePrinc, marginTop: 8 },
  paragraphe: { fontSize: 12, color: '#333', marginBottom: 6 },
  paragrapheItal: { fontSize: 12, color: '#555', marginBottom: 6, fontStyle: 'italic' },
  interpretationBloc: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8dcc4',
    gap: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableHeaderRow: {
    backgroundColor: theme.tableHeaderBackground,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.tableBorderBottom,
  },
  tableCell: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 11,
    color: theme.texte,
    borderRightWidth: 1,
    borderRightColor: theme.tableBorder,
  },
  tableHeaderText: {
    fontWeight: '700',
    color: theme.titrePrinc,
  },
  colNumero: { width: 34, textAlign: 'center' },
  colNom: { flex: 2 },
  colCaractere: { flex: 1.2 },
  colNature: { flex: 3 },
  colElementsLabel: { flex: 1.5, fontWeight: '700' },
  colElement: { flex: 1.2 },
  schemaElements: {
    width: '100%',
    height: 220,
    marginTop: 10,
  },
  sousSectionTitre: { fontSize: 13, fontWeight: '700', color: theme.titreSecond, marginTop: 10 },
  gras: { fontWeight: '600' },
  legendeMix: { fontSize: 11, color: '#666', marginBottom: 6, fontStyle: 'italic' },
  blocGrille: { marginTop: 8, gap: 6 },
  ligneGrille: { flexDirection: 'row', gap: 6 },
  case: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 88,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  caseMini: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 13,
    fontWeight: '700',
  },
  caseChiffre: { fontSize: 22, fontWeight: '800' },
  caseSecteur: { fontSize: 10, color: '#666', marginTop: 4 },
});
