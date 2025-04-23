import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';

const HomeScreen = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [petName, setPetName] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('https://iot3team-hls.dotsys.org/status');
        const data = await res.json();
        setIsConnected(data.status === 'on' || data.status === 'off');
      } catch (err) {
        setIsConnected(false);
      }
    };

    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const userInfo = snap.data();
          setUserData(userInfo);
          if (userInfo.pet_name) setPetName(userInfo.pet_name);
        }
      } catch (err) {
        console.log('Firestore fetch error:', err);
      }
    };

    fetchUserData();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '확인',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/login');
            } catch (error) {
              console.log('로그아웃 실패:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const savePetName = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { pet_name: petName });
      Alert.alert('저장 완료', '펫 이름이 저장되었습니다.');
    } catch (err) {
      Alert.alert('저장 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{petName || '포근이'}</Text>

      <View style={[styles.imageWrapper, { borderColor: isConnected ? 'green' : 'red' }]}>
        <Image
          source={require('../assets/images/cat.jpg')}
          style={styles.image}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="애완동물의 이름을 입력하세요"
          value={petName}
          onChangeText={setPetName}
        />
        <TouchableOpacity style={styles.saveButton} onPress={savePetName}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cameraButton} onPress={() => router.push('/camera')}>
        <Text style={styles.cameraIcon}>📷</Text>
      </TouchableOpacity>

      {userData && (
        <View style={styles.infoBox}>
          <Text>현재 온도: {userData.cur_temp}°C</Text>
          <Text>희망 온도: {userData.set_temp}°C</Text>
          <Text>히터 상태: {userData.heat_status ? 'ON' : 'OFF'}</Text>
        </View>
      )}

      {auth.currentUser && (
        <View style={styles.infoBox}>
          <Text style={{ marginTop: 8 }}>유저 이메일: {auth.currentUser.email}</Text>
          <Text>UID: {auth.currentUser.uid}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  imageWrapper: {
    borderWidth: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'cover',
  },
  inputRow: {
    flexDirection: 'row',
    width: '90%',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#9d8a77',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cameraButton: {
    backgroundColor: '#fcd5ce',
    padding: 12,
    borderRadius: 50,
    marginBottom: 16,
  },
  cameraIcon: {
    fontSize: 24,
  },
  infoBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#f08080',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;