import React, { createContext, useState, useEffect } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Client } from './config'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { routers, DefaultComponent } from './config'
import './common/css/index.css'
import 'antd/dist/antd.css'

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

  useEffect(() => {
    setContext({
      ...context,
      NguoiDung: {
        ...JSON.parse(localStorage.getItem('NguoiDung'))
      }
    })
  }, [])

  const childProps = {
    onSetContext: cont => setContext(cont)
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
