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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  connected: boolean;
  features: string[];
  setupSteps: string[];
}

export default function IntegrationsModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'available' | 'connected' | 'settings'>('available');
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  const availableIntegrations: Integration[] = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your focus sessions and schedule productivity blocks',
      icon: 'calendar',
      color: '#4285F4',
      category: 'productivity',
      connected: false,
      features: [
        'Automatic focus session scheduling',
        'Pomodoro blocks in calendar',
        'Meeting-free productivity time',
        'Weekly productivity reports'
      ],
      setupSteps: [
        'Click "Connect" to authorize access',
        'Choose which calendar to sync with',
        'Configure automatic scheduling preferences',
        'Start scheduling focus sessions'
      ]
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Track physical activity and correlate with productivity',
      icon: 'fitness',
      color: '#FF3B30',
      category: 'health',
      connected: true,
      features: [
        'Activity level correlation',
        'Heart rate during focus sessions',
        'Sleep quality integration',
        'Movement reminders'
      ],
      setupSteps: [
        'Enable Health app permissions',
        'Select data types to sync',
        'Configure privacy settings',
        'View health correlations'
      ]
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Export thought records and create productivity dashboards',
      icon: 'document-text',
      color: '#000000',
      category: 'productivity',
      connected: false,
      features: [
        'Automatic thought record export',
        'Weekly productivity summaries',
        'Goal tracking integration',
        'Custom dashboard templates'
      ],
      setupSteps: [
        'Connect your Notion workspace',
        'Choose database templates',
        'Configure automatic exports',
        'Customize dashboard views'
      ]
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Curated focus playlists and mood-based music selection',
      icon: 'musical-notes',
      color: '#1DB954',
      category: 'wellness',
      connected: false,
      features: [
        'Focus music recommendations',
        'Mood-based playlists',
        'Session soundtrack creation',
        'Productivity music insights'
      ],
      setupSteps: [
        'Link your Spotify account',
        'Allow playlist creation',
        'Set music preferences',
        'Enjoy focus soundtracks'
      ]
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Focus mode status updates and accountability reminders',
      icon: 'chatbubbles',
      color: '#4A154B',
      category: 'communication',
      connected: false,
      features: [
        'Automatic focus status updates',
        'Accountability partner notifications',
        'Progress sharing in channels',
        'Team productivity insights'
      ],
      setupSteps: [
        'Install FocusFirst Slack app',
        'Authorize workspace access',
        'Configure status preferences',
        'Set up team accountability'
      ]
    },
    {
      id: 'todoist',
      name: 'Todoist',
      description: 'Smart task prioritization and procrastination insights',
      icon: 'checkmark-circle',
      color: '#E44332',
      category: 'productivity',
      connected: false,
      features: [
        'Smart task scheduling',
        'Procrastination pattern analysis',
        'Automatic priority adjustment',
        'Implementation intention creation'
      ],
      setupSteps: [
        'Connect your Todoist account',
        'Select projects to sync',
        'Configure priority algorithms',
        'Start smart scheduling'
      ]
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      description: 'Activity tracking and stress correlation analysis',
      icon: 'watch',
      color: '#00B0B9',
      category: 'health',
      connected: false,
      features: [
        'Stress level monitoring',
        'Activity-productivity correlation',
        'Sleep quality analysis',
        'Heart rate variability insights'
      ],
      setupSteps: [
        'Link your Fitbit account',
        'Enable data sharing',
        'Configure tracking preferences',
        'View health correlations'
      ]
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Visual productivity tracking and goal management',
      icon: 'grid',
      color: '#0079BF',
      category: 'productivity',
      connected: false,
      features: [
        'Visual progress tracking',
        'Goal breakdown automation',
        'Productivity board templates',
        'Team collaboration features'
      ],
      setupSteps: [
        'Connect your Trello account',
        'Choose boards to sync',
        'Install productivity templates',
        'Configure automation rules'
      ]
    }
  ];

  const integrationCategories = {
    'productivity': { name: 'Productivity', icon: 'briefcase', color: '#6366F1' },
    'health': { name: 'Health & Fitness', icon: 'fitness', color: '#10B981' },
    'communication': { name: 'Communication', icon: 'chatbubbles', color: '#F97316' },
    'wellness': { name: 'Wellness', icon: 'heart', color: '#EC4899' },
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setIntegrations(availableIntegrations);
    }
  };

  const handleConnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (integration.connected) {
      Alert.alert(
        'Disconnect Integration',
        `Are you sure you want to disconnect ${integration.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => {
              setIntegrations(prev => 
                prev.map(i => 
                  i.id === integrationId ? { ...i, connected: false } : i
                )
              );
              Alert.alert('Disconnected', `${integration.name} has been disconnected.`);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Connect Integration',
        `Connect ${integration.name}? You'll be redirected to authorize access.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => {
              // In a real app, this would open the OAuth flow
              setIntegrations(prev => 
                prev.map(i => 
                  i.id === integrationId ? { ...i, connected: true } : i
                )
              );
              Alert.alert('Connected!', `${integration.name} has been connected successfully.`);
            }
          }
        ]
      );
    }
  };

  const openIntegrationSetup = (integration: Integration) => {
    Alert.alert(
      `${integration.name} Setup`,
      integration.setupSteps.map((step, index) => `${index + 1}. ${step}`).join('\n\n'),
      [{ text: 'Got it!' }]
    );
  };

  const renderIntegrationCard = (integration: Integration) => (
    <View key={integration.id} style={styles.integrationCard}>
      <View style={styles.integrationHeader}>
        <View style={[styles.integrationIcon, { backgroundColor: `${integration.color}15` }]}>
          <Ionicons name={integration.icon as any} size={24} color={integration.color} />
        </View>
        <View style={styles.integrationInfo}>
          <View style={styles.integrationTitleRow}>
            <Text style={styles.integrationName}>{integration.name}</Text>
            {integration.connected && (
              <View style={styles.connectedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.connectedText}>Connected</Text>
              </View>
            )}
          </View>
          <Text style={styles.integrationDescription}>{integration.description}</Text>
        </View>
      </View>

      <View style={styles.integrationFeatures}>
        <Text style={styles.featuresTitle}>Features:</Text>
        {integration.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={16} color={integration.color} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {integration.features.length > 3 && (
          <Text style={styles.moreFeatures}>+{integration.features.length - 3} more features</Text>
        )}
      </View>

      <View style={styles.integrationActions}>
        <TouchableOpacity
          style={styles.setupButton}
          onPress={() => openIntegrationSetup(integration)}
        >
          <Ionicons name="information-circle" size={16} color="#64748B" />
          <Text style={styles.setupButtonText}>Setup Guide</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.connectButton,
            integration.connected && styles.disconnectButton
          ]}
          onPress={() => handleConnect(integration.id)}
        >
          <Text style={[
            styles.connectButtonText,
            integration.connected && styles.disconnectButtonText
          ]}>
            {integration.connected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAvailable = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Available Integrations</Text>
      <Text style={styles.tabSubtitle}>
        Connect your favorite apps to enhance your productivity journey
      </Text>

      {Object.entries(integrationCategories).map(([categoryId, category]) => {
        const categoryIntegrations = integrations.filter(i => i.category === categoryId);
        if (categoryIntegrations.length === 0) return null;

        return (
          <View key={categoryId} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons name={category.icon as any} size={20} color={category.color} />
              <Text style={styles.categoryTitle}>{category.name}</Text>
            </View>
            {categoryIntegrations.map(renderIntegrationCard)}
          </View>
        );
      })}
    </ScrollView>
  );

  const renderConnected = () => {
    const connectedIntegrations = integrations.filter(i => i.connected);
    
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.tabTitle}>Connected Integrations</Text>
        <Text style={styles.tabSubtitle}>
          Manage your active integrations and view sync status
        </Text>

        {connectedIntegrations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="link" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No connected integrations</Text>
            <Text style={styles.emptyStateSubtext}>
              Connect your first integration from the Available tab to get started!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.syncStatusCard}>
              <View style={styles.syncHeader}>
                <Ionicons name="sync" size={24} color="#10B981" />
                <Text style={styles.syncTitle}>Sync Status</Text>
              </View>
              <Text style={styles.syncSubtitle}>All integrations are syncing normally</Text>
              <View style={styles.lastSyncInfo}>
                <Text style={styles.lastSyncText}>Last sync: 2 minutes ago</Text>
                <TouchableOpacity style={styles.syncNowButton}>
                  <Text style={styles.syncNowText}>Sync now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {connectedIntegrations.map(renderIntegrationCard)}
          </>
        )}
      </ScrollView>
    );
  };

  const renderSettings = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Integration Settings</Text>
      <Text style={styles.tabSubtitle}>
        Configure how your integrations work together
      </Text>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Data Sync</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Automatic Sync</Text>
            <Text style={styles.settingDescription}>
              Automatically sync data with connected apps every hour
            </Text>
          </View>
          <Switch value={true} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Background Sync</Text>
            <Text style={styles.settingDescription}>
              Keep syncing even when the app is in the background
            </Text>
          </View>
          <Switch value={false} />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Privacy & Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Data Encryption</Text>
            <Text style={styles.settingDescription}>
              Encrypt all synced data for maximum security
            </Text>
          </View>
          <Switch value={true} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Analytics Sharing</Text>
            <Text style={styles.settingDescription}>
              Share anonymous usage data to improve integrations
            </Text>
          </View>
          <Switch value={false} />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Sync Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified when integrations sync new data
            </Text>
          </View>
          <Switch value={true} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>Connection Alerts</Text>
            <Text style={styles.settingDescription}>
              Alert me if an integration loses connection
            </Text>
          </View>
          <Switch value={true} />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download" size={20} color="#6366F1" />
          <Text style={styles.actionButtonText}>Export Integration Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh" size={20} color="#6366F1" />
          <Text style={styles.actionButtonText}>Reset All Connections</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
          <Ionicons name="trash" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete All Integration Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Integrations</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.tabActive]}
          onPress={() => setActiveTab('available')}
        >
          <Ionicons name="apps" size={20} color={activeTab === 'available' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
            Available
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'connected' && styles.tabActive]}
          onPress={() => setActiveTab('connected')}
        >
          <Ionicons name="link" size={20} color={activeTab === 'connected' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'connected' && styles.tabTextActive]}>
            Connected
          </Text>
          {integrations.filter(i => i.connected).length > 0 && (
            <View style={styles.connectedCount}>
              <Text style={styles.connectedCountText}>
                {integrations.filter(i => i.connected).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons name="settings" size={20} color={activeTab === 'settings' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'available' && renderAvailable()}
      {activeTab === 'connected' && renderConnected()}
      {activeTab === 'settings' && renderSettings()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  connectedCount: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: '#10B981',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedCountText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  integrationCard: {
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
  integrationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  integrationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  integrationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  connectedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  integrationDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  integrationFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  integrationActions: {
    flexDirection: 'row',
    gap: 12,
  },
  setupButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  setupButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginLeft: 6,
  },
  connectButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
  },
  connectButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disconnectButtonText: {
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
  syncStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  syncSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  lastSyncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  syncNowButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  syncNowText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 12,
  },
  dangerButton: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  dangerButtonText: {
    color: '#EF4444',
  },
});