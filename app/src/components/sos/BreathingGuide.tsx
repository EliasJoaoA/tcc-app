import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { usePreferencesStore } from '../../store/preferences.store';
import { Button } from '../ui/Button';

const STEPS = [
  { label: 'Inspire', duration: 4 },
  { label: 'Segure', duration: 4 },
  { label: 'Expire', duration: 4 },
];
const TOTAL_CYCLES = 4;

export function BreathingGuide({ onClose }: { onClose: () => void }) {
  const { colors, fontSize } = useTheme();
  const reduceAnimations = usePreferencesStore((s) => s.preferences.reduce_animations);
  const [stepIndex, setStepIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [counter, setCounter] = useState(STEPS[0].duration);
  const [active, setActive] = useState(true);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          const nextStep = (stepIndex + 1) % STEPS.length;
          if (nextStep === 0) {
            if (cycle >= TOTAL_CYCLES) {
              setActive(false);
              return 0;
            }
            setCycle((c) => c + 1);
          }
          setStepIndex(nextStep);
          return STEPS[nextStep].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stepIndex, cycle, active]);

  useEffect(() => {
    if (reduceAnimations || !active) return;

    const step = STEPS[stepIndex];
    const toValue = step.label === 'Inspire' ? 1.4 : step.label === 'Expire' ? 1 : 1.4;

    Animated.timing(scale, {
      toValue,
      duration: step.duration * 1000,
      useNativeDriver: true,
    }).start();
  }, [stepIndex, active]);

  const step = STEPS[stepIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.cycle, { color: colors.textSecondary, fontSize: fontSize.sm }]}>
        Ciclo {cycle} de {TOTAL_CYCLES}
      </Text>

      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: colors.primary + '30',
            borderColor: colors.primary,
            transform: reduceAnimations ? [] : [{ scale }],
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.primary, fontSize: fontSize['2xl'] }]}>
          {active ? step.label : 'Pronto!'}
        </Text>
        {active && (
          <Text style={[styles.counter, { color: colors.primary, fontSize: fontSize['3xl'] }]}>
            {counter}
          </Text>
        )}
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          title={active ? 'Parar' : 'Fechar'}
          onPress={onClose}
          variant="outline"
          accessibilityLabel={active ? 'Parar respiração guiada' : 'Fechar respiração guiada'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingBottom: 120,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 48,
    left: 32,
    right: 32,
  },
  cycle: {
    marginBottom: 32,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontWeight: '700',
  },
  counter: {
    fontWeight: '700',
    marginTop: 8,
  },
});
