import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";

export default function DifficultySelection() {
    const router = useRouter();
    const { topic_num } = useLocalSearchParams();
    console.log("Params", { topic_num });
    const handleSelectDifficulty = (difficulty) => {
        console.log("Selected Difficulty:", difficulty);
        if (difficulty == "Easy"){
            router.push({ pathname: "/questionViewerTF", params: { topic_num: topic_num, difficulty: difficulty }});
        }else if(difficulty == "Medium"){
            router.push({ pathname: "/questionViewerMC", params: { topic_num: topic_num, difficulty: difficulty }});
        }else if(difficulty == "Hard"){
            router.push({ pathname: "/questionViewerFR", params: { topic_num: topic_num, difficulty: difficulty }});
        }else{
            return (
                <View style={styles.container}>
                    <Text style={styles.errorText}>Error - Difficulty Incorrect</Text>
                </View>
            );
        }


    };

    const renderItem = ({ item }) => {
        if (!item) return null;
        return (
            <TouchableOpacity
                style={styles.difficultyItem}
                onPress={() => handleSelectDifficulty(item)}
            >
                <Text style={[styles.difficultyText, { flexWrap: "wrap" }]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={["Easy","Medium","Hard"]}
                renderItem={renderItem}
                ListEmptyComponent={<Text>No Difficulty Available</Text>}
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
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
        marginBottom: 20,
    },
    difficultyItem: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginVertical: 8,
        width: '80%',
        alignSelf: 'center',
    },
    difficultyText: {
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
