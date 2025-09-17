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
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

interface Achievement {
  id: string;
  title: string;
  description: string;
  points_earned: number;
  category: string;
  rarity: string;
  unlock_date: string;
}

interface UserProgress {
  total_points: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  modules_unlocked: string[];
  skill_levels: { [key: string]: number };
}

export default function GamificationModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'achievements' | 'levels' | 'leaderboard'>('achievements');
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sample achievement categories with icons and colors
  const achievementCategories = {
    'productivity': { icon: 'timer', color: '#F59E0B', name: 'Productivity' },
    'mindfulness': { icon: 'leaf', color: '#8B5CF6', name: 'Mindfulness' },
    'consistency': { icon: 'calendar', color: '#10B981', name: 'Consistency' },
    'growth': { icon: 'trending-up', color: '#EC4899', name: 'Personal Growth' },
    'social': { icon: 'people', color: '#F97316', name: 'Social' },
    'milestone': { icon: 'trophy', color: '#EF4444', name: 'Milestones' },
  };

  const rarityColors = {
    'common': '#9CA3AF',
    'rare': '#3B82F6',
    'epic': '#8B5CF6',
    'legendary': '#F59E0B',
  };

  const skillAreas = [
    { id: 'focus', name: 'Focus & Concentration', icon: 'eye', color: '#F59E0B' },
    { id: 'emotional_regulation', name: 'Emotional Regulation', icon: 'heart', color: '#EC4899' },
    { id: 'mindfulness', name: 'Mindfulness', icon: 'leaf', color: '#10B981' },
    { id: 'task_management', name: 'Task Management', icon: 'list', color: '#6366F1' },
    { id: 'self_compassion', name: 'Self-Compassion', icon: 'shield', color: '#8B5CF6' },
    { id: 'habit_formation', name: 'Habit Formation', icon: 'refresh', color: '#06B6D4' },
  ];

  // Sample leaderboard data
  const leaderboardData = [
    { rank: 1, username: 'FocusedMind', points: 2450, level: 12, streak: 28 },
    { rank: 2, username: 'ZenWarrior', points: 2180, level: 11, streak: 21 },
    { rank: 3, username: 'ProductivityPro', points: 1920, level: 10, streak: 15 },
    { rank: 4, username: 'MindfulJourney', points: 1750, level: 9, streak: 12 },
    { rank: 5, username: 'You', points: 1520, level: 8, streak: 7 },
    { rank: 6, username: 'GrowthSeeker', points: 1340, level: 8, streak: 9 },
    { rank: 7, username: 'FlowState', points: 1180, level: 7, streak: 5 },
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      await loadGamificationData(storedUserId);
    }
    setIsLoading(false);
  };

  const loadGamificationData = async (userId: string) => {
    try {
      // Load user progress
      const progressResponse = await fetch(`${BACKEND_URL}/api/gamification/progress/${userId}`);
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setUserProgress(progressData);
      }

      // Load achievements
      const achievementsResponse = await fetch(`${BACKEND_URL}/api/gamification/achievements/${userId}`);
      if (achievementsResponse.ok) {
        const achievementsData = await achievementsResponse.json();
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Gamification data loading error:', error);
      // Set demo data
      setUserProgress({
        total_points: 1520,
        level: 8,
        current_streak: 7,
        longest_streak: 15,
        modules_unlocked: ['cbt', 'mindfulness', 'pomodoro', 'five-minute', 'activity'],
        skill_levels: {
          focus: 4,
          emotional_regulation: 3,
          mindfulness: 5,
          task_management: 3,
          self_compassion: 2,
          habit_formation: 4,
        }
      });

      setAchievements([
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first CBT thought record',
          points_earned: 50,
          category: 'productivity',
          rarity: 'common',
          unlock_date: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Mindful Beginner',
          description: 'Complete 5 mindfulness sessions',
          points_earned: 100,
          category: 'mindfulness',
          rarity: 'rare',
          unlock_date: '2024-01-18T14:20:00Z'
        },
        {
          id: '3',
          title: 'Consistency Champion',
          description: 'Maintain a 7-day streak',
          points_earned: 200,
          category: 'consistency',
          rarity: 'epic',
          unlock_date: '2024-01-22T09:15:00Z'
        },
        {
          id: '4',
          title: 'Focus Master',
          description: 'Complete 25 Pomodoro sessions',
          points_earned: 300,
          category: 'productivity',
          rarity: 'epic',
          unlock_date: '2024-01-25T16:45:00Z'
        }
      ]);
    }
  };

  const calculateLevelProgress = () => {
    if (!userProgress) return 0;
    const pointsForCurrentLevel = userProgress.level * 200; // 200 points per level
    const pointsForNextLevel = (userProgress.level + 1) * 200;
    const currentLevelProgress = userProgress.total_points - pointsForCurrentLevel;
    const levelRange = pointsForNextLevel - pointsForCurrentLevel;
    return Math.max(0, Math.min(1, currentLevelProgress / levelRange));
  };

  const getAchievementIcon = (category: string) => {
    return achievementCategories[category as keyof typeof achievementCategories]?.icon || 'trophy';
  };

  const getAchievementColor = (category: string) => {
    return achievementCategories[category as keyof typeof achievementCategories]?.color || '#64748B';
  };

  const getRarityColor = (rarity: string) => {
    return rarityColors[rarity as keyof typeof rarityColors] || '#64748B';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderAchievements = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsOverview}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Achievements Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{achievements.reduce((sum, a) => sum + a.points_earned, 0)}</Text>
          <Text style={styles.statLabel}>Achievement Points</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Achievements</Text>
      
      {achievements.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="trophy" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>No achievements yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Keep using the app to unlock your first achievements!
          </Text>
        </View>
      ) : (
        achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Ionicons 
                name={getAchievementIcon(achievement.category) as any} 
                size={24} 
                color={getAchievementColor(achievement.category)} 
              />
            </View>
            <View style={styles.achievementContent}>
              <View style={styles.achievementHeader}>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(achievement.rarity) }]}>
                  <Text style={styles.rarityText}>{achievement.rarity.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <View style={styles.achievementFooter}>
                <Text style={styles.achievementPoints}>+{achievement.points_earned} pts</Text>
                <Text style={styles.achievementDate}>{formatDate(achievement.unlock_date)}</Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Achievement Categories</Text>
        <View style={styles.categoriesGrid}>
          {Object.entries(achievementCategories).map(([key, category]) => {
            const categoryAchievements = achievements.filter(a => a.category === key);
            return (
              <View key={key} style={styles.categoryCard}>
                <Ionicons name={category.icon as any} size={24} color={category.color} />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{categoryAchievements.length} unlocked</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderLevels = () => (
    <ScrollView style={styles.tabContent}>
      {userProgress && (
        <>
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.currentLevel}>Level {userProgress.level}</Text>
              <Text style={styles.totalPoints}>{userProgress.total_points} points</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${calculateLevelProgress() * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(calculateLevelProgress() * 100)}% to Level {userProgress.level + 1}
              </Text>
            </View>
          </View>

          <View style={styles.streakSection}>
            <View style={styles.streakCard}>
              <Ionicons name="flame" size={32} color="#F97316" />
              <View style={styles.streakContent}>
                <Text style={styles.streakValue}>{userProgress.current_streak}</Text>
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
            <View style={styles.streakCard}>
              <Ionicons name="star" size={32} color="#EF4444" />
              <View style={styles.streakContent}>
                <Text style={styles.streakValue}>{userProgress.longest_streak}</Text>
                <Text style={styles.streakLabel}>Best Streak</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Skill Development</Text>
          <View style={styles.skillsGrid}>
            {skillAreas.map((skill) => {
              const skillLevel = userProgress.skill_levels[skill.id] || 0;
              return (
                <View key={skill.id} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Ionicons name={skill.icon as any} size={20} color={skill.color} />
                    <Text style={styles.skillName}>{skill.name}</Text>
                  </View>
                  <View style={styles.skillProgressContainer}>
                    <View style={styles.skillProgressBar}>
                      <View 
                        style={[
                          styles.skillProgress, 
                          { 
                            width: `${(skillLevel / 5) * 100}%`,
                            backgroundColor: skill.color 
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.skillLevel}>Level {skillLevel}/5</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.unlockedModulesSection}>
            <Text style={styles.sectionTitle}>Unlocked Modules</Text>
            <View style={styles.modulesGrid}>
              {userProgress.modules_unlocked.map((moduleId) => (
                <View key={moduleId} style={styles.moduleChip}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.moduleChipText}>{moduleId.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderLeaderboard = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Global Leaderboard</Text>
      <Text style={styles.sectionSubtitle}>See how you rank against other users</Text>
      
      {leaderboardData.map((user, index) => (
        <View 
          key={user.rank} 
          style={[
            styles.leaderboardItem,
            user.username === 'You' && styles.leaderboardItemUser
          ]}
        >
          <View style={styles.leaderboardRank}>
            {user.rank <= 3 ? (
              <Ionicons 
                name={user.rank === 1 ? 'trophy' : user.rank === 2 ? 'medal' : 'ribbon'} 
                size={24} 
                color={user.rank === 1 ? '#F59E0B' : user.rank === 2 ? '#64748B' : '#CD7F32'} 
              />
            ) : (
              <Text style={styles.rankNumber}>#{user.rank}</Text>
            )}
          </View>
          
          <View style={styles.leaderboardContent}>
            <View style={styles.leaderboardHeader}>
              <Text style={[
                styles.leaderboardUsername,
                user.username === 'You' && styles.leaderboardUsernameUser
              ]}>
                {user.username}
              </Text>
              <Text style={styles.leaderboardLevel}>Level {user.level}</Text>
            </View>
            <View style={styles.leaderboardStats}>
              <Text style={styles.leaderboardPoints}>{user.points} points</Text>
              <View style={styles.leaderboardStreak}>
                <Ionicons name="flame" size={14} color="#F97316" />
                <Text style={styles.leaderboardStreakText}>{user.streak} day streak</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.leaderboardFooter}>
        <Text style={styles.leaderboardFooterText}>
          Keep completing activities to climb the leaderboard!
        </Text>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gamification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons name="trophy" size={20} color={activeTab === 'achievements' ? '#F59E0B' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>
            Achievements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'levels' && styles.tabActive]}
          onPress={() => setActiveTab('levels')}
        >
          <Ionicons name="trending-up" size={20} color={activeTab === 'levels' ? '#F59E0B' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'levels' && styles.tabTextActive]}>
            Progress
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
          onPress={() => setActiveTab('leaderboard')}
        >
          <Ionicons name="podium" size={20} color={activeTab === 'leaderboard' ? '#F59E0B' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
            Leaderboard
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'achievements' && renderAchievements()}
      {activeTab === 'levels' && renderLevels()}
      {activeTab === 'leaderboard' && renderLeaderboard()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF7E0',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
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
    borderBottomColor: '#F59E0B',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 8,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#F59E0B',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  statsOverview: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
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
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF7E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rarityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  achievementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementPoints: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  achievementDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoriesSection: {
    marginTop: 32,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  levelCard: {
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
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  totalPoints: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  streakSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  streakCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  streakContent: {
    marginLeft: 12,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  streakLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  skillsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  skillCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
    flex: 1,
  },
  skillProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillProgress: {
    height: '100%',
  },
  skillLevel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  unlockedModulesSection: {
    marginTop: 8,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  moduleChipText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  leaderboardItemUser: {
    backgroundColor: '#FEF7E0',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  leaderboardRank: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748B',
  },
  leaderboardContent: {
    flex: 1,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leaderboardUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  leaderboardUsernameUser: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  leaderboardLevel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  leaderboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardPoints: {
    fontSize: 14,
    color: '#64748B',
  },
  leaderboardStreak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardStreakText: {
    fontSize: 12,
    color: '#F97316',
    marginLeft: 4,
    fontWeight: '500',
  },
  leaderboardFooter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  leaderboardFooterText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});