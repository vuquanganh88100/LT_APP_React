import { ScrollView, Text, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card } from 'react-native-elements';
import { NewsApi } from '../api/NewsApi';
import Search from '../components/Search';
import TitleCategory from '../components/TitleCategory';
import { useNavigation, useRoute } from '@react-navigation/native';

const Home = () => {
  const route = useRoute();
  let category = route.params?.category || 'general';
  const [search,setSearch]=useState('')
  const navigation = useNavigation()
  const { news, loading } = NewsApi(category,search);
    const handleSearch=(text)=>{
      console.log(search)
      setSearch(text)
    }
  const defaultImage = "https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg"
  return (
    <ScrollView>
      <Search onSearch={handleSearch} />
      <TitleCategory title={category.toUpperCase()} />
      {loading ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading...</Text>
      ) : (
        news.map((item, index) => (
          <Card key={item.url || index}>
            <TouchableOpacity
              key={item.url}
              onPress={() =>
                navigation.navigate('Detail', {
                  title: item.title,
                  description: item.description,
                  content: item.content,
                  imageUrl: item.urlToImage || defaultImage,
                })
              }
            >
              <Card.Title>{item.title}</Card.Title>
              <Card.Image source={{ uri: item.urlToImage || defaultImage }} />
              <Text>{item.description}</Text>
            </TouchableOpacity>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

export default Home;
