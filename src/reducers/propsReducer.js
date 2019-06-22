import C from '../actions/constants'

const initialState = {
  properties: [],
  events: [],
  loading: false,
  error: null
}

const props = (state = initialState, action) => {
  switch (action.type) {
    case C.FETCH_PROPS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case C.FETCH_PROPS_SUCCESS:
      return {
        ...state,
        loading: false,
        properties: action.payload.props,
        events: action.payload.events
      }
    case C.FETCH_PROPS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        properties: [],
        events: []
      }
    case C.ADD_OBJECT_PROP:
      return {
        ...state,
        properties: [...state.properties, property({}, action)]
      }
    case C.ADD_OBJECT_EVENT:
      return {
        ...state,
        events: [...state.events, event({}, action)]
      }
    case C.MODIFY_OBJECT_PROP:
      return {
        ...state,
        properties: state.properties.map(p => (p.id !== action.payload.id ? p : property(p, action)))
      }
    case C.MODIFY_OBJECT_EVENT:
      return {
        ...state,
        events: state.events.map(e => (e.id !== action.payload.id ? e : event(e, action)))
      }
    default:
      return state
  }
}

const property = (state = {}, action) => {
  switch (action.type) {
    case C.ADD_OBJECT_PROP:
      return action.payload
    case C.MODIFY_OBJECT_PROP:
      return {
        ...state,
        paramValue: action.payload.paramValue
      }
    default:
      return state
  }
}

const event = (state = {}, action) => {
  switch (action.type) {
    case C.ADD_OBJECT_EVENT:
      return action.payload
    case C.MODIFY_OBJECT_EVENT:
      return {
        ...state,
        eventValue: action.payload.eventValue
      }
    default:
      return state
  }
}

export default props
