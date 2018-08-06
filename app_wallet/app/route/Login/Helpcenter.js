import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, Switch, TouchableHighlight } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import BaseComponent from "../../components/BaseComponent";
var DeviceInfo = require('react-native-device-info');
const Font = {
  Ionicons,
  FontAwesome
}
class Helpcenter extends BaseComponent {

  static navigationOptions = {
    title: '帮助中心',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };
  

  constructor(props) {
    super(props);
    this.state = {
      value: false,
      disabled: false,
    }
    
    this.config = [
      //{ first: true, name: "EOS常见问题？", onPress: this.goPage.bind(this, "commonproblem") },
      { first: true, name: "什么是钱包？", onPress: this.goPage.bind(this, "wallet") },
      { name: "什么是私钥？", onPress: this.goPage.bind(this, "ks") },
      //{ name: "什么是助记词？", onPress: this.goPage.bind(this, "mw") },
      { name: "如何导入EOS钱包？", onPress: this.goPage.bind(this, "iw") },
      { name: "如何添加钱包？", onPress: this.goPage.bind(this, "atw") },
      //{ name: "如何备份私钥？", onPress: this.goPage.bind(this, "bw") },
      { name: "如何转账？", onPress: this.goPage.bind(this, "ta") },
      //{ name: "EOS超级代理投票说明", onPress: this.goPage.bind(this, "vote") },
    ];

    
  }

    //组件加载完成
    componentDidMount() {
      // super.componentDidMount();
    }
    componentWillUnmount(){
      //结束页面前，资源释放操作
      super.componentWillUnmount();
      
    }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "commonproblem"){
      navigate('Web', { title: "EOS常见问题", url: "http://static.eostoken.im/html/20180705/1530781835326.html" });
    } else if (key == "wallet") {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Wallet.html" });
    } else if (key == 'ks') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/Keystore.html" });
    } else if (key == 'mw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/MemorizingWords.html" });
    } else if (key == 'iw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/ImportWallet.html" });
    }else if (key == 'atw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/AddToWallet.html" });
    }else if (key == 'bw') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/BackupsWallet.html" });
    }else if (key == 'ta') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/TransferAccounts.html" });
    }else if (key == 'vote') {
      navigate('Web', { title: "帮助中心", url: "http://static.eostoken.im/html/VoteCourse.html" });
    }else if (key == 'pf'){
      navigate('ProblemFeedback', {});
    }else if (key == 'NoviceMustRead') {
      navigate('Web', { title: "新手必读", url: "http://static.eostoken.im/html/NoviceMustRead.html" });
    }else if (key == 'Troubleshooting') {
      navigate('Web', { title: "疑难解答", url: "http://static.eostoken.im/html/Troubleshooting.html" });
    }else{
      EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
  }
  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  render() {
    return <View style={styles.container}>
            

      <ScrollView>
          <View style={styles.touchableout}>
            <TouchableHighlight onPress={this.goPage.bind(this, 'commonproblem')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
              <View style={styles.listItem} borderColor={UColor.arrow}>
                <Text style={styles.fontColortext}>EOS常见问题？</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.goPage.bind(this, 'NoviceMustRead')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
              <View style={styles.listItem} borderColor={UColor.arrow}>
                <Text style={styles.fontColortext}>新手必读？</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={styles.touchableout}>
            <TouchableHighlight onPress={this.goPage.bind(this, 'Troubleshooting')}  style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
              <View style={styles.listItem} borderColor={UColor.arrow}>
                <Text style={styles.fontColortext} >疑难解答？</Text>
              </View>
            </TouchableHighlight>
            <TouchableHighlight onPress={this.goPage.bind(this, 'pf')} style={styles.touchable} activeOpacity={0.5} underlayColor={UColor.secdColor}>
              <View style={styles.listItem} borderColor={UColor.tintColor}>
                <Text style={styles.tintColortext}  >问题反馈</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View>
            {this._renderListItem()}
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
    touchableout: {
      flex: 1, 
      flexDirection: "row",
      paddingTop: 10,
    },
    touchable:{
      flex: 1, 
      marginHorizontal: 3, 
    },
    fontColortext: {
      fontSize:15,
      color:UColor.fontColor,
    },
    tintColortext: {
      fontSize:15,
      color:UColor.tintColor
    },
    listItem: {
      height: 76,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 5, 
    },
  
});

export default Helpcenter;