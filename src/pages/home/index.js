import React, { useContext, useEffect, useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, PageHeader, Button, Descriptions, Avatar, Popover, Drawer } from 'antd'
import {
  HomeOutlined,
  UserOutlined,
  BankOutlined,
  UserSwitchOutlined,
  CodeSandboxOutlined,
  AppstoreAddOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import './index.css'
import { Appcontext } from '../../App'
import EditInfo from './editInfo'
import User from './user'
import Manu from './manu'
import Cus from './cus'
import Model from './model'
import Import from './import'
import Sale from './sale'

const { Content, Footer, Sider } = Layout

const Home = (props) => {
  const appContext = useContext(Appcontext)
  const history = useHistory()

  const drawerInfo = useRef({ title: '' })

  const [poAva, setPoAva] = useState(false)
  const [menuSelected, setMenuSelected] = useState(1)
  const [drawer, setDrawer] = useState(false)
  const [bodyDrawer, setBodyDrawer] = useState('')

  const refBodeDrawer = useRef()

  useEffect(() => {
    if (!appContext?.NguoiDung?.TaiKhoan && !localStorage.getItem('NguoiDung')) {
      history.push('/login')
    }
    const header = document.querySelector('#header')
    const body = document.querySelector('#body')
    const sider = document.querySelector('#sider')
    let headerHeight = header.offsetHeight;
    headerHeight += parseInt(window.getComputedStyle(header).getPropertyValue('margin-top'));
    headerHeight += parseInt(window.getComputedStyle(header).getPropertyValue('margin-bottom'));
    body.style.marginTop = headerHeight + 'px'
    sider.style.paddingTop = headerHeight + 'px'
  }, [appContext, history])

  const  hidePove = () => setPoAva(false)

  const handleVisibleChange = visible => setPoAva(visible)

  const onCloseDrawer = () => setDrawer(false)

  const showDrawer = () => setDrawer(true)

  const showEditInfo = () => {
    drawerInfo.current = {
      title: 'Người dùng'
    }
    setBodyDrawer('EditInfo')
    hidePove()
    showDrawer()

  }

  const content = (
    <div>
      <a onClick={showEditInfo}>Chỉnh sửa thông tin</a>
      <br />
      <a onClick={hidePove}>Đóng</a>
    </div>
  )
  const Body = pros => {
    if (menuSelected === 1) return (<>Demo</>)
    if (menuSelected === 2) return (<User updateUser={props.updateUser} />)
    if (menuSelected === 3) return (<Manu />)
    if (menuSelected === 4) return (<Cus />)
    if (menuSelected === 5) return (<Model />)
    if (menuSelected === 6) return (<Import />)
    if (menuSelected === 7) return (<Sale />)
  }

  const BodyDrawer = () => {
    switch (bodyDrawer) {
      case 'EditInfo': return (<EditInfo ref={refBodeDrawer} nguoiDung={appContext?.NguoiDung} updateUser={props.updateUser} />)
    }
  }

  const saveDrawer = () => {
    refBodeDrawer.current.save()
  }

  return (
    <>
      <div id='header' className='site-page-header-ghost-wrapper' style={{ position: 'fixed', zIndex: 1 }}>
        <PageHeader
          ghost={false}
          // onBack={() => window.history.back()}
          title='Phần Mềm Quản Lý Tạp Hóa'
          subTitle='59CNTT2'
          extra={[
            // <Button key='3'>Operation</Button>,
            <Popover
              content={content}
              trigger='click'
              visible={poAva}
              onVisibleChange={handleVisibleChange}
            >
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} className='hoverPoniter' />
            </Popover>,
            <Button key='1' type='primary' onClick={() => {
              localStorage.removeItem('NguoiDung')
              history.push('login')
            }}>
              Đăng xuất
            </Button>,
          ]}
        >
          <Descriptions size='small' column={3}>
            <Descriptions.Item label='Tài Khoản'>{ appContext?.NguoiDung?.TaiKhoan['$t'] }</Descriptions.Item>
            <Descriptions.Item label='Chức vụ'><a>{ appContext?.NguoiDung?.ChucVu['$t'] === 'QUAN_LY' ? 'Quản lý' : 'Nhân viên' }</a></Descriptions.Item>
            <Descriptions.Item label='Họ Tên'>{ appContext?.NguoiDung?.HoTen['$t'] }</Descriptions.Item>
          </Descriptions>
        </PageHeader>
      </div>
      <Layout>
        <Sider
          id='sider'
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          <div className='logo' />
          <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} onOpenChange={key => setMenuSelected(key)}>
            <Menu.Item key='1' icon={<HomeOutlined />} onClick={() => setMenuSelected(1)}>Home</Menu.Item>
            <Menu.Item key='6' icon={<AppstoreAddOutlined />} onClick={() => setMenuSelected(6)}>Nhập hàng</Menu.Item>
            <Menu.Item key='7' icon={<ShoppingCartOutlined />} onClick={() => setMenuSelected(7)}>Bán hàng</Menu.Item>
            <Menu.Item disabled>Danh mục</Menu.Item>
            {appContext?.NguoiDung?.ChucVu['$t'] === 'QUAN_LY' && <Menu.Item key='2' icon={<UserOutlined />} onClick={() => setMenuSelected(2)}>Người dùng</Menu.Item>}
            <Menu.Item key='3' icon={<BankOutlined />} onClick={() => setMenuSelected(3)}>Nhà cung cấp</Menu.Item>
            <Menu.Item key='4' icon={<UserSwitchOutlined />} onClick={() => setMenuSelected(4)}>Khách hàng</Menu.Item>
            <Menu.Item key='5' icon={<CodeSandboxOutlined />} onClick={() => setMenuSelected(5)}>Mẫu hàng</Menu.Item>
            {/* <Menu.Item key='6' icon={<AppstoreOutlined />}>
              nav 6
            </Menu.Item>
            <Menu.Item key='7' icon={<TeamOutlined />}>
              nav 7
            </Menu.Item>
            <Menu.Item key='8' icon={<ShopOutlined />}>
              nav 8
            </Menu.Item> */}
          </Menu>
        </Sider>
        <Layout id='body' className='site-layout' style={{ marginLeft: 200, zIndex: 0 }}>
          {/* <Header className='site-layout-background' style={{ padding: 0 }} /> */}
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div className='site-layout-background' style={{ padding: 24 }}>
              <Body { ...props } />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>59CNTT2</Footer>
        </Layout>
      </Layout>
      <Drawer
        title={drawerInfo.current.title}
        width={Math.max(400, window.innerWidth / 3)}
        placement='right'
        closable={false}
        onClose={onCloseDrawer}
        visible={drawer}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={saveDrawer} type='primary'>Lưu</Button>
          </div>
        }
      >
        <BodyDrawer />
      </Drawer>
    </>
  )
}

export default Home
