import C from '../actions/constants'

const initialState = {
  info: {},
  loading: false,
  error: null
}

const client = (state = initialState, action) => {
  switch(action.type) {
    case C.FETCH_CLIENT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case C.FETCH_CLIENT_SUCCESS:
      return {
        ...state,
        loading: false,
        info: action.payload.client
      }
    case C.FETCH_CLIENT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        info: {}
      }
    case C.UPDATE_CLIENT_INFO:
      return (state.id !== action.id) ?
        state: 
        {
          ...state,
          info: action.info
        }
    default:
      return state
  }
}

export default client