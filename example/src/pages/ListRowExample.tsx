import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {Button, ListRow} from 'react-native-maui';

interface ListRowExampleProps {
};

const ListRowExample: React.FC<ListRowExampleProps> = props => {
  const {} = props;

  return (
    <View style={styles.container}>
      <ListRow left="ListRow" />
      <ListRow left="Disable" disabled={true} />
      <ListRow left="ListRow" mid={<Text style={{ marginLeft: 10 }}>测试中间位置</Text>} right=">" />
      <ListRow left={<Text>测试前端位置</Text>} mid={<Text style={{ marginLeft: 10 }}>测试中间位置</Text>} right=">" />
      <ListRow left={<Text>测试前端位置</Text>} mid={<Text style={{ marginLeft: 10 }}>测试中间位置</Text>} right={
        <Button onPress={() => {}}>
          <Text>默认样式</Text>
        </Button>      
      } />
      <ListRow left="NoDivider" divider={false}  />
      <ListRow left="DividerProps" dividerProps={{
        start: 30,
        end: 300, 
        color: 'red'     
      }} />
      <ListRow left="ListRow" style={{ marginTop: 10 }} />
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default ListRowExample;
