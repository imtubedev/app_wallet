import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, ImageBackground, ScrollView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import { EasyToast } from "../../components/Toast"
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";
var dismissKeyboard = require('dismissKeyboard');
var Dimensions = require('Dimensions')
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
@connect(({ vote }) => ({ ...vote}))
class MortgageRecord extends React.Component {

  static navigationOptions = {
    title: "抵押记录",
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.mainColor,
      borderBottomWidth:0,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      delegateLoglist: [],
      show: false,
    }
  }

  //加载地址数据
  componentDidMount() {
    EasyLoading.show();
      this.props.dispatch({
        type: 'vote/getDelegateLoglist',
        payload: {account_name: this.props.navigation.state.params.account_name},
        callback: (resp) => {
          EasyLoading.dismis();
          if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
            this.setState({show: true, delegateLoglist: []});
          }else{
            this.setState({show: false, delegateLoglist: resp.data.rows});
          }
        }
    });
  }

  _empty() {
    this.setState({
      show: false,
      labelname: '',
      delegateLoglist: []
    });
    this.dismissKeyboardClick();
  }

  _query =(labelname) => {
    if (labelname == "") {
      EasyToast.show('请输入Eos账号');
      return;
    }else{
      EasyLoading.show();
      this.dismissKeyboardClick();
      this.props.dispatch({ type: 'vote/getDelegateLoglist', payload: {account_name: labelname},
        callback: (resp) => {
          EasyLoading.dismis();
          if(resp == null || resp.data == null ||  resp.data.rows == null || resp.data.rows.length == 0){
            this.setState({show: true, delegateLoglist: []});
          }else{
            this.setState({show: false, delegateLoglist: resp.data.rows});
          }
        }
      });
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return (<View style={styles.container}>
      <View style={styles.header}>  
          <View style={styles.inptout} >
              <Image source={UImage.Magnifier_ash} style={styles.headleftimg}></Image>
              <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                  selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" maxLength={12} 
                  placeholder="输入Eos账号(查询他人抵押信息)" underlineColorAndroid="transparent" keyboardType="default"
                  onChangeText={(labelname) => this.setState({ labelname })}   
                  />      
          </View>    
          <TouchableOpacity onPress={this._query.bind(this,this.state.labelname)}>  
              <Text style={styles.canceltext}>查询</Text>
          </TouchableOpacity>   
          <TouchableOpacity   onPress={this._empty.bind(this)}>  
              <Text style={styles.canceltext}>清空</Text>
          </TouchableOpacity>  
      </View>   
      {this.state.show && <View style={styles.nothave}><Text style={styles.copytext}>还没有抵押记录哟~</Text></View>}       
      <ListView style={styles.btn} renderRow={this.renderRow} enableEmptySections={true} 
        dataSource={this.state.dataSource.cloneWithRows(this.state.delegateLoglist == null ? [] : this.state.delegateLoglist)} 
        renderRow={(rowData, sectionID, rowID) => (   
            <View style={styles.outsource}>
              <View style={styles.leftout}>
                  <Text style={styles.fromtotext}>{rowData.from}</Text>
                  <Text style={styles.payernet}>Payer</Text>
                  <Text style={styles.fromtotext}>{rowData.to}</Text>
                  <Text style={styles.Receivercpu}>Receiver</Text>
              </View>
              <View style={styles.rightout}>
                  <Text style={styles.fromtotext}>{rowData.net_weight}</Text>
                  <Text style={styles.payernet}>Net bandwidth</Text>
                  <Text style={styles.fromtotext}>{rowData.cpu_weight}</Text>
                  <Text style={styles.Receivercpu}>CPU bandwidth</Text>
              </View>
            </View>
        )}                   
      />  
    </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: UColor.secdColor,
        paddingTop: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 7,
      backgroundColor: UColor.mainColor,
      marginBottom: 5,
    },
    headleftout: {
      paddingLeft: 15
    },
    headleftimg: {
      width: 18,
      height: 18,
      marginRight: 15,
    },
    inptout: {
      flex: 1,
      height: 30,
      borderRadius: 5,
      marginHorizontal: 10,
      paddingHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: 'center',
      backgroundColor: UColor.fontColor,
    },
    inpt: {
        flex: 1,
        height: 45,
        fontSize: 14,
        color: '#999999',
    },
    canceltext: {
      color: UColor.fontColor,
      fontSize: 13,
      textAlign: 'center',
      paddingRight: 15,
    },

    btn: {
      flex: 1,
    },
    nothave: {
      height: 110,
      backgroundColor: UColor.mainColor,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: "center",
      paddingHorizontal: 20,
      borderRadius: 5,
      margin: 5,
    },
    copytext: {
      fontSize: 16, 
      color: UColor.fontColor
    },
    outsource: {
      margin: 5,
      height: 110,
      borderRadius: 5,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      backgroundColor: UColor.mainColor,
    },
    leftout:{
      flex: 1, 
      alignItems: "flex-start",
    },
    rightout: {
      flex: 1, 
      alignItems: "flex-end", 
    },
    fromtotext: {
      fontSize: 12,
      color: UColor.fontColor,
      lineHeight: 20,
    },
    payernet: {
      fontSize: 12,
      color: UColor.arrow,
      marginBottom: 10,
    },
    Receivercpu: {
      fontSize: 12,
      color: UColor.arrow,
      lineHeight: 20,
    },
});
export default MortgageRecord;