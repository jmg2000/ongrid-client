import React, { Component, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import jwt_decode from 'jwt-decode'
import axios from 'axios'
import setAuthToken from './utils/setAuthToken'
import { setCurrentUser, logoutUser } from './actions/authActions'
import { fetchClient } from './actions/clientActions'
import { fetchClientMessages } from './actions/messageActions'
import { fetchWorkplaces } from './actions/workplaceActions'
import { fetchConfiguration } from './actions/configurationActions'
import store from './store'

import PrivateRoute from './components/common/PrivateRoute'

// Layout
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Landing from './components/layout/Landing'
// Auth
import Register from './components/auth/Register'
import Login from './components/auth/Login'
import EmailVerification from './components/auth/EmailVerification'
// Client
import ClientInfo from './components/client/ClientInfo'
import RolesPermissions from './components/client/RolesPermissions'
import UsersGroups from './components/client/UsersGroups'
// import Configuration from './components/client/configurator/Configuration'
import Messages from './components/client/messages/Messages'
import WorkPlaces from './components/client/WorkPlaces'
import Download from './components/client/Download'

import AdminPage from './components/admin/Admin'

import './App.css'

const Configurator = lazy(() => import('./components/client/configurator/Configuration'))

axios.defaults.baseURL = window.location.protocol + '//' + window.location.hostname + ':5000'

const createUpdateAuthInterceptor = (http, refreshToken) => error => {
  if (error.response.status !== 401) {
    console.log('Reject')
    return Promise.reject(error)
  }
  console.log('Iterceptors: ', error)
  console.log(error.config)
  console.log(error.response.data)
  console.log(error.response.status)
  console.log(error.response.headers)
  console.log(error.response.message)
  // We need to update access token, because the current token is expired
  const instance = http.create({
    baseURL: window.location.protocol + '//' + window.location.hostname + ':5000',
    headers: { Authorization: refreshToken }
  })
  instance
    .get('/api/desktop/access-token')
    .then(response => {
      console.log('access token', response.data)
      http.defaults.headers.common['Authorization'] = response.data.token
      error.config.headers['Authorization'] = response.data.token
      console.log(error.config)
      return http(error.config)
    })
    .catch(err => {
      console.log('instance error', err)
      return Promise.reject(err)
    })
}

const updateRefreshTokenCB = createUpdateAuthInterceptor(axios, 'BearereyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiY2xpZW50SWQiOiI1YWQzOTczM2JmZmY0ZTQzYmM2NjFhMTQiLCJsb2dpbiI6ImptZzIwMDAiLCJuYW1lIjoiSmVhbi1NYXJjIEdvdXJpZXIiLCJpYXQiOjE1NTQyMTYyNTQsImV4cCI6MTU1NDgyMTA1NCwiYXVkIjoicmVmcmVzaCIsImlzcyI6Im9uZ3JpZC54eXoifQ.QLpo1dyddNIjNsOYSV8tfVnWi3Nz23KUYKuEnAXQXyI')

axios.interceptors.response.use(null, updateRefreshTokenCB)

// Check for token
if (localStorage.jwtToken) {
  // Set auth token header auth
  setAuthToken(localStorage.jwtToken)
  // Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken)
  // Set user and isAuthenicated
  store.dispatch(setCurrentUser(decoded))
  // Load data from server
  store.dispatch(fetchClientMessages())
  // Check for expired token
  const currentTime = Date.now() / 1000
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser())
    // TODO: Clear current Profile

    // Redirect to login
    window.location.href = '/login'
  }
}

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <Router>
          <Suspense fallback={<div>Loading...</div>}>
            <div className='App'>
              <Navbar />
              <Route exact path='/' component={Landing} />
              <Route exact path='/register' component={Register} />
              <Route exact path='/login' component={Login} />
              <Route exact path='/email-verification/:token' component={EmailVerification} />
              <Switch>
                <PrivateRoute exact path='/client' component={ClientInfo} />
                <PrivateRoute exact path='/users-groups' component={UsersGroups} />
                <PrivateRoute exact path='/roles-permissions' component={RolesPermissions} />
                <PrivateRoute exact path='/messages' component={Messages} />
                <PrivateRoute exact path='/workplaces' component={WorkPlaces} />
                <PrivateRoute exact path='/admin' component={AdminPage} />
                <PrivateRoute exact path='/configuration' component={Configurator} />
                <PrivateRoute exact path='/download' component={Download} />
              </Switch>
              <Footer />
            </div>
          </Suspense>
        </Router>
      </Provider>
    )
  }
}

export default App
