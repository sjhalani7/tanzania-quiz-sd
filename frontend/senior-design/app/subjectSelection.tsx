import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

const API_URL = "https://tetea.org/api/subjects";

export default function SubjectSelection() {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    setError('Failed to fetch subjects');
                    return;
                }
                const data = await response.json();
                setSubjects(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    const handleSelectSubject = (subject) => {
        router.push({ pathname: "/formSelection", params: { subject_num: subject.subject_id } });
    };

    const renderItem = ({ item }) => {
        if (!item.subject_name) return null;
        return (
            <TouchableOpacity
                style={styles.subjectItem}
                onPress={() => handleSelectSubject(item)}
            >
                <Text style={[styles.subjectText, { flexWrap: "wrap" }]}>
                    {item.subject_name}
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
                data={subjects}
                renderItem={renderItem}
                keyExtractor={(item) => item.subject_id.toString()}
                ListEmptyComponent={<Text>No Subjects Available</Text>}
                contentContainerStyle={styles.flatListContainer}
                style={{ width: '100%', flex: 1 }}
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
    subjectItem: {
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
    subjectText: {
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
