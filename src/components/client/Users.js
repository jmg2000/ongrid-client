import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { withNamespaces } from 'react-i18next'
import * as RBAC from './rbac'
import moment from 'moment'

class UsersList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showUserModal: false,
      titleUserModal: ''
    }
    this.handleUserModalClose = this.handleUserModalClose.bind(this)
    this.handleEditUser = this.handleEditUser.bind(this)
    this.handlerUserSave = this.handlerUserSave.bind(this)
    this.handleCreateUser = this.handleCreateUser.bind(this)
  }

  handleUserModalClose () {
    this.setState({ showUserModal: false })
  }

  handleEditUser () {
    const { selectedUser, t } = this.props
    if (selectedUser) {
      this.setState({
        titleUserModal: t('users.editUser'),
        showUserModal: true
      })
    }
  }

  handleCreateUser () {
    const { onCreate, t } = this.props
    onCreate()
    this.setState({
      tittleUserModal: t('users.newUser'),
      showUserModal: true
    })
  }

  handlerUserSave (fullName, login, password, group, role, active) {
    const { selectedUser, onSave } = this.props
    selectedUser.fullName = fullName
    selectedUser.login = login
    selectedUser.password = password
    selectedUser.assignGroup(group)
    selectedUser.assignRole(role)
    selectedUser.active = active
    selectedUser.save().then(response => {
      this.setState({
        showUserModal: false
      })
    })
    onSave()
  }

  render () {
    const { users, groups, roles, selectedUser, onSelect, onDelete, t } = this.props
    const { showUserModal, titleUserModal } = this.state
    return (
      <React.Fragment>
        <section className='users'>
          <div className='row users-header'>
            <div className='col-md-12'>
              <h4 className='float-left'>{t('users.users')}</h4>
              <div className='btn-group float-right' role='group'>
                <button type='button' className='btn btn-outline-primary' onClick={this.handleCreateUser}>
                  {t('users.create')}
                </button>
                <button type='button' className='btn btn-outline-info' onClick={this.handleEditUser}>
                  {t('users.modify')}
                </button>
                <button type='button' className='btn btn-outline-danger' onClick={onDelete}>
                  {t('users.delete')}
                </button>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-12'>
              <table className='table table-sm table-bordered'>
                <thead>
                  <tr>
                    <th scope='col'>{t('users.userName')}</th>
                    <th scope='col'>{t('users.login')}</th>
                    <th scope='col'>{t('users.dateCreation')}</th>
                    <th scope='col'>{t('users.dateLogin')}</th>
                    <th scope='col'>{t('users.group')}</th>
                    <th scope='col'>{t('users.personalRole')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <UserRow key={user.id} user={user} selectedUser={selectedUser} onSelect={onSelect} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        {showUserModal && (
          <UserEditModal
            show={showUserModal}
            title={titleUserModal}
            user={selectedUser}
            roles={roles}
            groups={groups}
            onClose={this.handleUserModalClose}
            onSave={this.handlerUserSave}
            t={t}
          />
        )}
      </React.Fragment>
    )
  }
}

UsersList.propTypes = {
  users: PropTypes.array,
  groups: PropTypes.array,
  roles: PropTypes.array,
  selectedUser: PropTypes.object,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  onCreate: PropTypes.func,
  onSave: PropTypes.func
}

const UserRow = ({ user, selectedUser, onSelect }) => (
  <tr className={selectedUser && selectedUser.id === user.id ? 'active' : null} onClick={() => onSelect(user)}>
    <td>{user.fullName}</td>
    <td>{user.login}</td>
    <td>{moment(user.createdAt).format('DD.MM.YYYY HH:mm')}</td>
    <td>{user.logon && moment(user.logon).format('DD.MM.YYYY HH:mm')}</td>
    <td>{user.getGroup() ? user.getGroup().name : 'Не установлена'}</td>
    <td>{user.getPersonalRole() ? user.getPersonalRole().name : 'Не установлена'}</td>
  </tr>
)

UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  selectedUser: PropTypes.object,
  onUserSelect: PropTypes.func
}

class UserEditModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullName: props.user.fullName,
      login: props.user.login,
      password: props.user.password,
      group: props.user.getGroup(),
      role: props.user.getPersonalRole(),
      active: props.user.active > 0
    }
    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleLoginChange = this.handleLoginChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleGroupChange = this.handleGroupChange.bind(this)
    this.handleRoleChange = this.handleRoleChange.bind(this)
    this.handleActiveChange = this.handleActiveChange.bind(this)
  }

  handleNameChange (event) {
    this.setState({ fullName: event.target.value })
  }

  handleLoginChange (event) {
    this.setState({ login: event.target.value })
  }

  handlePasswordChange (event) {
    this.setState({ password: event.target.value })
  }

  handleGroupChange (event) {
    const { groups } = this.props
    let group = groups.find(g => g.id === parseInt(event.target.value))
    console.log(group)
    this.setState({ group })
  }

  handleRoleChange (event) {
    const { roles } = this.props
    let role = roles.find(r => r.id === parseInt(event.target.value))
    console.log(role)
    this.setState({ role })
  }

  handleActiveChange (event) {
    console.log(event.target.checked)
    this.setState({ active: event.target.checked })
  }

  render () {
    const { show, title, onClose, onSave, roles, groups, t } = this.props
    const { fullName, login, password, group, role, active } = this.state
    return (
      <Modal isOpen={show} size='sm'>
        <ModalHeader toggle={onClose}>{title}</ModalHeader>
        <ModalBody>
          <form className='form'>
            <div className='form-group'>
              <label htmlFor='userName'>{t('users.userName')}</label>
              <input
                type='text'
                className='form-control'
                id='userName'
                value={fullName}
                onChange={this.handleNameChange}
                placeholder={t('users.enterName')}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='login'>{t('users.login')}</label>
              <input
                type='text'
                className='form-control'
                id='login'
                aria-descibedby='loginHelp'
                placeholder={t('users.enterLogin')}
                value={login}
                onChange={this.handleLoginChange}
              />
              <small id='loginHelp' className='form-text text-muted'>
                {t('users.nameForLogin')}
              </small>
            </div>
            <div className='form-group'>
              <label htmlFor='password'>{t('users.password')}</label>
              <input
                type='password'
                className='form-control'
                id='password'
                placeholder={t('users.password')}
                onChange={this.handlePasswordChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='group'>{t('users.group')}</label>
              <select className='form-control' id='group' value={group && group.id} onChange={this.handleGroupChange}>
                <option>{t('users.notDefined')}</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='form-group'>
              <label htmlFor='role'>{t('users.role')}</label>
              <select className='form-control' id='role' value={role && role.id} onChange={this.handleRoleChange}>
                <option>{t('users.notDefined')}</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='form-check'>
              <input
                className='form-check-input'
                type='checkbox'
                name='role'
                checked={active}
                onChange={this.handleActiveChange}
              />
              <label className='form-check-label' htmlFor='role'>
                {t('users.active')}
              </label>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <button role='button' className='btn btn-secondary' onClick={onClose}>
          {t('users.close')}
          </button>
          <button
            role='button'
            className='btn btn-primary'
            onClick={() => onSave(fullName, login, password, group, role, active)}
          >
            {t('users.save')}
          </button>
        </ModalFooter>
      </Modal>
    )
  }
}

UserEditModal.propTypes = {
  show: PropTypes.bool,
  title: PropTypes.string,
  user: PropTypes.object,
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  roles: PropTypes.array,
  groups: PropTypes.array,
  t: PropTypes.func
}

export default withNamespaces('translation')(UsersList)
