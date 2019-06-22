import React from 'react'
import { Field, FieldArray, reduxForm } from 'redux-form'

const adaptFileEventToValue = delegate => e => delegate(e.target.files[0])

const FileInput = ({
  input: { value: omitValue, onChange, onBlur, ...inputProps },
  meta: omitMeta,
  ...props
}) => {
  return (
    <input
      onChange={adaptFileEventToValue(onChange)}
      onBlur={adaptFileEventToValue(onBlur)}
      type='file'
      className='form-control-file'
      {...props.input}
      {...props}
    />
  )
}

const renderField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label htmlFor={input.name}>{label}</label>
    <div className='form-group'>
      <Field {...input} component={FileInput} type={type} placeholder={label} />
      {touched && error && <span>{error}</span>}
    </div>
  </div>
)

const renderAttachments = ({ fields, meta: { error, submitFailed } }) => (
  <ul>
    <li>
      <button
        type='button'
        className='btn btn-info'
        onClick={() => fields.push({})}
      >
        Добавить файл
      </button>
    </li>
    {fields.map((member, index) => (
      <li key={index}>
        <button
          type='button'
          className='btn btn-danger'
          title='Удалить файл'
          onClick={() => fields.remove(index)}
        >
          Удалить
        </button>
        <Field
          name={`${member}`}
          type='file'
          component={renderField}
          label='Прикрепить файл'
        />
      </li>
    ))}
  </ul>
)

let NewMessage = props => {
  const { handleSubmit } = props
  return (
    <form onSubmit={handleSubmit}>
      <div className='form-group'>
        <label htmlFor='to'>Кому</label>
        <Field
          name='to'
          component='select'
          type='text'
          className='form-control'
        >
          <option>Выберете адресата</option>
          {console.log(props.recipients)}
          {props.recipients.map(recipient => (
            <option key={recipient.id} value={recipient.id}>
              {recipient.name}
            </option>
          ))}
        </Field>
      </div>
      <div className='form-group'>
        <label htmlFor='message'>Сообщение</label>
        <Field
          name='body'
          component='textarea'
          cols='20'
          rows='10'
          className='form-control'
        />
      </div>
      <FieldArray name='attachments' component={renderAttachments} />

      <button className='btn btn-success'>Отправить</button>
    </form>
  )
}

NewMessage = reduxForm({ form: 'newMessage' })(NewMessage)

export default NewMessage
