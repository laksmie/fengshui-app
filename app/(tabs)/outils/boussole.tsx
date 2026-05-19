import DateProfileForm from '@/components/date-profile-form';
import KUA_DIRECTIONS from '@/constants/kuaDirections';
import { theme } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const TAILLE = width * 0.82;

type DirectionInfo = {
  nom: string;
  element: string;
  emoji: string;
  description: string;
};

const ELEMENTS_IMAGES: Record<string, any> = {
  'Eau':   require('@/assets/images/5-Eau.png'),
  'Bois':  require('@/assets/images/1. Bois.png'),
  'Feu':   require('@/assets/images/2. Feu.png'),
  'Terre': require('@/assets/images/3. Terre.png'),
  'Métal': require('@/assets/images/4. Metal.png'),
};

const DIRECTIONS: Record<string, DirectionInfo> = {
  'N':  { nom: 'Nord',       element: 'Eau',   emoji: '💧', description: 'Carrière & Vie professionnelle' },
  'NE': { nom: 'Nord-Est',   element: 'Terre', emoji: '⛰️', description: 'Connaissance & Spiritualité'   },
  'E':  { nom: 'Est',        element: 'Bois',  emoji: '🌿', description: 'Famille & Santé'               },
  'SE': { nom: 'Sud-Est',    element: 'Bois',  emoji: '🍃', description: 'Richesse & Abondance'          },
  'S':  { nom: 'Sud',        element: 'Feu',   emoji: '🔥', description: 'Réputation & Célébrité'        },
  'SO': { nom: 'Sud-Ouest',  element: 'Terre', emoji: '🌍', description: 'Amour & Relations'             },
  'O':  { nom: 'Ouest',      element: 'Métal', emoji: '⚙️', description: 'Créativité & Enfants'          },
  'NO': { nom: 'Nord-Ouest', element: 'Métal', emoji: '🌙', description: 'Mentors & Voyages'             },
};

const ORDRE = ['N','NE','E','SE','S','SO','O','NO'];

function getDirectionKey(angle: number): string {
  const i = Math.round(angle / 45) % 8;
  return ORDRE[i];
}

function calculerKua(annee: number, genre: 'homme' | 'femme'): number {
  const apres2000 = annee >= 2000;
  let r = annee % 100;
  while (r > 9) r = Math.floor(r / 10) + (r % 10);

  let kua = genre === 'homme'
    ? (apres2000 ? 9 - r : 10 - r)
    : (apres2000 ? r + 6 : r + 5);

  while (kua > 9) kua = Math.floor(kua / 10) + (kua % 10);
  if (kua === 5) kua = genre === 'homme' ? 2 : 8;
  return kua;
}

export default function BoussoleScreen() {
  const [angle, setAngle] = useState(0);
  const [calibre, setCalib] = useState(false);
  const historique = useRef<number[]>([]);

  const rotation = useState(new Animated.Value(0))[0];
  const { user } = useUser();
  const kua = user.genre ? calculerKua(user.annee, user.genre) : null;

  const dirKey = getDirectionKey(angle);
  const dirInfo = DIRECTIONS[dirKey];
  const kuaData = kua ? KUA_DIRECTIONS[kua] : null;

  const estFavorable = kuaData?.favorables.includes(dirKey);
  const couleurAiguille = !kuaData ? theme.titrePrinc
    : estFavorable ? theme.favorable
    : theme.defavorable;

  const calibrer = () => {
    historique.current = [];
    setCalib(true);
    setTimeout(() => setCalib(false), 3000);
  };

  useEffect(() => {
    Magnetometer.setUpdateInterval(100);
    const sub = Magnetometer.addListener(({ x, y }) => {
      const magnetic = ((Math.atan2(y, x) * (180 / Math.PI)) + 360) % 360;
      const heading = (magnetic + 270) % 360; // corrige l'orientation (0° = Nord)

      // Lissage sur 5 mesures pour limiter le jitter.
      const hist = historique.current;
      const dernier = hist[hist.length - 1] ?? heading;
      let diff = heading - dernier;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      hist.push(dernier + diff);
      if (hist.length > 5) hist.shift();
      const lisse = ((hist.reduce((a, b) => a + b, 0) / hist.length) % 360 + 360) % 360;

      setAngle(lisse);
      Animated.spring(rotation, {
        toValue: -lisse,
        useNativeDriver: true,
        friction: 8,
      }).start();
    });
    return () => sub.remove();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ['-360deg', '0deg', '360deg'],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titre}>Boussole Feng Shui</Text>

      {!kua && (
        <View style={styles.alerte}>
          <Text style={styles.alerteTexte}>
            💡 Calcule ton nombre Kua pour voir tes directions favorables
          </Text>
        </View>
      )}

      {/* Boussole */}
      <View style={styles.boussoleWrap}>

        {/* Cercle qui tourne */}
        <Animated.View style={[styles.cercle, { transform: [{ rotate }] }]}>
          {ORDRE.map((key, i) => {
            const angleDir = i * 45;
            const rad = (angleDir - 90) * (Math.PI / 180);
            const r = TAILLE * 0.34;
            const x = r * Math.cos(rad);
            const y = r * Math.sin(rad);
            const fav = kuaData?.favorables.includes(key);
            const def = kuaData?.defavorables.includes(key);
            return (
              <View key={key} style={[styles.secteur, { transform: [{ translateX: x }, { translateY: y }] }]}>
                <Image
                  source={ELEMENTS_IMAGES[DIRECTIONS[key].element]}
                  style={styles.secteurImage}
                  resizeMode="contain"
                />
                <Text style={[
                  styles.secteurLabel,
                  fav && styles.labelFav,
                  def && styles.labelDef,
                ]}>
                  {key}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        {/* Aiguille fixe */}
        <View style={styles.aiguilleWrap}>
          <View style={[styles.aiguilleNord, { backgroundColor: couleurAiguille }]} />
          <View style={styles.aiguilleSud} />
        </View>

        {/* Centre */}
        <View style={[styles.centrePoint, { backgroundColor: couleurAiguille }]} />
      </View>

      {/* Carte info direction */}
      <View style={[styles.carte, {
        borderColor: !kuaData ? theme.titrePrinc : estFavorable ? theme.favorable : theme.defavorable
      }]}>
        <Text style={styles.carteEmoji}>{dirInfo.emoji}</Text>
        <Text style={styles.carteDirection}>{dirInfo.nom}</Text>
        <Text style={styles.carteElement}>Élément {dirInfo.element}</Text>
        <Text style={styles.carteDesc}>{dirInfo.description}</Text>

        {kuaData && (
          <View style={[styles.badge, { backgroundColor: estFavorable ? '#e8f5e9' : '#ffebee' }]}>
            <Text style={[styles.badgeTexte, { color: estFavorable ? theme.favorable : theme.defavorable }]}>
              {estFavorable ? '✅ Direction favorable' : '⛔ Direction défavorable'}
            </Text>
          </View>
        )}

        <Text style={styles.degres}>{Math.round(angle)}°</Text>
      </View>

      {/* Légende */}
      {kuaData && (
        <View style={styles.legende}>
          <Text style={styles.legendeTitre}>Ton Kua : {kua}</Text>
          <Text style={styles.legendeFav}>✅ Favorables : {kuaData.favorables.join(' · ')}</Text>
          <Text style={styles.legendeDef}>⛔ Défavorables : {kuaData.defavorables.join(' · ')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.calibBtn, calibre && styles.calibBtnActif]}
        onPress={calibrer}
      >
        <Text style={styles.calibTexte}>
          {calibre
            ? '🔄 Fais un mouvement en 8 avec ton téléphone...'
            : '🧲 Calibrer la boussole'}
        </Text>
      </TouchableOpacity>

      <View style={styles.note}>
        <Text style={styles.noteTexte}>
          ⚠️ Éloigne-toi des objets métalliques pour une meilleure précision.
        </Text>
      </View>

      <DateProfileForm />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond },
  content: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 16, paddingBottom: 24 },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 12 },
  alerte: { backgroundColor: '#fff8e7', borderRadius: 10, padding: 10, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: theme.warning },
  alerteTexte: { fontSize: 13, color: '#7a5c00' },
  boussoleWrap: { width: TAILLE, height: TAILLE, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  cercle: { position: 'absolute', width: TAILLE, height: TAILLE, borderRadius: TAILLE / 2, backgroundColor: theme.blanc, borderWidth: 3, borderColor: theme.titrePrinc, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  secteur: { position: 'absolute', alignItems: 'center' },
  secteurEmoji: { fontSize: 18 },
  secteurImage: { width: 28, height: 28, marginBottom: 2 },
  secteurLabel: { fontSize: 12, fontWeight: '700', color: theme.titrePrinc },
  labelFav: { color: theme.favorable },
  labelDef: { color: theme.defavorable },
  aiguilleWrap: { position: 'absolute', width: 8, height: TAILLE * 0.55, alignItems: 'center', zIndex: 10 },
  aiguilleNord: { flex: 1, width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  aiguilleSud: { flex: 1, width: 8, backgroundColor: '#bbb', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  centrePoint: { position: 'absolute', width: 16, height: 16, borderRadius: 8, zIndex: 11 },
  carte: { width: '100%', backgroundColor: theme.blanc, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 3, marginBottom: 12 },
  carteEmoji: { fontSize: 28, marginBottom: 4 },
  carteDirection: { fontSize: 20, fontWeight: 'bold', color: theme.titrePrinc },
  carteElement: { fontSize: 14, color: '#666', marginBottom: 4 },
  carteDesc: { fontSize: 13, color: theme.titrePrinc, fontStyle: 'italic', textAlign: 'center', marginBottom: 8 },
  badge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 6 },
  badgeTexte: { fontSize: 13, fontWeight: '700' },
  degres: { fontSize: 16, fontWeight: '700', color: '#777' },
  legende: { width: '100%', backgroundColor: theme.blanc, borderRadius: 12, padding: 14 },
  legendeTitre: { fontSize: 14, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 6 },
  legendeFav: { fontSize: 13, color: theme.favorable, marginBottom: 4 },
  legendeDef: { fontSize: 13, color: theme.defavorable },
  calibBtn: { width: '100%', backgroundColor: theme.blanc, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: theme.titrePrinc },
  calibBtnActif: { backgroundColor: '#fff8e7', borderColor: theme.warning },
  calibTexte: { fontSize: 14, color: theme.titrePrinc, fontWeight: '600' },
  note: { backgroundColor: '#fff8e7', borderRadius: 10, padding: 12, borderLeftWidth: 4, borderLeftColor: theme.warning, width: '100%', marginBottom: 12 },
  noteTexte: { fontSize: 12, color: '#7a5c00', lineHeight: 18 },
});