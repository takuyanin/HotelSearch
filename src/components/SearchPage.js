import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { getDistance } from 'geolib';
import _ from 'lodash';
import queryString from 'query-string';

import SearchForm from '../containers/SearchForm';
// import GeocodeResult from './GeocodeResult';
// import Map from './Map';
// import HotelsTable from './HotelsTable';
import { geocode } from '../domain/Geocoder'
import { RAKUTEN_APP_ID } from '../../.env.js'

const URL_BASE = 'https://app.rakuten.co.jp/services/api/Travel/';
const SIMPLE_HOTEL_SEARCH_ENDPOINT = `${URL_BASE}SimpleHotelSearch/20170426`;

const sortedHotels = (hotels, sortKey) => _.sortBy(hotels, h => h[sortKey]);

class SearchPage extends Component {
  constructor(props) {
    // console.log(props)
    super(props)
    this.state = {
      place: this.getPlaceParams() || '東京タワー',
      location: {
        lat: 35.6585805,
        lng: 139.7454329,
      },
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

  handlePlaceSubmit(e) {
    e.preventDefault();
    this.props.history.push(`/?place=${this.state.place}`);
    this.startSearch();
  }

  startSearch() {
    geocode(this.state.place)
      .then(({ status, address, location }) => {
        switch (status) {
          case 'OK': {
            this.setState({ address, location });
            const params = {
              applicationId: RAKUTEN_APP_ID,
              datumType: 1,
              latitude: location.lat,
              longitude: location.lng,
            };
            axios.get(SIMPLE_HOTEL_SEARCH_ENDPOINT, { params })
              .then((result) => {
                const hotels = result.data.hotels.map((hotel) => {
                  const basicInfo = hotel.hotel[0].hotelBasicInfo;
                  const distance = getDistance(
                    { latitude: location.lat, longitude: location.lng },
                    { latitude: basicInfo.latitude, longitude: basicInfo.longitude },
                  );
                  return {
                    id: basicInfo.hotelNo,
                    name: basicInfo.hotelName,
                    url: basicInfo.hotelInformationUrl,
                    thumbUrl: basicInfo.hotelThumbnailUrl,
                    price: basicInfo.hotelMinCharge,
                    reviewAverage: basicInfo.reviewAverage,
                    reviewCount: basicInfo.reviewCount,
                    distance,
                  };
                })
                this.setState({ hotels: sortedHotels(hotels, this.state.sortKey) });
              });
            break;
          }
          case 'ZERO_RESULTS': {
            this.setErrorMessage('結果が見つかりませんでした');
            break;
          }
          default: {
            console.log(status)
            this.setErrorMessage('エラーが発生しました')
          }
        }
        return [];
      })
      .catch((error) => {
        console.log(error)
        this.setErrorMessage('通信に失敗しました')
      })
  }

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
        <SearchForm
          onSubmit={e => this.handlePlaceSubmit(e)}
        />
        {/* <div className='result-area'>
          <Map location={this.state.location} />
          <div className='result-right'>
            <GeocodeResult
              address={this.state.address}
              location={this.state.location}
            />
            <h2>ホテル検索結果</h2>
            <HotelsTable
              hotels={this.state.hotels}
              sortKey={this.state.sortKey}
              onSort={sortKey => this.handleSortKeyChange(sortKey)}
            />
          </div>
        </div> */}
      </div>
    );
  }
}

SearchPage.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string }).isRequired,
};

export default SearchPage;