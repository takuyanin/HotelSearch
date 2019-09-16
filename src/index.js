import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';

// import App from './components/App';
import SearchPage from './containers/SearchPage';
import reducer from './reducers/';

// ReactDOM.render(<App />, document.querySelector('.container'));
ReactDOM.render(
  <SearchPage
    history={history}
    location={location}
    store={createStore(reducer)}
  />,
  document.querySelector('.container')
);
