import React, { Component } from 'react'
import Roles from './Roles'
import Permissions from './Permissions'
import * as RBAC from './rbac'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import './rbac.css'

class RolesPermissions extends Component {
  constructor (props) {
    super(props)
    this.state = {
      roles: [],
      groups: [],
      loading: false,
      error: null,
      selectedRoleId: null
    }
    this.handlerSelectRole = this.handlerSelectRole.bind(this)
  }

  componentDidMount () {
    this.setState({ loading: true })
    RBAC.loadRBAC()
      .then(() => this.setState({ loading: false }))
      .catch(err =>
        this.setState({
          loading: false,
          error: err
        })
      )
  }

  handlerSelectRole (roleId) {
    this.setState({ selectedRoleId: roleId })
  }

  render () {
    const { loading, selectedRoleId } = this.state
    const { t } = this.props

    return (
      <div className='container'>
        {loading ? (
          <div className='loader'>
            <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
          </div>
        ) : (
          <div className='roles-permissions'>
            <div>
              <h2>{t('rolesPermissions.rolesPermissions')}</h2>
            </div>
            <Roles onSelectRole={this.handlerSelectRole} />
            {selectedRoleId && <Permissions selectedRoleId={selectedRoleId} />}
          </div>
        )}
      </div>
    )
  }
}

export default withNamespaces('translation')(RolesPermissions)
