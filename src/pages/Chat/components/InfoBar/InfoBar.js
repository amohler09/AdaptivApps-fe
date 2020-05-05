import React, { useState } from "react";
import { useQuery } from "react-apollo";
import { GET_CHAT_ROOMS, CHAT_ROOM_SUBSCRIPTION } from '../../queries/ChatRooms';
import { CHAT_SUBSCRIPTION, GET_MESSAGES } from '../../queries/Chats';
import RecipientModal from './Modal';
import ChatRoom from './ChatRoom';
import AnnouncementModal from './AnnouncementModal';

//Auth0 imports
import config from "../../../../config/auth_config";

// Style Imports
import CreateIcon from '@material-ui/icons/Create';
import LanguageIcon from '@material-ui/icons/Language';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import {
  makeStyles,
  Box,
  TextField
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: 'column',
    whiteSpace: "nowrap",
    overflow: 'hidden'
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: "normal",
    color: '#2962FF',
    fontFamily: 'Arial',
    marginBottom: '10%',
    marginTop: "1%"
  },
  messageIcons: {
    maxWidth: '95%',
    display: 'flex',
    margin: '2.5% 0 5% 0',
    padding: '1%',
    alignItems: 'center',
    "&:hover": {
      background: 'lightgrey',
      borderRadius: '5px'
    }
  },
  icons: {
    fontSize: '2.75rem',
    color: 'grey',
    cursor: "pointer",
    marginRight: '10%'    
  },
  span: {
    fontSize: '1.5rem',
    color: 'grey',
    cursor: 'pointer'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: "-webkit-xxx-large",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  button: {
    marginTop: '3%'
  },
  chatroom: {
    margin: '5% 0'
  },
  divider: {
    marginTop:'5%'
  },
  box: {
    position: 'absolute',
    bottom: '0',
    margin: '1% 1% 1% -1%',
    width: '17.5%'
  },
  searchBox: {
    width: '90%',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  chatRoomDiv: {
    maxHeight: '80vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    overflow: 'auto'
  }
}));

function InfoBar({ user }) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [announcement, setAnnouncementOpen] = useState(false);
    const [searchRecipient, setSearchRecipient] = useState("");
    const [results, setResults] = useState([]);

    const { loading, error, data, refetch, subscribeToMore } = useQuery(GET_CHAT_ROOMS, { variables: { email: user.email } });
    const { subscribeToMore: chatsSubscribe } = useQuery(GET_MESSAGES, { variables: { email: user.email } });

    const _subscribeToNewChatRoom = subscribeToMore => {
      subscribeToMore({
        document: CHAT_ROOM_SUBSCRIPTION,
        updateQuery: (prev, {subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const chatRoom = subscriptionData.data.chatRoom
          const exists = prev.profile.chatRooms.find(({ id }) => id === chatRoom.id);
          if (exists) return prev;
          refetch();
          return Object.assign({}, prev, {
            profile: {
              chatRooms: [chatRoom, ...prev.profile.chatRooms],
              __typename: prev.profile.__typename
            }
          })
        }
      })
    };

    const _subscribeToNewChats = chatsSubscribe => {
      chatsSubscribe({
        document: CHAT_SUBSCRIPTION,
        updateQuery: (prev, {subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const chat = subscriptionData.data.chat
          refetch();
          return Object.assign({}, prev, {
            profile: {
              chats: [chat, ...prev.profile.chats],
              __typename: prev.profile.__typename
            }
          })
        }
      })
    };

    if (loading) return <CircularProgress className={classes.loadingSpinner} />;
    if (error) return `Error! ${error.message}`;

    _subscribeToNewChatRoom(subscribeToMore);
    _subscribeToNewChats(chatsSubscribe);

    const searchRooms = e => {
      e.preventDefault();
      let filter = data?.profile.chatRooms.map(room => {
        let users = room.participants.map(user => {
          return `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`;
        });

        return users.filter(user => {
          if (user.includes(searchRecipient.toLowerCase())) {
            results.push(room);
            return results;
          };
        });
      });

      setSearchRecipient('');
    };

    const handleOpen = () => {
      setOpen(true);
    };
    
    const handleClose = () => {
      setOpen(false);
    };

    const handleChange = e => {
      setResults([]);
      setSearchRecipient(e.target.value);
    };

    const handleAnnouncementOpen = () => {
      setAnnouncementOpen(true);
    };

    const handleAnnouncementClose = () => {
      setAnnouncementOpen(false);
    };

    return (
      <div className={classes.root}>
        <h1 className={classes.header}>Messages</h1>
        <div className={classes.messageIcons}>
          <CreateIcon className={classes.icons} onClick={handleOpen} /><span className={classes.span} onClick={handleOpen}>New Message</span>
        </div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          className={classes.modal}
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}>
          <RecipientModal user={user} refetch={refetch} setOpen={setOpen}/>
        </Modal> 
        {user && user[config.roleUrl].includes("Admin") ? 
        (
          <>
            <div className={classes.messageIcons}>
              <LanguageIcon className={classes.icons} /><span className={classes.span} onClick={handleAnnouncementOpen}>New Announcement</span> 
          </div>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            className={classes.modal}
            open={announcement}
            onClose={handleAnnouncementClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}>
            <AnnouncementModal />
           </Modal>
          </>
        ) : null}
        <div className={classes.chatRoomDiv}>
          {results.length > 0 ? 
            (results.map((chatRoom, id) => (
              <div className={classes.chatroom}>
                <ChatRoom chatRoom={chatRoom} key={id} user={user} refetch={refetch} />
                <Divider variant="inset" className={classes.divider} />
              </div>
            )))
            :
            (data && data?.profile.chatRooms?.map((chatRoom, id) => (
              <div className={classes.chatroom}>
                <ChatRoom chatRoom={chatRoom} key={id} user={user} refetch={refetch} />
                <Divider variant="inset" className={classes.divider} />
              </div>
            )))
          }
        </div>
          <Box component="div" className={classes.box}>
            <TextField
              className={classes.searchBox}
              variant="outlined"
              type="text"
              name="message"
              placeholder="Search Messages..."
              value={searchRecipient}
              onChange={handleChange}
              InputProps={{
                endAdornment: 
                <InputAdornment position="end">
                  <IconButton onClick={searchRooms}>
                    <SearchIcon fontSize="large" />
                  </IconButton>
                </InputAdornment>
              }} />
          </Box>
      </div>
    )
};

export default InfoBar;