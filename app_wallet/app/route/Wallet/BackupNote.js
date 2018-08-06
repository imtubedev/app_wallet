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
import { EasyDialog } from '../../components/Dialog';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants';
const maxWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ login }) => ({ ...login }))
class Set extends BaseComponent {

    static navigationOptions = {
        title: '备份助记词'
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
        }
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
      }
    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }

    decryptWords = () => {
        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}   
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent"/>
            </View>

        EasyDialog.show("密码", view, "备份", "取消", () => {

            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            try{
            var _words = this.props.navigation.state.params.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

            var words_active = this.props.navigation.state.params.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

            if (plaintext_words.indexOf('eostoken') != -1) {
                plaintext_words = plaintext_words.substr(9, plaintext_words.length);
                var wordsArr = plaintext_words.split(',');

                plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
                var wordsArr_active = plaintext_words_active.split(',');

                this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            } else {
                // alert('密码错误');
                EasyToast.show('密码错误');
            }
        }catch(e){
            EasyToast.show('密码错误');
        }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    render() {
        return <View style={styles.container}>
            

            <ScrollView style={styles.scrollView}>
                <View>
                    <Text style={styles.welcome} style={{  }}>柚子粉，请立即备份私钥！</Text>
                    <Text style={styles.welcome} >区块链钱包不同于传统网站账户，它是基于密码学的去中心化账户系统。</Text>
                    <Text style={styles.welcome} >您必须自己保管好钱包的私钥和交易密码，任何意外发生将会导致资产丢失。</Text>
                    <Text style={styles.welcome} >我们建议先做双重备份，再打入小额测试，最 后开始愉快使用。</Text>
                    <Text style={styles.welcome} >丢失钱包或忘记密码时，可帮助恢复 钱包。</Text>
                    <Button onPress={() => this.decryptWords()}>
                        <View style={styles.backupsout}>
                            {/* <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text> */}
                            <Text style={styles.backups}>开始备份</Text>
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
    weltitle: {
        color: UColor.fontColor, 
        fontSize: 15, 
        marginTop: 15, 
        marginLeft: 10
    },
    welcome: {
        color: UColor.arrow,
        marginTop: 5, 
        marginLeft: 10, 
        marginBottom: 25
    },
    backupsout: {
        height: 45, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 20, 
        borderRadius: 5 
    },
    backups:{
        fontSize: 15, 
        color: UColor.fontColor,
    },

    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: maxWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

});

export default Set;
