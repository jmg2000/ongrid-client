import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withNamespaces } from 'react-i18next'
import NameDescriptionModal from './NameDescriptionModal'
// import  * as RBAC from './rbac'

class Groups extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showGroupModal: false,
      groupModalTitle: '',
      groupName: '',
      groupDescription: ''
    }
    this.handleGroupModalClose = this.handleGroupModalClose.bind(this)
    this.handlerGroupSave = this.handlerGroupSave.bind(this)
    this.handleEditGroup = this.handleEditGroup.bind(this)
    this.handleCreateGroup = this.handleCreateGroup.bind(this)
  }

  handleGroupModalClose () {
    this.setState({ showGroupModal: false })
  }

  handleCreateGroup () {
    const { onCreate, t } = this.props
    onCreate()
    this.setState({
      groupModalTitle: t('groups.newGroup'),
      showGroupModal: true
    })
  }

  handleEditGroup () {
    const { selectedGroup, t } = this.props
    if (selectedGroup) {
      this.setState({
        groupModalTitle: t('groups.editGroup'),
        showGroupModal: true
      })
    }
  }

  handlerGroupSave (name, description) {
    const { selectedGroup, onGroupSave } = this.props
    selectedGroup.setName(name)
    selectedGroup.setDescription(description)
    selectedGroup.save().then(response => {
      this.setState({
        showGroupModal: false
      })
    })
    onGroupSave()
  }

  render () {
    const { groups, selectedGroup, onDelete, onSelectGroup, onConfiguringRoles, t } = this.props
    const { showGroupModal, groupModalTitle } = this.state
    return (
      <React.Fragment>
        <section className='groups'>
          <div className='row groups-header'>
            <div className='col-md-12'>
              <h4 className='float-left'>{t('groups.groups')}</h4>
              <div className='btn-group float-right' role='group'>
                <button type='button' className='btn btn-outline-primary' onClick={this.handleCreateGroup}>
                  {t('groups.create')}
                </button>
                <button type='button' className='btn btn-outline-info' onClick={this.handleEditGroup}>
                  {t('groups.modify')}
                </button>
                <button type='button' className='btn btn-outline-danger' onClick={onDelete}>
                  {t('groups.delete')}
                </button>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className='col-md-12'>
              <table
                className={
                  selectedGroup ? 'table table-sm table-bordered' : 'table table-sm table-bordered table-hover'
                }
              >
                <thead>
                  <tr>
                    <th scope='col'>{t('groups.groupName')}</th>
                    <th scope='col'>{t('groups.availableRoles')}</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map(group => (
                    <Group
                      key={group.id}
                      group={group}
                      onSelectGroup={onSelectGroup}
                      selectedGroup={selectedGroup}
                      onConfiguringRoles={onConfiguringRoles}
                      t={t}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <NameDescriptionModal
          show={showGroupModal}
          title={groupModalTitle}
          onClose={this.handleGroupModalClose}
          onSave={this.handlerGroupSave}
          name={selectedGroup ? selectedGroup.name : ''}
          description={selectedGroup ? selectedGroup.description : ''}
        />
      </React.Fragment>
    )
  }
}

Groups.propTypes = {
  groups: PropTypes.array,
  selectedGroup: PropTypes.object,
  onDelete: PropTypes.func,
  onSelectGroup: PropTypes.func,
  onGroupSave: PropTypes.func,
  onConfiguringRoles: PropTypes.func
}

const Group = ({ group, selectedGroup, onConfiguringRoles, onSelectGroup, t }) => (
  <tr className={selectedGroup && selectedGroup.id === group.id ? 'active' : null} onClick={() => onSelectGroup(group)}>
    <td>{group.name}</td>
    <td>
      {group
        .getAllRoles()
        .map(role => role.name)
        .join(', ')}
      <span className='float-right'>
        <button role='button' className='btn btn-outline-info btn-sm' onClick={() => onConfiguringRoles(group)}>
        {t('groups.tune')}
        </button>
      </span>
    </td>
  </tr>
)

Group.propTypes = {
  group: PropTypes.object,
  selectedGroup: PropTypes.object,
  onConfiguringRoles: PropTypes.func,
  onSelectGroup: PropTypes.func
}

export default withNamespaces('translation')(Groups)
