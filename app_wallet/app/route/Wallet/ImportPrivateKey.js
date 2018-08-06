import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, View, RefreshControl, Text, Platform, TextInput, ScrollView, TouchableHighlight } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import { formatterNumber, formatterUnit } from '../../utils/FormatUtil'
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import UImage from '../../utils/Img';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'

const pages = [];

let loadMoreTime = 0;

let currentLoadMoreTypeId;

let timer;

let currentTab = 0;

const _index = 0;

@connect(({ wallet }) => ({ ...wallet }))
class Coins extends BaseComponent {

  static navigationOptions = {
    title: '导入钱包'
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      reWalletpwd: '',
      walletpwd: '',
      ownerPk: '',
      activePk: '',
      words_owner: '',
      words_active: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [
        // { key: '0', title: '助记词' },
        { key: '2', title: '私钥' },
      ],
      isChecked: this.props.isChecked || true,
    };
  }
  //组件加载完成
  componentDidMount() {
    const { dispatch } = this.props;
    // InteractionManager.runAfterInteractions(() => {
    //   dispatch({ type: 'sticker/list', payload: { type: -1 } });
    //   this.startTick(0);
    // });
    var th = this;
    // DeviceEventEmitter.addListener('changeTab', (tab) => {
    //   if (tab == "Coins" || tab == "Coin") {
    //     th.startTick(th.state.index);
    //   } else {
    //     if (timer) {
    //       clearInterval(timer);
    //     }
    //   }
    // });
    // DeviceEventEmitter.addListener('coinSlefChange', (tab) => {
    //   dispatch({ type: 'sticker/list', payload: { type: 0 } });
    // });
   
  }

  componentWillUnmount() {
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    // if (timer) {
    //   clearInterval(timer);
    // }
    DeviceEventEmitter.removeListener('changeTab');
  }

  // startTick(index) {
  //   const { dispatch } = this.props;
  //   InteractionManager.runAfterInteractions(() => {
  //     clearInterval(timer);
  //     timer = setInterval(function () {
  //       dispatch({ type: 'sticker/list', payload: { type: index } });
  //     }, 7000);
  //   });
  // }

  // onRefresh(key) {
  //   this.startTick(this.getRouteIndex(key));
  // }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.state.routes.length; i++) {
      if (this.state.routes[i].key == typeId) {
        return i;
      }
    }
  }

  //点击
  onPress = (coins) => {
    // const { navigate } = this.props.navigation;
    // navigate('Coin', { coins });
  };

  //切换tab
  _handleIndexChange = index => {
    // this.startTick(index);
    this.setState({ index });
    _index = index;
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({ index });
  };
  

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'clause') {
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'Memorizingwords') {
    navigate('Web', { title: "什么是助记词", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'privatekey') {
    navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/reg.html" });
    }
  }


  checkClick() {
    this.setState({
        isChecked: !this.state.isChecked
    });
 }


  importByWords() {
    if (this.state.walletName == "") {
      EasyToast.show('请输入钱包名称');
      return;
    }
    if (this.state.walletpwd == "" || this.state.walletpwd.length < 8) {
      EasyToast.show('钱包密码至少8位,请重输');
      return;
    }
    if (this.state.reWalletpwd == "" || this.state.reWalletpwd.length < 8) {
      EasyToast.show('钱包密码至少8位,请重输');
      return;
    }
    if (this.state.walletpwd != this.state.reWalletpwd) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.words_owner == '') {
      EasyToast.show('请输入owner助记词');
      return;
    }
    if (this.state.words_active == '') {
      EasyToast.show('请输入active助记词');
      return;
    }
    const { navigate } = this.props.navigation;
    Eos.seedPrivateKey(this.state.words_owner, this.state.words_active, (result) => {
      if (result.isSuccess) {
        var salt;
        Eos.randomPrivateKey((r)=>{
          salt = r.data.ownerPrivate.substr(0, 18);
          result.data.words = wordsStr_owner;
          result.data.words_active = wordsStr_active;
          result.password = this.state.walletPassword;
          result.name = this.state.walletName;
          result.account = this.state.walletName;
          result.salt = salt;
          this.props.dispatch({ type: 'wallet/saveWallet', wallet: result }, (r) => {
            if(r.isSuccess){
              EasyToast.show('导入成功');
              this.props.navigation.goBack();
            }else{
              EasyToast.show('导入失败');
            }
          });
        });

      } else {
        EasyToast.show('导入失败');
      }
    });
    // DeviceEventEmitter.emit('importWords',
    //   { name: this.state.walletName, password: this.state.walletpwd, words_owner: this.state.words_owner, words_active: this.state.active });
    // DeviceEventEmitter.addListener('words_imported', (data) => {
    //   alert('助记词导入成功');
    //   // this.props.navigation.goBack();
    //   // const { navigate } = this.props.navigation;
    //   // navigate('BackupNote', data);
    // });
  }

  importPriKey() {
    // if (this.state.walletName == '') {
    //   EasyToast.show('请输入钱包名称');
    //   return;
    // }
    // if (this.state.ownerPk == '') {
    //   EasyToast.show('请输入owner私钥');
    //   return;
    // }
    if (this.state.activePk == '') {
      EasyToast.show('请输入active私钥');
      return;
    }
    if (this.state.password == '' || this.state.password.length < Constants.PWD_MIN_LENGTH) {
      EasyToast.show('密码长度至少4位,请重输');
      return;
    }
    if (this.state.reWalletpwd == ''|| this.state.password.length < Constants.PWD_MIN_LENGTH) {
      EasyToast.show('密码长度至少4位,请重输');
      return;
    }

    // Eos.verifyPk(this.state.ownerPk, (r) => {
    //   if (!r.isSuccess) {
    //     EasyToast.show('Owner私钥格式不正确');
    //     return;
    //   }
    // });
    // Eos.verifyPk(this.state.activePk, (r) => {
    //   if (!r.isSuccess) {
    //     EasyToast.show('active私钥格式不正确');
    //     return;
    //   }
    // });

    // const { dispatch } = this.props;
    // this.props.dispatch({
    //   type: 'wallet/importPrivateKey',
    //   payload: { ownerPk: this.state.ownerPk, activePk: this.state.activePk, password: this.state.password, walletName: this.state.walletName }, callback: (data) => {
    //     if (data.isSuccess) {
    //       EasyToast.show('私钥导入成功');
    //     } else {
    //       EasyToast.show('私钥导入失败');
    //     }
    //   }
    // });

    this.createWalletByPrivateKey(this.state.activePk, this.state.activePk);
  }

  createWalletByPrivateKey(owner_privateKey, active_privatekey){

  }

  //渲染页面
  renderScene = ({ route }) => {
    if (route.key == '') {
      return (<View></View>)
    }
    const v = (<View></View>)
    if (route.key == '0') {
      const v = <View style={styles.container}>
          <View style={{ backgroundColor: '#43536D',}}>
            <View style={{ backgroundColor: '#586888',paddingLeft: 15, paddingRight: 15,}}>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}}>
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                  value={this.state.words_owner}
                  onChangeText={(words_owner) => this.setState({ words_owner })}
                  returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10, }}
                  placeholderTextColor="#8696B0" placeholder="助记词，按空格分隔" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}} >
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                  value={this.state.words_active}
                  onChangeText={(words_active) => this.setState({ words_active })}
                  returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10, }}
                  placeholderTextColor="#8696B0" placeholder="助记词，按空格分隔" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}}>
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  onChangeText={(walletName) => this.setState({ walletName })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }} placeholderTextColor="#8696B0"
                  value={this.state.walletName}
                  placeholder="请输入钱包名称" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                />
              </View>
            
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}}>
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.walletpwd}
                  onChangeText={(walletpwd) => this.setState({ walletpwd })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }} placeholderTextColor="#8696B0"
                  placeholder="密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}} >
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.reWalletpwd}
                  onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }} placeholderTextColor="#8696B0"
                  placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                />
              </View>
            </View>
            <Button onPress={() => this.importByWords()}>
              <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 20, marginRight: 20, borderRadius: 5 }}>
                <Text style={{ fontSize: 15, color: '#fff' }}>创建钱包</Text>
              </View>
            </Button>
            <Button onPress={() => this.prot(this,'Memorizingwords')}>
              <View style={{ height: 45, backgroundColor: '#43536D', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                <Text style={{ fontSize: 15, color: '#65CAFF' }}>什么是助记词？</Text>
              </View>
            </Button>
          </View>
      </View>
      return (v);
    }
    // if (route.key == '1') {
    //   const v = <View style={styles.container}>
    //     <ScrollView style={styles.scrollView}>
    //       <View>
    //         <Text style={styles.welcome} style={{ color: '#8696B0', margin: 10, fontSize: 15 }}>直接复制粘贴以太坊官方钱包 Keystore 文件内 容至输入框。或者通过生成 Keystore 内容的二 维码，扫描录入。</Text>
    //         <View style={{ backgroundColor: '#43536D' }}>
    //           <View style={{ padding: 20, height: 100, backgroundColor: '#586888', marginLeft: 10, marginRight: 10, marginTop: 20, marginBottom: 20 }} >
    //             <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
    //               // value={this.state.loginPhone} 
    //               returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }}
    //               placeholderTextColor="#8696B0" placeholder="Keystore 文本内容" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
    //             />
    //           </View>
    //           <View style={{ padding: 20, height: 60, backgroundColor: '#43536D' }} >
    //             <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
    //               // value={this.state.loginPhone} 
    //               returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }}
    //               placeholderTextColor="#8696B0" placeholder="Keystore 密码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
    //             />
    //           </View>
    //           <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
    //           <Text style={styles.welcome} style={{ alignContent: 'center' }}>我已经仔细阅读并同意 服务及隐私条款</Text>
    //         </View>
    //         <Button onPress={() => this.logout()}>
    //           <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 20, marginRight: 20, borderRadius: 5 }}>
    //             <Text style={{ fontSize: 15, color: '#fff' }}>开始导入</Text>
    //           </View>
    //         </Button>
    //         <Button onPress={() => this.logout()}>
    //           <View style={{ height: 45, backgroundColor: '#43536D', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
    //             <Text style={{ fontSize: 15, color: '#65CAFF' }}>什么是助记词？</Text>
    //           </View>
    //         </Button>
    //       </View>
    //     </ScrollView>
    //   </View>
    //   return (v);
    // }
    if (route.key == '2') {
      const v = <View style={styles.container}>
          <View style={{ backgroundColor: '#43536D',}}>
            <View style={{ backgroundColor: '#586888',paddingLeft: 15, paddingRight: 15,}}>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}} >
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                  value={this.state.ownerPk}
                  onChangeText={(ownerPk) => this.setState({ ownerPk })}
                  returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10,}}
                  placeholderTextColor="#8696B0" placeholder="owner私钥明文" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',}} >
                <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                  value={this.state.activePk}
                  onChangeText={(activePk) => this.setState({ activePk })}
                  returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }}
                  placeholderTextColor="#8696B0" placeholder="active私钥明文" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',  }} >
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.walletpwd}
                  onChangeText={(walletpwd) => this.setState({ walletpwd })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }} placeholderTextColor="#8696B0"
                  placeholder="密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                />
              </View>
              <View style={{ paddingTop: 20, height: 60, backgroundColor: '#586888', borderBottomWidth:0.5,borderBottomColor: '#43536D',  }} >
                <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                  value={this.state.reWalletpwd}
                  onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })}
                  returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 10 }} placeholderTextColor="#8696B0"
                  placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                />
              </View>
            </View>
            <View style={{flexDirection: 'row',justifyContent: 'center', alignItems: 'center', marginTop: 20,}}>
                <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                    <Image source={this.state.isChecked?UImage.aab1:UImage.aab2} style={{width:20,height:20,}}/>
                </TouchableHighlight>
              <Text style={styles.welcome} style={{ fontSize: 15, color: '#8696B0', marginLeft: 10 }}>我已经仔细阅读并同意</Text>
              <Text onPress={() => this.prot(this,'clause')} style={{ fontSize: 15, color: '#65CAFF', marginLeft: 5 }}>服务及隐私条款</Text>
            </View> 
            <Button onPress={() => this.importPriKey()}>
              <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginLeft: 20, marginRight: 20, borderRadius: 5 }}>
                <Text style={{ fontSize: 15, color: '#fff' }}>开始导入</Text>
              </View>
            </Button>
            <Button onPress={() => this.prot(this,'privatekey')}>
              <View style={{ height: 45, backgroundColor: '#43536D', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                <Text  style={{ fontSize: 15, color: '#65CAFF' }}>什么是私钥？</Text>
              </View>
            </Button>
          </View>
      </View>
      return (v);
    }
    // if (route.key == '3') {
    //   const v = <View style={styles.container}>
    //     <ScrollView style={styles.scrollView}>
    //       <View>
    //         <Text style={styles.welcome} style={{ margin: 20, color: '#8696B0', fontSize: 15 }}>观察钱包不需要导入私钥，只导入钱包地址，进行日 常查看账户、交易和授受通知。大额资金的私钥建议 使用冷钱包或硬件钱包管理，避免泄露被盗。</Text>
    //         <View style={{ backgroundColor: '#43536D' }}>
    //           <View style={{ padding: 20, height: 60, backgroundColor: '#586888' }} >
    //             <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
    //               // value={this.state.loginPhone} 
    //               returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }}
    //               placeholderTextColor="#8696B0" placeholder="输入钱包地址" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
    //             />
    //           </View>
    //           <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
    //         </View>
    //         <Button onPress={() => this.logout()}>
    //           <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
    //             <Text style={{ fontSize: 15, color: '#fff' }}>开始导入</Text>
    //           </View>
    //         </Button>
    //         <View style={{ height: 80, margin: 10, backgroundColor: '#536482' }}>
    //           <Text style={styles.welcome} style={{ color: '#8696B0', padding: 10 }}>注意：观察钱包发送交易时需要冷钱包配合 签名。您可以使用另一台闲置手机，开飞行 模式作为冷钱包，导入钱包私钥，配合离线 签名。</Text>
    //         </View>
    //       </View>
    //     </ScrollView>
    //   </View>
    //   return (v);
    // }
    return (v);
  }
  render() {
    return (
      <View style={styles.container}>
          

        <TabViewAnimated
          lazy={true}
          style={styles.container}
          navigationState={this.state}
          renderScene={this.renderScene.bind(this)}
          renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} labelStyle={{ fontSize: 15, margin: 0, marginBottom: 10, paddingTop: 10, color: '#8696B0' }} indicatorStyle={{ backgroundColor: UColor.tintColor, width: 60, marginLeft: 20 }} style={{ backgroundColor: UColor.secdColor }} tabStyle={{ width: 100, padding: 0, margin: 0 }} scrollEnabled={true} {...props} />}
          onIndexChange={this._handleIndexChange}
          initialLayout={{ height: 0, width: Dimensions.get('window').width }}
        />
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor
  },
  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'red'
  },
  right: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'black'
  },
  incup: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#F25C49',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  },
  incdo: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#25B36B',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  }
});

export default Coins;
