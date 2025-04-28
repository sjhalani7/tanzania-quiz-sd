import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ReactGA from "react-ga4";

ReactGA.initialize("G-6NZWVXM5XR");

ReactGA.send({ hitType: "pageview", page: "/hard-questions", title: "Hard Questions" });

const API_URL = "https://tetea.org/api/questions";

export default function QuestionViewerFR() {
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isClose, setIsClose] = useState(false);
    const router = useRouter();
    const { topic_num, difficulty } = useLocalSearchParams();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(API_URL + "?topic_id="+ topic_num + "&difficulty=" + difficulty);
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                const data = await response.json();
                setQuestions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    const levenshteinDistance = (s, t) => {
        if (!s.length) return t.length;
        if (!t.length) return s.length;
        const arr = [];
        for (let i = 0; i <= t.length; i++) {
            arr[i] = [i];
            for (let j = 1; j <= s.length; j++) {
                arr[i][j] =
                    i === 0
                        ? j
                        : Math.min(
                            arr[i - 1][j] + 1,
                            arr[i][j - 1] + 1,
                            arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
                        );
            }
        }
        return arr[t.length][s.length];
    };

    const questionKeys = Object.keys(questions);
    const currentQuestion = questions[questionKeys[currentIndex]];
    const correctAnswer = currentQuestion.answers.find(answer => answer.answer_type === 'right').answer_text;

    const handleSubmit = () => {
        if (!userInput.trim()) return;
        let closeVal = levenshteinDistance(userInput.trim().toLowerCase(), correctAnswer.toLowerCase());
        if (closeVal == 0){
            setIsCorrect(true);
        }else if(closeVal <= 2){
            setIsCorrect(false);
            setIsClose(true);
        }else{
            setIsCorrect(false);
            setIsClose(false);
        }
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        if (currentIndex < questionKeys.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserInput('');
            setShowFeedback(false);
        } else {
            router.push("/endScreen");
        }
    };

    if (showFeedback) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{isCorrect ? 'Correct!' : (isClose ? `Close! The correct answer is: ${correctAnswer}`:`Wrong Answer! The correct answer is: ${correctAnswer}`)}</Text>
                <Button title="Next Question" onPress={handleNextQuestion} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{currentQuestion.question_text}</Text>
            <TextInput
                style={styles.input}
                placeholder="Type your answer here"
                value={userInput}
                onChangeText={setUserInput}
            />
            <Button title="Submit" onPress={handleSubmit} disabled={!userInput.trim()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        width: '80%',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        marginTop: 10,
    }
});
