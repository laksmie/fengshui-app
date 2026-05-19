import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '@/context/UserContext';
import { theme } from '@/constants/theme';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOIS = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

type Props = {
  title?: string;
  buttonLabel?: string;
};

export default function DateProfileForm({
  title = 'Modifier la date des calculs',
  buttonLabel = 'Appliquer cette date',
}: Props) {
  const { user, setUser } = useUser();
  const [jour, setJour] = useState(user.jour);
  const [mois, setMois] = useState(user.mois);
  const [annee, setAnnee] = useState(user.annee);
  const [genre, setGenre] = useState<'homme' | 'femme' | null>(user.genre);
  const [sauvegardeOk, setSauvegardeOk] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setJour(user.jour);
    setMois(user.mois);
    setAnnee(user.annee);
    setGenre(user.genre);
  }, [user.jour, user.mois, user.annee, user.genre]);

  const dateSelectionnee = new Date(annee, mois - 1, jour);

  const sauvegarder = () => {
    setUser({ jour, mois, annee, genre });
    setSauvegardeOk(true);
    setTimeout(() => setSauvegardeOk(false), 1500);
  };

  return (
    <View style={styles.edition}>
      <Text style={styles.editionTitre}>{title}</Text>

      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateBtnLabel}>Date de naissance</Text>
        <Text style={styles.dateBtnValeur}>
          {`${String(jour).padStart(2, '0')} ${MOIS[mois - 1]} ${annee}`}
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
            const j = selectedDate.getDate();
            const m = selectedDate.getMonth() + 1;
            const a = selectedDate.getFullYear();
            setJour(j);
            setMois(m);
            setAnnee(a);
            setUser({ jour: j, mois: m, annee: a, genre });
          }}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDatePicker(false)}>
          <Text style={styles.closeBtnText}>Fermer</Text>
        </TouchableOpacity>
      )}

      <View style={styles.genreToggle}>
        <TouchableOpacity
          style={[styles.genreOption, genre === 'homme' && styles.genreActif]}
          onPress={() => setGenre('homme')}
        >
          <Text style={[styles.genreTexte, genre === 'homme' && styles.genreTexteActif]}>Homme</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genreOption, genre === 'femme' && styles.genreActif]}
          onPress={() => setGenre('femme')}
        >
          <Text style={[styles.genreTexte, genre === 'femme' && styles.genreTexteActif]}>Femme</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.saveBtn, sauvegardeOk && styles.saveBtnOk]} onPress={sauvegarder}>
        <Text style={styles.saveBtnTexte}>{sauvegardeOk ? '✓ Sauvegarde !' : buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  edition: { width: '100%', marginTop: 16, backgroundColor: theme.blanc, borderRadius: 12, padding: 14 },
  editionTitre: { fontSize: 14, fontWeight: '700', color: theme.titrePrinc, marginBottom: 10 },
  dateBtn: { width: '100%', backgroundColor: theme.fond, borderRadius: 10, padding: 12, borderLeftWidth: 4, borderLeftColor: theme.titreSecond, marginBottom: 10 },
  dateBtnLabel: { fontSize: 12, color: theme.titreSecond, fontWeight: '700', marginBottom: 4 },
  dateBtnValeur: { fontSize: 16, color: theme.texte, fontWeight: '600' },
  closeBtn: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 10, marginBottom: 8 },
  closeBtnText: { fontSize: 13, color: theme.titreSecond, fontWeight: '700' },
  genreToggle: { flexDirection: 'row', backgroundColor: '#e0dce0', borderRadius: 25, padding: 4, alignSelf: 'center', marginBottom: 10 },
  genreOption: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 22 },
  genreActif: { backgroundColor: theme.blanc },
  genreTexte: { fontSize: 14, color: theme.texteClair, fontWeight: '600' },
  genreTexteActif: { color: theme.titrePrinc },
  saveBtn: { backgroundColor: theme.titrePrinc, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnOk: { backgroundColor: theme.favorable },
  saveBtnTexte: { color: theme.blanc, fontSize: 15, fontWeight: '700' },
});
