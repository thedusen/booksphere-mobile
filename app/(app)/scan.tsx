// app/(app)/scan.tsx

import { useAuth } from '@/context/AuthContext';
import { useSnackbar } from '@/hooks/useSnackbar';
import { supabase } from '@/lib/supabase';
import { ApiResponse, BookData } from '@/types/api';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
// ✅ 1. Import the new icon
import { BookCopy, ChevronLeft, Flashlight, Type } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false); // Toggle between Quick Add and Batch Scan
  const processingLock = useRef(false); // Atomic lock to prevent any duplicate processing
  const lastScanTime = useRef(0); // For debouncing camera events
  const router = useRouter();
  const { user, organizationId } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Single cleanup function
  const resetAllState = useCallback(() => {
    processingLock.current = false;
    setScanned(false);
    setIsProcessing(false);
    console.log('🔓 State reset - ready for next scan');
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetAllState();
      return () => {
        setScanned(true);
        setIsFlashOn(false);
      };
    }, [resetAllState])
  );

  const fetchBookDataByIsbn = async (isbn: string): Promise<BookData> => {
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/getEnrichedBookDataByIsbn?isbn=${isbn}`);
    if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
    const data: ApiResponse = await response.json();
    if (data.jsonResult && data.jsonResult.bookData) return data.jsonResult.bookData;
    throw new Error("Book data not found for this ISBN.");
  };

  const handleBarCodeScannedInternal = async ({ data }: { data: string }) => {
    const timestamp = Date.now();
    
    // ATOMIC LOCK CHECK - Single point of failure prevention
    if (processingLock.current) {
      console.log(`🚫 [${timestamp}] DUPLICATE BLOCKED - Lock already held for processing`);
      return;
    }
    
    // ACQUIRE LOCK IMMEDIATELY (synchronous, atomic)
    processingLock.current = true;
    console.log(`🔒 [${timestamp}] LOCK ACQUIRED - Processing barcode: ${data}`);
    
    // Set UI state
    setScanned(true);
    setIsProcessing(true);
    
    if (!user || !organizationId) {
      showSnackbar('error', 'You must be logged in to scan books.');
      console.log(`❌ [${timestamp}] Auth failed - releasing lock`);
      processingLock.current = false;
      setIsProcessing(false);
      return;
    }

    try {
      if (isBatchMode) {
        // BATCH SCAN MODE: Synchronous processing
        console.log(`📋 [${timestamp}] Batch mode - fetching book data for: ${data}`);
        const bookData = await fetchBookDataByIsbn(data);
        
        console.log(`💾 [${timestamp}] Creating cataloging job for: ${data}`);
        const { data: newJobId, error: createError } = await supabase
          .rpc('create_cataloging_job', {
            image_urls_payload: {
              isbn: data,
              method: 'scan',
              job_type: 'isbn_scan'
            }
          });
          
        if (createError) {
          console.error(`❌ [${timestamp}] Failed to create cataloging job:`, createError);
          throw createError;
        }

        console.log(`📝 [${timestamp}] Updating job ${newJobId} with book data`);
        const { error: updateError } = await supabase
          .from('cataloging_jobs')
          .update({
            extracted_data: bookData,
            status: 'completed'
          })
          .eq('job_id', newJobId);
          
        if (updateError) {
          console.error(`❌ [${timestamp}] Failed to update cataloging job:`, updateError);
          throw updateError;
        }

        console.log(`✅ [${timestamp}] Batch job completed successfully: ${newJobId}`);
        showSnackbar('success', 'Book added to catalog jobs!');
        // Stay on scan screen for next book in batch mode
        setTimeout(() => resetAllState(), 1000);
        
      } else {
        // QUICK ADD MODE: Synchronous job creation only
        console.log(`⚡ [${timestamp}] Quick Add mode - creating job for: ${data}`);
        
        const { data: newJobId, error } = await supabase.rpc('create_cataloging_job', {
          image_urls_payload: {
            isbn: data,
            method: 'scan',
            job_type: 'isbn_scan'
          }
        });
        
        if (error) {
          console.error(`❌ [${timestamp}] Failed to create Quick Add job:`, error);
          throw error;
        }
        
        console.log(`✅ [${timestamp}] Quick Add job created: ${newJobId}`);
        
        // Navigate to review screen with both ISBN and job ID
        console.log(`🧭 [${timestamp}] Navigating to review screen`);
        router.push({ 
          pathname: '/review', 
          params: { 
            isbn: data,
            job_id: newJobId
          } 
        });
      }
    } catch (error: any) {
        console.error(`❌ [${timestamp}] Error processing ISBN ${data}:`, error);
        
        if (isBatchMode) {
          // Create failed job for later retry in batch mode
          try {
            const { data: failedJobId } = await supabase.rpc('create_cataloging_job', {
              image_urls_payload: {
                isbn: data,
                method: 'scan',
                job_type: 'isbn_scan'
              }
            });
            console.log(`📝 [${timestamp}] Created failed job for retry: ${failedJobId}`);
            showSnackbar('error', `Failed to find book data for ISBN: ${data}. Job saved for later retry.`);
          } catch (jobError) {
            console.error(`❌ [${timestamp}] Failed to create failed job:`, jobError);
            showSnackbar('error', `Failed to process ISBN: ${data}`);
          }
          // Stay on scan screen for next book in batch mode
          setTimeout(() => resetAllState(), 1000);
        } else {
          // Show error in quick mode
          showSnackbar('error', `Failed to find book data for ISBN: ${data}`);
          // Reset state after error in quick mode
          setTimeout(() => resetAllState(), 500);
        }
    } finally {
      // ALWAYS release the lock
      console.log(`🔓 [${timestamp}] LOCK RELEASED for: ${data}`);
      processingLock.current = false;
      setIsProcessing(false);
    }
  };

  // DEBOUNCED HANDLER - Prevents rapid-fire camera events
  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    const now = Date.now();
    
    // Debounce: Ignore scans within 100ms of each other
    if (now - lastScanTime.current < 100) {
      console.log(`⏱️ [${now}] DEBOUNCE BLOCKED - Too rapid (${now - lastScanTime.current}ms)`);
      return;
    }
    
    lastScanTime.current = now;
    console.log(`⚡ [${now}] DEBOUNCE PASSED - Calling internal handler`);
    handleBarCodeScannedInternal({ data });
  }, [handleBarCodeScannedInternal]);

  const toggleFlash = () => {
    setIsFlashOn(current => !current);
  };

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="white" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <CameraView
        onBarcodeScanned={scanned || isProcessing ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={isFlashOn}
      />

      <View style={styles.overlay}>
        {/* Header with mode toggle */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={32} color="white" />
          </TouchableOpacity>
          
          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              onPress={() => setIsBatchMode(false)}
              style={[styles.modeButton, !isBatchMode && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, !isBatchMode && styles.modeTextActive]}>
                Quick Add
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsBatchMode(true)}
              style={[styles.modeButton, isBatchMode && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, isBatchMode && styles.modeTextActive]}>
                Batch Scan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Scanner Area is unchanged */}
        <View style={styles.scannerArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLine} />
          </View>
          <Text style={styles.instructionText}>
            {isProcessing 
              ? 'Processing ISBN...' 
              : isBatchMode 
                ? 'Scan barcodes - books added to catalog jobs'
                : 'Point camera at the barcode'
            }
          </Text>
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#1FB1AB" />
              <Text style={styles.processingText}>Looking up book data...</Text>
            </View>
          )}
        </View>

        {/* ✅ 2. Footer updated to include the "No ISBN" button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={toggleFlash}
            style={[styles.iconButton, isFlashOn && styles.iconButtonActive]}
          >
            <Flashlight size={28} color="white" />
            <Text style={styles.iconLabel}>Flash</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/catalog-new')}
            style={styles.iconButton}
          >
            <BookCopy size={28} color="white" />
            <Text style={styles.iconLabel}>No ISBN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.push('/manual-entry')}
            style={styles.iconButton}
          >
            <Type size={28} color="white" />
            <Text style={styles.iconLabel}>Manual</Text>
          </TouchableOpacity>
        </View> 
      </View>
    </View>
  );
}

// ✅ 3. Styles are adjusted for the new three-button layout
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  permissionContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F9FBF9', 
    padding: 20 
  },
  permissionText: { 
    textAlign: 'center', 
    fontSize: 18, 
    marginBottom: 20 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  header: { 
    position: 'absolute', 
    top: 80, 
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: { 
    padding: 8 
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 2,
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 80,
  },
  modeButtonActive: {
    backgroundColor: '#1FB1AB',
  },
  modeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.7,
  },
  modeTextActive: {
    opacity: 1,
  },
  scannerArea: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 120,
    paddingBottom: 120,
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  scanLine: {
    width: '80%',
    height: 2,
    backgroundColor: '#1FB1AB',
    opacity: 0.8,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  footer: { 
    position: 'absolute', 
    bottom: 50, // Adjusted vertical position slightly
    width: '100%', 
    flexDirection: 'row', 
    justifyContent: 'space-around', // This will space the three buttons evenly
    alignItems: 'flex-start',
    paddingHorizontal: 20, // Reduced horizontal padding to give buttons more space
  },
  iconButton: { 
    padding: 12, 
    borderRadius: 16, // A slightly larger radius
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for better contrast
    alignItems: 'center',
    width: 90, // Explicit width for consistency
    height: 90, // Explicit height
    justifyContent: 'center',
  },
  iconButtonActive: { 
    backgroundColor: '#1FB1AB' 
  },
  iconLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
});