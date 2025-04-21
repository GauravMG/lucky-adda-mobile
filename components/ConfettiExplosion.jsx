import React, { useRef, useEffect, useState } from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';

const ConfettiExplosion = ({
  trigger,
  count = 200,
  origin = { x: -10, y: 0 },
  fadeOut = true,
  autoStart = true,
  explosionSpeed = 1000,
  fallSpeed = 3000,
  onAnimationEnd,
}) => {
  const [start, setStart] = useState(false);
  const confettiRef = useRef(null);

  useEffect(() => {
    if (trigger) {
      setStart(true);
    }
  }, [trigger]);

  return (
    <>
      {start && (
        <ConfettiCannon
          ref={confettiRef}
          count={count}
          origin={origin}
          fadeOut={fadeOut}
          autoStart={autoStart}
          explosionSpeed={explosionSpeed}
          fallSpeed={fallSpeed}
          onAnimationEnd={() => {
            setStart(false);
            if (onAnimationEnd) onAnimationEnd();
          }}
        />
      )}
    </>
  );
};

export default ConfettiExplosion;
