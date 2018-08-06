import React from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Modal,
  Text,
  Platform,
  TouchableHighlight,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
  Dimensions,
} from 'react-native';
import { material } from 'react-native-typography';
const { height } = Dimensions.get('window');
var ScreenWidth = Dimensions.get('window').width;
import ProgressBar from "../components/ProgressBar";

const prs = 0;

const tk = null;

export class EasyDialog {
    
    constructor() {
    
    }

    static bind(dialog) {
        this.map["dialog"] = dialog;
    }

    static unBind() {
        this.map["dialog"] = dialog;
        delete this.map["dialog"];
    }

    static show(title,content,okLable,disLabel,okHandler) {
      this.tm=setTimeout(()=>{
        this.map["dialog"].setState({ 
            "visible": true,
            title,
            content,
            okLable,
            disLabel,
            okHandler
        });
        clearTimeout(this.tm);
      },600);
    }

    static dismis() {
        this.map["dialog"].setState({
            "visible":false
        });
    }

    static startProgress(){
      this.map["dialog"].setState({okHandler:null,disLabel:null,showProgress:true});
      var th = this;
      tk = setInterval(function(){
        th.map["dialog"].setState({progress:prs})
      },300);
    }

    static endProgress(){
      clearInterval(tk);
    }

    static progress(total,current){
      let p = current/total;
      prs = parseInt((ScreenWidth-32)*p);
    }
}

EasyDialog.map = {};

export class Dialog extends React.Component {

    state = {
        visible:false,
        showProgress:false,
        progress:0
    }

    constructor(props) {
        super(props);
        EasyDialog.bind(this);
    }
    
    render() {
        return (
          <Modal
            animationType={'fade'}
            transparent={true}
            hardwareAccelerated
            visible={this.state.visible}
            onRequestClose={()=>{}}
            supportedOrientations={['portrait', 'landscape']}>
            <TouchableWithoutFeedback>
              <View style={styles.backgroundOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}>
                  <View style={[styles.modalContainer,styles.modalContainerPadding]}>
                    <TouchableWithoutFeedback>
                      <View>
                        <View style={styles.titleContainer}>
                            <Text style={[material.title,{color:'#586888'}]}>{this.state.title}</Text>
                        </View>
                        <View style={[styles.contentContainer,styles.contentContainerPadding]}>
                          {
                            (typeof(this.state.content)=='string')?<Text style={styles.contentext}>{this.state.content}</Text>:this.state.content
                          }
                        </View>
                        <View style={styles.actionsContainer}>
                          {this.state.disLabel?(
                            <TouchableHighlight
                              testID="dialog-cancel-button"
                              style={styles.disactionContainer}
                              underlayColor="#8696B0"
                              onPress={()=>{this.setState({visible:false})}}>
                              <Text style={[material.button, { color: '#FFFFFF' }]}>{this.state.disLabel}</Text>
                            </TouchableHighlight>
                          ):null
                        }
                        {this.state.okHandler?(
                            <TouchableHighlight
                              testID="dialog-ok-button"
                              style={styles.okactionContainer}
                              underlayColor="#8696B0"
                              onPress={this.state.okHandler}>
                              <Text style={[material.button, { color: '#FFFFFF' }]}>{this.state.okLable}</Text>
                            </TouchableHighlight>
                          ):null
                        }
                        {this.state.showProgress?<ProgressBar
                            style={{marginTop:47,width:ScreenWidth-32}}
                            progress={this.state.progress}
                          />:null}
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
                </KeyboardAvoidingView>
              </View>
            </TouchableWithoutFeedback>
          </Modal>)
    }
}

const styles = StyleSheet.create({
  backgroundOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    marginHorizontal: 10,
    padding: 10,
    marginVertical: 106,
    minWidth: 320,
    borderRadius: 2,
    elevation: 24,
    overflow: 'hidden',
    backgroundColor:"#ffffff",
    borderRadius: 5,
  },
  modalContainerPadding: {
    paddingTop: 24,
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainerScrolled: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#DCDCDC",
  },
  contentContainer: {
    flex: -1,
  },
  contentContainerPadding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentext : {
    fontSize: 16,
    lineHeight: 25,
  },
  contentContainerScrolled: {
    flex: -1,
    maxHeight: height - 264, // (106px vertical margin * 2) + 52px
  },
  contentContainerScrolledPadding: {
    paddingHorizontal: 24,
  },
  actionsContainerScrolled: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#DCDCDC",
  },
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  disactionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minWidth: 140,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff6565',
    borderRadius: 3,
  },
  okactionContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    minWidth: 140,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#65CAFF',
    borderRadius: 3,
  },
});
