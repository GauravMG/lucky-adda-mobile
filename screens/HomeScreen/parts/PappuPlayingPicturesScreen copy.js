import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Animated, TextInput, ScrollView } from 'react-native';

const images = [
    require('../../../assets/pappu-playing-pictures/umbrella.png'),
    require('../../../assets/pappu-playing-pictures/ball.png'),
    require('../../../assets/pappu-playing-pictures/sun.png'),
    require('../../../assets/pappu-playing-pictures/diwali-lamp.png'),
    require('../../../assets/pappu-playing-pictures/cow.png'),
    require('../../../assets/pappu-playing-pictures/water-bucket.png'),
    require('../../../assets/pappu-playing-pictures/kite.png'),
    require('../../../assets/pappu-playing-pictures/spinning-top.png'),
    require('../../../assets/pappu-playing-pictures/rose.png'),
    require('../../../assets/pappu-playing-pictures/butterfly.png'),
    require('../../../assets/pappu-playing-pictures/pigeon.png'),
    require('../../../assets/pappu-playing-pictures/rabbit.png'),
];

const PappuPicturesGame = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [winnerImage, setWinnerImage] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showPopup, setShowPopup] = useState(false);
    const [betAmount, setBetAmount] = useState('');
    const [betPlaced, setBetPlaced] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const winScaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    revealWinner();
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showPopup]);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ])
        ).start();
    }, []);

    const revealWinner = () => {
        const randomIndex = Math.floor(Math.random() * images.length);
        setWinnerImage(images[randomIndex]);
        setShowPopup(true);

        Animated.loop(
            Animated.sequence([
                Animated.timing(winScaleAnim, {
                    toValue: 1.2,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(winScaleAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                })
            ])
        ).start();

        setTimeout(() => {
            setShowPopup(false);
            setTimeLeft(30);
            setSelectedImage(null);
            setBetAmount('');
            setBetPlaced(false);
        }, 10000);
    };

    const placeBet = () => {
        if (betAmount.trim() !== '') {
            setBetPlaced(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.timer}>Time Left: {timeLeft}s</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.grid}>
                    {images.map((img, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.imageWrapper, selectedImage === img && styles.selected]}
                            onPress={() => setSelectedImage(img)}
                            disabled={timeLeft <= 5}
                        >
                            <Animated.Image source={img} style={[styles.image, { transform: [{ scale: scaleAnim }] }]} />
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter bet amount"
                    placeholderTextColor="#FFD700"
                    keyboardType="numeric"
                    value={betAmount}
                    onChangeText={setBetAmount}
                    editable={!betPlaced}
                />
                <TouchableOpacity style={[styles.button, betPlaced && styles.buttonDisabled]} onPress={placeBet} disabled={betPlaced}>
                    <Text style={styles.buttonText}>{betPlaced ? 'Bet Placed' : 'Place Bet'}</Text>
                </TouchableOpacity>
            </ScrollView>
            <Modal visible={showPopup} transparent animationType="fade">
                <View style={styles.popupContainer}>
                    <Text style={styles.popupText}>Winning Image</Text>
                    <Animated.Image source={winnerImage} style={[styles.winningImage, { transform: [{ scale: winScaleAnim }] }]} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        paddingTop: 40,
    },
    timer: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
    },
    scrollContainer: {
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 10,
    },
    imageWrapper: {
        width: 80,
        height: 80,
        margin: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2B1B0F',
        borderWidth: 6,
        borderColor: '#E6B800',
        borderRadius: 50,
        shadowColor: '#E6B800',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.9,
        shadowRadius: 8,
        elevation: 15,
    },
    selected: {
        borderColor: '#FF8C00',
        shadowColor: '#FF8C00',
    },
    image: {
        width: 45,
        height: 45,
        resizeMode: 'contain',
    },
    winningImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    popupContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    popupText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
    },
    input: {
        width: 200,
        height: 40,
        borderColor: '#E6B800',
        borderWidth: 2,
        borderRadius: 8,
        paddingHorizontal: 10,
        color: '#E6B800',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#E6B800',
        padding: 12,
        borderRadius: 8,
    },
    buttonDisabled: {
        backgroundColor: '#888',
    },
    buttonText: {
        color: '#121212',
        fontWeight: 'bold',
    },
});

export default PappuPicturesGame;