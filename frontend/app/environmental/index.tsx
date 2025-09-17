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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EnvironmentalModule() {
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
    blocked_apps: ['social', 'entertainment', 'news'],
    blocked_websites: ['facebook.com', 'twitter.com', 'youtube.com'],
    break_reminders: true,
  });

  const renderEnvironmentSetup = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Environment Setup</Text>
      <Text style={styles.tabSubtitle}>
        Optimize your physical and digital environment to reduce friction and eliminate distractions.
      </Text>
      
      <View style={styles.factorCard}>
        <View style={styles.factorHeader}>
          <Ionicons name="phone-portrait" size={24} color="#84CC16" />
          <Text style={styles.factorName}>Phone Placement</Text>
        </View>
        <Text style={styles.factorDescription}>
          Where do you keep your phone during work?
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton}>
            <Text style={styles.optionText}>Another room</Text>
            <Text style={styles.optionImpact}>Low distraction</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.factorCard}>
        <View style={styles.factorHeader}>
          <Ionicons name="desktop" size={24} color="#84CC16" />
          <Text style={styles.factorName}>Workspace Organization</Text>
        </View>
        <Text style={styles.factorDescription}>
          Keep your workspace clean and organized
        </Text>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipText}>
            Remove unnecessary browser bookmarks and desktop shortcuts
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderAppBlocking = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>App & Website Blocking</Text>
      <Text style={styles.tabSubtitle}>
        Block distracting apps and websites during focus sessions.
      </Text>
      
      <View style={styles.focusModeCard}>
        <View style={styles.focusModeHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#84CC16" />
          <Text style={styles.focusModeTitle}>Focus Mode</Text>
          <Switch
            value={blockingSettings.focus_mode_enabled}
            onValueChange={(value) => setBlockingSettings(prev => ({ ...prev, focus_mode_enabled: value }))}
            trackColor={{ false: '#E5E7EB', true: '#84CC16' }}
            thumbColor={blockingSettings.focus_mode_enabled ? '#FFFFFF' : '#F3F4F6'}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderOptimizationTips = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Environment Optimization</Text>
      <Text style={styles.tabSubtitle}>
        Evidence-based tips to create an environment that naturally promotes focus.
      </Text>
      
      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Ionicons name="sunny" size={24} color="#84CC16" />
          <Text style={styles.tipTitle}>Optimize Natural Light</Text>
        </View>
        <Text style={styles.tipDescription}>
          Position your workspace near a window for natural light exposure
        </Text>
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
            Blocking
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
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
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  optionImpact: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
  },
  focusModeCard: {
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
  focusModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  focusModeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginLeft: 12,
  },
  tipCard: {
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
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  tipDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});