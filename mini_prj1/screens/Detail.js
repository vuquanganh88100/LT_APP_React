import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';

const Detail = ({ route }) => {
  const { title, description, content, imageUrl } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description || 'No description available.'}</Text>
      <Text style={styles.content}>{content || 'No additional content available.'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default Detail;
