import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import type { Video } from '../../services/videos.service';
import { videosService } from '../../services/videos.service';
import { Card } from '../ui/Card';

export function VideosList({ onClose }: { onClose: () => void }) {
  const { colors, fontSize } = useTheme();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videosService
      .list()
      .then((res) => setVideos(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = (url: string) => {
    Linking.openURL(url);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} accessibilityLabel="Voltar" style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize.xl }]}>
          Vídeos de Bem-Estar
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: 32 }]}>
            Carregando vídeos...
          </Text>
        ) : videos.length === 0 ? (
          <Text style={[{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: 32, fontStyle: 'italic' }]}>
            Nenhum vídeo disponível no momento.
          </Text>
        ) : (
          videos.map((video) => (
            <Pressable
              key={video.id}
              onPress={() => handleOpen(video.url)}
              accessibilityLabel={`Assistir vídeo: ${video.title}`}
            >
              <Card>
                <View style={styles.videoRow}>
                  <View style={[styles.thumbnail, { backgroundColor: colors.primaryLight }]}>
                    <FontAwesome name="play-circle" size={32} color={colors.primary} />
                  </View>
                  <View style={styles.videoInfo}>
                    <Text style={[styles.videoTitle, { color: colors.text, fontSize: fontSize.base }]}>
                      {video.title}
                    </Text>
                    {video.category && (
                      <Text style={[{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600', marginTop: 2 }]}>
                        {video.category}
                      </Text>
                    )}
                    {video.description && (
                      <Text
                        style={[{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 4 }]}
                        numberOfLines={2}
                      >
                        {video.description}
                      </Text>
                    )}
                    {video.duration_seconds && (
                      <Text style={[{ color: colors.textLight, fontSize: fontSize.xs, marginTop: 4 }]}>
                        {formatDuration(video.duration_seconds)}
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontWeight: '700',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  videoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
  },
  videoTitle: {
    fontWeight: '600',
  },
});
