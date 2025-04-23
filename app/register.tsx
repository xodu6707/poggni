import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [match, setMatch] = useState(true);
  const [emailDuplicate, setEmailDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const isValid = /\S+@\S+\.\S+/.test(email);
    setEmailValid(isValid);
    return isValid;
  };

  const validatePassword = (pw: string) => {
    const isValid = pw.length >= 6;
    setPasswordValid(isValid);
    return isValid;
  };

  const checkDuplicateEmail = async (email: string) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      const isDuplicate = !snap.empty;
      setEmailDuplicate(isDuplicate);
      return !isDuplicate; // 중복 없음 = true
    } catch (err) {
      console.error("이메일 중복 확인 오류:", err);
      return false; // 오류 발생시 가입 방지
    }
  };

  const handleRegister = async () => {
    const isEmailOK = validateEmail(email);
    const isPwOK = validatePassword(password);
    const isMatch = password === confirm;

    setMatch(isMatch);

    if (!isEmailOK || !isPwOK || !isMatch) {
      Alert.alert('입력 조건을 확인해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      const notDuplicate = await checkDuplicateEmail(email);
      if (!notDuplicate) {
        Alert.alert('이미 존재하는 이메일입니다.');
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email,
        cur_temp: 25,
        set_temp: 25,
        heat_status: false,
        role: 'user',
        last_login: new Date().toISOString(),
        token: 1,
      });

      Alert.alert('회원가입 완료', '로그인 화면으로 이동합니다.', [
        {
          text: '확인',
          onPress: () => router.push('/login')
        }
      ]);
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      
      let errorMessage = '회원가입에 실패했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '유효하지 않은 이메일 형식입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = '이메일/비밀번호 회원가입이 비활성화되어 있습니다.';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase 설정에 문제가 있습니다. 앱을 재시작해주세요.';
      }
      
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          validateEmail(text);
          setEmailDuplicate(false); 
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {!emailValid && <Text style={styles.error}>올바른 이메일 형식이 아닙니다.</Text>}
      {emailDuplicate && <Text style={styles.error}>이미 존재하는 이메일입니다.</Text>}

      <View style={styles.passwordRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="비밀번호"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
      {!passwordValid && <Text style={styles.error}>비밀번호는 6자리 이상이어야 합니다.</Text>}

      <TextInput
        style={styles.input}
        placeholder="비밀번호 확인"
        value={confirm}
        onChangeText={(text) => {
          setConfirm(text);
          setMatch(password === text);
        }}
        secureTextEntry={!showPassword}
      />
      {!match && <Text style={styles.error}>비밀번호가 일치하지 않습니다.</Text>}

      {loading ? (
        <ActivityIndicator size="small" color="#9d8a77" style={{ marginVertical: 10 }} />
      ) : (
        <TouchableOpacity 
          style={[
            styles.registerButton, 
            (!email || !password || !confirm) && styles.disabledButton
          ]} 
          onPress={handleRegister}
          disabled={!email || !password || !confirm}
        >
          <Text style={styles.registerButtonText}>회원가입</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>로그인 화면으로 돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e4",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#9d8a77",
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  error: {
    width: '100%',
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  eye: {
    marginLeft: 8,
    fontSize: 20,
  },
  registerButton: {
    backgroundColor: '#9d8a77',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    marginTop: 16,
    color: '#9d8a77',
    textDecorationLine: 'underline',
  },
});