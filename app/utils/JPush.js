import {Platform,DeviceEventEmitter} from 'react-native';
import JPushModule from 'jpush-react-native';
import { EasyDialog } from '../components/Dialog';
const init = (navigation) => {
    
    if (Platform.OS === 'android') {
        JPushModule.initPush()
        JPushModule.notifyJSDidLoad(resultCode => {
          if (resultCode === 0) {}
        })
    }

    if (Platform.OS === 'ios') {
        JPushModule.setupPush();
        //点击通知唤起app
        JPushModule.addOpenNotificationLaunchAppListener(map=>{
            let extras =  JSON.parse(map.extras);
            if(extras && extras.url){
                if(extras.url.startsWith("http://") || extras.url.startsWith("https://")){
                    navigation("Web",{title:map.alertContent,url:extras.url});
                }else if(extras.url.startsWith("eostoken://")){
                    let nav = extras.url.replace("eostoken://","")
                    navigation(nav,extras.params?extras.params:{});
                }else if(extras.url.startsWith("alert://")){
                    EasyDialog.show("温馨提示",map.alertContent,"知道了",null,()=>{EasyDialog.dismis()});
                }else{

                }
            }
        });
    }
    //收到自定义消息
    JPushModule.addReceiveCustomMsgListener(map => {
        //alert(JSON.stringify(map))
    });
    //收到消息
    JPushModule.addReceiveNotificationListener(map => {

        let extras = JSON.parse(map.extras);
        if (extras && extras.url && extras.url.startsWith("transfer://")) {
            DeviceEventEmitter.emit('wallet_info')
        }
    });
    //点击通知
    JPushModule.addReceiveOpenNotificationListener(map => {
        let extras = JSON.parse(map.extras);
        if (extras && extras.url) {
            if (extras.url.startsWith("http://") || extras.url.startsWith("https://")) {
                navigation("Web", { title: map.alertContent, url: extras.url });
            } else if (extras.url.startsWith("eostoken://")) {
                let nav = extras.url.replace("eostoken://", "")
                navigation(nav, extras.params ? extras.params : {});
            } else if (extras.url.startsWith("alert://")) {
                EasyDialog.show("温馨提示", map.alertContent, "知道了", null, () => { EasyDialog.dismis() });
            } else if (extras.url.startsWith("transfer://")) {

            } else {

            }
        }
    });
    //注册设备
    JPushModule.addGetRegistrationIdListener(registrationId => {
        
    });
};

export default {
  init
};
