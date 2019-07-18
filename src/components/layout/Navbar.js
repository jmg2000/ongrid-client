import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link, NavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import { logoutUser } from '../../actions/authActions'

const selectedStyle = {
  fontWeight: 400,
  color: '#007bff',
  textDecoration: 'underline'
}

class Navbar extends Component {
  onLogoutClick (e) {
    e.preventDefault()
    this.props.logoutUser()
  }

  state = {
    currentLanguage: 'ru'
  }

  changeLanguage = (lang, fullName) => {
    const { i18n } = this.props
    i18n.changeLanguage(lang)
    this.setState({currentLanguage: fullName})
  }

  render () {
    const { isAuthenticated, user } = this.props.auth
    const { t } = this.props

    console.log(user.avatar)

    const authLinks = (
      <ul className='navbar-nav ml-auto'>
        <li className='nav-item'>
          <a href='#' onClick={this.onLogoutClick.bind(this)} className='nav-link'>
            <img
              className='rounded-circle'
              src={user.avatar}
              alt={user.name}
              style={{ width: '25px', marginRight: '5px' }}
              //title='You must have a Gravatar connected to your email to display an image'
            />{' '}
            {t('navbar.logout')}
          </a>
        </li>
      </ul>
    )

    const authNavLinks = (
      <ul className='navbar-nav mr-auto'>
        <li className='nav-item'>
          <NavLink to='/client' className='nav-link' activeClassName='active'>
            {t('navbar.info')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/users-groups' className='nav-link' activeClassName='active'>
            {t('navbar.users')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/configuration' className='nav-link' activeClassName='active'>
            {t('navbar.configurator')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/roles-permissions' className='nav-link' activeClassName='active'>
            {t('navbar.roles')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/messages' className='nav-link' activeClassName='active'>
            {t('navbar.messages')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/workplaces' className='nav-link' activeClassName='active'>
            {t('navbar.workPlaces')}
          </NavLink>
        </li>
        <li className='nav-item'>
          <NavLink to='/download' className='nav-link' activeClassName='active'>
            {t('navbar.download')}
          </NavLink>
        </li>
      </ul>
    )

    const guestLinks = (
      <ul className='navbar-nav ml-auto'>
        <li className='nav-item'>
          <Link className='nav-link' to='/register'>
            {t('navbar.register')}
          </Link>
        </li>
        <li className='nav-item'>
          <Link className='nav-link' to='/login'>
            {t('navbar.login')}
          </Link>
        </li>
      </ul>
    )

    return (
      // <nav className='navbar navbar-expand-sm sticky-top navbar-dark bg-dark mb-4'>
      <nav className='navbar navbar-expand-sm navbar-dark bg-dark mb-4'>
        <div className='container'>
          <Link className='navbar-brand mr-2' to='/'>
            OnGrid
          </Link>
          <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#mobile-nav'>
            <span className='navbar-toggler-icon' />
          </button>

          <div className='collapse navbar-collapse' id='mobile-nav'>
            {isAuthenticated && authNavLinks}
            <ul className='navbar-nav '>
              <li className='nav-item dropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  id='dropdown02'
                  data-toggle='dropdown'
                  aria-haspopup='true'
                  aria-expanded='false'
                >
                  {this.state.currentLanguage}
                </a>
                <div className='dropdown-menu' aria-labelledby='dropdown02'>
                  <a className='dropdown-item' href='#' onClick={() => this.changeLanguage('en', 'en')}>en</a>
                  <a className='dropdown-item' href='#' onClick={() => this.changeLanguage('ru-RU', 'ru')}>ru</a>
                </div>
              </li>
            </ul>

            {isAuthenticated ? authLinks : guestLinks}
          </div>
        </div>
      </nav>
    )
  }
}

Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(
  mapStateToProps,
  { logoutUser }
)(withNamespaces('translation')(Navbar))
