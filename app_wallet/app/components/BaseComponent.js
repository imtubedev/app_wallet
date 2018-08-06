/**
 * 二级页面的基类,实现物理返回键的监听
 */
import React, {Component} from 'react';
import {
    BackHandler,
    BackAndroid,
    Platform,
} from 'react-native';
  
export default class BaseComponent extends React.Component {
    
    constructor(props){
        super(props)
    }

    //初始化,加载组件
    componentWillMount(){
        // if(Platform.OS === 'android'){
        //     BackHandler.addEventListener('hardwareBackPress',this.onBackAndroid);
        // }else {

        // }
    }
    //当组件被移除时调用
    componentWillUnmount(){
        // if(Platform.OS === 'android'){
        //     BackHandler.removeEventListener('hardwareBackPress',this.onBackAndroid);
        // }else {

        // }
    }
    
    //监听物理返回键
    // onBackAndroid = () => {
    //     this.props.navigation.goBack(); //返回上一个页面
    //     return true;
    // };

}


