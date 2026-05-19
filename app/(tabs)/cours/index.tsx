import { blocksToPlainSearchText } from '@/components/mobile-article-body';
import { ecrireCache } from '@/components/mobile-api';
import { theme } from '@/constants/theme';
import { type CoursDetail, type CoursListItem, fetchCoursDetail, fetchCoursList } from '@/lib/cours-api';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/** Insensible à la casse / accents (compatible Hermes : évite \\p{M} seul). */
function normalise(s: string): string {
  const lower = s.toLowerCase().normalize('NFD');
  try {
    return lower.replace(/\p{M}/gu, '');
  } catch {
    return lower.replace(/[\u0300-\u036f]/g, '');
  }
}

function filtrerCours(
  liste: CoursListItem[],
  q: string,
  texteCorpsParId: Record<number, string>,
): CoursListItem[] {
  const t = q.trim();
  if (!t) {
    return liste;
  }
  const needle = normalise(t);
  return liste.filter((item) => {
    const titre = normalise(item.title);
    const extrait = normalise(item.excerpt || '');
    const idArticle = Number(item.id);
    const corps = normalise(texteCorpsParId[idArticle] ?? '');
    return titre.includes(needle) || extrait.includes(needle) || corps.includes(needle);
  });
}

const INDEX_BATCH_TAILLE = 3;

async function indexerUnCours(id: number): Promise<{
  id: number;
  plain: string;
  detail: CoursDetail | null;
}> {
  try {
    const detail = await fetchCoursDetail(id);
    const blocks = Array.isArray(detail?.blocks) ? detail.blocks : [];
    const fromBlocks = blocksToPlainSearchText(blocks);
    const titreDetail = String(detail?.title ?? '');
    const plain = [titreDetail, fromBlocks].filter(Boolean).join('\n');
    return { id, plain, detail };
  } catch {
    return { id, plain: '', detail: null };
  }
}

export default function Cours() {
  const [articles, setArticles] = useState<CoursListItem[]>([]);
  const [texteCorpsParId, setTexteCorpsParId] = useState<Record<number, string>>({});
  const [indexCorpsEnCours, setIndexCorpsEnCours] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const router = useRouter();

  const articlesFiltres = useMemo(
    () => filtrerCours(articles, recherche, texteCorpsParId),
    [articles, recherche, texteCorpsParId],
  );

  useEffect(() => {
    let annule = false;

    (async () => {
      try {
        const data = await fetchCoursList();
        if (!annule) {
          setArticles(data);
          setLoading(false);
        }
      } catch {
        if (!annule) {
          setErreur('Impossible de charger les cours.');
          setLoading(false);
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, []);

  useEffect(() => {
    if (articles.length === 0) {
      return;
    }
    let annule = false;
    setIndexCorpsEnCours(true);
    setTexteCorpsParId({});

    (async () => {
      for (let i = 0; i < articles.length; i += INDEX_BATCH_TAILLE) {
        if (annule) {
          return;
        }
        const lot = articles.slice(i, i + INDEX_BATCH_TAILLE);
        const resultats = await Promise.allSettled(
          lot.map((a) => indexerUnCours(Number(a.id))),
        );
        if (annule) {
          return;
        }
        for (const r of resultats) {
          if (r.status !== 'fulfilled') {
            continue;
          }
          const { id, plain, detail } = r.value;
          if (detail && !annule) {
            ecrireCache(`cours:${id}`, detail);
          }
          if (!annule) {
            setTexteCorpsParId((prev) => ({ ...prev, [id]: plain }));
          }
        }
      }
      if (!annule) {
        setIndexCorpsEnCours(false);
      }
    })();

    return () => {
      annule = true;
    };
  }, [articles]);

  if (loading) {
    return (
      <View style={styles.centre}>
        <ActivityIndicator size="large" color={theme.titreSecond} />
      </View>
    );
  }

  if (erreur) {
    return (
      <View style={styles.centre}>
        <Text style={styles.erreur}>{erreur}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Cours</Text>
      <TextInput
        style={styles.champRecherche}
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un cours…"
        placeholderTextColor={theme.texteClair}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      {indexCorpsEnCours ? (
        <Text style={styles.indexHint}>Indexation du texte des cours en cours…</Text>
      ) : (
        <Text style={styles.indexHintReady}>Recherche dans titre, extrait et contenu.</Text>
      )}
      <FlatList
        data={articlesFiltres}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.vide}>
            {recherche.trim()
              ? 'Aucun cours ne correspond à ta recherche.'
              : 'Aucun cours pour le moment.'}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.carte}
            onPress={() => router.push(`/cours/${item.id}`)}
          >
            {item.cover?.url ? (
              <Image
                source={{ uri: item.cover.url }}
                style={styles.vignette}
                accessibilityLabel={item.cover.alt || item.title}
              />
            ) : null}
            <View style={styles.carteTexte}>
              <Text style={styles.articleTitre}>{item.title}</Text>
              <Text style={styles.extrait} numberOfLines={2}>
                {item.excerpt}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond, paddingTop: 60, paddingHorizontal: 16 },
  centre: { flex: 1, backgroundColor: theme.fond, alignItems: 'center', justifyContent: 'center' },
  titre: { fontSize: theme.typo.h1, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 12 },
  champRecherche: {
    backgroundColor: theme.blanc,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.texte,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  carte: {
    backgroundColor: theme.blanc,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.titreSecond,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  vignette: { width: 100, minHeight: 88, backgroundColor: '#e8ebe7' },
  carteTexte: { flex: 1, padding: 16 },
  articleTitre: { fontSize: 16, fontWeight: '600', color: theme.titrePrinc, marginBottom: 6 },
  extrait: { fontSize: 13, color: '#666', lineHeight: 18 },
  vide: { fontSize: 15, color: theme.texteClair, textAlign: 'center', marginTop: 24 },
  indexHint: { fontSize: 12, color: theme.titreSecond, marginBottom: 10, fontStyle: 'italic' },
  indexHintReady: { fontSize: 12, color: theme.texteClair, marginBottom: 10 },
  erreur: { color: theme.titreSecond, fontSize: 16 },
});
