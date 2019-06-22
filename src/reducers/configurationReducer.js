import C from '../actions/constants'

const initialState = {
  items: [],
  loading: false,
  error: null
}

const configuration = (state = initialState, action) => {
  switch (action.type) {
    case C.FETCH_CONFIGURATION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case C.FETCH_CONFIGURATION_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.configuration
      }
    case C.FETCH_CONFIGURATION_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      }
    case C.ADD_CONFIGURATION_OBJECT:
      return {
        ...state,
        items: [...state.items, configObject({}, action)]
      }
    case C.MODIFY_CONFIGURATION_OBJECT:
      return {
        ...state,
        items: state.items.map(obj => (obj.id !== action.payload.id ? obj : configObject(obj, action)))
      }
    case C.REMOVE_CONFIGURATION_OBJECT:
      return {
        ...state,
        items: state.items.filter(obj => obj.id.toString() !== action.objectId)
      }
    default:
      return state
  }
}

const configObject = (state = {}, action) => {
  switch (action.type) {
    case C.ADD_CONFIGURATION_OBJECT:
      return action.payload
    case C.MODIFY_CONFIGURATION_OBJECT:
      return {
        ...state,
        name: action.payload.name,
        description: action.payload.description,
        tag: action.payload.tag
      }
    default:
      return state
  }
}

export default configuration
