import React, { Component } from 'react'
import { withNamespaces } from 'react-i18next'
import { Modal, Form, Input, Select, InputNumber } from 'antd'

const { Option } = Select

const CreateObjectForm = Form.create({ name: 'createObjectModal' })(
  class extends Component {
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
          <Form>
            <Form.Item label={t('configurator.name')}>
              {getFieldDecorator('name', {
                rules: [{ required: true, message: 'Please input the name of object' }]
              })(<Input />)}
            </Form.Item>
            <Form.Item label={t('configurator.desc')}>{getFieldDecorator('description')(<Input />)}</Form.Item>
            {isField && (
              <React.Fragment>
                <Form.Item label={t('configurator.fieldType')}>
                  {getFieldDecorator('fieldType', {
                    initialValue: 'string'
                  })(
                    <Select>
                      <Option value='string'>String</Option>
                      <Option value='integer'>Integer</Option>
                      <Option value='numeric'>Numeric</Option>
                      <Option value='date'>Date</Option>
                    </Select>
                  )}
                </Form.Item>
                <Form.Item label={t('configurator.fieldSize')}>
                  {getFieldDecorator('fieldSize', {
                    initialValue: 20
                  })(<InputNumber />)}
                </Form.Item>
              </React.Fragment>
            )}
          </Form>
        </Modal>
      )
    }
  }
)

export default withNamespaces('translation')(CreateObjectForm)
