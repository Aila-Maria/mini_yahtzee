import { Text, View } from "react-native";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../style/style";
import { useEffect, useState } from "react";
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS, BONUS_POINTS_LIMIT, SCOREBOARD_KEY } from "../constants/Game";
import { Container, Row, Col } from "react-native-flex-grid";
import { Pressable } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { setStatusBarStyle } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";


let board = [];

export default Gameboard = ({ navigation, route }) => {

    const [playerName, setPlayerName] = useState('');
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('Throw dices');
    const [gameEndStatus, setGameEndStatus] = useState(false);
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false)); //Ovatko nopat kiinnitetty
    const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0)); //Noppien silmäluvut
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(false)); // Onko silmäluvulle valittu pisteet
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0)); //Kerätyt pisteet
    const [scores, setScores] = useState([]); //Tulostaulun pisteet
    const [bonusPointTxt,setBonusPointTxt] = useState(`You are ${BONUS_POINTS_LIMIT} points away from bonus`);
    const [totalPoints,setTotalPoints] = useState(0);


    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player);
        }

    }, []);


    useEffect(() =>{
        const unsubscribe = navigation.addListener('focus',() =>{
            getScoreboardData();
        });
        return unsubscribe;
    },[navigation]);



    useEffect(() =>{
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        selectedDices.fill(false);
        setStatus('Throw dices');
        let totalPointCounter = dicePointsTotal.reduce((sum, point)=>sum + point,0);
        let missingPoints = BONUS_POINTS_LIMIT-totalPointCounter;
        if(missingPoints > 0){
            setTotalPoints(totalPointCounter);
            setBonusPointTxt(`You are ${missingPoints} points away from bonus`);
        }
        else{
            const newTotalPoints = totalPointCounter + BONUS_POINTS;
            setTotalPoints(newTotalPoints);
            setBonusPointTxt(`Bonus points (50) added!`);
        }
        const allPointsSelected = selectedDicePoints.every((pointSelected)=>pointSelected);
            if(allPointsSelected){
                setGameEndStatus(true);
            }
    },[selectedDicePoints]);

    useEffect(()=>{
        if(gameEndStatus){
            savePlayerPoints();
            setStatus('Game over!');
        }
    },[gameEndStatus]);

    const dicesRow = [];
    for (let dice = 0; dice < NBR_OF_DICES; dice++) {
        dicesRow.push(
            <Col key={"dice" + dice}>
                <Pressable
                    key={"dice" + dice}
                    onPress={() => selectDice(dice)}>
                    <MaterialCommunityIcons
                        name={board[dice]}
                        key={"dice" + dice}
                        size={50}
                        color={getDiceColor(dice)}>
                    </MaterialCommunityIcons>

                </Pressable>
            </Col>
        );
    }

    const pointsRow = [];
    for (let spot = 0; spot < MAX_SPOT; spot++) {
        pointsRow.push(
            <Col key={"pointsRow" + spot}>
                <Text key={"pointsRow" + spot}>{getSpotTotal(spot)}</Text>
            </Col>
        );
    }

    const pointsToSelectRow = [];
    for (let diceButton = 0; diceButton < MAX_SPOT; diceButton++) {
        pointsToSelectRow.push(
            <Col key={"buttonsRow" + diceButton}>
                <Pressable
                    key={"buttonsRow" + diceButton}
                    onPress={() => selectDicePoints(diceButton)}
                >
                    <MaterialCommunityIcons
                        name={"numeric-" + (diceButton + 1) + "-circle"}
                        key={"buttonsRow" + diceButton}
                        size={35}
                        color={getDicePointsColor(diceButton)}
                    >
                    </MaterialCommunityIcons>
                </Pressable>
            </Col>
        );
    }

    const selectDicePoints = (i) => {
        if (nbrOfThrowsLeft === 0) {
            let selectedPoints = [...selectedDicePoints];
            let points = [...dicePointsTotal];
            if (!selectedPoints[i]) {
                selectedPoints[i] = true;
                let nbrOFDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1 : total), 0);
                points[i] = nbrOFDices * (i + 1);
            }
            else {
                setStatus('You already selected points for' + (i + 1));
                return points[i];
            }
            setDicePointsTotal(points);
            setSelectedDicePoints(selectedPoints);
            return points[i];
        }
        else{
            setStatus('Throw ' + NBR_OF_THROWS + ' times before setting points');
        }
    }

    const savePlayerPoints = async() => {
        const currentDate = new Date();
        const newKey = scores.length + 1;
        const playerPoints = {
            Key: newKey,
            name: playerName,
            date: currentDate.toLocaleDateString(),
            time: currentDate.toLocaleTimeString(),
            points: totalPoints
        }
        try{
            const newScore = [...scores, playerPoints];
            const jsonValue = JSON.stringify(newScore);
            await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
        }
        catch(e){
            console.log('save error: ' + e);
        }
    }

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

    const throwDices = () => {
        if (nbrOfThrowsLeft === 0 && !gameEndStatus) {
            setStatus('Select your points before the next throw');
            return;
        }
        else if (nbrOfThrowsLeft === 3 && gameEndStatus) {
           // setGameEndStatus(false);
            diceSpots.fill(0);
            dicePointsTotal.fill(0);
            setStatus('Game over!')
        }
        else{
        let spots = [...diceSpots];
        for (let i = 0; i < NBR_OF_DICES; i++) {
            if (!selectedDices[i]) {
                let randomNumber = Math.floor(Math.random() * 6 + 1);
                board[i] = 'dice-' + randomNumber;
                spots[i] = randomNumber;
            }
        }
        setNbrOfThrowsLeft(nbrOfThrowsLeft - 1);
        setDiceSpots(spots);
        setStatus('Select and throw dices again');
    }
    }

    function getSpotTotal(i) {
        return dicePointsTotal[i];
    }

    const selectDice = (i) => {
        if (nbrOfThrowsLeft < NBR_OF_THROWS && !gameEndStatus) {
            let dices = [...selectedDices];
            dices[i] = selectedDices[i] ? false : true;
            setSelectedDices(dices);
        }
        else {
            setStatus('You have to throw dices first');
        }
    }

    const restartGame = () => {
        setGameEndStatus(false)
        setStatus('Throw dices')
        totalPointsCounter = 0
        pointsMissing =0
        diceSpots.fill(0) 
        dicePointsTotal.fill(0)
        setTotalPoints(0)
        selectedDices.fill(0)
        selectedDicePoints.fill(0)
        setBonusPointTxt(`You are ${BONUS_POINTS_LIMIT} points away from bonus`)
    }

    function getDiceColor(i) {
        return selectedDices[i] ? "#631e1e" : "white";
    }

    function getDicePointsColor(i) {
        return (selectedDicePoints[i] && !gameEndStatus) ? "#631e1e" : "white";
    }


    return (
        <>
            <Header />
            <View style={styles.gameboard}>
                <Container fluid>
                    <Row style={styles.dices}>{dicesRow}</Row>
                </Container>
                <Text style={styles.text}>Throws left:{nbrOfThrowsLeft}</Text>
                <Text style={styles.text}>{status}</Text>
                {!gameEndStatus ?
                    <Pressable onPress={() => throwDices()} >
                        <Text style={styles.button}>THROW DICES</Text>
                    </Pressable>
                    :<View>
                        <Pressable onPress={restartGame} >
                        <Text style={styles.button}>Try again!</Text>
                    </Pressable>
                    </View>
                }
                <Text style={styles.text}>Points: {totalPoints}</Text>
                <Text style={styles.text}>{bonusPointTxt}</Text>
                <Container fluid>
                    <Row style={styles.points}>{pointsRow}</Row>
                </Container>
                <Container fluid>
                    <Row style={styles.pointsToSelect}>{pointsToSelectRow}</Row>
                </Container>
                <Text style={styles.text}>Player: {playerName}</Text>
            </View>
            <Footer />
        </>
    )
}