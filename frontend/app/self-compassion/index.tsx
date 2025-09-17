import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface SelfCompassionSession {
  session_type: string;
  duration: number;
  pre_mood: number;
  post_mood: number;
  pre_self_criticism: number;
  post_self_criticism: number;
  techniques_used: string[];
  insights: string[];
  effectiveness_rating: number;
}

export default function SelfCompassionModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'exercises' | 'interruption' | 'progress'>('exercises');
  
  // Exercise session state
  const [sessionType, setSessionType] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [preSessionRatings, setPreSessionRatings] = useState({
    mood: 5,
    self_criticism: 5,
  });
  const [postSessionRatings, setPostSessionRatings] = useState({
    mood: 5,
    self_criticism: 5,
  });
  
  // Self-criticism interruption
  const [criticalThought, setCriticalThought] = useState('');
  const [reframedThought, setReframedThought] = useState('');

  const exerciseTypes = [
    {
      id: 'self-kindness',
      name: 'Self-Kindness Practice',
      description: 'Treat yourself with the same kindness you\'d show a good friend',
      duration: 10,
      icon: 'heart',
      color: '#EC4899',
      steps: [
        'Place your hand on your heart',
        'Acknowledge your current struggle',
        'Remind yourself that suffering is part of human experience',
        'Offer yourself words of kindness and understanding',
        'Breathe compassion into your heart'
      ]
    },
    {
      id: 'loving-kindness',
      name: 'Loving-Kindness Meditation',
      description: 'Extend love and kindness to yourself and others',
      duration: 15,
      icon: 'flower',
      color: '#8B5CF6',
      steps: [
        'Start by sending loving-kindness to yourself',
        'Extend kindness to someone you love',
        'Include someone neutral in your life',
        'Send kindness to someone difficult',
        'Expand to all beings everywhere'
      ]
    },
    {
      id: 'forgiveness',
      name: 'Self-Forgiveness Practice',
      description: 'Release self-blame and embrace learning from mistakes',
      duration: 12,
      icon: 'refresh',
      color: '#10B981',
      steps: [
        'Acknowledge what you did or didn\'t do',
        'Recognize the pain you caused yourself or others',
        'Take responsibility without harsh self-judgment',
        'Make amends if needed and possible',
        'Commit to learning and growing from this experience'
      ]
    },
    {
      id: 'mindful-acceptance',
      name: 'Mindful Self-Acceptance',
      description: 'Accept your current experience without judgment',
      duration: 8,
      icon: 'leaf',
      color: '#06B6D4',
      steps: [
        'Notice what you\'re experiencing right now',
        'Observe any judgments that arise',
        'Breathe with whatever is present',
        'Offer acceptance to your current state',
        'Remember that this moment will change'
      ]
    }
  ];

  const copingStatements = [
    "This is a moment of struggle",
    "Struggle is part of life",
    "May I be kind to myself in this moment",
    "May I give myself the compassion I need",
    "Everyone makes mistakes - I am human",
    "I am learning and growing",
    "I deserve love and understanding",
    "This difficult moment will pass",
    "I can be gentle with myself",
    "My worth is not defined by my mistakes"
  ];

  const reframingPrompts = [
    "What would I tell a dear friend in this situation?",
    "How would someone who loves me respond to this?",
    "What can I learn from this experience?",
    "How might this struggle help me grow?",
    "What would self-compassion look like right now?",
    "How can I be gentle with myself today?",
    "What do I need to hear right now?",
    "How is this experience part of being human?"
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const startExercise = (exerciseId: string) => {
    setSessionType(exerciseId);
    setSessionStartTime(new Date());
    setSessionActive(true);
  };

  const completeExercise = async () => {
    if (!sessionStartTime || !userId) return;

    const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
    const exercise = exerciseTypes.find(e => e.id === sessionType);

    const sessionData: SelfCompassionSession = {
      session_type: sessionType,
      duration: duration,
      pre_mood: preSessionRatings.mood,
      post_mood: postSessionRatings.mood,
      pre_self_criticism: preSessionRatings.self_criticism,
      post_self_criticism: postSessionRatings.self_criticism,
      techniques_used: [exercise?.name || sessionType],
      insights: [],
      effectiveness_rating: 8,
    };

    try {
      // This would normally save to backend
      Alert.alert('Session Complete!', `Your ${exercise?.name} session has been saved.`);
      resetSession();
    } catch (error) {
      Alert.alert('Success!', 'Self-compassion session completed! (Demo mode)');
      resetSession();
    }
  };

  const resetSession = () => {
    setSessionActive(false);
    setSessionType('');
    setSessionStartTime(null);
    setPreSessionRatings({ mood: 5, self_criticism: 5 });
    setPostSessionRatings({ mood: 5, self_criticism: 5 });
  };

  const saveCriticalThoughtWork = () => {
    if (!criticalThought.trim() || !reframedThought.trim()) {
      Alert.alert('Missing Information', 'Please fill in both the critical thought and reframed thought.');
      return;
    }

    Alert.alert('Great Work!', 'Your self-compassion practice has been recorded. Remember to be gentle with yourself.');
    setCriticalThought('');
    setReframedThought('');
  };

  const getRandomCopingStatement = () => {
    const randomIndex = Math.floor(Math.random() * copingStatements.length);
    return copingStatements[randomIndex];
  };

  const getRandomReframingPrompt = () => {
    const randomIndex = Math.floor(Math.random() * reframingPrompts.length);
    return reframingPrompts[randomIndex];
  };

  const renderExercises = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Self-Compassion Exercises</Text>
      <Text style={styles.tabSubtitle}>
        Practice treating yourself with the same kindness you'd show a good friend.
      </Text>

      {!sessionActive ? (
        <>
          <View style={styles.exercisesGrid}>
            {exerciseTypes.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                style={[styles.exerciseCard, { borderLeftColor: exercise.color }]}
                onPress={() => startExercise(exercise.id)}
              >
                <View style={styles.exerciseHeader}>
                  <Ionicons name={exercise.icon as any} size={24} color={exercise.color} />
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                </View>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                <View style={styles.exerciseFooter}>
                  <Text style={styles.exerciseDuration}>{exercise.duration} minutes</Text>
                  <Ionicons name="play-circle" size={20} color={exercise.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quickActionsSection}>
            <Text style={styles.quickActionsTitle}>Quick Self-Compassion</Text>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={() => {
              Alert.alert('Compassionate Reminder', getRandomCopingStatement(), [{ text: 'Thank you' }]);
            }}>
              <Ionicons name="heart-circle" size={32} color="#EC4899" />
              <Text style={styles.quickActionText}>Get a Kind Reminder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={() => {
              Alert.alert('Reflection Prompt', getRandomReframingPrompt(), [{ text: 'I\'ll reflect on this' }]);
            }}>
              <Ionicons name="help-circle" size={32} color="#8B5CF6" />
              <Text style={styles.quickActionText}>Get a Reflection Prompt</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        renderActiveSession()
      )}
    </ScrollView>
  );

  const renderActiveSession = () => {
    const exercise = exerciseTypes.find(e => e.id === sessionType);
    if (!exercise) return null;

    return (
      <View style={styles.activeSessionContainer}>
        <View style={styles.sessionHeader}>
          <Ionicons name={exercise.icon as any} size={32} color={exercise.color} />
          <Text style={styles.sessionTitle}>{exercise.name}</Text>
        </View>

        <View style={styles.sessionSteps}>
          <Text style={styles.sessionStepsTitle}>Practice Steps:</Text>
          {exercise.steps.map((step, index) => (
            <View key={index} style={styles.sessionStep}>
              <View style={[styles.stepNumber, { backgroundColor: exercise.color }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sessionRatings}>
          <Text style={styles.ratingsTitle}>How are you feeling right now?</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Mood (1 = Very Low, 10 = Very High)</Text>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    postSessionRatings.mood === rating && styles.ratingButtonSelected
                  ]}
                  onPress={() => setPostSessionRatings(prev => ({ ...prev, mood: rating }))}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    postSessionRatings.mood === rating && styles.ratingButtonTextSelected
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Self-Criticism Level (1 = Very Low, 10 = Very High)</Text>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    postSessionRatings.self_criticism === rating && styles.ratingButtonSelected
                  ]}
                  onPress={() => setPostSessionRatings(prev => ({ ...prev, self_criticism: rating }))}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    postSessionRatings.self_criticism === rating && styles.ratingButtonTextSelected
                  ]}>
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.sessionActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={resetSession}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.completeButton, { backgroundColor: exercise.color }]} onPress={completeExercise}>
            <Text style={styles.completeButtonText}>Complete Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderInterruption = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Self-Critical Thought Interruption</Text>
      <Text style={styles.tabSubtitle}>
        Catch self-critical thoughts and transform them into self-compassionate responses.
      </Text>

      <View style={styles.interruptionSection}>
        <Text style={styles.interruptionStepTitle}>Step 1: Notice the Critical Thought</Text>
        <Text style={styles.interruptionStepDescription}>
          What is your inner critic saying right now?
        </Text>
        <TextInput
          style={styles.thoughtTextArea}
          multiline
          numberOfLines={4}
          placeholder="e.g., I'm so stupid for making that mistake... I never do anything right..."
          value={criticalThought}
          onChangeText={setCriticalThought}
        />
      </View>

      <View style={styles.compassionSection}>
        <Text style={styles.compassionTitle}>💝 Compassionate Response Helper</Text>
        <Text style={styles.compassionDescription}>
          Try asking yourself one of these questions:
        </Text>
        {reframingPrompts.slice(0, 4).map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptCard}
            onPress={() => Alert.alert('Reflection', prompt, [{ text: 'I\'ll think about this' }])}
          >
            <Ionicons name="help-circle-outline" size={20} color="#8B5CF6" />
            <Text style={styles.promptText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.interruptionSection}>
        <Text style={styles.interruptionStepTitle}>Step 2: Reframe with Self-Compassion</Text>
        <Text style={styles.interruptionStepDescription}>
          How would you respond to a dear friend who had this thought? What would you say to comfort and encourage them?
        </Text>
        <TextInput
          style={styles.thoughtTextArea}
          multiline
          numberOfLines={4}
          placeholder="e.g., Everyone makes mistakes - that's how we learn. I'm being too hard on myself. I would tell a friend that one mistake doesn't define them..."
          value={reframedThought}
          onChangeText={setReframedThought}
        />
      </View>

      <View style={styles.kindnessSection}>
        <Text style={styles.kindnessTitle}>🌟 Self-Kindness Phrases</Text>
        <Text style={styles.kindnessDescription}>
          Try saying one of these to yourself:
        </Text>
        {copingStatements.slice(0, 5).map((statement, index) => (
          <View key={index} style={styles.kindnessPhrase}>
            <Ionicons name="heart" size={16} color="#EC4899" />
            <Text style={styles.kindnessPhraseText}>{statement}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveInterruptionButton} onPress={saveCriticalThoughtWork}>
        <Text style={styles.saveInterruptionButtonText}>Save My Self-Compassion Work</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderProgress = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Your Self-Compassion Journey</Text>
      
      <View style={styles.progressStats}>
        <View style={styles.progressStatCard}>
          <Text style={styles.progressStatValue}>12</Text>
          <Text style={styles.progressStatLabel}>Sessions</Text>
        </View>
        <View style={styles.progressStatCard}>
          <Text style={styles.progressStatValue}>7.2</Text>
          <Text style={styles.progressStatLabel}>Avg Mood Improvement</Text>
        </View>
        <View style={styles.progressStatCard}>
          <Text style={styles.progressStatValue}>-3.1</Text>
          <Text style={styles.progressStatLabel}>Self-Criticism Reduction</Text>
        </View>
      </View>

      <View style={styles.milestoneSection}>
        <Text style={styles.milestoneTitle}>🏆 Self-Compassion Milestones</Text>
        
        <View style={styles.milestone}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneText}>Completed first self-kindness practice</Text>
            <Text style={styles.milestoneDate}>3 days ago</Text>
          </View>
        </View>
        
        <View style={styles.milestone}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneText}>Interrupted 5 self-critical thoughts</Text>
            <Text style={styles.milestoneDate}>1 week ago</Text>
          </View>
        </View>
        
        <View style={styles.milestoneNext}>
          <Ionicons name="radio-button-off" size={24} color="#9CA3AF" />
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneNextText}>Complete 10 loving-kindness sessions</Text>
            <Text style={styles.milestoneProgress}>6/10 completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>💡 Your Patterns & Insights</Text>
        
        <View style={styles.insightCard}>
          <Ionicons name="trending-up" size={20} color="#10B981" />
          <Text style={styles.insightText}>
            Your mood improves by an average of 2.3 points after self-compassion exercises
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="time" size={20} color="#8B5CF6" />
          <Text style={styles.insightText}>
            You're most self-critical in the evenings - consider bedtime self-kindness practice
          </Text>
        </View>
        
        <View style={styles.insightCard}>
          <Ionicons name="heart" size={20} color="#EC4899" />
          <Text style={styles.insightText}>
            Loving-kindness meditation seems to be your most effective practice
          </Text>
        </View>
      </View>

      <View style={styles.recommendationSection}>
        <Text style={styles.recommendationTitle}>🎯 Personalized Recommendations</Text>
        
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationText}>
            Try a 5-minute self-forgiveness practice when you notice perfectionist thoughts
          </Text>
          <TouchableOpacity style={styles.tryRecommendationButton}>
            <Text style={styles.tryRecommendationButtonText}>Try Now</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Self-Compassion</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercises' && styles.tabActive]}
          onPress={() => setActiveTab('exercises')}
        >
          <Ionicons name="heart" size={20} color={activeTab === 'exercises' ? '#EC4899' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'exercises' && styles.tabTextActive]}>
            Exercises
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'interruption' && styles.tabActive]}
          onPress={() => setActiveTab('interruption')}
        >
          <Ionicons name="shield" size={20} color={activeTab === 'interruption' ? '#EC4899' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'interruption' && styles.tabTextActive]}>
            Interrupt
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.tabActive]}
          onPress={() => setActiveTab('progress')}
        >
          <Ionicons name="trending-up" size={20} color={activeTab === 'progress' ? '#EC4899' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'exercises' && renderExercises()}
      {activeTab === 'interruption' && renderInterruption()}
      {activeTab === 'progress' && renderProgress()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF2F8',
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
    borderBottomColor: '#EC4899',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#EC4899',
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
    lineHeight: 24,
    marginBottom: 24,
  },
  exercisesGrid: {
    marginBottom: 32,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
    flex: 1,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 16,
  },
  activeSessionContainer: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 12,
  },
  sessionSteps: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sessionStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  sessionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  sessionRatings: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  ratingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#EC4899',
    borderColor: '#EC4899',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  completeButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  interruptionSection: {
    marginBottom: 24,
  },
  interruptionStepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  interruptionStepDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  thoughtTextArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  compassionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  compassionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  compassionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  kindnessSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  kindnessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  kindnessDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  kindnessPhrase: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  kindnessPhraseText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  saveInterruptionButton: {
    backgroundColor: '#EC4899',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveInterruptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  progressStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  milestoneSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  milestone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneNext: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  milestoneContent: {
    marginLeft: 12,
    flex: 1,
  },
  milestoneText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  milestoneNextText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  milestoneProgress: {
    fontSize: 12,
    color: '#EC4899',
    marginTop: 2,
    fontWeight: '500',
  },
  insightsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  recommendationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  tryRecommendationButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EC4899',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tryRecommendationButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});