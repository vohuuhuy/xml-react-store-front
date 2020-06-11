import React, { useContext, useEffect, useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { Layout, Menu, PageHeader, Button, Descriptions, Avatar, Popover, Drawer } from 'antd'
import {
  HomeOutlined,
  UserOutlined
} from '@ant-design/icons'
import './index.css'
import { Appcontext } from '../../App';

const { Content, Footer, Sider } = Layout;

const Home = (props) => {
  const appContext = useContext(Appcontext)
  const history = useHistory()

  const drawerInfo = useRef({ title: '' })

  const [poAva, setPoAva] = useState(false)
  const [menuSelected, setMenuSelected] = useState(1)
  const [drawer, setDrawer] = useState(false)

  useEffect(() => {
    if (!appContext?.NguoiDung?.TaiKhoan && !localStorage.getItem('NguoiDung')) {
      history.push('/login')
    }
  }, [])

  const  hidePove = () => setPoAva(false)

  const handleVisibleChange = visible => setPoAva(visible)

  const onCloseDrawer = () => setDrawer(false)

  const showDrawer = () => setDrawer(true)

  const showEditInfo = () => {
    drawerInfo.current = {
      title: 'Người dùng'
    }
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
    if (menuSelected === 1) return 'Demo'
    return 'Huy'
  }

  return (
    <>
      <div className="site-page-header-ghost-wrapper">
        <PageHeader
          ghost={false}
          // onBack={() => window.history.back()}
          title="Phần Mềm Quản Lý Tạp Hóa"
          subTitle="59CNTT2"
          extra={[
            // <Button key="3">Operation</Button>,
            <Popover
              content={content}
              title="Title"
              trigger="click"
              visible={poAva}
              onVisibleChange={handleVisibleChange}
            >
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} className='hoverPoniter' />
            </Popover>,
            <Button key="1" type="primary" onClick={() => {
              localStorage.removeItem('NguoiDung')
              history.push('login')
            }}>
              Đăng xuất
            </Button>,
          ]}
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="Tài Khoản">{ appContext?.NguoiDung?.TaiKhoan["$t"] }</Descriptions.Item>
            <Descriptions.Item label="Chức vụ"><a>{ appContext?.NguoiDung?.ChucVu["$t"] === "QUAN_LY" ? "Quản lý" : "Nhân viên" }</a></Descriptions.Item>
            <Descriptions.Item label="Họ Tên">{ appContext?.NguoiDung?.HoTen["$t"] }</Descriptions.Item>
          </Descriptions>
        </PageHeader>
      </div>
      <Layout>
        <Sider
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} onOpenChange={key => setMenuSelected(key)}>
            <Menu.Item key="1" icon={<HomeOutlined />}>Home</Menu.Item>
            {/* <Menu.Item key="2" icon={<VideoCameraOutlined />}>nav 2</Menu.Item> */}
            {/* <Menu.Item key="3" icon={<UploadOutlined />}>
              nav 3
            </Menu.Item>
            <Menu.Item key="4" icon={<BarChartOutlined />}>
              nav 4
            </Menu.Item>
            <Menu.Item key="5" icon={<CloudOutlined />}>
              nav 5
            </Menu.Item>
            <Menu.Item key="6" icon={<AppstoreOutlined />}>
              nav 6
            </Menu.Item>
            <Menu.Item key="7" icon={<TeamOutlined />}>
              nav 7
            </Menu.Item>
            <Menu.Item key="8" icon={<ShopOutlined />}>
              nav 8
            </Menu.Item> */}
          </Menu>
        </Sider>
        <Layout className="site-layout" style={{ marginLeft: 200 }}>
          {/* <Header className="site-layout-background" style={{ padding: 0 }} /> */}
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div className="site-layout-background" style={{ padding: 24, textAlign: 'center' }}>
              <Body { ...props } />
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>59CNTT2</Footer>
        </Layout>
      </Layout>
      <Drawer
        title={drawerInfo.current.title}
        width={350}
        placement="right"
        closable={false}
        onClose={onCloseDrawer}
        visible={drawer}
        footer={
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <Button onClick={onCloseDrawer} type="primary">Lưu</Button>
          </div>
        }
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  )
}

export default Home
