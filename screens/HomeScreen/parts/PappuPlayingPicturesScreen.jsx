import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Modal,
} from 'react-native';
import { Dimensions } from 'react-native';

import { useNotification } from '../../../context/NotificationContext';

import { AppLogo } from '../../../App';
import ConfettiExplosion from "../../../components/ConfettiExplosion"

const screenWidth = Dimensions.get('window').width;
const itemMargin = 3 * 2; // each item has marginHorizontal: 3 (left + right)
const itemsPerRow = 6;
const totalSpacing = itemMargin * itemsPerRow;
const itemSize = (screenWidth - totalSpacing - 32) / itemsPerRow; // 32 for ScrollView padding (16 * 2)

const celebrateBackgroundImage = "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/celebrate-background.gif"

const images = [
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/umbrella.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/ball.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/sun.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/diwali-lamp.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/cow.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/water-bucket.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/kite.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/spinning-top.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/rose.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/butterfly.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/pigeon.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/rabbit.png",
];

const pockerChipImages = [
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/10.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/20.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/30.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/50.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/100.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/200.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/400.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/600.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/1K.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/2K.png",
  "https://lucky-adda.com/api/pappu-playing-pictures/assets/images/poker-chips/4K.png",
];

const PappuPlayingPictures = () => {
  const showNotification = useNotification();

  const [isFirstPageLoad, setIsFirstPageLoad] = useState(false)
  const [showPopupInitialMessage2, setShowPopupInitialMessage2] = useState(false)
  const [countdown, setCountdown] = useState(10);
  const [isCooldown, setIsCooldown] = useState(null);
  const [selectedBet, setSelectedBet] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [winningImage, setWinningImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const intervalRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isDisabled = countdown <= 0 || isCooldown;
  const balance = 100;
  const betAmounts = [10, 20, 30, 50, 100, 200, 400, 600, 1000, 2000, 4000];

  useEffect(() => {
    setIsFirstPageLoad(true)
    setShowPopupInitialMessage2(true)
    setIsCooldown(null)

    setTimeout(() => {
      setIsFirstPageLoad(false)
      setShowPopupInitialMessage2(false)
      setIsCooldown(false)
    }, 2000)
  }, [])

  useEffect(() => {
    if ([true, false].indexOf(isCooldown) >= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }

            setTimeout(() => {
              setIsCooldown((prevCooldown) => {
                const newCooldown = !prevCooldown;
                setCountdown(newCooldown ? 5 : 10); // flip the timer

                if (newCooldown) {
                  // Reset selected bet and images when 5 seconds countdown ends
                  setSelectedBet(null);
                  setSelectedImages([]);

                  const selectedImage = images[Math.floor(Math.random() * images.length)];
                  setWinningImage(selectedImage);
                  setShowPopup(true);
                  handleCelebrate()

                  // Animate popup in
                  Animated.parallel([
                    Animated.timing(scaleAnim, {
                      toValue: 1,
                      duration: 500,
                      useNativeDriver: true,
                    }),
                    Animated.timing(opacityAnim, {
                      toValue: 1,
                      duration: 500,
                      useNativeDriver: true,
                    }),
                  ]).start();

                  // Hide after 5 seconds
                  const timer = setTimeout(() => {
                    Animated.parallel([
                      Animated.timing(opacityAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                      }),
                      Animated.timing(scaleAnim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                      }),
                    ]).start(() => {
                      // 💡 Only hide after animation completes
                      setShowPopup(false);
                      setWinningImage(null);

                      // Reset values for next time
                      opacityAnim.setValue(0);
                      scaleAnim.setValue(0);
                    });
                  }, 5000);
                }

                return newCooldown;
              });
            }, 1000); // Wait 1 second at 0
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [isCooldown]); 

  const handleBetSelect = (amount) => {
    if (countdown <= 0 || isCooldown) {
      // showNotification(
      //   'warning',
      //   'Time Up!',
      //   'Please wait till next game starts.'
      // );
      return;
    }

    setSelectedBet(amount);
  };

  const handleImageSelect = (index) => {
    if (countdown <= 0 || isCooldown) {
      // showNotification(
      //   'warning',
      //   'Time Up!',
      //   'Please wait till next game starts.'
      // );
      return;
    }

    if (!selectedBet) {
      // showNotification(
      //   'error',
      //   'Invalid Bet Amount!',
      //   `Please select a bet amount.`
      // );
      return;
    }

    setSelectedImages((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((i) => i !== index); // Deselect if already selected
      } else {
        return [...prevSelected, index]; // Select
      }
    });
  };

  const handleClearBet = () => {
    setSelectedBet(null);
    setSelectedImages([]);
  }

  const handleCelebrate = () => {
    setShowConfetti(true);
  };

  const renderGridItem = (index, image) => (
    <View key={index} style={styles.gridItem}>
      <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.gridImage} resizeMode="contain" />
    </View>
  );

  const renderToBetGridItem = (index, image) => {
    const isSelected = selectedImages.includes(index);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleImageSelect(index)}
        style={[
          styles.gridItem,
          (isSelected || isFirstPageLoad) && styles.gridItemSelected,
          isDisabled && { opacity: 0.4 },
        ]}
      >
        <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.gridImage} resizeMode="contain" />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo
          logoStyles={{
            width: 60,
            height: 60,
            borderRadius: 8,
          }}
        />
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarIconContainer}>
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.icon}>⭐</Text>
          <Text style={styles.icon}>🔔</Text>
        </View>
        <Text style={styles.countDownText}>{countdown}</Text>
        <Text style={styles.users}>208 👤</Text>
      </View>

      {/* Picture Grid (25 items) */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 30 }).map((_, index) => renderGridItem(index, images[index]))}
      </View>

      {/* Bet on Picture Section (15 items) */}
      <Text style={styles.sectionTitle}>Bet on Picture</Text>
      <View style={styles.betGridContainer}>
        {Array.from({ length: 12 }).map((_, index) => renderToBetGridItem(index, images[index]))}
      </View>

      {/* Bet Amount Buttons */}
      <ScrollView
        horizontal
        contentContainerStyle={styles.betButtons}
        showsHorizontalScrollIndicator={false}
      >
        {betAmounts.map((amount, index) => (
          <TouchableOpacity
            key={amount}
            onPress={() => handleBetSelect(amount)}
            style={[
              styles.chipImageContainer,
              selectedBet === amount && styles.chipImageContainerSelected,
              isDisabled && { opacity: 0.4 }
            ]}
          >
            <Image
              source={typeof pockerChipImages[index] === 'string' ? {uri: pockerChipImages[index]} : pockerChipImages[index]}
              style={[
                styles.chipImage,
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cancel Button */}
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => handleClearBet()}
      >
        <Text style={styles.cancelText}>❌</Text>
      </TouchableOpacity>

      {showPopupInitialMessage2 && (
        <Modal transparent visible={showPopupInitialMessage2} animationType="none">
          <View style={styles.infoPopupOverlay}>
            <View style={styles.infoPopupContainer}>
              <Text style={styles.infoPopupText}>Select Images to Place Bet</Text>
            </View>
          </View>
        </Modal>
      )}

      {showPopup && (
        <Modal transparent visible={showPopup} animationType="none">
          <View
            style={styles.popupOverlay}
          >
            <Animated.View
              style={[
                styles.popupContainer,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image
                source={typeof winningImage === 'string' ? { uri: winningImage } : winningImage}
                style={styles.winningImage}
                resizeMode="contain"
              />
              {/* <Text style={styles.popupText}>🎉 Winner!</Text> */}
            </Animated.View>
          </View>
        </Modal>
      )}

      <ConfettiExplosion trigger={showConfetti} onAnimationEnd={() => setShowConfetti(false)} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 13,
    borderWidth: 1,
    padding: 7,
    borderRadius: 50,
    borderColor: '#FFD700',
    marginRight: 7,
  },
  countDownText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    flex: 1,
  },
  users: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'right',
    flex: 1,
  },
  logo: {
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingTop: 10,
  },
  betGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  gridItem: {
    width: itemSize,
    height: itemSize,
    margin: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#333',
    padding: 7,
  },
  gridItemSelected: {
    borderColor: '#FFD700',
    borderWidth: 2,
    backgroundColor: '#FFECB3',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    color: '#FFD700',
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingTop: 10,
  },
  betSettings: {
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginVertical: 2,
    color: '#FFD700',
  },
  chipImageContainer: {
    borderWidth: 3,
    borderRadius: 50,
    marginRight: 10,
    padding: 3,
  },
  chipImageContainerSelected: {
    borderColor: '#FFD700',
  },
  chipImage: {
    width: 50,  // Adjust size to fit your layout
    height: 50,
    borderRadius: 50,
  },
  chipImageSelected: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  betButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 7,
    borderColor: '#f33',
    borderWidth: 2,
    borderRadius: 50,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
  },
  infoPopupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
  },
  infoPopupContainer: {
    backgroundColor: 'rgba(0,0,0,1)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#FFD700',
    padding: 20,
    alignItems: 'center',
  },
  infoPopupText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    zIndex: 1000,
  },
  winningImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  popupText: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PappuPlayingPictures;

// import React, { useRef, useEffect, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   Image,
//   PanResponder,
//   Animated,
//   Dimensions,
//   Text,
// } from 'react-native';
// import Canvas from 'react-native-canvas';

// const PappuPlayingPictures = () => {
//   const canvasRef = useRef(null);
//   const [ctx, setCtx] = useState(null);
//   const [canvasReady, setCanvasReady] = useState(false);
//   const coinAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
//   const { width } = Dimensions.get('window');

//   const onCanvasReady = (canvas) => {
//     if (!canvas) return;

//     canvas.width = 120;
//     canvas.height = 120;

//     canvas.getContext('2d').then((ctx) => {
//       ctx.fillStyle = 'gray';
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//       ctx.globalCompositeOperation = 'destination-out';
//       setCtx(ctx);
//       setCanvasReady(true);
//     });
//   };  

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: (evt, gesture) => {
//         if (!ctx) return;
//         const { locationX, locationY } = evt.nativeEvent;
//         ctx.beginPath();
//         ctx.arc(locationX, locationY, 15, 0, Math.PI * 2, true);
//         ctx.fill();
//       },
//     })
//   ).current;

//   useEffect(() => {
//     // Coin animation
//     const animate = () => {
//       Animated.sequence([
//         Animated.timing(coinAnim, {
//           toValue: { x: 200, y: 10 },
//           duration: 1000,
//           useNativeDriver: false,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 50, y: 80 },
//           duration: 1000,
//           useNativeDriver: false,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 220, y: 60 },
//           duration: 1000,
//           useNativeDriver: false,
//         }),
//       ]).start(() => animate());
//     };

//     animate();
//   }, []);

//   return (
//     <View style={styles.card}>
//       <View style={styles.container} {...panResponder.panHandlers}>
//         <Image
//           source={{
//             uri: 'https://lucky-adda.com/api/pappu-playing-pictures/assets/images/umbrella.png',
//           }}
//           style={styles.image}
//           resizeMode="contain"
//         />
//         <Canvas
//           ref={canvasRef}
//           style={styles.canvas}
//           onCanvasReady={onCanvasReady}
//         />
//         <Animated.Text style={[styles.coin, coinAnim.getLayout()]}>🪙</Animated.Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: 300,
//     marginTop: 50,
//     alignSelf: 'center',
//     padding: 25,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 15,
//     elevation: 5,
//   },
//   container: {
//     width: 120,
//     height: 120,
//     alignSelf: 'center',
//     overflow: 'hidden',
//     borderRadius: 5,
//     borderWidth: 1,
//     position: 'relative',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   canvas: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     zIndex: 10,
//     width: 120,
//     height: 120,
//   },
//   image: {
//     width: '90%',
//     height: '90%',
//   },
//   coin: {
//     position: 'absolute',
//     fontSize: 24,
//     transform: [{ skewX: '20deg' }],
//   },
// });

// export default PappuPlayingPictures;

// import React, { useRef, useEffect } from 'react';
// import { View, StyleSheet, Image, Text, Animated, PanResponder } from 'react-native';
// import Canvas, { Image as CanvasImage } from 'react-native-canvas';

// const PappuPlayingPictures = () => {
//   const canvasRef = useRef(null);
//   const pan = useRef(new Animated.ValueXY()).current;

//   const handleCanvas = async (canvas) => {
//     if (canvas) {
//       const ctx = canvas.getContext('2d');
//       canvas.width = 300;
//       canvas.height = 60;
//       ctx.fillStyle = '#C0C0C0'; // Gray overlay
//       ctx.fillRect(0, 0, canvas.width, canvas.height);
//     }
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: (evt, gesture) => {
//         const canvas = canvasRef.current;
//         if (canvas) {
//           const ctx = canvas.getContext('2d');
//           const x = gesture.moveX - canvas.offsetLeft;
//           const y = gesture.moveY - canvas.offsetTop;
//           ctx.globalCompositeOperation = 'destination-out';
//           ctx.beginPath();
//           ctx.arc(x, y, 15, 0, Math.PI * 2, false);
//           ctx.fill();
//         }
//       },
//     })
//   ).current;

//   return (
//     <View style={styles.card}>
//       <View style={styles.container} {...panResponder.panHandlers}>
//         <Animated.Text style={[styles.coin, {
//           transform: [
//             { translateX: pan.x },
//             { translateY: pan.y },
//             { skewX: '20deg' },
//           ]
//         }]}>
//           🪙
//         </Animated.Text>

//         <Canvas ref={canvasRef} style={styles.canvas} onContext2D={handleCanvas} />

//         <Image
//           source={{ uri: 'https://lucky-adda.com/api/pappu-playing-pictures/assets/images/umbrella.png' }}
//           style={styles.image}
//           resizeMode="contain"
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     width: 300,
//     marginVertical: 50,
//     marginHorizontal: 'auto',
//     padding: 25,
//     borderRadius: 10,
//     elevation: 10,
//     backgroundColor: 'white',
//   },
//   container: {
//     overflow: 'hidden',
//     position: 'relative',
//     width: 120,
//     height: 120,
//     marginHorizontal: 'auto',
//     borderRadius: 5,
//     borderWidth: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   canvas: {
//     position: 'absolute',
//     top: 0,
//     zIndex: 10,
//     height: 120,
//     width: 120,
//   },
//   image: {
//     width: '90%',
//     height: '90%',
//     zIndex: 1,
//   },
//   coin: {
//     position: 'absolute',
//     left: 0,
//     top: 25,
//     fontSize: 28,
//     zIndex: 11,
//     animation: 'scratch 1.5s ease-in-out alternate',
//   },
// });

// export default PappuPlayingPictures;

// import React, { useRef, useEffect } from 'react';
// import {
//   View,
//   Image,
//   Animated,
//   Dimensions,
//   StyleSheet,
//   PanResponder,
//   Text,
// } from 'react-native';

// const PappuPlayingPictures = () => {
//   const imageSize = 200; // Make this square
//   const coinAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

//   // Coin animation loop like CSS keyframes
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(coinAnim, {
//           toValue: { x: 75, y: 0 },
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 0, y: 85 },
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 100, y: 20 },
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 25, y: 100 },
//           duration: 300,
//           useNativeDriver: true,
//         }),
//         Animated.timing(coinAnim, {
//           toValue: { x: 100, y: 75 },
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]),
//       { iterations: -1 }
//     ).start();
//   }, []);

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: () => {},
//     })
//   ).current;

//   return (
//     <View style={styles.container}>
//       <View style={styles.card}>
//         <View style={[styles.scratchContainer, { width: imageSize, height: imageSize }]}>
//           {/* The image is visible from the start */}
//           <Image
//             source={{
//               uri: 'https://lucky-adda.com/api/pappu-playing-pictures/assets/images/umbrella.png',
//             }}
//             style={[styles.image, { width: imageSize, height: imageSize }]}
//             resizeMode="contain"
//           />

//           {/* Scratch overlay fully covering image */}
//           <View
//             {...panResponder.panHandlers}
//             style={[
//               styles.overlay,
//               {
//                 width: imageSize,
//                 height: imageSize,
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//               },
//             ]}
//           />

//           {/* Coin animation */}
//           <Animated.Text
//             style={[
//               styles.coin,
//               {
//                 transform: [
//                   { translateX: coinAnim.x },
//                   { translateY: coinAnim.y },
//                 ],
//               },
//             ]}
//           >
//             🪙
//           </Animated.Text>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//   },
//   card: {
//     width: 300,
//     alignSelf: 'center',
//     padding: 25,
//     borderRadius: 10,
//     backgroundColor: '#fff',
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowOffset: { width: 0, height: 0 },
//     shadowRadius: 15,
//     elevation: 5,
//   },
//   scratchContainer: {
//     alignSelf: 'center',
//     borderRadius: 10,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   image: {
//     zIndex: 1,
//   },
//   overlay: {
//     backgroundColor: '#999',
//     opacity: 0.8,
//     zIndex: 2,
//   },
//   coin: {
//     fontSize: 30,
//     position: 'absolute',
//     zIndex: 3,
//   },
// });

// export default PappuPlayingPictures;

// import React, { useRef } from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';
// import {
//   Canvas,
//   Image as SkiaImage,
//   useImage,
//   useCanvasRef,
//   Skia,
//   BlendMode,
// } from '@shopify/react-native-skia';
// import { GestureDetector, Gesture } from 'react-native-gesture-handler';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withSpring,
// } from 'react-native-reanimated';

// const { width } = Dimensions.get('window');
// const CARD_SIZE = 300;

// const PappuPlayingPictures = () => {
//   const canvasRef = useCanvasRef();
//   const image = useImage(require('../../../assets/umbrella.png'));
//   const brush = useImage(require('../../../assets/star.png'));

//   const path = useRef(Skia.Path.Make());
//   const paint = useRef(Skia.Paint());
//   paint.current.setBlendMode(BlendMode.Clear);

//   const coinX = useSharedValue(0);
//   const coinY = useSharedValue(0);

//   const pan = Gesture.Pan()
//     .onStart(({ x, y }) => {
//       coinX.value = withSpring(x - 10);
//       coinY.value = withSpring(y - 10);
//     })
//     .onUpdate(({ x, y }) => {
//       path.current.addCircle(x, y, 20);
//       canvasRef.current?.drawPath(path.current, paint.current);
//       coinX.value = x - 10;
//       coinY.value = y - 10;
//     });

//   const coinStyle = useAnimatedStyle(() => ({
//     transform: [
//       { translateX: coinX.value },
//       { translateY: coinY.value },
//       { skewX: '20deg' },
//     ],
//   }));

//   if (!image || !brush) {
//     return null;
//   }

//   return (
//     <View style={styles.container}>
//       <GestureDetector gesture={pan}>
//         <Canvas ref={canvasRef} style={styles.canvas}>
//           <SkiaImage
//             image={image}
//             x={0}
//             y={0}
//             width={CARD_SIZE}
//             height={CARD_SIZE}
//           />
//           <SkiaImage
//             image={brush}
//             x={0}
//             y={0}
//             width={CARD_SIZE}
//             height={CARD_SIZE}
//           />
//         </Canvas>
//       </GestureDetector>
//       <Animated.View style={[styles.coinContainer, coinStyle]}>
//         <View style={styles.coin}><Animated.Text style={{ fontSize: 28 }}>🪙</Animated.Text></View>
//       </Animated.View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: CARD_SIZE,
//     height: CARD_SIZE,
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'relative',
//   },
//   canvas: {
//     width: CARD_SIZE,
//     height: CARD_SIZE,
//   },
//   coinContainer: {
//     position: 'absolute',
//   },
//   coin: {
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });

// export default PappuPlayingPictures;
