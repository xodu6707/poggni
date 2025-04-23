import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const CameraScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [curTemp, setCurTemp] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setCurTemp(data.cur_temp);
      }
    });

    const checkStatus = async () => {
      try {
        const res = await fetch('https://iot3team-hls.dotsys.org/status');
        const data = await res.json();
        setIsConnected(data.status === 'on');
      } catch {
        setIsConnected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const togglePower = () => {
    Alert.alert(isPowerOn ? '전원이 꺼졌습니다' : '전원이 켜졌습니다');
    setIsPowerOn(!isPowerOn);
  };

  const handleScreenshot = async () => {
    try {
      const res = await fetch('https://iot3team-hls.dotsys.org/capture');
      const data = await res.json();
      if (data.status === 'ok') {
        Alert.alert('스크린샷 저장 완료!');
      } else {
        Alert.alert('저장 실패');
      }
    } catch (err) {
      Alert.alert('서버 연결 실패');
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.videoWrapper, { borderColor: isConnected ? 'green' : 'red' }]}
      >
        <WebView
          source={{
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
                </head>
                <body style="margin:0; background:black;">
                  <video id="video" controls autoplay style="width:100%;height:100%;object-fit:cover;"></video>
                  <script>
                    if (Hls.isSupported()) {
                      var video = document.getElementById('video');
                      var hls = new Hls();
                      hls.loadSource('https://iot3team-hls.dotsys.org/hls/test.m3u8');
                      hls.attachMedia(video);
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                      video.src = 'https://iot3team-hls.dotsys.org/hls/test.m3u8';
                    }
                  </script>
                </body>
              </html>
            `,
          }}
          style={styles.webview}
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      <Text style={styles.tempText}>
        {curTemp !== null ? `${curTemp} ℃` : '온도 로딩 중...'}
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={togglePower}>
          <Text style={styles.buttonText}>
            {isPowerOn ? '전원 끄기' : '전원 켜기'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleScreenshot}>
          <Text style={styles.buttonText}>스크린샷</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/home')}>
          <Text style={styles.buttonText}>메인화면</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff8e4',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 20,
  },
  videoWrapper: {
    borderWidth: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: 320,
    height: 200,
  },
  webview: {
    width: '100%',
    height: '100%',
  },
  tempText: {
    fontSize: 20,
    marginBottom: 12,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
  },
  button: {
    backgroundColor: '#9d8a77',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
  },
});

export default CameraScreen;