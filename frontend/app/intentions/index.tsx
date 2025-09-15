import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface ImplementationIntention {
  id?: string;
  if_condition: string;
  then_action: string;
  context_triggers: string[];
  success_count: number;
  total_opportunities: number;
  effectiveness_score: number;
  created_at?: string;
  last_used?: string;
}

export default function IntentionsModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'create' | 'my-plans' | 'templates'>('create');
  const [intentions, setIntentions] = useState<ImplementationIntention[]>([]);
  
  // New intention form
  const [ifCondition, setIfCondition] = useState('');
  const [thenAction, setThenAction] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const contextTriggers = [
    'Time-based', 'Location-based', 'Emotional state', 'After completing task',
    'When feeling overwhelmed', 'When distracted', 'When procrastinating',
    'Morning routine', 'Evening routine', 'Work environment', 'Home environment'
  ];

  const ifThenTemplates = [
    {
      category: 'Task Initiation',
      plans: [
        {
          if: 'I feel overwhelmed by a large project',
          then: 'I will write down just three small steps and start with the easiest one',
          triggers: ['When feeling overwhelmed', 'Work environment']
        },
        {
          if: 'I want to avoid starting a difficult task',
          then: 'I will set a timer for 5 minutes and just begin',
          triggers: ['When procrastinating', 'Time-based']
        },
        {
          if: 'I sit down at my desk in the morning',
          then: 'I will review my top 3 priorities for the day',
          triggers: ['Morning routine', 'Location-based']
        }
      ]
    },
    {
      category: 'Distraction Management',
      plans: [
        {
          if: 'I reach for my phone during work',
          then: 'I will take three deep breaths and return to my current task',
          triggers: ['When distracted', 'Work environment']
        },
        {
          if: 'I notice my mind wandering during focused work',
          then: 'I will write down the distraction and return to work',
          triggers: ['When distracted', 'Emotional state']
        },
        {
          if: 'I feel tempted to check social media',
          then: 'I will do 10 pushups or stretches instead',
          triggers: ['When distracted', 'Emotional state']
        }
      ]
    },
    {
      category: 'Emotional Regulation',
      plans: [
        {
          if: 'I start feeling anxious about a deadline',
          then: 'I will list what I can control and take one action on that list',
          triggers: ['Emotional state', 'When feeling overwhelmed']
        },
        {
          if: 'I feel frustrated with my progress',
          then: 'I will acknowledge my effort and celebrate one small win',
          triggers: ['Emotional state', 'After completing task']
        },
        {
          if: 'I catch myself in negative self-talk',
          then: 'I will ask "What would I tell a good friend in this situation?"',
          triggers: ['Emotional state', 'When feeling overwhelmed']
        }
      ]
    },
    {
      category: 'Routine Building',
      plans: [
        {
          if: 'I wake up in the morning',
          then: 'I will make my bed before checking my phone',
          triggers: ['Morning routine', 'Time-based']
        },
        {
          if: 'I finish dinner',
          then: 'I will plan tomorrow\'s top 3 tasks',
          triggers: ['Evening routine', 'After completing task']
        },
        {
          if: 'I get home from work',
          then: 'I will change clothes and take a 5-minute walk',
          triggers: ['Location-based', 'Evening routine']
        }
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
      loadIntentions(storedUserId);
    }
  };

  const loadIntentions = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/intentions/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIntentions(data);
      }
    } catch (error) {
      console.error('Error loading intentions:', error);
      // Set demo data
      setIntentions([
        {
          id: '1',
          if_condition: 'I feel overwhelmed by my to-do list',
          then_action: 'I will choose just one task and work on it for 10 minutes',
          context_triggers: ['When feeling overwhelmed', 'Work environment'],
          success_count: 8,
          total_opportunities: 12,
          effectiveness_score: 0.67,
        },
        {
          id: '2',
          if_condition: 'I reach for my phone during work hours',
          then_action: 'I will put my phone in another room and take 3 deep breaths',
          context_triggers: ['When distracted', 'Work environment'],
          success_count: 15,
          total_opportunities: 18,
          effectiveness_score: 0.83,
        }
      ]);
    }
  };

  const saveIntention = async () => {
    if (!ifCondition.trim() || !thenAction.trim()) {
      Alert.alert('Missing Information', 'Please fill in both the IF condition and THEN action.');
      return;
    }

    if (!userId) return;

    const newIntention: ImplementationIntention = {
      if_condition: ifCondition,
      then_action: thenAction,
      context_triggers: selectedTriggers,
      success_count: 0,
      total_opportunities: 0,
      effectiveness_score: 0,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/intentions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newIntention,
          user_id: userId,
        }),
      });

      if (response.ok) {
        Alert.alert('Success!', 'Your if-then plan has been created!');
        setIfCondition('');
        setThenAction('');
        setSelectedTriggers([]);
        loadIntentions(userId);
        setActiveTab('my-plans');
      }
    } catch (error) {
      Alert.alert('Success!', 'If-then plan created! (Demo mode)');
      setIfCondition('');
      setThenAction('');
      setSelectedTriggers([]);
      setActiveTab('my-plans');
    }
  };

  const useTemplate = (template: any) => {
    setIfCondition(template.if);
    setThenAction(template.then);
    setSelectedTriggers(template.triggers);
    setActiveTab('create');
  };

  const recordUsage = async (intentionId: string, wasSuccessful: boolean) => {
    try {
      await fetch(`${BACKEND_URL}/api/intentions/${intentionId}/usage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: wasSuccessful }),
      });
      loadIntentions(userId);
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 0.8) return '#10B981'; // Green
    if (score >= 0.6) return '#F59E0B'; // Orange
    if (score >= 0.4) return '#EF4444'; // Red
    return '#9CA3AF'; // Gray
  };

  const getEffectivenessLabel = (score: number) => {
    if (score >= 0.8) return 'Highly Effective';
    if (score >= 0.6) return 'Moderately Effective';
    if (score >= 0.4) return 'Needs Improvement';
    return 'New Plan';
  };

  const renderCreate = () => (
    <ScrollView style={styles.tabContent}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.createTitle}>Create If-Then Plan</Text>
        <Text style={styles.createSubtitle}>
          Implementation intentions help you prepare for specific situations and respond automatically.
        </Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>IF (Situation/Trigger):</Text>
          <Text style={styles.sectionDescription}>
            Describe the specific situation when this plan should activate
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., I feel overwhelmed by my to-do list..."
            value={ifCondition}
            onChangeText={setIfCondition}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>THEN (Action):</Text>
          <Text style={styles.sectionDescription}>
            What specific action will you take in that situation?
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="e.g., I will choose just one task and work on it for 10 minutes..."
            value={thenAction}
            onChangeText={setThenAction}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Context Triggers:</Text>
          <Text style={styles.sectionDescription}>
            When and where is this plan most likely to be needed?
          </Text>
          <View style={styles.triggersContainer}>
            {contextTriggers.map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.triggerChip,
                  selectedTriggers.includes(trigger) && styles.triggerChipSelected
                ]}
                onPress={() => toggleTrigger(trigger)}
              >
                <Text style={[
                  styles.triggerChipText,
                  selectedTriggers.includes(trigger) && styles.triggerChipTextSelected
                ]}>
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.exampleSection}>
          <Text style={styles.exampleTitle}>💡 Your Plan Will Look Like:</Text>
          <View style={styles.exampleCard}>
            <Text style={styles.exampleText}>
              <Text style={styles.exampleBold}>IF</Text> {ifCondition || '[Your situation]'}
            </Text>
            <Text style={styles.exampleText}>
              <Text style={styles.exampleBold}>THEN</Text> {thenAction || '[Your action]'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveIntention}>
          <Text style={styles.saveButtonText}>Create If-Then Plan</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ScrollView>
  );

  const renderMyPlans = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.myPlansTitle}>Your If-Then Plans</Text>
      
      {intentions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No plans created yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create your first if-then plan to start building automatic positive responses.
          </Text>
        </View>
      ) : (
        intentions.map((intention) => (
          <View key={intention.id} style={styles.intentionCard}>
            <View style={styles.intentionHeader}>
              <View style={[
                styles.effectivenessBadge,
                { backgroundColor: getEffectivenessColor(intention.effectiveness_score) }
              ]}>
                <Text style={styles.effectivenessText}>
                  {getEffectivenessLabel(intention.effectiveness_score)}
                </Text>
              </View>
            </View>

            <View style={styles.intentionContent}>
              <Text style={styles.intentionIf}>
                <Text style={styles.intentionLabel}>IF:</Text> {intention.if_condition}
              </Text>
              <Text style={styles.intentionThen}>
                <Text style={styles.intentionLabel}>THEN:</Text> {intention.then_action}
              </Text>
            </View>

            <View style={styles.intentionTriggers}>
              {intention.context_triggers.map((trigger) => (
                <View key={trigger} style={styles.triggerTag}>
                  <Text style={styles.triggerTagText}>{trigger}</Text>
                </View>
              ))}
            </View>

            <View style={styles.intentionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{intention.success_count}</Text>
                <Text style={styles.statLabel}>Successes</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{intention.total_opportunities}</Text>
                <Text style={styles.statLabel}>Opportunities</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {intention.total_opportunities > 0 
                    ? Math.round(intention.effectiveness_score * 100) + '%'
                    : 'New'
                  }
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>

            <View style={styles.intentionActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => recordUsage(intention.id!, true)}
              >
                <Ionicons name="checkmark" size={16} color="#10B981" />
                <Text style={styles.actionButtonText}>Used Successfully</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => recordUsage(intention.id!, false)}
              >
                <Ionicons name="close" size={16} color="#EF4444" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>Didn't Work</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderTemplates = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.templatesTitle}>If-Then Plan Templates</Text>
      <Text style={styles.templatesSubtitle}>
        Research-backed plans you can customize for your needs
      </Text>

      {ifThenTemplates.map((category) => (
        <View key={category.category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category.category}</Text>
          
          {category.plans.map((plan, index) => (
            <View key={index} style={styles.templateCard}>
              <Text style={styles.templateIf}>
                <Text style={styles.templateLabel}>IF:</Text> {plan.if}
              </Text>
              <Text style={styles.templateThen}>
                <Text style={styles.templateLabel}>THEN:</Text> {plan.then}
              </Text>
              
              <View style={styles.templateTriggers}>
                {plan.triggers.map((trigger) => (
                  <View key={trigger} style={styles.templateTriggerTag}>
                    <Text style={styles.templateTriggerText}>{trigger}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.useTemplateButton}
                onPress={() => useTemplate(plan)}
              >
                <Ionicons name="add" size={16} color="#6366F1" />
                <Text style={styles.useTemplateText}>Use This Template</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>If-Then Plans</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.tabActive]}
          onPress={() => setActiveTab('create')}
        >
          <Ionicons name="add" size={20} color={activeTab === 'create' ? '#EF4444' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
            Create
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-plans' && styles.tabActive]}
          onPress={() => setActiveTab('my-plans')}
        >
          <Ionicons name="list" size={20} color={activeTab === 'my-plans' ? '#EF4444' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'my-plans' && styles.tabTextActive]}>
            My Plans
          </Text>
          {intentions.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{intentions.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.tabActive]}
          onPress={() => setActiveTab('templates')}
        >
          <Ionicons name="library" size={20} color={activeTab === 'templates' ? '#EF4444' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'templates' && styles.tabTextActive]}>
            Templates
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'create' && renderCreate()}
      {activeTab === 'my-plans' && renderMyPlans()}
      {activeTab === 'templates' && renderTemplates()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
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
    position: 'relative',
  },
  tabActive: {
    borderBottomColor: '#EF4444',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#EF4444',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  createTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  createSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
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
    minHeight: 80,
  },
  triggersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  triggerChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  triggerChipSelected: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  triggerChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  triggerChipTextSelected: {
    color: '#FFFFFF',
  },
  exampleSection: {
    marginBottom: 24,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  exampleBold: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#EF4444',
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
  myPlansTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
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
  intentionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  intentionHeader: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  effectivenessBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  effectivenessText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  intentionContent: {
    marginBottom: 16,
  },
  intentionIf: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 8,
  },
  intentionThen: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  intentionLabel: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  intentionTriggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  triggerTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  triggerTagText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  intentionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  intentionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 4,
  },
  actionButtonSecondary: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  actionButtonTextSecondary: {
    color: '#EF4444',
  },
  templatesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  templatesSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  templateIf: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
  },
  templateThen: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  templateLabel: {
    fontWeight: 'bold',
    color: '#EF4444',
  },
  templateTriggers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  templateTriggerTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  templateTriggerText: {
    fontSize: 11,
    color: '#64748B',
  },
  useTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 4,
  },
  useTemplateText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
});