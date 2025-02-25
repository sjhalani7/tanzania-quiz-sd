import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";

const API_URL = "http://127.0.0.1:5000/api/subjects";

export default function FormSelection() {
    const [forms, setFroms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { subject_num } = useLocalSearchParams();
    console.log("Params", { subject_num });
    useEffect(() => {
        const fetchForms = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    setError('Failed to fetch subjects');
                    return;
                }
                const data = await response.json();
                console.log(data);
                setFroms(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchForms();
    }, []);

    const handleSelectForm = (form) => {
        router.push({ pathname: "/topicSelection", params: { form_num: form.form_id } });
    };

    const renderItem = ({ item }) => {
        if (!item.form_name) return null;
        return (
            <TouchableOpacity
                style={styles.formItem}
                onPress={() => handleSelectForm(item)}
            >
                <Text style={[styles.formText, { flexWrap: "wrap" }]}>
                    {item.form_name}
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
                data={forms}
                renderItem={renderItem}
                keyExtractor={(item) => item.form_id.toString()}
                ListEmptyComponent={<Text>No Forms Available</Text>}
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
