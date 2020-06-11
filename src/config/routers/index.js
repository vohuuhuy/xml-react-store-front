import {
  Login,
  Home
} from '../../pages'

export const DefaultComponent = Login

export const routers = [
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]