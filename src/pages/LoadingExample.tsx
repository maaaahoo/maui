import * as React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Button from "../components/Button";
import { LoadingUtil, Loading, LoadingTitle } from '../components/Loading';
import { OpacityContainer, OpacityContainerRef } from '../components/Overlay';

export default function LoadingExample() {

  const ref = React.createRef<OpacityContainerRef>();

  return (
    <View style={styles.container}>
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 50}}>
        <Loading />
      </View>
      <Button onPress={() => {
        LoadingUtil.style = () => {
          return (
            <OpacityContainer>
              <Loading />
            </OpacityContainer>
          )
        }        
        LoadingUtil.show();
      }}>
        <Text>show loading</Text>
      </Button>
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 50}}>
        <LoadingTitle />
      </View>
      <Button onPress={() => {
        LoadingUtil.style = () => {
          return (
            <OpacityContainer ref={ref} dark={false}>
              <LoadingTitle />
            </OpacityContainer>    
          )
        }
        LoadingUtil.show();
      }}>
        <Text>show loading title</Text>
      </Button>
      <Button onPress={() => {
        LoadingUtil.hide();
      }}>
        <Text>show loading</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
