import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'

class Landing extends Component {
  componentDidMount () {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/client')
    }
  }
  
  render () {
    const { t } = this.props
    return (
      <div className='landing'>
        <div className='dark-overlay landing-inner text-light'>
          <div className='container'>
            <div className='row'>
              <div className='col-md-12 text-center'>
                <h1 className='display-3 mb-4'>OnGrid system</h1>
                <p className='lead'>
                  {' '}
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <hr />
                <Link to='/register' className='btn btn-lg btn-info mr-2'>
                  {t('landing.register')}
                </Link>
                <Link to='/login' className='btn btn-lg btn-light'>
                  {t('landing.login')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Landing.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(mapStateToProps)(withNamespaces('translation')(Landing))
