import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const API_URL = "http://127.0.0.1:5000/api/questions";

export default function QuestionViewerFR() {
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
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

    const questionKeys = Object.keys(questions);
    const currentQuestion = questions[questionKeys[currentIndex]];
    const correctAnswer = currentQuestion.answers.find(answer => answer.answer_type === 'right').answer_text;

    const handleSubmit = () => {
        if (!userInput.trim()) return;
        const correct = userInput.trim().toLowerCase() === correctAnswer.toLowerCase();
        setIsCorrect(correct);
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
                <Text style={styles.title}>{isCorrect ? 'Correct!' : `Wrong Answer! The correct answer is: ${correctAnswer}`}</Text>
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
