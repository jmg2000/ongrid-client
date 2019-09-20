import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import ReactLoading from 'react-loading'
import { withNamespaces } from 'react-i18next'
import { Table, PageHeader, Breadcrumb, Icon, List, Button } from 'antd'
// actions
import {
  fetchConfiguration,
  addConfigurationObject,
  removeConfigurationObject
} from '../../../actions/configurationActions'
// components
import CreateObjectModal from './CreateObjectModal'
import PropEventsBlock from './PropEventsWidget'
// styles
import './configurator.css'

import folders from './objecttypes.json'

export const ConfigObjectType = Object.freeze({
  TableFields: 0,
  Table: 1,
  Template: 4,
  Menu: 6,
  Query: 7,
  Field: 8,
  Configuration: 10
})

const getDefaultProps = () => axios.get('/api/configuration/default-props')

const ButtonGroup = Button.Group

class Configuration extends Component {
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
    this.props.fetchConfiguration()
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
    console.log(entity)
    this.setState({
      selectedEntity: entity
    })
  }

  // при двойном щелчке заходим на уровень ниже
  handlerEntityDblClick (entity) {
    const { entityChain } = this.state
    const { configuration } = this.props
    console.log('DBL:', entity)
    // если это последний уровнеь вложенности
    if (configuration.filter(object => object.owner === entity.id).length === 0) {
      switch (entity.type) {
        case ConfigObjectType.Table:
        case ConfigObjectType.Menu:
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
          break
        default:
          this.setState({
            selectedEntity: entity
          })
          break
      }
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
    this.props.removeConfigurationObject(selectedEntity.id)
  }

  // нажате на кнопку "Создать"
  handleCreateEntity () {
    const { form } = this.formRef.props
    const { curFolder, entityChain, parentEntity } = this.state
    form.validateFields((err, values) => {
      if (err) {
        console.log(err)
        return
      }
      let owner
      if (entityChain.length > 0) {
        owner = entityChain[entityChain.length - 1].id
      }
      const newObject = {
        name: values.name,
        type: parentEntity ? (parentEntity.type === 1 ? 0 : curFolder) : curFolder,
        description: values.description,
        fieldType: values.fieldType,
        fieldSize: values.fieldSize,
        owner
      }
      console.log(newObject)
      this.props.addConfigurationObject(newObject)
      form.resetFields()
      this.setState({ showModal: false })
    })
  }

  handleShowModal = () => {
    this.setState({ showModal: true })
  }

  handlerCloseModal = () => {
    this.setState({ showModal: false })
  }

  saveFormRef = formRef => {
    console.log('saveFormRef')
    this.formRef = formRef
  }

  getObjectList (t, objectsList, selectedEntity) {
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
          if (nameA < nameB) {
            // sort string ascending
            return -1
          }
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
          if (nameA < nameB) {
            // sort string ascending
            return -1
          }
          if (nameA > nameB) return 1
          return 0
        },
        sortDirections: ['descend', 'ascend']
        // defaultSortOrder: 'ascend'
      }
    ]

    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 50 }}
        scroll={{ y: 560 }}
        size='middle'
        bordered
        onRow={(record, rowIndex) => {
          return {
            className: selectedEntity && record.key === selectedEntity.id ? 'configuration__objects-list_active' : null,
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
            <PageHeader title={t('configurator.objectManager')} />
            <section className='configuration'>
              <div className='row'>
                <div className='col-sm-2'>
                  <div className='row'>
                    <h6>{t('configurator.objectType')}</h6>
                  </div>
                  <div className='row configurator__folders-list'>
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
                  <div className='row configurator__objects-list'>
                    <div className='col-sm-12'>{this.getObjectList(t, objectsList, selectedEntity)}</div>
                  </div>
                </div>
                <div className='col-sm-3'>
                  {selectedEntity && (
                    <PropEventsBlock
                      key={selectedEntity.id}
                      entity={selectedEntity}
                      defaultProps={defaultProps}
                      objectsList={objectsList}
                      // onEntityChange={this.handleOnEntityChange}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
        <CreateObjectModal
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.showModal}
          onCreate={this.handleCreateEntity}
          onCancel={this.handlerCloseModal}
          isField={parentEntity && parentEntity.type === 1}
          objectsList={objectsList}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = state => ({
  configuration: state.configuration.items,
  loading: state.configuration.loading,
  error: state.configuration.error
})

export default connect(
  mapStateToProps,
  { fetchConfiguration, addConfigurationObject, removeConfigurationObject }
)(withNamespaces('translation')(Configuration))
