import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '@/context/UserContext';
import { theme } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfilScreen() {
  const { user, setUser } = useUser();
  const [prenom, setPrenom] = useState(user.prenom);
  const [nom, setNom] = useState(user.nom ?? '');
  const [jour, setJour] = useState(user.jour);
  const [mois, setMois] = useState(user.mois);
  const [annee, setAnnee] = useState(user.annee);
  const [genre, setGenre] = useState<'homme' | 'femme' | null>(user.genre);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setPrenom(user.prenom);
    setNom(user.nom ?? '');
    setJour(user.jour);
    setMois(user.mois);
    setAnnee(user.annee);
    setGenre(user.genre);
  }, [user.annee, user.genre, user.jour, user.mois, user.nom, user.prenom]);

  const initiale = prenom ? prenom[0].toUpperCase() : '?';

  const sauvegarder = () => {
    setUser({ prenom, nom, jour, mois, annee, genre });
    setSauvegarde(true);
    setTimeout(() => setSauvegarde(false), 2000);
  };

  const dateSelectionnee = new Date(annee, mois - 1, jour);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titre}>Mon Profil</Text>

      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexte}>{initiale}</Text>
        </View>
        <TextInput
          style={styles.prenomInput}
          value={prenom}
          onChangeText={setPrenom}
          placeholder="Ton prenom"
          placeholderTextColor={theme.texteClair}
          textAlign="center"
        />
        <TextInput
          style={styles.nomInput}
          value={nom}
          onChangeText={setNom}
          placeholder="Ton nom"
          placeholderTextColor={theme.texteClair}
          textAlign="center"
        />
      </View>

      <Text style={styles.sousTitre}>
        Entre ta date de naissance et ton genre pour personnaliser tes outils.
      </Text>

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateBtnLabel}>Date de naissance</Text>
        <Text style={styles.dateBtnValeur}>
          {dateSelectionnee.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
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
            setJour(selectedDate.getDate());
            setMois(selectedDate.getMonth() + 1);
            setAnnee(selectedDate.getFullYear());
          }}
        />
      )}

      <View style={styles.genreWrap}>
        <View style={styles.genreToggle}>
          <TouchableOpacity
            style={[styles.genreOption, genre === 'homme' && styles.genreActif]}
            onPress={() => setGenre('homme')}
          >
            <Text style={[styles.genreTexte, genre === 'homme' && styles.genreTexteActif]}>
              Homme
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genreOption, genre === 'femme' && styles.genreActif]}
            onPress={() => setGenre('femme')}
          >
            <Text style={[styles.genreTexte, genre === 'femme' && styles.genreTexteActif]}>
              Femme
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTexte}>
          ⚠️ Si tu es ne(e) en janvier ou avant le 4 fevrier, ton annee Feng Shui
          est celle de l&apos;annee precedente. Cette correction sera ajoutee prochainement.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, sauvegarde && styles.saveBtnOk]}
        onPress={sauvegarder}
      >
        <Text style={styles.saveBtnTexte}>
          {sauvegarde ? '✓ Sauvegarde !' : 'Sauvegarder'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  content: { padding: 24, paddingTop: 60, alignItems: 'center' },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 24, alignSelf: 'flex-start' },
  avatarWrap: { alignItems: 'center', marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.titrePrinc, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTexte: { fontSize: 32, fontWeight: 'bold', color: theme.blanc },
  prenomInput: { fontSize: 20, color: theme.titrePrinc, borderBottomWidth: 1, borderBottomColor: theme.titrePrinc, paddingBottom: 4, minWidth: 150, textAlign: 'center' },
  nomInput: {
    fontSize: 16,
    color: theme.titrePrinc,
    borderBottomWidth: 1,
    borderBottomColor: theme.titrePrinc,
    paddingBottom: 4,
    minWidth: 150,
    marginTop: 10,
    textAlign: 'center',
  },
  sousTitre: { fontSize: 14, color: theme.titrePrinc, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  dateBtn: { width: '100%', backgroundColor: theme.blanc, borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: theme.titreSecond, marginBottom: 24 },
  dateBtnLabel: { fontSize: 13, color: theme.titreSecond, fontWeight: '700', marginBottom: 6 },
  dateBtnValeur: { fontSize: 17, color: theme.texte, fontWeight: '600' },
  genreWrap: { marginBottom: 24 },
  genreToggle: { flexDirection: 'row', backgroundColor: '#e0dce0', borderRadius: 25, padding: 4 },
  genreOption: { paddingHorizontal: 32, paddingVertical: 10, borderRadius: 22 },
  genreActif: { backgroundColor: theme.blanc },
  genreTexte: { fontSize: 15, color: theme.texteClair, fontWeight: '600' },
  genreTexteActif: { color: theme.titrePrinc },
  note: { backgroundColor: '#fff8e7', borderRadius: 10, padding: 12, borderLeftWidth: 4, borderLeftColor: theme.warning, marginBottom: 24, width: '100%' },
  noteTexte: { fontSize: 12, color: '#7a5c00', lineHeight: 18 },
  saveBtn: { backgroundColor: theme.titrePrinc, borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center' },
  saveBtnOk: { backgroundColor: theme.favorable },
  saveBtnTexte: { color: theme.blanc, fontSize: 16, fontWeight: 'bold' },
});
