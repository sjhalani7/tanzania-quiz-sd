import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";

const API_URL = "https://tetea.org/api/topics";

export default function TopicSelection() {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { form_num } = useLocalSearchParams();
    console.log("Params", { form_num });
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                console.log(form_num)
                const response = await fetch(API_URL + "?form_id=" + form_num);
                if (!response.ok) {
                    setError('Failed to fetch subjects');
                    return;
                }
                const data = await response.json();
                setTopics(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    const handleSelectTopic = (topic) => {
        //console.log("Params:", { topic_num: topic.topic_id });
        router.push({ pathname: "/difficultySelection", params: { topic_num: topic.topic_id } });
    };

    const renderItem = ({ item }) => {
        if (!item.topic_name) return null;
        return (
            <TouchableOpacity
                style={styles.topicItem}
                onPress={() => handleSelectTopic(item)}
            >
                <Text style={[styles.topicText, { flexWrap: "wrap" }]}>
                    {item.topic_name}
                </Text>
            </TouchableOpacity>
        );
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

    return (
        <View style={styles.container}>
            <FlatList
                data={topics}
                renderItem={renderItem}
                keyExtractor={(item) => item.topic_id.toString()}
                ListEmptyComponent={<Text>No Topics Available</Text>}
                contentContainerStyle={styles.flatListContainer}
                style={{ width: '100%' }}
            />
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
    flatListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
        marginBottom: 20,
    },
    topicItem: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 8,
        minWidth: 120, 
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topicText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        flexShrink: 1,
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
