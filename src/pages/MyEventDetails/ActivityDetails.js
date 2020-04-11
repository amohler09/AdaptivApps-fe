// React imports
import React from 'react';
// Auth0 imports
import { useAuth0 } from '../../config/react-auth0-spa';
import SimpleModal from '../ActivitiesList/SimpleModal';

import { useQuery } from 'react-apollo';
import { useParams } from '@reach/router';
import { GET_EVENT_ACTIVITIES } from '../ActivitiesList/queries/getActivities';
// Styling imports
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  nameLink: {
    color: '#2962FF',
  },
});
export default function ActivityDetails({ activity }) {
  const classes = useStyles();
  const { user } = useAuth0();
  const { eventId } = useParams();
  const { data } = useQuery(GET_EVENT_ACTIVITIES, {
    variables: { id: eventId },
  });
  return (
    <tr>
      <td className={classes.nameLink}>
        <SimpleModal activity={activity} data={data} />
      </td>
      <td>{activity.startDate}</td>
      <td>{activity.location}</td>
      <td>{activity.startTime}</td>
      {activity.participants.map((participant, id) =>
        participant && participant.profile.email === user.email ? (
          <td>{participant.role}</td>
        ) : null
      )}
    </tr>
  );
}

ActivityDetails.propTypes = {
  activity: PropTypes.object,
};
