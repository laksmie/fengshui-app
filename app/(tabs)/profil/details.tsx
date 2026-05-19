import { theme } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RESEAUX = [
  {
    label: 'YouTube',
    image: require('@/assets/images/icon-youtube.png'),
    url: 'https://www.youtube.com/@laksmiesiva5220',
  },
  {
    label: 'Facebook',
    image: require('@/assets/images/facebook.png'),
    url: 'https://www.facebook.com/laksmie.siva',
  },
  {
    label: 'Instagram',
    image: require('@/assets/images/icon-insta.png'),
    url: 'https://www.instagram.com/laksmie.siva/',
  },
];

export default function ProfilScreen() {
  const router = useRouter();
  const { user } = useUser();
  const initiale = user.prenom ? user.prenom[0].toUpperCase() : '?';
  const nomComplet = `${user.prenom || ''} ${user.nom || ''}`.trim();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titre}>Laksmie</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>{initiale}</Text>
        </View>
        <Text style={styles.prenomTexte}>{nomComplet || 'Ton prénom'}</Text>
      </View>

      <Text style={styles.sectionTitre}>MON PROFIL</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.ligne}
          onPress={() => router.push('/(tabs)/profil' as any)}
        >
          <Text style={styles.ligneEmoji}>👤</Text>
          <Text style={styles.ligneTexte}>Détails du profil</Text>
          <Text style={styles.ligneChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separateur} />
        <TouchableOpacity style={styles.ligne}>
          <Text style={styles.ligneEmoji}>🔔</Text>
          <Text style={styles.ligneTexte}>Rappels</Text>
          <Text style={styles.ligneChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{"VOUS AIMEZ L'APP ?"}</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.ligne}>
          <Text style={styles.ligneEmoji}>⭐</Text>
          <Text style={styles.ligneTexte}>{"Noter l'application"}</Text>
          <Text style={styles.ligneChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>{"BESOIN D'AIDE ?"}</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.ligne}
          onPress={() => Linking.openURL('mailto:contact@laksmie.fr')}
        >
          <Text style={styles.ligneEmoji}>✉️</Text>
          <Text style={styles.ligneTexte}>Nous contacter</Text>
          <Text style={styles.ligneChevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separateur} />
        <TouchableOpacity
          style={styles.ligne}
          onPress={() => Linking.openURL('https://laksmie.fr/privacy-policy')}
        >
          <Text style={styles.ligneEmoji}>🔒</Text>
          <Text style={styles.ligneTexte}>Politique de confidentialité</Text>
          <Text style={styles.ligneChevron}>›</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitre}>FOLLOW</Text>
      <View style={styles.reseauxRangee}>
        {RESEAUX.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={styles.reseauBouton}
            onPress={() => Linking.openURL(r.url)}
            activeOpacity={0.75}
          >
            <Image source={r.image} style={styles.reseauImage} resizeMode="contain" />
            <Text style={styles.reseauLabel}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.titrePrinc, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarTexte: { fontSize: 32, fontWeight: 'bold', color: theme.blanc },
  prenomTexte: { fontSize: 20, fontWeight: '600', color: theme.titrePrinc, marginBottom: 6 },
  kuaBadge: { backgroundColor: theme.titreSecond, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, color: theme.blanc, fontSize: 13, fontWeight: '600' },
  sectionTitre: { fontSize: 12, fontWeight: '700', color: theme.titreSecond, letterSpacing: 1.5, marginBottom: 8, marginTop: 16, marginLeft: 4 },
  section: { backgroundColor: theme.blanc, borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  ligne: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  ligneEmoji: { fontSize: 18, marginRight: 14 },
  ligneTexte: { flex: 1, fontSize: 16, color: theme.texte },
  ligneChevron: { fontSize: 22, color: '#ccc', fontWeight: '300' },
  separateur: { height: 1, backgroundColor: '#f0f0f0', marginLeft: 48 },
  reseauxRangee: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 32 },
  reseauBouton: { flex: 1, alignItems: 'center', gap: 6 },
  reseauImage: { width: 52, height: 52 },
  reseauLabel: { fontSize: 12, color: theme.texte, fontWeight: '500' },
});