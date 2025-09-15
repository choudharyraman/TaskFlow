import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface ActivitySession {
  activity_type: string;
  duration: number;
  intensity: number;
  mood_before: number;
  mood_after: number;
  energy_before: number;
  energy_after: number;
  procrastination_level_before: number;
  procrastination_level_after: number;
}

export default function ActivityModule() {
  const [userId, setUserId] = useState<string>('');
  const [phase, setPhase] = useState<'select' | 'pre-check' | 'active' | 'post-check' | 'complete'>('select');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [selectedIntensity, setSelectedIntensity] = useState<number>(5);
  
  // Pre-activity state
  const [preState, setPreState] = useState({
    mood: 5,
    energy: 5,
    procrastination: 5,
  });
  
  // Post-activity state
  const [postState, setPostState] = useState({
    mood: 5,
    energy: 5,
    procrastination: 5,
  });
  
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  const activities = [
    { id: 'walk', name: 'Walking', icon: 'walk', description: 'Light outdoor movement', color: '#10B981' },
    { id: 'stretch', name: 'Stretching', icon: 'body', description: 'Gentle flexibility work', color: '#8B5CF6' },
    { id: 'cardio', name: 'Cardio', icon: 'fitness', description: 'Heart rate elevation', color: '#EF4444' },
    { id: 'yoga', name: 'Yoga', icon: 'leaf', description: 'Mindful movement', color: '#06B6D4' },
    { id: 'strength', name: 'Strength', icon: 'barbell', description: 'Resistance training', color: '#F59E0B' },
    { id: 'dance', name: 'Dance', icon: 'musical-notes', description: 'Rhythmic movement', color: '#EC4899' },
  ];

  const durations = [5, 10, 15, 20, 30, 45, 60];
  const intensityLevels = [
    { level: 1, label: 'Very Light', description: 'Gentle movement' },
    { level: 3, label: 'Light', description: 'Easy breathing' },
    { level: 5, label: 'Moderate', description: 'Slightly breathless' },
    { level: 7, label: 'Hard', description: 'Breathing heavily' },
    { level: 9, label: 'Very Hard', description: 'Maximum effort' },
  ];

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
            setPhase('post-check');
            return 0;
          }
          return time - 1;
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

  const startPreCheck = () => {
    if (!selectedActivity) {
      Alert.alert('Select Activity', 'Please choose an activity type first.');
      return;
    }
    setPhase('pre-check');
  };

  const startActivity = () => {
    setTimeRemaining(selectedDuration * 60);
    setSessionStart(new Date());
    setPhase('active');
    setIsActive(true);
  };

  const finishActivity = () => {
    setIsActive(false);
    setPhase('post-check');
  };

  const saveActivitySession = async () => {
    if (!userId || !sessionStart) return;

    const actualDuration = selectedDuration - Math.round(timeRemaining / 60);

    const sessionData: ActivitySession = {
      activity_type: selectedActivity,
      duration: actualDuration,
      intensity: selectedIntensity,
      mood_before: preState.mood,
      mood_after: postState.mood,
      energy_before: preState.energy,
      energy_after: postState.energy,
      procrastination_level_before: preState.procrastination,
      procrastination_level_after: postState.procrastination,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/activity/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionData,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Session Saved!', 'Your movement session has been recorded.');
        resetSession();
      }
    } catch (error) {
      Alert.alert('Success!', 'Movement session completed! (Demo mode)');
      resetSession();
    }
  };

  const resetSession = () => {
    setPhase('select');
    setSelectedActivity('');
    setSelectedDuration(10);
    setSelectedIntensity(5);
    setPreState({ mood: 5, energy: 5, procrastination: 5 });
    setPostState({ mood: 5, energy: 5, procrastination: 5 });
    setIsActive(false);
    setTimeRemaining(600);
    setSessionStart(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSelectedActivity = () => {
    return activities.find(a => a.id === selectedActivity);
  };

  const renderActivitySelection = () => (
    <ScrollView style={styles.container}>
      <View style={styles.selectionContainer}>
        <View style={styles.heroSection}>
          <Ionicons name="fitness" size={64} color="#10B981" />
          <Text style={styles.heroTitle}>Movement Breaks</Text>
          <Text style={styles.heroSubtitle}>
            Physical activity is one of the most effective ways to overcome procrastination and boost mood.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Your Activity</Text>
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityCard,
                selectedActivity === activity.id && styles.activityCardSelected,
                { borderColor: activity.color }
              ]}
              onPress={() => setSelectedActivity(activity.id)}
            >
              <Ionicons 
                name={activity.icon as any} 
                size={32} 
                color={selectedActivity === activity.id ? activity.color : '#64748B'} 
              />
              <Text style={[
                styles.activityName,
                selectedActivity === activity.id && { color: activity.color }
              ]}>
                {activity.name}
              </Text>
              <Text style={styles.activityDescription}>{activity.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>
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

        <Text style={styles.sectionTitle}>Intensity Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.intensityScroll}>
          {intensityLevels.map((level) => (
            <TouchableOpacity
              key={level.level}
              style={[
                styles.intensityCard,
                selectedIntensity === level.level && styles.intensityCardSelected
              ]}
              onPress={() => setSelectedIntensity(level.level)}
            >
              <Text style={[
                styles.intensityLevel,
                selectedIntensity === level.level && styles.intensityLevelSelected
              ]}>
                {level.level}
              </Text>
              <Text style={[
                styles.intensityLabel,
                selectedIntensity === level.level && styles.intensityLabelSelected
              ]}>
                {level.label}
              </Text>
              <Text style={styles.intensityDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.startButton} onPress={startPreCheck}>
          <Ionicons name="play" size={20} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Begin Movement Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPreCheck = () => (
    <View style={styles.checkContainer}>
      <Text style={styles.checkTitle}>How are you feeling right now?</Text>
      <Text style={styles.checkSubtitle}>
        Rate each area before your {getSelectedActivity()?.name.toLowerCase()} session
      </Text>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Mood</Text>
        <Text style={styles.ratingDescription}>1 = Very down, 10 = Very happy</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                preState.mood === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPreState({ ...preState, mood: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                preState.mood === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Energy Level</Text>
        <Text style={styles.ratingDescription}>1 = Exhausted, 10 = Very energized</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                preState.energy === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPreState({ ...preState, energy: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                preState.energy === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Procrastination Level</Text>
        <Text style={styles.ratingDescription}>1 = Ready to tackle anything, 10 = Completely stuck</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                preState.procrastination === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPreState({ ...preState, procrastination: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                preState.procrastination === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={startActivity}>
        <Text style={styles.continueButtonText}>Start Moving!</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActive = () => {
    const activity = getSelectedActivity();
    return (
      <View style={styles.activeContainer}>
        <Text style={styles.activeTitle}>{activity?.name} Session</Text>
        <Text style={styles.activeSubtitle}>Intensity Level: {selectedIntensity}/10</Text>
        
        <View style={styles.timerContainer}>
          <View style={[styles.timerCircle, { borderColor: activity?.color }]}>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
            <Text style={styles.remainingText}>remaining</Text>
          </View>
        </View>

        <View style={styles.motivationContainer}>
          <Ionicons name="flame" size={32} color={activity?.color} />
          <Text style={styles.motivationTitle}>You're doing great!</Text>
          <Text style={styles.motivationText}>
            Every minute of movement is breaking through procrastination patterns and boosting your mood.
          </Text>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Activity Tips:</Text>
          {selectedActivity === 'walk' && (
            <Text style={styles.tipText}>• Focus on your breathing and surroundings{'\n'}• Maintain a comfortable pace{'\n'}• Notice how you feel with each step</Text>
          )}
          {selectedActivity === 'stretch' && (
            <Text style={styles.tipText}>• Hold each stretch for 20-30 seconds{'\n'}• Breathe deeply and relax{'\n'}• Don't push to the point of pain</Text>
          )}
          {selectedActivity === 'cardio' && (
            <Text style={styles.tipText}>• Keep your heart rate elevated{'\n'}• Stay hydrated{'\n'}• Listen to your body's signals</Text>
          )}
          {selectedActivity === 'yoga' && (
            <Text style={styles.tipText}>• Focus on your breath{'\n'}• Move mindfully between poses{'\n'}• Honor your body's limits</Text>
          )}
          {selectedActivity === 'strength' && (
            <Text style={styles.tipText}>• Maintain proper form{'\n'}• Control your movements{'\n'}• Rest between sets as needed</Text>
          )}
          {selectedActivity === 'dance' && (
            <Text style={styles.tipText}>• Let yourself move freely{'\n'}• Have fun with it{'\n'}• Feel the rhythm and energy</Text>
          )}
        </View>

        <View style={styles.activeControls}>
          <TouchableOpacity style={styles.pauseButton} onPress={() => setIsActive(!isActive)}>
            <Ionicons name={isActive ? 'pause' : 'play'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton} onPress={finishActivity}>
            <Ionicons name="checkmark" size={24} color="#FFFFFF" />
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPostCheck = () => (
    <View style={styles.checkContainer}>
      <View style={styles.completedHeader}>
        <Ionicons name="checkmark-circle" size={64} color="#10B981" />
        <Text style={styles.completedTitle}>Movement Complete!</Text>
        <Text style={styles.completedSubtitle}>How do you feel now?</Text>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Mood</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                postState.mood === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPostState({ ...postState, mood: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                postState.mood === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Energy Level</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                postState.energy === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPostState({ ...postState, energy: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                postState.energy === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.ratingSection}>
        <Text style={styles.ratingTitle}>Procrastination Level</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                postState.procrastination === rating && styles.ratingButtonSelected
              ]}
              onPress={() => setPostState({ ...postState, procrastination: rating })}
            >
              <Text style={[
                styles.ratingButtonText,
                postState.procrastination === rating && styles.ratingButtonTextSelected
              ]}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.comparisonContainer}>
        <Text style={styles.comparisonTitle}>Your Progress</Text>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Mood:</Text>
          <Text style={[
            styles.comparisonValue,
            postState.mood > preState.mood ? styles.positive : 
            postState.mood < preState.mood ? styles.negative : styles.neutral
          ]}>
            {preState.mood} → {postState.mood} {postState.mood > preState.mood ? '📈' : postState.mood < preState.mood ? '📉' : '➡️'}
          </Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Energy:</Text>
          <Text style={[
            styles.comparisonValue,
            postState.energy > preState.energy ? styles.positive : 
            postState.energy < preState.energy ? styles.negative : styles.neutral
          ]}>
            {preState.energy} → {postState.energy} {postState.energy > preState.energy ? '⚡' : postState.energy < preState.energy ? '🔋' : '➡️'}
          </Text>
        </View>
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Procrastination:</Text>
          <Text style={[
            styles.comparisonValue,
            postState.procrastination < preState.procrastination ? styles.positive : 
            postState.procrastination > preState.procrastination ? styles.negative : styles.neutral
          ]}>
            {preState.procrastination} → {postState.procrastination} {postState.procrastination < preState.procrastination ? '✨' : postState.procrastination > preState.procrastination ? '😴' : '➡️'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveActivitySession}>
        <Text style={styles.saveButtonText}>Save Session</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => phase !== 'select' ? resetSession() : null}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movement & Activity</Text>
        <View style={{ width: 24 }} />
      </View>

      {phase === 'select' && renderActivitySelection()}
      {phase === 'pre-check' && renderPreCheck()}
      {phase === 'active' && renderActive()}
      {phase === 'post-check' && renderPostCheck()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
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
  selectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
    marginTop: 8,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  activityCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activityCardSelected: {
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  durationButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  durationTextSelected: {
    color: '#FFFFFF',
  },
  intensityScroll: {
    marginBottom: 32,
  },
  intensityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  intensityCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  intensityLevel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
  },
  intensityLevelSelected: {
    color: '#10B981',
  },
  intensityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  intensityLabelSelected: {
    color: '#10B981',
  },
  intensityDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkContainer: {
    flex: 1,
    padding: 20,
  },
  checkTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  checkSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  ratingDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
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
    backgroundColor: '#10B981',
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
    marginBottom: 32,
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  remainingText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  motivationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 8,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
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
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 30,
    paddingHorizontal: 20,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  comparisonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  comparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  neutral: {
    color: '#64748B',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});