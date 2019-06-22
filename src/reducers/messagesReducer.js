import C from '../actions/constants'

const initialState = {
  loading: false,
  error: null,
  items: []
}

const messages = (state = initialState, action) => {
  switch (action.type) {
    case C.FETCH_MESSAGES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case C.FETCH_MESSAGES_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.messages
      }
    case C.FETCH_MESSAGES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      }
    case C.ADD_MESSAGE:
      return {
        ...state,
        items: [...state.items, message({}, action)]
      }
    case C.SET_MESSAGE_READED:
      return {
        ...state,
        items: state.items.map(m => message(m, action))
      }
    case C.REMOVE_MESSAGE:
      return {
        ...state,
        items: state.items.filter(m => m.id != action.id)
      }
    default:
      return state
  }
}

const message = (state = {}, action) => {
  console.log(state, action)
  switch (action.type) {
    case C.ADD_MESSAGE:
      return {
        id: action.id,
        parentId: action.parentId,
        from: action.from,
        customer: action.customer,
        direction: action.direction,
        created: action.created,
        body: action.body,
        attachments: action.attachments,
        readed: false
      }
    case C.SET_MESSAGE_READED:
      return state.id != action.id
        ? state
        : {
          ...state,
          readed: true
        }
    default:
      return state
  }
}

export default messages
