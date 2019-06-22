import React, { Component } from 'react'
// import {connect} from 'react-redux'
import * as RBAC from './rbac'
import Groups from './Groups'
import Users from './Users'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import ItemsCheckboxModal from './ItemsChecklistModal'
import './rbac.css'

class RolesGroups extends Component {
  constructor (props) {
    super(props)
    this.state = {
      users: [],
      groups: [],
      roles: [],
      loading: false,
      error: null,
      selectedGroup: null,
      selectedUser: null,
      showConfiguringRolesModal: false
    }
    this.handleSelectGroup = this.handleSelectGroup.bind(this)
    this.handleCreateGroup = this.handleCreateGroup.bind(this)
    this.handleDeleteGroup = this.handleDeleteGroup.bind(this)
    this.handleSaveGroup = this.handleSaveGroup.bind(this)
    this.handleConfiguringRoles = this.handleConfiguringRoles.bind(this)
    this.handleCloseConfiguringRoles = this.handleCloseConfiguringRoles.bind(this)
    this.handleSaveConfiguringRoles = this.handleSaveConfiguringRoles.bind(this)
    this.handleSelectUser = this.handleSelectUser.bind(this)
    this.handleSaveUser = this.handleSaveUser.bind(this)
    this.handleCreateUser = this.handleCreateUser.bind(this)
  }

  componentDidMount () {
    this.setState({ loading: true })
    RBAC.loadRBAC()
      .then(() => {
        let users = RBAC.getUsers()
        let groups = RBAC.getGroups()
        let roles = RBAC.getRoles()
        this.setState({
          loading: false,
          users,
          groups,
          roles
        })
      })
      .catch(err =>
        this.setState({
          loading: false,
          error: err
        })
      )
  }

  handleSelectGroup (group) {
    // const {selectedGroup} = this.state
    // if (selectedGroup) {
    //   this.setState({selectedGroup: null})
    // } else {
    //   this.setState({selectedGroup: group})
    // }
    this.setState({ selectedGroup: group })
  }

  handleCreateGroup () {
    let newGroup = new RBAC.Group(null, '', '')
    RBAC.addGroupToList(newGroup)
    this.setState({
      selectedGroup: newGroup
    })
  }

  handleDeleteGroup () {
    const { selectedGroup } = this.state
    if (selectedGroup) {
      selectedGroup.remove().then(() => {
        RBAC.removeGroupFromList(selectedGroup)
        this.setState({ groups: RBAC.getGroups() })
      })
    }
  }

  handleSaveGroup () {
    this.setState({
      groups: RBAC.getGroups()
    })
  }

  handleConfiguringRoles (group) {
    this.setState({
      selectedGroup: group,
      showConfiguringRolesModal: true
    })
  }

  handleCloseConfiguringRoles () {
    this.setState({
      showConfiguringRolesModal: false
    })
  }

  async handleSaveConfiguringRoles (roles) {
    const { selectedGroup } = this.state
    await selectedGroup.removeAllRoles()
    let assings = []
    for (let role of roles) {
      if (role.selected) {
        assings.push(selectedGroup.assignToRole(role))
      }
    }
    Promise.all(assings).then(() => {
      this.setState({
        showConfiguringRolesModal: false,
        groups: RBAC.getGroups()
      })
    })
  }

  handleSelectUser (user) {
    console.log('handleSelectUser')
    this.setState({ selectedUser: user })
  }

  handleCreateUser () {
    let newUser = new RBAC.User(null, '', '', '', null, null, 1)
    RBAC.addUserToList(newUser)
    this.setState({
      selectedUser: newUser
    })
  }

  handleSaveUser () {
    this.setState({
      users: RBAC.getUsers()
    })
  }

  handleDeleteUser () {
    const { selectedUser } = this.state
    if (selectedUser) {
      selectedUser.remove().then(() => {
        RBAC.removeUserFromList(selectedUser)
        this.setState({ users: RBAC.getUsers() })
      })
    }
  }

  render () {
    const { loading, groups, roles, users, selectedGroup, showConfiguringRolesModal, selectedUser } = this.state
    const { t } = this.props
    return (
      <div className='container'>
        {loading ? (
          <div className='loader'>
            <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
          </div>
        ) : (
          <div className='users-groups'>
            <div>
              <h2>{t('usersGroups.usersGroups')}</h2>
            </div>
            <Groups
              groups={groups}
              selectedGroup={selectedGroup}
              onCreate={this.handleCreateGroup}
              onDelete={this.handleDeleteGroup}
              onSelectGroup={this.handleSelectGroup}
              onGroupSave={this.handleSaveGroup}
              onConfiguringRoles={this.handleConfiguringRoles}
            />
            <ItemsCheckboxModal
              show={showConfiguringRolesModal}
              title={t('usersGroups.selectRoles')}
              items={this.getSelectedRolesForGroup(selectedGroup, roles)}
              onClose={this.handleCloseConfiguringRoles}
              onSave={this.handleSaveConfiguringRoles}
            />
            <Users
              users={users}
              groups={groups}
              roles={roles}
              selectedUser={selectedUser}
              onSelect={this.handleSelectUser}
              onCreate={this.handleCreateUser}
              onSave={this.handleSaveUser}
              onDelete={this.handleDeleteUser}
            />
          </div>
        )}
      </div>
    )
  }

  getSelectedRolesForGroup (group, roles) {
    let result = []
    if (group) {
      let groupRoles = group.getAllRoles()
      for (let role of roles) {
        if (groupRoles.find(r => r.id === role.id)) {
          result.push({ ...role, selected: true })
        } else {
          result.push({ ...role, selected: false })
        }
      }
    }
    return result
  }
}

export default withNamespaces('translation')(RolesGroups)
