import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import PropEventsBlock from './PropEventsWidget'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import {
  fetchConfiguration,
  addConfigurationObject,
  removeConfigurationObject
} from '../../../actions/configurationActions'
import CreateObjectModal from './CreateObjectModal'

import './configurator.css'

import folders from './objecttypes.json'

const getDefaultProps = () => axios.get('/api/configuration/default-props')

class Configuration extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      defaultProps: [], // данные из igo$props
      loading: true,
      error: null,
      curFolder: 10, // текущая папка. objectType
      entityChain: [],
      selectedEntity: null, // выбраный объект конфигурации
      parentEntity: null, // объект предыдущего уровня
      objectsList: [], // список отображаемых в данный момент объектов конфигурации
      showModal: false
    }
    this.handlerFolderSelect = this.handlerFolderSelect.bind(this)
    this.handlerEntityClick = this.handlerEntityClick.bind(this)
    this.handlerEntityDblClick = this.handlerEntityDblClick.bind(this)
    this.handleDeleteEntity = this.handleDeleteEntity.bind(this)
    this.handleCreateEntity = this.handleCreateEntity.bind(this)
  }

  componentDidMount () {
    this.setState({ loading: true })
    this.props.loadConfiguration()
    getDefaultProps()
      .then(properties => {
        this.setState({
          loading: false,
          defaultProps: properties.data
        })
      })
      .catch(err => {
        this.setState({
          loading: false,
          error: err
        })
      })
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.configuration) {
      console.log('getDerivedStateFromProps')
      return {
        ...prevState,
        selectedEntity: prevState.selectedEntity
          ? nextProps.configuration.find(obj => obj.id === prevState.selectedEntity.id)
          : null,
        parentEntity: prevState.parentEntity
          ? nextProps.configuration.find(obj => obj.id === prevState.parentEntity.id)
          : null,
        objectsList: prevState.parentEntity
          ? nextProps.configuration.filter(object => object.owner === prevState.parentEntity.id)
          : nextProps.configuration.filter(object => object.type === prevState.curFolder && object.owner === 0)
      }
    } else {
      return null
    }
  }

  // Обрабатывает выбор папки объектов конфигурации
  handlerFolderSelect (id) {
    this.setState({
      curFolder: id,
      entityChain: [],
      selectedEntity: null,
      parentEntity: null
      // objectsList: this.props.configuration.filter(object => object.type === id && object.owner === 0)
    })
  }

  handlerEntityClick (entity) {
    this.setState({
      selectedEntity: entity
    })
  }

  // при двойном щелчке заходим на уровень ниже
  handlerEntityDblClick (entity) {
    const { entityChain } = this.state
    const { configuration } = this.props
    // если это последний уровнеь вложенности
    if (configuration.filter(object => object.owner === entity.id).length === 0 && entity.type !== 1) {
      this.setState({
        selectedEntity: entity
      })
    } else {
      this.setState({
        selectedEntity: entity,
        parentEntity: entity,
        entityChain: [
          ...entityChain,
          {
            id: entity.id,
            name: entity.name
          }
        ]
        // objectsList: configuration.filter(object => object.owner === entity.id)
      })
    }
  }

  // нажате на кнопку "Удалить"
  handleDeleteEntity () {
    const { selectedEntity } = this.state
    this.props.deleteConfigurationObject(selectedEntity.id)
  }

  // нажате на кнопку "Создать"
  handleCreateEntity (values) {
    const { curFolder, entityChain, parentEntity } = this.state
    const { newConfigurationObject } = this.props
    console.log(values)
    this.setState({ showModal: false })
    let owner
    if (entityChain.length > 0) {
      owner = entityChain[entityChain.length - 1].id
    }
    const object = {
      name: values.name,
      type: parentEntity ? (parentEntity.type === 1 ? 0 : curFolder) : curFolder,
      description: values.description,
      fieldType: values.fieldType,
      fieldSize: values.fieldSize,
      owner
    }
    newConfigurationObject(object)
  }

  handleShowModal = () => {
    this.setState({ showModal: true })
  }

  handlerCloseModal = () => {
    this.setState({ showModal: false })
  }

  render () {
    const { curFolder, defaultProps, selectedEntity, objectsList, parentEntity } = this.state
    const { loading, t } = this.props

    return (
      <React.Fragment>
        {loading ? (
          <div className='loader'>
            <ReactLoading type='spinningBubbles' color='#007bff' height={'20%'} width={'20%'} />
          </div>
        ) : (
          <div className='container-fluid'>
            <h1>{t('configurator.objectManager')}</h1>
            <section className='configuration'>
              <div className='row'>
                <div className='col-sm-2'>
                  <h4>{t('configurator.objectType')}</h4>
                </div>
                <div className='col-sm-7'>
                  <div className='row'>
                    <div className='col-sm-8'>{this.getBreatcrumbs(t)}</div>
                    <div className='col-sm-4'>
                      <div className='btn-group float-right' role='group'>
                        <button type='button' className='btn btn-primary' onClick={this.handleShowModal}>
                          {t('configurator.create')}
                        </button>
                        <button type='button' className='btn btn-danger' onClick={this.handleDeleteEntity}>
                          {t('configurator.delete')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-sm-3' />
              </div>
              <div className='row'>
                <div className='col-sm-2'>
                  <div className='list-group'>
                    {folders.map(f => (
                      <Folder
                        key={f.id}
                        folder={f}
                        onFolderClick={this.handlerFolderSelect}
                        active={f.id === curFolder}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
                <div className='col-sm-7'>
                  <table className='table table-sm table-bordered table-hover table-condensed'>
                    <thead>
                      <tr>
                        <th>{t('configurator.objectDesc')}</th>
                        <th>{t('configurator.objectName')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectsList.map(object => (
                        <ObjectRow
                          key={object.id}
                          entity={object}
                          selected={selectedEntity && selectedEntity.id === object.id}
                          onEntityClick={this.handlerEntityClick}
                          onEntityDblClick={this.handlerEntityDblClick}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='col-md-3'>
                  {selectedEntity && (
                    <PropEventsBlock
                      key={selectedEntity.id}
                      entity={selectedEntity}
                      defaultProps={defaultProps}
                      onEntityChange={this.handleOnEntityChange}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        <CreateObjectModal
          show={this.state.showModal}
          onSubmit={this.handleCreateEntity}
          handleClose={this.handlerCloseModal}
          field={parentEntity && parentEntity.type === 1}
        />
      </React.Fragment>
    )
  }

  getBreatcrumbs (t) {
    const { entityChain, curFolder } = this.state
    return (
      <nav aria-label='breadcrumb'>
        <ol className='breadcrumb'>
          <li className={entityChain.length === 0 ? 'breadcrumb-item active' : 'breadcrumb-item'}>
            <a href='#' onClick={() => this.handlerFolderSelect(curFolder)}>
              {curFolder !== null && t(folders.filter(f => f.id === curFolder)[0].title)}
            </a>
          </li>
          {entityChain.map((entity, i) => (
            <li key={entity.id} className={i === entityChain.length - 1 ? 'breadcrumb-item active' : 'breadcrumb-item'}>
              <a href='#'>{entity.name}</a>
            </li>
          ))}
        </ol>
      </nav>
    )
  }
}

const Folder = ({ folder, onFolderClick, active, t }) => (
  <button
    type='button'
    className={active ? 'list-group-item active' : 'list-group-item'}
    onClick={() => onFolderClick(folder.id)}
  >
    <h5 className='list-group-item-heading'>{t(folder.title)}</h5>
    <p className='list-group-item-text'>{t(folder.description)}</p>
  </button>
)

const ObjectRow = ({ entity, selected, onEntityClick, onEntityDblClick }) => (
  <tr
    className={selected ? 'active' : ''}
    onClick={() => onEntityClick(entity)}
    onDoubleClick={() => onEntityDblClick(entity)}
  >
    <td>{entity.description}</td>
    <td>{entity.name}</td>
  </tr>
)

const mapStateToProps = state => ({
  configuration: state.configuration.items,
  loading: state.configuration.loading,
  error: state.configuration.error
})

const mapDispatchToProps = dispatch => ({
  loadConfiguration () {
    dispatch(fetchConfiguration())
  },
  newConfigurationObject (object) {
    dispatch(addConfigurationObject(object))
  },
  deleteConfigurationObject (objectId) {
    dispatch(removeConfigurationObject(objectId))
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNamespaces('translation')(Configuration))
