import React, { useCallback, useEffect, useRef } from 'react';
import { Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  interpolate,
  useAnimatedScrollHandler,
  withTiming,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withSequence,
  withDelay,
  Easing,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { RefreshContainerContext, RefreshStatus } from './type';
import TopContainer from './TopContainer';
import BottomContainer from './BottomContainer';

const { height } = Dimensions.get('window');

interface RefreshScrollViewProps {
  refreshing: boolean;
  refreshComponent: () => React.ReactNode;
  loadComponent: () => React.ReactNode;
  onRefresh: () => void;

  handleOnLoadMore?: () => void;
  triggleHeight?: number;
  canOffset?: boolean;
  bounces?: boolean;
}

const MAX_SCROLL_VELOCITY_Y = 20;
const MIN_SCROLL_VELOCITY_Y = 0.5;
const DEFAULT_TRIGGLE_HEIGHT = 80;
const RESET_TIMING_EASING = Easing.bezier(0.33, 1, 0.68, 1);

const HEADER_HEIGHT = 91;

const RefreshScrollView: React.FC<RefreshScrollViewProps> = (props) => {
  const {
    children,
    refreshing,
    onRefresh,
    refreshComponent,
    loadComponent,
    triggleHeight = DEFAULT_TRIGGLE_HEIGHT,
    canOffset = true,
    bounces = true,
    handleOnLoadMore,
  } = props;

  const nativeRef = useRef();
  const panRef = useRef();
  const scrollRef = useRef<any>(null);

  const scrollViewTransitionY = useSharedValue(0);
  const refreshTransitionY = useSharedValue(0);
  const offset = useSharedValue(0);
  const scrollBounse = useSharedValue(false);
  const refreshStatus = useSharedValue<RefreshStatus>(RefreshStatus.Idle);
  const scrollViewTotalHeight = useSharedValue(0);

  const canAutoLoad = useSharedValue(true); // 防止连续触发自动加载

  const direction = useDerivedValue(() => {
    return refreshTransitionY.value > 0 ? 1 : -1;
  }, [refreshTransitionY]);

  const canRefresh = useDerivedValue(() => {
    const marginTop = scrollViewTransitionY.value;
    const marginBottom =
      scrollViewTotalHeight.value -
      height -
      scrollViewTransitionY.value +
      HEADER_HEIGHT;

    return marginTop < 1 || marginBottom < 1;
  });

  useAnimatedReaction(
    () => refreshStatus.value,
    (value) => {
      console.log('当前scrollView状态是', value);
    }
  );

  useEffect(() => {
    if (refreshing) {
      if (direction.value === 1) {
        refreshStatus.value = RefreshStatus.Holding;
        refreshTransitionY.value = withTiming(triggleHeight * direction.value);
      }
    } else if (refreshStatus.value !== RefreshStatus.Idle) {
      if (direction.value === 1) {
        refreshStatus.value = RefreshStatus.Done;
        // refresh animation
        refreshTransitionY.value = withDelay(
          500,
          withTiming(
            0,
            {
              easing: RESET_TIMING_EASING,
            },
            () => {
              refreshStatus.value = RefreshStatus.Idle;
            }
          )
        );
      } else {
        // load more animation
        if (refreshTransitionY.value !== 0) {
          refreshTransitionY.value = 0;
          refreshStatus.value = RefreshStatus.Done;
          scrollRef.current &&
            scrollRef.current.scrollTo({
              y: scrollViewTransitionY.value + triggleHeight,
              animated: false,
            });
          refreshStatus.value = RefreshStatus.Idle;
        } else {
          refreshStatus.value = RefreshStatus.Idle;
        }
      }
    }
  }, [refreshing]);

  const handleOnRefresh = useCallback(() => {
    if (refreshing) return;
    onRefresh && onRefresh();
  }, []);

  const onScroll = useAnimatedScrollHandler<{
    scrollBeginTime: number;
    scrollBeginY: number;
  }>({
    onBeginDrag: (event, context) => {
      context.scrollBeginTime = new Date().valueOf();
      context.scrollBeginY = event.contentOffset.y;
      canAutoLoad.value = true;
    },
    onScroll: (event, context) => {
      const { scrollBeginY, scrollBeginTime } = context;
      scrollViewTransitionY.value = event.contentOffset.y;

      console.log('scroll', scrollViewTransitionY.value);

      if (
        scrollViewTransitionY.value >=
          0.8 * scrollViewTotalHeight.value - height &&
        refreshStatus.value !== RefreshStatus.AutoLoad &&
        canAutoLoad.value
      ) {
        console.log('触发自动加载');
        refreshStatus.value = RefreshStatus.AutoLoad;
        canAutoLoad.value = false;
        handleOnLoadMore && runOnJS(handleOnLoadMore)();
      }

      const marginTop = scrollViewTransitionY.value;
      const marginBottom =
        scrollViewTotalHeight.value -
        height -
        scrollViewTransitionY.value +
        HEADER_HEIGHT;

      if ((marginTop === 0 || marginBottom === 0) && !scrollBounse.value) {
        const direction = marginTop === 0 ? 1 : -1;
        const endTime = new Date().valueOf();
        const velocityY = Math.min(
          Math.abs(
            (scrollViewTransitionY.value - scrollBeginY) /
              (endTime - scrollBeginTime)
          ),
          MAX_SCROLL_VELOCITY_Y
        );
        if (!bounces || velocityY < MIN_SCROLL_VELOCITY_Y) return;

        const ratio = (Math.PI / 2 / MAX_SCROLL_VELOCITY_Y) * velocityY;
        const bounceDistance = (height / 4) * Math.sin(ratio);
        const duration = 100 + 100 * Math.sin(ratio * 2);

        scrollBounse.value = true;
        refreshTransitionY.value = withSequence(
          withTiming(bounceDistance * direction, { duration }),
          withTiming(
            0,
            {
              duration,
              easing: RESET_TIMING_EASING,
            },
            () => {
              scrollBounse.value = false;
            }
          )
        );
      }
    },
  });

  const panGesture = Gesture.Pan()
    .withRef(panRef)
    .activeOffsetY([-10, 10])
    .simultaneousWithExternalGesture(nativeRef)
    .onBegin(() => {
      offset.value = refreshTransitionY.value;
    })
    .onUpdate(({ translationY }) => {
      if (!canRefresh.value) {
        return;
      }
      console.log('pan', translationY);
      refreshTransitionY.value = interpolate(
        translationY,
        [-height, 0, height],
        [-height / 2, 0, height / 2]
      );

      if (!refreshing) {
        if (Math.abs(refreshTransitionY.value) >= triggleHeight) {
          refreshStatus.value = RefreshStatus.Reached;
        } else {
          refreshStatus.value = RefreshStatus.Pulling;
        }
      }
    })
    .onEnd(() => {
      if (refreshing) {
        refreshTransitionY.value = withTiming(triggleHeight * direction.value);
        return;
      }
      if (Math.abs(refreshTransitionY.value) >= triggleHeight) {
        if (refreshTransitionY.value > 0) {
          runOnJS(handleOnRefresh)();
        } else {
          handleOnLoadMore && runOnJS(handleOnLoadMore)();
        }
      } else {
        refreshTransitionY.value = withTiming(
          0,
          {
            easing: RESET_TIMING_EASING,
          },
          () => {
            refreshStatus.value = RefreshStatus.Idle;
          }
        );
      }
    });

  const nativeGesture = Gesture.Native().withRef(nativeRef);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: canOffset ? refreshTransitionY.value : 0,
        },
      ],
    };
  });

  const animatedProps = useAnimatedProps(() => {
    const top = -refreshTransitionY.value;

    return {
      scrollIndicatorInsets: {
        top: top - 1,
        left: 0,
        bottom: 0,
        right: 0,
      },
    };
  });

  return (
    <RefreshContainerContext.Provider
      value={{
        transitionY: refreshTransitionY,
        scrollBounse,
        triggleHeight,
        refreshing,
        refreshStatus,
        direction,
        canRefresh,
      }}
    >
      <GestureDetector gesture={panGesture}>
        <GestureDetector gesture={nativeGesture}>
          <Animated.ScrollView
            ref={scrollRef}
            bounces={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            animatedProps={animatedProps}
          >
            <Animated.View
              onLayout={(e) => {
                scrollViewTotalHeight.value = e.nativeEvent.layout.height;
              }}
              style={animatedStyle}
            >
              {children}
            </Animated.View>
          </Animated.ScrollView>
        </GestureDetector>
      </GestureDetector>
      <TopContainer>{refreshComponent && refreshComponent()}</TopContainer>
      <BottomContainer>{loadComponent && loadComponent()}</BottomContainer>
    </RefreshContainerContext.Provider>
  );
};

export default RefreshScrollView;
