import React from 'react';
import { connect } from 'react-redux'
import {StyleSheet, View, Text, Image,Platform, Clipboard,} from 'react-native';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import QRCode from "react-native-qrcode-svg";
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";


class AssistantQrcode extends BaseComponent {
  static navigationOptions = {
    headerTitle: '小助手二维码',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      WeChat: 'EOS-TOKEN'
    }
  }

  componentDidMount() {
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  copy() {
    Clipboard.setString(this.state.WeChat);
    EasyToast.show("复制成功")
  }

  render() {
    return <View style={styles.container}>
            

        <View style={styles.outsource}>
            <Text style={styles.accountText}>微信号：{this.state.WeChat}</Text>
        </View>
        <View style={styles.codeout}>
            <View style={styles.qrcode}>
                <QRCode size={170} style={{ width: 170 }}  value={"https://u.wechat.com/IFNmi5QiQirtoO-MrzB55EE"}/>
            </View>
        </View>
        <Text style={styles.prompttext}>微信扫一扫，添加好友</Text>
        <Button onPress={() => this.copy()}>
          <View style={styles.btnloginUser}>
              <Text style={styles.btntext}>复制微信号</Text>
          </View>
        </Button>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },

  outsource: {
    height: 50,
    marginVertical: 20,
    paddingHorizontal: 25,
    backgroundColor: UColor.mainColor,
    justifyContent: "center",
    
  },  
  accountText: {
    color: UColor.arrow,
    fontSize: 15,
    paddingLeft: 2,
    textAlign: "left",
  },

  codeout: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: 5
  },

  prompttext: {
    marginTop: 20,
    marginBottom: 50,
    color: UColor.fontColor,
    fontSize: 15,
    textAlign: "center"
  },


  btnloginUser: {
    height: 45,
    backgroundColor:  UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 5
  },
  btntext: {
    fontSize:17,
    color: UColor.fontColor,
  },
  
});

export default AssistantQrcode;
