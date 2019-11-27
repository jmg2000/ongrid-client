import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'
import { Modal, Form, Input, Select, InputNumber } from 'antd'

const { Option } = Select

const CreateObjectForm = Form.create({ name: 'createObjectModal' })(
  class extends Component {
    state = {
      fieldType: 'data'
    }

    componentDidUpdate () {
      const { getFieldValue } = this.props.form
      if (this.state.fieldType === 'data' && getFieldValue('fieldType') === 'lookup') {
        this.setState({ fieldType: 'lookup' })
      }
      if (this.state.fieldType === 'lookup' && getFieldValue('fieldType') === 'data') {
        this.setState({ fieldType: 'data' })
      }
    }

    validateObjectName = (rule, value, cb) => {
      const { objectsList } = this.props
      console.log('validator', rule, value)
      if (objectsList.find(obj => obj.name.toLowerCase() === value.toLowerCase())) {
        cb(false)
      }
      cb()
    }

    render () {
      const { visible, isField, onCreate, onCancel, form, t } = this.props
      const { getFieldDecorator } = form
      return (
        <Modal
          visible={visible}
          title={t('configurator.newObject')}
          okText='Create'
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout='vertical'>
            <Form.Item label={t('configurator.name')} style={{ marginBottom: '5px' }}>
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: 'Please input the name of object' },
                  {
                    validator: this.validateObjectName,
                    message: 'An object with this name already exists.'
                  }
                ]
              })(<Input />)}
            </Form.Item>
            <Form.Item label={t('configurator.desc')} style={{ marginBottom: '5px' }}>
              {getFieldDecorator('description')(<Input />)}
            </Form.Item>
            {isField && (
              <React.Fragment>
                <Form.Item label={t('configurator.fieldType')} style={{ marginBottom: '5px' }}>
                  {getFieldDecorator('fieldType', {
                    rules: [{ required: true, message: t('configurator.fieldTypeMsg') }],
                    initialValue: 'data'
                  })(
                    <Select>
                      <Option value='data'>Data</Option>
                      <Option value='lookup'>Lookup</Option>
                    </Select>
                  )}
                </Form.Item>
                {this.state.fieldType === 'data' && (
                  <React.Fragment>
                    <Form.Item label={t('configurator.fieldDataType')} style={{ marginBottom: '5px' }}>
                      {getFieldDecorator('fieldDataType', {
                        rules: [{ required: true, message: t('configurator.fieldDataTypeMsg') }],
                        initialValue: 'string'
                      })(
                        <Select>
                          <Option value='string'>String</Option>
                          <Option value='integer'>Integer</Option>
                          <Option value='numeric'>Numeric</Option>
                          <Option value='date'>Date</Option>
                          <Option value='logic'>Logic</Option>
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item label={t('configurator.fieldDataSize')} style={{ marginBottom: '5px' }}>
                      {getFieldDecorator('fieldDataSize', {
                        initialValue: 20
                      })(<InputNumber />)}
                    </Form.Item>
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </Form>
        </Modal>
      )
    }
  }
)

export default withNamespaces('translation')(CreateObjectForm)
