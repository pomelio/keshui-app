import React, { useRef } from 'react';
import { View, Animated, PanResponder } from 'react-native';

const SwipeGesture = (props) => {
    const savedHandler = useRef(props.onSwipePerformed);
    savedHandler.current = props.onSwipePerformed;

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onPanResponderRelease: async (evt, gestureState) => {
          const x = gestureState.dx;
          const y = gestureState.dy;
          if (Math.abs(x) > Math.abs(y)) {
            if (x >= 0) {
                await savedHandler.current('right');
            } else {
                await savedHandler.current('left');
            }
          } else {
            if (y >= 0) {
                await savedHandler.current('down');
            } else {
                await savedHandler.current('up');
            }
          }
        }
      })
    ).current;
  
    return (
      <Animated.View {...panResponder.panHandlers} style={props.gestureStyle}>
        {props.children} 
      </Animated.View>
    );
  };
  
  export default SwipeGesture;