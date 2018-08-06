import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity,ImageBackground} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import {EasyDialog} from '../../components/Dialog'
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({wallet}) => ({...wallet}))
class AgentInfo extends BaseComponent {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "代理人信息",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
        };
      };

    constructor(props) {
        super(props);
        this.state = {
            isAllSelected: true,  
            isNotDealSelected: false,        
        };
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
    }
 
    prot = () => {
        const { navigate } = this.props.navigation;
        navigate('Web', { title: this.props.navigation.state.params.coins.name, url: this.props.navigation.state.params.coins.url });
      }
   


    render() {
        const agent = this.props.navigation.state.params.coins;
        return (
            <View style={styles.container}> 
                    

                <ScrollView>
                    <View style={styles.outsource}>
                        <ImageBackground style={styles.AgentInfo} source={UImage.AgentInfo_bg} resizeMode="stretch">                  
                            <View style={styles.bjoutsource}>
                                <Image style={styles.imgtext} source={{uri: agent.icon}}/>
                            </View>
                            <Text style={styles.nametext}>{agent.name}</Text>           
                        </ImageBackground> 
                        <View style={styles.dasoutsource}>
                            {/* <Image style={styles.dasimg} source={UImage.AgentInfo_bg}/> */}
                            <View style={styles.minbag}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.region}</Text>
                                    <Text style={styles.state}>地区</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.numbers}>{parseInt(agent.total_votes)}</Text>
                                    <Text style={styles.state}>得票总数</Text>
                                </View>
                            </View>   
                            <View style={styles.minbag}>
                                <View style={styles.frame}>
                                    <Text style={styles.number}>{agent.ranking}</Text>
                                    <Text style={styles.state}>排名</Text>
                                </View>
                                <View style={styles.frame}>
                                    <Text style={styles.number}> </Text>
                                    <Text style={styles.state}>出块状态</Text>
                                </View>
                            </View> 
                            <View style={styles.Official}>
                                <Text style={styles.Officialtitle}>官网：</Text>
                                <Text onPress={() => this.prot()} style={styles.Officialtext}>{agent.url}</Text>
                            </View>
                        </View>
                    </View> 
                    <View style={styles.synopsis}>  
                        <View style={styles.spsoutsource}>
                            <Text style={styles.spstext}>{agent.introduce}</Text>
                        </View>
                    </View>
                </ScrollView>        
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.fontColor,
    },

    outsource: {
        paddingLeft: 5, 
        paddingRight: 5,  
        paddingBottom: 10, 
        backgroundColor: UColor.secdColor,
    },

    AgentInfo: {
        justifyContent: "center", 
        alignItems: 'center', 
        height:118, 
        flexDirection:'column', 
        marginTop: 3, 
        marginBottom: 4,
    },

    bjoutsource: {
        width: 50, 
        height: 50, 
        backgroundColor: UColor.mainColor,
        justifyContent: "center", 
        alignItems: 'center', 
        borderRadius: 25, 
        margin: 5,
    },

    imgtext: {
        width: 40, 
        height: 40,
    },

    nametext: {
        width: 117, 
        height: 24, 
        lineHeight: 24, 
        backgroundColor: UColor.tintColor, 
        textAlign: 'center', 
        color:  UColor.fontColor,
        borderRadius: 5,
    },

    dasoutsource: {
        padding: 5, 
        backgroundColor: UColor.mainColor, 
        borderRadius: 5,
    },

    dasimg: {
        width: 35, 
        height: 26, 
        position: 'absolute', 
        top: 0, 
        left: 15, 
        zIndex: 999
    },

    minbag: {
        flexDirection: "row",
    },

    frame: {
        flex: 1,
        height: 60,
        margin: 2, 
        padding:5,
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#61708E',
    },
    numbers: {
        fontSize: 12, 
        color: UColor.fontColor,   
    },

    number: {
        fontSize: 18, 
        color: UColor.fontColor,   
    },

    state: {  
        fontSize: 12, 
        color: UColor.arrow, 
    },

    tablayout: {   
        flexDirection: 'row',  
    },  

    buttontab: {  
        margin: 5,
        width: 100,
        height: 33,
        borderRadius: 15,
        alignItems: 'center',   
        justifyContent: 'center', 
    },

    Official: {
        height:35, 
        flexDirection: "row", 
        justifyContent: 'flex-start', 
        alignItems: 'center'
    },

    Officialtitle: {
        fontSize: 12, 
        color: UColor.arrow, 
        marginTop: 5
    },

    Officialtext: {
        fontSize: 13, 
        color: UColor.tintColor, 
        marginTop: 5
    },

    synopsis: {
        flex: 1,  
        backgroundColor: UColor.fontColor, 
        paddingTop: 5, 
        paddingLeft: 35, 
        paddingRight: 35,
    },

    spsoutsource: {
        paddingTop: 20,
        paddingBottom: 25,
    },

    spstext: {  
       fontSize: 14,
       color: '#010101',
       lineHeight: 25,
    },  

    
});

export default AgentInfo;
