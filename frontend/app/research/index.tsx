import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  duration: string;
  participants: number;
  status: 'recruiting' | 'active' | 'completed';
  category: string;
  requirements: string[];
  benefits: string[];
  timeCommitment: string;
}

interface OutcomeMeasurement {
  id: string;
  name: string;
  description: string;
  frequency: string;
  lastCompleted?: string;
  averageScore?: number;
  trend: 'improving' | 'stable' | 'declining';
}

export default function ResearchModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'studies' | 'outcomes' | 'contributions'>('studies');
  const [researchOptIn, setResearchOptIn] = useState(false);
  const [anonymousData, setAnonymousData] = useState(true);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<OutcomeMeasurement | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<{ [key: string]: number }>({});

  const availableStudies: ResearchStudy[] = [
    {
      id: 'cbt-efficacy-2024',
      title: 'Digital CBT for Procrastination: Long-term Efficacy Study',
      description: 'A 12-week study examining the effectiveness of digital cognitive behavioral therapy interventions for reducing procrastination in adults.',
      duration: '12 weeks',
      participants: 450,
      status: 'recruiting',
      category: 'Clinical Research',
      requirements: [
        'Age 18-65',
        'Regular app usage (5+ sessions/week)',
        'Complete weekly assessments',
        'No current therapy for procrastination'
      ],
      benefits: [
        'Free premium features during study',
        'Detailed progress reports',
        'Contribution to scientific knowledge',
        'Priority support access'
      ],
      timeCommitment: '15 minutes/week for assessments'
    },
    {
      id: 'mindfulness-productivity-2024',
      title: 'Mindfulness-Based Productivity Enhancement Study',
      description: 'Investigating how mindfulness meditation affects work productivity and procrastination behaviors in remote workers.',
      duration: '8 weeks',
      participants: 200,
      status: 'active',
      category: 'Behavioral Research',
      requirements: [
        'Remote worker or student',
        'Commit to daily mindfulness practice',
        'Complete productivity logs',
        'Participate in weekly check-ins'
      ],
      benefits: [
        'Personalized mindfulness coaching',
        'Productivity optimization insights',
        'Research participation certificate',
        'Access to study results'
      ],
      timeCommitment: '20 minutes/day practice + 10 minutes logging'
    },
    {
      id: 'ai-personalization-2024',
      title: 'AI-Driven Personalization in Mental Health Apps',
      description: 'Examining how AI-powered personalization improves user engagement and therapeutic outcomes in digital mental health interventions.',
      duration: '16 weeks',
      participants: 800,
      status: 'recruiting',
      category: 'Technology Research',
      requirements: [
        'Consent to AI data analysis',
        'Regular app interaction',
        'Monthly video interviews',
        'Complete cognitive assessments'
      ],
      benefits: [
        'Advanced AI-powered recommendations',
        'Detailed behavioral insights',
        'Contribution to AI research',
        '$50 compensation'
      ],
      timeCommitment: '30 minutes/week for assessments'
    }
  ];

  const outcomeMeasurements: OutcomeMeasurement[] = [
    {
      id: 'procrastination-scale',
      name: 'Pure Procrastination Scale (PPS)',
      description: 'Validated 12-item scale measuring procrastination tendencies',
      frequency: 'Weekly',
      lastCompleted: '2024-01-15',
      averageScore: 3.2,
      trend: 'improving'
    },
    {
      id: 'productivity-index',
      name: 'Personal Productivity Index',
      description: 'Custom measure of daily productivity and task completion',
      frequency: 'Daily',
      lastCompleted: '2024-01-20',
      averageScore: 7.1,
      trend: 'stable'
    },
    {
      id: 'wellbeing-scale',
      name: 'DASS-21 (Depression, Anxiety, Stress)',
      description: 'Standardized measure of psychological distress',
      frequency: 'Bi-weekly',
      lastCompleted: '2024-01-10',
      averageScore: 2.8,
      trend: 'improving'
    },
    {
      id: 'self-efficacy',
      name: 'General Self-Efficacy Scale',
      description: 'Measures belief in ability to handle difficult situations',
      frequency: 'Monthly',
      averageScore: 6.5,
      trend: 'improving'
    },
    {
      id: 'life-satisfaction',
      name: 'Satisfaction with Life Scale',
      description: 'Global assessment of life satisfaction and well-being',
      frequency: 'Monthly',
      lastCompleted: '2024-01-01',
      averageScore: 5.8,
      trend: 'stable'
    }
  ];

  const sampleSurveyQuestions = {
    'procrastination-scale': [
      'I delay making decisions until it\'s too late',
      'I put off tasks until the last minute',
      'I find myself procrastinating on important goals',
      'I delay starting tasks I find boring or difficult'
    ],
    'productivity-index': [
      'How productive did you feel today?',
      'How well did you manage your time?',
      'How satisfied are you with today\'s accomplishments?',
      'How focused were you during work periods?'
    ]
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  };

  const handleStudyEnrollment = (studyId: string) => {
    const study = availableStudies.find(s => s.id === studyId);
    if (!study) return;

    Alert.alert(
      'Enroll in Study',
      `Would you like to participate in "${study.title}"?\n\nTime commitment: ${study.timeCommitment}\nDuration: ${study.duration}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Learn More',
          onPress: () => showStudyDetails(study)
        },
        {
          text: 'Enroll',
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Enrollment Successful!',
              'You have been enrolled in the study. You will receive further instructions via email within 24 hours.'
            );
          }
        }
      ]
    );
  };

  const showStudyDetails = (study: ResearchStudy) => {
    const requirementsList = study.requirements.map((req, index) => `${index + 1}. ${req}`).join('\n');
    const benefitsList = study.benefits.map((benefit, index) => `${index + 1}. ${benefit}`).join('\n');

    Alert.alert(
      study.title,
      `${study.description}\n\nRequirements:\n${requirementsList}\n\nBenefits:\n${benefitsList}`,
      [{ text: 'Got it!' }]
    );
  };

  const handleTakeSurvey = (measurement: OutcomeMeasurement) => {
    setCurrentSurvey(measurement);
    setSurveyResponses({});
    setShowSurveyModal(true);
  };

  const submitSurvey = () => {
    if (!currentSurvey) return;

    const hasAllResponses = Object.keys(surveyResponses).length === 
      (sampleSurveyQuestions[currentSurvey.id as keyof typeof sampleSurveyQuestions]?.length || 0);

    if (!hasAllResponses) {
      Alert.alert('Incomplete Survey', 'Please answer all questions before submitting.');
      return;
    }

    Alert.alert(
      'Survey Submitted!',
      'Thank you for completing the assessment. Your responses have been recorded for research purposes.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowSurveyModal(false);
            setCurrentSurvey(null);
            setSurveyResponses({});
          }
        }
      ]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return 'trending-up';
      case 'declining': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#10B981';
      case 'declining': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return '#F59E0B';
      case 'active': return '#10B981';
      case 'completed': return '#64748B';
      default: return '#64748B';
    }
  };

  const renderStudies = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Research Studies</Text>
      <Text style={styles.tabSubtitle}>
        Contribute to scientific research while improving your own productivity
      </Text>

      <View style={styles.optInSection}>
        <View style={styles.optInHeader}>
          <Ionicons name="flask" size={24} color="#6366F1" />
          <Text style={styles.optInTitle}>Research Participation</Text>
        </View>
        <Text style={styles.optInDescription}>
          Help advance the science of productivity and mental health by participating in research studies.
        </Text>
        
        <View style={styles.optInToggle}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Participate in Research</Text>
            <Text style={styles.toggleDescription}>
              Receive invitations to relevant studies
            </Text>
          </View>
          <Switch
            value={researchOptIn}
            onValueChange={setResearchOptIn}
            trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
          />
        </View>

        <View style={styles.optInToggle}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Anonymous Data Sharing</Text>
            <Text style={styles.toggleDescription}>
              Share anonymized usage data for research
            </Text>
          </View>
          <Switch
            value={anonymousData}
            onValueChange={setAnonymousData}
            trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
          />
        </View>
      </View>

      {researchOptIn && (
        <>
          <Text style={styles.sectionTitle}>Available Studies</Text>
          {availableStudies.map((study) => (
            <View key={study.id} style={styles.studyCard}>
              <View style={styles.studyHeader}>
                <View style={styles.studyTitleRow}>
                  <Text style={styles.studyTitle}>{study.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(study.status) }]}>
                    <Text style={styles.statusText}>{study.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.studyCategory}>{study.category}</Text>
              </View>

              <Text style={styles.studyDescription}>{study.description}</Text>

              <View style={styles.studyDetails}>
                <View style={styles.studyDetailItem}>
                  <Ionicons name="time" size={16} color="#64748B" />
                  <Text style={styles.studyDetailText}>{study.duration}</Text>
                </View>
                <View style={styles.studyDetailItem}>
                  <Ionicons name="people" size={16} color="#64748B" />
                  <Text style={styles.studyDetailText}>{study.participants} participants</Text>
                </View>
                <View style={styles.studyDetailItem}>
                  <Ionicons name="calendar" size={16} color="#64748B" />
                  <Text style={styles.studyDetailText}>{study.timeCommitment}</Text>
                </View>
              </View>

              <View style={styles.studyActions}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => showStudyDetails(study)}
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.enrollButton,
                    study.status !== 'recruiting' && styles.enrollButtonDisabled
                  ]}
                  onPress={() => handleStudyEnrollment(study.id)}
                  disabled={study.status !== 'recruiting'}
                >
                  <Text style={[
                    styles.enrollButtonText,
                    study.status !== 'recruiting' && styles.enrollButtonTextDisabled
                  ]}>
                    {study.status === 'recruiting' ? 'Enroll' : 
                     study.status === 'active' ? 'Full' : 'Completed'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>
      )}

      {!researchOptIn && (
        <View style={styles.emptyState}>
          <Ionicons name="flask-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Research Participation Disabled</Text>
          <Text style={styles.emptyStateSubtext}>
            Enable research participation above to see available studies
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderOutcomes = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Outcome Measurements</Text>
      <Text style={styles.tabSubtitle}>
        Track your progress with validated research instruments
      </Text>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Your Progress Overview</Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>5</Text>
            <Text style={styles.overviewStatLabel}>Active Measures</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>68%</Text>
            <Text style={styles.overviewStatLabel}>Completion Rate</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewStatValue}>12</Text>
            <Text style={styles.overviewStatLabel}>Week Streak</Text>
          </View>
        </View>
      </View>

      {outcomeMeasurements.map((measurement) => (
        <View key={measurement.id} style={styles.measurementCard}>
          <View style={styles.measurementHeader}>
            <View style={styles.measurementInfo}>
              <Text style={styles.measurementName}>{measurement.name}</Text>
              <Text style={styles.measurementDescription}>{measurement.description}</Text>
            </View>
            <View style={styles.measurementTrend}>
              <Ionicons 
                name={getTrendIcon(measurement.trend) as any} 
                size={20} 
                color={getTrendColor(measurement.trend)} 
              />
              {measurement.averageScore && (
                <Text style={[styles.trendScore, { color: getTrendColor(measurement.trend) }]}>
                  {measurement.averageScore.toFixed(1)}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.measurementDetails}>
            <View style={styles.measurementDetail}>
              <Text style={styles.measurementDetailLabel}>Frequency</Text>
              <Text style={styles.measurementDetailValue}>{measurement.frequency}</Text>
            </View>
            {measurement.lastCompleted && (
              <View style={styles.measurementDetail}>
                <Text style={styles.measurementDetailLabel}>Last Completed</Text>
                <Text style={styles.measurementDetailValue}>
                  {new Date(measurement.lastCompleted).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.takeAssessmentButton}
            onPress={() => handleTakeSurvey(measurement)}
          >
            <Ionicons name="clipboard" size={16} color="#6366F1" />
            <Text style={styles.takeAssessmentText}>Take Assessment</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderContributions = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Your Research Contributions</Text>
      <Text style={styles.tabSubtitle}>
        See how your participation is advancing scientific knowledge
      </Text>

      <View style={styles.impactCard}>
        <View style={styles.impactHeader}>
          <Ionicons name="analytics" size={24} color="#10B981" />
          <Text style={styles.impactTitle}>Research Impact</Text>
        </View>
        <Text style={styles.impactDescription}>
          Your contributions have helped generate insights used in 3 published studies
        </Text>
        <View style={styles.impactStats}>
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>157</Text>
            <Text style={styles.impactStatLabel}>Data Points Contributed</Text>
          </View>
          <View style={styles.impactStat}>
            <Text style={styles.impactStatValue}>12</Text>
            <Text style={styles.impactStatLabel}>Weeks of Participation</Text>
          </View>
        </View>
      </View>

      <View style={styles.publicationsSection}>
        <Text style={styles.sectionTitle}>Related Publications</Text>
        
        <View style={styles.publicationCard}>
          <Text style={styles.publicationTitle}>
            "Digital Interventions for Procrastination: A Meta-Analysis"
          </Text>
          <Text style={styles.publicationAuthors}>Smith, J., Johnson, M., et al.</Text>
          <Text style={styles.publicationJournal}>Journal of Behavioral Medicine, 2024</Text>
          <Text style={styles.publicationNote}>
            📊 This study included anonymized data from 1,247 app users
          </Text>
        </View>

        <View style={styles.publicationCard}>
          <Text style={styles.publicationTitle}>
            "Mindfulness-Based Productivity Training: Real-World Effectiveness"
          </Text>
          <Text style={styles.publicationAuthors}>Chen, L., Davis, K., et al.</Text>
          <Text style={styles.publicationJournal}>Mindfulness, 2024</Text>
          <Text style={styles.publicationNote}>
            📊 Your meditation data contributed to this research
          </Text>
        </View>
      </View>

      <View style={styles.certificateSection}>
        <Text style={styles.sectionTitle}>Participation Certificates</Text>
        
        <TouchableOpacity style={styles.certificateButton}>
          <View style={styles.certificateIcon}>
            <Ionicons name="ribbon" size={24} color="#F59E0B" />
          </View>
          <View style={styles.certificateInfo}>
            <Text style={styles.certificateTitle}>Research Contributor</Text>
            <Text style={styles.certificateDescription}>
              Certificate of participation in productivity research
            </Text>
          </View>
          <Ionicons name="download" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <View style={styles.privacySection}>
        <Text style={styles.sectionTitle}>Data Privacy & Rights</Text>
        <Text style={styles.privacyText}>
          All your data is anonymized and aggregated before use in research. You can:
        </Text>
        
        <TouchableOpacity style={styles.privacyAction}>
          <Ionicons name="eye" size={20} color="#6366F1" />
          <Text style={styles.privacyActionText}>View your data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyAction}>
          <Ionicons name="download" size={20} color="#6366F1" />
          <Text style={styles.privacyActionText}>Export your data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.privacyAction}>
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={[styles.privacyActionText, { color: '#EF4444' }]}>Delete your data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSurveyModal = () => {
    if (!currentSurvey) return null;

    const questions = sampleSurveyQuestions[currentSurvey.id as keyof typeof sampleSurveyQuestions] || [];

    return (
      <Modal
        visible={showSurveyModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowSurveyModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{currentSurvey.name}</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.surveyDescription}>{currentSurvey.description}</Text>
              <Text style={styles.surveyInstructions}>
                Rate each statement from 1 (strongly disagree) to 7 (strongly agree):
              </Text>

              {questions.map((question, index) => (
                <View key={index} style={styles.questionCard}>
                  <Text style={styles.questionText}>{question}</Text>
                  <View style={styles.ratingScale}>
                    {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingButton,
                          surveyResponses[`q${index}`] === rating && styles.ratingButtonSelected
                        ]}
                        onPress={() => 
                          setSurveyResponses(prev => ({ ...prev, [`q${index}`]: rating }))
                        }
                      >
                        <Text style={[
                          styles.ratingButtonText,
                          surveyResponses[`q${index}`] === rating && styles.ratingButtonTextSelected
                        ]}>
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.submitButton} onPress={submitSurvey}>
                <Text style={styles.submitButtonText}>Submit Assessment</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Research</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'studies' && styles.tabActive]}
          onPress={() => setActiveTab('studies')}
        >
          <Ionicons name="flask" size={20} color={activeTab === 'studies' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'studies' && styles.tabTextActive]}>
            Studies
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outcomes' && styles.tabActive]}
          onPress={() => setActiveTab('outcomes')}
        >
          <Ionicons name="clipboard" size={20} color={activeTab === 'outcomes' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'outcomes' && styles.tabTextActive]}>
            Outcomes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contributions' && styles.tabActive]}
          onPress={() => setActiveTab('contributions')}
        >
          <Ionicons name="analytics" size={20} color={activeTab === 'contributions' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'contributions' && styles.tabTextActive]}>
            Impact
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'studies' && renderStudies()}
      {activeTab === 'outcomes' && renderOutcomes()}
      {activeTab === 'contributions' && renderContributions()}

      {/* Survey Modal */}
      {renderSurveyModal()}
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
    lineHeight: 24,
    marginBottom: 24,
  },
  optInSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  optInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optInTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  optInDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  optInToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  studyCard: {
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
  studyHeader: {
    marginBottom: 16,
  },
  studyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  studyCategory: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  studyDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  studyDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  studyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studyDetailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  studyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  enrollButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  enrollButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  enrollButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  enrollButtonTextDisabled: {
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
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  measurementCard: {
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
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  measurementInfo: {
    flex: 1,
    marginRight: 16,
  },
  measurementName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  measurementDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  measurementTrend: {
    alignItems: 'center',
  },
  trendScore: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  measurementDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  measurementDetail: {
    flex: 1,
  },
  measurementDetailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  measurementDetailValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  takeAssessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  takeAssessmentText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 6,
  },
  impactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  impactDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  impactStats: {
    flexDirection: 'row',
    gap: 32,
  },
  impactStat: {
    alignItems: 'center',
  },
  impactStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  impactStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  publicationsSection: {
    marginBottom: 32,
  },
  publicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  publicationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
  },
  publicationAuthors: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 4,
  },
  publicationJournal: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 8,
  },
  publicationNote: {
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
  },
  certificateSection: {
    marginBottom: 32,
  },
  certificateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  certificateIcon: {
    marginRight: 16,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  certificateDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  privacySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  privacyText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  privacyActionText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  surveyDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  surveyInstructions: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 16,
    lineHeight: 24,
  },
  ratingScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  ratingButtonTextSelected: {
    color: '#FFFFFF',
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});