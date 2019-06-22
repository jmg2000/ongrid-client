import C from '../actions/constants'

const initialState = {
  loading: false,
  error: null,
  items: []
}

const workplaces = (state = initialState, action) => {
  switch (action.type) {
    case C.FETCH_WORKPLACES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      }
    case C.FETCH_WORKPLACES_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.workplaces
      }
    case C.FETCH_WORKPLACES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        items: []
      }
    case C.REMOVE_WORKPLACE:
      return {
        ...state,
        items: state.items.filter(wp => wp._id != action.id)
      }
    case C.ENABLE_WORKPLACE:
      return {
        ...state,
        items: state.items.map(wp => workplace(wp, action))
      }
    case C.DISABLE_WORKPLACE:
      return {
        ...state,
        items: state.items.map(wp => workplace(wp, action))
      }
    default:
      return state
  }
}

const workplace = (state = {}, action) => {
  switch (action.type) {
    case C.ENABLE_WORKPLACE:
      return state._id != action.id
        ? state
        : {
          ...state,
          enabled: true
        }
    case C.DISABLE_WORKPLACE:
      return state._id != action.id
        ? state
        : {
          ...state,
          enabled: false
        }
    default:
      return state
  }
}

export default workplaces
