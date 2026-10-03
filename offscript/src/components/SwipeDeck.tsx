// A stack of cards you can swipe: right = say hi, left = skip.
import { useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, useWindowDimensions, View } from 'react-native';
import { Sticker } from './Sticker';
import { haptic, Tap } from './ui';
import { space } from '../lib/theme';

export function SwipeDeck<T extends { id: string }>({
  items,
  renderCard,
  onYes,
  onNo,
  empty,
}: {
  items: T[];
  renderCard: (item: T) => ReactNode;
  onYes: (item: T) => void;
  onNo?: (item: T) => void;
  empty: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const pos = useRef(new Animated.ValueXY()).current;
  const indexRef = useRef(0);
  indexRef.current = index;
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const cb = useRef({ onYes, onNo });
  cb.current = { onYes, onNo };

  const fling = (dir: 1 | -1) => {
    const item = itemsRef.current[indexRef.current];
    if (!item) return;
    haptic(dir === 1 ? 'success' : 'light');
    Animated.timing(pos, { toValue: { x: dir * width * 1.3, y: dir === 1 ? -80 : 40 }, duration: 260, useNativeDriver: false }).start(() => {
      pos.setValue({ x: 0, y: 0 });
      setIndex((i) => i + 1);
      if (dir === 1) cb.current.onYes(item);
      else cb.current.onNo?.(item);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > 110) fling(1);
        else if (g.dx < -110) fling(-1);
        else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 5 }).start();
      },
    }),
  ).current;

  const current = items[index];
  const next = items[index + 1];
  if (!current) return <>{empty}</>;

  const rotate = pos.x.interpolate({ inputRange: [-width, 0, width], outputRange: ['-18deg', '0deg', '18deg'] });
  const yesOpacity = pos.x.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: 'clamp' });
  const noOpacity = pos.x.interpolate({ inputRange: [-100, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <View>
      <View style={{ minHeight: 470 }}>
        {next ? (
          <View style={{ position: 'absolute', width: '100%', transform: [{ scale: 0.95 }, { translateY: 14 }], opacity: 0.7 }}>
            {renderCard(next)}
          </View>
        ) : null}
        <Animated.View
          {...pan.panHandlers}
          style={{ transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate }] }}
        >
          {renderCard(current)}
          <Animated.View style={{ position: 'absolute', top: 18, left: 18, opacity: yesOpacity, transform: [{ rotate: '-14deg' }] }}>
            <Sticker name="bulb" size={88} />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', top: 18, right: 18, opacity: noOpacity, transform: [{ rotate: '14deg' }] }}>
            <Sticker name="button" size={70} />
          </Animated.View>
        </Animated.View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.xxl, marginTop: space.lg }}>
        <Tap onPress={() => fling(-1)} accessibilityLabel="Skip">
          <Sticker name="button" size={58} />
        </Tap>
        <Tap onPress={() => fling(1)} accessibilityLabel="Say hi">
          <Sticker name="bulb" size={70} />
        </Tap>
      </View>
    </View>
  );
}
