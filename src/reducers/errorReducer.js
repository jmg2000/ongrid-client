import C from '../actions/constants'

const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case C.GET_ERRORS:
      return action.payload
    default:
      return state
  }
}
