import { View, Text, Image, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

const today = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Date en haut */}
      <Text style={styles.date}>{today}</Text>

      {/* Logo centré */}
      <Image
        source={require('@/assets/images/Laksmie-logo-rose.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Titre principal */}
      <Text style={styles.titre}>Feng Shui</Text>

      {/* Sous-titre */}
      <Text style={styles.sousTitre}>Outils & Enseignements</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.fond,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  date: {
    position: 'absolute',
    top: 100,
    fontSize: 13,
    color: theme.titreSecond,
    letterSpacing: 1,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  titre: {
    fontSize: theme.typo.h1,
    fontWeight: 'bold',
    color: theme.titrePrinc,
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: theme.typo.sousTitre,
    color: theme.titreSecond,
    letterSpacing: 2,
  },
});