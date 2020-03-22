import gql from 'graphql-tag';

// Retrieves the details of a specific event a user is registered to.
export const GET_EVENT_DETAILS = gql`
  query getEventDetails($id: ID!, $email: String!) {
    profile(where: {email: $email}){
      id
      events(where: {id: $id}){
        id
        title
        startDate
        endDate
        location
        imgUrl
        details
        activities {
          id
          name
          startDate
          location
          startTime
        }
      }
    }
  }
`;