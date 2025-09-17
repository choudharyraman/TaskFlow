import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Import UI Components
import { Card, Typography, Button } from '../src/components/ui';
import DesignSystem from '../src/styles/designSystem';

// Import all the module components
import CBTModule from './cbt';
import MindfulnessModule from './mindfulness';
import PomodoroModule from './pomodoro';
import FiveMinuteModule from './five-minute';
import ActivityModule from './activity';
import AnalyticsModule from './analytics';
import IntentionsModule from './intentions';
import SleepModule from './sleep';
import SelfCompassionModule from './self-compassion';
import SocialModule from './social';
import EnvironmentalModule from './environmental';
import GamificationModule from './gamification';
import IntegrationsModule from './integrations';
import ResearchModule from './research';

// Types
interface DashboardData {
  user_progress: {
    total_points: number;
    level: number;
    current_streak: number;
  };
  recent_pomodoros: Array<{
    task_name: string;
    productivity_score: number;
    timestamp: string;
  }>;
  recent_achievements: Array<{
    title: string;
    points_earned: number;
  }>;
  recent_activities: Array<{
    title: string;
    module: string;
    timestamp: string;
    points?: number;
  }>;
  ai_insights?: string;
}

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userId, setUserId] = useState<string>('demo-user');
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper functions
  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const getModuleColor = (module: string): string => {
    const moduleColors: { [key: string]: string } = {
      cbt: DesignSystem.Colors.modules.cbt,
      mindfulness: DesignSystem.Colors.modules.mindfulness,
      pomodoro: DesignSystem.Colors.modules.pomodoro,
      'five-minute': DesignSystem.Colors.modules.fiveMinute,
      activity: DesignSystem.Colors.modules.activity,
      sleep: DesignSystem.Colors.modules.sleep,
      social: DesignSystem.Colors.modules.social,
      analytics: DesignSystem.Colors.modules.analytics,
      environmental: DesignSystem.Colors.modules.environmental,
      'self-compassion': DesignSystem.Colors.modules.selfCompassion,
      gamification: DesignSystem.Colors.modules.gamification,
      integrations: DesignSystem.Colors.modules.integrations,
      research: DesignSystem.Colors.modules.research,
    };
    return moduleColors[module] || DesignSystem.Colors.primary[500];
  };

  const getModuleIcon = (module: string): any => {
    const moduleIcons: { [key: string]: any } = {
      cbt: 'brain',
      mindfulness: 'leaf',
      pomodoro: 'timer',
      'five-minute': 'play',
      activity: 'fitness',
      sleep: 'moon',
      social: 'people',
      analytics: 'analytics',
      environmental: 'leaf',
      'self-compassion': 'heart',
      gamification: 'trophy',
      integrations: 'link',
      research: 'flask',
    };
    return moduleIcons[module] || 'checkmark-circle';
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Module configurations
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: 'home', color: '#6366F1' },
    { id: 'cbt', name: 'CBT Tools', icon: 'brain', color: '#10B981' },
    { id: 'mindfulness', name: 'Mindfulness', icon: 'leaf', color: '#8B5CF6' },
    { id: 'pomodoro', name: 'Focus Timer', icon: 'timer', color: '#F59E0B' },
    { id: 'intentions', name: 'If-Then Plans', icon: 'list', color: '#EF4444' },
    { id: 'five-minute', name: '5-Min Rule', icon: 'play', color: '#06B6D4' },
    { id: 'activity', name: 'Movement', icon: 'fitness', color: '#84CC16' },
    { id: 'sleep', name: 'Sleep', icon: 'moon', color: '#6366F1' },
    { id: 'social', name: 'Accountability', icon: 'people', color: '#F97316' },
    { id: 'analytics', name: 'AI Insights', icon: 'analytics', color: '#EC4899' },
    { id: 'environmental', name: 'Environment', icon: 'leaf', color: '#84CC16' },
    { id: 'self-compassion', name: 'Self-Care', icon: 'heart', color: '#EC4899' },
    { id: 'gamification', name: 'Achievements', icon: 'trophy', color: '#F59E0B' },
    { id: 'integrations', name: 'Integrations', icon: 'link', color: '#6366F1' },
    { id: 'research', name: 'Research', icon: 'flask', color: '#8B5CF6' },
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // For testing purposes, use demo data immediately
      setUserId('demo-user-testing');
      await loadDashboardData('demo-user-testing');
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Using offline mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardData = async (userId: string) => {
    try {
      // For testing, skip API call and use mock data directly
      console.log('Loading dashboard data for user:', userId);
      
      // Set mock data immediately
      setDashboardData({
        user_progress: {
          total_points: 150,
          level: 2,
          current_streak: 3,
        },
        recent_pomodoros: [
          {
            task_name: 'Complete project proposal',
            productivity_score: 8.5,
            timestamp: new Date().toISOString(),
          },
        ],
        recent_achievements: [
          {
            title: 'First Week Complete',
            points_earned: 50,
          },
        ],
        recent_activities: [
          {
            title: 'Completed 25-minute focus session',
            module: 'pomodoro',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            points: 25,
          },
          {
            title: 'Finished mindfulness meditation',
            module: 'mindfulness',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            points: 15,
          },
          {
            title: 'Created thought record',
            module: 'cbt',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            points: 20,
          },
        ],
        ai_insights: 'Based on your recent activity, you show strong consistency in morning focus sessions. Consider scheduling more challenging tasks during your peak productivity hours between 9-11 AM.',
      });
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Fallback to empty state
      setDashboardData({
        user_progress: {
          total_points: 0,
          level: 1,
          current_streak: 0,
        },
        recent_pomodoros: [],
        recent_achievements: [],
        recent_activities: [],
      });
    }
  };

  const handleModulePress = (moduleId: string) => {
    setActiveModule(moduleId);
    
    if (moduleId === 'dashboard') {
      loadDashboardData(userId);
      return;
    }
  };

  const startQuickPomodoro = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/pomodoro/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          task_name: 'Quick Focus Session',
          work_duration: 25,
          break_duration: 5,
          focus_quality_ratings: [8],
          distractions: [],
          break_activities: [],
          completion_status: 'planned',
          productivity_score: 0,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Pomodoro session started! Focus for 25 minutes.');
      }
    } catch (error) {
      console.error('Pomodoro start error:', error);
      Alert.alert('Info', 'Pomodoro timer would start now (demo mode)');
    }
  };

  const renderDashboard = () => {
    // Show loading state if data is not yet loaded
    if (isLoading || !dashboardData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your dashboard...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.content} 
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Typography variant="h1" style={styles.appTitle}>
              Anti-Procrastination App
            </Typography>
            <Typography variant="body2" color="secondary" style={styles.appSubtitle}>
              Science-Based Productivity
            </Typography>
          </View>
        </View>

        {/* Progress Overview Cards */}
        <View style={styles.progressSection}>
          <Card variant="elevated" padding="md" style={styles.progressCard}>
            <View style={styles.progressOverview}>
              <View style={styles.progressItem}>
                <View style={[styles.progressIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <Typography variant="h3" style={styles.progressValue}>
                  {dashboardData?.user_progress?.total_points || 0}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Points
                </Typography>
              </View>
              
              <View style={styles.progressItem}>
                <View style={[styles.progressIcon, { backgroundColor: '#EEF2FF' }]}>
                  <Ionicons name="trending-up" size={24} color="#6366F1" />
                </View>
                <Typography variant="h3" style={styles.progressValue}>
                  {dashboardData?.user_progress?.level || 1}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Level
                </Typography>
              </View>
              
              <View style={styles.progressItem}>
                <View style={[styles.progressIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="flame" size={24} color="#EF4444" />
                </View>
                <Typography variant="h3" style={styles.progressValue}>
                  {dashboardData?.user_progress?.current_streak || 0}
                </Typography>
                <Typography variant="caption" color="secondary">
                  Day Streak
                </Typography>
              </View>
            </View>
          </Card>
        </View>

        {/* Quick Start Actions */}
        <View style={styles.quickStartSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Quick Start
          </Typography>
          <View style={styles.quickActions}>
            <Button
              title="25-Min Focus"
              icon="timer"
              variant="primary"
              size="lg"
              style={[styles.quickActionButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => setActiveModule('pomodoro')}
            />
            <Button
              title="5-Min Meditation"
              icon="leaf"
              variant="primary"
              size="lg"
              style={[styles.quickActionButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => setActiveModule('mindfulness')}
            />
            <Button
              title="Just 5 Minutes"
              icon="play"
              variant="primary"
              size="lg"
              style={[styles.quickActionButton, { backgroundColor: '#06B6D4' }]}
              onPress={() => setActiveModule('five-minute')}
            />
            <Button
              title="Thought Record"
              icon="create"
              variant="primary"
              size="lg"
              style={[styles.quickActionButton, { backgroundColor: '#10B981' }]}
              onPress={() => setActiveModule('cbt')}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Recent Activity
            </Typography>
            <Button
              title="View All"
              variant="ghost"
              size="sm"
              onPress={() => setActiveModule('analytics')}
            />
          </View>
          
          <Card padding="sm" style={styles.activityCard}>
            {dashboardData?.recent_activities?.length > 0 ? (
              dashboardData.recent_activities.slice(0, 3).map((activity: any, index: number) => (
                <View key={index} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: getModuleColor(activity.module) + '20' }]}>
                    <Ionicons
                      name={getModuleIcon(activity.module)}
                      size={16}
                      color={getModuleColor(activity.module)}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Typography variant="body2" weight="medium">
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {formatTimeAgo(activity.timestamp)} • {activity.module}
                    </Typography>
                  </View>
                  {activity.points && (
                    <Typography variant="caption" style={styles.activityPoints}>
                      +{activity.points}
                    </Typography>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#9CA3AF" />
                <Typography variant="body1" color="secondary" style={styles.emptyActivityText}>
                  Start your productivity journey!
                </Typography>
                <Typography variant="caption" color="secondary">
                  Complete your first activity to see progress here
                </Typography>
              </View>
            )}
          </Card>
        </View>

        {/* Insights Preview */}
        {dashboardData?.ai_insights && (
          <View style={styles.insightsSection}>
            <Typography variant="h3" style={styles.sectionTitle}>
              AI Insights
            </Typography>
            <Card padding="md" style={styles.insightsCard}>
              <View style={styles.insightsHeader}>
                <Ionicons name="bulb" size={20} color="#06B6D4" />
                <Typography variant="body2" weight="medium" style={styles.insightsTitle}>
                  Personal Productivity Insights
                </Typography>
              </View>
              <Typography variant="body2" numberOfLines={3} style={styles.insightsText}>
                {dashboardData.ai_insights.substring(0, 150)}...
              </Typography>
              <Button
                title="View Full Analysis"
                variant="outline"
                size="sm"
                style={styles.insightsButton}
                onPress={() => setActiveModule('analytics')}
              />
            </Card>
          </View>
        )}

        {/* Bottom spacing for navigation */}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your productivity tools...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {activeModule !== 'dashboard' && (
          <TouchableOpacity onPress={() => setActiveModule('dashboard')}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {activeModule === 'dashboard' ? 'Anti-Procrastination App' : 
             modules.find(m => m.id === activeModule)?.name || 'Module'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeModule === 'dashboard' ? 'Science-Based Productivity' : 
             'Tap back arrow to return to dashboard'}
          </Text>
        </View>
        {activeModule === 'dashboard' && <View style={{ width: 24 }} />}
      </View>

      {/* Content */}
      {activeModule === 'dashboard' && renderDashboard()}
      {activeModule === 'cbt' && <CBTModule />}
      {activeModule === 'mindfulness' && <MindfulnessModule />}
      {activeModule === 'pomodoro' && <PomodoroModule />}
      {activeModule === 'five-minute' && <FiveMinuteModule />}
      {activeModule === 'activity' && <ActivityModule />}
      {activeModule === 'analytics' && <AnalyticsModule />}
      {activeModule === 'intentions' && <IntentionsModule />}
      {activeModule === 'sleep' && <SleepModule />}
      {activeModule === 'self-compassion' && <SelfCompassionModule />}
      {activeModule === 'social' && <SocialModule />}
      {activeModule === 'environmental' && <EnvironmentalModule />}
      {activeModule === 'gamification' && <GamificationModule />}
      {activeModule === 'integrations' && <IntegrationsModule />}
      {activeModule === 'research' && <ResearchModule />}
      {!['dashboard', 'cbt', 'mindfulness', 'pomodoro', 'five-minute', 'activity', 'analytics', 'intentions', 'sleep', 'self-compassion', 'social', 'environmental', 'gamification', 'integrations', 'research'].includes(activeModule) && (
        <View style={styles.content}>
          <Text style={styles.comingSoonText}>Module under development</Text>
        </View>
      )}

      {/* Bottom Navigation - Scrollable */}
      <View style={styles.bottomNav}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
          style={styles.navScrollView}
        >
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.navItem,
                activeModule === module.id && { ...styles.navItemActive, borderTopColor: module.color }
              ]}
              onPress={() => setActiveModule(module.id as any)}
            >
              <Ionicons
                name={module.icon as any}
                size={20}
                color={activeModule === module.id ? module.color : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.navText,
                  activeModule === module.id && { color: module.color }
                ]}
                numberOfLines={1}
              >
                {module.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
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
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  achievementContent: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  achievementPoints: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 100,
  },
  bottomNav: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
  },
  navScroll: {
    paddingHorizontal: 8,
  },
  navScrollView: {
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  navItemActive: {
    borderTopWidth: 3,
  },
  navText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  // New styles for updated dashboard
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
  },
  quickStartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    marginBottom: 12,
  },
  activitySection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityPoints: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyActivityText: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
  },
  insightsSection: {
    marginBottom: 20,
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  insightsText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightsButton: {
    alignSelf: 'flex-start',
  },
});