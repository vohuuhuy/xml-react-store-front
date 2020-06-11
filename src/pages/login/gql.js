import gql from 'graphql-tag'

const QUERY_LOGIN = gql`
  query login ($username: String!, $password: String!) {
    login (username: $username, password: $password)
  }
`

export {
  QUERY_LOGIN
}