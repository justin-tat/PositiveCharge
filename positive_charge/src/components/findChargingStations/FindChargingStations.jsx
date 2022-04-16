import React from 'react';
import axios from 'axios';
import Map from '../map/map.jsx'
import { Link } from 'react-router-dom';

class FindChargingStations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userLatitude: 0,
      userLongitude: 0,
      chosenDistance: 5,
      stationsList: [],
      chargerCoords: {}
    };
  }

  getUserLocation() {
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const positionCallback = function (position) {
      this.setState({ userLatitude: position.coords.latitude, userLongitude: position.coords.longitude });
    }.bind(this);

    const postionError = function (err) {
      console.error('Error finding device location: ', err);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(positionCallback, postionError, geoOptions);
    } else {
      alert('Geolocation is not supported by this browser');
    }
  }

  updateChosenDistance(event) {
    var dist = event.target.value;
    this.setState({ chosenDistance: dist });
  }

  populateStationsList() {
    axios.get('http://localhost:3000/findStations', {
      params: {
        userLat: this.state.userLatitude,
        userLong: this.state.userLongitude,
        radius: this.state.chosenDistance
      }
    })
      .then((stations) => {
        this.setState({ stationsList: stations.data });
      })
      .catch((err) => {
        alert('There was a problem finding charging stations in your area. Refresh and try again');
        console.log('Error populating stations list: ', err);
      });
  }

  handleStationSelect(event) {
    var chargerName = event.target.parentElement.children[0].textContent;
    var latitude;
    var longitude;

    var rows = document.getElementsByClassName('stationTableRow');
    for (var currentRow = 0; currentRow < rows.length; currentRow++) {
      if (rows[currentRow].style['background-color'] !== '') {
        rows[currentRow].style['background-color'] = '';
      }
    }
    event.currentTarget.style['background-color'] = 'lightpink';

    for (var station = 0; station < this.state.stationsList.length; station++) {
      if (this.state.stationsList[station].station_name === chargerName) {
        latitude = this.state.stationsList[station].latitude;
        longitude = this.state.stationsList[station].longitude;
      }
    }

    this.setState({ chargerCoords: { chargerLat: latitude, chargerLong: longitude } });
  }

  showFeedbackMap() {
    if (this.state.userLatitude !== 0 && this.state.userLongitude !== 0) {
      return <Map userLocation={{ userLat: this.state.userLatitude, userLong: this.state.userLongitude }} props={[{ lat: '', long: '' }]} />;
    }
  }

  render() {
    return (
      <div className='findStationsDiv'>
        <label>
          Your Location:
          <button onClick={this.getUserLocation.bind(this)}>Use my location</button>
        </label>
        <br></br>
        <div>
          <ol></ol>
        </div>
        {this.showFeedbackMap()}
        <div>
          <ol></ol>
        </div>
        <label>
          Distance:
          <input type='number' className='stationsDistanceInput' onChange={this.updateChosenDistance.bind(this)}></input>
          miles
        </label>
        <br></br>
        <div>
          <ol></ol>
        </div>
        <button className='findStationsButton' onClick={this.populateStationsList.bind(this)}>Find Stations</button>
        <div>
          <ol></ol>
        </div>
        <label>
          Nearby Stations:
          <table>
            <tr>
              <td className='stationName'>
                Name
              </td>
              <td>
                Address
              </td>
              <td>
                Connector types
              </td>
              <td>
                Networked
              </td>
              <td>
                Distance
              </td>
            </tr>
            {
              this.state.stationsList.map((currentStation) => {
                var networked = 'TRUE';
                if (currentStation.ev_network === 'Non-Networked') {
                  networked = 'FALSE';
                }
                return (
                  <tr key={currentStation.ev_network_ids.station[0]} className='stationTableRow' onClick={this.handleStationSelect.bind(this)}>
                    <td>
                      {currentStation.station_name}
                    </td>
                    <td>
                      {currentStation.street_address}
                    </td>
                    <td>
                      {currentStation.ev_connector_types.map((connector, index) => {
                        if (index + 1 < currentStation.ev_connector_types.length) {
                          return connector + ', ';
                        } else {
                          return connector;
                        }
                      })}
                    </td>
                    <td>
                      {networked}
                    </td>
                    <td>
                      {currentStation.distance + ' miles'}
                    </td>
                  </tr>
                )
              })
            }
          </table>
        </label>
        <Link to='/seePOI' state={{ chargerCoords: this.state.chargerCoords }}><button onClick={() => console.log(this.state.chargerCoords)}>See Points of Interest</button></Link>
      </div>
    )
  }
}

export default FindChargingStations;