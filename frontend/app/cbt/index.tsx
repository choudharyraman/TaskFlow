import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface ThoughtRecord {
  id?: string;
  trigger_situation: string;
  automatic_thoughts: string[];
  emotions: string[];
  emotion_intensity: { [key: string]: number };
  physical_sensations: string[];
  behaviors: string[];
  evidence_for: string[];
  evidence_against: string[];
  balanced_thoughts: string[];
  outcome_emotions: { [key: string]: number };
  coping_strategies_used: string[];
  effectiveness_rating: number;
}

export default function CBTModule() {
  const [activeTab, setActiveTab] = useState<'record' | 'history' | 'skills'>('record');
  const [userId, setUserId] = useState<string>('');
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<ThoughtRecord>({
    trigger_situation: '',
    automatic_thoughts: [''],
    emotions: [''],
    emotion_intensity: {},
    physical_sensations: [''],
    behaviors: [''],
    evidence_for: [''],
    evidence_against: [''],
    balanced_thoughts: [''],
    outcome_emotions: {},
    coping_strategies_used: [''],
    effectiveness_rating: 5,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Trigger Situation',
    'Automatic Thoughts',
    'Emotions & Intensity',
    'Physical Sensations',
    'Behaviors',
    'Evidence For',
    'Evidence Against',
    'Balanced Thoughts',
    'Outcome & Rating'
  ];

  const commonEmotions = ['Anxious', 'Sad', 'Angry', 'Frustrated', 'Overwhelmed', 'Guilty', 'Ashamed', 'Hopeless'];
  const commonPhysicalSensations = ['Tight chest', 'Racing heart', 'Tense muscles', 'Headache', 'Fatigue', 'Restlessness'];
  const commonCopingStrategies = ['Deep breathing', 'Progressive muscle relaxation', 'Mindfulness', 'Exercise', 'Talking to someone', 'Journaling'];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadThoughtRecords(storedUserId);
    }
  };

  const loadThoughtRecords = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/cbt/thought-records/${userId}`);
      if (response.ok) {
        const records = await response.json();
        setThoughtRecords(records);
      }
    } catch (error) {
      console.error('Error loading thought records:', error);
    }
  };

  const updateArrayField = (field: keyof ThoughtRecord, index: number, value: string) => {
    const currentArray = currentRecord[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setCurrentRecord({ ...currentRecord, [field]: newArray });
  };

  const addArrayItem = (field: keyof ThoughtRecord) => {
    const currentArray = currentRecord[field] as string[];
    setCurrentRecord({ ...currentRecord, [field]: [...currentArray, ''] });
  };

  const removeArrayItem = (field: keyof ThoughtRecord, index: number) => {
    const currentArray = currentRecord[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    setCurrentRecord({ ...currentRecord, [field]: newArray });
  };

  const updateEmotionIntensity = (emotion: string, intensity: number) => {
    setCurrentRecord({
      ...currentRecord,
      emotion_intensity: { ...currentRecord.emotion_intensity, [emotion]: intensity }
    });
  };

  const saveThoughtRecord = async () => {
    if (!userId) return;

    try {
      const recordToSave = {
        ...currentRecord,
        user_id: userId,
        automatic_thoughts: currentRecord.automatic_thoughts.filter(t => t.trim() !== ''),
        emotions: currentRecord.emotions.filter(e => e.trim() !== ''),
        physical_sensations: currentRecord.physical_sensations.filter(s => s.trim() !== ''),
        behaviors: currentRecord.behaviors.filter(b => b.trim() !== ''),
        evidence_for: currentRecord.evidence_for.filter(e => e.trim() !== ''),
        evidence_against: currentRecord.evidence_against.filter(e => e.trim() !== ''),
        balanced_thoughts: currentRecord.balanced_thoughts.filter(t => t.trim() !== ''),
        coping_strategies_used: currentRecord.coping_strategies_used.filter(s => s.trim() !== ''),
      };

      const response = await fetch(`${BACKEND_URL}/api/cbt/thought-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordToSave),
      });

      if (response.ok) {
        Alert.alert('Success', 'Thought record saved successfully!');
        setCurrentRecord({
          trigger_situation: '',
          automatic_thoughts: [''],
          emotions: [''],
          emotion_intensity: {},
          physical_sensations: [''],
          behaviors: [''],
          evidence_for: [''],
          evidence_against: [''],
          balanced_thoughts: [''],
          outcome_emotions: {},
          coping_strategies_used: [''],
          effectiveness_rating: 5,
        });
        setCurrentStep(0);
        loadThoughtRecords(userId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save thought record');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What triggered these thoughts?</Text>
            <Text style={styles.stepDescription}>
              Describe the situation, event, or memory that led to these feelings.
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="e.g., Got assigned a new project at work..."
              value={currentRecord.trigger_situation}
              onChangeText={(text) => setCurrentRecord({ ...currentRecord, trigger_situation: text })}
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What thoughts went through your mind?</Text>
            <Text style={styles.stepDescription}>
              What were you thinking when you felt upset? Include all thoughts, even brief ones.
            </Text>
            {currentRecord.automatic_thoughts.map((thought, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., I'll never be able to finish this..."
                  value={thought}
                  onChangeText={(text) => updateArrayField('automatic_thoughts', index, text)}
                />
                {currentRecord.automatic_thoughts.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem('automatic_thoughts', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('automatic_thoughts')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Another Thought</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What emotions did you feel?</Text>
            <Text style={styles.stepDescription}>
              Select emotions and rate their intensity (1-10).
            </Text>
            
            <Text style={styles.sectionTitle}>Common Emotions:</Text>
            <View style={styles.chipContainer}>
              {commonEmotions.map((emotion) => (
                <TouchableOpacity
                  key={emotion}
                  style={[
                    styles.chip,
                    currentRecord.emotions.includes(emotion) && styles.chipSelected
                  ]}
                  onPress={() => {
                    const isSelected = currentRecord.emotions.includes(emotion);
                    if (isSelected) {
                      setCurrentRecord({
                        ...currentRecord,
                        emotions: currentRecord.emotions.filter(e => e !== emotion),
                        emotion_intensity: { ...currentRecord.emotion_intensity, [emotion]: undefined }
                      });
                    } else {
                      setCurrentRecord({
                        ...currentRecord,
                        emotions: [...currentRecord.emotions, emotion],
                        emotion_intensity: { ...currentRecord.emotion_intensity, [emotion]: 5 }
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    currentRecord.emotions.includes(emotion) && styles.chipTextSelected
                  ]}>
                    {emotion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {currentRecord.emotions.filter(e => e.trim() !== '').map((emotion) => (
              <View key={emotion} style={styles.intensityRow}>
                <Text style={styles.emotionLabel}>{emotion}</Text>
                <View style={styles.intensityContainer}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.intensityButton,
                        currentRecord.emotion_intensity[emotion] === num && styles.intensityButtonSelected
                      ]}
                      onPress={() => updateEmotionIntensity(emotion, num)}
                    >
                      <Text style={[
                        styles.intensityButtonText,
                        currentRecord.emotion_intensity[emotion] === num && styles.intensityButtonTextSelected
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What physical sensations did you notice?</Text>
            <Text style={styles.stepDescription}>
              How did your body feel during this situation?
            </Text>
            
            <Text style={styles.sectionTitle}>Common Sensations:</Text>
            <View style={styles.chipContainer}>
              {commonPhysicalSensations.map((sensation) => (
                <TouchableOpacity
                  key={sensation}
                  style={[
                    styles.chip,
                    currentRecord.physical_sensations.includes(sensation) && styles.chipSelected
                  ]}
                  onPress={() => {
                    const isSelected = currentRecord.physical_sensations.includes(sensation);
                    if (isSelected) {
                      setCurrentRecord({
                        ...currentRecord,
                        physical_sensations: currentRecord.physical_sensations.filter(s => s !== sensation)
                      });
                    } else {
                      setCurrentRecord({
                        ...currentRecord,
                        physical_sensations: [...currentRecord.physical_sensations.filter(s => s.trim() !== ''), sensation]
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    currentRecord.physical_sensations.includes(sensation) && styles.chipTextSelected
                  ]}>
                    {sensation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {currentRecord.physical_sensations.map((sensation, index) => (
              sensation.trim() !== '' && !commonPhysicalSensations.includes(sensation) && (
                <View key={index} style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Custom physical sensation..."
                    value={sensation}
                    onChangeText={(text) => updateArrayField('physical_sensations', index, text)}
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('physical_sensations', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('physical_sensations')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Custom Sensation</Text>
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What did you do in response?</Text>
            <Text style={styles.stepDescription}>
              What behaviors did you engage in when you had these thoughts and feelings?
            </Text>
            {currentRecord.behaviors.map((behavior, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Avoided the task, scrolled social media..."
                  value={behavior}
                  onChangeText={(text) => updateArrayField('behaviors', index, text)}
                />
                {currentRecord.behaviors.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem('behaviors', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('behaviors')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Another Behavior</Text>
            </TouchableOpacity>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What evidence supports your thoughts?</Text>
            <Text style={styles.stepDescription}>
              What facts or experiences support your automatic thoughts?
            </Text>
            {currentRecord.evidence_for.map((evidence, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., The deadline is very tight..."
                  value={evidence}
                  onChangeText={(text) => updateArrayField('evidence_for', index, text)}
                />
                {currentRecord.evidence_for.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem('evidence_for', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('evidence_for')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Evidence</Text>
            </TouchableOpacity>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What evidence goes against your thoughts?</Text>
            <Text style={styles.stepDescription}>
              What facts or experiences contradict your automatic thoughts?
            </Text>
            {currentRecord.evidence_against.map((evidence, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., I've completed similar projects before..."
                  value={evidence}
                  onChangeText={(text) => updateArrayField('evidence_against', index, text)}
                />
                {currentRecord.evidence_against.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem('evidence_against', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('evidence_against')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Evidence</Text>
            </TouchableOpacity>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's a more balanced perspective?</Text>
            <Text style={styles.stepDescription}>
              Based on the evidence, what would be a more realistic way to think about this situation?
            </Text>
            {currentRecord.balanced_thoughts.map((thought, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., This is challenging but manageable if I break it down..."
                  value={thought}
                  onChangeText={(text) => updateArrayField('balanced_thoughts', index, text)}
                />
                {currentRecord.balanced_thoughts.length > 1 && (
                  <TouchableOpacity onPress={() => removeArrayItem('balanced_thoughts', index)}>
                    <Ionicons name="remove-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addArrayItem('balanced_thoughts')}>
              <Ionicons name="add" size={16} color="#6366F1" />
              <Text style={styles.addButtonText}>Add Balanced Thought</Text>
            </TouchableOpacity>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How do you feel now?</Text>
            <Text style={styles.stepDescription}>
              Rate how you feel after working through this thought record.
            </Text>
            
            <Text style={styles.sectionTitle}>Coping Strategies Used:</Text>
            <View style={styles.chipContainer}>
              {commonCopingStrategies.map((strategy) => (
                <TouchableOpacity
                  key={strategy}
                  style={[
                    styles.chip,
                    currentRecord.coping_strategies_used.includes(strategy) && styles.chipSelected
                  ]}
                  onPress={() => {
                    const isSelected = currentRecord.coping_strategies_used.includes(strategy);
                    if (isSelected) {
                      setCurrentRecord({
                        ...currentRecord,
                        coping_strategies_used: currentRecord.coping_strategies_used.filter(s => s !== strategy)
                      });
                    } else {
                      setCurrentRecord({
                        ...currentRecord,
                        coping_strategies_used: [...currentRecord.coping_strategies_used.filter(s => s.trim() !== ''), strategy]
                      });
                    }
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    currentRecord.coping_strategies_used.includes(strategy) && styles.chipTextSelected
                  ]}>
                    {strategy}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Effectiveness Rating:</Text>
            <Text style={styles.ratingDescription}>
              How effective was this thought record process? (1 = Not helpful, 10 = Very helpful)
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.ratingButton,
                    currentRecord.effectiveness_rating === num && styles.ratingButtonSelected
                  ]}
                  onPress={() => setCurrentRecord({ ...currentRecord, effectiveness_rating: num })}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    currentRecord.effectiveness_rating === num && styles.ratingButtonTextSelected
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderHistory = () => (
    <ScrollView style={styles.historyContainer}>
      <Text style={styles.historyTitle}>Your Thought Records</Text>
      {thoughtRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No thought records yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start by creating your first thought record to track your progress.
          </Text>
        </View>
      ) : (
        thoughtRecords.map((record, index) => (
          <View key={index} style={styles.recordCard}>
            <Text style={styles.recordTitle}>
              {record.trigger_situation.substring(0, 50)}...
            </Text>
            <Text style={styles.recordDate}>
              Effectiveness: {record.effectiveness_rating}/10
            </Text>
            <View style={styles.recordEmotions}>
              {Object.entries(record.emotion_intensity).map(([emotion, intensity]) => (
                <View key={emotion} style={styles.emotionTag}>
                  <Text style={styles.emotionTagText}>{emotion}: {intensity}</Text>
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSkills = () => (
    <ScrollView style={styles.skillsContainer}>
      <Text style={styles.skillsTitle}>CBT Skills & Techniques</Text>
      
      <View style={styles.skillCard}>
        <Text style={styles.skillCardTitle}>Cognitive Restructuring</Text>
        <Text style={styles.skillCardDescription}>
          Learn to identify and challenge negative thought patterns through evidence examination.
        </Text>
        <View style={styles.skillSteps}>
          <Text style={styles.skillStep}>1. Identify the automatic thought</Text>
          <Text style={styles.skillStep}>2. Examine evidence for and against</Text>
          <Text style={styles.skillStep}>3. Develop a balanced perspective</Text>
        </View>
      </View>

      <View style={styles.skillCard}>
        <Text style={styles.skillCardTitle}>Behavioral Activation</Text>
        <Text style={styles.skillCardDescription}>
          Break down overwhelming tasks into manageable steps to overcome procrastination.
        </Text>
        <View style={styles.skillSteps}>
          <Text style={styles.skillStep}>1. Choose one avoided task</Text>
          <Text style={styles.skillStep}>2. Break it into small steps</Text>
          <Text style={styles.skillStep}>3. Start with the easiest step</Text>
          <Text style={styles.skillStep}>4. Celebrate small wins</Text>
        </View>
      </View>

      <View style={styles.skillCard}>
        <Text style={styles.skillCardTitle}>Mindful Awareness</Text>
        <Text style={styles.skillCardDescription}>
          Notice thoughts and feelings without immediately reacting to them.
        </Text>
        <View style={styles.skillSteps}>
          <Text style={styles.skillStep}>1. Pause when you notice strong emotions</Text>
          <Text style={styles.skillStep}>2. Name the thought or feeling</Text>
          <Text style={styles.skillStep}>3. Take three deep breaths</Text>
          <Text style={styles.skillStep}>4. Choose your response mindfully</Text>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>CBT Tools</Text>
          <Text style={styles.headerSubtitle}>Cognitive Behavioral Therapy</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'record' && styles.tabActive]}
            onPress={() => setActiveTab('record')}
          >
            <Ionicons name="create" size={20} color={activeTab === 'record' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'record' && styles.tabTextActive]}>
              Thought Record
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons name="time" size={20} color={activeTab === 'history' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              History
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'skills' && styles.tabActive]}
            onPress={() => setActiveTab('skills')}
          >
            <Ionicons name="school" size={20} color={activeTab === 'skills' ? '#10B981' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === 'skills' && styles.tabTextActive]}>
              Skills
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'record' && (
          <>
            {/* Progress Stepper */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepper}>
                {steps.map((step, index) => (
                  <View key={step} style={styles.stepperItem}>
                    <View style={[
                      styles.stepperCircle,
                      index <= currentStep && styles.stepperCircleActive,
                      index === currentStep && styles.stepperCircleCurrent
                    ]}>
                      <Text style={[
                        styles.stepperNumber,
                        index <= currentStep && styles.stepperNumberActive
                      ]}>
                        {index + 1}
                      </Text>
                    </View>
                    {index < steps.length - 1 && (
                      <View style={[
                        styles.stepperLine,
                        index < currentStep && styles.stepperLineActive
                      ]} />
                    )}
                  </View>
                ))}
              </View>
              <Text style={styles.currentStepText}>{steps[currentStep]}</Text>
            </View>

            <ScrollView style={styles.content}>
              {renderStepContent()}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < steps.length - 1 ? (
                <TouchableOpacity
                  style={styles.nextButton}
                  onPress={() => setCurrentStep(currentStep + 1)}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveThoughtRecord}
                >
                  <Text style={styles.saveButtonText}>Save Record</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {activeTab === 'history' && renderHistory()}
        {activeTab === 'skills' && renderSkills()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
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
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#10B981',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#10B981',
  },
  stepperCircleCurrent: {
    backgroundColor: '#6366F1',
  },
  stepperNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748B',
  },
  stepperNumberActive: {
    color: '#FFFFFF',
  },
  stepperLine: {
    width: 20,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  stepperLineActive: {
    backgroundColor: '#10B981',
  },
  currentStepText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  intensityRow: {
    marginBottom: 16,
  },
  emotionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  intensityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  intensityButtonSelected: {
    backgroundColor: '#6366F1',
  },
  intensityButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  intensityButtonTextSelected: {
    color: '#FFFFFF',
  },
  ratingDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ratingButtonSelected: {
    backgroundColor: '#10B981',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
  },
  nextButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  historyContainer: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
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
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  recordEmotions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emotionTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    marginRight: 8,
    marginBottom: 4,
  },
  emotionTagText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  skillsContainer: {
    flex: 1,
    padding: 20,
  },
  skillsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  skillCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  skillCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  skillCardDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  skillSteps: {
    marginLeft: 8,
  },
  skillStep: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
});