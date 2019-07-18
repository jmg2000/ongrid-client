import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table, Input, Form, Select, Upload, Button, Icon } from 'antd'

import './editable-table.css'

const { Option } = Select

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
    editing: false
  }

  toggleEdit = () => {
    const editing = !this.state.editing
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus()
      }
    })
  }

  save = e => {
    const { record, handleSave, dataIndex } = this.props
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return
      }
      console.log(error, values)
      this.toggleEdit()
      handleSave({ ...record, ...values })
    })
  }

  getInputByType = ({ valueType, values }) => {
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
        return <input />
      case 'filename':
      case 'picture':
        const props = {
          name: 'file',
          action: '/api/resource'
        }
        return (
          <Upload {...props} onChange={this.save}>
            <Button ref={node => (this.input = node)}>
              <Icon type='upload' /> Click to Upload
            </Button>
          </Upload>
        )
      default:
        return <Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />
    }
  }

  renderCell = form => {
    this.form = form
    const { children, dataIndex, record, title } = this.props
    const { editing } = this.state
    if (editing) {
      console.log(record)
    }
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          // rules: [
          //   {
          //     required: true,
          //     message: `${title} is required.`
          //   }
          // ],
          initialValue: record[dataIndex]
          //getValueFromEvent: defaultGetValueFromEvent
        })(this.getInputByType(record))}
      </Form.Item>
    ) : (
      <div className='editable-cell-value-wrap' style={{ paddingRight: 24 }} onClick={this.toggleEdit}>
        {children}
      </div>
    )
  }

  render () {
    const { editable, dataIndex, title, record, index, handleSave, children, ...restProps } = this.props
    return (
      <td {...restProps}>
        {editable ? <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer> : children}
      </td>
    )
  }
}

EditableCell.propTypes = {
  editable: PropTypes.bool,
  dataIndex: PropTypes.string,
  title: PropTypes.string,
  record: PropTypes.object,
  handleSave: PropTypes.func,
  children: PropTypes.array.isRequired
}

class EditableTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dataSource: props.dataSource
    }
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
          handleSave: this.handleSave
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
        size='small'
        pagination={{ pageSize: 50 }}
        scroll={{ y: 560 }}
        onRow={(record, rowIndex) => {
          return {
            className: !record.default && 'editable-row__text-primary'
          }
        }}
      />
    )
  }
}

EditableTable.propTypes = {
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array.isRequired
}

export default EditableTable
