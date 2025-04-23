import { Text, View } from "react-native";

const TitleCategory = ({title}) => {
    var titleCategory=title
    if(title==='HOME'){
        titleCategory="BREAKING NEWS"
    }
    return (
        <View style={{
            alignItems:'center',
            marginTop:30,
            marginBottom:15
        }}>
            <Text
                style={{
                    fontWeight: '800',
                    color: 'red',
                    fontSize: 26
                }}
            >
                {titleCategory}
            </Text>
        </View>
    )
}
export default TitleCategory;