import React from 'react';
import { View, Button, ImageBackground, StyleSheet,Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Welcome = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require('../assets/welcome.jpg')}
      style={styles.image}
      resizeMode="cover"
    >

      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={{color:'white',fontSize:22,fontWeight:'bold', marginBottom:20 ,textAlign:'center'}}>
            Get breaking news from around the world, delivered to your device
        </Text>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Home')}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',  
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    height: '100%',
    top:100
  }
});

export default Welcome;
