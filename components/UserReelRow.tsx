import React, { useCallback, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { ReelPlayer } from './ReelPlayer';

interface ReelData {
  id: string;
  videoUrl: string;
  caption?: string;
}

interface UserData {
  creator: string;
  horizontalVideos: ReelData[];
}

interface UserReelRowProps {
  user: UserData;
  isVisible: boolean;
  onLike?: (reelId: string) => void;
  onComment?: (reelId: string) => void;
  onShare?: (reelId: string) => void;
}

export const UserReelRow: React.FC<UserReelRowProps> = ({
  user,
  isVisible,
  onLike,
  onComment,
  onShare
}) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // Memoize the key extractor to prevent re-renders
  const keyExtractor = useCallback((video: ReelData) => video.id.toString(), []);

  // Memoize the render item to prevent re-renders
  const renderReel = useCallback(({ item, index }: { item: ReelData; index: number }) => {
    const isActive = isVisible && index === activeReelIndex;
    
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <ReelPlayer
          reel={item}
          username={user.creator}
          isActive={isActive}
          onLike={() => onLike?.(item.id)}
          onComment={() => onComment?.(item.id)}
          onShare={() => onShare?.(item.id)}
          likes={Math.floor(Math.random() * 1000) + 100} // Mock data
          comments={Math.floor(Math.random() * 100) + 10} // Mock data
        />
      </View>
    );
  }, [user.creator, isVisible, activeReelIndex, onLike, onComment, onShare]);

  // Handle horizontal scroll to update active reel
  const handleScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffset / SCREEN_WIDTH);
    if (newIndex !== activeReelIndex) {
      setActiveReelIndex(newIndex);
    }
  }, [activeReelIndex, SCREEN_WIDTH]);

  if (!isVisible) {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: 'black' }} />
    );
  }

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      <FlatList
        data={user.horizontalVideos}
        renderItem={renderReel}
        keyExtractor={keyExtractor}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={2}
        initialNumToRender={1}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};
