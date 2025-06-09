// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   TextInput,
//   Button,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   Text,
//   ActivityIndicator,
// } from 'react-native';
// import YoutubePlayer from 'react-native-youtube-iframe';

// const extractVideoId = (url) => {
//   try {
//     const parsedUrl = new URL(url);
//     if (parsedUrl.hostname === 'youtu.be') {
//       return parsedUrl.pathname.slice(1);
//     } else if (parsedUrl.hostname.includes('youtube.com')) {
//       const params = new URLSearchParams(parsedUrl.search);
//       return params.get('v');
//     }
//   } catch (e) {
//     return null;
//   }
//   return null;
// };

// const App = () => {
//   const [url, setUrl] = useState('');
//   const [videoId, setVideoId] = useState(null);
//   const [title, setTitle] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [savedVideo, setSavedVideo] = useState([]);

//   const handlePlay = () => {
//     const id = extractVideoId(url);
//     if (id) {
//       setVideoId(id);
//     } else {
//       Alert.alert('Lỗi', 'Đường dẫn YouTube không hợp lệ.');
//     }
//   };

//   useEffect(() => {
//     const fetchTitle = async () => {
//       if (!videoId) return;
//       setLoading(true);
//       try {
//         const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
//         const data = await response.json();
//         if (data.title) {
//           setTitle(data.title);
//         } else {
//           setTitle('Không lấy được tiêu đề');
//         }
//       } catch (error) {
//         setTitle('Lỗi khi lấy tiêu đề video');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTitle();
//   }, [videoId]);

//   const handleSaveVideo = () => {
//     if (videoId && title) {
//       const alreadySaved = savedVideo.find(item => item.videoId === videoId);
//       if (!alreadySaved) {
//         setSavedVideo([...savedVideo, { videoId, title }]);
//         Alert.alert('Thành công', 'Video đã được lưu!');
//       } else {
//         Alert.alert('Thông báo', 'Video này đã được lưu.');
//       }
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <TextInput
//         style={styles.input}
//         placeholder="Nhập link YouTube..."
//         value={url}
//         onChangeText={setUrl}
//         autoCapitalize="none"
//       />
//       <Button title="Phát video" onPress={handlePlay} />

//       {loading ? (
//         <ActivityIndicator size="small" color="#0000ff" style={{ marginTop: 10 }} />
//       ) : (
//         title !== '' && <Text style={styles.title}>{title}</Text>
//       )}

//       {videoId && (
//         <View style={styles.videoContainer}>
//           <YoutubePlayer
//             key={videoId}
//             height={230}
//             play={true}
//             videoId={videoId}
//           />
//         </View>
//       )}

//       {videoId && title && (
//         <Button title="Lưu video" onPress={handleSaveVideo} />
//       )}

//       {savedVideo.length > 0 && (
//         <View style={styles.savedVideo}>
//           <Text style={styles.savedTitle}>Danh sách video đã lưu:</Text>
//           {savedVideo.map((item, index) => (
//             <View key={index} style={styles.savedItem}>
//               <Text style={{ flex: 1 }}>{item.title}</Text>
//               <Button title="Phát" onPress={() => setVideoId(item.videoId)} />
//               <Button
//                 title="Xóa"
//                 color="red"
//                 onPress={() => {
//                   Alert.alert(
//                     'Xác nhận',
//                     'Bạn có chắc muốn xóa video này không?',
//                     [
//                       { text: 'Hủy', style: 'cancel' },
//                       {
//                         text: 'Xóa',
//                         style: 'destructive',
//                         onPress: () => {
//                           setSavedVideo(savedVideo.filter(v => v.videoId !== item.videoId));
//                           if (videoId === item.videoId) {
//                             setVideoId(null);
//                             setTitle('');
//                           }
//                         },
//                       },
//                     ]
//                   );
//                 }}
//               />
//             </View>
//           ))}
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#fff',
//     justifyContent: 'flex-start',
//   },
//   input: {
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     marginBottom: 12,
//     paddingHorizontal: 10,
//     borderRadius: 8,
//   },
//   title: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   videoContainer: {
//     marginTop: 20,
//   },
//   savedVideo: {
//     marginTop: 30,
//     marginBottom: 20,
//   },
//   savedTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   savedItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
// });

// export default App;


// tuan xx

// App.js

import React, { useRef } from 'react';
import {
  View,
  Text,
  Button,
  Animated,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const timingValue = useRef(new Animated.Value(0)).current;
  const springValue = useRef(new Animated.Value(0.3)).current;
  const parallelValue1 = useRef(new Animated.Value(0)).current;
  const parallelValue2 = useRef(new Animated.Value(0)).current;
  const sequenceValue = useRef(new Animated.Value(0)).current;

  const runTiming = () => {
    timingValue.setValue(0);
    Animated.timing(timingValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const runSpring = () => {
    springValue.setValue(0.3);
    Animated.spring(springValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const runParallel = () => {
    parallelValue1.setValue(0);
    parallelValue2.setValue(0);
    Animated.parallel([
      Animated.timing(parallelValue1, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(parallelValue2, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const runSequence = () => {
    sequenceValue.setValue(0);
    Animated.sequence([
      Animated.timing(sequenceValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(sequenceValue, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const rotateValue=useRef(
    new Animated.Value(0)
    
  )
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>React Native Animated Demo</Text>

      <Button title="Run Timing Animation" onPress={runTiming} />
      <Animated.View
        style={[
          styles.box,
          {
            opacity: timingValue,
            transform: [{ scale: timingValue }],
          },
        ]}
      />

      <Button title="Run Spring Animation" onPress={runSpring} />
      <Animated.View
        style={[
          styles.box,
          {
            transform: [{ scale: springValue }],
          },
        ]}
      />

      <Button title="Run Parallel Animation" onPress={runParallel} />
      <View style={{ flexDirection: 'row' }}>
        <Animated.View
          style={[
            styles.smallBox,
            {
              transform: [
                {
                  translateY: parallelValue1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.smallBox,
            {
              transform: [
                {
                  translateX: parallelValue2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 100],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      <Button title="Run Sequence Animation" onPress={runSequence} />
      <Animated.View
        style={[
          styles.box,
          {
            transform: [
              {
                translateX: sequenceValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150],
                }),
              },
            ],
          },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  box: {
    width: 100,
    height: 100,
    marginVertical: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  smallBox: {
    width: 50,
    height: 50,
    margin: 10,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
});
