import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import ReactGA from "react-ga4";

ReactGA.initialize("G-6NZWVXM5XR");

ReactGA.send({ hitType: "pageview", page: "/medium-questions", title: "Medium Questions" });

const API_URL = "https://tetea.org/api/questions";

export default function QuestionViewerMC() {
    const [questions, setQuestions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState(null);
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

    useEffect(() => {
        if (questions && questions[Object.keys(questions)[currentIndex]]) {
            const currentQuestion = questions[Object.keys(questions)[currentIndex]];
            const rightAnswer = currentQuestion.answers.find(answer => answer.answer_type === 'right');
            setCorrectAnswer(rightAnswer);
            const wrongAnswers = currentQuestion.answers.filter(answer => answer.answer_type !== 'right');
            const selectedWrongAnswers = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 3);
            setOptions(shuffleArray([rightAnswer, ...selectedWrongAnswers]));
        }
    }, [questions, currentIndex]);

    const shuffleArray = (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

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

    const handleSubmit = () => {
        if (!selectedAnswer) return;
        const correct = selectedAnswer.answer_type === 'right';
        setIsCorrect(correct);
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        setSelectedAnswer(null); // Clear selected answer
        setShowFeedback(false);
        if (currentIndex < questionKeys.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push("/endScreen");
        }
    };

    if (showFeedback) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{isCorrect ? 'Correct!' : `Wrong Answer! The correct answer is: ${correctAnswer.answer_text}`}</Text>
                <Button title="Next Question" onPress={handleNextQuestion} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{currentQuestion.question_text}</Text>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.answer_id}
                    style={[styles.formItem, selectedAnswer?.answer_id === option.answer_id && { backgroundColor: '#388E3C' }]}
                    onPress={() => setSelectedAnswer(option)}
                >
                    <Text style={styles.formText}>{option.answer_text}</Text>
                </TouchableOpacity>
            ))}
            <Button title="Submit" onPress={handleSubmit} disabled={!selectedAnswer}/>
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
    formItem: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 8,
        width: '80%',
        alignSelf: 'center',
    },
    formText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
    }
});