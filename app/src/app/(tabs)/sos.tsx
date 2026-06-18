import * as Location from 'expo-location';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BreathingGuide } from '../../components/sos/BreathingGuide';
import { SOSButton } from '../../components/sos/SOSButton';
import { VideosList } from '../../components/sos/VideosList';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../hooks/useTheme';
import { sosService } from '../../services/sos.service';
import { useAuthStore } from '../../store/auth.store';

export default function SOSScreen() {
  const { colors, fontSize } = useTheme();
  const user = useAuthStore((s: any) => s.user);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVideos, setShowVideos] = useState(false);

  const handleCallSupport = () => {
    const phone = user?.support_contact_phone;
    if (!phone) {
      Alert.alert(
        'Contato SOS',
        'Cadastre um contato de apoio no seu perfil para usar esta função.',
      );
      return;
    }
    const url = Platform.OS === 'ios' ? `tel:${phone}` : `tel:${phone}`;
    Linking.openURL(url);
  };

  const handleFindCalmPlace = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão', 'Precisamos da sua localização para encontrar um lugar calmo.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const res = await sosService.nearestCalmPoint(
        location.coords.latitude,
        location.coords.longitude,
      );
      const point = res.data.data;
      const url = Platform.select({
        ios: `maps:0,0?q=${point.latitude},${point.longitude}`,
        android: `geo:0,0?q=${point.latitude},${point.longitude}(${point.name})`,
      });
      if (url) Linking.openURL(url);
    } catch {
      Alert.alert('Erro', 'Não foi possível encontrar um lugar calmo próximo.');
    }
  };

  if (showBreathing) {
    return <BreathingGuide onClose={() => setShowBreathing(false)} />;
  }

  if (showVideos) {
    return <VideosList onClose={() => setShowVideos(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[styles.title, { color: colors.text, fontSize: fontSize['2xl'] }]}
          accessibilityRole="header"
        >
          SOS Bem-Estar
        </Text>
        <Text style={[styles.phrase, { color: colors.textSecondary, fontSize: fontSize.base }]}>
          Está tudo bem pedir ajuda. Você não está sozinho(a). 💙
        </Text>

        <View style={styles.buttons}>
          <SOSButton
            icon="phone"
            label="Ligar para Apoio"
            description={
              user?.support_contact_name
                ? `Ligar para ${user.support_contact_name}`
                : 'Configure seu contato SOS no perfil'
            }
            color={Colors.error}
            onPress={handleCallSupport}
          />
          <SOSButton
            icon="heart"
            label="Respiração Guiada"
            description="Técnica 4-4-4 para acalmar"
            color={Colors.primary}
            onPress={() => setShowBreathing(true)}
          />
          <SOSButton
            icon="map-marker"
            label="Encontrar Lugar Calmo"
            description="Ir para o ponto tranquilo mais próximo"
            color={Colors.secondary}
            onPress={handleFindCalmPlace}
          />
          <SOSButton
            icon="play-circle"
            label="Vídeos de Bem-Estar"
            description="Conteúdos para acalmar e se organizar"
            color={Colors.warning}
            onPress={() => setShowVideos(true)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  phrase: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttons: {
    gap: 4,
  },
});
