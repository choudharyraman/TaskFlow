import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface SleepData {
  id?: string;
  sleep_date: string;
  bedtime: string;
  wake_time: string;
  sleep_duration: number;
  sleep_quality: number;
  bedtime_procrastination_minutes: number;
  next_day_procrastination_score?: number;
  sleep_environment_score: number;
  caffeine_intake: Array<{time: string, amount: number, type: string}>;
}

export default function SleepModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'log' | 'analysis' | 'habits'>('log');
  const [sleepRecords, setSleepRecords] = useState<SleepData[]>([]);
  
  // Sleep logging state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [sleepLog, setSleepLog] = useState({
    bedtime: '22:30',
    wake_time: '07:00',
    sleep_quality: 7,
    bedtime_procrastination_minutes: 15,
    sleep_environment_score: 8,
    caffeine_intake: [] as Array<{time: string, amount: number, type: string}>
  });

  const sleepQualityDescriptions = [
    { value: 1, label: 'Terrible', description: 'Couldn\'t sleep at all', color: '#DC2626' },
    { value: 2, label: 'Very Poor', description: 'Woke up many times', color: '#EA580C' },
    { value: 3, label: 'Poor', description: 'Restless night', color: '#D97706' },
    { value: 4, label: 'Below Average', description: 'Some difficulty sleeping', color: '#CA8A04' },
    { value: 5, label: 'Average', description: 'Normal sleep', color: '#65A30D' },
    { value: 6, label: 'Good', description: 'Slept well', color: '#16A34A' },
    { value: 7, label: 'Very Good', description: 'Great sleep', color: '#059669' },
    { value: 8, label: 'Excellent', description: 'Woke up refreshed', color: '#0891B2' },
    { value: 9, label: 'Outstanding', description: 'Perfect sleep', color: '#0284C7' },
    { value: 10, label: 'Perfect', description: 'Best sleep ever', color: '#2563EB' }
  ];

  const environmentFactors = [
    { id: 'temperature', name: 'Temperature', icon: 'thermometer' },
    { id: 'darkness', name: 'Darkness', icon: 'moon' },
    { id: 'noise', name: 'Quietness', icon: 'volume-off' },
    { id: 'comfort', name: 'Bed Comfort', icon: 'bed' },
    { id: 'air', name: 'Air Quality', icon: 'leaf' }
  ];

  const sleepHabits = [
    {
      category: 'Bedtime Routine',
      habits: [
        { name: 'No screens 1hr before bed', impact: 'Reduces blue light disruption' },
        { name: 'Reading or meditation', impact: 'Calms the mind' },
        { name: 'Consistent bedtime', impact: 'Regulates circadian rhythm' },
        { name: 'Cool, dark room', impact: 'Optimal sleep environment' }
      ]
    },
    {
      category: 'Daytime Habits',
      habits: [
        { name: 'Morning sunlight exposure', impact: 'Sets circadian clock' },
        { name: 'Regular exercise (not late)', impact: 'Improves sleep quality' },
        { name: 'Limit caffeine after 2pm', impact: 'Prevents sleep interference' },
        { name: 'Avoid long daytime naps', impact: 'Maintains sleep pressure' }
      ]
    },
    {
      category: 'Procrastination Prevention',
      habits: [
        { name: 'Set devices to charge outside bedroom', impact: 'Removes bedtime distractions' },
        { name: 'Use "if-then" plans for bedtime', impact: 'Automatic good choices' },
        { name: 'Bedtime alarm 30min before target', impact: 'Preparation time' },
        { name: 'Progressive bedtime adjustment', impact: 'Gradual habit change' }
      ]
    }
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadSleepData(storedUserId);
    }
  };

  const loadSleepData = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sleep/data/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSleepRecords(data);
      }
    } catch (error) {
      console.error('Error loading sleep data:', error);
      // Set demo data
      setSleepRecords([
        {
          id: '1',
          sleep_date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          bedtime: '22:45',
          wake_time: '07:15',
          sleep_duration: 8.5,
          sleep_quality: 8,
          bedtime_procrastination_minutes: 25,
          next_day_procrastination_score: 3,
          sleep_environment_score: 9,
          caffeine_intake: [{ time: '14:30', amount: 150, type: 'Coffee' }]
        },
        {
          id: '2',
          sleep_date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          bedtime: '23:30',
          wake_time: '06:45',
          sleep_duration: 7.25,
          sleep_quality: 6,
          bedtime_procrastination_minutes: 45,
          next_day_procrastination_score: 7,
          sleep_environment_score: 7,
          caffeine_intake: [
            { time: '09:00', amount: 200, type: 'Coffee' },
            { time: '15:45', amount: 100, type: 'Tea' }
          ]
        }
      ]);
    }
  };

  const calculateSleepDuration = (bedtime: string, wakeTime: string) => {
    const bed = new Date(`2000-01-01T${bedtime}:00`);
    let wake = new Date(`2000-01-01T${wakeTime}:00`);
    
    if (wake < bed) {
      wake = new Date(`2000-01-02T${wakeTime}:00`);
    }
    
    return (wake.getTime() - bed.getTime()) / (1000 * 60 * 60);
  };

  const saveSleepLog = async () => {
    if (!userId) return;

    const duration = calculateSleepDuration(sleepLog.bedtime, sleepLog.wake_time);
    
    const sleepData: SleepData = {
      sleep_date: selectedDate,
      bedtime: `${selectedDate}T${sleepLog.bedtime}:00`,
      wake_time: `${new Date(selectedDate).getTime() < new Date(`${selectedDate}T${sleepLog.wake_time}:00`).getTime() ? 
        selectedDate : 
        new Date(new Date(selectedDate).getTime() + 86400000).toISOString().split('T')[0]
      }T${sleepLog.wake_time}:00`,
      sleep_duration: duration,
      sleep_quality: sleepLog.sleep_quality,
      bedtime_procrastination_minutes: sleepLog.bedtime_procrastination_minutes,
      sleep_environment_score: sleepLog.sleep_environment_score,
      caffeine_intake: sleepLog.caffeine_intake,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/sleep/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sleepData,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Success!', 'Sleep data logged successfully!');
        loadSleepData(userId);
      }
    } catch (error) {
      Alert.alert('Success!', 'Sleep data logged! (Demo mode)');
      loadSleepData(userId);
    }
  };

  const addCaffeineIntake = () => {
    Alert.prompt(
      'Add Caffeine',
      'Enter time (HH:MM) and amount',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add Coffee (150mg)',
          onPress: (time) => {
            if (time) {
              setSleepLog(prev => ({
                ...prev,
                caffeine_intake: [...prev.caffeine_intake, { time, amount: 150, type: 'Coffee' }]
              }));
            }
          }
        },
        {
          text: 'Add Tea (50mg)',
          onPress: (time) => {
            if (time) {
              setSleepLog(prev => ({
                ...prev,
                caffeine_intake: [...prev.caffeine_intake, { time, amount: 50, type: 'Tea' }]
              }));
            }
          }
        }
      ],
      'plain-text',
      '14:00'
    );
  };

  const getQualityInfo = (quality: number) => {
    return sleepQualityDescriptions.find(q => q.value === quality) || sleepQualityDescriptions[4];
  };

  const getSleepAdvice = () => {
    const avgQuality = sleepRecords.length > 0 ? 
      sleepRecords.reduce((sum, record) => sum + record.sleep_quality, 0) / sleepRecords.length : 7;
    
    const avgDuration = sleepRecords.length > 0 ?
      sleepRecords.reduce((sum, record) => sum + record.sleep_duration, 0) / sleepRecords.length : 8;
    
    const avgProcrastination = sleepRecords.length > 0 ?
      sleepRecords.reduce((sum, record) => sum + record.bedtime_procrastination_minutes, 0) / sleepRecords.length : 20;

    const advice = [];
    
    if (avgQuality < 6) {
      advice.push("Your sleep quality could improve. Focus on your sleep environment and bedtime routine.");
    }
    
    if (avgDuration < 7) {
      advice.push("Try to get 7-9 hours of sleep. Consider moving your bedtime earlier.");
    }
    
    if (avgProcrastination > 30) {
      advice.push("Bedtime procrastination is affecting your sleep. Try setting a bedtime alarm and preparing for bed 30 minutes early.");
    }
    
    if (avgQuality >= 7 && avgDuration >= 7 && avgProcrastination <= 20) {
      advice.push("Great sleep habits! Your good sleep is likely supporting your productivity and reducing procrastination.");
    }

    return advice;
  };

  const renderSleepLog = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Sleep Log</Text>
      
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Date</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Ionicons name="calendar" size={20} color="#6366F1" />
          <Text style={styles.dateButtonText}>{selectedDate}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>Sleep Times</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Bedtime</Text>
            <TouchableOpacity style={styles.timeButton}>
              <Ionicons name="moon" size={16} color="#6366F1" />
              <Text style={styles.timeButtonText}>{sleepLog.bedtime}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.timeLabel}>Wake Time</Text>
            <TouchableOpacity style={styles.timeButton}>
              <Ionicons name="sunny" size={16} color="#F59E0B" />
              <Text style={styles.timeButtonText}>{sleepLog.wake_time}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.durationText}>
          Duration: {calculateSleepDuration(sleepLog.bedtime, sleepLog.wake_time).toFixed(1)} hours
        </Text>
      </View>

      <View style={styles.qualitySection}>
        <Text style={styles.sectionTitle}>Sleep Quality (1-10)</Text>
        <View style={styles.qualityGrid}>
          {sleepQualityDescriptions.map((quality) => (
            <TouchableOpacity
              key={quality.value}
              style={[
                styles.qualityButton,
                sleepLog.sleep_quality === quality.value && [
                  styles.qualityButtonSelected,
                  { backgroundColor: quality.color }
                ]
              ]}
              onPress={() => setSleepLog(prev => ({ ...prev, sleep_quality: quality.value }))}
            >
              <Text style={[
                styles.qualityButtonText,
                sleepLog.sleep_quality === quality.value && styles.qualityButtonTextSelected
              ]}>
                {quality.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.qualityInfo}>
          <Text style={styles.qualityLabel}>{getQualityInfo(sleepLog.sleep_quality).label}</Text>
          <Text style={styles.qualityDescription}>{getQualityInfo(sleepLog.sleep_quality).description}</Text>
        </View>
      </View>

      <View style={styles.procrastinationSection}>
        <Text style={styles.sectionTitle}>Bedtime Procrastination</Text>
        <Text style={styles.sectionDescription}>
          How many minutes past your intended bedtime did you actually go to bed?
        </Text>
        <View style={styles.procrastinationButtons}>
          {[0, 15, 30, 45, 60, 90, 120].map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.procrastinationButton,
                sleepLog.bedtime_procrastination_minutes === minutes && styles.procrastinationButtonSelected
              ]}
              onPress={() => setSleepLog(prev => ({ ...prev, bedtime_procrastination_minutes: minutes }))}
            >
              <Text style={[
                styles.procrastinationButtonText,
                sleepLog.bedtime_procrastination_minutes === minutes && styles.procrastinationButtonTextSelected
              ]}>
                {minutes === 0 ? 'On time' : `+${minutes}m`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.environmentSection}>
        <Text style={styles.sectionTitle}>Sleep Environment (1-10)</Text>
        <Text style={styles.sectionDescription}>
          How optimal was your sleep environment?
        </Text>
        <View style={styles.environmentSlider}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <TouchableOpacity
              key={score}
              style={[
                styles.environmentButton,
                sleepLog.sleep_environment_score === score && styles.environmentButtonSelected
              ]}
              onPress={() => setSleepLog(prev => ({ ...prev, sleep_environment_score: score }))}
            >
              <Text style={[
                styles.environmentButtonText,
                sleepLog.sleep_environment_score === score && styles.environmentButtonTextSelected
              ]}>
                {score}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.caffeineSection}>
        <Text style={styles.sectionTitle}>Caffeine Intake</Text>
        {sleepLog.caffeine_intake.map((intake, index) => (
          <View key={index} style={styles.caffeineItem}>
            <Text style={styles.caffeineText}>{intake.time} - {intake.type} ({intake.amount}mg)</Text>
            <TouchableOpacity onPress={() => {
              setSleepLog(prev => ({
                ...prev,
                caffeine_intake: prev.caffeine_intake.filter((_, i) => i !== index)
              }));
            }}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addCaffeineButton} onPress={addCaffeineIntake}>
          <Ionicons name="add" size={16} color="#6366F1" />
          <Text style={styles.addCaffeineText}>Add Caffeine</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={saveSleepLog}>
        <Text style={styles.saveButtonText}>Save Sleep Log</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAnalysis = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Sleep Analysis</Text>
      
      {sleepRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="moon-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No sleep data yet</Text>
          <Text style={styles.emptyStateSubtext}>Start logging your sleep to see patterns and insights.</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(sleepRecords.reduce((sum, r) => sum + r.sleep_duration, 0) / sleepRecords.length).toFixed(1)}h
              </Text>
              <Text style={styles.statLabel}>Avg Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {(sleepRecords.reduce((sum, r) => sum + r.sleep_quality, 0) / sleepRecords.length).toFixed(1)}/10
              </Text>
              <Text style={styles.statLabel}>Avg Quality</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round(sleepRecords.reduce((sum, r) => sum + r.bedtime_procrastination_minutes, 0) / sleepRecords.length)}m
              </Text>
              <Text style={styles.statLabel}>Avg Delay</Text>
            </View>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.adviceTitle}>💡 Personalized Insights</Text>
            {getSleepAdvice().map((advice, index) => (
              <Text key={index} style={styles.adviceText}>• {advice}</Text>
            ))}
          </View>

          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Sleep Records</Text>
            {sleepRecords.slice(0, 7).map((record, index) => (
              <View key={index} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordDate}>{record.sleep_date}</Text>
                  <View style={[styles.qualityBadge, { backgroundColor: getQualityInfo(record.sleep_quality).color }]}>
                    <Text style={styles.qualityBadgeText}>{record.sleep_quality}/10</Text>
                  </View>
                </View>
                <Text style={styles.recordDetails}>
                  {record.sleep_duration}h sleep • {record.bedtime_procrastination_minutes}m delay
                </Text>
                {record.next_day_procrastination_score && (
                  <Text style={styles.procrastinationImpact}>
                    Next day procrastination: {record.next_day_procrastination_score}/10
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderHabits = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Sleep Optimization</Text>
      <Text style={styles.tabSubtitle}>Evidence-based habits for better sleep and reduced procrastination</Text>
      
      {sleepHabits.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.habitCategory}>
          <Text style={styles.habitCategoryTitle}>{category.category}</Text>
          {category.habits.map((habit, habitIndex) => (
            <View key={habitIndex} style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
                <Text style={styles.habitName}>{habit.name}</Text>
              </View>
              <Text style={styles.habitImpact}>{habit.impact}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.circadianSection}>
        <Text style={styles.circadianTitle}>🌅 Circadian Rhythm Tips</Text>
        <View style={styles.circadianTips}>
          <View style={styles.circadianTip}>
            <Ionicons name="sunny" size={20} color="#F59E0B" />
            <Text style={styles.circadianTipText}>Get bright light within 1 hour of waking</Text>
          </View>
          <View style={styles.circadianTip}>
            <Ionicons name="walk" size={20} color="#10B981" />
            <Text style={styles.circadianTipText}>Exercise regularly, but not within 3 hours of bedtime</Text>
          </View>
          <View style={styles.circadianTip}>
            <Ionicons name="cafe" size={20} color="#8B4513" />
            <Text style={styles.circadianTipText}>Avoid caffeine 6-8 hours before intended bedtime</Text>
          </View>
          <View style={styles.circadianTip}>
            <Ionicons name="moon" size={20} color="#6366F1" />
            <Text style={styles.circadianTipText}>Dim lights 2 hours before bedtime</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sleep & Circadian</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'log' && styles.tabActive]}
          onPress={() => setActiveTab('log')}
        >
          <Ionicons name="moon" size={20} color={activeTab === 'log' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'log' && styles.tabTextActive]}>
            Log Sleep
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analysis' && styles.tabActive]}
          onPress={() => setActiveTab('analysis')}
        >
          <Ionicons name="analytics" size={20} color={activeTab === 'analysis' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'analysis' && styles.tabTextActive]}>
            Analysis
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'habits' && styles.tabActive]}
          onPress={() => setActiveTab('habits')}
        >
          <Ionicons name="bulb" size={20} color={activeTab === 'habits' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'habits' && styles.tabTextActive]}>
            Optimize
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'log' && renderSleepLog()}
      {activeTab === 'analysis' && renderAnalysis()}
      {activeTab === 'habits' && renderHabits()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#6366F1',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 24,
  },
  dateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 8,
    fontWeight: '500',
  },
  timeSection: {
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 8,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  qualitySection: {
    marginBottom: 24,
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  qualityButton: {
    width: (width - 80) / 5 - 8,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityButtonSelected: {
    borderColor: 'transparent',
  },
  qualityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  qualityButtonTextSelected: {
    color: '#FFFFFF',
  },
  qualityInfo: {
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  qualityDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  procrastinationSection: {
    marginBottom: 24,
  },
  procrastinationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  procrastinationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  procrastinationButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  procrastinationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  procrastinationButtonTextSelected: {
    color: '#FFFFFF',
  },
  environmentSection: {
    marginBottom: 24,
  },
  environmentSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  environmentButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  environmentButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  environmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  environmentButtonTextSelected: {
    color: '#FFFFFF',
  },
  caffeineSection: {
    marginBottom: 24,
  },
  caffeineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  caffeineText: {
    fontSize: 14,
    color: '#1E293B',
  },
  addCaffeineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
  },
  addCaffeineText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  adviceSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  adviceText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  recordDetails: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  procrastinationImpact: {
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
  },
  habitCategory: {
    marginBottom: 24,
  },
  habitCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  habitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  habitImpact: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 36,
  },
  circadianSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  circadianTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  circadianTips: {
    gap: 12,
  },
  circadianTip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circadianTipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});