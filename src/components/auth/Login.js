import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import { loginUser } from '../../actions/authActions'

class Login extends Component {
  constructor () {
    super()
    this.state = {
      email: '',
      password: '',
      rememberMe: false,
      errors: {}
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }

  componentDidMount () {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/client')
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.errors) {
      return {
        ...prevState,
        errors: nextProps.errors
      }
    } else {
      return null
    }
  }

  onChange (e) {
    if (e.target.name === 'rememberMe') {
      this.setState({ [e.target.name]: e.target.checked })
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  onSubmit (e) {
    e.preventDefault()

    const user = {
      email: this.state.email,
      password: this.state.password,
      rememberMe: this.state.rememberMe
    }

    this.props.loginUser(user)
  }

  render () {
    const { errors } = this.state
    const { t } = this.props

    // if already authenticated, go to client page
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/client')
    }

    return (
      <section className='sign-in'>
        <div className='container'>
          <div className='row shadow p-4 mb-5 rounded'>
            <div className='col-md-4 ml-5'>
              <figure>
                <img className='img-fluid float-right' src='/images/signin-image.jpg' alt='sing up' />
              </figure>
              <Link to='/register' className='signin-image-link'>
                {t('login.createAccount')}
              </Link>
            </div>
            <div className='col-md-4 m-auto'>
              <h2 className='display-4'>{t('login.login')}</h2>
              <form noValidate onSubmit={this.onSubmit}>
                <div className='form-group'>
                  <label className='sr-only' htmlFor='email'>
                    Email
                  </label>
                  <div className='input-group'>
                    <div className='input-group-prepend'>
                      <div className='input-group-text'>
                        <i className='fas fa-envelope' />
                      </div>
                    </div>
                    <input
                      type='text'
                      className={classNames('form-control form-control-sm', {
                        'is-invalid': errors.email
                      })}
                      name='email'
                      placeholder={t('login.yourEmail')}
                      value={this.state.email}
                      onChange={this.onChange}
                    />
                    {errors.email && <div className='invalid-feedback'>{errors.email}</div>}
                  </div>
                </div>
                <div className='form-group'>
                  <label className='sr-only' htmlFor='password'>
                    Password
                  </label>
                  <div className='input-group'>
                    <div className='input-group-prepend'>
                      <div className='input-group-text'>
                        <i className='fas fa-lock' />
                      </div>
                    </div>
                    <input
                      type='password'
                      className={classNames('form-control form-control-sm', {
                        'is-invalid': errors.password
                      })}
                      name='password'
                      placeholder={t('login.yourPassword')}
                      value={this.state.password}
                      onChange={this.onChange}
                    />
                    {errors.password && <div className='invalid-feedback'>{errors.password}</div>}
                  </div>
                  <div className='form-check mt-2'>
                    <input type='checkbox' className='form-check-input' name='rememberMe' onChange={this.onChange} />
                    <label className='form-check-label' htmlFor='rememberMe'>
                      {t('login.rememberMe')}
                    </label>
                  </div>
                </div>
                <button type='submit' className='btn btn-primary btn-lg mt-4'>
                  {t('login.login')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

Login.propTypes = {
  loginUser: PropTypes.func,
  auth: PropTypes.object,
  errors: PropTypes.object,
  history: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
})

export default connect(
  mapStateToProps,
  { loginUser }
)(withRouter(withNamespaces('translation')(Login)))
