import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Picker } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DJANGO_API_URL } from '@env';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('ko-KR'); // 기본 언어를 한국어로 설정

  const sendMessage = () => {
    fetch(DJANGO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message=${message}`,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          setResponse(data.response);
          handleVoiceCommand(data.response);  // 음성 명령 처리
          speak(data.response);  // TTS 기능 호출
        } else {
          setResponse('Error: ' + data.error);
        }
        setIsRecording(false);  // 녹음 상태 해제
      })
      .catch((error) => {
        console.error(error);
        setResponse('Error: ' + error.message);
        setIsRecording(false);  // 녹음 상태 해제
      });
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = language;  // 선택된 언어 설정
      speech.rate = 1;  // 속도 설정
      window.speechSynthesis.speak(speech);
    } else {
      console.log('TTS not supported in this browser.');
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsRecording(true);  // 녹음 상태 설정
      const recognition = new webkitSpeechRecognition();
      recognition.lang = language;  // 선택된 언어 설정
      recognition.onresult = (event) => {
        setMessage(event.results[0][0].transcript);
        setIsRecording(false);  // 녹음 상태 해제
        handleVoiceCommand(event.results[0][0].transcript);  // 음성 명령 처리
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);  // 녹음 상태 해제
      };
      recognition.start();
    } else {
      console.log('STT not supported in this browser.');
    }
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("버스")) {
      navigation.navigate('Bus');
    } else if (command.includes("달력")) {
      navigation.navigate('Calendar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Chatbot</Text>
      <Picker
        selectedValue={language}
        style={styles.picker}
        onValueChange={(itemValue) => setLanguage(itemValue)}
      >
        <Picker.Item label="한국어" value="ko-KR" />
        <Picker.Item label="영국 영어" value="en-GB" />
        <Picker.Item label="미국 영어" value="en-US" />
        <Picker.Item label="터키어" value="tr-TR" />
        <Picker.Item label="프랑스어" value="fr-FR" />
        <Picker.Item label="독일어" value="de-DE" />
        <Picker.Item label="스페인어" value="es-ES" />
        <Picker.Item label="포르투갈어" value="pt-PT" />
        <Picker.Item label="일본어" value="ja-JP" />
        <Picker.Item label="중국어" value="zh-CN" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
      />
      <Pressable style={styles.button} onPress={sendMessage} disabled={isRecording}>
        <Text style={styles.buttonText}>Send</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={startListening} disabled={isRecording}>
        <Text style={styles.buttonText}>
          {isRecording ? 'Recording...' : 'Start Listening'}
        </Text>
      </Pressable>
      {response ? <Text style={styles.response}>{response}</Text> : null}
    </View>
  );
};

const BusScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>버스 시간 확인</Text>
    {/* 여기에 버스 시간 확인 기능을 추가하세요 */}
  </View>
);

const CalendarScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>달력 확인</Text>
    {/* 여기에 달력 확인 기능을 추가하세요 */}
  </View>
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '메인 페이지' }} />
        <Stack.Screen name="Bus" component={BusScreen} options={{ title: '버스 시간 확인' }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: '달력 확인' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  response: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default App;
