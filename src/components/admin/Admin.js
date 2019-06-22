import React, { Component } from 'react'
import axios from 'axios'
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

class Admin extends Component {
  constructor (props) {
    super(props)
    this.state = {
      clients: [],
      showConfigurationSelect: false,
      selectedConfiguration: '',
      configurations: [],
      curClient: null
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
  }

  handleDeleteClient (client) {
    const { clients } = this.state
    axios.delete(`/api/clients/${client._id}`).then(() => {
      this.setState({
        clients: clients.filter(c => c._id.toString() !== client._id.toString())
      })
    })
  }

  handleCreateDB (client) {
    this.setState({ curClient: client })
    axios
      .get('/api/admin/configuration/all')
      .then(response => {
        console.log(response.data)
        this.setState({
          configurations: response.data,
          showConfigurationSelect: true
        })
      })
      .catch(err => console.log(err))
  }

  handlerCloseModal = () => {
    this.setState({ showConfigurationSelect: false })
  }

  handlerChangeModal = ev => {
    this.setState({ selectedConfiguration: ev.target.value })
  }

  handlerSelectModal = () => {
    const { curClient, clients, selectedConfiguration } = this.state
    axios
      .post('/api/admin/create-dbs', { clientId: curClient._id, selectedConfiguration })
      .then(response => {
        console.log(response.data)
        let configFile = response.data.configFile
        let dataFile = response.data.dataFile
        this.setState({
          clients: clients.map(c =>
            c._id.toString() === curClient._id.toString() ? { ...c, database: { configFile, dataFile } } : c
          )
        })
      })
      .catch(err => console.log(err))
      .finally(() => this.setState({ showConfigurationSelect: false }))
  }

  render () {
    const { clients, showConfigurationSelect, configurations } = this.state
    return (
      <React.Fragment>
        <div className='container'>
          <div className='page-header'>
            <h1>Админка</h1>
          </div>
          <section>
            <table className='table table-sm table-hover'>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Login</th>
                  <th>User name</th>
                  <th>Database</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <ClientRow
                    key={client._id}
                    client={client}
                    onDelete={this.handleDeleteClient}
                    onCreateDB={this.handleCreateDB}
                  />
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <Modal isOpen={showConfigurationSelect}>
          <ModalHeader toggle={this.handlerCloseModal}>Select Configuration</ModalHeader>
          <ModalBody>
            <form>
              <div className='form-group'>
                <label htmlFor='configurations'>Configurations</label>
                <select
                  className='form-control'
                  id='configurations'
                  onChange={this.handlerChangeModal}
                  value={this.state.selectedConfiguration}
                >
                  <option>Select configuration</option>
                  {configurations.map(c => (
                    <option key={c._id} value={c._id}>{`${c.name} (${c.description})`}</option>
                  ))}
                </select>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <button role='button' className='btn btn-secondary' onClick={this.handlerCloseModal}>
              Close
            </button>
            <button role='button' className='btn btn-primary' onClick={this.handlerSelectModal}>
              Select
            </button>
          </ModalFooter>
        </Modal>
      </React.Fragment>
    )
  }
}

const ClientRow = ({ client, onDelete, onCreateDB }) => (
  <tr>
    <td>{client._id}</td>
    <td>{client.email}</td>
    <td>{`${client.firstName && client.firstName} ${client.lastName && client.lastName}`}</td>
    <td>{client.database && client.database.configFile}</td>
    <td>
      <div className='btn-group' role='group'>
        <button className='btn btn-sm btn-primary btn-xs' type='button' onClick={() => onCreateDB(client)}>
          Create DB
        </button>
        <button className='btn btn-sm btn-danger btn-xs' type='button' onClick={() => onDelete(client)}>
          Delete
        </button>
      </div>
    </td>
  </tr>
)

export default Admin
