// app/(app)/scan.tsx

import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, useRouter } from 'expo-router';
// ✅ 1. Import the new icon
import { BookCopy, ChevronLeft, Flashlight, Type } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(true);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      return () => {
        setScanned(true);
        setIsFlashOn(false);
      };
    }, [])
  );

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      router.push({ pathname: '/review', params: { isbn: data } });
    }
  };

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
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={isFlashOn}
      />

      <View style={styles.overlay}>
        {/* Header is unchanged */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft size={32} color="white" />
          </TouchableOpacity>
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
            Point camera at the barcode
          </Text>
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
    justifyContent: 'flex-start', 
    alignItems: 'center' 
  },
  backButton: { 
    marginLeft: 20, 
    padding: 8 
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
});