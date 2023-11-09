import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { search } from '../api/SpotifyApi';
import { useNavigation } from "@react-navigation/native";



function HomeScreen() {
    const [token, setToken] = useState("")
    const [searchText, setSearchText] = useState('');
    const [searchType, setSearchType] = useState('');
    const [isSearchEnabled, setSearchEnabled] = useState(false);
    const [selectedButton, setSelectedButton] = useState(null);
    const [accessToken, setAccessToken] = useState('')

    const navigation = useNavigation();

    useEffect(() => {
        const getToken = async () => {
            try {
                const value = await AsyncStorage.getItem('token')
                if (value !== null) {
                    setAccessToken(value)
                }
            } catch (e) {
                console.log(e)
            }
        }
        getToken()
    }, [])

    const handleButtonPress = async (searchType) => {
        setSearchEnabled(true);
        setSearchType(searchType);
        setSelectedButton(searchType);

        const request = await search(searchText, searchType, accessToken);

        const tracks = request.tracks.items;
        const data = tracks.map((track) => {
            return {
                img: track.album.images[1].url,
                spotify_url: track.external_urls.spotify,
                name: track.name,
                artist: track.artists[0].name,
                preview_url: track.preview_url,
                uri: track.uri,
            }
        }
        );
        //console.log(JSON.stringify(data))
        if (data.length === 0) {
            alert('No se encontraron resultados');
            setSearchEnabled(false);
            return;
        }
        navigation.navigate('Player', { data: data })
    };

    useEffect(() => {
        if (searchText.length === 0) {
            setSelectedButton('');
        }
    }, [searchText]);

    const texto = token == "" ? "No hay token" : "Hay token"
    return (<View style={styles.container}>
        <ImageBackground source={require('../assets/tutorial-background.png')} resizeMode="repeat"  style={{ flex: 1, justifyContent: "center", alignItems:"center"}}>
            <TextInput
                label="Buscar por artista o género"
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                style={styles.searchInput}
                icon="ios-search"
                textColor='white'
            />
            <View style={{ display: 'flex', flexDirection: 'column', width: '80%', alignItems: 'center', justifyContent: 'space-around' }}>
                <View style={{ width: "50%" }}>
                    <Button
                        mode="contained"
                        disabled={searchText.length === 0}
                        style={[styles.button, { backgroundColor: (selectedButton === 'artist' && searchText.length !== 0) ? '#CAF55C' : '#D7DBFF' }]}
                        onPress={() => { handleButtonPress('artist') }}
                    >
                        Por Artista
                    </Button>
                </View >
                <View style={{ width: "50%" }}>
                    <Button
                        disabled={searchText.length === 0}
                        mode="contained"
                        style={[styles.button, { backgroundColor: (selectedButton === 'genre' && searchText.length !== 0) ? '#CAF55C' : '#D7DBFF' }]}
                        onPress={() => { handleButtonPress('genre') }}
                    >
                        Por Género
                    </Button>
                </View>

            </View>

        </ImageBackground>
    </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1EBF5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginVertical: 10,
        width: 150,
        paddingHorizontal: 0,
    },
    searchInput: {
        width: 300,
        marginTop: 20,
        marginBottom: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderBottomWidth: 0.7,
        borderColor: '#59A0F6',
        backgroundColor: '#400073',
        fontWeight: 'bold',

    },
});

export default HomeScreen