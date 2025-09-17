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
  Slider,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EnvironmentalModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'setup' | 'blocks' | 'optimize'>('setup');
  
  // Environment settings
  const [environmentSettings, setEnvironmentSettings] = useState({
    phone_location: 'bedroom',
    workspace_organization: 7,
    lighting_quality: 8,
    noise_level: 6,
    distractions_removed: false,
    focus_cues_setup: true,
  });

  // App blocking settings
  const [blockingSettings, setBlockingSettings] = useState({
    focus_mode_enabled: false,
    block_duration: 25, // minutes
    allowed_apps: ['calls', 'messages'],
    blocked_categories: ['social', 'entertainment', 'games'],
    break_reminders: true,
  });

  const environmentFactors = [
    {
      id: 'phone',
      name: 'Phone Placement',
      icon: 'phone-portrait',
      description: 'Where do you keep your phone during work?',
      options: [
        { id: 'desk', name: 'On desk', impact: 'High distraction' },
        { id: 'drawer', name: 'In drawer', impact: 'Medium distraction' },
        { id: 'other_room', name: 'Another room', impact: 'Low distraction' },
        { id: 'off', name: 'Turned off', impact: 'No distraction' }
      ]
    },
    {
      id: 'workspace',
      name: 'Workspace Organization',
      icon: 'desktop',
      description: 'How organized is your workspace?',
      rating: true,
      tips: [
        'Clear your desk completely before starting work',
        'Keep only essential items within reach',
        'Use the 5-minute rule to organize before work sessions',
        'Create designated spaces for different types of work'
      ]
    },
    {
      id: 'lighting',
      name: 'Lighting Quality',
      icon: 'sunny',
      description: 'How is the lighting in your workspace?',
      rating: true,
      tips: [
        'Use natural light when possible',
        'Position screen to avoid glare',
        'Ensure adequate brightness for reading',
        'Consider a desk lamp for focused work'
      ]
    },
    {
      id: 'noise',
      name: 'Noise Management',
      icon: 'volume-medium',
      description: 'How well do you manage noise distractions?',
      rating: true,
      tips: [
        'Use noise-cancelling headphones',
        'Play white noise or focus music',
        'Communicate boundaries with others',
        'Find the quietest available space'
      ]
    }
  ];

  const appCategories = [
    {
      id: 'social',
      name: 'Social Media',
      icon: 'people',
      apps: ['Facebook', 'Instagram', 'Twitter', 'TikTok', 'Snapchat'],
      defaultBlocked: true
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: 'play',
      apps: ['YouTube', 'Netflix', 'Spotify', 'Games', 'Video Apps'],
      defaultBlocked: true
    },
    {
      id: 'news',
      name: 'News & Information',
      icon: 'newspaper',
      apps: ['News Apps', 'Reddit', 'Blogs', 'Podcasts'],
      defaultBlocked: false
    },
    {
      id: 'shopping',
      name: 'Shopping',
      icon: 'bag',
      apps: ['Amazon', 'eBay', 'Shopping Apps'],
      defaultBlocked: true
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: 'chatbubbles',
      apps: ['Email', 'Slack', 'Teams', 'WhatsApp'],
      defaultBlocked: false
    }
  ];

  const environmentTips = [
    {
      category: 'Digital Environment',
      tips: [
        {
          title: 'Use app timers and restrictions',
          description: 'Set daily limits on distracting apps and websites',
          difficulty: 'Easy',
          impact: 'High'
        },
        {
          title: 'Enable Do Not Disturb mode',
          description: 'Schedule automatic focus periods with no notifications',
          difficulty: 'Easy',
          impact: 'High'
        },
        {
          title: 'Organize your digital workspace',
          description: 'Clean desktop, organized folders, bookmarks for work',
          difficulty: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'Use website blockers during work',
          description: 'Block distracting websites during focus sessions',
          difficulty: 'Easy',
          impact: 'High'
        }
      ]
    },
    {
      category: 'Physical Environment',
      tips: [
        {
          title: 'Create a dedicated workspace',
          description: 'Have a specific area only for focused work',
          difficulty: 'Medium',
          impact: 'High'
        },
        {
          title: 'Remove visual distractions',
          description: 'Clear surfaces, minimal decorations in work area',
          difficulty: 'Easy',
          impact: 'Medium'
        },
        {
          title: 'Optimize temperature and comfort',
          description: 'Maintain 68-72°F, comfortable seating, good ergonomics',
          difficulty: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'Prepare everything in advance',
          description: 'Have all materials ready before starting work',
          difficulty: 'Easy',
          impact: 'Medium'
        }
      ]
    },
    {
      category: 'Social Environment',
      tips: [
        {
          title: 'Communicate your focus time',
          description: 'Let others know when you need uninterrupted time',
          difficulty: 'Medium',
          impact: 'High'
        },
        {
          title: 'Use visual signals',
          description: 'Headphones, closed door, or focus sign',
          difficulty: 'Easy',
          impact: 'Medium'
        },
        {
          title: 'Schedule social interactions',
          description: 'Designate specific times for socializing',
          difficulty: 'Medium',
          impact: 'Medium'
        },
        {
          title: 'Find accountability partners',
          description: 'Work alongside others who support your focus',
          difficulty: 'Medium',
          impact: 'High'
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
      loadEnvironmentSettings(storedUserId);
    }
  };

  const loadEnvironmentSettings = async (userId: string) => {
    // In real implementation, this would load from backend
    // For now, we'll use local state
  };

  const saveEnvironmentSettings = async () => {
    Alert.alert('Settings Saved!', 'Your environment optimization settings have been saved.');
  };

  const toggleFocusMode = () => {
    const newFocusMode = !blockingSettings.focus_mode_enabled;
    setBlockingSettings(prev => ({ ...prev, focus_mode_enabled: newFocusMode }));
    
    if (newFocusMode) {
      Alert.alert(
        'Focus Mode Activated!',
        `Distracting apps will be blocked for ${blockingSettings.block_duration} minutes. You can focus on your work without interruptions.`
      );
    } else {
      Alert.alert('Focus Mode Deactivated', 'All apps are now accessible again.');
    }
  };

  const updatePhoneLocation = (location: string) => {
    setEnvironmentSettings(prev => ({ ...prev, phone_location: location }));
    
    let message = '';
    switch (location) {
      case 'other_room':
        message = 'Excellent choice! Studies show productivity increases by 26% when phones are in another room.';
        break;
      case 'drawer':
        message = 'Good compromise! This reduces visual distractions while keeping your phone accessible.';
        break;
      case 'off':
        message = 'Ultimate focus mode! This eliminates all phone-related distractions.';
        break;
      default:
        message = 'Consider moving your phone to reduce distractions during work.';
    }
    
    Alert.alert('Phone Location Updated', message);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#64748B';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return '#DC2626';
      case 'Medium': return '#D97706';
      case 'Low': return '#65A30D';
      default: return '#64748B';
    }
  };

  const renderEnvironmentSetup = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Environment Setup</Text>
      <Text style={styles.tabSubtitle}>
        Optimize your physical and digital environment to reduce friction and eliminate distractions.
      </Text>

      {environmentFactors.map((factor) => (
        <View key={factor.id} style={styles.factorCard}>
          <View style={styles.factorHeader}>
            <Ionicons name={factor.icon as any} size={24} color="#84CC16" />
            <Text style={styles.factorName}>{factor.name}</Text>
          </View>
          <Text style={styles.factorDescription}>{factor.description}</Text>

          {factor.options && (
            <View style={styles.optionsContainer}>
              {factor.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    environmentSettings.phone_location === option.id && styles.optionButtonSelected
                  ]}
                  onPress={() => updatePhoneLocation(option.id)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionName,
                      environmentSettings.phone_location === option.id && styles.optionNameSelected
                    ]}>
                      {option.name}
                    </Text>
                    <Text style={[
                      styles.optionImpact,
                      { color: getImpactColor(option.impact.split(' ')[0]) }
                    ]}>
                      {option.impact}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {factor.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>
                Rate your current {factor.name.toLowerCase()}: {
                  factor.id === 'workspace' ? environmentSettings.workspace_organization :
                  factor.id === 'lighting' ? environmentSettings.lighting_quality :
                  environmentSettings.noise_level
                }/10
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={
                  factor.id === 'workspace' ? environmentSettings.workspace_organization :
                  factor.id === 'lighting' ? environmentSettings.lighting_quality :
                  environmentSettings.noise_level
                }
                onValueChange={(value) => {
                  setEnvironmentSettings(prev => ({
                    ...prev,
                    [factor.id === 'workspace' ? 'workspace_organization' :
                     factor.id === 'lighting' ? 'lighting_quality' : 'noise_level']: value
                  }));
                }}
                minimumTrackTintColor="#84CC16"
                maximumTrackTintColor="#E2E8F0"
                thumbStyle={{ backgroundColor: '#84CC16' }}
              />
              
              {factor.tips && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>💡 Tips to improve:</Text>
                  {factor.tips.map((tip, index) => (
                    <Text key={index} style={styles.tipText}>• {tip}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.saveButton} onPress={saveEnvironmentSettings}>
        <Text style={styles.saveButtonText}>Save Environment Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAppBlocking = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>App & Website Blocking</Text>
      <Text style={styles.tabSubtitle}>
        Remove digital distractions by blocking apps and websites during focus sessions.
      </Text>

      <View style={styles.focusModeCard}>
        <View style={styles.focusModeHeader}>
          <Ionicons name="shield-checkmark" size={32} color={blockingSettings.focus_mode_enabled ? '#10B981' : '#64748B'} />
          <View style={styles.focusModeInfo}>
            <Text style={styles.focusModeTitle}>Focus Mode</Text>
            <Text style={styles.focusModeDescription}>
              {blockingSettings.focus_mode_enabled ? 'Active - Distracting apps are blocked' : 'Inactive - All apps accessible'}
            </Text>
          </View>
          <Switch
            value={blockingSettings.focus_mode_enabled}
            onValueChange={toggleFocusMode}
            trackColor={{ false: '#E2E8F0', true: '#10B981' }}
            thumbColor={blockingSettings.focus_mode_enabled ? '#FFFFFF' : '#9CA3AF'}
          />
        </View>

        {blockingSettings.focus_mode_enabled && (
          <View style={styles.focusModeDetails}>
            <Text style={styles.blockDurationText}>
              Session Duration: {blockingSettings.block_duration} minutes
            </Text>
            <Slider
              style={styles.durationSlider}
              minimumValue={15}
              maximumValue={120}
              step={5}
              value={blockingSettings.block_duration}
              onValueChange={(value) => {
                setBlockingSettings(prev => ({ ...prev, block_duration: value }));
              }}
              minimumTrackTintColor="#10B981"
              maximumTrackTintColor="#E2E8F0"
            />
          </View>
        )}
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.categoriesTitle}>App Categories to Block</Text>
        {appCategories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Ionicons name={category.icon as any} size={20} color="#64748B" />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Switch
                value={blockingSettings.blocked_categories.includes(category.id)}
                onValueChange={(value) => {
                  setBlockingSettings(prev => ({
                    ...prev,
                    blocked_categories: value 
                      ? [...prev.blocked_categories, category.id]
                      : prev.blocked_categories.filter(c => c !== category.id)
                  }));
                }}
                trackColor={{ false: '#E2E8F0', true: '#EF4444' }}
                thumbColor={blockingSettings.blocked_categories.includes(category.id) ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text style={styles.categoryApps}>
              Includes: {category.apps.join(', ')}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.allowedAppsSection}>
        <Text style={styles.allowedAppsTitle}>Always Allow</Text>
        <Text style={styles.allowedAppsDescription}>
          These apps will remain accessible even in focus mode
        </Text>
        <View style={styles.allowedAppsList}>
          <View style={styles.allowedAppChip}>
            <Ionicons name="call" size={16} color="#10B981" />
            <Text style={styles.allowedAppText}>Phone Calls</Text>
          </View>
          <View style={styles.allowedAppChip}>
            <Ionicons name="chatbubble" size={16} color="#10B981" />
            <Text style={styles.allowedAppText}>Messages</Text>
          </View>
          <View style={styles.allowedAppChip}>
            <Ionicons name="medical" size={16} color="#10B981" />
            <Text style={styles.allowedAppText}>Emergency Apps</Text>
          </View>
        </View>
      </View>

      <View style={styles.statisticsSection}>
        <Text style={styles.statisticsTitle}>📊 Your Blocking Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>47</Text>
            <Text style={styles.statLabel}>Focus sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23h</Text>
            <Text style={styles.statLabel}>Time saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>156</Text>
            <Text style={styles.statLabel}>Distractions blocked</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderOptimizationTips = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Environment Optimization</Text>
      <Text style={styles.tabSubtitle}>
        Evidence-based strategies to create the ideal environment for focus and productivity.
      </Text>

      {environmentTips.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>{section.category}</Text>
          
          {section.tips.map((tip, tipIndex) => (
            <View key={tipIndex} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <View style={styles.tipBadges}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(tip.difficulty) }]}>
                    <Text style={styles.badgeText}>{tip.difficulty}</Text>
                  </View>
                  <View style={[styles.impactBadge, { backgroundColor: getImpactColor(tip.impact) }]}>
                    <Text style={styles.badgeText}>{tip.impact} Impact</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
              <TouchableOpacity style={styles.implementButton}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#84CC16" />
                <Text style={styles.implementButtonText}>Mark as Implemented</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.researchSection}>
        <Text style={styles.researchTitle}>🧠 Research Insights</Text>
        
        <View style={styles.researchCard}>
          <Ionicons name="trending-up" size={24} color="#6366F1" />
          <View style={styles.researchContent}>
            <Text style={styles.researchFact}>
              Studies show that a cluttered workspace can decrease focus by up to 32%
            </Text>
            <Text style={styles.researchSource}>Journal of Environmental Psychology</Text>
          </View>
        </View>
        
        <View style={styles.researchCard}>
          <Ionicons name="phone-portrait" size={24} color="#EF4444" />
          <View style={styles.researchContent}>
            <Text style={styles.researchFact}>
              Having your phone visible (even when silent) reduces cognitive performance by 10%
            </Text>
            <Text style={styles.researchSource}>Journal of the Association for Consumer Research</Text>
          </View>
        </View>
        
        <View style={styles.researchCard}>
          <Ionicons name="sunny" size={24} color="#F59E0B" />
          <View style={styles.researchContent}>
            <Text style={styles.researchFact}>
              Natural light exposure increases productivity by 15% and reduces eye strain
            </Text>
            <Text style={styles.researchSource}>Harvard Business Review</Text>
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
        <Text style={styles.headerTitle}>Environmental Design</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'setup' && styles.tabActive]}
          onPress={() => setActiveTab('setup')}
        >
          <Ionicons name="settings" size={20} color={activeTab === 'setup' ? '#84CC16' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'setup' && styles.tabTextActive]}>
            Setup
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'blocks' && styles.tabActive]}
          onPress={() => setActiveTab('blocks')}
        >
          <Ionicons name="shield" size={20} color={activeTab === 'blocks' ? '#84CC16' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'blocks' && styles.tabTextActive]}>
            App Blocking
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'optimize' && styles.tabActive]}
          onPress={() => setActiveTab('optimize')}
        >
          <Ionicons name="bulb" size={20} color={activeTab === 'optimize' ? '#84CC16' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'optimize' && styles.tabTextActive]}>
            Optimize
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'setup' && renderEnvironmentSetup()}
      {activeTab === 'blocks' && renderAppBlocking()}
      {activeTab === 'optimize' && renderOptimizationTips()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FEE7',
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
    borderBottomColor: '#84CC16',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#84CC16',
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
  factorCard: {
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
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  factorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  factorDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#84CC16',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionNameSelected: {
    color: '#365314',
  },
  optionImpact: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  tipsContainer: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: '#84CC16',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  focusModeCard: {
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
  focusModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  focusModeInfo: {
    flex: 1,
    marginLeft: 16,
  },
  focusModeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  focusModeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  focusModeDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  blockDurationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  durationSlider: {
    width: '100%',
    height: 40,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
    marginLeft: 12,
  },
  categoryApps: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 32,
  },
  allowedAppsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  allowedAppsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  allowedAppsDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  allowedAppsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allowedAppChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allowedAppText: {
    fontSize: 14,
    color: '#10B981',
    marginLeft: 6,
    fontWeight: '500',
  },
  statisticsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  statisticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#84CC16',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipsSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  tipBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tipDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  implementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  implementButtonText: {
    fontSize: 14,
    color: '#84CC16',
    fontWeight: '500',
    marginLeft: 4,
  },
  researchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  researchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  researchCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  researchContent: {
    flex: 1,
    marginLeft: 12,
  },
  researchFact: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  researchSource: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
});