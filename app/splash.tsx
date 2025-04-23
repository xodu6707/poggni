import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';

export default function Splash() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setTimeout(() => {
        setLoading(false);
        if (user) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      }, 1500); // 1.5초 로고 애니메이션 타임
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/cat.jpg')} // 올바른 경로인지 확인 필요
        style={styles.logo}
      />
      <ActivityIndicator size="large" color="#9d8a77" style={{ marginTop: 20 }} />
      <Text style={styles.loadingText}>로딩 중입니다...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9d8a77',
  },
});