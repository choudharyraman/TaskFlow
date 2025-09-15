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
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface PomodoroSession {
  task_name: string;
  work_duration: number;
  break_duration: number;
  focus_quality_ratings: number[];
  distractions: Array<{ type: string; duration: number }>;
  break_activities: string[];
  completion_status: string;
  productivity_score: number;
}

export default function PomodoroModule() {
  const [userId, setUserId] = useState<string>('');
  const [phase, setPhase] = useState<'setup' | 'work' | 'break' | 'complete'>('setup');
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1500); // 25 minutes default
  const [currentCycle, setCurrentCycle] = useState(1);
  const [totalCycles, setTotalCycles] = useState(4);
  
  // Session settings
  const [taskName, setTaskName] = useState('');
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  
  // Session tracking
  const [focusRatings, setFocusRatings] = useState<number[]>([]);
  const [distractions, setDistractions] = useState<Array<{ type: string; duration: number }>>([]);
  const [breakActivities, setBreakActivities] = useState<string[]>([]);
  const [currentFocusRating, setCurrentFocusRating] = useState(8);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const commonDistractions = ['Phone', 'Social Media', 'Email', 'Colleague', 'Noise', 'Hunger', 'Bathroom'];
  const breakActivityOptions = ['Stretch', 'Walk', 'Water', 'Deep Breathing', 'Eye Rest', 'Snack'];

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
            handlePhaseComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, phase]);

  useEffect(() => {
    if (phase === 'work' || phase === 'break') {
      startPulseAnimation();
    }
  }, [phase]);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const updateProgress = (remaining: number) => {
    const totalTime = phase === 'work' ? workDuration * 60 : 
                     (currentCycle % 4 === 0 ? longBreakDuration : breakDuration) * 60;
    const progress = (totalTime - remaining) / totalTime;
    
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startSession = () => {
    if (!taskName.trim()) {
      Alert.alert('Task Required', 'Please enter a task name to focus on.');
      return;
    }
    
    setTimeRemaining(workDuration * 60);
    setPhase('work');
    setIsActive(true);
    setSessionStart(new Date());
    setCurrentCycle(1);
    progressAnimation.setValue(0);
  };

  const pauseResume = () => {
    setIsActive(!isActive);
  };

  const handlePhaseComplete = () => {
    if (phase === 'work') {
      // Record focus rating for this work session
      setFocusRatings(prev => [...prev, currentFocusRating]);
      
      if (currentCycle >= totalCycles) {
        setPhase('complete');
      } else {
        // Start break
        const isLongBreak = currentCycle % 4 === 0;
        setTimeRemaining((isLongBreak ? longBreakDuration : breakDuration) * 60);
        setPhase('break');
        setIsActive(true);
      }
    } else if (phase === 'break') {
      // Start next work cycle
      setCurrentCycle(prev => prev + 1);
      setTimeRemaining(workDuration * 60);
      setPhase('work');
      setIsActive(true);
    }
  };

  const addDistraction = (type: string) => {
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3 minutes
    setDistractions(prev => [...prev, { type, duration }]);
    Alert.alert('Distraction Noted', `${type} distraction recorded. Stay focused!`);
  };

  const addBreakActivity = (activity: string) => {
    setBreakActivities(prev => [...prev, activity]);
  };

  const completeSession = async () => {
    if (!userId || !sessionStart) return;

    const actualDuration = Math.round((Date.now() - sessionStart.getTime()) / 60000);
    const plannedDuration = workDuration * totalCycles;
    const completionRate = Math.min(actualDuration / plannedDuration, 1);
    
    const avgFocusRating = focusRatings.length > 0 ? 
      focusRatings.reduce((a, b) => a + b, 0) / focusRatings.length : currentFocusRating;
    
    const distractionPenalty = Math.min(distractions.length * 0.5, 3);
    const productivityScore = Math.max(1, avgFocusRating - distractionPenalty);

    const sessionData: PomodoroSession = {
      task_name: taskName,
      work_duration: workDuration,
      break_duration: breakDuration,
      focus_quality_ratings: focusRatings,
      distractions: distractions,
      break_activities: breakActivities,
      completion_status: completionRate >= 0.8 ? 'completed' : 'partial',
      productivity_score: productivityScore,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/pomodoro/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Session Complete!', `Productivity Score: ${productivityScore.toFixed(1)}/10`);
        resetSession();
      }
    } catch (error) {
      Alert.alert('Success!', `Session completed! Productivity Score: ${productivityScore.toFixed(1)}/10 (Demo mode)`);
      resetSession();
    }
  };

  const resetSession = () => {
    setPhase('setup');
    setIsActive(false);
    setTimeRemaining(workDuration * 60);
    setCurrentCycle(1);
    setFocusRatings([]);
    setDistractions([]);
    setBreakActivities([]);
    setCurrentFocusRating(8);
    setSessionStart(null);
    progressAnimation.setValue(0);
    setTaskName('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSetup = () => (
    <ScrollView style={styles.setupContainer}>
      <Text style={styles.setupTitle}>Focus Session Setup</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What will you focus on?</Text>
        <TextInput
          style={styles.taskInput}
          placeholder="e.g., Complete project report, Study chapter 5..."
          value={taskName}
          onChangeText={setTaskName}
          multiline
        />
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.sectionTitle}>Work Duration</Text>
        <View style={styles.durationButtons}>
          {[15, 25, 30, 45, 60].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                workDuration === duration && styles.durationButtonSelected
              ]}
              onPress={() => setWorkDuration(duration)}
            >
              <Text style={[
                styles.durationButtonText,
                workDuration === duration && styles.durationButtonTextSelected
              ]}>
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.durationContainer}>
        <Text style={styles.sectionTitle}>Break Duration</Text>
        <View style={styles.durationButtons}>
          {[5, 10, 15].map((duration) => (
            <TouchableOpacity
              key={duration}
              style={[
                styles.durationButton,
                breakDuration === duration && styles.durationButtonSelected
              ]}
              onPress={() => setBreakDuration(duration)}
            >
              <Text style={[
                styles.durationButtonText,
                breakDuration === duration && styles.durationButtonTextSelected
              ]}>
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.cycleContainer}>
        <Text style={styles.sectionTitle}>Number of Cycles</Text>
        <View style={styles.cycleButtons}>
          {[2, 4, 6, 8].map((cycles) => (
            <TouchableOpacity
              key={cycles}
              style={[
                styles.cycleButton,
                totalCycles === cycles && styles.cycleButtonSelected
              ]}
              onPress={() => setTotalCycles(cycles)}
            >
              <Text style={[
                styles.cycleButtonText,
                totalCycles === cycles && styles.cycleButtonTextSelected
              ]}>
                {cycles}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={startSession}>
        <Ionicons name="play" size={24} color="#FFFFFF" />
        <Text style={styles.startButtonText}>Start Focus Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderWork = () => (
    <View style={styles.sessionContainer}>
      <Text style={styles.sessionTitle}>Focus Time</Text>
      <Text style={styles.taskNameDisplay}>{taskName}</Text>
      
      <View style={styles.cycleIndicator}>
        <Text style={styles.cycleText}>Cycle {currentCycle} of {totalCycles}</Text>
      </View>

      <View style={styles.timerContainer}>
        <Animated.View style={[styles.progressRing, { transform: [{ scale: pulseAnimation }] }]}>
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
            <Text style={styles.phaseText}>FOCUS</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.focusRatingContainer}>
        <Text style={styles.focusRatingLabel}>How's your focus? (1-10)</Text>
        <View style={styles.ratingButtons}>
          {[6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                currentFocusRating === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setCurrentFocusRating(rating)}
            >
              <Text style={[
                styles.ratingButtonText,
                currentFocusRating === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.distractionContainer}>
        <Text style={styles.distractionTitle}>Got distracted?</Text>
        <View style={styles.distractionButtons}>
          {commonDistractions.map((distraction) => (
            <TouchableOpacity
              key={distraction}
              style={styles.distractionButton}
              onPress={() => addDistraction(distraction)}
            >
              <Text style={styles.distractionButtonText}>{distraction}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={pauseResume}>
          <Ionicons 
            name={isActive ? 'pause' : 'play'} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButton} onPress={() => setPhase('complete')}>
          <Ionicons name="stop" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBreak = () => (
    <View style={styles.sessionContainer}>
      <Text style={styles.sessionTitle}>
        {currentCycle % 4 === 0 ? 'Long Break' : 'Short Break'}
      </Text>
      
      <View style={styles.timerContainer}>
        <Animated.View style={[styles.progressRing, styles.breakRing, { transform: [{ scale: pulseAnimation }] }]}>
          <Animated.View 
            style={[
              styles.progressFill,
              styles.breakProgressFill,
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
            <Text style={styles.phaseText}>BREAK</Text>
          </View>
        </Animated.View>
      </View>

      <View style={styles.breakActivityContainer}>
        <Text style={styles.breakActivityTitle}>What are you doing?</Text>
        <View style={styles.breakActivityButtons}>
          {breakActivityOptions.map((activity) => (
            <TouchableOpacity
              key={activity}
              style={[
                styles.breakActivityButton,
                breakActivities.includes(activity) && styles.breakActivityButtonSelected
              ]}
              onPress={() => addBreakActivity(activity)}
            >
              <Text style={[
                styles.breakActivityButtonText,
                breakActivities.includes(activity) && styles.breakActivityButtonTextSelected
              ]}>
                {activity}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={pauseResume}>
          <Ionicons 
            name={isActive ? 'pause' : 'play'} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handlePhaseComplete}>
          <Ionicons name="play-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      <Text style={styles.completeTitle}>Session Complete!</Text>
      <Text style={styles.completeSubtitle}>{taskName}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{focusRatings.length + 1}</Text>
          <Text style={styles.statLabel}>Cycles</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {focusRatings.length > 0 ? 
              (focusRatings.reduce((a, b) => a + b, 0) / focusRatings.length).toFixed(1) : 
              currentFocusRating
            }
          </Text>
          <Text style={styles.statLabel}>Avg Focus</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{distractions.length}</Text>
          <Text style={styles.statLabel}>Distractions</Text>
        </View>
      </View>

      <View style={styles.completeButtons}>
        <TouchableOpacity style={styles.saveButton} onPress={completeSession}>
          <Text style={styles.saveButtonText}>Save Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newSessionButton} onPress={resetSession}>
          <Text style={styles.newSessionButtonText}>New Session</Text>
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
        <Text style={styles.headerTitle}>Focus Timer</Text>
        <View style={{ width: 24 }} />
      </View>

      {phase === 'setup' && renderSetup()}
      {phase === 'work' && renderWork()}
      {phase === 'break' && renderBreak()}
      {phase === 'complete' && renderComplete()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
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
    minHeight: 80,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  durationContainer: {
    marginBottom: 24,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 60,
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  durationButtonTextSelected: {
    color: '#FFFFFF',
  },
  cycleContainer: {
    marginBottom: 32,
  },
  cycleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cycleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 60,
    alignItems: 'center',
  },
  cycleButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  cycleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  cycleButtonTextSelected: {
    color: '#FFFFFF',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sessionContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  taskNameDisplay: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  cycleIndicator: {
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  progressRing: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 8,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  breakRing: {
    borderColor: '#DCFCE7',
  },
  progressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#F59E0B',
  },
  breakProgressFill: {
    borderTopColor: '#10B981',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 2,
    marginTop: 4,
  },
  focusRatingContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  focusRatingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  distractionContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  distractionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 12,
  },
  distractionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  distractionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  distractionButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  breakActivityContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  breakActivityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 12,
  },
  breakActivityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  breakActivityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  breakActivityButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  breakActivityButtonText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  breakActivityButtonTextSelected: {
    color: '#FFFFFF',
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
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
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
  completeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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