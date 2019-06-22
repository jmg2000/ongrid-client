import axios from 'axios'
import setAuthToken from '../utils/setAuthToken'
import jwt_decode from 'jwt-decode'

import C from '../actions/constants'

// Register User
export const registerUser = (userData, setRegistred) => dispatch => {
  axios
    .post('/api/clients/register', userData)
    .then(res => setRegistred())
    .catch(err =>
      dispatch({
        type: C.GET_ERRORS,
        payload: err.response.data
      })
    )
}

// Login 
export const loginUser = userData => dispatch => {
  axios.post('/api/clients/login', userData)
    .then(response => {
      // Save to localStorage
      const { token } = response.data
      // Set token to ls
      localStorage.setItem('jwtToken', token)
      // Set token to Auth header
      setAuthToken(token)
      // Decode token to get user data
      const decoded = jwt_decode(token)
      // Set current user
      dispatch(setCurrentUser(decoded))
    })
    .catch(err => {
      dispatch({
        type: C.GET_ERRORS,
        payload: err.response.data
      })
    })
}

// Set logged in user
export const setCurrentUser = user => {
  return {
    type: C.SET_CURRENT_USER,
    payload: user
  }
}

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from localStorage
  localStorage.removeItem('jwtToken')
  // Remove auth header from future requests
  setAuthToken(false)
  // Set current user to {} witch will set isAuthenticated to false
  // Set current user to {} witch will set isAuthenticated to false
  dispatch(setCurrentUser({}))
}
