import {useCallback, useContext, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AuthContext from '../components/AuthContext';
import Screen from '../components/Screen';
import Colors from '../modules/Colors';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Collections, RootStackParamList, User} from '../types';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.BLACK,
  },
  userSectionContent: {
    backgroundColor: Colors.BLACK,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  myNameText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  myEmailText: {
    color: Colors.WHITE,
    fontSize: 14,
    marginTop: 4,
  },
  logoutText: {
    color: Colors.WHITE,
    fontSize: 14,
  },
  myProfile: {
    flex: 1,
  },
  userListSection: {
    marginTop: 40,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  userList: {
    flex: 1,
  },
  userListItem: {
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 12,
    padding: 20,
  },
  otherNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.BLACK,
  },
  otherEmailText: {
    fontSize: 14,
    color: Colors.BLACK,
    marginTop: 4,
  },
  separator: {
    height: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.GRAY,
  },
});

const HomeScreen = () => {
  const {user: me} = useContext(AuthContext);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const {navigate} =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const onPressLogout = useCallback(() => {
    auth().signOut();
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const snapshot = await firestore().collection(Collections.USERS).get();
      setUsers(
        snapshot.docs
          .map(doc => doc.data() as User)
          .filter(user => user.userId !== me?.userId),
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const renderLoading = useCallback(() => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  if (me == null) return null;
  return (
    <Screen title="홈">
      <View style={styles.container}>
        <View>
          <Text style={styles.sectionTitleText}>나의 정보</Text>
          <View style={styles.userSectionContent}>
            <View style={styles.myProfile}>
              <Text style={styles.myNameText}>{me.name}</Text>
              <Text style={styles.myEmailText}>{me.email}</Text>
            </View>
            <TouchableOpacity onPress={onPressLogout}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 유저목록 */}
        <View style={styles.userListSection}>
          {loadingUsers ? (
            renderLoading()
          ) : (
            <>
              <Text style={styles.sectionTitleText}>
                다른 사용자와 대화해보세요!
              </Text>
              <FlatList
                style={styles.userList}
                data={users}
                renderItem={({item: user}) => (
                  <TouchableOpacity
                    style={styles.userListItem}
                    onPress={() => {
                      navigate('Chat', {
                        userIds: [me.userId, user.userId],
                        other: user,
                      });
                    }}>
                    <Text style={styles.otherNameText}>{user.name}</Text>
                    <Text style={styles.otherEmailText}>{user.email}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View style={styles.separator}></View>
                )}
                ListEmptyComponent={() => (
                  <View>
                    <Text style={styles.emptyText}>사용자가 없습니다.</Text>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>
    </Screen>
  );
};

export default HomeScreen;
