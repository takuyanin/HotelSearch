import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { geocode } from '../domain/Geocoder'
import { RAKUTEN_APP_ID } from '../../.env.js'

const SearchForm = props => (
  <form
    className='search-form'
    onSubmit={(e) => {
      e.preventDefault();
      props.onSubmit(props.place)
    }}
  >
    <input
      className='place-input'
      size='30'
      type='text'
      value={props.place}
      onChange={(e) => {
        e.preventDefault();
        props.onPlaceChange(e.target.value);
      }}
    />
    <input className='submit-button' type='submit' value='検索' />
  </form>
);

SearchForm.propTypes = {
  place: PropTypes.string.isRequired,
  onPlaceChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  place: state.place,
});

const mapDispatchToProps = dispatch => ({
  onPlaceChange: place => dispatch({ type: 'CHANGE_PLACE', place }),
  onSubmit: (place) => {
    geocode(place)
      .then(({ status, address, location }) => {
        switch (status) {
          case 'OK': {
            dispatch({ type: 'GEOCODE_FETCHED', address, location });
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
            // this.setErrorMessage('結果が見つかりませんでした');
            break;
          }
          default: {
            console.log(status)
            // this.setErrorMessage('エラーが発生しました')
          }
        }
        return [];
      })
      // .catch((error) => {
      //   console.log(error)
      //   this.setErrorMessage('通信に失敗しました')
      // })
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchForm);