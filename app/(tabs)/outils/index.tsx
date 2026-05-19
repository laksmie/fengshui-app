import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

const outils = [
  { id: 'kua',      label: 'Nombre Kua',        image: require('@/assets/images/icone-Kua.png'),        route: '/outils/kua'      },
  { id: 'boussole', label: 'Boussole Feng Shui', image: require('@/assets/images/icone-boussole.png'),   route: '/outils/boussole' },
  { id: 'logement', label: 'Lo Shu Logement',    image: require('@/assets/images/icone-logement.png'),   route: '/outils/logement' },
  { id: 'temporel', label: 'Lo Shu Temporel',    image: require('@/assets/images/icone-temporel.png'),   route: '/outils/temporel' },
];

const bonus = [
  { id: 'numerologie', label: 'Numérologie', image: require('@/assets/images/icone-numerologie.png'), route: '/outils/numerologie' },
  { id: 'astrologie', label: 'Astrologie', image: require('@/assets/images/icone-jyotish.png'), route: '/outils/jyotish' },
];

function Carte({ outil, onPress }: { outil: typeof outils[0], onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.carte} onPress={onPress}>
      <Image source={outil.image} style={styles.carteImage} resizeMode="cover" />
      <View style={styles.carteOverlay}>
        <Text style={styles.carteLabel}>{outil.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function Outils() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titre}>Outils</Text>

      <View style={styles.grille}>
        {outils.map(outil => (
          <Carte
            key={outil.id}
            outil={outil}
            onPress={() => router.push(outil.route as any)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitre}>BONUS</Text>
      <View style={styles.grille}>
        {bonus.map(outil => (
          <Carte
            key={outil.id}
            outil={outil}
            onPress={() => router.push(outil.route as any)}
          />
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fond,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  titre: {
    fontSize: theme.typo.h1,
    fontWeight: 'bold',
    color: theme.titrePrinc,
    marginBottom: 24,
  },
  sectionTitre: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.titreSecond,
    letterSpacing: 1.5,
    marginTop: 28,
    marginBottom: 16,
    marginLeft: 4,
  },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  carte: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  carteImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  carteOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(95, 81, 115, 0.72)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  carteLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});