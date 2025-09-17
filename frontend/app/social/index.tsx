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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface AccountabilityPartner {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  relationship_type: string;
  goals_alignment: number;
  communication_frequency: string;
  check_in_schedule: any;
  created_at: string;
  active: boolean;
}

interface CheckInSession {
  id: string;
  partnership_id: string;
  initiator_id: string;
  scheduled_time: string;
  actual_time?: string;
  duration?: number;
  topics_discussed: string[];
  progress_shared: any;
  support_provided: string[];
  next_steps: string[];
  satisfaction_rating?: number;
  completed: boolean;
}

export default function SocialModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'partners' | 'checkins' | 'community'>('partners');
  const [partners, setPartners] = useState<AccountabilityPartner[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInSession[]>([]);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerGoals, setNewPartnerGoals] = useState('');

  const relationshipTypes = [
    { id: 'peer', name: 'Peer Partner', description: 'Equal support and accountability' },
    { id: 'mentor', name: 'Mentor', description: 'Someone who guides and supports you' },
    { id: 'mentee', name: 'Mentee', description: 'Someone you guide and support' },
    { id: 'buddy', name: 'Accountability Buddy', description: 'Casual mutual support' }
  ];

  const checkInFrequencies = [
    { id: 'daily', name: 'Daily', description: 'Every day' },
    { id: 'weekly', name: 'Weekly', description: 'Once per week' },
    { id: 'biweekly', name: 'Bi-weekly', description: 'Every two weeks' },
    { id: 'monthly', name: 'Monthly', description: 'Once per month' }
  ];

  const supportTypes = [
    'Encouragement', 'Problem-solving', 'Goal setting', 'Progress celebration',
    'Challenge accountability', 'Resource sharing', 'Emotional support', 'Skill sharing'
  ];

  const communityGroups = [
    {
      id: 'productivity-pros',
      name: 'Productivity Pros',
      members: 124,
      description: 'For professionals working on productivity and time management',
      category: 'Professional',
      activity: 'Very Active'
    },
    {
      id: 'creative-focus',
      name: 'Creative Focus',
      members: 89,
      description: 'Artists, writers, and creatives overcoming procrastination',
      category: 'Creative',
      activity: 'Active'
    },
    {
      id: 'student-success',
      name: 'Student Success',
      members: 156,
      description: 'Students supporting each other in academic goals',
      category: 'Academic',
      activity: 'Very Active'
    },
    {
      id: 'health-habits',
      name: 'Health & Habits',
      members: 98,
      description: 'Building healthy habits and routines together',
      category: 'Health',
      activity: 'Moderate'
    }
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadAccountabilityData(storedUserId);
    }
  };

  const loadAccountabilityData = async (userId: string) => {
    try {
      const partnersResponse = await fetch(`${BACKEND_URL}/api/accountability/partners/${userId}`);
      if (partnersResponse.ok) {
        const partnersData = await partnersResponse.json();
        setPartners(partnersData);
      }
    } catch (error) {
      console.error('Error loading accountability data:', error);
      // Set demo data
      setPartners([
        {
          id: '1',
          user_id: userId,
          partner_id: 'partner-1',
          partner_name: 'Sarah Chen',
          relationship_type: 'peer',
          goals_alignment: 0.85,
          communication_frequency: 'weekly',
          check_in_schedule: { day: 'monday', time: '18:00' },
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          active: true
        },
        {
          id: '2',
          user_id: userId,
          partner_id: 'partner-2',
          partner_name: 'Mike Johnson',
          relationship_type: 'buddy',
          goals_alignment: 0.72,
          communication_frequency: 'biweekly',
          check_in_schedule: { day: 'friday', time: '17:30' },
          created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
          active: true
        }
      ]);

      setCheckIns([
        {
          id: '1',
          partnership_id: '1',
          initiator_id: userId,
          scheduled_time: new Date(Date.now() + 86400000).toISOString(),
          topics_discussed: ['Project deadlines', 'Morning routine'],
          progress_shared: { completed_goals: 3, new_challenges: 1 },
          support_provided: ['Encouragement', 'Problem-solving'],
          next_steps: ['Daily check-ins', 'Set up workspace'],
          satisfaction_rating: 9,
          completed: false
        }
      ]);
    }
  };

  const addAccountabilityPartner = async () => {
    if (!newPartnerEmail.trim()) {
      Alert.alert('Missing Information', 'Please enter your partner\'s email.');
      return;
    }

    // In real implementation, this would search for the user and send an invitation
    Alert.alert(
      'Invitation Sent!', 
      `An accountability partnership invitation has been sent to ${newPartnerEmail}. They'll receive a notification to accept your partnership.`,
      [{ text: 'OK', onPress: () => {
        setShowAddPartnerModal(false);
        setNewPartnerEmail('');
        setNewPartnerGoals('');
      }}]
    );
  };

  const scheduleCheckIn = (partnerId: string, partnerName: string) => {
    Alert.alert(
      'Schedule Check-in',
      `Would you like to schedule a check-in with ${partnerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Schedule for Today', onPress: () => {
          Alert.alert('Check-in Scheduled', `You'll receive a reminder for your check-in with ${partnerName} today at 6 PM.`);
        }},
        { text: 'Schedule for Tomorrow', onPress: () => {
          Alert.alert('Check-in Scheduled', `You'll receive a reminder for your check-in with ${partnerName} tomorrow at 6 PM.`);
        }}
      ]
    );
  };

  const joinCommunityGroup = (groupName: string) => {
    Alert.alert(
      'Join Community',
      `Would you like to join the ${groupName} community group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => {
          Alert.alert('Welcome!', `You've successfully joined ${groupName}. You'll now receive community updates and can participate in group challenges.`);
        }}
      ]
    );
  };

  const renderPartners = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.headerSection}>
        <Text style={styles.tabTitle}>Accountability Partners</Text>
        <Text style={styles.tabSubtitle}>
          Build meaningful connections with people who support your growth and hold you accountable.
        </Text>
        
        <TouchableOpacity 
          style={styles.addPartnerButton}
          onPress={() => setShowAddPartnerModal(true)}
        >
          <Ionicons name="person-add" size={20} color="#FFFFFF" />
          <Text style={styles.addPartnerButtonText}>Add Partner</Text>
        </TouchableOpacity>
      </View>

      {partners.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No accountability partners yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start by adding your first accountability partner to stay motivated and supported.
          </Text>
        </View>
      ) : (
        <View style={styles.partnersContainer}>
          {partners.map((partner) => (
            <View key={partner.id} style={styles.partnerCard}>
              <View style={styles.partnerHeader}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitials}>
                    {partner.partner_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{partner.partner_name}</Text>
                  <Text style={styles.partnerType}>
                    {relationshipTypes.find(t => t.id === partner.relationship_type)?.name}
                  </Text>
                </View>
                <View style={styles.partnerStats}>
                  <Text style={styles.alignmentScore}>{Math.round(partner.goals_alignment * 100)}%</Text>
                  <Text style={styles.alignmentLabel}>Goals Aligned</Text>
                </View>
              </View>

              <View style={styles.partnerDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    Check-ins: {checkInFrequencies.find(f => f.id === partner.communication_frequency)?.name}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time" size={16} color="#64748B" />
                  <Text style={styles.detailText}>
                    Next: {partner.check_in_schedule.day} at {partner.check_in_schedule.time}
                  </Text>
                </View>
              </View>

              <View style={styles.partnerActions}>
                <TouchableOpacity 
                  style={styles.checkInButton}
                  onPress={() => scheduleCheckIn(partner.partner_id, partner.partner_name)}
                >
                  <Ionicons name="chatbubbles" size={16} color="#6366F1" />
                  <Text style={styles.checkInButtonText}>Check In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Ionicons name="mail" size={16} color="#10B981" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>💪 Benefits of Accountability Partners</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text style={styles.benefitText}>65% higher goal achievement rate</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="heart" size={20} color="#EC4899" />
            <Text style={styles.benefitText}>Increased motivation and emotional support</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="people" size={20} color="#8B5CF6" />
            <Text style={styles.benefitText}>Shared learning and problem-solving</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color="#06B6D4" />
            <Text style={styles.benefitText}>Regular progress tracking and celebration</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCheckIns = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Check-In Sessions</Text>
      <Text style={styles.tabSubtitle}>
        Regular check-ins help maintain momentum and strengthen accountability relationships.
      </Text>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>📅 Upcoming Check-ins</Text>
        {checkIns.filter(c => !c.completed).map((checkIn) => {
          const partner = partners.find(p => p.id === checkIn.partnership_id);
          return (
            <View key={checkIn.id} style={styles.checkInCard}>
              <View style={styles.checkInHeader}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitials}>
                    {partner?.partner_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.checkInInfo}>
                  <Text style={styles.checkInPartner}>{partner?.partner_name}</Text>
                  <Text style={styles.checkInTime}>
                    {new Date(checkIn.scheduled_time).toLocaleDateString()} at{' '}
                    {new Date(checkIn.scheduled_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </Text>
                </View>
                <TouchableOpacity style={styles.startCheckInButton}>
                  <Text style={styles.startCheckInButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.checkInGuideSection}>
        <Text style={styles.sectionTitle}>🎯 Effective Check-in Structure</Text>
        <View style={styles.checkInSteps}>
          <View style={styles.checkInStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Progress</Text>
              <Text style={styles.stepDescription}>What did you accomplish since last check-in?</Text>
            </View>
          </View>
          <View style={styles.checkInStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Discuss Challenges</Text>
              <Text style={styles.stepDescription}>What obstacles are you facing?</Text>
            </View>
          </View>
          <View style={styles.checkInStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Problem-Solve Together</Text>
              <Text style={styles.stepDescription}>Brainstorm solutions and strategies</Text>
            </View>
          </View>
          <View style={styles.checkInStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set Next Steps</Text>
              <Text style={styles.stepDescription}>Commit to specific actions before next check-in</Text>
            </View>
          </View>
          <View style={styles.checkInStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Celebrate Wins</Text>
              <Text style={styles.stepDescription}>Acknowledge progress and successes</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.recentCheckInsSection}>
        <Text style={styles.sectionTitle}>📊 Recent Check-ins</Text>
        <View style={styles.checkInHistoryCard}>
          <View style={styles.checkInHistoryHeader}>
            <Text style={styles.checkInHistoryPartner}>Sarah Chen</Text>
            <Text style={styles.checkInHistoryDate}>3 days ago</Text>
          </View>
          <View style={styles.checkInHistoryDetails}>
            <Text style={styles.checkInHistoryTopics}>Discussed: Project deadlines, Morning routine</Text>
            <Text style={styles.checkInHistoryRating}>Satisfaction: 9/10</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCommunity = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Community Groups</Text>
      <Text style={styles.tabSubtitle}>
        Join supportive communities of people working toward similar goals.
      </Text>

      <View style={styles.communityGroupsContainer}>
        {communityGroups.map((group) => (
          <View key={group.id} style={styles.communityGroupCard}>
            <View style={styles.communityGroupHeader}>
              <Text style={styles.communityGroupName}>{group.name}</Text>
              <View style={[styles.activityBadge, 
                group.activity === 'Very Active' ? styles.veryActiveBadge :
                group.activity === 'Active' ? styles.activeBadge : styles.moderateBadge
              ]}>
                <Text style={styles.activityBadgeText}>{group.activity}</Text>
              </View>
            </View>
            
            <Text style={styles.communityGroupDescription}>{group.description}</Text>
            
            <View style={styles.communityGroupStats}>
              <View style={styles.communityGroupStat}>
                <Ionicons name="people" size={16} color="#64748B" />
                <Text style={styles.communityGroupStatText}>{group.members} members</Text>
              </View>
              <View style={styles.communityGroupStat}>
                <Ionicons name="bookmark" size={16} color="#64748B" />
                <Text style={styles.communityGroupStatText}>{group.category}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.joinGroupButton}
              onPress={() => joinCommunityGroup(group.name)}
            >
              <Text style={styles.joinGroupButtonText}>Join Group</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>🏆 Community Challenges</Text>
        
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>30-Day Productivity Challenge</Text>
            <Text style={styles.challengeParticipants}>247 participants</Text>
          </View>
          <Text style={styles.challengeDescription}>
            Complete one focused work session every day for 30 days
          </Text>
          <View style={styles.challengeProgress}>
            <Text style={styles.challengeProgressText}>Day 15 of 30</Text>
            <View style={styles.challengeProgressBar}>
              <View style={[styles.challengeProgressFill, { width: '50%' }]} />
            </View>
          </View>
          <TouchableOpacity style={styles.joinChallengeButton}>
            <Text style={styles.joinChallengeButtonText}>Join Challenge</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <Text style={styles.challengeTitle}>Procrastination-Free Week</Text>
            <Text style={styles.challengeParticipants}>89 participants</Text>
          </View>
          <Text style={styles.challengeDescription}>
            Use anti-procrastination techniques every day for one week
          </Text>
          <TouchableOpacity style={styles.joinChallengeButton}>
            <Text style={styles.joinChallengeButtonText}>Join Challenge</Text>
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
        <Text style={styles.headerTitle}>Accountability & Social</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'partners' && styles.tabActive]}
          onPress={() => setActiveTab('partners')}
        >
          <Ionicons name="people" size={20} color={activeTab === 'partners' ? '#F97316' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'partners' && styles.tabTextActive]}>
            Partners
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'checkins' && styles.tabActive]}
          onPress={() => setActiveTab('checkins')}
        >
          <Ionicons name="chatbubbles" size={20} color={activeTab === 'checkins' ? '#F97316' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'checkins' && styles.tabTextActive]}>
            Check-ins
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'community' && styles.tabActive]}
          onPress={() => setActiveTab('community')}
        >
          <Ionicons name="globe" size={20} color={activeTab === 'community' ? '#F97316' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}>
            Community
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'partners' && renderPartners()}
      {activeTab === 'checkins' && renderCheckIns()}
      {activeTab === 'community' && renderCommunity()}

      {/* Add Partner Modal */}
      <Modal
        visible={showAddPartnerModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddPartnerModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Accountability Partner</Text>
            <TouchableOpacity onPress={addAccountabilityPartner}>
              <Text style={styles.modalSaveText}>Send Invite</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Partner's Email</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter their email address"
                value={newPartnerEmail}
                onChangeText={setNewPartnerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Shared Goals (Optional)</Text>
              <TextInput
                style={styles.modalTextArea}
                placeholder="What goals do you want to work on together?"
                value={newPartnerGoals}
                onChangeText={setNewPartnerGoals}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.modalInfoSection}>
              <Ionicons name="information-circle" size={20} color="#6366F1" />
              <Text style={styles.modalInfoText}>
                Your partner will receive an invitation email and can accept to start your accountability partnership.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
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
    borderBottomColor: '#F97316',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#F97316',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  addPartnerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addPartnerButtonText: {
    fontSize: 16,
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
  partnersContainer: {
    marginBottom: 32,
  },
  partnerCard: {
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
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  partnerType: {
    fontSize: 14,
    color: '#64748B',
  },
  partnerStats: {
    alignItems: 'center',
  },
  alignmentScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  alignmentLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  partnerDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  partnerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  checkInButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  checkInButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  messageButtonText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  benefitsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  upcomingSection: {
    marginBottom: 32,
  },
  checkInCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInInfo: {
    flex: 1,
    marginLeft: 12,
  },
  checkInPartner: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  checkInTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  startCheckInButton: {
    backgroundColor: '#F97316',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  startCheckInButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  checkInGuideSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  checkInSteps: {
    gap: 16,
  },
  checkInStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  recentCheckInsSection: {
    marginBottom: 40,
  },
  checkInHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  checkInHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkInHistoryPartner: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  checkInHistoryDate: {
    fontSize: 14,
    color: '#64748B',
  },
  checkInHistoryDetails: {
    gap: 4,
  },
  checkInHistoryTopics: {
    fontSize: 14,
    color: '#374151',
  },
  checkInHistoryRating: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  communityGroupsContainer: {
    marginBottom: 32,
  },
  communityGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  communityGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  communityGroupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  activityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  veryActiveBadge: {
    backgroundColor: '#DCFCE7',
  },
  activeBadge: {
    backgroundColor: '#FEF3C7',
  },
  moderateBadge: {
    backgroundColor: '#E0E7FF',
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  communityGroupDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  communityGroupStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  communityGroupStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityGroupStatText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  joinGroupButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinGroupButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  challengesSection: {
    marginBottom: 40,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  challengeParticipants: {
    fontSize: 14,
    color: '#64748B',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  challengeProgressBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  challengeProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  joinChallengeButton: {
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  joinChallengeButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalInfoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});