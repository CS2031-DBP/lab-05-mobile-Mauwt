import React, { useEffect, useState} from 'react';
import {
    Text,
    Animated,
    TextInput,
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';


function PlayerScreen({ route, navigation }) {
    const { data } = route.params;
    const [randomTrack, setRandomTrack] = useState({});
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(new Audio.Sound());
    const [finished, setFinished] = useState(false); // [1]
    const [guess, setGuess] = useState("");
    const [answer, setAnswer] = useState(null);

    const colors = ["#CAF566", "#FFA177"]

    const MCIcons = [<MaterialCommunityIcons name="robot-happy" size={48} color="#A1C443" />, <MaterialCommunityIcons name="robot-dead-outline" size={48} color="red" />]
    const ADIcons = [<AntDesign name="play" size={48} color="#181818" />, <AntDesign name="question" size={48} color="#181818"  />,<MaterialCommunityIcons name="robot-off-outline" size={48} color="#FF1D00" />]

    const buttonIcon = () =>{
        if (randomTrack.preview_url==null) return ADIcons[2]
        if (isPlaying && answer==null) return ADIcons[1]
        if (!isPlaying && answer!==null) {
            console.log("answer OnPress: ", answer)
            return MCIcons[answer ? 0 : 1]}
        return ADIcons[0]
    }

    const pickRandomTrack = () => {
        console.log("\n\nPicking Random Track\n\n")
        setFinished(false);
        const randomIndex = Math.floor(Math.random() * data.length);
        console.log("On Pick Random \n", data[randomIndex])
        setRandomTrack(data[randomIndex]);
        setIsPlaying(false);
    }

    useEffect(() => {
        console.log("\n\nOn Use Effect\n\n")
        pickRandomTrack();
    }, []);

    const onClickNewTrack = async () => {
        console.log("Loaded:\n", currentTrack._loaded)
        if ((await currentTrack.getStatusAsync()).isLoaded) await currentTrack.pauseAsync();
        setCurrentTrack(new Audio.Sound());
        pickRandomTrack();
        setAnswer(null);
        setGuess("");
        console.log("\n\n Refresh New Track\n\n")
    }
    const onPlaybackStatusUpdate = async (status) => {
        if (status.didJustFinish) {
            setIsPlaying(false);
            setFinished(true);
            setCurrentTrack(new Audio.Sound());
        }
    }

    const play = async () => {
        try {
            if (isPlaying) {
                console.log("\n\nPause\n\n")
                setIsPlaying(false);
                await currentTrack.pauseAsync();
            } else if (!isPlaying && currentTrack._loaded) {
                console.log("\n\nPlay\n\n")
                setIsPlaying(true);
                setFinished(false);
                await currentTrack.playAsync();
            }
            else if (!isPlaying && !currentTrack._loaded) {
                console.log("Loaded Before:\n", currentTrack._loaded)
                console.log("Play New")
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: false,
                })
                const { sound, status } = await Audio.Sound.createAsync(
                    { uri: randomTrack.preview_url },
                    { shouldPlay: true, isLooping: false },
                    onPlaybackStatusUpdate
                )
                onPlaybackStatusUpdate(status)
                setIsPlaying(true);
                setCurrentTrack(sound);
                await sound.playAsync();
            }
        }
        catch (error) {
        }
    }

    const playTrack = async () => {
        if (randomTrack === null) {
            return;
        }
        await play(randomTrack.preview_url);
    }

    const checkGuess = async () => {
        console.log("\n\nCheck Guess\n\n")
        Keyboard.dismiss();
        setAnswer(guess === randomTrack.name? true : false);
        setFinished(true);
        setIsPlaying(false);
        console.log("answer: ", answer)
        if(randomTrack.name !== guess) {await currentTrack.pauseAsync();};
    }
    
    const toMain= async ()=>{
        setAnswer(guess === randomTrack.name);
        if(currentTrack._loaded && !answer) await currentTrack.pauseAsync();
        setFinished(true);
        setIsPlaying(false);
        navigation.navigate('Main')
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps='handled'
        >
            <Animated.View style={[styles.container, { backgroundColor: answer == null ? "#E6E6FA" : colors[answer ? 0 : 1], }]}>
                <View style={{ width: "90%", marginBottom: 0, justifyContent: 'flex-end', flexGrow: 1 }}>
                    <Card style={{ backgroundColor: "#F1EBF5", color: "#181818", display: finished ? "flex" : "none" }} >
                        <Card.Title title={randomTrack.name} style={{ marginBottom: 0 }} />
                        <Card.Content style={{ marginBottom: 20, marginTop: 0 }}>
                            <Text variant="bodyMedium">{randomTrack.artist}</Text>
                        </Card.Content>
                        <Card.Cover source={{ uri: randomTrack.img }} style={{ objectFit: 'contain', width: 'auto' }} />
                    </Card>
                </View>

                <View style={[styles.centeredContainer, { flexGrow: 1 }]}>
                    <TouchableOpacity onPress={() => { playTrack() }} disabled={randomTrack.preview_url ===null} >
                        <View style={styles.playButton}>
                            {buttonIcon()}
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ width: "90%", display: "flex", flexGrow: 2 }}>
                    <Card style={{ backgroundColor: "#F1EBF5", color: "#181818" }} >
                        <Card.Title title="¿Cuál es la canción?" style={{ marginBottom: 0 }} />
                        <Card.Content style={{ marginBottom: 20, marginTop: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                            <TextInput
                                label="Buscar por artista o género"
                                value={guess}
                                style={{ backgroundColor: "#400073", color: "white", borderRadius: 10, height: 30, paddingVertical: 0, paddingHorizontal: 10, fontSize: 12, width: "90%" }}
                                rippleColor="red"
                                icon="ios-search"
                                onChange={(text) => setGuess(text.nativeEvent.text)}
                            />

                            <Pressable disabled={!currentTrack._loaded || answer!==null} style={{ backgroundColor: "#55B96B", color: "white", borderRadius: 10, height: 30, paddingVertical: 0, paddingHorizontal: 'auto', fontSize: 24, width: "25%", marginHorizontal: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 10 }} onPress={() => checkGuess()}>
                                <Text style={{ color: "white" }}>Enviar</Text>
                            </Pressable>
                        </Card.Content>
                    </Card>
                </View>
                <View style={styles.navBar}>
                    <TouchableOpacity onPress={() =>  toMain()}>
                        <Text style={styles.navText}><MaterialIcons name="home" size={28} color="#CAF55B" /> </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { onClickNewTrack() }} disabled={!finished && randomTrack.preview_url !== null} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={styles.navText}><MaterialCommunityIcons name="autorenew" size={24} color="#CAF55B" /> </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    playButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D7DBFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    navBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#400073',
        padding: 10,
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    navText: {
    },
});

export default PlayerScreen;
