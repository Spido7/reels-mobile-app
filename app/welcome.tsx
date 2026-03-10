import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const techStacks = [
  'Python',
  'C++',
  'Data Science',
  'Web Dev',
  'Android',
  'UI/UX'
];

export default function WelcomeScreen() {
  const router = useRouter();
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const toggleStack = (stack: string) => {
    setSelectedStacks(prev => 
      prev.includes(stack) 
        ? prev.filter(s => s !== stack)
        : [...prev, stack]
    );
  };

  const handleStartWatching = () => {
    // Here you could save the selected stacks to user preferences
    console.log('Selected tech stacks:', selectedStacks);
    router.replace('/feed');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Customize Your Feed</Text>
          <Text style={styles.subtitle}>What are you building today?</Text>
          
          <View style={styles.chipsContainer}>
            {techStacks.map((stack) => (
              <TouchableOpacity
                key={stack}
                style={[
                  styles.chip,
                  selectedStacks.includes(stack) && styles.selectedChip
                ]}
                onPress={() => toggleStack(stack)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.chipText,
                  selectedStacks.includes(stack) && styles.selectedChipText
                ]}>
                  {stack}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartWatching}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Watching</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  chip: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedChipText: {
    color: '#ffffff',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: '#0a0a0a',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
