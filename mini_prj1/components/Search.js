import { TextInput, View } from 'react-native';
import React, { useState } from 'react';

const Search = ({onSearch}) => {
  const [search, setSearch] = useState('');
  const handleSearch = (text) => {
    setSearch(text);
    onSearch(text); 
  };
  return (
    <View>
      <TextInput 
        placeholder='Search'
        value={search}
        onChangeText={handleSearch}
        style={{
          height: 40,
          borderWidth: 1,
          borderColor: 'black',
          borderRadius: 10,
          paddingLeft: 20,
          marginTop: 20,
          marginHorizontal: 20
        }}
      />
    </View>
  );
};

export default Search;
