import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price_coins: number;
  price_inr: number;
  category: string;
  image_url: string;
  stock: number;
  rating: number;
  reviews: number;
  is_digital: boolean;
}

interface UserWallet {
  total_coins: number;
  total_inr_value: number;
  coins_earned_today: number;
  lifetime_coins: number;
}

interface Purchase {
  id: string;
  item_name: string;
  price_coins: number;
  purchase_date: string;
  status: string;
  delivery_info?: string;
}

export default function StoreModule() {
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'shop' | 'wallet' | 'orders'>('shop');
  const [userWallet, setUserWallet] = useState<UserWallet | null>(null);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [userOrders, setUserOrders] = useState<Purchase[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Items', icon: 'grid' },
    { id: 'productivity', name: 'Productivity', icon: 'briefcase' },
    { id: 'wellness', name: 'Wellness', icon: 'heart' },
    { id: 'digital', name: 'Digital', icon: 'phone-portrait' },
    { id: 'books', name: 'Books', icon: 'book' },
    { id: 'rewards', name: 'Rewards', icon: 'gift' },
  ];

  // Sample store items
  const sampleStoreItems: StoreItem[] = [
    {
      id: '1',
      name: 'Premium Task Planner',
      description: 'Beautiful digital planner with advanced task management features',
      price_coins: 200,
      price_inr: 50,
      category: 'productivity',
      image_url: 'https://via.placeholder.com/150x150/4F46E5/FFFFFF?text=Planner',
      stock: 100,
      rating: 4.8,
      reviews: 124,
      is_digital: true,
    },
    {
      id: '2',
      name: 'Meditation Cushion',
      description: 'Comfortable meditation cushion for mindfulness practice',
      price_coins: 400,
      price_inr: 100,
      category: 'wellness',
      image_url: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Cushion',
      stock: 25,
      rating: 4.6,
      reviews: 89,
      is_digital: false,
    },
    {
      id: '3',
      name: 'Focus Music Pack',
      description: 'Curated collection of focus-enhancing music and soundscapes',
      price_coins: 120,
      price_inr: 30,
      category: 'digital',
      image_url: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Music',
      stock: 1000,
      rating: 4.9,
      reviews: 256,
      is_digital: true,
    },
    {
      id: '4',
      name: 'Productivity Guide Book',
      description: 'Comprehensive guide to overcoming procrastination and boosting productivity',
      price_coins: 320,
      price_inr: 80,
      category: 'books',
      image_url: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Book',
      stock: 50,
      rating: 4.7,
      reviews: 167,
      is_digital: true,
    },
    {
      id: '5',
      name: 'Pomodoro Timer',
      description: 'Physical Pomodoro timer with beautiful design and multiple time settings',
      price_coins: 600,
      price_inr: 150,
      category: 'productivity',
      image_url: 'https://via.placeholder.com/150x150/EF4444/FFFFFF?text=Timer',
      stock: 15,
      rating: 4.5,
      reviews: 78,
      is_digital: false,
    },
    {
      id: '6',
      name: 'Stress Relief Tea Set',
      description: 'Premium herbal tea collection for relaxation and stress relief',
      price_coins: 240,
      price_inr: 60,
      category: 'wellness',
      image_url: 'https://via.placeholder.com/150x150/84CC16/FFFFFF?text=Tea',
      stock: 30,
      rating: 4.4,
      reviews: 92,
      is_digital: false,
    },
    {
      id: '7',
      name: 'Achievement Badge Pack',
      description: 'Exclusive digital badges and themes for your productivity achievements',
      price_coins: 80,
      price_inr: 20,
      category: 'rewards',
      image_url: 'https://via.placeholder.com/150x150/EC4899/FFFFFF?text=Badge',
      stock: 500,
      rating: 4.3,
      reviews: 145,
      is_digital: true,
    },
    {
      id: '8',
      name: 'Desk Organization Kit',
      description: 'Complete desk organization solution with drawers, holders, and labels',
      price_coins: 800,
      price_inr: 200,
      category: 'productivity',
      image_url: 'https://via.placeholder.com/150x150/6366F1/FFFFFF?text=Desk',
      stock: 10,
      rating: 4.8,
      reviews: 34,
      is_digital: false,
    },
  ];

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      await loadUserWallet(storedUserId);
      await loadUserOrders(storedUserId);
    }
    setStoreItems(sampleStoreItems);
    setIsLoading(false);
  };

  const loadUserWallet = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/store/wallet/${userId}`);
      if (response.ok) {
        const walletData = await response.json();
        setUserWallet(walletData);
      } else {
        // Set demo wallet data
        setUserWallet({
          total_coins: 450,
          total_inr_value: 112.5,
          coins_earned_today: 25,
          lifetime_coins: 1240,
        });
      }
    } catch (error) {
      console.error('Wallet loading error:', error);
      setUserWallet({
        total_coins: 450,
        total_inr_value: 112.5,
        coins_earned_today: 25,
        lifetime_coins: 1240,
      });
    }
  };

  const loadUserOrders = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/store/orders/${userId}`);
      if (response.ok) {
        const ordersData = await response.json();
        setUserOrders(ordersData);
      }
    } catch (error) {
      console.error('Orders loading error:', error);
      // Set demo orders
      setUserOrders([
        {
          id: '1',
          item_name: 'Focus Music Pack',
          price_coins: 120,
          purchase_date: '2024-01-15T10:30:00Z',
          status: 'delivered',
          delivery_info: 'Digital download link sent to email',
        },
        {
          id: '2',
          item_name: 'Achievement Badge Pack',
          price_coins: 80,
          purchase_date: '2024-01-10T14:20:00Z',
          status: 'delivered',
          delivery_info: 'Badges added to your profile',
        },
      ]);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!userWallet || userWallet.total_coins < item.price_coins) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${item.price_coins} coins but only have ${userWallet?.total_coins || 0} coins. Complete more tasks to earn coins!`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedItem(item);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedItem || !userWallet) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/store/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          item_id: selectedItem.id,
          price_coins: selectedItem.price_coins,
        }),
      });

      if (response.ok) {
        // Update wallet
        setUserWallet({
          ...userWallet,
          total_coins: userWallet.total_coins - selectedItem.price_coins,
          total_inr_value: (userWallet.total_coins - selectedItem.price_coins) / 4,
        });

        // Add to orders
        const newOrder: Purchase = {
          id: Date.now().toString(),
          item_name: selectedItem.name,
          price_coins: selectedItem.price_coins,
          purchase_date: new Date().toISOString(),
          status: selectedItem.is_digital ? 'delivered' : 'processing',
          delivery_info: selectedItem.is_digital 
            ? 'Digital item delivered instantly' 
            : 'Physical item will be shipped within 3-5 business days',
        };
        setUserOrders([newOrder, ...userOrders]);

        Alert.alert(
          'Purchase Successful!',
          `You have successfully purchased ${selectedItem.name}. ${newOrder.delivery_info}`,
          [{ text: 'Great!' }]
        );
      }
    } catch (error) {
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    }

    setShowPurchaseModal(false);
    setSelectedItem(null);
  };

  const filteredItems = selectedCategory === 'all' 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory);

  const renderStoreItem = (item: StoreItem) => (
    <View key={item.id} style={styles.storeItem}>
      <View style={styles.itemImageContainer}>
        <View style={[styles.itemImage, { backgroundColor: '#F3F4F6' }]}>
          <Ionicons name="image" size={40} color="#9CA3AF" />
        </View>
        {item.stock < 10 && !item.is_digital && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.itemRating}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewsText}>({item.reviews})</Text>
        </View>
        
        <View style={styles.itemFooter}>
          <View style={styles.priceContainer}>
            <View style={styles.coinPrice}>
              <Ionicons name="coin" size={16} color="#F59E0B" />
              <Text style={styles.coinPriceText}>{item.price_coins}</Text>
            </View>
            <Text style={styles.inrPrice}>₹{item.price_inr}</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.buyButton,
              (!userWallet || userWallet.total_coins < item.price_coins) && styles.buyButtonDisabled
            ]}
            onPress={() => handlePurchase(item)}
            disabled={!userWallet || userWallet.total_coins < item.price_coins}
          >
            <Text style={[
              styles.buyButtonText,
              (!userWallet || userWallet.total_coins < item.price_coins) && styles.buyButtonTextDisabled
            ]}>
              {(!userWallet || userWallet.total_coins < item.price_coins) ? 'Not Enough Coins' : 'Buy Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderShop = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.walletHeader}>
        <View style={styles.walletInfo}>
          <Ionicons name="wallet" size={24} color="#F59E0B" />
          <View style={styles.walletDetails}>
            <Text style={styles.walletCoins}>{userWallet?.total_coins || 0} Coins</Text>
            <Text style={styles.walletValue}>₹{userWallet?.total_inr_value.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.earnCoinsButton}>
          <Ionicons name="add-circle" size={20} color="#10B981" />
          <Text style={styles.earnCoinsText}>Earn More</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? '#FFFFFF' : '#6366F1'} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.name}
        </Text>
        <View style={styles.itemsGrid}>
          {filteredItems.map(renderStoreItem)}
        </View>
      </View>
    </ScrollView>
  );

  const renderWallet = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.walletCard}>
        <View style={styles.walletCardHeader}>
          <Ionicons name="wallet" size={32} color="#F59E0B" />
          <Text style={styles.walletCardTitle}>My Coin Wallet</Text>
        </View>
        
        <View style={styles.walletStats}>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatValue}>{userWallet?.total_coins || 0}</Text>
            <Text style={styles.walletStatLabel}>Total Coins</Text>
          </View>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatValue}>₹{userWallet?.total_inr_value.toFixed(2) || '0.00'}</Text>
            <Text style={styles.walletStatLabel}>INR Value</Text>
          </View>
          <View style={styles.walletStat}>
            <Text style={styles.walletStatValue}>{userWallet?.coins_earned_today || 0}</Text>
            <Text style={styles.walletStatLabel}>Earned Today</Text>
          </View>
        </View>
      </View>

      <View style={styles.earningTipsCard}>
        <Text style={styles.cardTitle}>How to Earn Coins</Text>
        <View style={styles.earningTip}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.earningTipText}>Complete normal tasks: <Text style={styles.coinHighlight}>1 coin</Text></Text>
        </View>
        <View style={styles.earningTip}>
          <Ionicons name="star" size={20} color="#F59E0B" />
          <Text style={styles.earningTipText}>Complete big tasks: <Text style={styles.coinHighlight}>4 coins</Text></Text>
        </View>
        <View style={styles.earningTip}>
          <Ionicons name="trending-up" size={20} color="#6366F1" />
          <Text style={styles.earningTipText}>Maintain streaks for bonus coins</Text>
        </View>
        <View style={styles.earningTip}>
          <Ionicons name="gift" size={20} color="#EC4899" />
          <Text style={styles.earningTipText}>Daily login rewards: <Text style={styles.coinHighlight}>2-5 coins</Text></Text>
        </View>
      </View>

      <View style={styles.conversionCard}>
        <Text style={styles.cardTitle}>Coin Conversion</Text>
        <View style={styles.conversionRate}>
          <Ionicons name="coin" size={24} color="#F59E0B" />
          <Text style={styles.conversionText}>4 Coins = ₹1 INR</Text>
        </View>
        <Text style={styles.conversionNote}>
          Coins are automatically converted to INR value for purchases. Physical items require shipping charges.
        </Text>
      </View>
    </ScrollView>
  );

  const renderOrders = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>My Orders</Text>
      
      {userOrders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Ionicons name="bag-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyOrdersText}>No orders yet</Text>
          <Text style={styles.emptyOrdersSubtext}>
            Purchase items from the store to see your orders here
          </Text>
        </View>
      ) : (
        userOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderItemName}>{order.item_name}</Text>
              <View style={[
                styles.orderStatus,
                { backgroundColor: order.status === 'delivered' ? '#10B981' : '#F59E0B' }
              ]}>
                <Text style={styles.orderStatusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.orderDetails}>
              <View style={styles.orderDetail}>
                <Ionicons name="coin" size={16} color="#F59E0B" />
                <Text style={styles.orderDetailText}>{order.price_coins} coins</Text>
              </View>
              <View style={styles.orderDetail}>
                <Ionicons name="calendar" size={16} color="#6366F1" />
                <Text style={styles.orderDetailText}>
                  {new Date(order.purchase_date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            {order.delivery_info && (
              <Text style={styles.orderDeliveryInfo}>{order.delivery_info}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderPurchaseModal = () => (
    <Modal
      visible={showPurchaseModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPurchaseModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPurchaseModal(false)}>
            <Ionicons name="close" size={24} color="#64748B" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Confirm Purchase</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {selectedItem && (
          <View style={styles.modalContent}>
            <View style={styles.modalItemImage}>
              <Ionicons name="image" size={60} color="#9CA3AF" />
            </View>
            
            <Text style={styles.modalItemName}>{selectedItem.name}</Text>
            <Text style={styles.modalItemDescription}>{selectedItem.description}</Text>
            
            <View style={styles.modalPriceInfo}>
              <View style={styles.modalPrice}>
                <Ionicons name="coin" size={20} color="#F59E0B" />
                <Text style={styles.modalPriceText}>{selectedItem.price_coins} coins</Text>
              </View>
              <Text style={styles.modalInrPrice}>₹{selectedItem.price_inr}</Text>
            </View>
            
            <View style={styles.modalWalletInfo}>
              <Text style={styles.modalWalletText}>
                Your Balance: {userWallet?.total_coins || 0} coins
              </Text>
              <Text style={styles.modalWalletAfter}>
                After Purchase: {(userWallet?.total_coins || 0) - selectedItem.price_coins} coins
              </Text>
            </View>
            
            <TouchableOpacity style={styles.confirmButton} onPress={confirmPurchase}>
              <Text style={styles.confirmButtonText}>Confirm Purchase</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading store...</Text>
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
        <Text style={styles.headerTitle}>Coin Store</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.tabActive]}
          onPress={() => setActiveTab('shop')}
        >
          <Ionicons name="storefront" size={20} color={activeTab === 'shop' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>
            Shop
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'wallet' && styles.tabActive]}
          onPress={() => setActiveTab('wallet')}
        >
          <Ionicons name="wallet" size={20} color={activeTab === 'wallet' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
            Wallet
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
          onPress={() => setActiveTab('orders')}
        >
          <Ionicons name="bag" size={20} color={activeTab === 'orders' ? '#6366F1' : '#9CA3AF'} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
            Orders
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'shop' && renderShop()}
      {activeTab === 'wallet' && renderWallet()}
      {activeTab === 'orders' && renderOrders()}

      {/* Purchase Modal */}
      {renderPurchaseModal()}
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
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletDetails: {
    marginLeft: 12,
  },
  walletCoins: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  walletValue: {
    fontSize: 14,
    color: '#64748B',
  },
  earnCoinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  earnCoinsText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 4,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  categoryButtonActive: {
    backgroundColor: '#6366F1',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  itemsSection: {
    marginBottom: 20,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  storeItem: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lowStockText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 8,
  },
  itemRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  itemFooter: {
    marginTop: 'auto',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  coinPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinPriceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  inrPrice: {
    fontSize: 12,
    color: '#64748B',
  },
  buyButton: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  buyButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buyButtonTextDisabled: {
    color: '#9CA3AF',
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletStat: {
    alignItems: 'center',
  },
  walletStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  walletStatLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  earningTipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  earningTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningTipText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
  },
  coinHighlight: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  conversionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  conversionRate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  conversionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginLeft: 8,
  },
  conversionNote: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  emptyOrders: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyOrdersText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 16,
  },
  emptyOrdersSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  orderStatus: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  orderStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderDetailText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 6,
  },
  orderDeliveryInfo: {
    fontSize: 12,
    color: '#10B981',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  modalItemImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalItemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalItemDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalPriceInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalPriceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 8,
  },
  modalInrPrice: {
    fontSize: 16,
    color: '#64748B',
  },
  modalWalletInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalWalletText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  modalWalletAfter: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});