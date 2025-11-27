import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  SafeAreaView,
  View,
  BackHandler,
  Platform,
  AppState,
  NativeEventSubscription,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import { ToastAndroid } from 'react-native';

const DownloadsWebView = () => {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (webViewRef.current) {
          console.log('[AppState] Reloading WebView due to app resume');
          webViewRef.current.reload();
        }
      }
      setAppState(nextAppState);
    };

    const subscription: NativeEventSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => subscription.remove();
  }, [appState]);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [canGoBack]);

  const getDownloadPermissionAndroid = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'File Download Permission',
          message: 'Your permission is required to save Files to your device',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log('[Permission] Error:', err);
      return false;
    }
  };

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'BLOB_DATA' && message.data) {
        const base64Data = message.data.split(',')[1];
        handleBase64(base64Data, message.fileName);
      }
    } catch (error) {
      console.log('[WebView Message] Error parsing message:', error);
    }
  }, []);

  const handleBase64 = async (base64Data: string, fileName: string) => {
    const { fs } = RNFetchBlob;
    let path = '';

    if (Platform.OS === 'android') {
      const granted = await getDownloadPermissionAndroid();
      if (!granted) {
        Alert.alert('Permission Denied', 'Cannot save file without storage permission.');
        return;
      }
      path = fs.dirs.DownloadDir + `/${fileName}`;
    } else {
      path = fs.dirs.DocumentDir + `/${fileName}`;
    }

    try {
      await fs.writeFile(path, base64Data, 'base64');
      if (Platform.OS === 'android') {
        ToastAndroid.show('File downloaded successfully!', ToastAndroid.LONG);
        RNFetchBlob.android.actionViewIntent(path, 'application/pdf');
      } else {
        RNFetchBlob.ios.openDocument(path);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save or open file: ' + error);
    }
  };

  const injectedJavaScript = `
    document.addEventListener('click', function(e) {
      const anchor = e.target.closest('a[href^="blob:"]');
      if (anchor) {
        e.preventDefault();
        const blobUrl = anchor.href;
        const fileName = anchor.download || 'download_' + Date.now();
        
        fetch(blobUrl)
          .then(response => response.blob())
          .then(blob => {
            const reader = new FileReader();
            reader.onloadend = function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'BLOB_DATA',
                data: reader.result,
                fileName: fileName
              }));
            };
            reader.readAsDataURL(blob);
          });
      }
    });
    true;
  `;

  const handleReload = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      {hasError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load content</Text>
          <TouchableOpacity onPress={handleReload} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <WebView
        source={{ uri: 'https://app.theryo.ai/auth/login/client' }}
        ref={webViewRef}
        style={hasError ? styles.hidden : styles.webview}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        originWhitelist={['*']}
        allowsBackForwardNavigationGestures={true}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        onContentProcessDidTerminate={(syntheticEvent) => {
          console.log('[WebView] Process terminated, reloading...');
          webViewRef.current?.reload();
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(syntheticEvent) => {
          console.error('[WebView] Error:', syntheticEvent.nativeEvent);
          setHasError(true);
        }}
        cacheMode={Platform.OS === 'android' ? 'LOAD_NO_CACHE' : 'LOAD_DEFAULT'}
      />

      {isLoading && !hasError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  hidden: {
    height: 0,
    width: 0,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#ff0000',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DownloadsWebView;