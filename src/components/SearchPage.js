import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import { getDistance } from 'geolib';
import _ from 'lodash';
import queryString from 'query-string';

import SearchForm from '../containers/SearchForm';
import GeocodeResult from './GeocodeResult';
import Map from './Map';
// import HotelsTable from './HotelsTable';

const URL_BASE = 'https://app.rakuten.co.jp/services/api/Travel/';
const SIMPLE_HOTEL_SEARCH_ENDPOINT = `${URL_BASE}SimpleHotelSearch/20170426`;

const sortedHotels = (hotels, sortKey) => _.sortBy(hotels, h => h[sortKey]);

class SearchPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // place: this.getPlaceParams() || '東京タワー',
      // location: {
      //   lat: 35.6585805,
      //   lng: 139.7454329,
      // },
      sortKey: 'price',
    };
  }

  componentDidMount() { // don't use 'setState' in componentDidMount
    // const place = this.getPlaceParams();
    // if (place) {
    //   this.startSearch(place);
    // }
  }

  getPlaceParams() {
    const params = queryString.parse(this.props.location.search);
    const place = params.place;
    if (place && place.length > 0) {
      return place;
    }
    return null
  }

  setErrorMessage(message) {
    this.setState({
      address: message,
      location: {
        lat: 0,
        lng: 0,
      },
    });
  }

  // handlePlaceSubmit(e) {
  //   e.preventDefault();
  //   this.props.history.push(`/?place=${this.state.place}`);
  //   this.startSearch();
  // }


  handleSortKeyChange(sortKey) {
    this.setState({
      sortKey,
      hotels: sortedHotels(this.state.hotels, sortKey),
    })
  }

  render() {
    return (
      <div className='search-page'>
        <h1 className='app-title'>ホテル検索</h1>
        <SearchForm />
        <div className='result-area'>
          <Map location={this.props.geocodeResult.location} />
          <div className='result-right'>
            <GeocodeResult
              address={this.props.geocodeResult.address}
              location={this.props.geocodeResult.location}
            />
            {/* <h2>ホテル検索結果</h2>
            <HotelsTable
              hotels={this.state.hotels}
              sortKey={this.state.sortKey}
              onSort={sortKey => this.handleSortKeyChange(sortKey)}
            /> */}
          </div>
        </div>
      </div>
    );
  }
}

SearchPage.propTypes = {
  // history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
  geocodeResult: PropTypes.shape({
    address: PropTypes.string.isRequired,
    location: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  }).isRequired,
};

const mapStateToProps = state => ({
  geocodeResult: state.geocodeResult,
});

export default connect(mapStateToProps)(SearchPage);