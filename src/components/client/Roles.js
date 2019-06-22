import React, { Component } from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { withNamespaces } from 'react-i18next'
import * as RBAC from './rbac'

class Roles extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedRole: null,
      showRoleModal: false,
      modalTitle: '',
      roles: RBAC.getRoles(),
      roleName: '',
      roleDescription: ''
    }
    this.handlerSelectRole = this.handlerSelectRole.bind(this)
    this.handleRoleModalClose = this.handleRoleModalClose.bind(this)
    this.handleCreateRole = this.handleCreateRole.bind(this)
    this.handleEditRole = this.handleEditRole.bind(this)
    this.handlerRoleSave = this.handlerRoleSave.bind(this)
    this.handlerRoleDelete = this.handlerRoleDelete.bind(this)
  }

  handlerSelectRole (role) {
    const { selectedRole } = this.state
    const { onSelectRole } = this.props
    if (selectedRole) {
      this.setState({ selectedRole: null })
      onSelectRole(null)
    } else {
      this.setState({ 
        selectedRole: role,
        roleName: role.getName(),
        roleDescription: role.getDescription()
     })
      onSelectRole(role.id)
    }
  }

  handleRoleModalClose () {
    this.setState({ showRoleModal: false })
  }

  handleCreateRole () {
    let newRole = new RBAC.Role(null, '', '')
    RBAC.addRoleToList(newRole)
    this.setState({
      selectedRole: newRole,
      modalTitle: 'Новая роль',
      roleName: '',
      roleDescription: '',
      showRoleModal: true
    })
  }

  handleEditRole () {
    const { selectedRole } = this.state
    if (selectedRole) {
      this.setState({
        modalTitle: 'Редактирование роли',
        showRoleModal: true
      })
    }
  }

  handlerRoleSave () {
    const { selectedRole, roleName, roleDescription } = this.state
    selectedRole.setName(roleName)
    selectedRole.setDescription(roleDescription)
    selectedRole.save().then(response => {
      console.log(response)
      this.setState({
        showRoleModal: false,
        roles: RBAC.getRoles()
      })
    })
  }

  handlerRoleDelete () {
    const { selectedRole } = this.state
    if (selectedRole) {
      selectedRole.remove().then(() => {
        RBAC.removeRoleFromList(selectedRole)
        this.setState({ roles: RBAC.getRoles() })
      })
    }
  }

  handlerModalChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  render () {
    const { modalTitle, roles, selectedRole, showRoleModal } = this.state
    const { t } = this.props

    return (
      <section className='roles'>
        <div className='row roles-header'>
          <div className='col-md-12'>
            <h4 className='float-left'>{t('rolesPermissions.roles')}</h4>
            <div className='btn-group float-right' role='group'>
              <button type='button' className='btn btn-outline-primary' onClick={this.handleCreateRole}>
                {t('rolesPermissions.create')}
              </button>
              <button type='button' className='btn btn-outline-info' onClick={this.handleEditRole}>
                {t('rolesPermissions.modify')}
              </button>
              <button type='button' className='btn btn-outline-danger' onClick={this.handlerRoleDelete}>
                {t('rolesPermissions.delete')}
              </button>
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            <table
              className={selectedRole ? 'table table-sm table-bordered' : 'table table-sm table-bordered table-hover'}
            >
              <thead>
                <tr>
                  <th scope='col'>{t('rolesPermissions.roleName')}</th>
                  <th scope='col'>{t('rolesPermissions.description')}</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr
                    key={role.id}
                    onClick={() => this.handlerSelectRole(role)}
                    className={selectedRole && selectedRole.id === role.id ? 'active' : null}
                  >
                    <td>{role.getName()}</td>
                    <td>{role.getDescription()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={showRoleModal}>
          <ModalHeader toggle={this.handleRoleModalClose}>{modalTitle}</ModalHeader>
          <ModalBody>
            <form>
              <div className='form-group'>
                <label htmlFor='roleName'>Имя роли</label>
                <input
                  type='text'
                  className='form-control'
                  name='roleName'
                  value={this.state.roleName}
                  onChange={this.handlerModalChange}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='roleDescription'>Описание роли</label>
                <input
                  type='text'
                  className='form-control'
                  name='roleDescription'
                  value={this.state.roleDescription}
                  onChange={this.handlerModalChange}
                />
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <button role='button' className='btn btn-default' onClick={this.handleRoleModalClose}>
              Закрыть
            </button>
            <button role='button' className='btn btn-primary' onClick={this.handlerRoleSave}>
              Сохранить
            </button>
          </ModalFooter>
        </Modal>
      </section>
    )
  }
}

export default withNamespaces('translation')(Roles)
