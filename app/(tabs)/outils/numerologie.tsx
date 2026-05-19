import { theme } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ecrireCache, fetchJsonAvecTimeout, lireCache } from '../../../components/mobile-api';
import { MobileArticleBody, type MobileBlock } from '../../../components/mobile-article-body';

type ProfilNumerologie = {
  prenom: string;
  nom: string;
  dateNaissance: string; // JJ/MM/AAAA
};

type ResultatNumerologie = {
  nomComplet: string;
  dateNaissance: string;
  totalEvolution: number;
  nbEvolution: string;
  totalCheminDeVie: number;
  cheminDeVie: string;
  sommeVoyelles: number;
  nbIntime: string;
  sommeConsonnes: number;
  nbRealisation: string;
  totalExpression: number;
  nbExpression: string;
  grilleInsertion: number[];
};

type WpPage = {
  id: number;
  slug: string;
  link: string;
};

type MobilePostDetail = {
  id: number;
  title: string;
  blocks: MobileBlock[];
};

type CacheCheminArticle = {
  pageWp: WpPage;
  detailArticle: MobilePostDetail;
};

const LEGENDE_CASES = [
  '1. Personnalité',
  '2. Relations',
  '3. Communication',
  '4. Travail',
  '5. Mouvement',
  '6. Famille',
  '7. Connaissance',
  '8. Abondance',
  '9. Altruisme',
] as const;

const VALEUR_VOYELLE: Record<string, { somme: number; index: number }> = {
  A: { somme: 1, index: 0 },
  E: { somme: 5, index: 4 },
  I: { somme: 9, index: 8 },
  O: { somme: 6, index: 5 },
  U: { somme: 3, index: 2 },
  Y: { somme: 7, index: 6 },
};

const VALEUR_CONSONNE: Record<string, { somme: number; index: number }> = {
  J: { somme: 1, index: 0 },
  S: { somme: 1, index: 0 },
  B: { somme: 2, index: 1 },
  K: { somme: 2, index: 1 },
  T: { somme: 2, index: 1 },
  C: { somme: 3, index: 2 },
  L: { somme: 3, index: 2 },
  D: { somme: 4, index: 3 },
  M: { somme: 4, index: 3 },
  V: { somme: 4, index: 3 },
  N: { somme: 5, index: 4 },
  W: { somme: 5, index: 4 },
  F: { somme: 6, index: 5 },
  X: { somme: 6, index: 5 },
  G: { somme: 7, index: 6 },
  P: { somme: 7, index: 6 },
  H: { somme: 8, index: 7 },
  Q: { somme: 8, index: 7 },
  Z: { somme: 8, index: 7 },
  R: { somme: 9, index: 8 },
};

function normaliserTexte(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z ]/g, '')
    .toUpperCase();
}

function parseDateFr(dateNaissance: string) {
  const [jour, mois, annee] = dateNaissance.split('/');
  return { jour, mois, annee };
}

function formaterDateProfil(jour: number, mois: number, annee: number): string {
  return `${String(jour).padStart(2, '0')}/${String(mois).padStart(2, '0')}/${annee}`;
}

function dateValide(dateNaissance: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateNaissance)) return false;
  const { jour, mois, annee } = parseDateFr(dateNaissance);
  const j = Number.parseInt(jour, 10);
  const m = Number.parseInt(mois, 10);
  const a = Number.parseInt(annee, 10);
  if (!Number.isInteger(j) || !Number.isInteger(m) || !Number.isInteger(a)) return false;
  if (a < 1900 || a > 2100 || m < 1 || m > 12 || j < 1 || j > 31) return false;
  const date = new Date(a, m - 1, j);
  return date.getFullYear() === a && date.getMonth() === m - 1 && date.getDate() === j;
}

function additionnerTousLesChiffres(nombre: number): number {
  if (nombre < 100) {
    return Math.floor(nombre / 10) + (nombre % 10);
  }
  if (nombre > 999) {
    const n1 = Math.floor(nombre / 1000);
    const n2 = Math.floor((nombre % 1000) / 100);
    const n3 = Math.floor((nombre % 100) / 10);
    const n4 = nombre % 10;
    return n1 + n2 + n3 + n4;
  }
  return 0;
}

function reductionTheosophique(nombre: number): number {
  return Math.floor(nombre / 10) + (nombre % 10);
}

function reductionLimite9(nombre: number): string {
  let valeur = nombre;
  while (valeur > 9) {
    valeur = reductionTheosophique(valeur);
  }
  return String(valeur).replace(/^0+/, '') || '0';
}

function reductionLimite11(nombre: number): string {
  let valeur = nombre;
  while (valeur > 9 && valeur !== 11) {
    valeur = reductionTheosophique(valeur);
  }
  return String(valeur);
}

function reductionLimite22(nombre: number): string {
  let valeur = nombre;
  while (valeur > 9 && valeur !== 11 && valeur !== 12 && valeur !== 22) {
    valeur = reductionTheosophique(valeur);
  }
  return String(parseInt(String(valeur), 10));
}

function calculerNumerologie(profil: ProfilNumerologie): ResultatNumerologie {
  const prenom = normaliserTexte(profil.prenom);
  const nom = normaliserTexte(profil.nom);
  const nomComplet = `${prenom} ${nom}`.trim();
  const { jour, mois, annee } = parseDateFr(profil.dateNaissance);

  const grilleInsertion = Array<number>(9).fill(0);
  let sommeVoyelles = 0;
  let sommeConsonnes = 0;

  const texteComplet = `${prenom}${nom}`;
  for (const lettre of texteComplet) {
    if (lettre === ' ') continue;
    const voyelle = VALEUR_VOYELLE[lettre];
    if (voyelle) {
      sommeVoyelles += voyelle.somme;
      grilleInsertion[voyelle.index] += 1;
      continue;
    }

    const consonne = VALEUR_CONSONNE[lettre];
    if (consonne) {
      sommeConsonnes += consonne.somme;
      grilleInsertion[consonne.index] += 1;
    }
  }

  const totalCheminDeVie =
    additionnerTousLesChiffres(Number.parseInt(jour, 10)) +
    additionnerTousLesChiffres(Number.parseInt(mois, 10)) +
    additionnerTousLesChiffres(Number.parseInt(annee, 10));
  const cheminDeVie = reductionLimite22(totalCheminDeVie);

  const totalEvolution =
    additionnerTousLesChiffres(Number.parseInt(jour, 10)) +
    additionnerTousLesChiffres(Number.parseInt(mois, 10));
  const nbEvolution = reductionLimite9(totalEvolution);

  const nbIntime = reductionLimite11(sommeVoyelles);
  const nbRealisation = reductionLimite22(sommeConsonnes);

  const totalExpression = sommeVoyelles + sommeConsonnes;
  let nbExpression = reductionLimite22(totalExpression);
  if (nbExpression === '12') {
    nbExpression = '3';
  }

  return {
    nomComplet,
    dateNaissance: profil.dateNaissance,
    totalEvolution,
    nbEvolution,
    totalCheminDeVie,
    cheminDeVie,
    sommeVoyelles,
    nbIntime,
    sommeConsonnes,
    nbRealisation,
    totalExpression,
    nbExpression,
    grilleInsertion,
  };
}

function normaliserSlugChemin(cheminDeVie: string): number {
  const n = Number.parseInt(cheminDeVie, 10);
  if (n === 10) return 1;
  if (n === 20) return 2;
  return n;
}

function slugCandidatsChemin(cheminDeVie: string): string[] {
  const n = normaliserSlugChemin(cheminDeVie);
  if (!Number.isInteger(n) || n < 1 || n > 9) return [];
  return [`nombre${n}`, `nombre-${n}`];
}

export default function NumerologieScreen() {
  const { user } = useUser();
  const profilParDefaut = useMemo<ProfilNumerologie>(
    () => ({
      prenom: user.prenom ?? '',
      nom: user.nom ?? '',
      dateNaissance: formaterDateProfil(user.jour, user.mois, user.annee),
    }),
    [user.annee, user.jour, user.mois, user.nom, user.prenom],
  );

  const [prenom, setPrenom] = useState(profilParDefaut.prenom);
  const [nom, setNom] = useState(profilParDefaut.nom);
  const [dateNaissance, setDateNaissance] = useState(profilParDefaut.dateNaissance);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pageWp, setPageWp] = useState<WpPage | null>(null);
  const [detailArticle, setDetailArticle] = useState<MobilePostDetail | null>(null);
  const [chargementPage, setChargementPage] = useState(false);
  const [erreurPage, setErreurPage] = useState<string | null>(null);
  const [resultat, setResultat] = useState<ResultatNumerologie | null>(() =>
    profilParDefaut.prenom && profilParDefaut.nom && dateValide(profilParDefaut.dateNaissance)
      ? calculerNumerologie(profilParDefaut)
      : null,
  );

  const lancerCalcul = () => {
    const profil: ProfilNumerologie = {
      prenom: prenom.trim(),
      nom: nom.trim(),
      dateNaissance: dateNaissance.trim(),
    };
    if (!profil.prenom || !profil.nom || !profil.dateNaissance) {
      setErreur('Tous les champs sont obligatoires.');
      setResultat(null);
      return;
    }
    if (!dateValide(profil.dateNaissance)) {
      setErreur('Date invalide. Format attendu : JJ/MM/AAAA');
      setResultat(null);
      return;
    }
    setErreur(null);
    setResultat(calculerNumerologie(profil));
  };

  const dateSelectionnee = (() => {
    if (!dateValide(dateNaissance)) return new Date();
    const { jour, mois, annee } = parseDateFr(dateNaissance);
    return new Date(Number.parseInt(annee, 10), Number.parseInt(mois, 10) - 1, Number.parseInt(jour, 10));
  })();

  useEffect(() => {
    setPrenom(profilParDefaut.prenom);
    setNom(profilParDefaut.nom);
    setDateNaissance(profilParDefaut.dateNaissance);
    if (profilParDefaut.prenom && profilParDefaut.nom && dateValide(profilParDefaut.dateNaissance)) {
      setResultat(calculerNumerologie(profilParDefaut));
      setErreur(null);
    } else {
      setResultat(null);
    }
  }, [profilParDefaut]);

  useEffect(() => {
    if (!resultat?.cheminDeVie) {
      setPageWp(null);
      setDetailArticle(null);
      setErreurPage(null);
      return;
    }

    const slugs = slugCandidatsChemin(resultat.cheminDeVie);
    let actif = true;
    const chemin = resultat.cheminDeVie;

    const depuisCache = lireCache<CacheCheminArticle>(`numerologie:${chemin}`);
    if (depuisCache) {
      setPageWp(depuisCache.pageWp);
      setDetailArticle(depuisCache.detailArticle);
      setErreurPage(null);
      setChargementPage(false);
      return () => {
        actif = false;
      };
    }

    const chargerPage = async () => {
      setChargementPage(true);
      setErreurPage(null);

      try {
        let post: WpPage | null = null;

        for (const slug of slugs) {
          const urlSlug =
            `https://laksmie.fr/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}` +
            `&_fields=id,slug,link`;
          const dataSlug = await fetchJsonAvecTimeout<WpPage[]>(urlSlug);
          if (!actif) return;
          if (dataSlug[0]) {
            post = dataSlug[0];
            break;
          }
        }

        if (!post) {
          setPageWp(null);
          setDetailArticle(null);
          setErreurPage(`Aucun article trouvé pour les slugs ${slugs.join(' / ')}.`);
          return;
        }

        setPageWp(post);

        const dataMobile = await fetchJsonAvecTimeout<MobilePostDetail>(
          `https://laksmie.fr/wp-json/mobile/v1/post/${post.id}`,
        );
        if (!actif) return;

        ecrireCache<CacheCheminArticle>(`numerologie:${chemin}`, { pageWp: post, detailArticle: dataMobile });
        setDetailArticle(dataMobile);
        setErreurPage(null);
      } catch {
        if (!actif) return;
        setErreurPage("Impossible de charger l'article pour le moment.");
        setPageWp(null);
        setDetailArticle(null);
      } finally {
        if (actif) setChargementPage(false);
      }
    };

    chargerPage();

    return () => {
      actif = false;
    };
  }, [resultat?.cheminDeVie]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.titre}>Numérologie de la transformation</Text>
      <Text style={styles.introFormulaire}>
        Entrez vos informations pour reveler votre profil numerologique
      </Text>

      <View style={styles.formBloc}>
        <Text style={styles.inputLabel}>Prénom</Text>
        <TextInput
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Ex : Marion"
          placeholderTextColor={theme.texteClair}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Nom</Text>
        <TextInput
          value={nom}
          onChangeText={setNom}
          placeholder="Ex : Cotillard"
          placeholderTextColor={theme.texteClair}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Date de naissance</Text>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateBtnLabel}>Date de naissance</Text>
          <Text style={styles.dateBtnValeur}>
            {dateValide(dateNaissance) ? dateNaissance : 'Selectionner une date'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateSelectionnee}
            mode="date"
            display="spinner"
            {...(Platform.OS === 'android' ? { initialInputMode: 'keyboard' as const } : {})}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(_, selectedDate) => {
              if (Platform.OS !== 'ios') setShowDatePicker(false);
              if (!selectedDate) return;
              setDateNaissance(formaterDateProfil(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear()));
            }}
          />
        )}

        {Platform.OS === 'ios' && showDatePicker && (
          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.closeBtnText}>Fermer</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.bouton} onPress={lancerCalcul}>
          <Text style={styles.boutonTexte}>Calculer</Text>
        </TouchableOpacity>
      </View>

      {erreur && <Text style={styles.erreur}>{erreur}</Text>}

      {resultat && (
        <>
          <Text style={styles.sousTitreResultats}>Analyse personnalisée</Text>
          <View style={styles.resumeBloc}>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Prénom et Nom : </Text>
              {resultat.nomComplet}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Date de naissance : </Text>
              {resultat.dateNaissance}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Nombre d'évolution : </Text>
              {resultat.totalEvolution}/{resultat.nbEvolution}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Chemin de Vie : </Text>
              {resultat.totalCheminDeVie}/{resultat.cheminDeVie}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Nombre Intime : </Text>
              {resultat.sommeVoyelles}/{resultat.nbIntime}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Nombre de Réalisation : </Text>
              {resultat.sommeConsonnes}/{resultat.nbRealisation}
            </Text>
            <Text style={styles.resumeLigne}>
              <Text style={styles.label}>Nombre d'Expression : </Text>
              {resultat.totalExpression}/{resultat.nbExpression}
            </Text>
          </View>

          <Text style={styles.sectionTitre}>Description du chemin de vie</Text>
          <View style={styles.wpCard}>
            {chargementPage && <ActivityIndicator color={theme.titreSecond} />}
            {erreurPage && <Text style={styles.wpError}>{erreurPage}</Text>}
            {detailArticle && (
              <>
                <Text style={styles.wpTitle}>{detailArticle.title}</Text>
                <MobileArticleBody blocks={detailArticle.blocks} />
                <TouchableOpacity style={styles.wpBtn} onPress={() => pageWp?.link && Linking.openURL(pageWp.link)}>
                  <Text style={styles.wpBtnText}>Lire les autres articles</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <Text style={styles.sectionTitre}>Grille d'insertion</Text>
          <View style={styles.grille}>
            {[0, 1, 2].map((ligne) => (
              <View key={ligne} style={styles.ligne}>
                {[0, 1, 2].map((colonne) => {
                  const index = ligne * 3 + colonne;
                  const valeur = resultat.grilleInsertion[index];
                  const legende = LEGENDE_CASES[index];
                  const estDerniereColonne = colonne === 2;
                  const estDerniereLigne = ligne === 2;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.cellule,
                        !estDerniereColonne && styles.celluleBordureDroite,
                        !estDerniereLigne && styles.celluleBordureBas,
                      ]}
                    >
                      <Text style={[styles.celluleTexte, valeur === 0 && styles.celluleTexteZero]}>
                        {valeur}
                      </Text>
                      <Text style={styles.celluleLegende} numberOfLines={2}>
                        {legende}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
          {resultat.grilleInsertion.some((v) => v === 0) && (
            <Text style={styles.messageKarmique}>
              Cases a zero - lecons karmiques : les cases en rouge indiquent des domaines a travailler
              particulierement dans cette incarnation.
            </Text>
          )}
          <TouchableOpacity
            style={styles.shopCard}
            onPress={() => Linking.openURL('https://laksmie.fr/product-category/numerologie')}
          >
            <Text style={styles.shopTitle}>Aller plus loin dans ta comprehension</Text>
            <Text style={styles.shopSub}>
              Chaque nombre porte une signification profonde - analyses personnalisees, grilles d'ambiance et de realisation
              disponibles dans la boutique.
            </Text>
            <View style={styles.pillsRow}>
              {['Analyse détaillé incluant les défis', "Thème natal complet", 'Grille d\'ambiance et de réalisation', 'Abonnements'].map((p) => (
                <View key={p} style={styles.pill}>
                  <Text style={styles.pillText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.shopBtn}>Découvrir les analyses -&gt;</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  scroll: { padding: 18, paddingTop: 60, paddingBottom: 30 },
  titre: {
    fontSize: theme.typo.h1,
    fontWeight: '800',
    color: theme.titrePrinc,
    textAlign: 'left',
    marginBottom: 20,
  },
  introFormulaire: {
    fontSize: theme.typo.sousTitre,
    color: theme.titreSecond,
    marginBottom: 14,
  },
  formBloc: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: theme.typo.label,
    color: theme.titrePrinc,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: theme.typo.corps,
    color: theme.texte,
    marginBottom: 12,
  },
  dateBtn: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.titreSecond,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateBtnLabel: { fontSize: 12, color: theme.titreSecond, fontWeight: '700', marginBottom: 4 },
  dateBtnValeur: { fontSize: theme.typo.corps, color: theme.texte, fontWeight: '600' },
  closeBtn: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 10, marginBottom: 8 },
  closeBtnText: { fontSize: 13, color: theme.titreSecond, fontWeight: '700' },
  bouton: {
    backgroundColor: theme.titrePrinc,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  boutonTexte: { color: '#fff', fontSize: theme.typo.corps, fontWeight: '700' },
  erreur: { color: theme.defavorable, fontSize: theme.typo.label, marginBottom: 12, fontWeight: '600' },
  sousTitreResultats: {
    fontSize: theme.typo.h2,
    fontWeight: '800',
    color: theme.titrePrinc,
    marginBottom: 10,
  },
  resumeBloc: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 22,
  },
  resumeLigne: { fontSize: theme.typo.sousTitre, lineHeight: 28, color: '#000' },
  label: { fontWeight: '700' },
  sectionTitre: {
    fontSize: theme.typo.h3,
    fontWeight: '800',
    color: theme.titreSecond,
    marginBottom: 14,
  },
  wpCard: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  wpTitle: {
    fontSize: theme.typo.sousTitre,
    fontWeight: '700',
    color: theme.titrePrinc,
    marginBottom: 8,
  },
  wpContent: {
    fontSize: theme.typo.corps,
    color: theme.texte,
    lineHeight: 22,
    marginBottom: 12,
  },
  wpError: {
    color: theme.defavorable,
    fontSize: theme.typo.label,
    fontWeight: '600',
  },
  wpBtn: {
    backgroundColor: theme.titrePrinc,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  wpBtnText: {
    color: theme.blanc,
    fontWeight: '700',
    fontSize: 13,
  },
  grille: {
    borderWidth: 1,
    borderColor: theme.tableBorder,
    backgroundColor: theme.blanc,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageKarmique: {
    marginTop: 12,
    fontSize: theme.typo.label,
    color: theme.defavorable,
    fontWeight: '600',
    lineHeight: 20,
  },
  shopCard: {
    backgroundColor: theme.blanc,
    borderWidth: 0.5,
    borderColor: theme.titreSecond,
    borderRadius: 12,
    padding: 18,
    marginBottom: 22,
    marginTop: 14,
  },
  shopTitle: { fontSize: 15, fontWeight: '600', color: theme.titreSecond, marginBottom: 6 },
  shopSub: { fontSize: 13, color: theme.titrePrinc, lineHeight: 20, marginBottom: 14 },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  pill: {
    backgroundColor: theme.tableHeaderBackground,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.titreSecond,
  },
  pillText: { fontSize: 12, color: theme.titrePrinc },
  shopBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.blanc,
    backgroundColor: theme.titrePrinc,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  ligne: { flexDirection: 'row' },
  cellule: {
    flex: 1,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  celluleBordureDroite: { borderRightWidth: 1, borderRightColor: '#e4e4e4' },
  celluleBordureBas: { borderBottomWidth: 1, borderBottomColor: '#e4e4e4' },
  celluleTexte: { fontSize: 30, fontWeight: '600', color: '#000' },
  celluleTexteZero: { color: theme.defavorable },
  celluleLegende: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    color: theme.texteClair,
    textAlign: 'center',
    lineHeight: 13,
  },
});