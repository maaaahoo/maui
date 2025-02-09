import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Text, StyleSheet } from 'react-native';
import { RefreshState, WaterfallList, AsyncImage } from 'react-native-maui';

const { width } = Dimensions.get('window');

const pageItemBgPicList = [
  '11898897',
  '26653530',
  '12974784',
  '943459',
  '4424178',
  '20433037',
  '4424137',
  '4955810',
  '4424137',
  '18847956',
].map(
  (id) =>
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2`
);

interface WaterFallListExampleProps {}

const WaterFallListExample: React.FC<WaterFallListExampleProps> = (props) => {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState<RefreshState>(RefreshState.Idle);
  const total = useRef(0);

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 2000);
  }, []);

  const getData = useCallback(() => {
    const data: any = [];
    console.log('发起请求');

    for (let i = 0; i < 10; i++) {
      const height = Math.round(Math.random() * (500 - 100) + 100);
      data.push({
        id: i + 10 * total.current,
        url: pageItemBgPicList[i],
        text: Math.random().toFixed(Math.round(Math.random() * (10 - 5) + 5)),
        height,
      });
    }
    total.current = total.current + 1;
    setData(data);
    setStatus(RefreshState.Idle);
  }, []);

  const getMoreData = useCallback(() => {
    const data: any = [];

    for (let i = 0; i < 10; i++) {
      const height = Math.round(Math.random() * (500 - 100) + 100);
      data.push({
        id: i + 10 * total.current,
        url: pageItemBgPicList[i],
        text: Math.random().toFixed(Math.round(Math.random() * (10 - 5) + 5)),
        height,
      });
    }
    total.current = total.current + 1;
    setData((predata) => predata.concat(data));
    setStatus(RefreshState.Idle);
  }, []);

  return (
    <WaterfallList
      numColumns={2}
      data={data}
      refreshState={status}
      onRefresh={() => {
        setStatus(RefreshState.HeaderRefreshing);
        setTimeout(() => {
          getData();
        }, 2000);
      }}
      onFooterRefresh={() => {
        console.log('onFooterRefresh');
        setStatus(RefreshState.FooterRefreshing);
        setTimeout(() => {
          getMoreData();
        }, 2000);
      }}
      renderItem={({ item }) => (
        <>
          <AsyncImage
            url={item.url}
            style={{
              ...styles.image,
              height: item._imageSize.height,
            }}
            resizeMode="cover"
          />
          <Text style={styles.text}>index:{item.id}</Text>
        </>
      )}
      imageSize={(item) => {
        return {
          width: 50,
          height: item.height,
        };
      }}
    />
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
  },
  image: {
    width: '100%',
    padding: 5,
  },
});

export default WaterFallListExample;
