import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class ModifyPassword extends BaseComponent {

    static navigationOptions = {
        title: '更改密码',
        headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            newPassword: "",
            newRePassword: "",
            weak: UColor.arrow,
            medium: UColor.arrow,
            strong: UColor.arrow,
            CreateButton:  UColor.mainColor,
        }
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
      }
    updatePassword = () => {

        if (this.state.password == "") {
            EasyToast.show('请输入旧密码');
            return;
        }
        if (this.state.newPassword == "" || this.state.newPassword < 8) {
            EasyToast.show('密码长度至少8位，请重输');
            return;
        }
        if (this.state.newRePassword == "" || this.state.newRePassword < 8) {
            EasyToast.show('密码长度至少8位，请重输');
            return;
        }
        if (this.state.newRePassword != this.state.newPassword) {
            EasyToast.show('两次密码不一致');
            return;
        }
        var wallet = this.props.navigation.state.params;
        try {
            var ownerPrivateKey = wallet.ownerPrivate;
            var bytes_ownerPrivate = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + wallet.salt);
            var plaintext_ownerPrivate = bytes_ownerPrivate.toString(CryptoJS.enc.Utf8);

            if (plaintext_ownerPrivate.indexOf('eostoken') != - 1) {
                // plaintext_ownerPrivate = plaintext_ownerPrivate.substr(8, plaintext_ownerPrivate.length);

                //**************解密********* */
                var activePrivate = "";
                var plaintext_activePrivate = "";
                var _activePrivate = "";

                if (this.props.navigation.state.params.activePrivate != null) {
                    activePrivate = this.props.navigation.state.params.activePrivate;
                    var bytes_activePrivate = CryptoJS.AES.decrypt(activePrivate.toString(), this.state.password + this.props.navigation.state.params.salt);
                    plaintext_activePrivate = bytes_activePrivate.toString(CryptoJS.enc.Utf8);
                    _activePrivate = CryptoJS.AES.encrypt(plaintext_activePrivate, this.state.newPassword + this.props.navigation.state.params.salt);
                }

                var words = "";
                var plaintext_words = "";
                var _words = "";

                if (wallet.words != null) {
                    words = this.props.navigation.state.params.words;
                    var bytes_words = CryptoJS.AES.decrypt(words.toString(), this.state.password + wallet.salt);
                    plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
                    _words = CryptoJS.AES.encrypt(plaintext_words, this.state.newPassword + wallet.salt);
                }

                var words_active = "";
                var plaintext_words_active = "";
                var _words_active = "";

                if (wallet.words_active != null) {
                    words_active = this.props.navigation.state.params.words_active;
                    var bytes_words_active = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + wallet.salt);
                    plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
                    _words_active = CryptoJS.AES.encrypt(plaintext_words_active, this.state.newPassword + wallet.salt);
                }
                //**************加密********* */
                var _ownerPrivate = CryptoJS.AES.encrypt(plaintext_ownerPrivate, this.state.newPassword + wallet.salt);

                var _wallet = {
                    name: wallet.name,
                    account: wallet.account,
                    ownerPublic: wallet.ownerPublic,
                    activePublic: wallet.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isactived: wallet.isactived,
                    isBackups: wallet.isBackups
                }
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/modifyPassword', payload: { _wallet }, callback: () => {
                    EasyToast.show('密码修改成功');
                } });

                DeviceEventEmitter.addListener('modify_password', (data) => {
                    this.props.navigation.goBack();
                });
            } else {
                EasyToast.show('旧密码不正确');
            }
        } catch (error) {
            EasyToast.show('旧密码不正确');
        }
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    importEosKey() {
        this.props.navigation.goBack();                                  
        // 导入钱包
        const { navigate } = this.props.navigation;
        navigate('ImportEosKey');
    }

    intensity() {
        let string = this.state.newPassword;
        if(string.length >=8) {
          if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
            this.state.strong = UColor.tintColor;
            this.state.medium = UColor.arrow;
            this.state.weak = UColor.arrow;
          }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
            if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
              this.state.strong = UColor.arrow;
              this.state.medium = UColor.tintColor;
              this.state.weak = UColor.arrow;
            }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
              this.state.strong = UColor.arrow;
              this.state.medium = UColor.tintColor;
              this.state.weak = UColor.arrow;
            }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
              this.state.strong = UColor.arrow;
              this.state.medium = UColor.tintColor;
              this.state.weak = UColor.arrow;
            }else{
              this.state.strong = UColor.arrow;
              this.state.medium = UColor.arrow;
              this.state.weak = UColor.tintColor;
            }
          }
         }else{
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.arrow;
          this.state.weak = UColor.arrow;
         }
        if(this.state.password != "" && this.state.newPassword != "" && this.state.newRePassword != ""){
          this.state.CreateButton = UColor.tintColor;
        }else{
          this.state.CreateButton =  UColor.mainColor;
        }
      }

    render() {
        return <View style={styles.container}>
            

          <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <View style={styles.outsource}>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.password} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                                secureTextEntry={true} placeholder="当前密码"  underlineColorAndroid="transparent" autoFocus={false} maxLength = {20}
                                editable={true} onChangeText={(password) => this.setState({ password })}   onChange={this.intensity()} 
                            />
                        </View>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} value={this.state.newPassword} returnKeyType="next"
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                secureTextEntry={true}  placeholder="新密码" underlineColorAndroid="transparent"  autoFocus={false}  maxLength= {Constants.PWD_MAX_LENGTH}
                                editable={true} onChangeText={(newPassword) => this.setState({ newPassword })}  onChange={this.intensity()} 
                            />
                            <View style={{flexDirection: 'row', height: 50, alignItems: 'center', }}>
                                <Text style={{color:this.state.weak, fontSize: 15, padding: 5,}}>弱</Text>
                                <Text style={{color:this.state.medium, fontSize: 15, padding: 5,}}>中</Text>
                                <Text style={{color:this.state.strong, fontSize: 15, padding: 5,}}>强</Text>
                            </View>
                        </View>
                        <View  style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} returnKeyType="next"
                                value={this.state.newRePassword} onChangeText={(newRePassword) => this.setState({ newRePassword })}
                                selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}  onChange={this.intensity()} 
                                placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true}  maxLength = {Constants.PWD_MAX_LENGTH}
                            />
                        </View>
                        <View style={styles.inptoutsource} >
                            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} returnKeyType="next" 
                                style={styles.inpt} placeholderTextColor={UColor.arrow}   onChange={this.intensity()} 
                                placeholder="密码提示(可不填)" underlineColorAndroid="transparent" 
                            />
                        </View>
                    </View>
                    <View style={{paddingTop: 10, paddingHorizontal: 20,}}>
                        <Text style={{fontSize: 14, color: UColor.arrow, textAlign: 'left',marginVertical: 10,}} >忘记密码? 导入助记词或私钥可重置密码。</Text>
                        <Text onPress={() => this.importEosKey()} style={styles.servicetext}>马上导入</Text>
                    </View>
                    <Button onPress={() => this.updatePassword()}>
                        <View style={styles.btnout} backgroundColor = {this.state.CreateButton}>
                            <Text style={styles.buttext}>确认</Text>
                        </View>
                    </Button>
                </KeyboardAvoidingView>
            </TouchableOpacity>
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

    outsource: {
        backgroundColor: UColor.mainColor, 
        marginTop: 30, 
    },
    inptoutsource: {
        flexDirection: 'row',
        // paddingTop: 10, 
        paddingHorizontal: 20, 
        borderBottomColor: UColor.secdColor, 
        borderBottomWidth: 1,
    },
    inpt: {
        flex: 1,
        color: UColor.arrow, 
        fontSize: 15, 
        height: 50,
    },

    welcome: {
        color: UColor.arrow, 
        marginBottom: 10, 
        marginLeft: 10
    },

    btnout: {
        height: 45, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 40, 
        marginHorizontal:30,  
        borderRadius: 5
    },
    buttext: {
        fontSize: 15, 
        color: UColor.fontColor
    },
    servicetext: {
        fontSize: 14, 
        color: UColor.tintColor,  
        textAlign: 'right',
    },
});

export default ModifyPassword;
