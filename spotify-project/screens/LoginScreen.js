import { StyleSheet, Text, View, SafeAreaView, ImageBackground } from "react-native";
import React, { useEffect } from "react";
import { Entypo } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Button } from 'react-native';
import { encode as btoa } from 'base-64'
import AsyncStorage from '@react-native-async-storage/async-storage';

const app_credentials = {
	CLIENT_ID: "97e2dd3c9bd441cabe5326847d6d248c",
	CLIENT_SECRET: "ba00ccacc71248bea174e752708b8d5a"
}

const LoginScreen = () => {
	const navigation = useNavigation();

	const authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + btoa(`${app_credentials.CLIENT_ID}:${app_credentials.CLIENT_SECRET}`)
		},
		form: {
			grant_type: 'client_credentials',
		},
		json: true
	}



	const requestToken = async () => {
		try {
			const response = await axios.post(authOptions.url, authOptions.form, { headers: authOptions.headers })
			console.log(response.data.access_token)
			await AsyncStorage.setItem("token", response.data.access_token)
			navigation.navigate("Main")
		} catch (error) {
			console.log(error)
		}
	}



	return (

		<SafeAreaView style={{flex:1, flexDirection: "column", backgroundColor:"#400073" }}>
			<ImageBackground source={require('../assets/bg.png')} resizeMode="cover" style={{ flex: 1, justifyContent: "center", width:"100%", height:"100%"}}>
				<View style={{ height: 100 }} />
				<Entypo
					style={{ textAlign: "center" }}
					name="spotify"
					size={80}
					color="white"
				/>
				<Text
					style={{
						color: "white",
						fontSize: 40,
						fontWeight: "bold",
						textAlign: "center",
						marginTop: 40,
					}}
				>

					Spotify Trivia
				</Text>

				<View style={{ height: 100, display: "flex", width: "100%", paddingHorizontal: "auto", justifyContent: "center", alignItems: "center", flexGrow: 1 }} >
					<View style={{ marginHorizontal: "auto", width: "50%" }}>
						<Button
							title="Empezar"
							onPress={requestToken}
							color="#1D8954"
						/>
					</View>
				</View>
			</ImageBackground>
		</SafeAreaView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({});