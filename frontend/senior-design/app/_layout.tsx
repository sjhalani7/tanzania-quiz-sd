import { Stack } from "expo-router";

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: "Welcome",
                }}
            />
            <Stack.Screen
                name="subjectSelection"
                options={{
                    title: "Select a Subject",
                }}
            />
            <Stack.Screen
                name="formSelection"
                options={{
                    title: "Select a Form",
                }}
            />
            <Stack.Screen
                name="topicSelection"
                options={{
                    title: "Select a Topic",
                }}
            />
            <Stack.Screen
                name="difficultySelection"
                options={{
                    title: "Select a Difficulty",
                }}
            />
            <Stack.Screen
                name="questionViewerTF"
                options={{
                    title: "Study",
                }}
            />
            <Stack.Screen
                name="questionViewerMC"
                options={{
                    title: "Study",
                }}
            />
            <Stack.Screen
                name="questionViewerFR"
                options={{
                    title: "Study",
                }}
            />
            <Stack.Screen
                name="endScreen"
                options={{
                    title: "Study",
                }}
            />
        </Stack>

    );
}
