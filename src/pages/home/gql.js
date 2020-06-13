import gql from 'graphql-tag'

const MUTATION_UPDATE_USER = gql`
  mutation updateUser($input: String) {
    updateUser (input: $input)
  }
`

const MUTATION_ADD_USER = gql`
  mutation addUser($input: String) {
    addUser (input: $input)
  }
`

const MUTATION_DELETE_USERS = gql`
  mutation deleteUsers($TaiKhoans: [String]) {
    deleteUsers(TaiKhoans: $TaiKhoans)
  }
`

const QUERY_FIND_USER = gql`
  query findUser($TaiKhoan: String) {
    findUser (TaiKhoan: $TaiKhoan)
  }
`

const QUERY_FIND_ALL_USER = gql`
  query findAllUser {
    findAllUser
  }
`

export {
  MUTATION_UPDATE_USER,
  QUERY_FIND_USER,
  QUERY_FIND_ALL_USER,
  MUTATION_ADD_USER,
  MUTATION_DELETE_USERS
}