import { theme } from '@/constants/theme';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const BOUTIQUE_URL = 'https://laksmie.fr/product-category/astrologie-vedique';
const LAKSMIE_SITE_URL = 'https://laksmie.fr';
const CONTACT_EMAIL = 'contact@laksmie.fr';

const AVANTAGES = [
  {
    titre: 'Une précision sidérale',
    accroche: 'Pour arrêter de te reconnaître à moitié dans ton thème',
    texte:
      "Le Jyotish utilise le zodiaque sidéral, aligné sur les constellations réelles. Là où l'astrologie occidentale a « dérivé » de 23° depuis l'Antiquité, le Jyotish reste ancré dans le ciel tel qu'il est.",
  },
  {
    titre: 'Les Dashas',
    accroche: 'Pour comprendre pourquoi certaines périodes bloquent… et d’autres s’ouvrent',
    texte:
      "Le système des Dashas (Vimshotarri et autres) découpe la vie en périodes planétaires précises. Là où d'autres systèmes lisent les transits au jour le jour, le Jyotish identifie les grandes saisons de vie — et leurs sous-cycles.",
  },
  {
    titre: 'Chartes divisionnelles',
    accroche: 'Pour relier ce que tu vis… à ce que tu es venu expérimenter',
    texte:
      "La carte Rasi (D1) révèle le destin global. Le Navamsha (D9) éclaire le karma spirituel, les relations et la seconde partie de vie. D10 éclaire la carrière, D2, les finances... Ensemble, ils offrent une profondeur inaccessible avec une seule carte.",
  },
  {
    titre: 'Un outil de connaissance de soi',
    texte:
      "Né en Inde il y a plus de 5 000 ans, le Jyotish n'est pas un outil prédictif figé. C'est un outil donné par les rishis pour aligner notre vie individuelle avec le cosmos conscient, une carte de navigation pour agir en conscience, comprendre ses tendances karmiques et orienter ses choix.",
  },
];

const PRESTATIONS = [
  {
    nom: 'Explorer ton thème en profondeur (D1 & D9 complet)',
    detail: 'Maisons, planètes, yogas — vues détaillées des 2 chartes.',
  },
  {
    nom: 'Comprendre ta période actuelle (Dashas & timing)',
    detail: 'Grands cycles et fenêtres de vie : ce qui pèse vraiment maintenant.',
  },
  {
    nom: 'Clarifier tes relations (synastrie)',
    detail: 'Deux thèmes en dialogue : dynamiques réelles entre vous.',
  },
  {
    nom: 'Accéder à tes données pour explorer avec l’IA',
    detail: 'Export fiable des repères essentiels (D1, D9) pour questionner avec méthode.',
  },
];

export default function JyotishScreen() {
  const handleReserver = () => Linking.openURL(BOUTIQUE_URL);
  const handleLaksmieSite = () => Linking.openURL(LAKSMIE_SITE_URL);
  const handleContact = () => Linking.openURL(`mailto:${CONTACT_EMAIL}`);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.surtitre}>Astrologie védique</Text>
        <Text style={styles.titre}>Jyotish</Text>
        <Text style={styles.sousTitre}>
          La Science de la Lumière {'\n'} Comprends enfin les raisons profondes de tes blocages
        </Text>
      </View>

      <Image
        source={require('@/assets/images/icone-jyotish1.png')}
        style={styles.introImage}
        resizeMode="contain"
      />

      {/* Intro */}
      <View style={styles.introBloc}>
        <Text style={styles.introTexte}>
          Et si ton thème astral actuel… n’était pas fiable ?
			Le Jyotish est une science de la conscience. Mais encore faut-il partir des bonnes données.{'\n'}
			Avec les outils que je propose, tu explores ton thème à partir de calculs vérifiés, pour enfin comprendre ce qui se joue vraiment dans ta vie.
        </Text>
      </View>

      {/* Avantages */}
      <Text style={styles.sectionTitre}>Pourquoi le Jyotish ?</Text>
      <Text style={styles.sectionSousTitre}>Ce que tu ne peux pas voir avec une astrologie classique</Text>
      {AVANTAGES.map((a) => (
        <View key={a.titre} style={styles.avantageCard}>
          <Text style={styles.avantageTitre}>{a.titre}</Text>
          {'accroche' in a && a.accroche ? (
            <Text style={styles.avantageAccroche}>{a.accroche}</Text>
          ) : null}
          <Text style={styles.avantageTexte}>{a.texte}</Text>
        </View>
      ))}

      {/* Prestations — choix guidé */}
      <Text style={styles.sectionTitre}>Par où commencer ?</Text>
      <View style={styles.prestationsBloc}>
        {PRESTATIONS.map((p, i) => (
          <View key={p.nom} style={[styles.prestationLigne, i < PRESTATIONS.length - 1 && styles.prestationBorder]}>
            <View style={styles.bullet} />
            <View style={styles.prestationTextes}>
              <Text style={styles.prestationNom}>{p.nom}</Text>
              <Text style={styles.prestationDetail}>{p.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bloc IA */}
      <View style={styles.iaBloc}>
        <Text style={styles.iaTitre}>Nouveau — Explore ton thème avec l’IA</Text>
        <Text style={styles.iaTexte}>
        Mais enfin sur une base fiable. Tu reçois tes vraies données astrologiques + un guide simple pour poser les bonnes questions et préparer la consultation.
          {'\n\n'}
          Résultat :{'\n'}
          Tu ne lis plus des interprétations génériques.
          {'\n'}
          Tu explores ce qui te concerne vraiment.
        </Text>
      </View>

      {/* CTA */}
      <View style={styles.ctaBloc}>
        <TouchableOpacity style={styles.btnPrimaire} onPress={handleReserver} activeOpacity={0.82}>
          <Text style={styles.btnPrimaireTexte}>Comprendre mon destin →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondaire} onPress={handleContact} activeOpacity={0.82}>
          <Text style={styles.btnSecondaireTexte}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Conclusion — Laksmie */}
      <View style={styles.conclusionBloc}>
        <View style={styles.introBloc}>
          <Text style={styles.introTexte}>
            En attendant l'application Jyotish Laksmie, retrouve les cours sur le site et les vidéos sur YouTube.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.conclusionImageWrap}
          onPress={handleLaksmieSite}
          activeOpacity={0.85}
          accessibilityRole="link"
          accessibilityLabel="Ouvrir laksmie.fr"
        >
          <Image
            source={require('@/assets/images/Logo Laksmie Ruban rainbow.png')}
            style={styles.conclusionImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fond,
  },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 18,
    marginBottom: 4,
  },
  surtitre: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: theme.titreSecond,
    marginBottom: 8,
    fontWeight: '500',
  },
  titre: {
    fontSize: 52,
    fontWeight: '800',
    color: theme.titrePrinc,
    letterSpacing: -1,
    marginBottom: 10,
  },
  sousTitre: {
    fontSize: 15,
    color: theme.texte ?? '#555',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },

  // Intro
  introBloc: {
    borderLeftWidth: 3,
    borderLeftColor: theme.titreSecond,
    paddingLeft: 14,
    marginBottom: 16,
  },
  introImage: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 28,
    alignSelf: 'center',
  },
  introTexte: {
    fontSize: 15,
    lineHeight: 24,
    color: theme.texte ?? '#333',
    fontStyle: 'italic',
  },

  // Section titre
  sectionTitre: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.titreSecond,
    marginBottom: 14,
    marginTop: 14,
  },
  sectionSousTitre: {
    fontSize: 15,
    fontWeight: '400',
    fontStyle: 'normal',
    color: theme.texte ?? '#444',
    lineHeight: 22,
    marginTop: -6,
    marginBottom: 14,
  },
  guidedLead: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.texte ?? '#555',
    marginBottom: 16,
    marginTop: 10,
    fontStyle: 'normal',
    fontWeight: '500',
  },

  // Avantages
  avantageCard: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  avantageTitre: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.titreH3,
    marginBottom: 6,
    marginTop: 2,
  },
  avantageAccroche: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.texte ?? '#333',
    fontWeight: '500',
    marginBottom: 8,
    fontStyle: 'normal',
  },
  avantageTexte: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.texte ?? '#444',
  },

  // Prestations
  prestationsBloc: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.tableBorder,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden',
  },
  prestationLigne: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  prestationBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.tableBorder,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.titreSecond,
    marginTop: 6,
    flexShrink: 0,
  },
  prestationTextes: { flex: 1 },
  prestationNom: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.titreH3,
    marginBottom: 2,
  },
  prestationDetail: {
    fontSize: 13,
    color: theme.texte ?? '#666',
    lineHeight: 19,
  },

  // Bloc IA
  iaBloc: {
    backgroundColor: theme.titreSecond + '12',
    borderWidth: 1,
    borderColor: theme.titreSecond + '40',
    borderRadius: 10,
    padding: 16,
    marginBottom: 28,
  },
  iaTitre: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.titreSecond,
    marginBottom: 8,
    marginTop: 2,
  },
  iaTexte: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.texte ?? '#444',
  },

  // CTA
  ctaBloc: {
    gap: 10,
  },
  ctaAvant: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.texte ?? '#444',
    textAlign: 'center',
    marginBottom: 4,
  },
  btnPrimaire: {
    backgroundColor: theme.titrePrinc,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaireTexte: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  btnSecondaire: {
    backgroundColor: theme.blanc,
    borderWidth: 1,
    borderColor: theme.titreSecond,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnSecondaireTexte: {
    color: theme.titreSecond,
    fontSize: 15,
    fontWeight: '600',
  },

  conclusionBloc: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.tableBorder,
  },
  conclusionImageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.tableBorder,
    backgroundColor: theme.blanc,
    alignItems: 'center',
  },
  conclusionImage: {
    width: '100%',
    height: 176,
    backgroundColor: theme.blanc,
  },
});
