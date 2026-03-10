import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { UserReelRow } from './UserReelRow';

interface ReelData {
  id: string;
  videoUrl: string;
  caption?: string;
}

interface UserData {
  creator: string;
  horizontalVideos: ReelData[];
}

interface ReelsFeedProps {
  users: UserData[];
  onGoBack?: () => void;
  onProfile?: () => void;
  onUpload?: () => void;
}

export const ReelsFeed: React.FC<ReelsFeedProps> = ({
  users,
  onGoBack,
  onProfile,
  onUpload
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [activeUserIndex, setActiveUserIndex] = useState(0);

  // Memoize key extractor to prevent re-renders
  const keyExtractor = useCallback((item: UserData, index: number) => item.creator + index, []);

  // Memoize render item to prevent re-renders
  const renderUser = useCallback(({ item, index }: { item: UserData; index: number }) => {
    const isVisible = index === activeUserIndex;
    
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <UserReelRow
          user={item}
          isVisible={isVisible}
          onLike={(reelId) => console.log('Like:', reelId)}
          onComment={(reelId) => console.log('Comment:', reelId)}
          onShare={(reelId) => console.log('Share:', reelId)}
        />
      </View>
    );
  }, [activeUserIndex, SCREEN_WIDTH, SCREEN_HEIGHT]);

  // Handle vertical scroll to update active user
  const handleScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(contentOffset / SCREEN_HEIGHT);
    if (newIndex !== activeUserIndex && newIndex >= 0 && newIndex < users.length) {
      setActiveUserIndex(newIndex);
    }
  }, [activeUserIndex, SCREEN_HEIGHT, users.length]);

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Go Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onGoBack}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={onProfile}
      >
        <Text style={styles.profileButtonText}>👤</Text>
      </TouchableOpacity>

      {/* Upload Button */}
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={onUpload}
      >
        <Text style={styles.uploadButtonText}>+</Text>
      </TouchableOpacity>

      {/* Vertical Feed of Users */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={keyExtractor}
        pagingEnabled={true}
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  profileButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  uploadButton: {
    position: 'absolute',
    top: 50,
    right: 65,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
