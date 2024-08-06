import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DJANGO_API_URL } from '@env';
import Geolocation from '@react-native-community/geolocation';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('ko-KR');

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
    } else if (command.includes("오늘 날씨")) {
      navigation.navigate('TodayWeather');
    } else if (command.includes("이번주 날씨")) {
      navigation.navigate('WeekWeather');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>버스, 오늘의 날씨, 이번주의 날씨, 달력 중 하나를 말해주세요.</Text>
      <Pressable style={styles.button} onPress={startListening} disabled={isRecording}>
        <Text style={styles.buttonText}>
          {isRecording ? '녹음 중...' : '음성 듣기 시작'}
        </Text>
      </Pressable>
      {response ? <Text style={styles.response}>{response}</Text> : null}
    </View>
  );
};

const TodayWeatherScreen = () => {
  const [weatherInfo, setWeatherInfo] = useState(null);

  const fetchTodayWeather = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch('http://localhost:8000/api/weather/today/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `latitude=${latitude}&longitude=${longitude}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              console.error(data.error);
            } else {
              setWeatherInfo(data);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 날씨</Text>
      <Pressable style={styles.button} onPress={fetchTodayWeather}>
        <Text style={styles.buttonText}>오늘 날씨 가져오기</Text>
      </Pressable>
      {weatherInfo && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherText}>최저 기온: {weatherInfo.min_temp}°C</Text>
          <Text style={styles.weatherText}>최고 기온: {weatherInfo.max_temp}°C</Text>
          <Text style={styles.weatherText}>날씨: {weatherInfo.weather_description}</Text>
          {weatherInfo.rain_info && <Text style={styles.weatherText}>비 오는 시간: {weatherInfo.rain_info}</Text>}
        </View>
      )}
    </View>
  );
};

const WeekWeatherScreen = () => {
  const [weatherInfo, setWeatherInfo] = useState(null);

  const fetchWeekWeather = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch('http://localhost:8000/api/weather/week/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `latitude=${latitude}&longitude=${longitude}`,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              console.error(data.error);
            } else {
              setWeatherInfo(data);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이번 주 날씨</Text>
      <Pressable style={styles.button} onPress={fetchWeekWeather}>
        <Text style={styles.buttonText}>이번 주 날씨 가져오기</Text>
      </Pressable>
      {weatherInfo && (
        <View style={styles.weatherContainer}>
          {weatherInfo.rain_dates && weatherInfo.rain_dates.length > 0 ? (
            weatherInfo.rain_dates.map((date, index) => (
              <Text key={index} style={styles.weatherText}>{date.date} - {date.description}</Text>
            ))
          ) : (
            <Text style={styles.weatherText}>이번 주 비 소식 없음</Text>
          )}
        </View>
      )}
    </View>
  );
};

const BusScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>용인, 곤지암, 도척, 어디로 가세요?</Text>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>음성 듣기 시작</Text>
    </Pressable>
  </View>
);

const CalendarScreen = () => {
  const [events, setEvents] = useState([]);
  const [calendarEvent, setCalendarEvent] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsRecording(true);
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        handleCalendarCommand(command);
        setIsRecording(false);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event);
        setIsRecording(false);
      };
      recognition.start();
    } else {
      console.log('STT not supported in this browser.');
    }
  };

  const handleCalendarCommand = (command) => {
    if (command.includes('추가')) {
      setEvents([...events, calendarEvent]);
      setCalendarEvent('');
    } else if (command.includes('삭제')) {
      setEvents(events.filter((event) => event !== calendarEvent));
      setCalendarEvent('');
    } else if (command.includes('수정')) {
      const newEvent = command.replace('수정', '').trim();
      setEvents(events.map((event) => (event === calendarEvent ? newEvent : event)));
      setCalendarEvent('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>달력 확인</Text>
      <Text style={styles.subtitle}>현재 일정: {events.join(', ')}</Text>
      <TextInput
        style={styles.input}
        placeholder="일정을 입력하세요"
        value={calendarEvent}
        onChangeText={setCalendarEvent}
      />
      <Pressable style={styles.button} onPress={startListening} disabled={isRecording}>
        <Text style={styles.buttonText}>
          {isRecording ? '녹음 중...' : '음성 듣기 시작'}
        </Text>
      </Pressable>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '메인 페이지' }} />
        <Stack.Screen name="Bus" component={BusScreen} options={{ title: '버스 시간 확인' }} />
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: '달력 확인' }} />
        <Stack.Screen name="TodayWeather" component={TodayWeatherScreen} options={{ title: '오늘 날씨' }} />
        <Stack.Screen name="WeekWeather" component={WeekWeatherScreen} options={{ title: '이번 주 날씨' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'linear-gradient(to right, #f5f7fa, #c3cfe2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  response: {
    marginTop: 20,
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
  },
  weatherContainer: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ddd',
    width: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weatherText: {
    fontSize: 16,
    color: '#555',
  },
});

export default App;
