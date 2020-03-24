import React from 'react';
import { Flex, Input } from 'adaptiv-ui';
import { useQuery, useMutation } from 'react-apollo';
import {
  CREATE_ACTIVITY,
  UPDATE_ACTIVITY,
  DELETE_ACTIVITY,
  GET_ONE_EVENT,
} from './queries';
import MaterialTable from 'material-table';

const AdminActivityList = props => {
  const event_id = props.event_id;
  const { data, refetch } = useQuery(GET_ONE_EVENT, {
    variables: {
      id: event_id,
    },
  });

  const [CreateActivity] = useMutation(CREATE_ACTIVITY);
  const [UpdateActivity] = useMutation(UPDATE_ACTIVITY);
  const [DeleteActivity] = useMutation(DELETE_ACTIVITY);

  return (
    <Flex col m="0 2% 0 2%">
      <MaterialTable
        title="List of Activities"
        columns={[
          { title: 'Name', field: 'name' },
          {
            title: 'Date',
            field: 'startDate',
            editComponent: props => (
              <Input
                type="date"
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                m="0 0 0 -0.5rem"
              />
            ),
          },
          {
            title: 'Time',
            field: 'startTime',
            editComponent: props => (
              <Input
                type="time"
                value={props.value}
                onChange={e => props.onChange(e.target.value)}
                m="0 0 0 -0.5rem"
              />
            ),
          },
          { title: 'Location', field: 'location' },
          { title: 'Type', field: 'type' },
          { title: 'Details', field: 'details' },
        ]}
        data={data?.event?.activities}
        editable={{
          onRowAdd: async newData => {
            await CreateActivity({
              variables: {
                name: newData.name,
                startDate: newData.startDate,
                startTime: newData.startTime,
                location: newData.location,
                type: newData.type,
                details: newData.details,
                event_id: event_id,
              },
            });
            refetch();
          },
          onRowUpdate: async (newData, oldData) => {
            await UpdateActivity({
              variables: {
                id: oldData.id,
                name: newData.name,
                startDate: newData.startDate,
                startTime: newData.startTime,
                location: newData.location,
                type: newData.type,
                details: newData.details,
              },
            });
            refetch();
          },
          onRowDelete: async oldData => {
            await DeleteActivity({
              variables: {
                id: oldData.id,
              },
            });
            refetch();
          },
        }}
        options={{
          search: false,
          showTitle: true,
          paging: false,
          emptyRowsWhenPaging: false,
          cellStyle: {
            fontSize: '1.2rem',
          },
          headerStyle: {
            fontSize: '1.2rem',
          },
        }}
      />
    </Flex>
  );
};

export default AdminActivityList;