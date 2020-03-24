// React imports
import React from 'react'
// Reach Router imports
import { useParams } from '@reach/router';
// Component imports
import EventDetails from './EventDetails';
// Auth0 imports
import { useAuth0 } from '../../config/react-auth0-spa';
// GraphQL/Apollo imports
import { useQuery } from 'react-apollo';
import { GET_EVENT_DETAILS } from './queries';
// Styling imports
import { Flex, Box } from 'adaptiv-ui';


export default function UserEventDetails() {
  const { eventId } = useParams();
  const { user } = useAuth0();
  const { loading, error, data } = useQuery(GET_EVENT_DETAILS, {
    variables: { id: eventId, email: user.email },
  });
  const activeEvent = data?.profile?.events?.filter(event => event.id === eventId)
  
  if (loading) return 'Loading...';
  if (error) return   `Error! ${error.message}`;
  console.log(eventId)
  console.log('data', data.profile.events[0].activities)
  console.log('active', activeEvent)
  return (
    <Flex ai_start col stretch>
      <h4 style={{marginBottom: '0.5rem', fontSize: "2.4rem"}}>Event Details</h4>
      <Box h="0.2rem" w="90%" bg="lightgrey" />
      {activeEvent &&
        <EventDetails event={activeEvent} />
      }
    </Flex>
  )
}