import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface MeditationSession {
  meditation_type: string;
  duration_planned: number;
  duration_actual: number;
  completion_rate: number;
  pre_session_state: {
    stress_level: number;
    focus_level: number;
    energy_level: number;
  };
  post_session_state: {
    stress_level: number;
    focus_level: number;
    energy_level: number;
  };
  focus_quality: number;
  insights: string[];
}

export default function MindfulnessModule() {
  const [userId, setUserId] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [selectedType, setSelectedType] = useState('breathing');
  const [phase, setPhase] = useState<'setup' | 'pre-checkin' | 'meditation' | 'post-checkin'>('setup');
  
  const [preSessionState, setPreSessionState] = useState({
    stress_level: 5,
    focus_level: 5,
    energy_level: 5,
  });
  
  const [postSessionState, setPostSessionState] = useState({
    stress_level: 5,
    focus_level: 5,
    energy_level: 5,
  });

  const [startTime, setStartTime] = useState<Date | null>(null);
  const breatheAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const meditationTypes = [
    { id: 'breathing', name: 'Mindful Breathing', icon: 'leaf', description: 'Focus on your breath' },
    { id: 'body-scan', name: 'Body Scan', icon: 'body', description: 'Progressive relaxation' },
    { id: 'loving-kindness', name: 'Loving Kindness', icon: 'heart', description: 'Cultivate compassion' },
    { id: 'present-moment', name: 'Present Moment', icon: 'eye', description: 'Awareness practice' },
  ];

  const durations = [3, 5, 10, 15, 20];

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            completeSession();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  useEffect(() => {
    if (phase === 'meditation') {
      startBreathingAnimation();
    }
  }, [phase]);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const startBreathingAnimation = () => {
    const breatheCycle = () => {
      Animated.sequence([
        Animated.timing(breatheAnimation, {
          toValue: 1.3,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (phase === 'meditation' && isActive) {
          breatheCycle();
        }
      });
    };

    breatheCycle();

    // Pulse animation for the outer ring
    const pulseLoop = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    pulseLoop();
  };

  const startPreCheckin = () => {
    setPhase('pre-checkin');
  };

  const startMeditation = () => {
    setTimeRemaining(selectedDuration * 60);
    setStartTime(new Date());
    setIsActive(true);
    setPhase('meditation');
  };

  const pauseResume = () => {
    setIsActive(!isActive);
  };

  const stopMeditation = () => {
    setIsActive(false);
    setPhase('post-checkin');
  };

  const completeSession = () => {
    setPhase('post-checkin');
  };

  const saveMeditationSession = async () => {
    if (!userId || !startTime) return;

    const actualDuration = Math.round((selectedDuration * 60 - timeRemaining) / 60);
    const completionRate = actualDuration / selectedDuration;

    const sessionData: MeditationSession = {
      meditation_type: selectedType,
      duration_planned: selectedDuration,
      duration_actual: actualDuration,
      completion_rate: completionRate,
      pre_session_state: preSessionState,
      post_session_state: postSessionState,
      focus_quality: Math.round((postSessionState.focus_level + (10 - postSessionState.stress_level)) / 2),
      insights: [],
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/mindfulness/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Session Complete', 'Your meditation session has been saved!');
        resetSession();
      }
    } catch (error) {
      Alert.alert('Success', 'Meditation session completed! (Demo mode)');
      resetSession();
    }
  };

  const resetSession = () => {
    setPhase('setup');
    setIsActive(false);
    setTimeRemaining(selectedDuration * 60);
    setStartTime(null);
    breatheAnimation.setValue(1);
    pulseAnimation.setValue(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSetup = () => (
    <View style={styles.setupContainer}>
      <Text style={styles.setupTitle}>Choose Your Practice</Text>
      
      <View style={styles.typeContainer}>
        {meditationTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              selectedType === type.id && styles.typeCardSelected
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Ionicons 
              name={type.icon as any} 
              size={32} 
              color={selectedType === type.id ? '#8B5CF6' : '#64748B'} 
            />
            <Text style={[
              styles.typeName,
              selectedType === type.id && styles.typeNameSelected
            ]}>
              {type.name}
            </Text>
            <Text style={styles.typeDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.durationTitle}>Duration</Text>
      <View style={styles.durationContainer}>
        {durations.map((duration) => (
          <TouchableOpacity
            key={duration}
            style={[
              styles.durationButton,
              selectedDuration === duration && styles.durationButtonSelected
            ]}
            onPress={() => setSelectedDuration(duration)}
          >
            <Text style={[
              styles.durationText,
              selectedDuration === duration && styles.durationTextSelected
            ]}>
              {duration}m
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startPreCheckin}>
        <Text style={styles.startButtonText}>Begin Session</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPreCheckin = () => (
    <View style={styles.checkinContainer}>
      <Text style={styles.checkinTitle}>How are you feeling right now?</Text>
      <Text style={styles.checkinSubtitle}>Rate each area from 1-10</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Stress Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                preSessionState.stress_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPreSessionState({ ...preSessionState, stress_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                preSessionState.stress_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Focus Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                preSessionState.focus_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPreSessionState({ ...preSessionState, focus_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                preSessionState.focus_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Energy Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                preSessionState.energy_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPreSessionState({ ...preSessionState, energy_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                preSessionState.energy_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={startMeditation}>
        <Text style={styles.continueButtonText}>Start Meditation</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMeditation = () => (
    <View style={styles.meditationContainer}>
      <Text style={styles.meditationType}>
        {meditationTypes.find(t => t.id === selectedType)?.name}
      </Text>
      
      <View style={styles.timerContainer}>
        <Animated.View 
          style={[
            styles.outerCircle,
            { transform: [{ scale: pulseAnimation }] }
          ]}
        />
        <Animated.View 
          style={[
            styles.breatheCircle,
            { transform: [{ scale: breatheAnimation }] }
          ]}
        />
        <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
      </View>

      <View style={styles.instructionContainer}>
        {selectedType === 'breathing' && (
          <Text style={styles.instructionText}>
            Follow the circle's rhythm.{'\n'}
            Breathe in as it expands,{'\n'}
            breathe out as it contracts.
          </Text>
        )}
        {selectedType === 'body-scan' && (
          <Text style={styles.instructionText}>
            Start from the top of your head.{'\n'}
            Slowly scan down through your body,{'\n'}
            noticing each sensation.
          </Text>
        )}
        {selectedType === 'loving-kindness' && (
          <Text style={styles.instructionText}>
            Send loving thoughts to yourself,{'\n'}
            then to loved ones,{'\n'}
            then to all beings.
          </Text>
        )}
        {selectedType === 'present-moment' && (
          <Text style={styles.instructionText}>
            Notice what you can hear,{'\n'}
            what you can feel,{'\n'}
            without trying to change anything.
          </Text>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={pauseResume}>
          <Ionicons 
            name={isActive ? 'pause' : 'play'} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={stopMeditation}>
          <Ionicons name="stop" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPostCheckin = () => (
    <View style={styles.checkinContainer}>
      <Text style={styles.checkinTitle}>How do you feel now?</Text>
      <Text style={styles.checkinSubtitle}>Rate each area from 1-10</Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Stress Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                postSessionState.stress_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPostSessionState({ ...postSessionState, stress_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                postSessionState.stress_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Focus Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                postSessionState.focus_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPostSessionState({ ...postSessionState, focus_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                postSessionState.focus_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Energy Level</Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.ratingButton,
                postSessionState.energy_level === num && styles.ratingButtonSelected
              ]}
              onPress={() => setPostSessionState({ ...postSessionState, energy_level: num })}
            >
              <Text style={[
                styles.ratingButtonText,
                postSessionState.energy_level === num && styles.ratingButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.improvementContainer}>
        <Text style={styles.improvementTitle}>Your Progress</Text>
        <View style={styles.improvementItem}>
          <Text style={styles.improvementLabel}>Stress:</Text>
          <Text style={[
            styles.improvementValue,
            preSessionState.stress_level > postSessionState.stress_level ? styles.improvementPositive : styles.improvementNegative
          ]}>
            {preSessionState.stress_level} → {postSessionState.stress_level}
          </Text>
        </View>
        <View style={styles.improvementItem}>
          <Text style={styles.improvementLabel}>Focus:</Text>
          <Text style={[
            styles.improvementValue,
            postSessionState.focus_level > preSessionState.focus_level ? styles.improvementPositive : styles.improvementNegative
          ]}>
            {preSessionState.focus_level} → {postSessionState.focus_level}
          </Text>
        </View>
        <View style={styles.improvementItem}>
          <Text style={styles.improvementLabel}>Energy:</Text>
          <Text style={[
            styles.improvementValue,
            postSessionState.energy_level > preSessionState.energy_level ? styles.improvementPositive : styles.improvementNegative
          ]}>
            {preSessionState.energy_level} → {postSessionState.energy_level}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.finishButton} onPress={saveMeditationSession}>
        <Text style={styles.finishButtonText}>Complete Session</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setPhase('setup')}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mindfulness</Text>
        <View style={{ width: 24 }} />
      </View>

      {phase === 'setup' && renderSetup()}
      {phase === 'pre-checkin' && renderPreCheckin()}
      {phase === 'meditation' && renderMeditation()}
      {phase === 'post-checkin' && renderPostCheckin()}
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
    flex: 1,
    padding: 20,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 32,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  typeNameSelected: {
    color: '#8B5CF6',
  },
  typeDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  durationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkinContainer: {
    flex: 1,
    padding: 20,
  },
  checkinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  checkinSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  meditationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  meditationType: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 40,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  outerCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    borderWidth: 2,
    borderColor: '#E0E7FF',
  },
  breatheCircle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  timeText: {
    position: 'absolute',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructionContainer: {
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
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
  improvementContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  improvementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  improvementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  improvementLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  improvementValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  improvementPositive: {
    color: '#10B981',
  },
  improvementNegative: {
    color: '#64748B',
  },
  finishButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});