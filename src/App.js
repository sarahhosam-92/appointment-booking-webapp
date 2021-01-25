/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify from 'aws-amplify'
import BookAppointment from "./BookAppointment.js"
import Appointments from "./Appointments.js"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const App = () => {
  return (
    <div>
      <Router>
        <div>
          {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
          <Switch>
            <Route path="/appointments" component={Appointments}>
              <Appointments />
            </Route>
            <Route exact path="/" component={BookAppointment}>
              <MuiThemeProvider>
                <BookAppointment />
              </MuiThemeProvider>
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  )
}

export default App