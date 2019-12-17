import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table, Input, Form, Select, Upload, Button, Icon, Modal, message, Tabs, Popconfirm } from 'antd'
import axios from 'axios'
import { withRouter } from 'react-router-dom'

import IconCard from './IconCard'
import iconList from './IconsArray'
import SetsModal from './SetsModal'

import './editable-table.css'

const { Option } = Select
const { Dragger } = Upload
const { TabPane } = Tabs

const EditableContext = React.createContext()

const EditableRow = ({ form, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow)

function defaultGetValueFromEvent (e) {
  console.log('defaultGetValueFromEvent', e)
  if (e.target) {
    console.log(e.target.type)
  }
  if (!e || !e.target) {
    console.log('return e')
    return e
  }
  const { target } = e
  return target.type === 'checkbox' ? target.checked : target.value
}

class EditableCell extends Component {
  state = {
    editing: false,
    visibleUploadModal: false,
    visibleIconModal: false,
    visibleSetsModal: false,
    resourceFileName: null,
    selectedIcon: null,
    currentSet: null
  }

  toggleEdit = () => {
    const editing = !this.state.editing
    this.setState({ editing }, () => {
      if (editing && this.input) {
        this.input.focus()
      }
    })
  }

  save = e => {
    const { record, handleSave, dataIndex } = this.props
    console.log('save')
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return
      }
      console.log(error, values)
      this.toggleEdit()
      handleSave({ ...record, ...values })
    })
  }

  getInputByType = ({ valueType, values }, value) => {
    const { record } = this.props

    console.log(valueType, values)
    switch (valueType) {
      case 'bool':
      case 'enum':
        return (
          <Select ref={node => (this.input = node)} onBlur={this.save}>
            {values.map((item, idx) => (
              <Option key={item} value={item}>
                {item}
              </Option>
            ))}
          </Select>
        )
      case 'color':
        return <Input ref={node => (this.input = node)} type='color' onPressEnter={this.save} onBlur={this.save} />
      case 'filename':
      case 'picture':
        return <Input ref={node => (this.input = node)} onDoubleClick={() => this.toggleUploadModal(true)} />
      case 'icon':
        return <Input ref={node => (this.input = node)} onDoubleClick={() => this.toggleIconModal(true)} />
      case 'set':
        return <Input ref={node => (this.input = node)} onDoubleClick={() => this.showSetsModal(value)} />
      case 'template':
        return (
          <Popconfirm
            title='Are you sure edit template?'
            onConfirm={() => this.onEditTemplate(record)}
            okText='Yes'
            cancelText='No'
            >
              <Input ref={node => (this.input = node)} />
            </Popconfirm>
        )
        
      default:
        return <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />
    }
  }

  renderCell = form => {
    this.form = form
    const { children, dataIndex, record, title, validator } = this.props
    const { editing } = this.state

    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            // {
            //   validator,
            //   message: 'An object with this name already exists.'
            // }
          ],
          initialValue: record[dataIndex]
          // getValueFromEvent: defaultGetValueFromEvent
        })(this.getInputByType(record, record[dataIndex]))}
      </Form.Item>
    ) : (
      <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={this.toggleEdit}>
        {children}
      </div>
    )
  }

  toggleUploadModal = visible => {
    this.setState({ visibleUploadModal: visible })
    if (!visible) {
      this.save()
    }
  }

  toggleIconModal = visible => {
    this.setState({ visibleIconModal: visible })
    if (!visible) {
      this.save()
    }
  }

  toggleSetsModal = visible => {
    this.setState({ visibleSetsModal: visible })
    if (!visible) {
      this.save()
    }
  }

  showSetsModal = value => {
    this.setState({ currentSet: value })
    this.toggleSetsModal(true)
  }

  onOkUploadModal = () => {
    const { dataIndex } = this.props

    this.form.setFieldsValue({
      [dataIndex]: this.state.resourceFileName
    })
    this.toggleUploadModal(false)
  }

  onOkIconModal = () => {
    const { dataIndex } = this.props

    this.form.setFieldsValue({
      [dataIndex]: this.state.selectedIcon
    })
    this.toggleIconModal(false)
  }

  onOkSetsModal = values => {
    const { dataIndex } = this.props

    this.form.setFieldsValue({
      [dataIndex]: values
    })
    this.toggleSetsModal(false)
  }

  onEditTemplate = record => {
    console.log(record)
    this.props.history.push(`/editor?objectid=${record.objectId}&owner=${record.owner}`)
  }

  uploadFile = file => {
    const formData = new FormData()
    formData.append('resource', file)
    console.log(file)
    axios
      .post('/api/configuration/resource', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log(response)
        this.setState({ resourceFileName: response.data.fileName })
      })
      .catch(err => console.log(err))
  }

  onSelectIcon = icon => {
    this.setState({ selectedIcon: icon })
  }

  render () {
    const { editable, dataIndex, title, record, index, handleSave, children, validator, ...restProps } = this.props
    const { visibleSetsModal } = this.state

    return (
      <React.Fragment>
        <td {...restProps}>
          {editable ? <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer> : children}
        </td>
        <Modal
          title='Upload file'
          visible={this.state.visibleUploadModal}
          onOk={this.onOkUploadModal}
          onCancel={() => this.toggleUploadModal(false)}
        >
          <Dragger
            multiple={false}
            beforeUpload={file => {
              this.uploadFile(file)
              return false
            }}
          >
            <p className='ant-upload-drag-icon'>
              <Icon type='inbox' />
            </p>
            <p className='ant-upload-text'>Click or drag file to this area to upload</p>
            <p className='ant-upload-hint'>
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
            </p>
          </Dragger>
        </Modal>
        <Modal
          title='Select Icon'
          visible={this.state.visibleIconModal}
          onOk={this.onOkIconModal}
          onCancel={() => this.toggleIconModal(false)}
        >
          <Tabs defaultActiveKey='1'>
            {iconList.map(tab => (
              <TabPane tab={tab.tabName} key={tab.id}>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {tab.iconList.map((icon, idx) => (
                    <IconCard
                      key={idx}
                      iconName={icon}
                      caption={icon}
                      onClick={this.onSelectIcon}
                      selected={icon === this.state.selectedIcon}
                    />
                  ))}
                </div>
              </TabPane>
            ))}
          </Tabs>
        </Modal>
        {visibleSetsModal && <SetsModal visible={visibleSetsModal} onCancel={() => this.toggleSetsModal(false)} onOk={this.onOkSetsModal} initialValue={this.state.currentSet} />}
      </React.Fragment>
    )
  }
}

EditableCell.propTypes = {
  editable: PropTypes.bool,
  dataIndex: PropTypes.string,
  title: PropTypes.string,
  record: PropTypes.object,
  handleSave: PropTypes.func,
  children: PropTypes.array.isRequired,
  validator: PropTypes.func,
  history: PropTypes.object
}

class EditableTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dataSource: props.dataSource
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.dataSource) {
      return {
        dataSource: nextProps.dataSource
      }
    }
    return null
  }

  handleSave = row => {
    console.log(row)
    const newData = [...this.state.dataSource]
    const index = newData.findIndex(item => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, {
      ...item,
      ...row
    })
    this.props.onChange(row)
    this.setState({ dataSource: newData })
  }

  render () {
    const { dataSource } = this.state
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell
      }
    }
    const columns = this.props.columns.map(col => {
      if (!col.editable) {
        return col
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          validator: this.props.validator,
          history: this.props.history
        })
      }
    })

    return (
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        size='middle'
        pagination={{ pageSize: 100 }}
        scroll={{ y: 540 }}
        onRow={(record, rowIndex) => {
          return {
            className: !record.default && 'editable-row__text-primary',
            onClick: () => this.props.onRowClick(record)
          }
        }}
      />
    )
  }
}

EditableTable.propTypes = {
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onRowClick: PropTypes.func,
  validator: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired
}

export default withRouter(EditableTable)
