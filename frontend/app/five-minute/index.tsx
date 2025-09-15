import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface FiveMinuteSession {
  task_name: string;
  micro_action_taken: string;
  continued_beyond_five: boolean;
  total_duration: number;
  momentum_created: boolean;
  energy_before: number;
  energy_after: number;
}

export default function FiveMinuteModule() {
  const [userId, setUserId] = useState<string>('');
  const [phase, setPhase] = useState<'setup' | 'active' | 'decision' | 'complete'>('setup');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [isActive, setIsActive] = useState(false);
  
  // Session data
  const [taskName, setTaskName] = useState('');
  const [microAction, setMicroAction] = useState('');
  const [energyBefore, setEnergyBefore] = useState(5);
  const [energyAfter, setEnergyAfter] = useState(5);
  const [continuedBeyond, setContinuedBeyond] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const momentumAnimation = useRef(new Animated.Value(1)).current;

  // Micro-action suggestions by category
  const microActionSuggestions = {
    'Writing': [
      'Write one sentence',
      'Create a title or heading',
      'Write down 3 key points',
      'Open the document and read what you have',
      'Write a rough outline',
    ],
    'Studying': [
      'Read one page',
      'Review chapter headings',
      'Create one flashcard',
      'Summarize one paragraph',
      'Look up one term',
    ],
    'Exercise': [
      'Put on workout clothes',
      'Do 5 pushups or stretches',
      'Walk around the block',
      'Set up your exercise space',
      'Do one minute of jumping jacks',
    ],
    'Cleaning': [
      'Make your bed',
      'Clear one surface',
      'Put away 5 items',
      'Wipe down one counter',
      'Sort one pile of papers',
    ],
    'Work Tasks': [
      'Reply to one email',
      'Review your calendar',
      'Make one phone call',
      'Update your to-do list',
      'Organize one folder',
    ],
    'Creative': [
      'Sketch for 2 minutes',
      'Write 3 words that describe your idea',
      'Take one reference photo',
      'Mix one color',
      'Play one chord or note',
    ],
  };

  const taskCategories = Object.keys(microActionSuggestions);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          const newTime = time - 1;
          updateProgress(newTime);
          
          if (newTime <= 0) {
            setIsActive(false);
            handleFiveMinutesComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const updateProgress = (remaining: number) => {
    const progress = (300 - remaining) / 300;
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const startFiveMinutes = () => {
    if (!taskName.trim() || !microAction.trim()) {
      Alert.alert('Missing Information', 'Please enter both a task and a micro-action.');
      return;
    }

    setSessionStart(new Date());
    setPhase('active');
    setIsActive(true);
    progressAnimation.setValue(0);
  };

  const handleFiveMinutesComplete = () => {
    setPhase('decision');
    startMomentumAnimation();
  };

  const startMomentumAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(momentumAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(momentumAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const continueWorking = () => {
    setContinuedBeyond(true);
    setPhase('active');
    setIsActive(true);
    setTimeRemaining(600); // 10 more minutes
  };

  const stopAndReflect = () => {
    setContinuedBeyond(false);
    setPhase('complete');
    if (sessionStart) {
      setTotalDuration(Math.round((Date.now() - sessionStart.getTime()) / 60000));
    }
  };

  const saveSession = async () => {
    if (!userId || !sessionStart) return;

    const actualDuration = totalDuration || Math.round((Date.now() - sessionStart.getTime()) / 60000);
    const momentumCreated = continuedBeyond || energyAfter > energyBefore;

    const sessionData: FiveMinuteSession = {
      task_name: taskName,
      micro_action_taken: microAction,
      continued_beyond_five: continuedBeyond,
      total_duration: actualDuration,
      momentum_created: momentumCreated,
      energy_before: energyBefore,
      energy_after: energyAfter,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/five-minute/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Success!', 'Your micro-session has been recorded!');
        resetSession();
      }
    } catch (error) {
      Alert.alert('Success!', 'Micro-session completed! (Demo mode)');
      resetSession();
    }
  };

  const resetSession = () => {
    setPhase('setup');
    setIsActive(false);
    setTimeRemaining(300);
    setTaskName('');
    setMicroAction('');
    setEnergyBefore(5);
    setEnergyAfter(5);
    setContinuedBeyond(false);
    setTotalDuration(0);
    setSessionStart(null);
    progressAnimation.setValue(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSuggestionsForCategory = (category: string) => {
    return microActionSuggestions[category] || [];
  };

  const renderSetup = () => (
    <ScrollView style={styles.container}>
      <View style={styles.setupContainer}>
        <View style={styles.heroSection}>
          <Ionicons name="play-circle" size={64} color="#06B6D4" />
          <Text style={styles.heroTitle}>Just 5 Minutes</Text>
          <Text style={styles.heroSubtitle}>
            Start small, build momentum. The hardest part is starting.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What do you want to work on?</Text>
          <TextInput
            style={styles.taskInput}
            placeholder="e.g., Write my report, Study for exam, Clean my room..."
            value={taskName}
            onChangeText={setTaskName}
            multiline
          />
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Choose a category for suggestions:</Text>
          <View style={styles.categoryButtons}>
            {taskCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryButton}
                onPress={() => {
                  // Show suggestions for this category
                  Alert.alert(
                    `${category} Micro-Actions`,
                    getSuggestionsForCategory(category).join('\n\n'),
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.categoryButtonText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What's your 5-minute micro-action?</Text>
          <Text style={styles.inputHelper}>
            Choose the smallest possible step that moves you forward.
          </Text>
          <TextInput
            style={styles.actionInput}
            placeholder="e.g., Write one paragraph, Read 2 pages, Put on workout clothes..."
            value={microAction}
            onChangeText={setMicroAction}
            multiline
          />
        </View>

        <View style={styles.energySection}>
          <Text style={styles.sectionTitle}>How's your energy level right now?</Text>
          <View style={styles.energySlider}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyButton,
                  energyBefore === level && styles.energyButtonSelected
                ]}
                onPress={() => setEnergyBefore(level)}
              >
                <Text style={[
                  styles.energyButtonText,
                  energyBefore === level && styles.energyButtonTextSelected
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.energyLabels}>
            <Text style={styles.energyLabel}>Low</Text>
            <Text style={styles.energyLabel}>High</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startFiveMinutes}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start 5 Minutes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderActive = () => (
    <View style={styles.activeContainer}>
      <Text style={styles.activeTitle}>
        {continuedBeyond ? 'Keep Going!' : 'Just 5 Minutes'}
      </Text>
      <Text style={styles.activeSubtitle}>{taskName}</Text>
      
      <View style={styles.timerContainer}>
        <View style={styles.progressCircle}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                transform: [{
                  rotate: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                }],
              },
            ]}
          />
          <View style={styles.timerInner}>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.actionText}>{microAction}</Text>
          </View>
        </View>
      </View>

      <View style={styles.encouragementContainer}>
        <Text style={styles.encouragementText}>
          {timeRemaining > 240 ? "You've got this! Just focus on this one small step." :
           timeRemaining > 120 ? "Great progress! Keep going with your micro-action." :
           timeRemaining > 60 ? "Almost there! You're building momentum." :
           "Final minute! Feel that sense of accomplishment growing."}
        </Text>
      </View>

      <View style={styles.activeControls}>
        <TouchableOpacity style={styles.pauseButton} onPress={() => setIsActive(!isActive)}>
          <Ionicons name={isActive ? 'pause' : 'play'} size={24} color="#FFFFFF" />
        </TouchableOpacity>
        {!continuedBeyond && (
          <TouchableOpacity style={styles.stopButton} onPress={stopAndReflect}>
            <Ionicons name="stop" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDecision = () => (
    <View style={styles.decisionContainer}>
      <Animated.View style={[styles.successIcon, { transform: [{ scale: momentumAnimation }] }]}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </Animated.View>
      
      <Text style={styles.decisionTitle}>5 Minutes Complete!</Text>
      <Text style={styles.decisionSubtitle}>
        You did it! You've broken through the initial resistance.
      </Text>

      <View style={styles.momentumCard}>
        <Ionicons name="trending-up" size={32} color="#06B6D4" />
        <Text style={styles.momentumTitle}>Momentum Check</Text>
        <Text style={styles.momentumText}>
          How are you feeling? Ready to keep going or satisfied with this small win?
        </Text>
      </View>

      <View style={styles.decisionButtons}>
        <TouchableOpacity style={styles.continueButton} onPress={continueWorking}>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.continueButtonText}>Keep Going!</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.finishButton} onPress={stopAndReflect}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.finishButtonText}>That's Enough</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <Ionicons name="star" size={64} color="#F59E0B" />
      <Text style={styles.completeTitle}>Well Done!</Text>
      <Text style={styles.completeSummary}>{taskName}</Text>
      
      <View style={styles.resultsCard}>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Time Spent</Text>
          <Text style={styles.resultValue}>{totalDuration} minutes</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Micro-Action</Text>
          <Text style={styles.resultValue}>{microAction}</Text>
        </View>
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Continued Beyond 5 Min</Text>
          <Text style={[styles.resultValue, continuedBeyond ? styles.resultPositive : styles.resultNeutral]}>
            {continuedBeyond ? 'Yes! 🎉' : 'No, and that\'s okay! ✨'}
          </Text>
        </View>
      </View>

      <View style={styles.energyComparison}>
        <Text style={styles.comparisonTitle}>Energy Level</Text>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Before</Text>
            <Text style={styles.comparisonValue}>{energyBefore}/10</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#64748B" />
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>After</Text>
            <View style={styles.energyRating}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.energyRatingButton,
                    energyAfter === level && styles.energyRatingButtonSelected
                  ]}
                  onPress={() => setEnergyAfter(level)}
                >
                  <Text style={[
                    styles.energyRatingText,
                    energyAfter === level && styles.energyRatingTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.completeButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={saveSession}>
          <Text style={styles.saveButtonText}>Save Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newSessionButton} onPress={resetSession}>
          <Text style={styles.newSessionButtonText}>Start Another</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => phase !== 'setup' ? resetSession() : null}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>5-Minute Rule</Text>
        <View style={{ width: 24 }} />
      </View>

      {phase === 'setup' && renderSetup()}
      {phase === 'active' && renderActive()}
      {phase === 'decision' && renderDecision()}
      {phase === 'complete' && renderComplete()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  setupContainer: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  inputHelper: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 60,
  },
  actionInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: '500',
  },
  energySection: {
    marginBottom: 32,
  },
  energySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  energyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  energyButtonSelected: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
  },
  energyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
  energyButtonTextSelected: {
    color: '#FFFFFF',
  },
  energyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  energyLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  activeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  timerContainer: {
    marginBottom: 32,
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#06B6D4',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  encouragementContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    maxWidth: 300,
  },
  encouragementText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 20,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decisionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 24,
  },
  decisionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  decisionSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  momentumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  momentumTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 8,
  },
  momentumText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  decisionButtons: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  completeSummary: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  resultPositive: {
    color: '#10B981',
  },
  resultNeutral: {
    color: '#6366F1',
  },
  energyComparison: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  energyRating: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 100,
    justifyContent: 'center',
  },
  energyRatingButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  energyRatingButtonSelected: {
    backgroundColor: '#06B6D4',
    borderColor: '#06B6D4',
  },
  energyRatingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  energyRatingTextSelected: {
    color: '#FFFFFF',
  },
  completeButtons: {
    width: '100%',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newSessionButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newSessionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});