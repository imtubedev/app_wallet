import React from 'react'
import { AppRegistry } from 'react-native'
import Dva from './app/Dva'
import Apps from './app/App'
import models from './app/models'

const app = Dva({
  initialState: {},
  models: models,
  onError(e) {
    console.log('onError', e)
  },
})

const App = app.start(<Apps />)

AppRegistry.registerComponent('eostoken', () => App)