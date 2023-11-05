import { Text, View, Pressable } from "react-native";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../style/style";
import { useState, useEffect } from "react";
import { DataTable } from "react-native-paper";
import { NBR_OF_SCOREBOARD_ROWS, SCOREBOARD_KEY } from "../constants/Game";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default Scoreboard = ({navigation}) => {

    const [scores, setScores] = useState([]);

    useEffect(() =>{
        const unsubscribe = navigation.addListener('focus',() =>{
            getScoreboardData();
        });
        return unsubscribe;
    },[navigation]);

    const getScoreboardData = async() => {
        try{
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if(jsonValue !== null){
                let tmpScores = JSON.parse(jsonValue);
                setScores(tmpScores);
            }
        }
        catch(e) {
            console.log('Read error: ' + e);
        }
    }

    const clearScoreboard = async() => {
        try{
            await AsyncStorage.clear();
            setScores([]);
        }
        catch(e) {
            console.log('Clear error: ' + e);
        }
    }
    
    return(
        <>
        <Header/>
        <View style={styles.container}>
            <Text style={styles.title2}>SCOREBOARD</Text>
            {scores.length === 0 ?
            <Text style={styles.text}>Scoreboard is empty</Text>
            :
            scores.map((player, index) => (
                index < NBR_OF_SCOREBOARD_ROWS &&
                <DataTable.Row key={player.key}>
                    <DataTable.Cell><Text style={styles.text2}>{index + 1}.</Text></DataTable.Cell>
                    <DataTable.Cell><Text style={styles.text2}>{player.name}</Text></DataTable.Cell>
                    <DataTable.Cell><Text style={styles.text2}>{player.date}</Text></DataTable.Cell>
                    <DataTable.Cell><Text style={styles.text2}>{player.time}</Text></DataTable.Cell>
                    <DataTable.Cell><Text style={styles.text2}>{player.points}</Text></DataTable.Cell>
                </DataTable.Row>
            ))
        }
            <Pressable onPress={() => clearScoreboard()}>
                <Text style={styles.button4}>CLEAR SCOREBOARD</Text>
            </Pressable>
        </View>
        <Footer/>
        </>
    )
}