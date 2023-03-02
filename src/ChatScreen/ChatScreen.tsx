import {RouteProp, useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import Screen from '../components/Screen';
import {RootStackParamList} from '../types';
import useChat from './useChat';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../modules/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
    padding: 20,
  },
  membersTitleText: {
    fontSize: 16,
    color: Colors.BLACK,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userProfile: {
    width: 34,
    height: 34,
    backgroundColor: Colors.BLACK,
    borderRadius: 34 / 2,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfileText: {
    color: Colors.WHITE,
  },
  messageList: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 5,
    borderRadius: 24,
    borderColor: Colors.BLACK,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 10,
    minHeight: 50,
    justifyContent: 'center',
  },
  textInput: {
    padding: 0,
  },
  sendButton: {
    backgroundColor: Colors.BLACK,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    fontSize: 24,
  },
});

const sendDisabledStyle = [
  {...styles.sendButton, backgroundColor: Colors.GRAY},
];

const ChatScreen = () => {
  const {params} = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const {other, userIds} = params;
  const {loadingChat, chat} = useChat(userIds);
  const [text, setText] = useState('');

  const sendDisabled = useMemo(() => text.length === 0, [text]);

  const onChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const onPressSendButon = useCallback(() => {
    setText('');
  }, []);

  const renderChat = useCallback(() => {
    if (chat == null) {
      return null;
    }

    return (
      <View style={styles.chatContainer}>
        <View style={styles.membersSection}>
          <Text style={styles.membersTitleText}>대화상대</Text>
          <FlatList
            horizontal
            data={chat?.users}
            renderItem={({item: user}) => (
              <View style={styles.userProfile}>
                <Text style={styles.userProfileText}>{user.name[0]}</Text>
              </View>
            )}
          />
        </View>
        <View style={styles.messageList}></View>
        <View style={styles.inputContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              value={text}
              onChangeText={onChangeText}
              style={styles.textInput}
              multiline
            />
          </View>
          <TouchableOpacity
            onPress={onPressSendButon}
            style={sendDisabled ? sendDisabledStyle : styles.sendButton}
            disabled={sendDisabled}>
            <Text style={styles.sendButtonText}>➢</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [chat, text, onChangeText]);

  return (
    <Screen title={other.name}>
      <View style={styles.container}>
        {loadingChat ? (
          <View style={styles.loadingContainer}></View>
        ) : (
          renderChat()
        )}
      </View>
    </Screen>
  );
};

export default ChatScreen;
