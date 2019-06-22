import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withNamespaces } from 'react-i18next'
import * as RBAC from './rbac'
import folders from './configurator/objecttypes.json'

const actions = ['create', 'read', 'update', 'delete', 'execute']

class Permissions extends Component {
  constructor (props) {
    super(props)
    this.state = {
      curFolder: 1,
      selectedEntity: null,
      entityChain: [],
      selectedRole: RBAC.getRoleById(props.selectedRoleId),
      objectsList: props.configuration.filter(object => object.type === 1 && object.owner === 0)
    }
    this.handlePermissionClick = this.handlePermissionClick.bind(this)
  }

  // Обрабатывает выбор папки объектов конфигурации
  handleFolderSelect = id => {
    const { configuration } = this.props
    this.setState({
      curFolder: id,
      entityChain: [],
      selectedEntity: null,
      objectsList: configuration.filter(object => object.type === id && object.owner === 0)
    })
  }

  // обрабатывает нажате на наименование конкретного объекта конфигурации
  handleEntityDblClick = entity => {
    const { entityChain } = this.state
    const { configuration } = this.props
    let objectsList = configuration.filter(object => object.owner === entity.id)
    if (objectsList.length > 0) {
      this.setState({
        selectedEntity: entity,
        entityChain: [...entityChain, { id: entity.id, name: entity.name }],
        objectsList
      })
    }
  }

  handleEntityClick = entity => {
    this.setState({
      selectedEntity: entity
    })
  }

  // обрабатываем клик по разрешению, если его не было, то создаем новое разрешение
  // если было, то удаляем
  handlePermissionClick (permission, actionId, objectId) {
    const { selectedRole } = this.state
    let action = actions[actionId]
    if (permission) {
      permission.remove()
      selectedRole.removePermission(permission.id)
      this.forceUpdate()
    } else {
      let newPermission = new RBAC.Permission(null, action, 1, objectId)
      newPermission.save().then(() => {
        selectedRole.assignToPermission(newPermission, true)
        this.forceUpdate()
      })
    }
  }

  render () {
    const { curFolder, objectsList, selectedRole, selectedEntity } = this.state
    const { t } = this.props

    return (
      <section className='permissions'>
        <div id='permission_header' className='row'>
          <div className='col-md-3 '>
            <h4>{t('permissions.permissions')}</h4>
          </div>
          <div className='col-md-9'>{this.getBreatcrumbs(t)}</div>
        </div>
        <div className='row'>
          <div className='col-md-3'>
            <div className='list-group'>
              {folders.map(f => (
                <Folder key={f.id} folder={f} onFolderClick={this.handleFolderSelect} active={f.id === curFolder} t={t} />
              ))}
            </div>
          </div>
          <div className='col-md-9'>
            <table className='table table-sm table-bordered table-hover table-condensed'>
              <thead>
                <tr>
                  <th className='permissions_objectname'>{t('permissions.objectName')}</th>
                  <th>Create</th>
                  <th>Read</th>
                  <th>Update</th>
                  <th>Delete</th>
                  <th>Execute</th>
                </tr>
              </thead>
              <tbody>
                {objectsList.map(object => (
                  <Permission
                    key={object.id}
                    entity={object}
                    onEntityClick={this.handleEntityClick}
                    onEntityDblClick={this.handleEntityDblClick}
                    selectedRole={selectedRole}
                    onPermissionClick={this.handlePermissionClick}
                    selected={selectedEntity && selectedEntity.id === object.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    )
  }

  getBreatcrumbs (t) {
    const { entityChain, curFolder } = this.state
    return (
      <ol className='breadcrumb'>
        <li className={entityChain.length === 0 ? 'active' : null}>
          {curFolder !== null && t(folders.filter(f => f.id === curFolder)[0].title)}
        </li>
        {entityChain.map((entity, i) => (
          <li key={entity.id} className={i === entityChain.length - 1 ? 'active' : null}>
            {entity.name}
          </li>
        ))}
      </ol>
    )
  }
}

Permissions.propTypes = {
  selectedRoleId: PropTypes.number,
  configuration: PropTypes.array
}

Permissions.defaultProps = {
  configuration: []
}

const Folder = ({ folder, onFolderClick, active, t }) => (
  <button
    type='button'
    className={active ? 'list-group-item active' : 'list-group-item'}
    onClick={() => onFolderClick(folder.id)}
  >
    <h4 className='list-group-item-heading'>{t(folder.title)}</h4>
    <p className='list-group-item-text'>{t(folder.description)}</p>
  </button>
)

Folder.propTypes = {
  folder: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  active: PropTypes.bool,
  onFolderClick: PropTypes.func
}

const getPermissionsByObjectId = (permissionsList, objectId) => {
  let foundPermissions = []
  for (let permission of permissionsList) {
    if (permission.getResource() === objectId) {
      foundPermissions.push(permission)
    }
  }
  return foundPermissions
}

const getObjectPermission = (permissionsList, objectId) => {
  const permissions = getPermissionsByObjectId(permissionsList, objectId)
  let objectPermissions = []
  for (let action of actions) {
    let p = permissions.find(p => p.name === action && p.type === 1)
    if (p) {
      objectPermissions.push(p)
    } else {
      objectPermissions.push(null)
    }
  }
  return objectPermissions
}

const Permission = ({ entity, onEntityClick, onEntityDblClick, selectedRole, onPermissionClick, selected }) => (
  <tr className={selected ? 'active' : ''}>
    <td onClick={() => onEntityClick(entity)} onDoubleClick={() => onEntityDblClick(entity)}>
      {`${entity.name} (${entity.description})`}
    </td>
    {getObjectPermission(selectedRole.getPermissions(), entity.id).map((p, actionId) => (
      <td key={actionId}>
        <img
          className='img-action'
          src={p ? '/images/ok-icon.png' : '/images/not-ok-icon.png'}
          width='20'
          height='20'
          onClick={() => onPermissionClick(p, actionId, entity.id)}
        />
      </td>
    ))}
  </tr>
)

Permission.propTypes = {
  entity: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string
  }),
  selectedRole: PropTypes.instanceOf(RBAC.Role),
  onEntityClick: PropTypes.func,
  onEntityDblClick: PropTypes.func,
  onPermissionClick: PropTypes.func,
  selected: PropTypes.bool
}

const mapStateToProps = state => ({
  configuration: state.configuration.items,
  loading: state.configuration.loading,
  error: state.configuration.error
})

export default connect(mapStateToProps)(withNamespaces('translation')(Permissions))
