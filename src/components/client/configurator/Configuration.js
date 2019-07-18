import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import PropEventsBlock from './PropEventsWidget'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import { Table, PageHeader, Breadcrumb, Icon, List, Button } from 'antd'

import {
  fetchConfiguration,
  addConfigurationObject,
  removeConfigurationObject
} from '../../../actions/configurationActions'
import CreateObjectModal from './CreateObjectModal'

import './configurator.css'

import folders from './objecttypes.json'

const getDefaultProps = () => axios.get('/api/configuration/default-props')

const ButtonGroup = Button.Group

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

  componentDidUpdate () {
    console.log('Configurator didUpdate')
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
      })
    }
  }

  // нажате на кнопку "Удалить"
  handleDeleteEntity () {
    const { selectedEntity } = this.state
    this.props.deleteConfigurationObject(selectedEntity.id)
    // this.props.removeConfigurationObject(selectedEntity.id)
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
    // this.props.addConfigurationObject(object)
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
            <ReactLoading type='spinningBubbles' color='#007bff' height={'15%'} width={'15%'} />
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
                      <div className='float-right'>
                        <ButtonGroup>
                          <Button type='primary' onClick={this.handleShowModal}>
                            {t('configurator.create')}
                          </Button>
                          <Button type='danger' onClick={this.handleDeleteEntity}>
                            {t('configurator.delete')}
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='col-sm-3' />
              </div>
              <div className='row'>
                <div className='col-sm-2'>
                  <List
                    bordered
                    dataSource={folders}
                    renderItem={item => (
                      <List.Item>
                        <Icon type={item.icon} />
                        <List.Item.Meta
                          avatar={<Icon type={item.icon} />}
                          title={
                            <a href='#' onClick={() => this.handlerFolderSelect(item.id)}>
                              {t(item.title)}
                            </a>
                          }
                          description={t(item.description)}
                        />
                      </List.Item>
                    )}
                  />
                </div>
                <div className='col-sm-7'>{this.getObjectList(t, objectsList)}</div>
                <div className='col-md-3'>
                  {selectedEntity && (
                    <PropEventsBlock
                      key={selectedEntity.id}
                      entity={selectedEntity}
                      defaultProps={defaultProps}
                      // onEntityChange={this.handleOnEntityChange}
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

  getObjectList (t, objectsList) {
    const dataSource = objectsList.map(obj => ({
      key: obj.id,
      description: obj.description,
      name: obj.name,
      entity: obj
    }))

    const columns = [
      {
        title: t('configurator.objectDesc'),
        dataIndex: 'description',
        key: 'description',
        width: 150,
        sorter: (a, b) => {
          const nameA = a.description.toLowerCase()
            const nameB = b.description.toLowerCase()
          if (nameA < nameB)
          // sort string ascending
          { return -1 }
          if (nameA > nameB) return 1
          return 0
        },
        sortDirections: ['descend', 'ascend']
      },
      {
        title: t('configurator.objectName'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        sorter: (a, b) => {
          const nameA = a.name.toLowerCase()
            const nameB = b.name.toLowerCase()
          if (nameA < nameB)
          // sort string ascending
          { return -1 }
          if (nameA > nameB) return 1
          return 0
        },
        sortDirections: ['descend', 'ascend']
      }
    ]

    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 560 }}
        size='small'
        bordered
        onRow={(record, rowIndex) => {
          return {
            onClick: () => this.handlerEntityClick(record.entity),
            onDoubleClick: () => this.handlerEntityDblClick(record.entity)
          }
        }}
      />
    )
  }

  getBreatcrumbs (t) {
    const { entityChain, curFolder } = this.state
    return (
      <Breadcrumb>
        <Breadcrumb.Item>
          <a href='#' onClick={() => this.handlerFolderSelect(curFolder)}>
            {curFolder !== null && t(folders.filter(f => f.id === curFolder)[0].title)}
          </a>
        </Breadcrumb.Item>
        {entityChain.map((entity, i) => (
          <Breadcrumb.Item key={entity.id}>{entity.name}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
    )
  }
}

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
