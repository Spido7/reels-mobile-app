import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

interface VideoData {
  uri: string;
  name?: string;
}

export default function UploadScreen() {
  const router = useRouter();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const pickVideo = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload a video!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setVideo({
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
        });
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const uploadVideo = async () => {
    if (!video) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    setIsUploading(true);

    try {
      // Get current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const userId = user.id;
      const username = user.user_metadata?.preferred_username || user.user_metadata?.user_name || 'anonymous';

      // Convert video URI to base64 using expo-file-system
      const base64 = await FileSystem.readAsStringAsync(video.uri, { 
        encoding: 'base64' 
      });

      // Generate unique file name
      const fileName = `${userId}_${Date.now()}.mp4`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('reels')
        .upload(fileName, decode(base64), {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('reels')
        .getPublicUrl(fileName);

      // Insert into videos table
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          user_id: userId,
          username: username,
          title: title.trim(),
          description: description.trim(),
          video_url: publicUrl,
          upvotes: 0,
        });

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // Success
      Alert.alert('Success', 'Your project has been uploaded!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset state
            setVideo(null);
            setTitle('');
            setDescription('');
            // Navigate to feed
            router.push('/feed');
          },
        },
      ]);

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Upload Project</Text>

        {/* Video Selection */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.selectButton} onPress={pickVideo} disabled={isUploading}>
            <Text style={styles.selectButtonText}>
              {video ? 'Change Video' : 'Select Video'}
            </Text>
          </TouchableOpacity>
          
          {video && (
            <View style={styles.videoInfo}>
              <Text style={styles.videoInfoText}>✓ Video selected</Text>
              <Text style={styles.videoName}>{video.name}</Text>
            </View>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter your project title"
            placeholderTextColor="#666666"
            editable={!isUploading}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your project"
            placeholderTextColor="#666666"
            editable={!isUploading}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, (!video || !title.trim() || isUploading) && styles.uploadButtonDisabled]}
          onPress={uploadVideo}
          disabled={!video || !title.trim() || isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.uploadButtonText}>Post Project</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  selectButton: {
    backgroundColor: '#333333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444444',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  videoInfoText: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  videoName: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  uploadButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  uploadButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
