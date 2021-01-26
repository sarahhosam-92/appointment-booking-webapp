import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation, Auth } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import BookAppointment from "./BookAppointment.js"
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react'
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import axios from "axios";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const localizer = momentLocalizer(moment)

// The component you should use instead the one you mentioned.

const Appointments = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [username, setUsername] = useState()
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchTodos();

    axios.get(`https://xupmk08w65.execute-api.us-east-2.amazonaws.com/dev/appointments`).then(response => {
      console.log("response via db: ", response.data);
      const eventsArr = [];
      response.data.map((e, index) => {
        const date = new Date(e.startDate.replace( /(\d{4})-(\d{2})-(\d{2})/, "$3/$2/$1"));
        const day = date.getDate();
        const month = date.getMonth();
        console.log(date);
        const event = {
          'title': e.name,
          'start': new Date(2021, month, day, 9 + parseInt(e.time), 0, 0, 0),
          'end': new Date(2021, month, day, 10 + parseInt(e.time), 0, 0, 0),
        }
        eventsArr.push(event);
        console.log(eventsArr);
      });
      setEvents(eventsArr);
    });

    Auth.currentAuthenticatedUser({
      bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    }).then(user => setUsername(user.username))
      .catch(err => console.log(err));
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value, [`name`]: username })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!username || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))

    } catch (err) {
      console.log('error creating todo:', err)
    }
  }


  // const events = [
  // {
  //   start: moment().toDate(),
  //     end: moment()
  //       .add(1, "days")
  //       .toDate(),
  //     title: "Title one"
  // },
  //   {
  //     start: moment().toDate(),
  //       end: moment()
  // .add(1, "days")
  // .toDate(),
  //       title: "Title two"
  //   },
  // ];

  // function handleSelect(e) {
  //   const title = window.prompt('New Event name')
  //   const event = {
  //     start: e.start,
  //     end: e.end,
  //     title,
  //   }
  //   if (title)
  //     setEvents([...events, event])
  // }

  return (
    <div
      style={styles.container}
    >
      <AmplifySignOut />
      {/* {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))
      } */}
      <Calendar
        // selectable
        localizer={localizer}
        events={events}
        onSelectEvent={event => alert(event.title)}
        // onSelectSlot={handleSelect}
        defaultView={Views.DAY}
        style={{ height: 500 }}
        startAccessor="start"
        endAccessor="end"
        defaultDate={moment().toDate()}
      />
    </div>
  )
}

const styles = {
  container: { width: '80%', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: { marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(Appointments);