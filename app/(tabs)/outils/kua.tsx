import DateProfileForm from '@/components/date-profile-form';
import { useUser } from '@/context/UserContext';
import { theme } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function calculerKua(annee: number, genre: 'homme' | 'femme'): number {
  const apres2000 = annee >= 2000;
  let r = annee % 100;
  while (r > 9) {
    r = Math.floor(r / 10) + (r % 10);
  }

  let kua: number;

  if (genre === 'homme') {
    kua = apres2000 ? 9 - r : 10 - r;
    if (kua === 5) kua = 2;
  } else {
    kua = apres2000 ? r + 6 : r + 5;
    while (kua > 9) {
      kua = Math.floor(kua / 10) + (kua % 10);
    }
    if (kua === 5) kua = 8;
  }

  return kua;
}

const descriptions: Record<number, { groupe: string; couleur: string; element: string }> = {
  1: { groupe: 'Est', couleur: '#4a90d9', element: 'Eau' },
  2: { groupe: 'Ouest', couleur: '#c8a96e', element: 'Terre' },
  3: { groupe: 'Est', couleur: '#5aaa5a', element: 'Bois' },
  4: { groupe: 'Est', couleur: '#7ab87a', element: 'Bois' },
  6: { groupe: 'Ouest', couleur: '#c0c0c0', element: 'Métal' },
  7: { groupe: 'Ouest', couleur: '#d4a0a0', element: 'Métal' },
  8: { groupe: 'Ouest', couleur: '#b8956a', element: 'Terre' },
  9: { groupe: 'Est', couleur: '#d9534a', element: 'Feu' },
};

export default function KuaScreen() {
  const { user } = useUser();
  const resultat = user.genre ? calculerKua(user.annee, user.genre) : null;
  const info = resultat ? descriptions[resultat] : null;
  const dateTexte = `${String(user.jour).padStart(2, '0')}/${String(user.mois).padStart(2, '0')}/${user.annee}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titre}>Nombre Kua</Text>

      <View style={styles.resume}>
        <Text style={styles.resumeLabel}>Date enregistree</Text>
        <Text style={styles.resumeValeur}>{dateTexte}</Text>
        <Text style={styles.resumeLabel}>Genre enregistre</Text>
        <Text style={styles.resumeValeur}>{user.genre ? (user.genre === 'homme' ? 'Homme' : 'Femme') : 'Non defini'}</Text>
      </View>

      {/* Résultat */}
      {resultat && info && (
        <View style={[styles.resultat, { borderColor: info.couleur }]}>
          <Text style={styles.resultatChiffre}>{resultat}</Text>
          <Text style={styles.resultatGroupe}>Groupe {info.groupe}</Text>
          <Text style={styles.resultatElement}>Élément : {info.element}</Text>
        </View>
      )}
      {!resultat && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Renseigne ton genre dans l&apos;onglet Profil pour afficher ton nombre Kua.
          </Text>
        </View>
      )}

      {/* Note calendrier chinois */}
      <View style={styles.note}>
        <Text style={styles.noteTexte}>
          ⚠️ Note : Le calendrier Feng Shui commence entre le 4 et le 6 février.
          Si vous êtes né(e) en janvier ou début février, votre année Feng Shui
          est celle de l&apos;année précédente. Ce calcul sera affiné prochainement.
        </Text>
      </View>

      <DateProfileForm />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  content: { padding: 24, paddingTop: 60 },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 28 },
  resume: { backgroundColor: theme.blanc, borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: theme.titreSecond, marginBottom: 12 },
  resumeLabel: { fontSize: 13, color: theme.titreSecond, fontWeight: '600', marginTop: 6 },
  resumeValeur: { fontSize: 16, color: theme.texte, fontWeight: '700' },
  resultat: { marginTop: 28, backgroundColor: theme.blanc, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 3 },
  resultatChiffre: { fontSize: 64, fontWeight: 'bold', color: theme.titrePrinc },
  resultatGroupe: { fontSize: 18, color: theme.titreSecond, fontWeight: '600', marginTop: 8 },
  resultatElement: { fontSize: 15, color: '#666', marginTop: 4 },
  infoBox: { marginTop: 8, backgroundColor: '#fff8e7', borderRadius: 10, padding: 14, borderLeftWidth: 4, borderLeftColor: theme.warning },
  infoText: { fontSize: 13, color: '#7a5c00', lineHeight: 20 },
  note: { marginTop: 24, backgroundColor: '#fff8e7', borderRadius: 10, padding: 14, borderLeftWidth: 4, borderLeftColor: theme.warning, marginBottom: 20 },
  noteTexte: { fontSize: 13, color: '#7a5c00', lineHeight: 20 },
});