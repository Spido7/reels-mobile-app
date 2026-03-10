import { useIsFocused } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface ReelData {
  id: string;
  videoUrl: string;
  caption?: string;
  upvotes?: number;
}

interface ReelPlayerProps {
  reel: ReelData;
  username: string;
  isActive: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  likes?: number;
  comments?: number;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  reel,
  username,
  isActive,
  onLike,
  onComment,
  onShare,
  likes = 0,
  comments = 0
}) => {
  const videoRef = useRef<Video>(null);
  const isFocused = useIsFocused();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [hasLiked, setHasLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(reel.upvotes || 0);

  console.log('Attempting to play URL:', reel.videoUrl);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive && isFocused) {
        videoRef.current.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isActive, isFocused]);

  const handleLike = async () => {
    const newLikesCount = hasLiked ? currentLikes - 1 : currentLikes + 1;
    setCurrentLikes(newLikesCount);
    setHasLiked(!hasLiked);
    
    // Update Supabase
    try {
      await supabase
        .from('videos')
        .update({ upvotes: newLikesCount })
        .eq('id', reel.id);
      
      onLike?.();
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setHasLiked(!hasLiked);
      setCurrentLikes(currentLikes);
    }
  };

  return (
    <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
      {/* Video Layer */}
      <Video
        ref={videoRef}
        source={{ uri: reel.videoUrl }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_WIDTH * (16/9), // 9:16 aspect ratio
          backgroundColor: 'black',
        }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={isActive}
        isLooping={true}
        isMuted={false}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Bottom Left Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.username}>{username}</Text>
          {reel.caption && (
            <Text style={styles.caption} numberOfLines={2}>{reel.caption}</Text>
          )}
        </View>

        {/* Right Side Action Panel */}
        <View style={{ position: 'absolute', bottom: insets.bottom + 20, right: 15, alignItems: 'center' }}>
          <Pressable style={styles.actionButton} onPress={handleLike}>
            <Text style={[styles.actionIcon, hasLiked && styles.likedIcon]}>
              {hasLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionCount}>{currentLikes}</Text>
          </Pressable>

          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onShare}>
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 10,
    textShadowOffset: { width: 1, height: 1 },
  },
  caption: {
    color: 'white',
    fontSize: 15,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 10,
    textShadowOffset: { width: 1, height: 1 },
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 25,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 10,
    textShadowOffset: { width: 1, height: 1 },
  },
  likedIcon: {
    color: '#ff4444',
  },
  actionCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 10,
    textShadowOffset: { width: 1, height: 1 },
  },
  overlay: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 15,
    right: 80,
  },
});
