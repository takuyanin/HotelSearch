import { geocode } from '../domain/Geocoder'
import { RAKUTEN_APP_ID } from '../../.env.js'
import axios from 'axios';
import { getDistance } from 'geolib';
const URL_BASE = 'https://app.rakuten.co.jp/services/api/Travel/';
const SIMPLE_HOTEL_SEARCH_ENDPOINT = `${URL_BASE}SimpleHotelSearch/20170426`;

export const setPlace = place => dispatch => dispatch({ type: 'CHANGE_PLACE', place });

export const setErrorMessage = message => dispatch => dispatch({ type: 'CHANGE_ERROR_MESSAGE', message});

export const setHotels = hotels => dispatch => dispatch({ type: 'CHANGE_HOTELS', hotels});

export const setSortKey = sortKey => dispatch => dispatch({ type: 'CHANGE_SORT_KEY', sortKey });

export const startSearch = () => (dispatch, getState) => {
  geocode(getState().place)
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
              dispatch(setHotels(hotels))
            });
          break;
        }
        case 'ZERO_RESULTS': {
          dispatch(setErrorMessage('結果が見つかりませんでした'));
          break;
        }
        default: {
          dispatch(setErrorMessage('エラーが発生しました'));
        }
      }
      return [];
    })
    .catch(() => {
      dispatch(setErrorMessage('通信に失敗しました'));
    })
};