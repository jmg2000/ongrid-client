import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Table, Input, Button, Form } from 'antd'

export class SetsModal extends Component {
  static propTypes = {
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
    initialValue: PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      values: props.initialValue ? props.initialValue.slice(0, -1).split(';') : []
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values)
        this.setState({ values: [...this.state.values, values.value] })
        this.props.form.resetFields()
      }
    })
  }

  handleOk = () => {
    this.props.onOk(this.state.values.join(';').concat(';'))
  }

  handleDeleleValue = idx => {
    const { values } = this.state
    console.log(idx)
    values.splice(idx, 1)
    this.setState({ values })
  }

  render () {
    const { visible, onOk, onCancel } = this.props
    const { values } = this.state
    const { getFieldDecorator } = this.props.form

    console.log(values)

    const dataSource = values.map((item, idx) => ({
      key: idx,
      name: item
    }))
    const columns = [
      {
        title: 'Values',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: 'Action',
        key: 'action',
        render: (text, record) => (
          <Button type='danger' size='small' onClick={() => this.handleDeleleValue(record.key)}>
            Delete
          </Button>
        )
      }
    ]

    return (
      <Modal title='Create a set of values' visible={visible} onOk={this.handleOk} onCancel={onCancel}>
        <Table
          dataSource={dataSource}
          columns={columns}
          size='small'
          pagination={{ pageSize: 50 }}
          scroll={{ y: 200 }}
        />
        <Form layout='inline' onSubmit={this.handleSubmit}>
          <Form.Item>{getFieldDecorator('value')(<Input />)}</Form.Item>
          <Form.Item>
            <Button type='primary' htmlType='submit'>
              Add
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}

export default Form.create({})(SetsModal)
