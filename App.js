// App.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { DJANGO_API_URL } from '@env';

const App = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

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
        } else {
          setResponse('Error: ' + data.error);
        }
      })
      .catch((error) => {
        console.error(error);
        setResponse('Error: ' + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Chatbot</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
      />
      <Button title="Send" onPress={sendMessage} />
      {response ? <Text style={styles.response}>{response}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  response: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default App;
