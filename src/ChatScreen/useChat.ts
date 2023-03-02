import {useCallback, useEffect, useState} from 'react';
import {Chat, Collections, User} from '../types';
import firestore from '@react-native-firebase/firestore';
import _ from 'loadsh';
const useChat = (userIds: string[]) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loadingChat, setLoadingChat] = useState(false);

  const getChatKey = (userIds: string[]) => {
    return _.orderBy(userIds, userId => userId, 'asc');
  };

  const loadChat = useCallback(async () => {
    try {
      setLoadingChat(true);
      // userIds 라는 필드에 getChatKey 의 결과가 존재하는지 검사
      const chatSnapshot = await firestore()
        .collection(Collections.CHATS)
        .where('userIds', '==', getChatKey(userIds))
        .get();
      // 존재한다면 해당 채팅방을 로드
      if (chatSnapshot.docs.length) {
        const doc = chatSnapshot.docs[0];
        setChat({
          id: doc.id,
          userIds: doc.data().userIds as string[],
          users: doc.data().users as User[],
        });
        return;
      }

      // userIds 에 포함된 유저 정보만 가져오기
      const usersSnapshot = await firestore()
        .collection(Collections.USERS)
        .where('userId', 'in', userIds)
        .get();

      const users = usersSnapshot.docs.map(doc => doc.data() as User);

      const data = {
        userIds: getChatKey(userIds),
        users,
      };
      const doc = await firestore().collection(Collections.CHATS).add(data);
      setChat({
        id: doc.id,
        ...data,
      });
    } finally {
      setLoadingChat(false);
    }
  }, [userIds]);

  useEffect(() => {
    loadChat();
  }, []);

  return {
    chat,
    loadingChat,
  };
};

export default useChat;
