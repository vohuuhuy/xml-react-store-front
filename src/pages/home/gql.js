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

// manu
const MUTATION_UPDATE_MANU = gql`
  mutation updateManu($input: String) {
    updateManu (input: $input)
  }
`

const MUTATION_ADD_MANU = gql`
  mutation addManu($input: String) {
    addManu (input: $input)
  }
`

const MUTATION_DELETE_MANUS = gql`
  mutation deleteManus($Mas: [String]) {
    deleteManus(Mas: $Mas)
  }
`

const QUERY_FIND_ALL_MANU = gql`
  query findAllManu {
    findAllManu
  }
`

// cus
const MUTATION_UPDATE_CUS = gql`
  mutation updateCus($input: String) {
    updateCus (input: $input)
  }
`

const MUTATION_ADD_CUS = gql`
  mutation addCus($input: String) {
    addCus (input: $input)
  }
`

const MUTATION_DELETE_CUSS = gql`
  mutation deleteCuss($Mas: [String]) {
    deleteCuss(Mas: $Mas)
  }
`

const QUERY_FIND_ALL_CUS = gql`
  query findAllCus {
    findAllCus
  }
`

// model
const MUTATION_UPDATE_MODEL = gql`
  mutation updateModel($input: String) {
    updateModel (input: $input)
  }
`

const MUTATION_ADD_MODEL = gql`
  mutation addModel($input: String) {
    addModel (input: $input)
  }
`

const MUTATION_DELETE_MODELS = gql`
  mutation deleteModels($Mas: [String]) {
    deleteModels(Mas: $Mas)
  }
`

const QUERY_FIND_ALL_MODEL = gql`
  query findAllModel {
    findAllModel
  }
`

// import

const QUERY_FIND_ALL_IMPORT = gql`
  query findAllImport {
    findAllImport
  }
`

const CREATE_IMPORT = gql`
  mutation createImport($imp: String, $stocks: String, $newStocks: String) {
    createImport(imp: $imp, stocks: $stocks, newStocks: $newStocks)
  }
`

// stock

const QUERY_FIND_ALL_STOCK = gql`
  query findAllStock {
    findAllStock
  }
`

export {
  MUTATION_UPDATE_USER,
  QUERY_FIND_USER,
  QUERY_FIND_ALL_USER,
  MUTATION_ADD_USER,
  MUTATION_DELETE_USERS,
  MUTATION_UPDATE_MANU,
  MUTATION_ADD_MANU,
  MUTATION_DELETE_MANUS,
  QUERY_FIND_ALL_MANU,
  MUTATION_UPDATE_CUS,
  MUTATION_ADD_CUS,
  MUTATION_DELETE_CUSS,
  QUERY_FIND_ALL_CUS,
  MUTATION_UPDATE_MODEL,
  MUTATION_ADD_MODEL,
  MUTATION_DELETE_MODELS,
  QUERY_FIND_ALL_MODEL,
  QUERY_FIND_ALL_IMPORT,
  QUERY_FIND_ALL_STOCK,
  CREATE_IMPORT
}