import { ReelsFeed } from '@/components/ReelsFeed';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [feedData, setFeedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching videos:', error);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('Fetched data:', data);
          // Group videos by username into 2D Matrix format
          const groupedData = data.reduce((acc: any, video: any) => {
            const creator = video.username || '@anonymous';
            const existingCreator = acc.find((item: any) => item.creator === creator);
            
            if (existingCreator) {
              existingCreator.horizontalVideos.push({
                id: video.id,
                videoUrl: video.video_url,
                caption: video.description || video.caption,
                title: video.title,
                upvotes: video.upvotes || 0
              });
            } else {
              acc.push({
                creator: creator,
                horizontalVideos: [{
                  id: video.id,
                  videoUrl: video.video_url,
                  caption: video.description || video.caption,
                  title: video.title,
                  upvotes: video.upvotes || 0
                }]
              });
            }
            
            return acc;
          }, []);

          setFeedData(groupedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const handleGoBack = () => {
    router.replace('/');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleUpload = () => {
    router.push('/upload');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ReelsFeed 
      users={feedData}
      onGoBack={handleGoBack}
      onProfile={handleProfile}
      onUpload={handleUpload}
    />
  );
}
