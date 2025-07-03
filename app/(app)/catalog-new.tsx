// app/(app)/catalog-new.tsx
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
import { BookCopy, Camera, Copyright, Library, Trash2, Zap } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CaptureStep = 'cover' | 'title' | 'copyright' | 'review';

const STEPS_CONFIG: Record<Exclude<CaptureStep, 'review'>, { title: string; icon: React.ElementType; color: string }> = {
  cover: { title: 'Book Cover', icon: BookCopy, color: '#E0F2FE' },
  title: { title: 'Title Page', icon: Library, color: '#E0E7FF' },
  copyright: { title: 'Copyright Page', icon: Copyright, color: '#D1FAE5' },
};

const PHOTO_ORDER: Exclude<CaptureStep, 'review'>[] = ['cover', 'title', 'copyright'];

export default function CatalogNewScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // ✅ Get the user object from our AuthContext
  const { user } = useAuth();

  const [step, setStep] = useState<CaptureStep>('cover');
  const [images, setImages] = useState<Record<string, string | null>>({
    cover: null,
    title: null,
    copyright: null,
  });
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCapture = async () => {
    if (cameraRef.current && step !== 'review') {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      
      if (photo) {
        setImages(currentImages => {
          const updatedImages = { ...currentImages, [step]: photo.uri };
          const nextStep = PHOTO_ORDER.find(key => !updatedImages[key]);
          setStep(nextStep || 'review');
          return updatedImages;
        });
      }
    }
  };

  const resetCapture = (stepToReset: Exclude<CaptureStep, 'review'>) => {
    setImages(prev => ({ ...prev, [stepToReset]: null }));
    setStep(stepToReset);
  };
  
  const confirmRetakeAll = () => {
    Alert.alert(
      "Retake All Pictures?",
      "This will clear all captured images. Are you sure you want to continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", style: "destructive", onPress: () => {
          setImages({ cover: null, title: null, copyright: null });
          setStep('cover');
        }},
      ]
    );
  };
  
// In app/(app)/catalog-new.tsx

const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a job.");
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Upload images directly to Supabase Storage in parallel
      const uploadPromises = Object.entries(images)
        .filter(([_, uri]) => uri)
        .map(async ([key, uri]) => {
          const fileName = `${key}-${Date.now()}.jpg`;
          const filePath = `${user.id}/${fileName}`;

          // ✅ THE FIX: We now use FormData, the web standard for file uploads.
          // This is a much more robust way to handle file data in React Native.
          const formData = new FormData();
          formData.append('file', {
            uri,
            name: fileName,
            type: 'image/jpeg',
          } as any);

          // The Supabase client can directly handle FormData.
          const { data, error } = await supabase.storage
            .from('cataloging-uploads')
            .upload(filePath, formData, {
              // Note: We don't specify contentType here, as it's part of the FormData
              cacheControl: '3600',
              upsert: false,
            });
          
          if (error) throw new Error(`Failed to upload ${key}: ${error.message}`);
          
          const { data: urlData } = supabase.storage
            .from('cataloging-uploads')
            .getPublicUrl(data.path);

          return { [`${key}_url`]: urlData.publicUrl };
        });

      const uploadedUrlsArray = await Promise.all(uploadPromises);
      const imageUrls = uploadedUrlsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});

      // The rest of the logic remains unchanged...
      const buildshipPayload = { imageUrls };
      const API_ENDPOINT = 'https://qdpvud.buildship.run/catalog-from-images';
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(API_ENDPOINT, { 
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(buildshipPayload)
      });
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Buildship API submission failed: ${response.status} ${errorBody}`);
      }

      router.replace('/catalog-jobs');

    } catch (error: any) {
        console.error("Submission failed", error);
        Alert.alert('Submission Failed', error.message || 'Could not submit images for cataloging.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!permission) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionText}>We need permission to use your camera.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (step === 'review') {
    return (
      <SafeAreaView style={[styles.container, styles.lightBackground]}>
        <Stack.Screen options={{ 
          headerTitle: 'Review Images',
          headerBackTitle: 'Home'
        }} />
        <Modal visible={!!viewingImage} transparent={true} onRequestClose={() => setViewingImage(null)}>
            <View style={styles.modalContainer}>
                <Image source={{ uri: viewingImage || '' }} style={styles.modalImage} resizeMode="contain" />
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setViewingImage(null)}>
                    <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
            </View>
        </Modal>

        <ScrollView contentContainerStyle={styles.reviewScrollContainer}>
            {PHOTO_ORDER.map((key) => {
                const uri = images[key];
                if (!uri) return null;
                return (
                    <View key={key} style={styles.reviewItem}>
                        <TouchableOpacity onPress={() => setViewingImage(uri)}>
                            <Image source={{ uri: uri }} style={styles.reviewImage} />
                        </TouchableOpacity>
                        <Text style={styles.reviewLabel}>{STEPS_CONFIG[key].title}</Text>
                        <TouchableOpacity onPress={() => resetCapture(key)} style={styles.retakeButton}>
                            <Trash2 size={20} color="#C7006F" />
                            <Text style={styles.retakeText}>Retake</Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </ScrollView>
        <View style={styles.reviewFooter}>
            <TouchableOpacity onPress={handleSubmit} style={[styles.button, styles.primaryButton]} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Submit for Cataloging</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmRetakeAll} style={[styles.button, styles.secondaryButton]} disabled={isSubmitting}>
              <Text style={styles.secondaryButtonText}>Retake All</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentStepConfig = STEPS_CONFIG[step];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: `Step ${PHOTO_ORDER.indexOf(step) + 1} of 3: ${currentStepConfig.title}`,
        headerBackTitle: 'Home'
      }} />
      <CameraView 
        style={StyleSheet.absoluteFill} 
        facing="back" 
        ref={cameraRef} 
        flash={isFlashOn ? 'on' : 'off'}
      />
      
      <View style={styles.overlay}>
        <View style={[styles.promptContainer, { backgroundColor: currentStepConfig.color }]}>
          <View style={styles.promptIcon}>
            <currentStepConfig.icon size={24} color="#3B3B3A" />
          </View>
          <Text style={styles.promptText}>Capture the {currentStepConfig.title}</Text>
        </View>

        <View style={styles.guidanceBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        <View style={styles.cameraFooter}>
            <View style={styles.footerButtonPlaceholder} />
            <TouchableOpacity onPress={handleCapture} style={styles.captureButton}>
                <Camera size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flashButton} onPress={() => setIsFlashOn(!isFlashOn)}>
                <Zap size={28} color="white" style={{ opacity: isFlashOn ? 1 : 0.7 }}/>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Styles are unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  lightBackground: { backgroundColor: '#F9FBF9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F9FBF9' },
  permissionText: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  button: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', width: '100%' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject },
  promptContainer: { position: 'absolute', top: '12%', alignSelf: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 99, flexDirection: 'row', alignItems: 'center', },
  promptIcon: { marginRight: 8 },
  promptText: { fontSize: 16, fontWeight: '600', color: '#3B3B3A' },
  guidanceBox: { position: 'absolute', width: '90%', height: '75%', top: '10%', alignSelf: 'center', },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 5, borderRadius: 4,},
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  cameraFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 30, },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#C7006F', justifyContent: 'center', alignItems: 'center' },
  flashButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(120, 120, 120, 0.3)', justifyContent: 'center', alignItems: 'center', },
  footerButtonPlaceholder: { width: 50, height: 50, },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '100%', height: '80%' },
  modalCloseButton: { position: 'absolute', bottom: 40, backgroundColor: '#1FB1AB', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 8 },
  reviewScrollContainer: { padding: 20, paddingBottom: 120 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
  reviewImage: { width: 60, height: 90, borderRadius: 4, backgroundColor: '#E5E7EB' },
  reviewLabel: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '600' },
  retakeButton: { padding: 10, alignItems: 'center' },
  retakeText: { color: '#C7006F', marginTop: 4, fontSize: 12 },
  reviewFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#F9FBF9', alignItems: 'center', gap: 10 },
  primaryButton: { backgroundColor: '#1FB1AB' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#D1D5DB'},
  secondaryButtonText: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
});