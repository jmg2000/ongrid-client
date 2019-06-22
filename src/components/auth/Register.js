import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import classNames from 'classnames'
import { withNamespaces } from 'react-i18next'
import { registerUser } from '../../actions/authActions'
import ReCAPTCHA from 'react-google-recaptcha'
import isEmpty from '../../validation/is-empty'
// import '../fonts/material-icon/css/material-design-iconic-font.min.css'
import './style.css'

class Register extends Component {
  constructor () {
    super()
    this.state = {
      username: '',
      email: '',
      phone: '',
      password: '',
      password2: '',
      agreeTerm: '',
      reCaptcha: '',
      errors: {},
      registerSuccess: false
    }
    this.onChange = this.onChange.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
    this.onCaptchaChange = this.onCaptchaChange.bind(this)
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
    if (e.target.name === 'agreeTerm') {
      this.setState({ [e.target.name]: e.target.checked })
    } else {
      this.setState({ [e.target.name]: e.target.value })
    }
  }

  onCaptchaChange (value) {
    console.log(value)
    this.setState({ reCaptcha: value })
  }

  onSubmit (e) {
    e.preventDefault()

    const newUser = {
      username: this.state.username,
      email: this.state.email,
      phone: this.state.phone,
      password: this.state.password,
      password2: this.state.password2,
      agreeTerm: this.state.agreeTerm ? 'on' : 'off',
      reCaptcha: this.state.reCaptcha
    }

    this.props.registerUser(newUser, () => this.setState({ registerSuccess: true }))
  }

  render () {
    const { errors, registerSuccess } = this.state
    const { t } = this.props

    return (
      <div>
        <section className='signup'>
          <div className='container'>
            {registerSuccess ? (
              <section className='row shadow p-4 mb-5 rounded'>
                <div className='lead text-center'>
                  {`На адрес ${this.state.email} было отправлено письмо с ссылкой для активации аккаунта. Перейдите
                  по ссылке в письме для активации.`}
                </div>
              </section>
            ) : (
              <div className='row shadow p-4 mb-5 rounded'>
                <div className='col-md-4 ml-5'>
                  <h2 className='display-4'>{t('register.register')}</h2>
                  <form noValidate onSubmit={this.onSubmit}>
                    <div className='form-group'>
                      <label className='sr-only' htmlFor='username'>
                        Username
                      </label>
                      <div className='input-group'>
                        <div className='input-group-prepend'>
                          <div className='input-group-text'>
                            <i className='fas fa-user' />
                          </div>
                        </div>
                        <input
                          type='text'
                          className={classNames('form-control form-control-sm', {
                            'is-invalid': errors.username
                          })}
                          name='username'
                          placeholder={t('register.yourName')}
                          value={this.state.username}
                          onChange={this.onChange}
                        />
                        {errors.username && <div className='invalid-feedback'>{errors.username}</div>}
                      </div>
                    </div>
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
                          type='email'
                          className={classNames('form-control form-control-sm', {
                            'is-invalid': errors.email
                          })}
                          name='email'
                          placeholder={t('register.yourEmail')}
                          value={this.state.email}
                          onChange={this.onChange}
                        />
                        {errors.email && <div className='invalid-feedback'>{errors.email}</div>}
                      </div>
                    </div>
                    <div className='form-group'>
                      <label className='sr-only' htmlFor='phone'>
                        Phone
                      </label>
                      <div className='input-group'>
                        <div className='input-group-prepend'>
                          <div className='input-group-text'>
                            <i className='fas fa-phone' />
                          </div>
                        </div>
                        <input
                          type='phone'
                          className={classNames('form-control form-control-sm', {
                            'is-invalid': errors.phone
                          })}
                          name='phone'
                          placeholder={t('register.yourPhone')}
                          value={this.state.phone}
                          onChange={this.onChange}
                        />
                        {errors.phone && <div className='invalid-feedback'>{errors.phone}</div>}
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
                          placeholder={t('register.yourPassword')}
                          value={this.state.password}
                          onChange={this.onChange}
                        />
                        {errors.password && <div className='invalid-feedback'>{errors.password}</div>}
                      </div>
                    </div>
                    <div className='form-group'>
                      <label className='sr-only' htmlFor='password2'>
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
                            'is-invalid': errors.password2
                          })}
                          name='password2'
                          placeholder={t('register.repeatPassword')}
                          value={this.state.password2}
                          onChange={this.onChange}
                        />
                        {errors.password2 && <div className='invalid-feedback'>{errors.password2}</div>}
                      </div>
                    </div>
                    <div className='form-check'>
                      <input
                        type='checkbox'
                        className={classNames('form-check-input', {
                          'is-invalid': errors.agreeTerm
                        })}
                        name='agreeTerm'
                        onChange={this.onChange}
                      />
                      <label className='form-check-label' htmlFor='agreeTerm'>
                        {t('register.iAgree')}<a href='/term-service'>{t('register.terms')}</a>
                      </label>
                      {errors.agreeTerm && <div className='invalid-feedback'>{errors.agreeTerm}</div>}
                    </div>
                    <ReCAPTCHA
                      sitekey='6Ldx5oIUAAAAAEnNsNHUiKggZS1ZFV4RLIHtyTq8'
                      size='normal'
                      onChange={this.onCaptchaChange}
                    />
                    {errors.reCaptcha && <div className='text-danger'>{errors.reCaptcha}</div>}
                    <button type='submit' className='btn btn-primary btn-lg mt-4'>
                      {t('register.register')}
                    </button>
                  </form>
                </div>
                <div className='col-md-4 m-auto'>
                  <figure>
                    <img className='img-fluid float-right' src='/images/signup-image.jpg' alt='sing up' />
                  </figure>
                  <Link to='/login' className='signup-image-link'>
                    {t('register.iMember')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }
}

Register.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  registerUser: PropTypes.func,
  history: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
})

export default connect(
  mapStateToProps,
  { registerUser }
)(withRouter(withNamespaces('translation')(Register)))
