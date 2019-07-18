import React, { Component } from 'react'
import axios from 'axios'
import {
  Drawer,
  Popconfirm,
  message,
  PageHeader,
  Table,
  Modal,
  Button,
  Select,
  Divider,
  Row,
  Col,
  List,
  Avatar,
  Descriptions,
  notification
} from 'antd'
import moment from 'moment'

// styles
import './admin.css'

const { Option } = Select

class Admin extends Component {
  constructor (props) {
    super(props)
    this.state = {
      clients: [],
      showConfigurationSelect: false,
      selectedConfiguration: '',
      configurations: [],
      curClient: null,
      databaseCreation: false,
      showProfile: false,
      containerCreating: false,
      startingContainer: false
    }
    this.handleDeleteClient = this.handleDeleteClient.bind(this)
    this.handleCreateDB = this.handleCreateDB.bind(this)
  }

  componentDidMount () {
    axios
      .get('/api/clients/all')
      .then(response => {
        console.log(response.data)
        this.setState({ clients: response.data })
      })
      .catch(err => console.log(err))
    axios
      .get('/api/admin/configuration/all')
      .then(response => {
        console.log(response.data)
        this.setState({
          configurations: response.data
        })
      })
      .catch(err => console.log(err))
  }

  handleDeleteClient (clientId) {
    const { clients } = this.state
    axios
      .delete(`/api/clients/${clientId}`)
      .then(() => {
        this.setState({
          clients: clients.filter(c => c.id !== clientId)
        })
        message.success('Client deleted')
      })
      .catch(err => console.log(err))
  }

  handleCreateDB () {
    this.setState({ showConfigurationSelect: true })
  }

  handlerCloseModal = () => {
    this.setState({ showConfigurationSelect: false })
  }

  handlerChangeSelectModal = value => {
    this.setState({ selectedConfiguration: value })
  }

  handlerSelectModal = () => {
    const { curClient, clients, selectedConfiguration } = this.state
    this.setState({ databaseCreation: true })
    axios
      .post('/api/admin/create-dbs', { clientId: curClient.id, selectedConfiguration })
      .then(response => {
        console.log(response.data)
        let configFile = response.data.configFile
        let dataFile = response.data.dataFile
        this.setState({
          clients: clients.map(client =>
            client.id === curClient.id ? { ...client, database: { configFile, dataFile } } : client
          ),
          databaseCreation: false
        })
        message.success('Databases created')
      })
      .catch(err => console.log(err))
      .finally(() => this.setState({ showConfigurationSelect: false }))
  }

  handleCloseProfile = () => {
    this.setState({ showProfile: false })
  }

  showProfile = () => {
    this.setState({ showProfile: true })
  }

  getClients = (clients, onDelete, onCreateDB, onShow) => {
    const dataSource = clients.map(client => ({
      key: client.id,
      login: client.email,
      username: `${client.firstName && client.firstName} ${client.lastName && client.lastName}`
    }))
    const columns = [
      {
        title: 'Id',
        dataIndex: 'key',
        key: 'key'
      },
      {
        title: 'Login',
        dataIndex: 'login',
        key: 'login'
      },
      {
        title: 'User name',
        dataIndex: 'username',
        key: 'username'
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (text, record) => (
          <span>
            <a href='javascript:;' onClick={onCreateDB}>
              Create DB
            </a>
            <Divider type='vertical' />
            <a href='javascript:;' onClick={() => onShow(record.key)}>
              Show
            </a>
            <Divider type='vertical' />
            <Popconfirm
              title='Are you sure delete this client?'
              onConfirm={() => onDelete(record.key)}
              okText='Yes'
              cancelText='No'
            >
              <a href='javascript:;'>Delete</a>
            </Popconfirm>
          </span>
        )
      }
    ]
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        size='small'
        bordered
        onRow={(record, rowIndex) => {
          return {
            onClick: () => this.handlerRowClick(record.key)
          }
        }}
      />
    )
  }

  handlerRowClick = clientId => {
    const curClient = this.state.clients.find(client => client.id === clientId)

    if (curClient.docker.containerId) {
      axios
        .get(`/api/docker/inspect/${curClient.docker.containerId}`)
        .then(res => {
          const containerState = res.data.State
          this.setState({
            curClient: {
              ...curClient,
              docker: {
                ...curClient.docker,
                status: containerState.Status,
                pid: containerState.Pid,
                startedAt: containerState.StartedAt
              }
            }
          })
        })
        .catch(err => console.log(err))
    } else {
      this.setState({ curClient })
    }
  }

  handlerContainerCreate = client => {
    console.log('Create')
    this.setState({ containerCreating: true })
    axios
      .post('/api/docker/create-container', {
        clientId: client.id,
        image: 'ongrid-core',
        containerName: `ongrid-core-${client.id}`,
        hostPort: '4004'
      })
      .then(res => {
        const client = res.data
        console.log('Client:', client)
        this.setState({
          clients: this.state.clients.map(c => (c.id === client.id ? client : c)),
          curClient: client
        })
        notification.open({
          message: 'Docker container created',
          description: `Docker container is created and launched. Container id: ${
            client.docker.containerId
          }. Users can use the platform.`,
          onClick: () => {
            console.log('Notification Clicked!')
          }
        })
      })
      .catch(err => console.log(err))
      .finally(() => this.setState({ containerCreating: false }))
  }

  handleDrawerVisibleChange = visible => {
    console.log(visible)
  }

  handleStartContainer = client => {
    this.setState({ startingContainer: true })
    axios
      .post(`/api/docker/start-container/${client.docker.containerId}`)
      .then(res => {
        this.setState({ startingContainer: false })
        this.handlerRowClick(client.id)
      })
      .catch(err => console.log(err))
  }

  handleStopContainer = client => {
    this.setState({ stopingContainer: true })
    axios
      .get(`/api/docker/stop-container/${client.docker.containerId}`)
      .then(res => {
        this.setState({ stopingContainer: false })
        this.handlerRowClick(client.id)
      })
      .catch(err => console.log(err))
  }

  render () {
    const {
      clients,
      showConfigurationSelect,
      configurations,
      databaseCreation,
      curClient: client,
      containerCreating
    } = this.state

    return (
      <React.Fragment>
        <div className='container'>
          <PageHeader title='Админка' subTitle='Администрирование клиентов' />
          <section>{this.getClients(clients, this.handleDeleteClient, this.handleCreateDB, this.showProfile)}</section>
          <Modal
            visible={showConfigurationSelect}
            title='Select Configuration'
            onOk={this.handlerSelectModal}
            onCancel={this.handlerCloseModal}
            footer={[
              <Button key='back' onClick={this.handlerCloseModal}>
                Close
              </Button>,
              <Button key='submit' type='primary' loading={databaseCreation} onClick={this.handlerSelectModal}>
                Create DBs
              </Button>
            ]}
          >
            <Select defaultValue='Select configuration' style={{ width: 450 }} onChange={this.handlerChangeSelectModal}>
              {configurations.map(config => (
                <Option key={config.id} value={config.id}>{`${config.name} (${config.description})`}</Option>
              ))}
            </Select>
          </Modal>
          {client && (
            <Drawer
              width={740}
              placement='right'
              closable={false}
              onClose={this.handleCloseProfile}
              visible={this.state.showProfile}
              afterVisibleChange={this.handleDrawerVisibleChange}
            >
              <div className='client-drawer'>
                <Avatar src={client.avatar} />
                <div className='client-drawer__profile-descriptions'>
                  <Descriptions bordered title='Client Profile' size='small' column={2}>
                    <Descriptions.Item label='ID'>{client.id}</Descriptions.Item>
                    <Descriptions.Item label='Admin'>{client.admin ? 'yes' : 'no'}</Descriptions.Item>
                    <Descriptions.Item label='Login'>{client.email}</Descriptions.Item>
                    <Descriptions.Item label='Created'>{moment(client.created).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label='Name'>{`${client.firstName} ${client.lastName}`}</Descriptions.Item>
                    <Descriptions.Item label='Max work places'>{client.maxWorkPlaces}</Descriptions.Item>
                    <Descriptions.Item label='Phone'>{client.phone}</Descriptions.Item>
                    <Descriptions.Item label='Description'>{client.description}</Descriptions.Item>
                  </Descriptions>
                </div>
                <div className='client-drawer__database-descriptions'>
                  <Descriptions bordered title='Databases' size='small' column={1}>
                    <Descriptions.Item label='DataDB'>{client.database.dataFile}</Descriptions.Item>
                    <Descriptions.Item label='ConfigDB'>{client.database.configFile}</Descriptions.Item>
                  </Descriptions>
                </div>
                {client.docker.containerId ? (
                  <div className='client-drawer__docker-descriptions'>
                    <Descriptions title='Docker' bordered size='small' column={1}>
                      <Descriptions.Item label='Docker host'>{client.docker.host}</Descriptions.Item>
                      <Descriptions.Item label='Id'>{client.docker.containerId}</Descriptions.Item>
                      <Descriptions.Item label='Name'>{client.docker.containerName}</Descriptions.Item>
                      <Descriptions.Item label='Created'>
                        {moment(client.docker.created).format('DD/MM/YYYY HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label='Status'>{client.docker.status}</Descriptions.Item>
                      <Descriptions.Item label='Pid'>{client.docker.pid}</Descriptions.Item>
                      <Descriptions.Item label='Started'>
                        {moment(client.docker.startedAt).format('DD/MM/YYYY HH:mm:ss')}
                      </Descriptions.Item>
                    </Descriptions>
                    <Button.Group>
                      <Button
                        type='primary'
                        loading={this.state.startingContainer}
                        disabled={client.docker.status === 'Running'}
                        onClick={() => this.handleStartContainer(client)}
                      >
                        Start
                      </Button>
                      <Button
                        type='danger'
                        loading={this.state.stopingContainer}
                        disabled={client.docker.status === 'Paused'}
                        onClick={() => this.handleStopContainer(client)}
                      >
                        Stop
                      </Button>
                    </Button.Group>
                  </div>
                ) : (
                  <div className='client-drawer__docker-create'>
                    <p>No docker container</p>
                    <Button
                      type='primary'
                      loading={containerCreating}
                      onClick={() => this.handlerContainerCreate(client)}
                    >
                      Create
                    </Button>
                  </div>
                )}
              </div>
            </Drawer>
          )}
        </div>
      </React.Fragment>
    )
  }
}

export default Admin
