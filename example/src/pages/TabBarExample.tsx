import React from 'react';
import { View } from 'react-native';
import { TabBar } from 'react-native-maui';

interface TabBarExampleProps {}

const tabs = ['tab1', 'tab2', 'this is tab3', 'tab5', '11', 'tab8', 'ta11'];
const tabs2 = ['tab1', 'tab2'];
const tabs3 = ['tab1', 'tab2', 'this is tab3'];
const tabs4 = ['tab1', 'tab2', 'this is tab3', 'tab5', '11', 'tab8', 'ta11'];

const TabBarExample: React.FC<TabBarExampleProps> = (props) => {
  const {} = props;

  return (
    <>
      <TabBar
        tabs={tabs}
        spacing={20}
        showSeparator
        separatorComponent={() => (
          <View style={{ height: 18, width: 4, backgroundColor: '#000' }} />
        )}
        tabBarItemStyle={{
          height: 50,
          borderRadius: 25,
        }}
      />
      <TabBar
        tabs={tabs2}
        flex="equal-width"
        scrollEnabled={false}
        sliderComponent={() => (
          <View
            style={{
              width: 5,
              height: 5,
              borderRadius: 5,
              backgroundColor: 'blue',
            }}
          />
        )}
        style={{ height: 80 }}
      />
      <TabBar tabs={tabs3} spacing={18} flex="equal-width" hideSlider />
      <TabBar
        style={{ width: 200 }}
        tabs={tabs4}
        defaultSliderStyle={{ width: 50, height: 8, borderRadius: 4 }}
      />
    </>
  );
};

export default TabBarExample;
