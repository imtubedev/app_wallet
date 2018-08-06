import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";

@connect(({ wallet }) => ({ ...wallet }))
class Set extends BaseComponent {

  static navigationOptions = {
    title: '备份助记词'
  };

  constructor(props) {
    super(props);
    this.state = {
      params: [],
      data: ''
    }
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  nextStep = () => {
    this.props.navigation.goBack();
    const { dispatch } = this.props;
    var data = this.props.navigation.state.params.wallet;
    // this.props.dispatch({ type: 'wallet/backupWords', payload: { data } });
    // alert('nextStep' + JSON.stringify(this.props.navigation.state.params));
  }

  render() {
    return <View style={styles.container}>
        

      <ScrollView style={styles.scrollView}>
        <View>
          <Text style={styles.welcome} style={{ color: '#FFFFFF', fontSize: 15, marginTop: 15, marginLeft: 10 }}>抄写下您的钱包助记词</Text>
          <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 5, marginLeft: 10, marginBottom: 25 }}>助记词用于恢复钱包或重置钱包密码，将它准确的抄写到纸上，并存放在只有您知道的安全地方。</Text>
          <View style={{ backgroundColor: '#43536D' }} style={{ marginBottom: 20 }}>
            <View style={{ padding: 20, height: 100, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 15, color: '#8696B0', height: 100 }}>{
                this.props.navigation.state.params.words_owner[0] + ' , ' + this.props.navigation.state.params.words_owner[1] + ' , ' + this.props.navigation.state.params.words_owner[2] + ' , '
                + this.props.navigation.state.params.words_owner[3] + ' , ' + this.props.navigation.state.params.words_owner[4] + ' , ' + this.props.navigation.state.params.words_owner[5] + ' , '
                + this.props.navigation.state.params.words_owner[6] + ' , ' + this.props.navigation.state.params.words_owner[7] + ' , ' + this.props.navigation.state.params.words_owner[8] + ' , '
                + this.props.navigation.state.params.words_owner[9] + ' , ' + this.props.navigation.state.params.words_owner[10] + ' , ' + this.props.navigation.state.params.words_owner[11] + ' , '
                + this.props.navigation.state.params.words_owner[12] + ' , ' + this.props.navigation.state.params.words_owner[13] + ' , ' + this.props.navigation.state.params.words_owner[14]
              }</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#43536D' }} style={{ marginBottom: 20 }}>
            <View style={{ padding: 20, height: 100, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 15, color: '#8696B0', height: 100 }}>{
                this.props.navigation.state.params.words_active[0] + ' , ' + this.props.navigation.state.params.words_active[1] + ' , ' + this.props.navigation.state.params.words_active[2] + ' , '
                + this.props.navigation.state.params.words_active[3] + ' , ' + this.props.navigation.state.params.words_active[4] + ' , ' + this.props.navigation.state.params.words_active[5] + ' , '
                + this.props.navigation.state.params.words_active[6] + ' , ' + this.props.navigation.state.params.words_active[7] + ' , ' + this.props.navigation.state.params.words_active[8] + ' , '
                + this.props.navigation.state.params.words_active[9] + ' , ' + this.props.navigation.state.params.words_active[10] + ' , ' + this.props.navigation.state.params.words_active[11] + ' , '
                + this.props.navigation.state.params.words_active[12] + ' , ' + this.props.navigation.state.params.words_active[13] + ' , ' + this.props.navigation.state.params.words_active[14]
              }</Text>
            </View>
          </View>

          <Button onPress={() => this.nextStep()}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              {/* <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text> */}
              <Text style={{ fontSize: 15, color: '#fff' }}>完成</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {

  },

});

export default Set;
