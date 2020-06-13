import React, { useState, useCallback, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { QUERY_LOGIN } from './gql'
import { Client } from '../../config'
import './index.css'
import { Appcontext } from '../../App'

const initFieldLogins = { username: '', password: '' }

const Login = props => {

  const [fieldLogins, setFieldLogins] = useState(initFieldLogins)

  const history = useHistory()
  const appContext = useContext(Appcontext)
  const { onSetContext } = props

  const handleLogin = useCallback(() => {
    const { username, password } = fieldLogins
    if (!username) { return }
    if (!password) { return }
    Client.query({
      query: QUERY_LOGIN,
      variables: { username, password },
      fetchPolicy: 'network-only'
    })
      .then(({ data: { login } }) => {
        if (login != null) {
          const result = JSON.parse(login)
          onSetContext({
            ...appContext,
            NguoiDung: {
              ...result
            }
          })
          localStorage.setItem('NguoiDung', login)
          history.push('/home')
        }
      })
      .catch(errors => {
        console.log(errors)
      })
  }, [fieldLogins, Client, history])

  return (
    <div className='login'>
      <span className='title-login'>Đăng nhập bằng tài khoản</span>
      <input
        className='form-login-input form-login-usename'
        placeholder='Tên người dùng'
        onChange={event => setFieldLogins({ ...fieldLogins, username: event.target.value })}
        value={fieldLogins.username}
      />
      <input
        className='form-login-input form-login-password'
        placeholder='Mật khẩu'
        onChange={event => setFieldLogins({ ...fieldLogins, password: event.target.value })}
        type='password'
        value={fieldLogins.password}
      />
      <button
        className='tqc-ui-btn form-login-btn-submit'
        onClick={handleLogin}
      >
        Đăng Nhập
      </button>
    </div>
  )
}

export default Login