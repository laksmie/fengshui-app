import { theme } from '@/constants/theme';
import type { CoursDetail } from '@/lib/cours-api';
import { fetchCoursDetail } from '@/lib/cours-api';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ecrireCache, lireCache } from '../../../components/mobile-api';
import { MobileArticleBody } from '../../../components/mobile-article-body';

export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<CoursDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;
    const cacheKey = String(id ?? '');

    const articleEnCache = lireCache<CoursDetail>(`cours:${cacheKey}`);
    if (articleEnCache) {
      setArticle(articleEnCache);
      setErreur(null);
      setLoading(false);
      return () => {
        annule = true;
      };
    }

    (async () => {
      try {
        const data = await fetchCoursDetail(Number(id));
        if (!annule) {
          ecrireCache<CoursDetail>(`cours:${cacheKey}`, data);
          setArticle(data);
          setErreur(null);
          setLoading(false);
        }
      } catch {
        if (!annule) {
          setErreur('Impossible de charger cet article.');
          setLoading(false);
        }
      }
    })();

    return () => {
      annule = true;
    };
  }, [id]);

  if (loading) return (
    <View style={styles.centre}>
      <ActivityIndicator size="large" color={theme.titreSecond} />
    </View>
  );

  if (erreur) return (
    <View style={styles.centre}>
      <Text style={styles.erreur}>{erreur}</Text>
    </View>
  );

  if (!article) return null;

  return (
    <ScrollView style={styles.container}>
      {article.cover?.url ? (
        <Image
          source={{ uri: article.cover.url }}
          style={styles.cover}
          resizeMode="cover"
          accessibilityLabel={article.cover.alt}
        />
      ) : null}
      <Text style={styles.titre}>{article.title}</Text>
      <MobileArticleBody blocks={article.blocks} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.fond, padding: 20, paddingTop: 60 },
  centre: { flex: 1, backgroundColor: theme.fond, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 180, borderRadius: 10, marginBottom: 16, backgroundColor: '#e8ebe7' },
  titre: { fontSize: theme.typo.h2, fontWeight: 'bold', color: theme.titrePrinc, marginBottom: 16 },
  erreur: { color: theme.titreSecond, fontSize: 16 },
});
