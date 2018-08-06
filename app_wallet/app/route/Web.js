import React, { Component } from 'react'
import {
  WebView,
  StyleSheet,
  CameraRoll, Image, View, BackHandler, Text, Platform, DeviceEventEmitter, BackAndroid, AppState, Linking, Dimensions, ScrollView, Animated, Easing
} from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment';
import Button from '../components/Button'
import ViewShot from "react-native-view-shot";
require('moment/locale/zh-cn');
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
const { width } = Dimensions.get('window')
import { EasyToast } from "../components/Toast"
import { EasyDialog } from "../components/Dialog"
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import QRCode from 'react-native-qrcode-svg';
import { redirect } from '../utils/Api'
import Constants from '../utils/Constants'
import AnalyticsUtil from '../utils/AnalyticsUtil';
import BaseComponent from "../components/BaseComponent";

var WeChat = require('react-native-wechat');

@connect(({ news }) => ({ ...news }))
export default class Web extends BaseComponent {

  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.state.params.title,
      headerRight: (navigation.state.params.news && <Button onPress={navigation.state.params.onPress}>
        <View style={{ padding: 15 }}>
          <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
        </View>
      </Button>
      ),
    }
  }

  share = () => {
    this.props.dispatch({ type: 'news/share', payload: { news: this.state.news } });
    DeviceEventEmitter.emit('share', this.state.news);
    // AnalyticsUtil.onEvent('Forward');
  }

  constructor(props) {
    super(props)
    this.props.navigation.setParams({ onPress: this.share });
    this.state = {
      progress: new Animated.Value(10),
      error: false,
      news: this.props.navigation.state.params.news,
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000)
    }
    let noop = () => { }
    this.__onLoad = this.props.onLoad || noop
    this.__onLoadStart = this.props.onLoadStart || noop
    this.__onError = this.props.onError || noop
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  _onLoad() {
    Animated.timing(this.state.progress, {
      toValue: width,
      duration: 200
    }).start(() => {
      setTimeout(() => {
        this.state.progress.setValue(0);
      }, 300)
    })
    this.__onLoad()
  }
  _onLoadStart() {
    this.state.progress.setValue(0);
    Animated.timing(this.state.progress, {
      toValue: width * .7,
      duration: 5000
    }).start()
    this.__onLoadStart()
  }
  _onError() {
    setTimeout(() => {
      this.state.progress.setValue(0);
    }, 300)
    this.setState({ error: true })
    this.__onError()
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.mainColor }}>
          

        <WebView
          source={{ uri: this.props.navigation.state.params.url }}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          style={[styles.webview_style]}
          onLoad={this._onLoad.bind(this)}
          onLoadStart={this._onLoadStart.bind(this)}
          onError={this._onError.bind(this)}
        >
        </WebView>
        <View style={[styles.infoPage, this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <Animated.View style={[styles.progress, { width: this.state.progress }]}></Animated.View>
        
      </View>
    )
  }
}

const styles = StyleSheet.create({
  webview_style: {
    flex: 1,
    backgroundColor: '#fff'
  },
  progress: {
    position: "absolute",
    height: 2,
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: UColor.tintColor
  },
  infoPage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    paddingTop: 50,
    alignItems: "center",
    transform: [
      { translateX: width }
    ],
    backgroundColor: UColor.secdColor
  },
  showInfo: {
    transform: [
      { translateX: 0 }
    ]
  }
})