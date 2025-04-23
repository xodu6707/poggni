import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // 약간의 지연 시간을 두고 라우팅하기
    const timer = setTimeout(() => {
      router.replace('/splash');
    }, 100);
    
    return () => clearTimeout(timer); // 컴포넌트 언마운트시 타이머 제거
  }, []);

  // 렌더링할 화면 추가 (빈 화면이 아니라 내용이 있는 화면으로)
  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>앱 시작 중...</Text>
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
  loadingText: {
    fontSize: 16,
    color: '#9d8a77',
  },
});