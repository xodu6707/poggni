import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { auth } from '../firebaseConfig';

export default function Layout() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firebase 초기화 확인
    try {
      if (auth) {
        setInitialized(true);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Firebase 초기화 오류:", err);
    }
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Firebase 초기화 오류:</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  // Slot은 현재 활성화된 라우트를 보여주는 특별한 컴포넌트입니다
  return <Slot />;
}