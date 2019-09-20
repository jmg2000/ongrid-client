import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Form, Input } from 'antd'

const { TextArea } = Input

const EditEventForm = Form.create({ name: 'edit_event_form' })(
  class extends Component {
    render () {
      const { visible, onCancel, onSave, defaultValue, form } = this.props
      const { getFieldDecorator } = form

      return (
        <Modal visible={visible} title='Редактирование события' okText='Сохранить' onCancel={onCancel} onOk={onSave}>
          <Form layout='vertical'>
            <Form.Item label='Код события:'>{getFieldDecorator('event', {
              initialValue: defaultValue
            })(<TextArea rows={20} />)}</Form.Item>
          </Form>
        </Modal>
      )
    }
  }
)

EditEventForm.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
}

export default EditEventForm
