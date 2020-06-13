import React, { createContext, useState, useEffect } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Client } from './config'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { routers, DefaultComponent } from './config'
import { QUERY_FIND_USER } from './pages/home/gql'
import './common/css/index.css'
import 'antd/dist/antd.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import 'ag-grid-enterprise'

export const Appcontext = createContext({})

function App() {
  const [context, setContext] = useState({
    NguoiDung: {
      MaND: '',
      TaiKhoan: '',
      MatKhau: '',
      ChucVu: '',
      HoTen: '',
      SDT: '',
      Anh: '',
      DiaChi: '',
      GioiTinh: '',
    }
  })

  const updateUser = () => {
    const TaiKhoan = JSON.parse(localStorage.getItem('NguoiDung'))?.TaiKhoan['$t']
    if (!TaiKhoan) return
    Client.query({
      query: QUERY_FIND_USER,
      variables: { TaiKhoan },
      fetchPolicy: 'network-only'
    })
      .then(({ data }) => {
        if (data.findUser) {
          localStorage.setItem('NguoiDung', data.findUser)
          setContext({
            ...context,
            NguoiDung: {
              ...JSON.parse(data.findUser)
            }
          })
        }
      })
  }

  useEffect(() => {
    updateUser()
  }, [])

  const childProps = {
    onSetContext: cont => setContext(cont),
    updateUser
  }
  return (
    <ApolloProvider client={Client}>
      <Appcontext.Provider value={context}>
        <div className='page'>
          <BrowserRouter>
            <div className='page'>
              <Switch>
                {routers.map((route, i) =>
                  <Route
                    key={i}
                    path={route.path}
                    render={propsRoute => <route.component { ...childProps } { ...propsRoute } routes={route.routes} />}
                  />
                )}
                <Route path="/">
                  <DefaultComponent { ...childProps } />
                </Route>
              </Switch>
            </div>
          </BrowserRouter>
        </div>
      </Appcontext.Provider>
    </ApolloProvider>
  )
}

export default App
