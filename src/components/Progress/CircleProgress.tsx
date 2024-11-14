import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
interface CircleProgressProps {
  value: number; // percent: 0%-100%
  toValue?: number;

  activeColor?: string | string[];
  inactiveColor?: string;

  style?: ViewStyle;
  size?: number;
  width?: number;
  renderCenter?: (progress: number) => React.ReactNode;

  delay?: number;
  duration?: number;

  onChangeValue?: (value: number) => void;
}

const CircleProgress: React.FC<CircleProgressProps> = (props) => {
  const {
    size = 100,
    value,
    toValue,
    width = 10,
    activeColor = '#1e90ff',
    inactiveColor = '#D8D8D8',
    style,
    renderCenter,
    delay = 1000,
    duration = 1000,
    onChangeValue,
  } = props;
  const progress = useSharedValue(value);
  const [percent, setPercent] = useState(value);

  useEffect(() => {
    if (toValue && toValue > value) {
      progress.value = withDelay(
        delay,
        withTiming(toValue, {
          duration: duration,
          easing: Easing.bezier(0.33, 1, 0.68, 1),
        })
      );
    }
  }, []);

  const handleChangeValue = useCallback(
    (currentValue: number) => {
      if (currentValue > value) {
        onChangeValue && onChangeValue(currentValue);
      }
    },
    [onChangeValue]
  );

  useAnimatedReaction(
    () => Math.round(progress.value),
    (value) => {
      runOnJS(setPercent)(value);
      runOnJS(handleChangeValue)(value);
    }
  );

  const getEndPoint = useCallback(
    (value: number) => {
      'worklet';
      const R = size - width;

      const startPoint = {
        x: size,
        y: size - R,
      };

      let theta;
      if (value >= 100) {
        theta = (Math.PI / 180) * 359;
      } else if (value <= 0) {
        theta = 0;
      } else {
        theta = ((2 * Math.PI) / 100) * value;
      }

      const endPoint = {
        x: size + Math.sin(theta) * R,
        y: size - Math.cos(theta) * R,
      };

      return {
        startPoint,
        theta,
        endPoint,
        R,
      };
    },
    [size, width]
  );

  const animatedProps = useAnimatedProps(() => {
    const { startPoint, endPoint, theta, R } = getEndPoint(progress.value);
    return {
      d: `M ${startPoint.x} ${startPoint.y} A ${R} ${R} 0 ${
        theta > Math.PI ? '1' : '0'
      } 1 ${endPoint.x} ${endPoint.y} ${progress.value === 100 ? 'Z' : ''}`,
    };
  });

  const propStyle = useMemo(() => {
    return {
      width: 2 * size - 2 * width,
      height: 2 * size - 2 * width,
      borderRadius: size - width,
      transform: [
        {
          translateX: width,
        },
        {
          translateY: width,
        },
      ],
    };
  }, [size, width]);

  return (
    <View style={style}>
      <Svg width={size * 2} height={size * 2}>
        <Defs>
          <LinearGradient id="circle_progress" x1="0" y1="0" x2="1" y2="0">
            {Array.isArray(activeColor) &&
              activeColor?.map((color, index) => {
                return (
                  <Stop
                    key={`circle_progress_stop${index}`}
                    offset={index / activeColor.length}
                    stopColor={color}
                    stopOpacity="1"
                  />
                );
              })}
          </LinearGradient>
        </Defs>
        <Circle
          cx={size}
          cy={size}
          r={size - width}
          stroke={inactiveColor}
          strokeWidth={width}
        />
        <AnimatedPath
          animatedProps={animatedProps}
          stroke={
            Array.isArray(activeColor) ? 'url(#circle_progress)' : activeColor
          }
          strokeWidth={width}
          strokeLinecap={'round'}
          style={{
            ...StyleSheet.absoluteFillObject,
          }}
        />
      </Svg>
      <View style={[styles.container, propStyle]}>
        {renderCenter && renderCenter(percent)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default CircleProgress;
