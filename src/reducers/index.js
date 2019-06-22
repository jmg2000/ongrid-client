import { combineReducers} from 'redux'
import authReducer from './authReducer'
import clientReducer from './clientReducer'
import messagesReducer from './messagesReducer'
import workplacesReducer from './workplaceReducer'
import configReducer from './configurationReducer'
import propsReducer from './propsReducer'
import errorReducer from './errorReducer'
import { reducer as formReducer } from 'redux-form'

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  client: clientReducer,
  messages: messagesReducer,
  workplaces: workplacesReducer,
  configuration: configReducer,
  currentProps: propsReducer,
  form: formReducer
})