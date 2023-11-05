import { useState } from "react";
import { TextInput, Text, View, Pressable, Keyboard } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Footer from './Footer';
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT } from "../constants/Game";
import Styles from '../style/style';

export default Home = ({ navigation }) => {

    const [playerName, setPlayerName] = useState('');
    const [hasPlayerName, setHasPlayerName] = useState(false);

    const handlePlayerName = (value) => {
        if (value.trim().length > 0) {
            setHasPlayerName(true);
            Keyboard.dismiss();
        }
    }
    return (
        <>
            <Header />
            <View style={Styles.gameboard}>
                <MaterialCommunityIcons style={Styles.icon} name="information" />
                {!hasPlayerName ?
                    <>
                        <Text style={Styles.title2}> For scoreboard enter your name</Text>
                        <TextInput style={Styles.textInput} onChangeText={setPlayerName} autoFocus={true} />
                        <Pressable 
                            onPress={() => handlePlayerName(playerName)}
                        ><Text style={Styles.button2}>OK</Text>
                        </Pressable>
                    </>
                    :
                    <>
                        <Text style={Styles.title2}>Rules of the game</Text>
                        <Text style={Styles.gameInfo} multiline="true">THE GAME: Upper section of the classic Yahtzee
                            dice game. You have {NBR_OF_DICES} dices and
                            for the every dice you have {NBR_OF_THROWS}
                            throws. After each throw you can keep dices in
                            order to get same dice spot counts as many as
                            possible. In the end of the turn you must select
                            your points from {MIN_SPOT} to {MAX_SPOT}.
                            Game ends when all points have been selected.
                            The order for selecting those is free.
                        </Text>
                        <Text style={Styles.gameInfo} multiline="true">
                            POINTS: After each turn game calculates the sum
                            for the dices you selected. Only the dices having
                            the same spot count are calculated. Inside the
                            game you can not select same points from
                            {MIN_SPOT} to {MAX_SPOT} again.
                        </Text>
                        <Text style={Styles.gameInfo} multiline="true">
                            GOAL: To get points as much as possible.
                            {BONUS_POINTS_LIMIT} points is the limit of
                            getting bonus which gives you {BONUS_POINTS}
                            points more.
                        </Text>
                        <Text style={Styles.title2}>Good luck, {playerName}</Text>
                        <Pressable
                            onPress={() => navigation.navigate('Gameboard', { player: playerName })}
                        >
                            <Text style={Styles.button3}>PLAY</Text>
                        </Pressable>
                    </>}

            </View>
            <Footer />

        </>
    )
} 