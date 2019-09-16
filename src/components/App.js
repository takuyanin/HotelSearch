import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
} from 'react-router-dom';

import SearchPage from './SearchPage';
import AboutPage from './AboutPage';

const App = () => (
  <Router>
    <div className='app'>
      <ul className='left-navi'>
        <li><a href='/'>ホテル検索</a></li>
        <li><a href='/about'>About</a></li>
      </ul>
      <Switch>
        <Route exact path='/' component={SearchPage} />
        <Route exact path='/about' component={AboutPage} />
      </Switch>
    </div>
  </Router>
 )

export default App;