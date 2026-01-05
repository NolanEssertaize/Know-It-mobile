import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Result() {
    const params = useLocalSearchParams();

    const valid = params.valid ? JSON.parse(params.valid as string) : [];
    const corrections = params.corrections ? JSON.parse(params.corrections as string) : [];
    const missing = params.missing ? JSON.parse(params.missing as string) : [];

    const Section = ({ title, data, color }: { title: string, data: string[], color: string }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
            {data.map((item, i) => (
                <Text key={i} style={styles.point}>• {item}</Text>
            ))}
            {data.length === 0 && <Text style={styles.empty}>Rien à signaler.</Text>}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Section title="✅ Correct" data={valid} color="green" />
            <Section title="⚠️ À corriger" data={corrections} color="orange" />
            <Section title="❌ Manquant" data={missing} color="red" />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    point: { fontSize: 16, marginBottom: 5, lineHeight: 22 },
    empty: { fontStyle: 'italic', color: '#999' }
});